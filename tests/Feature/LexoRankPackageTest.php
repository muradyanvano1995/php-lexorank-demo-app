<?php

use App\Models\Column;
use App\Models\Task;
use MuradyanVano\LexoRank\Laravel\Casts\LexoRankCast;
use MuradyanVano\LexoRank\Laravel\Facades\LexoRank as LexoRankFacade;
use MuradyanVano\LexoRank\LexoRank;
use MuradyanVano\LexoRank\LexoRankService;

it('casts rank to lexorank value objects and orders by rank', function () {
    $column = Column::factory()->create();
    $service = app(LexoRankService::class);
    $ranks = $service->initialRanks(3);

    $third = Task::factory()->create([
        'column_id' => $column->id,
        'rank' => $ranks[2]->toString(),
        'title' => 'Third',
    ]);
    $first = Task::factory()->create([
        'column_id' => $column->id,
        'rank' => $ranks[0]->toString(),
        'title' => 'First',
    ]);
    $second = Task::factory()->create([
        'column_id' => $column->id,
        'rank' => $ranks[1]->toString(),
        'title' => 'Second',
    ]);

    expect($first->rank)->toBeInstanceOf(LexoRank::class)
        ->and($first->getCasts()['rank'] ?? null)->toBe(LexoRankCast::class)
        ->and(Task::query()->where('column_id', $column->id)->orderByRank()->pluck('title')->all())
        ->toBe(['First', 'Second', 'Third']);

    $moved = $third->fresh();
    $moved->moveBetween($first, $second, $service);
    $moved->save();

    expect($moved->fresh()->getLexoRank()->isAfter($first->fresh()->getLexoRank()))->toBeTrue()
        ->and($moved->fresh()->getLexoRank()->isBefore($second->fresh()->getLexoRank()))->toBeTrue()
        ->and(LexoRankFacade::findDuplicates(
            Task::query()->where('column_id', $column->id)->orderByRank()->get()->map->getLexoRank()->all()
        ))->toBe([]);
});
