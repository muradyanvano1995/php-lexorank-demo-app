<?php

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;

it('creates a column at the end of the board', function () {
    $board = Board::factory()->create();
    Column::factory()->create(['board_id' => $board->id, 'name' => 'Backlog', 'position' => 0]);

    $this->postJson("/api/boards/{$board->id}/columns", [
        'name' => 'Review',
    ])->assertCreated()
        ->assertJsonPath('data.name', 'Review')
        ->assertJsonPath('data.position', 1)
        ->assertJsonPath('data.board_id', $board->id);
});

it('renames a column', function () {
    $column = Column::factory()->create(['name' => 'Old name']);

    $this->patchJson("/api/columns/{$column->id}", [
        'name' => 'New name',
    ])->assertOk()
        ->assertJsonPath('data.name', 'New name');
});

it('reorders columns on a board', function () {
    $board = Board::factory()->create();
    $first = Column::factory()->create(['board_id' => $board->id, 'name' => 'A', 'position' => 0]);
    $second = Column::factory()->create(['board_id' => $board->id, 'name' => 'B', 'position' => 1]);
    $third = Column::factory()->create(['board_id' => $board->id, 'name' => 'C', 'position' => 2]);

    $this->postJson("/api/boards/{$board->id}/columns/reorder", [
        'ordered_ids' => [$third->id, $first->id, $second->id],
    ])->assertOk()
        ->assertJsonPath('data.columns.0.id', $third->id)
        ->assertJsonPath('data.columns.1.id', $first->id)
        ->assertJsonPath('data.columns.2.id', $second->id);

    expect($third->fresh()->position)->toBe(0)
        ->and($first->fresh()->position)->toBe(1)
        ->and($second->fresh()->position)->toBe(2);
});

it('validates column payloads', function () {
    $board = Board::factory()->create();

    $this->postJson("/api/boards/{$board->id}/columns", [
        'name' => '',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('rejects reorder payloads that omit a column', function () {
    $board = Board::factory()->create();
    $first = Column::factory()->create(['board_id' => $board->id, 'position' => 0]);
    Column::factory()->create(['board_id' => $board->id, 'position' => 1]);

    $this->postJson("/api/boards/{$board->id}/columns/reorder", [
        'ordered_ids' => [$first->id],
    ])->assertUnprocessable();
});

it('deletes a column and cascades its tasks', function () {
    $board = Board::factory()->create();
    $keep = Column::factory()->create(['board_id' => $board->id, 'name' => 'Keep', 'position' => 0]);
    $remove = Column::factory()->create(['board_id' => $board->id, 'name' => 'Remove', 'position' => 1]);
    $task = Task::factory()->create(['column_id' => $remove->id]);

    $this->deleteJson("/api/columns/{$remove->id}")
        ->assertNoContent();

    expect($remove->fresh())->toBeNull()
        ->and($task->fresh())->toBeNull()
        ->and($keep->fresh()->position)->toBe(0);
});
