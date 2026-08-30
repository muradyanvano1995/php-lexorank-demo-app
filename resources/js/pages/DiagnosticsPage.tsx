import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { boardKeys } from '@/api/boards';
import { fetchColumnDiagnostics, rebalanceColumn, taskKeys } from '@/api/tasks';
import { RebalanceConfirmForm } from '@/components/forms/RebalanceConfirmForm';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { useBoards } from '@/hooks/useBoards';

export function DiagnosticsPage() {
    const { push } = useToast();
    const queryClient = useQueryClient();
    const { data: boards, isLoading } = useBoards();
    const [boardId, setBoardId] = useState<number | null>(null);
    const [columnId, setColumnId] = useState<number | null>(null);
    const [softLength, setSoftLength] = useState(64);
    const [rebalanceOpen, setRebalanceOpen] = useState(false);
    const [rebalancing, setRebalancing] = useState(false);

    const selectedBoard = useMemo(() => {
        const id = boardId ?? boards?.[0]?.id ?? null;
        return boards?.find((board) => board.id === id);
    }, [boardId, boards]);

    const selectedColumn = useMemo(() => {
        const id = columnId ?? selectedBoard?.columns[0]?.id ?? null;
        return selectedBoard?.columns.find((column) => column.id === id);
    }, [columnId, selectedBoard]);

    const diagnosticsQuery = useQuery({
        queryKey: taskKeys.diagnostics(selectedColumn?.id ?? 0, softLength),
        queryFn: () => fetchColumnDiagnostics(selectedColumn!.id, softLength),
        enabled: selectedColumn !== undefined,
    });

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
    }

    if (!boards?.length) {
        return <p className="text-muted">No boards available.</p>;
    }

    const diagnostics = diagnosticsQuery.data;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight">
                    Column diagnostics
                </h1>
                <p className="mt-1 text-muted">
                    Inspect rank distribution, duplicates, and rebalance recommendations.
                </p>
            </div>

            <div className="grid gap-4 rounded-xl border border-border bg-surface-raised p-4 shadow-card md:grid-cols-3">
                <div>
                    <label htmlFor="diag-board" className="mb-1.5 block text-sm font-medium">
                        Board
                    </label>
                    <Select
                        id="diag-board"
                        value={selectedBoard?.id ?? boards[0].id}
                        onChange={(event) => {
                            setBoardId(Number(event.target.value));
                            setColumnId(null);
                        }}
                    >
                        {boards.map((board) => (
                            <option key={board.id} value={board.id}>
                                {board.name}
                            </option>
                        ))}
                    </Select>
                </div>
                <div>
                    <label htmlFor="diag-column" className="mb-1.5 block text-sm font-medium">
                        Column
                    </label>
                    <Select
                        id="diag-column"
                        value={selectedColumn?.id ?? selectedBoard?.columns[0]?.id ?? ''}
                        onChange={(event) => setColumnId(Number(event.target.value))}
                    >
                        {selectedBoard?.columns.map((column) => (
                            <option key={column.id} value={column.id}>
                                {column.name}
                            </option>
                        ))}
                    </Select>
                </div>
                <div>
                    <label htmlFor="soft-length" className="mb-1.5 block text-sm font-medium">
                        Soft length threshold
                    </label>
                    <Select
                        id="soft-length"
                        value={softLength}
                        onChange={(event) => setSoftLength(Number(event.target.value))}
                    >
                        {[32, 48, 64, 96, 128].map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            {diagnosticsQuery.isLoading ? <Skeleton className="h-72 w-full" /> : null}

            {diagnostics ? (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge className="gap-1">
                            <Activity className="h-3.5 w-3.5" />
                            {diagnostics.task_count} tasks
                        </Badge>
                        {diagnostics.should_rebalance ? (
                            <Badge className="border-warning/30 bg-warning/10 text-warning">
                                Rebalance recommended
                            </Badge>
                        ) : (
                            <Badge className="border-success/30 bg-success/10 text-success">
                                Healthy
                            </Badge>
                        )}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                void diagnosticsQuery.refetch();
                            }}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            disabled={!diagnostics.should_rebalance}
                            onClick={() => setRebalanceOpen(true)}
                        >
                            Rebalance
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            label="Min rank length"
                            value={diagnostics.min_rank_length ?? '—'}
                        />
                        <MetricCard
                            label="Max rank length"
                            value={diagnostics.max_rank_length ?? '—'}
                        />
                        <MetricCard
                            label="Average length"
                            value={diagnostics.avg_rank_length ?? '—'}
                        />
                        <MetricCard
                            label="Package max"
                            value={diagnostics.package_max_rank_length}
                        />
                    </div>

                    {diagnostics.duplicates.length > 0 ? (
                        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4">
                            <div className="mb-2 flex items-center gap-2 font-medium text-danger">
                                <AlertTriangle className="h-4 w-4" />
                                Duplicate ranks detected
                            </div>
                            <ul className="space-y-1 font-mono text-sm">
                                {diagnostics.duplicates.map((rank) => (
                                    <li key={rank}>{rank}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    <div className="rounded-xl border border-border bg-surface-raised p-4">
                        <h2 className="mb-3 font-medium">Bucket distribution</h2>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(diagnostics.buckets).map(([bucket, count]) => (
                                <Badge key={bucket}>
                                    Bucket {bucket}: {count}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-raised p-4">
                        <h2 className="mb-3 font-medium">Sample ranks</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="text-muted">
                                    <tr>
                                        <th className="pb-2 pr-4 font-medium">Task</th>
                                        <th className="pb-2 pr-4 font-medium">Rank</th>
                                        <th className="pb-2 pr-4 font-medium">Length</th>
                                        <th className="pb-2 font-medium">Bucket</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {diagnostics.sample_ranks.map((sample) => (
                                        <tr
                                            key={sample.id}
                                            className="border-t border-border-subtle"
                                        >
                                            <td className="py-2 pr-4">{sample.title}</td>
                                            <td className="py-2 pr-4 font-mono text-xs">
                                                {sample.rank}
                                            </td>
                                            <td className="py-2 pr-4">{sample.length}</td>
                                            <td className="py-2">{sample.bucket}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : null}

            <Dialog
                open={rebalanceOpen}
                onOpenChange={setRebalanceOpen}
                title="Rebalance column"
                description="Confirm to redistribute ranks evenly."
            >
                {selectedColumn ? (
                    <RebalanceConfirmForm
                        columnName={selectedColumn.name}
                        submitting={rebalancing}
                        onCancel={() => setRebalanceOpen(false)}
                        onSubmit={async (confirm) => {
                            setRebalancing(true);

                            try {
                                await rebalanceColumn(selectedColumn.id, confirm);
                                await queryClient.invalidateQueries({ queryKey: boardKeys.all });
                                if (selectedBoard) {
                                    await queryClient.invalidateQueries({
                                        queryKey: boardKeys.detail(selectedBoard.id),
                                    });
                                }
                                await diagnosticsQuery.refetch();
                                setRebalanceOpen(false);
                                push({ variant: 'success', title: 'Column rebalanced' });
                            } finally {
                                setRebalancing(false);
                            }
                        }}
                    />
                ) : null}
            </Dialog>
        </div>
    );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl border border-border bg-surface-raised p-4 shadow-card">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
        </div>
    );
}
