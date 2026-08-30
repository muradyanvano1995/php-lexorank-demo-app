<?php

use App\Models\Column;
use App\Models\Task;
use MuradyanVano\LexoRank\LexoRankService;

it('requires confirmation and rebalances into the next bucket', function () {
    $column = Column::factory()->create();
    $ranks = app(LexoRankService::class)->initialRanks(4);

    foreach ($ranks as $index => $rank) {
        Task::factory()->create([
            'column_id' => $column->id,
            'title' => "Task {$index}",
            'rank' => $rank->toString(),
        ]);
    }

    $before = Task::query()->where('column_id', $column->id)->orderByRank()->pluck('title')->all();

    $this->postJson("/api/columns/{$column->id}/rebalance", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['confirm']);

    $response = $this->postJson("/api/columns/{$column->id}/rebalance", [
        'confirm' => 'REBALANCE',
    ])->assertOk();

    expect($response->json('bucket'))->toBe('1')
        ->and($response->json('mapping'))->toBeArray()
        ->and($response->json('task_count'))->toBe(4)
        ->and($response->json('max_rank_length_after'))->toBeInt();

    $after = Task::query()->where('column_id', $column->id)->orderByRank()->get();

    expect($after->pluck('title')->all())->toBe($before)
        ->and($after->every(fn (Task $task) => str_starts_with($task->getLexoRank()->toString(), '1|')))->toBeTrue();
});

it('returns column diagnostics', function () {
    $column = Column::factory()->create(['name' => 'Review']);
    $ranks = app(LexoRankService::class)->initialRanks(2);
    Task::factory()->create(['column_id' => $column->id, 'rank' => $ranks[0]->toString()]);
    Task::factory()->create(['column_id' => $column->id, 'rank' => $ranks[1]->toString()]);

    $this->getJson("/api/columns/{$column->id}/diagnostics")
        ->assertOk()
        ->assertJsonPath('column_name', 'Review')
        ->assertJsonPath('task_count', 2)
        ->assertJsonStructure([
            'buckets',
            'duplicates',
            'should_rebalance',
            'package_max_rank_length',
            'sample_ranks',
        ]);
});
