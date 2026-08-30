import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { columnSortableId } from '@/features/board/columnIds';
import { filterTasks } from '@/features/board/boardUtils';
import { TaskCard } from '@/features/board/TaskCard';
import type { BoardFiltersState, Column, Task } from '@/types';
import { cn } from '@/lib/cn';

export type ColumnLaneProps = {
    column: Column;
    filters: BoardFiltersState;
    dragEnabled: boolean;
    columnSortEnabled?: boolean;
    isDropTarget?: boolean;
    onAddTask: (columnId: number) => void;
    onEditColumn: (column: Column) => void;
    onOpenTask: (task: Task) => void;
};

export function ColumnLane({
    column,
    filters,
    dragEnabled,
    columnSortEnabled = true,
    isDropTarget = false,
    onAddTask,
    onEditColumn,
    onOpenTask,
}: ColumnLaneProps) {
    const visibleTasks = filterTasks(column.tasks, filters);
    const sortableTasks = dragEnabled ? column.tasks : visibleTasks;

    const {
        attributes,
        listeners,
        setNodeRef: setSortableRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: columnSortableId(column.id),
        disabled: !columnSortEnabled,
        data: { type: 'column', columnId: column.id },
    });

    const { setNodeRef: setDroppableRef } = useDroppable({
        id: `column-drop-${column.id}`,
        data: { type: 'column', columnId: column.id },
    });

    const setColumnRef = (node: HTMLElement | null): void => {
        setSortableRef(node);
        setDroppableRef(node);
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <section
            ref={setColumnRef}
            style={style}
            className={cn(
                'flex h-full w-[min(100%,20rem)] shrink-0 flex-col rounded-xl border border-border bg-surface/70',
                isDropTarget && dragEnabled && 'border-accent/50 ring-2 ring-accent/20',
                isDragging && 'pointer-events-none opacity-40',
            )}
        >
            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border-subtle px-3 py-3">
                <div className="flex min-w-0 flex-1 items-start gap-1">
                    <button
                        type="button"
                        className={cn(
                            'mt-0.5 touch-none rounded p-1 text-muted',
                            columnSortEnabled
                                ? 'cursor-grab hover:bg-accent-muted/40 active:cursor-grabbing'
                                : 'cursor-default opacity-40',
                        )}
                        aria-label={`Reorder ${column.name} column`}
                        disabled={!columnSortEnabled}
                        {...(columnSortEnabled ? { ...attributes, ...listeners } : {})}
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                    <div className="min-w-0">
                        <h2 className="truncate font-display font-semibold text-foreground">
                            {column.name}
                        </h2>
                        <p className="text-xs text-muted">{visibleTasks.length} tasks</p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${column.name} column`}
                        onClick={() => onEditColumn(column)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Add task to ${column.name}`}
                        onClick={() => onAddTask(column.id)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </header>
            <div className="kanban-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
                <SortableContext
                    items={sortableTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {visibleTasks.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted">
                            {column.tasks.length === 0 ? 'No tasks yet' : 'No tasks match filters'}
                        </p>
                    ) : (
                        visibleTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                dragEnabled={dragEnabled}
                                onOpen={onOpenTask}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </section>
    );
}

export function ColumnLanePreview({ column }: { column: Column }) {
    return (
        <section className="flex w-[min(100%,20rem)] cursor-grabbing flex-col rounded-xl border border-accent/40 bg-surface-overlay shadow-overlay">
            <header className="border-b border-border-subtle px-4 py-3">
                <h2 className="font-display font-semibold text-foreground">{column.name}</h2>
                <p className="text-xs text-muted">{column.tasks.length} tasks</p>
            </header>
            <div className="space-y-2 p-3">
                {column.tasks.slice(0, 3).map((task) => (
                    <div
                        key={task.id}
                        className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
                    >
                        {task.title}
                    </div>
                ))}
                {column.tasks.length > 3 ? (
                    <p className="text-center text-xs text-muted">
                        +{column.tasks.length - 3} more
                    </p>
                ) : null}
                {column.tasks.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
                        No tasks yet
                    </p>
                ) : null}
            </div>
        </section>
    );
}
