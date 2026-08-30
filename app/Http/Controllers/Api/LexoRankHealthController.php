<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LexoRankPlaygroundService;
use Illuminate\Http\JsonResponse;

class LexoRankHealthController extends Controller
{
    public function __construct(private LexoRankPlaygroundService $playground) {}

    public function __invoke(): JsonResponse
    {
        return response()->json($this->playground->health());
    }
}
