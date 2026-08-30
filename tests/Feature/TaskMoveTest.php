<?php

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use MuradyanVano\LexoRank\LexoRankService;

it('moves a task within the same column', function () {
    $column = Column::factory()->create();
    $ranks = app(LexoRankService::class)->initialRanks(3);
    $a = Task::factory()->create(['column_id' => $column->id, 'rank' => $ranks[0]->toString(), 'title' => 'A']);
    $b = Task::factory()->create(['column_id' => $column->id, 'rank' => $ranks[1]->toString(), 'title' => 'B']);
    $c = Task::factory()->create(['column_id' => $column->id, 'rank' => $ranks[2]->toString(), 'title' => 'C']);

    $this->postJson("/api/tasks/{$c->id}/move", [
        'column_id' => $column->id,
        'before_id' => $a->id,
        'after_id' => $b->id,
    ])->assertOk()
        ->assertJsonPath('data.id', $c->id)
        ->assertJsonPath('data.column_id', $column->id);

    $titles = Task::query()->where('column_id', $column->id)->orderByRank()->pluck('title')->all();
    expect($titles)->toBe(['A', 'C', 'B']);
});

it('moves a task across columns', function () {
    $board = Board::factory()->create();
    $source = Column::factory()->create(['board_id' => $board->id, 'position' => 0]);
    $destination = Column::factory()->create(['board_id' => $board->id, 'position' => 1]);
    $ranks = app(LexoRankService::class)->initialRanks(2);

    $keep = Task::factory()->create(['column_id' => $source->id, 'rank' => $ranks[0]->toString()]);
    $moving = Task::factory()->create(['column_id' => $source->id, 'rank' => $ranks[1]->toString()]);
    $destFirst = Task::factory()->create([
        'column_id' => $destination->id,
        'rank' => app(LexoRankService::class)->initial()->toString(),
    ]);

    $this->postJson("/api/tasks/{$moving->id}/move", [
        'column_id' => $destination->id,
        'before_id' => null,
        'after_id' => $destFirst->id,
    ])->assertOk()
        ->assertJsonPath('data.column_id', $destination->id);

    expect($moving->fresh()->column_id)->toBe($destination->id)
        ->and($keep->fresh()->column_id)->toBe($source->id)
        ->and(
            Task::query()->where('column_id', $destination->id)->orderByRank()->pluck('id')->all()
        )->toBe([$moving->id, $destFirst->id]);
});

it('rejects invalid neighbors', function () {
    $board = Board::factory()->create();
    $columnA = Column::factory()->create(['board_id' => $board->id, 'position' => 0]);
    $columnB = Column::factory()->create(['board_id' => $board->id, 'position' => 1]);
    $task = Task::factory()->create(['column_id' => $columnA->id]);
    $foreign = Task::factory()->create(['column_id' => $columnB->id]);

    $this->postJson("/api/tasks/{$task->id}/move", [
        'column_id' => $columnA->id,
        'before_id' => $foreign->id,
    ])->assertUnprocessable();

    $this->postJson("/api/tasks/{$task->id}/move", [
        'column_id' => $columnA->id,
        'before_id' => $task->id,
    ])->assertUnprocessable();
});

it('supports empty destination columns', function () {
    $board = Board::factory()->create();
    $source = Column::factory()->create(['board_id' => $board->id, 'position' => 0]);
    $empty = Column::factory()->create(['board_id' => $board->id, 'position' => 1]);
    $task = Task::factory()->create(['column_id' => $source->id]);

    $this->postJson("/api/tasks/{$task->id}/move", [
        'column_id' => $empty->id,
        'before_id' => null,
        'after_id' => null,
    ])->assertOk()
        ->assertJsonPath('data.column_id', $empty->id);
});
