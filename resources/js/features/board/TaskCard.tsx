import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, Copy, GripVertical, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import type { Task } from '@/types';
import { cn } from '@/lib/cn';

export type TaskCardProps = {
    task: Task;
    dragEnabled?: boolean;
    onOpen: (task: Task) => void;
};

export function TaskCard({ task, dragEnabled = true, onOpen }: TaskCardProps) {
    const { push } = useToast();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        disabled: !dragEnabled,
        data: { type: 'task', task, columnId: task.column_id },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const copyRank = async (): Promise<void> => {
        if (!task.rank) {
            return;
        }

        try {
            await navigator.clipboard.writeText(task.rank);
            push({ variant: 'success', title: 'Rank copied' });
        } catch {
            push({ variant: 'error', title: 'Unable to copy rank' });
        }
    };

    return (
        <article
            ref={setNodeRef}
            style={style}
            className={cn(
                'group rounded-xl border border-border bg-surface-raised p-3 shadow-card',
                !isDragging && 'motion-safe-transition',
                isDragging && 'pointer-events-none opacity-40 shadow-none ring-2 ring-accent/25',
            )}
        >
            <div className="mb-2 flex items-start gap-2">
                <button
                    type="button"
                    className={cn(
                        'mt-0.5 touch-none rounded p-1 text-muted',
                        dragEnabled
                            ? 'cursor-grab hover:bg-accent-muted/40 active:cursor-grabbing'
                            : 'cursor-default opacity-40',
                    )}
                    aria-label={dragEnabled ? `Drag ${task.title}` : undefined}
                    disabled={!dragEnabled}
                    {...(dragEnabled ? { ...attributes, ...listeners } : {})}
                >
                    <GripVertical className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className="min-w-0 flex-1 cursor-pointer text-left"
                    onClick={() => onOpen(task)}
                >
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <h3 className="truncate font-medium text-foreground">{task.title}</h3>
                        <Badge priority={task.priority}>{task.priority}</Badge>
                    </div>
                    {task.description ? (
                        <p className="line-clamp-2 text-sm text-muted">{task.description}</p>
                    ) : null}
                </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                {task.assignee_name ? (
                    <span className="inline-flex items-center gap-1">
                        <UserRound className="h-3.5 w-3.5" aria-hidden />
                        {task.assignee_name}
                    </span>
                ) : null}
                {task.due_date ? (
                    <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                        {task.due_date}
                    </span>
                ) : null}
            </div>
            {task.rank ? (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface px-2 py-1.5 text-xs">
                    <code
                        className="min-w-0 flex-1 truncate font-mono text-muted"
                        title={`Rank length ${task.rank_length ?? 0} · bucket ${task.bucket ?? '?'}`}
                    >
                        {task.rank}
                    </code>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Copy rank"
                        onClick={() => {
                            void copyRank();
                        }}
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ) : null}
        </article>
    );
}

export function TaskCardPreview({ task }: { task: Task }) {
    return (
        <article className="w-[280px] cursor-grabbing rounded-xl border border-accent/40 bg-surface-overlay p-3 shadow-overlay">
            <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="truncate font-medium">{task.title}</h3>
                <Badge priority={task.priority}>{task.priority}</Badge>
            </div>
            {task.description ? (
                <p className="line-clamp-2 text-sm text-muted">{task.description}</p>
            ) : null}
        </article>
    );
}
