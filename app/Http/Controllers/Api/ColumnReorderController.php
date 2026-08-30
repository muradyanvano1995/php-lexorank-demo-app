<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderColumnsRequest;
use App\Http\Resources\BoardResource;
use App\Models\Board;
use App\Services\ColumnOrderingService;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class ColumnReorderController extends Controller
{
    public function __construct(private ColumnOrderingService $columns) {}

    public function __invoke(ReorderColumnsRequest $request, Board $board): BoardResource|JsonResponse
    {
        try {
            $reordered = $this->columns->reorder(
                $board,
                array_map('intval', $request->validated('ordered_ids')),
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return new BoardResource($reordered);
    }
}
