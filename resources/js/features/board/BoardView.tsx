import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    MeasuringStrategy,
    PointerSensor,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useRef, useState } from 'react';
import { boardCollisionDetection } from '@/features/board/boardCollision';
import { BoardFilters } from '@/features/board/BoardFilters';
import { countTotalTasks, countVisibleTasks } from '@/features/board/boardUtils';
import { ColumnDialog, type ColumnDialogState } from '@/features/board/ColumnDialog';
import { ColumnLane, ColumnLanePreview } from '@/features/board/ColumnLane';
import { columnSortableId } from '@/features/board/columnIds';
import { TaskCardPreview } from '@/features/board/TaskCard';
import { TaskDialog, type TaskDialogState } from '@/features/board/TaskDialog';
import { neighborsFromOrderedTasks, sameNeighbors } from '@/features/board/moveNeighbors';
import { taskFormToPayload } from '@/lib/taskForm';
import { useColumnMutations } from '@/hooks/useColumnMutations';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useToast } from '@/hooks/useToast';
import type { Board, BoardFiltersState, Column, Task } from '@/types';
import { Plus } from 'lucide-react';

export type BoardViewProps = {
    board: Board;
};

function cloneColumns(columns: Column[]): Column[] {
    return columns
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((column) => ({
            ...column,
            tasks: column.tasks.slice(),
        }));
}

function findTask(columns: Column[], taskId: number): Task | undefined {
    for (const column of columns) {
        const task = column.tasks.find((entry) => entry.id === taskId);

        if (task) {
            return task;
        }
    }

    return undefined;
}

function findColumnForTask(columns: Column[], taskId: number): Column | undefined {
    return columns.find((column) => column.tasks.some((task) => task.id === taskId));
}

function getOverColumnId(
    columns: Column[],
    over: NonNullable<DragEndEvent['over']>,
): number | null {
    if (typeof over.data.current?.columnId === 'number') {
        return over.data.current.columnId;
    }

    const overId = String(over.id);

    if (overId.startsWith('column-drop-')) {
        return Number(overId.replace('column-drop-', ''));
    }

    if (overId.startsWith('column-')) {
        return Number(overId.replace('column-', ''));
    }

    return findColumnForTask(columns, Number(over.id))?.id ?? null;
}

/** Move a task into another column (append, or before a target task index). */
function relocateTaskAcrossColumns(
    columns: Column[],
    activeId: number,
    sourceColumnId: number,
    destinationColumnId: number,
    toIndex: number,
): Column[] {
    const source = columns.find((column) => column.id === sourceColumnId);
    const destination = columns.find((column) => column.id === destinationColumnId);

    if (!source || !destination) {
        return columns;
    }

    const fromIndex = source.tasks.findIndex((task) => task.id === activeId);

    if (fromIndex < 0) {
        return columns;
    }

    const moving = { ...source.tasks[fromIndex], column_id: destinationColumnId };
    const nextSource = source.tasks.slice();
    nextSource.splice(fromIndex, 1);

    const nextDestination = destination.tasks.filter((task) => task.id !== activeId);
    const insertAt = Math.max(0, Math.min(toIndex, nextDestination.length));
    nextDestination.splice(insertAt, 0, moving);

    return columns.map((column) => {
        if (column.id === source.id) {
            return { ...column, tasks: nextSource };
        }

        if (column.id === destination.id) {
            return { ...column, tasks: nextDestination };
        }

        return column;
    });
}

export function BoardView({ board }: BoardViewProps) {
    const { push } = useToast();
    const mutations = useTaskMutations(board.id);
    const columnMutations = useColumnMutations(board.id);
    const [filters, setFilters] = useState<BoardFiltersState>({ search: '', priorities: [] });
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [draggingColumn, setDraggingColumn] = useState(false);
    const [dialog, setDialog] = useState<TaskDialogState>({ open: false });
    const [columnDialog, setColumnDialog] = useState<ColumnDialogState>({ open: false });
    const [dragColumns, setDragColumns] = useState<Column[] | null>(null);
    const [overColumnId, setOverColumnId] = useState<number | null>(null);
    const dragOriginRef = useRef<Column[] | null>(null);

    const columns = dragColumns ?? cloneColumns(board.columns);

    const filtersBlockTaskDrag =
        filters.search.trim() !== '' ||
        (filters.priorities.length > 0 && filters.priorities.length < 4);

    const dragEnabled = !filtersBlockTaskDrag && !draggingColumn;
    const columnSortEnabled = !activeTask;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const visibleCount = countVisibleTasks(columns, filters);
    const totalCount = countTotalTasks(columns);

    const onDragStart = (event: DragStartEvent): void => {
        const snapshot = cloneColumns(board.columns);
        dragOriginRef.current = snapshot;
        setDragColumns(snapshot);

        if (event.active.data.current?.type === 'column') {
            const columnId = event.active.data.current.columnId as number;
            setDraggingColumn(true);
            setActiveTask(null);
            setActiveColumn(snapshot.find((column) => column.id === columnId) ?? null);
            setOverColumnId(null);

            return;
        }

        setDraggingColumn(false);
        setActiveColumn(null);
        setActiveTask(findTask(snapshot, Number(event.active.id)) ?? null);
        setOverColumnId(findColumnForTask(snapshot, Number(event.active.id))?.id ?? null);
    };

    const onDragOver = (event: DragOverEvent): void => {
        const { active, over } = event;

        if (active.data.current?.type === 'column') {
            // Only react to other columns — task hits inside a lane thrash order
            // and can exceed React's max update depth with live reordering.
            if (!over || over.data.current?.type !== 'column' || !dragColumns) {
                return;
            }

            const activeColumnId = active.data.current.columnId as number;
            const overColumnIdValue =
                typeof over.data.current.columnId === 'number'
                    ? over.data.current.columnId
                    : null;

            if (overColumnIdValue === null || activeColumnId === overColumnIdValue) {
                return;
            }

            setDragColumns((current) => {
                if (!current) {
                    return current;
                }

                const oldIndex = current.findIndex((column) => column.id === activeColumnId);
                const newIndex = current.findIndex((column) => column.id === overColumnIdValue);

                if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
                    return current;
                }

                return arrayMove(current, oldIndex, newIndex).map((column, position) => ({
                    ...column,
                    position,
                }));
            });

            return;
        }

        if (!over || !dragEnabled || !dragColumns) {
            setOverColumnId(null);

            return;
        }

        const activeId = Number(active.id);
        const activeColumn = findColumnForTask(dragColumns, activeId);
        const nextOverColumnId = getOverColumnId(dragColumns, over);

        setOverColumnId((current) =>
            current === nextOverColumnId ? current : nextOverColumnId,
        );

        if (!activeColumn || nextOverColumnId === null) {
            return;
        }

        // Same-column: live reorder so siblings animate out of the way.
        if (activeColumn.id === nextOverColumnId) {
            if (over.data.current?.type !== 'task' || Number(over.id) === activeId) {
                return;
            }

            const oldIndex = activeColumn.tasks.findIndex((task) => task.id === activeId);
            const newIndex = activeColumn.tasks.findIndex((task) => task.id === Number(over.id));

            if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
                return;
            }

            setDragColumns((current) => {
                if (!current) {
                    return current;
                }

                return current.map((column) => {
                    if (column.id !== activeColumn.id) {
                        return column;
                    }

                    return {
                        ...column,
                        tasks: arrayMove(column.tasks, oldIndex, newIndex),
                    };
                });
            });

            return;
        }

        let toIndex =
            dragColumns.find((column) => column.id === nextOverColumnId)?.tasks.length ?? 0;

        if (over.data.current?.type === 'task') {
            const destination = dragColumns.find((column) => column.id === nextOverColumnId);
            const overIndex =
                destination?.tasks.findIndex((task) => task.id === Number(over.id)) ?? -1;

            if (overIndex >= 0) {
                toIndex = overIndex;
            }
        }

        setDragColumns((current) => {
            if (!current) {
                return current;
            }

            const destination = current.find((column) => column.id === nextOverColumnId);

            if (!destination) {
                return current;
            }

            const existingInDest = destination.tasks.findIndex((task) => task.id === activeId);

            if (existingInDest === toIndex) {
                return current;
            }

            return relocateTaskAcrossColumns(
                current,
                activeId,
                activeColumn.id,
                nextOverColumnId,
                toIndex,
            );
        });
    };

    const persistFromColumns = (
        origin: Column[],
        next: Column[],
        activeId: number,
        rollback: { previousDetail?: Board; previousList?: Board[] },
    ): boolean => {
        const originColumn = origin.find((column) =>
            column.tasks.some((task) => task.id === activeId),
        );
        const nextColumn = next.find((column) => column.tasks.some((task) => task.id === activeId));
        const active = findTask(next, activeId);

        if (!originColumn || !nextColumn || !active) {
            return false;
        }

        const previousNeighbors = neighborsFromOrderedTasks(originColumn.tasks, activeId);
        const nextNeighbors = neighborsFromOrderedTasks(nextColumn.tasks, activeId);

        if (
            originColumn.id === nextColumn.id &&
            sameNeighbors(previousNeighbors, nextNeighbors)
        ) {
            return false;
        }

        mutations.moveTask.mutate(
            {
                taskId: activeId,
                task: active,
                payload: {
                    column_id: nextColumn.id,
                    ...nextNeighbors,
                },
            },
            {
                onError: (error) => {
                    if (rollback.previousDetail) {
                        mutations.restoreBoard(rollback);
                    }

                    setDragColumns(null);
                    push({
                        variant: 'error',
                        title: 'Move failed',
                        description: error instanceof Error ? error.message : undefined,
                    });
                },
                onSettled: () => {
                    // Keep the drop layout until the request finishes so a stale
                    // board prop cannot flash the card back to the source column.
                    setDragColumns(null);
                },
            },
        );

        return true;
    };

    const onDragEnd = (event: DragEndEvent): void => {
        const origin = dragOriginRef.current ?? cloneColumns(board.columns);
        const { active, over } = event;
        const current = dragColumns ?? origin;

        if (active.data.current?.type === 'column') {
            const orderedIds = current.map((column) => column.id);
            const originIds = origin.map((column) => column.id);
            const changed = orderedIds.some((id, index) => id !== originIds[index]);

            setDraggingColumn(false);
            setActiveTask(null);
            setActiveColumn(null);
            setOverColumnId(null);
            dragOriginRef.current = null;

            if (!changed) {
                setDragColumns(null);

                return;
            }

            mutations.commitColumns(current);
            setDragColumns(current);

            columnMutations.reorderColumns.mutate(orderedIds, {
                onError: (error) => {
                    setDragColumns(null);
                    push({
                        variant: 'error',
                        title: 'Column reorder failed',
                        description: error instanceof Error ? error.message : undefined,
                    });
                },
                onSettled: () => {
                    setDragColumns(null);
                },
            });

            return;
        }

        const activeId = Number(active.id);

        if (!dragEnabled) {
            setActiveTask(null);
            setActiveColumn(null);
            dragOriginRef.current = null;
            setDragColumns(null);
            setOverColumnId(null);
            setDraggingColumn(false);

            return;
        }

        let nextColumns = current;

        if (over && over.id !== active.id) {
            const activeColumn = findColumnForTask(current, activeId);
            const overColumnIdValue = getOverColumnId(current, over);

            if (activeColumn && overColumnIdValue === activeColumn.id) {
                const activeIndex = activeColumn.tasks.findIndex((task) => task.id === activeId);

                if (activeIndex >= 0) {
                    let overIndex = -1;

                    if (over.data.current?.type === 'task') {
                        overIndex = activeColumn.tasks.findIndex(
                            (task) => task.id === Number(over.id),
                        );
                    } else if (
                        over.data.current?.type === 'column' ||
                        String(over.id).startsWith('column-')
                    ) {
                        overIndex = activeColumn.tasks.length - 1;
                    }

                    if (overIndex >= 0 && activeIndex !== overIndex) {
                        nextColumns = current.map((column) => {
                            if (column.id !== activeColumn.id) {
                                return column;
                            }

                            return {
                                ...column,
                                tasks: arrayMove(column.tasks, activeIndex, overIndex),
                            };
                        });
                    }
                }
            } else if (activeColumn && overColumnIdValue !== null) {
                const destination = current.find((column) => column.id === overColumnIdValue);
                let toIndex = destination?.tasks.length ?? 0;

                if (over.data.current?.type === 'task' && destination) {
                    const overIndex = destination.tasks.findIndex(
                        (task) => task.id === Number(over.id),
                    );

                    if (overIndex >= 0) {
                        toIndex = overIndex;
                    }
                }

                nextColumns = relocateTaskAcrossColumns(
                    current,
                    activeId,
                    activeColumn.id,
                    overColumnIdValue,
                    toIndex,
                );
            }
        }

        const rollback = mutations.commitColumns(nextColumns);
        setDragColumns(nextColumns);
        setActiveTask(null);
        setActiveColumn(null);
        setOverColumnId(null);
        setDraggingColumn(false);
        dragOriginRef.current = null;

        const persisted = persistFromColumns(origin, nextColumns, activeId, rollback);

        if (!persisted) {
            setDragColumns(null);
        }
    };

    const onDragCancel = (): void => {
        dragOriginRef.current = null;
        setDragColumns(null);
        setOverColumnId(null);
        setActiveTask(null);
        setActiveColumn(null);
        setDraggingColumn(false);
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            <div className="shrink-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate font-display text-xl font-semibold tracking-tight sm:text-2xl">
                            {board.name}
                        </h1>
                        {board.description ? (
                            <p className="mt-1 max-w-2xl truncate text-sm text-muted sm:whitespace-normal sm:text-base">
                                {board.description}
                            </p>
                        ) : null}
                    </div>
                    <BoardFilters
                        filters={filters}
                        onChange={setFilters}
                        visibleCount={visibleCount}
                        totalCount={totalCount}
                    />
                </div>
                {!filtersBlockTaskDrag ? null : (
                    <p className="mt-2 text-sm text-muted">
                        Clear filters to reorder tasks with drag and drop.
                    </p>
                )}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={boardCollisionDetection}
                measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
                onDragCancel={onDragCancel}
            >
                <div className="kanban-scroll flex min-h-0 flex-1 items-stretch gap-4 overflow-x-auto overflow-y-hidden pb-1">
                    <SortableContext
                        items={columns.map((column) => columnSortableId(column.id))}
                        strategy={horizontalListSortingStrategy}
                    >
                        {columns.map((column) => (
                            <ColumnLane
                                key={column.id}
                                column={column}
                                filters={filters}
                                dragEnabled={dragEnabled}
                                columnSortEnabled={columnSortEnabled}
                                isDropTarget={overColumnId === column.id}
                                onAddTask={(columnId) =>
                                    setDialog({ open: true, mode: 'create', columnId })
                                }
                                onEditColumn={(entry) =>
                                    setColumnDialog({ open: true, mode: 'edit', column: entry })
                                }
                                onOpenTask={(task) => setDialog({ open: true, mode: 'edit', task })}
                            />
                        ))}
                    </SortableContext>
                    <button
                        type="button"
                        className="flex w-[min(100%,20rem)] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface/40 px-4 text-sm text-muted motion-safe-transition hover:border-accent/40 hover:bg-accent-muted/20 hover:text-foreground"
                        onClick={() => setColumnDialog({ open: true, mode: 'create' })}
                    >
                        <Plus className="h-5 w-5" aria-hidden />
                        Add column
                    </button>
                </div>
                <DragOverlay dropAnimation={null}>
                    {activeTask ? <TaskCardPreview task={activeTask} /> : null}
                    {activeColumn ? <ColumnLanePreview column={activeColumn} /> : null}
                </DragOverlay>
            </DndContext>

            <TaskDialog
                state={dialog}
                onOpenChange={(open) => {
                    if (!open) {
                        setDialog({ open: false });
                    }
                }}
                submitting={
                    mutations.createTask.isPending ||
                    mutations.updateTask.isPending ||
                    mutations.deleteTask.isPending
                }
                onCreate={async (columnId, values) => {
                    await mutations.createTask.mutateAsync({
                        columnId,
                        payload: taskFormToPayload(values),
                    });
                    push({ variant: 'success', title: 'Task created' });
                }}
                onUpdate={async (task, values) => {
                    await mutations.updateTask.mutateAsync({
                        taskId: task.id,
                        payload: taskFormToPayload(values),
                    });
                    push({ variant: 'success', title: 'Task updated' });
                }}
                onDelete={async (task) => {
                    await mutations.deleteTask.mutateAsync(task.id);
                    setDialog({ open: false });
                    push({ variant: 'success', title: 'Task deleted' });
                }}
            />

            <ColumnDialog
                state={columnDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        setColumnDialog({ open: false });
                    }
                }}
                submitting={
                    columnMutations.createColumn.isPending ||
                    columnMutations.updateColumn.isPending ||
                    columnMutations.deleteColumn.isPending
                }
                onCreate={async (name) => {
                    await columnMutations.createColumn.mutateAsync({ name });
                    push({ variant: 'success', title: 'Column created' });
                }}
                onUpdate={async (column, name) => {
                    await columnMutations.updateColumn.mutateAsync({
                        columnId: column.id,
                        payload: { name },
                    });
                    push({ variant: 'success', title: 'Column updated' });
                }}
                onDelete={async (column) => {
                    await columnMutations.deleteColumn.mutateAsync(column.id);
                    setColumnDialog({ open: false });
                    push({ variant: 'success', title: 'Column deleted' });
                }}
            />
        </div>
    );
}
