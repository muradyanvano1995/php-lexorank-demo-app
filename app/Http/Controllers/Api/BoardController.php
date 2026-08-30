<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BoardResource;
use App\Models\Board;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BoardController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $boards = Board::query()
            ->with(['columns.tasks'])
            ->orderBy('id')
            ->get();

        return BoardResource::collection($boards);
    }

    public function show(Board $board): BoardResource
    {
        $board->load(['columns.tasks']);

        return new BoardResource($board);
    }
}
