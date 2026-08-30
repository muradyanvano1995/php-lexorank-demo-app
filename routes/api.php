<?php

use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\ColumnController;
use App\Http\Controllers\Api\ColumnDiagnosticsController;
use App\Http\Controllers\Api\ColumnRebalanceController;
use App\Http\Controllers\Api\ColumnReorderController;
use App\Http\Controllers\Api\LexoRankHealthController;
use App\Http\Controllers\Api\LexoRankPlaygroundController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskMoveController;
use Illuminate\Support\Facades\Route;

Route::get('boards', [BoardController::class, 'index']);
Route::get('boards/{board}', [BoardController::class, 'show']);

Route::post('boards/{board}/columns', [ColumnController::class, 'store']);
Route::post('boards/{board}/columns/reorder', ColumnReorderController::class);
Route::patch('columns/{column}', [ColumnController::class, 'update']);
Route::delete('columns/{column}', [ColumnController::class, 'destroy']);

Route::post('columns/{column}/tasks', [TaskController::class, 'store']);
Route::patch('tasks/{task}', [TaskController::class, 'update']);
Route::delete('tasks/{task}', [TaskController::class, 'destroy']);
Route::post('tasks/{task}/move', TaskMoveController::class);

Route::post('columns/{column}/rebalance', ColumnRebalanceController::class);
Route::get('columns/{column}/diagnostics', ColumnDiagnosticsController::class);

Route::get('lexorank/health', LexoRankHealthController::class);
Route::post('lexorank/playground/parse', [LexoRankPlaygroundController::class, 'parse']);
Route::post('lexorank/playground/between', [LexoRankPlaygroundController::class, 'between']);
Route::post('lexorank/playground/generate', [LexoRankPlaygroundController::class, 'generate']);
