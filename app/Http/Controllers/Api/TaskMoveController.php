<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MoveTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskRankingService;

class TaskMoveController extends Controller
{
    public function __construct(private TaskRankingService $taskRanking) {}

    public function __invoke(MoveTaskRequest $request, Task $task): TaskResource
    {
        $validated = $request->validated();

        $moved = $this->taskRanking->move(
            $task,
            (int) $validated['column_id'],
            isset($validated['before_id']) ? (int) $validated['before_id'] : null,
            isset($validated['after_id']) ? (int) $validated['after_id'] : null,
        );

        return new TaskResource($moved);
    }
}
