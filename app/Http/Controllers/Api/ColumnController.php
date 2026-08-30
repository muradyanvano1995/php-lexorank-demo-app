<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreColumnRequest;
use App\Http\Requests\UpdateColumnRequest;
use App\Http\Resources\ColumnResource;
use App\Models\Board;
use App\Models\Column;
use App\Services\ColumnOrderingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ColumnController extends Controller
{
    public function __construct(private ColumnOrderingService $columns) {}

    public function store(StoreColumnRequest $request, Board $board): JsonResponse
    {
        $column = $this->columns->create($board, $request->validated('name'));

        return (new ColumnResource($column->load('tasks')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateColumnRequest $request, Column $column): ColumnResource
    {
        $updated = $this->columns->update($column, $request->validated('name'));

        return new ColumnResource($updated->load('tasks'));
    }

    public function destroy(Column $column): Response
    {
        $this->columns->delete($column);

        return response()->noContent();
    }
}
