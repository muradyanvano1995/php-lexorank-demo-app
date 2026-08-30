<?php

namespace App\Services;

use App\Models\Board;
use App\Models\Column;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ColumnOrderingService
{
    public function create(Board $board, string $name): Column
    {
        return DB::transaction(function () use ($board, $name): Column {
            $nextPosition = ((int) $board->columns()->max('position')) + 1;

            return $board->columns()->create([
                'name' => $name,
                'position' => $nextPosition,
            ]);
        });
    }

    public function update(Column $column, string $name): Column
    {
        $column->fill(['name' => $name]);
        $column->save();

        return $column->refresh();
    }

    public function delete(Column $column): void
    {
        DB::transaction(function () use ($column): void {
            $boardId = $column->board_id;
            $column->delete();

            $remaining = Column::query()
                ->where('board_id', $boardId)
                ->orderBy('position')
                ->lockForUpdate()
                ->get();

            foreach ($remaining->values() as $index => $entry) {
                $entry->update(['position' => $index + 1000]);
            }

            foreach ($remaining->values() as $index => $entry) {
                $entry->update(['position' => $index]);
            }
        });
    }

    /**
     * @param  list<int>  $orderedIds
     */
    public function reorder(Board $board, array $orderedIds): Board
    {
        return DB::transaction(function () use ($board, $orderedIds): Board {
            $columns = $board->columns()->lockForUpdate()->get()->keyBy('id');

            if ($columns->count() !== count($orderedIds)) {
                throw new InvalidArgumentException('ordered_ids must include every column on the board exactly once.');
            }

            foreach ($orderedIds as $id) {
                if (! $columns->has($id)) {
                    throw new InvalidArgumentException('ordered_ids contains a column that does not belong to this board.');
                }
            }

            if (count($orderedIds) !== count(array_unique($orderedIds))) {
                throw new InvalidArgumentException('ordered_ids must not contain duplicates.');
            }

            // Two-phase update avoids unique (board_id, position) collisions mid-swap.
            foreach (array_values($orderedIds) as $index => $columnId) {
                $columns->get($columnId)->update(['position' => $index + 1000]);
            }

            foreach (array_values($orderedIds) as $index => $columnId) {
                $columns->get($columnId)->update(['position' => $index]);
            }

            return $board->refresh()->load(['columns.tasks']);
        });
    }
}
