<?php

use App\Enums\TaskPriority;
use App\Models\Column;
use App\Models\Task;
use MuradyanVano\LexoRank\LexoRankService;

it('creates updates and deletes tasks with canonical ranks', function () {
    $column = Column::factory()->create();

    $create = $this->postJson("/api/columns/{$column->id}/tasks", [
        'title' => 'New task item',
        'priority' => TaskPriority::High->value,
        'assignee_name' => 'Ava',
    ])->assertCreated()
        ->assertJsonPath('data.title', 'New task item')
        ->assertJsonPath('data.priority', 'high');

    $taskId = $create->json('data.id');
    $rank = $create->json('data.rank');

    expect($rank)->toBeString()->and(strlen($rank))->toBeGreaterThan(0);

    $this->patchJson("/api/tasks/{$taskId}", [
        'title' => 'Updated task title',
        'due_date' => '2030-01-15',
    ])->assertOk()
        ->assertJsonPath('data.title', 'Updated task title')
        ->assertJsonPath('data.due_date', '2030-01-15');

    $this->deleteJson("/api/tasks/{$taskId}")->assertNoContent();
    expect(Task::query()->find($taskId))->toBeNull();
});

it('validates task payloads', function () {
    $column = Column::factory()->create();

    $this->postJson("/api/columns/{$column->id}/tasks", [
        'title' => 'ab',
        'priority' => 'nope',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['title', 'priority']);
});

it('inserts between neighbors', function () {
    $column = Column::factory()->create();
    $ranks = app(LexoRankService::class)->initialRanks(2);
    $first = Task::factory()->create(['column_id' => $column->id, 'rank' => $ranks[0]->toString(), 'title' => 'First']);
    $second = Task::factory()->create(['column_id' => $column->id, 'rank' => $ranks[1]->toString(), 'title' => 'Second']);

    $response = $this->postJson("/api/columns/{$column->id}/tasks", [
        'title' => 'Between neighbors',
        'before_id' => $first->id,
        'after_id' => $second->id,
    ])->assertCreated();

    $betweenRank = $response->json('data.rank');
    expect($betweenRank > $first->fresh()->getLexoRank()->toString())->toBeTrue()
        ->and($betweenRank < $second->fresh()->getLexoRank()->toString())->toBeTrue();
});
