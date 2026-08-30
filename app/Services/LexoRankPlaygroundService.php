<?php

namespace App\Services;

use Composer\InstalledVersions;
use MuradyanVano\LexoRank\LexoRank;
use MuradyanVano\LexoRank\LexoRankBucket;
use MuradyanVano\LexoRank\LexoRankService;
use MuradyanVano\LexoRank\Rebalancer;

class LexoRankPlaygroundService
{
    public function __construct(
        private LexoRankService $lexoRank,
        private Rebalancer $rebalancer,
    ) {}

    /**
     * @return array{
     *     package: string,
     *     version: string,
     *     max_rank_length: int,
     *     middle: string,
     *     initial: string,
     *     min: string,
     *     max: string,
     *     buckets: list<string>
     * }
     */
    public function health(): array
    {
        return [
            'package' => 'muradyanvano/php-lexorank',
            'version' => InstalledVersions::getPrettyVersion('muradyanvano/php-lexorank') ?? 'unknown',
            'max_rank_length' => $this->lexoRank->maxRankLength(),
            'middle' => $this->lexoRank->middle()->toString(),
            'initial' => $this->lexoRank->initial()->toString(),
            'min' => $this->lexoRank->min()->toString(),
            'max' => $this->lexoRank->max()->toString(),
            'buckets' => array_map(
                static fn (LexoRankBucket $bucket): string => $bucket->toString(),
                LexoRankBucket::all(),
            ),
        ];
    }

    /**
     * @return array{rank: string, bucket: string, length: int, is_min: bool, is_max: bool}
     */
    public function parse(string $rank): array
    {
        $parsed = $this->lexoRank->parse($rank);

        return $this->rankPayload($parsed);
    }

    /**
     * @return array{rank: string, bucket: string, length: int, is_min: bool, is_max: bool, lower: string|null, upper: string|null}
     */
    public function between(?string $lower, ?string $upper): array
    {
        $lowerRank = $lower !== null && $lower !== '' ? $this->lexoRank->parse($lower) : null;
        $upperRank = $upper !== null && $upper !== '' ? $this->lexoRank->parse($upper) : null;
        $result = $this->lexoRank->between($lowerRank, $upperRank);

        return [
            ...$this->rankPayload($result),
            'lower' => $lowerRank?->toString(),
            'upper' => $upperRank?->toString(),
        ];
    }

    /**
     * @return array{count: int, bucket: string, ranks: list<array{rank: string, bucket: string, length: int}>}
     */
    public function generate(int $count, ?string $bucket = null): array
    {
        $targetBucket = $bucket !== null && $bucket !== ''
            ? LexoRankBucket::fromString($bucket)
            : LexoRankBucket::bucket0();

        $ranks = $this->lexoRank->initialRanks($count, $targetBucket);

        return [
            'count' => count($ranks),
            'bucket' => $targetBucket->toString(),
            'ranks' => array_map(
                fn (LexoRank $rank): array => [
                    'rank' => $rank->toString(),
                    'bucket' => $rank->bucket()->toString(),
                    'length' => $rank->length(),
                ],
                $ranks,
            ),
        ];
    }

    /**
     * @return array{rank: string, bucket: string, length: int, is_min: bool, is_max: bool}
     */
    private function rankPayload(LexoRank $rank): array
    {
        return [
            'rank' => $rank->toString(),
            'bucket' => $rank->bucket()->toString(),
            'length' => $rank->length(),
            'is_min' => $rank->isMin(),
            'is_max' => $rank->isMax(),
        ];
    }
}
