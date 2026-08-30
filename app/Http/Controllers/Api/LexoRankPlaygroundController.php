<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlaygroundBetweenRequest;
use App\Http\Requests\PlaygroundGenerateRequest;
use App\Http\Requests\PlaygroundParseRequest;
use App\Services\LexoRankPlaygroundService;
use Illuminate\Http\JsonResponse;

class LexoRankPlaygroundController extends Controller
{
    public function __construct(private LexoRankPlaygroundService $playground) {}

    public function parse(PlaygroundParseRequest $request): JsonResponse
    {
        return response()->json(
            $this->playground->parse($request->validated('rank')),
        );
    }

    public function between(PlaygroundBetweenRequest $request): JsonResponse
    {
        $validated = $request->validated();

        return response()->json(
            $this->playground->between(
                $validated['lower'] ?? null,
                $validated['upper'] ?? null,
            ),
        );
    }

    public function generate(PlaygroundGenerateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        return response()->json(
            $this->playground->generate(
                (int) $validated['count'],
                $validated['bucket'] ?? null,
            ),
        );
    }
}
