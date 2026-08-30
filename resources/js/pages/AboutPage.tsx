import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Layers, Sparkles } from 'lucide-react';
import { lexorankKeys, fetchLexoRankHealth } from '@/api/lexorank';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export function AboutPage() {
    const { data: health, isLoading } = useQuery({
        queryKey: lexorankKeys.health,
        queryFn: fetchLexoRankHealth,
    });

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight">
                    About LexoRank Lab
                </h1>
                <p className="mt-3 text-lg text-muted">
                    A premium kanban front-end for exploring fractional indexing with the{' '}
                    {health?.package ?? 'muradyanvano/php-lexorank'} package.
                </p>
            </div>

            {isLoading ? <Skeleton className="h-24 w-full" /> : null}

            {health ? (
                <div className="flex flex-wrap gap-2">
                    <Badge>{health.package}</Badge>
                    <Badge>v{health.version}</Badge>
                    <Badge>max length {health.max_rank_length}</Badge>
                </div>
            ) : null}

            <section className="grid gap-4 sm:grid-cols-3">
                <FeatureCard
                    icon={Layers}
                    title="Kanban board"
                    description="Drag tasks within and across columns. Moves call the REST API with LexoRank neighbors."
                />
                <FeatureCard
                    icon={Sparkles}
                    title="Diagnostics"
                    description="Inspect rank lengths, bucket distribution, duplicates, and rebalance when ranks grow too long."
                />
                <FeatureCard
                    icon={ExternalLink}
                    title="Playground"
                    description="Parse, between, and generate ranks interactively against the backend playground endpoints."
                />
            </section>

            <section className="rounded-xl border border-border bg-surface-raised p-6 shadow-card">
                <h2 className="font-display text-xl font-semibold">Stack</h2>
                <ul className="mt-4 space-y-2 text-sm text-muted">
                    <li>React 19 + TypeScript SPA (Vite)</li>
                    <li>TanStack Query for server state</li>
                    <li>@muradyanvano/use-form for accessible forms</li>
                    <li>@dnd-kit for drag and drop</li>
                    <li>React Router 8 · Tailwind CSS v4</li>
                    <li>Laravel REST API at /api/*</li>
                </ul>
            </section>
        </div>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Layers;
    title: string;
    description: string;
}) {
    return (
        <article className="rounded-xl border border-border bg-surface-raised p-4 shadow-card">
            <Icon className="mb-3 h-5 w-5 text-accent" aria-hidden />
            <h3 className="font-medium text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted">{description}</p>
        </article>
    );
}
