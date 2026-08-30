<?php

it('reports lexorank health', function () {
    $this->getJson('/api/lexorank/health')
        ->assertOk()
        ->assertJsonPath('package', 'muradyanvano/php-lexorank')
        ->assertJsonStructure(['version', 'middle', 'initial', 'min', 'max', 'buckets']);
});

it('parses ranks in the playground', function () {
    $middle = $this->getJson('/api/lexorank/health')->json('middle');

    $this->postJson('/api/lexorank/playground/parse', ['rank' => $middle])
        ->assertOk()
        ->assertJsonPath('rank', $middle);

    $this->postJson('/api/lexorank/playground/parse', ['rank' => 'not-a-rank'])
        ->assertUnprocessable();
});

it('computes between and generate', function () {
    $health = $this->getJson('/api/lexorank/health')->json();

    $between = $this->postJson('/api/lexorank/playground/between', [
        'lower' => $health['initial'],
        'upper' => $health['middle'],
    ])->assertOk()->json('rank');

    expect($between > $health['initial'])->toBeTrue()
        ->and($between < $health['middle'])->toBeTrue();

    $this->postJson('/api/lexorank/playground/generate', [
        'count' => 5,
        'bucket' => '0',
    ])->assertOk()
        ->assertJsonPath('count', 5)
        ->assertJsonCount(5, 'ranks');
});
