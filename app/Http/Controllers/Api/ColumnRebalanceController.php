<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RebalanceColumnRequest;
use App\Http\Resources\TaskResource;
use App\Models\Column;
use App\Services\ColumnRebalanceService;
use Illuminate\Http\JsonResponse;

class ColumnRebalanceController extends Controller
{
    public function __construct(private ColumnRebalanceService $rebalanceService) {}

    public function __invoke(RebalanceColumnRequest $request, Column $column): JsonResponse
    {
        $result = $this->rebalanceService->rebalance($column);

        return response()->json([
            'column_id' => $result['column_id'],
            'task_count' => $result['task_count'],
            'bucket' => $result['bucket'],
            'mapping' => $result['mapping'],
            'max_rank_length_before' => $result['max_rank_length_before'],
            'max_rank_length_after' => $result['max_rank_length_after'],
            'tasks' => TaskResource::collection(collect($result['tasks'])),
        ]);
    }
}
