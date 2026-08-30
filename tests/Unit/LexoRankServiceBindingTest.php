<?php

use MuradyanVano\LexoRank\Laravel\Facades\LexoRank as LexoRankFacade;
use MuradyanVano\LexoRank\LexoRankService;
use MuradyanVano\LexoRank\Rebalancer;

it('discovers the lexorank service provider and binds singletons', function () {
    expect(app()->bound(LexoRankService::class))->toBeTrue()
        ->and(app()->bound(Rebalancer::class))->toBeTrue()
        ->and(app(LexoRankService::class))->toBeInstanceOf(LexoRankService::class)
        ->and(app(LexoRankService::class))->toBe(app(LexoRankService::class))
        ->and(app(Rebalancer::class))->toBe(app(Rebalancer::class));
});

it('exposes the lexorank facade', function () {
    $middle = LexoRankFacade::middle();

    expect($middle->toString())->toBeString()
        ->and(LexoRankFacade::parse($middle->toString())->toString())->toBe($middle->toString());
});
