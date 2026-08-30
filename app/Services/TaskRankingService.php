<?php

namespace App\Services;

use App\Enums\TaskPriority;
use App\Models\Column;
use App\Models\Task;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use MuradyanVano\LexoRank\LexoRank;
use MuradyanVano\LexoRank\LexoRankService;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Throwable;

class TaskRankingService
{
    private const MAX_COLLISION_RETRIES = 3;

    public function __construct(private LexoRankService $lexoRank) {}

    /**
     * @param array{
     *     title: string,
     *     description?: string|null,
     *     priority?: string,
     *     assignee_name?: string|null,
     *     due_date?: string|null,
     *     before_id?: int|null,
     *     after_id?: int|null
     * } $data
     * @throws Throwable
     */
    public function createInColumn(Column $column, array $data): Task
    {
        return DB::transaction(function () use ($column, $data): Task {
            $column = Column::query()->whereKey($column->id)->lockForUpdate()->firstOrFail();

            $before = $this->resolveNeighbor($column, $data['before_id'] ?? null);
            $after = $this->resolveNeighbor($column, $data['after_id'] ?? null);
            $this->assertNeighborOrdering($before, $after);

            $attempt = 0;

            while ($attempt < self::MAX_COLLISION_RETRIES) {
                $attempt++;

                $before = $before?->fresh() ?? null;
                $after = $after?->fresh() ?? null;

                if ($before !== null && (int) $before->column_id !== (int) $column->id) {
                    throw ValidationException::withMessages([
                        'before_id' => ['The before neighbor must belong to the destination column.'],
                    ]);
                }

                if ($after !== null && (int) $after->column_id !== (int) $column->id) {
                    throw ValidationException::withMessages([
                        'after_id' => ['The after neighbor must belong to the destination column.'],
                    ]);
                }

                $rank = $this->lexoRank->between(
                    $before?->getLexoRank(),
                    $after?->getLexoRank(),
                );

                try {
                    return Task::query()->create([
                        'column_id' => $column->id,
                        'title' => $data['title'],
                        'description' => $data['description'] ?? null,
                        'priority' => $data['priority'] ?? TaskPriority::Medium->value,
                        'assignee_name' => $data['assignee_name'] ?? null,
                        'due_date' => $data['due_date'] ?? null,
                        'rank' => $rank->toString(),
                    ]);
                } catch (UniqueConstraintViolationException|QueryException $exception) {
                    if (! $this->isUniqueRankCollision($exception) || $attempt >= self::MAX_COLLISION_RETRIES) {
                        if ($this->isUniqueRankCollision($exception)) {
                            throw new ConflictHttpException('Unable to allocate a unique rank after retries.');
                        }

                        throw $exception;
                    }
                }
            }

            throw new ConflictHttpException('Unable to allocate a unique rank after retries.');
        });
    }

    public function move(Task $task, int $columnId, ?int $beforeId, ?int $afterId): Task
    {
        if ($beforeId !== null && $beforeId === $task->id) {
            throw ValidationException::withMessages([
                'before_id' => ['A task cannot use itself as a neighbor.'],
            ]);
        }

        if ($afterId !== null && $afterId === $task->id) {
            throw ValidationException::withMessages([
                'after_id' => ['A task cannot use itself as a neighbor.'],
            ]);
        }

        if ($beforeId !== null && $afterId !== null && $beforeId === $afterId) {
            throw ValidationException::withMessages([
                'after_id' => ['before_id and after_id must refer to different tasks.'],
            ]);
        }

        return DB::transaction(function () use ($task, $columnId, $beforeId, $afterId): Task {
            $task = Task::query()->whereKey($task->id)->lockForUpdate()->firstOrFail();
            $column = Column::query()->whereKey($columnId)->lockForUpdate()->firstOrFail();

            Task::query()
                ->where('column_id', $column->id)
                ->orderByRank()
                ->lockForUpdate()
                ->get();

            $before = $this->resolveNeighbor($column, $beforeId);
            $after = $this->resolveNeighbor($column, $afterId);
            $this->assertNeighborOrdering($before, $after);

            $attempt = 0;

            while ($attempt < self::MAX_COLLISION_RETRIES) {
                $attempt++;

                $before = $beforeId !== null
                    ? Task::query()->whereKey($beforeId)->lockForUpdate()->first()
                    : null;
                $after = $afterId !== null
                    ? Task::query()->whereKey($afterId)->lockForUpdate()->first()
                    : null;

                if ($beforeId !== null && $before === null) {
                    throw ValidationException::withMessages([
                        'before_id' => ['The selected before neighbor is invalid.'],
                    ]);
                }

                if ($afterId !== null && $after === null) {
                    throw ValidationException::withMessages([
                        'after_id' => ['The selected after neighbor is invalid.'],
                    ]);
                }

                if ($before !== null && (int) $before->column_id !== (int) $column->id) {
                    throw ValidationException::withMessages([
                        'before_id' => ['The before neighbor must belong to the destination column.'],
                    ]);
                }

                if ($after !== null && (int) $after->column_id !== (int) $column->id) {
                    throw ValidationException::withMessages([
                        'after_id' => ['The after neighbor must belong to the destination column.'],
                    ]);
                }

                $this->assertNeighborOrdering($before, $after);

                $rank = $this->lexoRank->between(
                    $before?->getLexoRank(),
                    $after?->getLexoRank(),
                );

                try {
                    $task->column_id = $column->id;
                    $task->setLexoRank($rank);
                    $task->save();

                    return $task->refresh();
                } catch (UniqueConstraintViolationException|QueryException $exception) {
                    if (! $this->isUniqueRankCollision($exception) || $attempt >= self::MAX_COLLISION_RETRIES) {
                        if ($this->isUniqueRankCollision($exception)) {
                            throw new ConflictHttpException('Unable to allocate a unique rank after retries.');
                        }

                        throw $exception;
                    }
                }
            }

            throw new ConflictHttpException('Unable to allocate a unique rank after retries.');
        });
    }

    private function resolveNeighbor(Column $column, ?int $neighborId): ?Task
    {
        if ($neighborId === null) {
            return null;
        }

        $neighbor = Task::query()->whereKey($neighborId)->first();

        if ($neighbor === null) {
            throw ValidationException::withMessages([
                'neighbor' => ['The selected neighbor is invalid.'],
            ]);
        }

        if ((int) $neighbor->column_id !== (int) $column->id) {
            throw ValidationException::withMessages([
                'neighbor' => ['Neighbors must belong to the destination column.'],
            ]);
        }

        return $neighbor;
    }

    private function assertNeighborOrdering(?Task $before, ?Task $after): void
    {
        if ($before === null || $after === null) {
            return;
        }

        /** @var LexoRank $lower */
        $lower = $before->getLexoRank();
        /** @var LexoRank $upper */
        $upper = $after->getLexoRank();

        if ($lower->isAfter($upper) || $lower->equals($upper)) {
            throw ValidationException::withMessages([
                'before_id' => ['before_id must be strictly below after_id in rank order.'],
            ]);
        }
    }

    private function isUniqueRankCollision(QueryException $exception): bool
    {
        if ($exception instanceof UniqueConstraintViolationException) {
            return true;
        }

        $message = strtolower($exception->getMessage());

        return str_contains($message, 'unique')
            || str_contains($message, 'duplicate')
            || (string) $exception->getCode() === '23000';
    }
}
