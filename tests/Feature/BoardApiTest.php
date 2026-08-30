<?php

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use MuradyanVano\LexoRank\LexoRankService;

it('lists boards with eager-loaded columns and ordered tasks', function () {
    $board = Board::factory()->create(['name' => 'Demo']);
    $column = Column::factory()->create(['board_id' => $board->id, 'name' => 'Backlog', 'position' => 0]);
    $ranks = app(LexoRankService::class)->initialRanks(2);

    Task::factory()->create(['column_id' => $column->id, 'title' => 'B', 'rank' => $ranks[1]->toString()]);
    Task::factory()->create(['column_id' => $column->id, 'title' => 'A', 'rank' => $ranks[0]->toString()]);

    $this->getJson('/api/boards')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Demo')
        ->assertJsonPath('data.0.columns.0.tasks.0.title', 'A')
        ->assertJsonPath('data.0.columns.0.tasks.1.title', 'B');

    $this->getJson("/api/boards/{$board->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $board->id);
});
