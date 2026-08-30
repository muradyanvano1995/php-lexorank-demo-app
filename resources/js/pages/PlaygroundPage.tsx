import { useQuery } from '@tanstack/react-query';
import { Copy, FlaskConical } from 'lucide-react';
import { useState } from 'react';
import {
    betweenRanks,
    fetchLexoRankHealth,
    generateRanks,
    lexorankKeys,
    parseRank,
} from '@/api/lexorank';
import { BetweenRankForm } from '@/components/forms/playground/BetweenRankForm';
import { GenerateRanksForm } from '@/components/forms/playground/GenerateRanksForm';
import { ParseRankForm } from '@/components/forms/playground/ParseRankForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import type { LexoRankBetweenResult, LexoRankGenerateResult, LexoRankParseResult } from '@/types';

export function PlaygroundPage() {
    const { push } = useToast();
    const { data: health, isLoading } = useQuery({
        queryKey: lexorankKeys.health,
        queryFn: fetchLexoRankHealth,
    });

    const [parseResult, setParseResult] = useState<LexoRankParseResult | null>(null);
    const [betweenResult, setBetweenResult] = useState<LexoRankBetweenResult | null>(null);
    const [generateResult, setGenerateResult] = useState<LexoRankGenerateResult | null>(null);

    const copyText = async (value: string, label: string): Promise<void> => {
        try {
            await navigator.clipboard.writeText(value);
            push({ variant: 'success', title: `${label} copied` });
        } catch {
            push({ variant: 'error', title: 'Copy failed' });
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight">
                    LexoRank playground
                </h1>
                <p className="mt-1 text-muted">
                    Parse, interpolate, and generate ranks using the PHP package API.
                </p>
            </div>

            {isLoading ? (
                <Skeleton className="h-32 w-full" />
            ) : health ? (
                <section className="rounded-xl border border-border bg-surface-raised p-4 shadow-card">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-accent" aria-hidden />
                        <h2 className="font-medium">{health.package}</h2>
                        <Badge>v{health.version}</Badge>
                    </div>
                    <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
                        <CopyRow label="Middle" value={health.middle} onCopy={copyText} />
                        <CopyRow label="Initial" value={health.initial} onCopy={copyText} />
                        <CopyRow label="Min" value={health.min} onCopy={copyText} />
                        <CopyRow label="Max" value={health.max} onCopy={copyText} />
                        <p className="text-muted">Max rank length: {health.max_rank_length}</p>
                        <p className="text-muted">Buckets: {health.buckets.join(', ')}</p>
                    </div>
                </section>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-3">
                <PlaygroundPanel title="Parse" description="Inspect a rank string.">
                    <ParseRankForm
                        onSubmit={parseRank}
                        onResult={(result) => setParseResult(result)}
                    />
                    <ResultPanel result={parseResult} onCopy={copyText} />
                </PlaygroundPanel>

                <PlaygroundPanel title="Between" description="Compute a rank between bounds.">
                    <BetweenRankForm
                        onSubmit={(lower, upper) =>
                            betweenRanks(lower || undefined, upper || undefined)
                        }
                        onResult={(result) => setBetweenResult(result)}
                    />
                    <ResultPanel result={betweenResult} onCopy={copyText} />
                </PlaygroundPanel>

                <PlaygroundPanel title="Generate" description="Create initial rank sequences.">
                    <GenerateRanksForm
                        buckets={health?.buckets ?? ['0', '1', '2']}
                        onSubmit={(count, bucket) => generateRanks(count, bucket)}
                        onResult={(result) => setGenerateResult(result)}
                    />
                    {generateResult ? (
                        <div className="mt-4 space-y-2 rounded-lg border border-border-subtle bg-surface p-3 text-sm">
                            <p>
                                Generated {generateResult.count} ranks in bucket{' '}
                                {generateResult.bucket}
                            </p>
                            <ul className="max-h-48 space-y-1 overflow-y-auto font-mono text-xs">
                                {generateResult.ranks.map((entry) => (
                                    <li
                                        key={entry.rank}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <span className="truncate">{entry.rank}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0"
                                            aria-label="Copy rank"
                                            onClick={() => {
                                                void copyText(entry.rank, 'Rank');
                                            }}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </PlaygroundPanel>
            </div>
        </div>
    );
}

function PlaygroundPanel({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border border-border bg-surface-raised p-4 shadow-card">
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            <p className="mb-4 text-sm text-muted">{description}</p>
            {children}
        </section>
    );
}

function CopyRow({
    label,
    value,
    onCopy,
}: {
    label: string;
    value: string;
    onCopy: (value: string, label: string) => Promise<void>;
}) {
    return (
        <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">{label}</p>
                <p className="truncate font-mono text-xs">{value}</p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                aria-label={`Copy ${label}`}
                onClick={() => {
                    void onCopy(value, label);
                }}
            >
                <Copy className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

function ResultPanel({
    result,
    onCopy,
}: {
    result: LexoRankParseResult | LexoRankBetweenResult | null;
    onCopy: (value: string, label: string) => Promise<void>;
}) {
    if (!result) {
        return null;
    }

    return (
        <div className="mt-4 space-y-2 rounded-lg border border-border-subtle bg-surface p-3 text-sm">
            <CopyRow label="Rank" value={result.rank} onCopy={onCopy} />
            <p>Bucket: {result.bucket}</p>
            <p>Length: {result.length}</p>
            <p>
                Flags: {result.is_min ? 'min ' : ''}
                {result.is_max ? 'max' : ''}
                {!result.is_min && !result.is_max ? '—' : ''}
            </p>
            {'lower' in result ? (
                <>
                    <p>Lower: {result.lower ?? 'null'}</p>
                    <p>Upper: {result.upper ?? 'null'}</p>
                </>
            ) : null}
        </div>
    );
}
