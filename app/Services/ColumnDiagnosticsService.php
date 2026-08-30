<?php

namespace App\Services;

use App\Models\Column;
use App\Models\Task;
use MuradyanVano\LexoRank\LexoRank;
use MuradyanVano\LexoRank\LexoRankService;
use MuradyanVano\LexoRank\Rebalancer;

class ColumnDiagnosticsService
{
    public function __construct(
        private LexoRankService $lexoRank,
        private Rebalancer $rebalancer,
    ) {}

    /**
     * @return array{
     *     column_id: int,
     *     column_name: string,
     *     task_count: int,
     *     min_rank_length: int|null,
     *     max_rank_length: int|null,
     *     avg_rank_length: float|null,
     *     buckets: array<string, int>,
     *     duplicates: list<string>,
     *     should_rebalance: bool,
     *     soft_length: int,
     *     package_max_rank_length: int,
     *     sample_ranks: list<array{id: int, title: string, rank: string, length: int, bucket: string}>
     * }
     */
    public function diagnose(Column $column, int $softLength = 64): array
    {
        $tasks = Task::query()
            ->where('column_id', $column->id)
            ->orderByRank()
            ->get();

        $lengths = [];
        $buckets = ['0' => 0, '1' => 0, '2' => 0];
        $rankStrings = [];
        $samples = [];

        foreach ($tasks as $task) {
            /** @var LexoRank|null $rank */
            $rank = $task->getLexoRank();

            if ($rank === null) {
                continue;
            }

            $canonical = $rank->toString();
            $rankStrings[] = $canonical;
            $length = strlen($canonical);
            $lengths[] = $length;
            $bucket = $rank->bucket()->toString();
            $buckets[$bucket] = ($buckets[$bucket] ?? 0) + 1;

            if (count($samples) < 8) {
                $samples[] = [
                    'id' => $task->id,
                    'title' => $task->title,
                    'rank' => $canonical,
                    'length' => $length,
                    'bucket' => $bucket,
                ];
            }
        }

        $count = count($lengths);

        return [
            'column_id' => $column->id,
            'column_name' => $column->name,
            'task_count' => $count,
            'min_rank_length' => $count > 0 ? min($lengths) : null,
            'max_rank_length' => $count > 0 ? max($lengths) : null,
            'avg_rank_length' => $count > 0 ? round(array_sum($lengths) / $count, 2) : null,
            'buckets' => $buckets,
            'duplicates' => $this->lexoRank->findDuplicates($rankStrings),
            'should_rebalance' => $this->rebalancer->shouldRebalance($rankStrings, $softLength),
            'soft_length' => $softLength,
            'package_max_rank_length' => $this->lexoRank->maxRankLength(),
            'sample_ranks' => $samples,
        ];
    }
}
