import { AlertCircle, LayoutDashboard } from 'lucide-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { BoardView } from '@/features/board/BoardView';
import { findBoardInCache, useBoard, useBoards } from '@/hooks/useBoards';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';

export function BoardPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: boards, isLoading, isError, error, refetch } = useBoards();

    const boardId = useMemo(() => {
        const fromQuery = Number(searchParams.get('board'));
        const fallback = boards?.[0]?.id ?? null;

        if (boards?.some((board) => board.id === fromQuery)) {
            return fromQuery;
        }

        return fallback;
    }, [boards, searchParams]);

    const initialBoard = findBoardInCache(boards, boardId ?? -1);
    const {
        data: board,
        isLoading: isBoardLoading,
        isError: isBoardError,
    } = useBoard(boardId, initialBoard);

    if (isLoading) {
        return <BoardPageSkeleton />;
    }

    if (isError) {
        return (
            <ErrorState
                title="Unable to load boards"
                message={error instanceof Error ? error.message : 'Unknown error'}
                onRetry={() => {
                    void refetch();
                }}
            />
        );
    }

    if (!boards || boards.length === 0) {
        return (
            <EmptyState title="No boards yet" message="Seed the database to create a demo board." />
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            {boards.length > 1 ? (
                <div className="flex max-w-xs shrink-0 flex-col gap-1.5">
                    <label htmlFor="board-select" className="text-sm font-medium">
                        Board
                    </label>
                    <Select
                        id="board-select"
                        value={boardId ?? boards[0].id}
                        onChange={(event) => {
                            setSearchParams({ board: event.target.value });
                        }}
                    >
                        {boards.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                                {entry.name}
                            </option>
                        ))}
                    </Select>
                </div>
            ) : null}

            {isBoardLoading && !board ? <BoardPageSkeleton /> : null}

            {isBoardError || !board ? (
                <ErrorState title="Unable to load board" message="Try refreshing the page." />
            ) : (
                <BoardView board={board} />
            )}
        </div>
    );
}

function BoardPageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96 max-w-full" />
            </div>
            <Skeleton className="h-28 w-full" />
            <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-[420px] w-80 shrink-0" />
                ))}
            </div>
        </div>
    );
}

function ErrorState({
    title,
    message,
    onRetry,
}: {
    title: string;
    message: string;
    onRetry?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-raised px-6 py-16 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-danger" aria-hidden />
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            <p className="mt-2 max-w-md text-sm text-muted">{message}</p>
            {onRetry ? (
                <Button className="mt-4" onClick={onRetry}>
                    Retry
                </Button>
            ) : null}
        </div>
    );
}

function EmptyState({ title, message }: { title: string; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <LayoutDashboard className="mb-3 h-8 w-8 text-muted" aria-hidden />
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            <p className="mt-2 max-w-md text-sm text-muted">{message}</p>
        </div>
    );
}
