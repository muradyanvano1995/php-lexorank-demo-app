<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Column;
use App\Models\Task;
use App\Services\TaskRankingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class TaskController extends Controller
{
    public function __construct(private TaskRankingService $taskRanking) {}

    public function store(StoreTaskRequest $request, Column $column): JsonResponse
    {
        $task = $this->taskRanking->createInColumn($column, $request->validated());

        return (new TaskResource($task))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateTaskRequest $request, Task $task): TaskResource
    {
        $task->fill($request->validated());
        $task->save();

        return new TaskResource($task->refresh());
    }

    public function destroy(Task $task): Response
    {
        $task->delete();

        return response()->noContent();
    }
}
