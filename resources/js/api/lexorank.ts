import { apiRequest } from '@/api/client';
import type {
    LexoRankBetweenResult,
    LexoRankGenerateResult,
    LexoRankHealth,
    LexoRankParseResult,
} from '@/types';

export async function fetchLexoRankHealth(): Promise<LexoRankHealth> {
    return apiRequest<LexoRankHealth>('/lexorank/health');
}

export async function parseRank(rank: string): Promise<LexoRankParseResult> {
    return apiRequest<LexoRankParseResult>('/lexorank/playground/parse', {
        method: 'POST',
        body: { rank },
    });
}

export async function betweenRanks(lower?: string, upper?: string): Promise<LexoRankBetweenResult> {
    return apiRequest<LexoRankBetweenResult>('/lexorank/playground/between', {
        method: 'POST',
        body: { lower: lower || undefined, upper: upper || undefined },
    });
}

export async function generateRanks(
    count: number,
    bucket?: string,
): Promise<LexoRankGenerateResult> {
    return apiRequest<LexoRankGenerateResult>('/lexorank/playground/generate', {
        method: 'POST',
        body: { count, bucket: bucket || undefined },
    });
}

export const lexorankKeys = {
    health: ['lexorank', 'health'] as const,
};
