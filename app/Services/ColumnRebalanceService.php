<?php

namespace App\Services;

use App\Models\Column;
use App\Models\Task;
use Illuminate\Support\Facades\DB;
use MuradyanVano\LexoRank\LexoRank;
use MuradyanVano\LexoRank\Rebalancer;

class ColumnRebalanceService
{
    public function __construct(private Rebalancer $rebalancer) {}

    /**
     * @return array{
     *     column_id: int,
     *     task_count: int,
     *     bucket: string,
     *     mapping: array<string, string>,
     *     max_rank_length_before: int,
     *     max_rank_length_after: int,
     *     tasks: list<Task>
     * }
     */
    public function rebalance(Column $column): array
    {
        return DB::transaction(function () use ($column): array {
            $column = Column::query()->whereKey($column->id)->lockForUpdate()->firstOrFail();

            /** @var list<Task> $tasks */
            $tasks = Task::query()
                ->where('column_id', $column->id)
                ->orderByRank()
                ->lockForUpdate()
                ->get()
                ->all();

            $rankStrings = [];
            $maxBefore = 0;

            foreach ($tasks as $task) {
                /** @var LexoRank $rank */
                $rank = $task->getLexoRank();
                $canonical = $rank->toString();
                $rankStrings[] = $canonical;
                $maxBefore = max($maxBefore, strlen($canonical));
            }

            $result = $this->rebalancer->rebalance($rankStrings);
            $mapping = $result->mapping();
            $maxAfter = 0;

            foreach ($mapping as $newRank) {
                $maxAfter = max($maxAfter, strlen($newRank));
            }

            // Next-bucket ranks do not collide with the previous bucket under (column_id, rank).
            // Update via query builder with canonical strings so LexoRankCast never sees placeholders.
            foreach ($tasks as $task) {
                /** @var LexoRank $oldRank */
                $oldRank = $task->getLexoRank();
                $old = $oldRank->toString();
                $new = $mapping[$old] ?? null;

                if ($new === null) {
                    continue;
                }

                DB::table('tasks')
                    ->where('id', $task->id)
                    ->update([
                        'rank' => $new,
                        'updated_at' => now(),
                    ]);
            }

            $freshTasks = Task::query()
                ->where('column_id', $column->id)
                ->orderByRank()
                ->get()
                ->all();

            return [
                'column_id' => $column->id,
                'task_count' => count($freshTasks),
                'bucket' => $result->bucket()->toString(),
                'mapping' => $mapping,
                'max_rank_length_before' => $maxBefore,
                'max_rank_length_after' => $maxAfter,
                'tasks' => $freshTasks,
            ];
        });
    }
}
