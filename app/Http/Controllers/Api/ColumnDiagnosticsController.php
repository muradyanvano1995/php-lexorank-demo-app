<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Column;
use App\Services\ColumnDiagnosticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ColumnDiagnosticsController extends Controller
{
    public function __construct(private ColumnDiagnosticsService $diagnostics) {}

    public function __invoke(Request $request, Column $column): JsonResponse
    {
        $softLength = (int) $request->integer('soft_length', 64);

        return response()->json(
            $this->diagnostics->diagnose($column, max(8, min(255, $softLength))),
        );
    }
}
