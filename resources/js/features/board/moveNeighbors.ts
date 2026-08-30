import type { MoveTaskPayload, Task } from '@/types';

/**
 * Neighbors for a moved task from its position in the post-move ordered list
 * (the list still includes the moved task).
 */
export function neighborsFromOrderedTasks(
    orderedTasks: Task[],
    movedTaskId: number,
): Pick<MoveTaskPayload, 'before_id' | 'after_id'> {
    const index = orderedTasks.findIndex((task) => task.id === movedTaskId);

    if (index < 0) {
        return {};
    }

    const before = index > 0 ? orderedTasks[index - 1] : undefined;
    const after = index < orderedTasks.length - 1 ? orderedTasks[index + 1] : undefined;

    return {
        ...(before ? { before_id: before.id } : {}),
        ...(after ? { after_id: after.id } : {}),
    };
}

export function sameNeighbors(
    left: Pick<MoveTaskPayload, 'before_id' | 'after_id'>,
    right: Pick<MoveTaskPayload, 'before_id' | 'after_id'>,
): boolean {
    return left.before_id === right.before_id && left.after_id === right.after_id;
}

/**
 * Apply arrayMove semantics across same/cross column task lists.
 * `overIndex` is the destination index in the destination column's current list
 * (including the active task when same-column). For column-end drops, pass
 * `destinationTasks.length` (cross-column) or use arrayMove to last index.
 */
export function reorderTasks(options: {
    sourceTasks: Task[];
    destinationTasks: Task[];
    activeTaskId: number;
    sourceColumnId: number;
    destinationColumnId: number;
    overIndex: number;
}): { sourceTasks: Task[]; destinationTasks: Task[]; moved: Task } | null {
    const {
        sourceTasks,
        destinationTasks,
        activeTaskId,
        sourceColumnId,
        destinationColumnId,
        overIndex,
    } = options;

    const sourceIndex = sourceTasks.findIndex((task) => task.id === activeTaskId);

    if (sourceIndex < 0) {
        return null;
    }

    const moving = sourceTasks[sourceIndex];

    if (sourceColumnId === destinationColumnId) {
        const destinationIndex = Math.max(0, Math.min(overIndex, sourceTasks.length - 1));

        if (sourceIndex === destinationIndex) {
            return null;
        }

        const next = sourceTasks.slice();
        next.splice(sourceIndex, 1);
        next.splice(destinationIndex, 0, moving);

        return {
            sourceTasks: next,
            destinationTasks: next,
            moved: moving,
        };
    }

    const without = sourceTasks.filter((task) => task.id !== activeTaskId);
    const insertAt = Math.max(0, Math.min(overIndex, destinationTasks.length));
    const relocated: Task = { ...moving, column_id: destinationColumnId };
    const nextDestination = destinationTasks.slice();
    nextDestination.splice(insertAt, 0, relocated);

    return {
        sourceTasks: without,
        destinationTasks: nextDestination,
        moved: relocated,
    };
}

/** @deprecated kept for older tests */
export function computeMoveNeighbors(
    tasks: Task[],
    activeTaskId: number,
    overIndex: number,
): { before_id?: number; after_id?: number } {
    const filtered = tasks.filter((task) => task.id !== activeTaskId);
    const index = Math.max(0, Math.min(overIndex, filtered.length));
    const before = index > 0 ? filtered[index - 1] : undefined;
    const after = index < filtered.length ? filtered[index] : undefined;

    return {
        ...(before ? { before_id: before.id } : {}),
        ...(after ? { after_id: after.id } : {}),
    };
}
