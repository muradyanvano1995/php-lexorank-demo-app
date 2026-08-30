import type { Board, Column, MoveTaskPayload, Task } from '@/types';

export function cloneBoard(board: Board): Board {
    return {
        ...board,
        columns: board.columns.map((column) => ({
            ...column,
            tasks: [...column.tasks],
        })),
    };
}

/** Replace column task lists while keeping board metadata (used on drag-end commit). */
export function replaceBoardColumns(board: Board, columns: Column[]): Board {
    return {
        ...board,
        columns: columns.map((column) => ({
            ...column,
            tasks: [...column.tasks],
        })),
    };
}

function resolveInsertIndex(tasks: Task[], payload: MoveTaskPayload): number {
    if (payload.before_id !== undefined) {
        const index = tasks.findIndex((task) => task.id === payload.before_id);

        return index >= 0 ? index + 1 : tasks.length;
    }

    if (payload.after_id !== undefined) {
        const index = tasks.findIndex((task) => task.id === payload.after_id);

        return index >= 0 ? index : 0;
    }

    return tasks.length;
}

export function applyOptimisticMove(
    board: Board,
    taskId: number,
    payload: MoveTaskPayload,
    task: Task,
): Board {
    const next = cloneBoard(board);
    let moving = task;

    for (const column of next.columns) {
        const index = column.tasks.findIndex((entry) => entry.id === taskId);

        if (index >= 0) {
            moving = column.tasks[index];
            column.tasks.splice(index, 1);
            break;
        }
    }

    const target = next.columns.find((column) => column.id === payload.column_id);

    if (!target) {
        return board;
    }

    const optimistic: Task = {
        ...moving,
        column_id: payload.column_id,
    };

    const without = target.tasks.filter((entry) => entry.id !== taskId);
    const insertIndex = resolveInsertIndex(without, payload);
    without.splice(insertIndex, 0, optimistic);
    target.tasks = without;

    return next;
}

export function applyOptimisticMoveFixture() {
    const task = (id: number, columnId: number, title: string): Task => ({
        id,
        column_id: columnId,
        title,
        description: null,
        priority: 'medium',
        assignee_name: null,
        due_date: null,
        rank: `0|${id}`,
        rank_length: 4,
        bucket: '0',
        created_at: null,
        updated_at: null,
    });

    const before: Board = {
        id: 1,
        name: 'Demo',
        description: null,
        created_at: null,
        updated_at: null,
        columns: [
            {
                id: 1,
                board_id: 1,
                name: 'Backlog',
                position: 0,
                created_at: null,
                updated_at: null,
                tasks: [task(1, 1, 'Keep'), task(2, 1, 'Move')],
            },
            {
                id: 2,
                board_id: 1,
                name: 'Done',
                position: 1,
                created_at: null,
                updated_at: null,
                tasks: [task(3, 2, 'Existing')],
            },
        ],
    };

    const snapshot = cloneBoard(before);
    const afterMove = applyOptimisticMove(
        before,
        2,
        { column_id: 2, after_id: 3 },
        task(2, 1, 'Move'),
    );
    const restored = snapshot;

    return { before, afterMove, restored };
}
