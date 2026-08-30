import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardKeys } from '@/api/boards';
import { createTask, deleteTask, moveTask, updateTask } from '@/api/tasks';
import { cloneBoard, replaceBoardColumns } from '@/features/board/optimisticMove';
import type { Board, Column, CreateTaskPayload, MoveTaskPayload, Task, UpdateTaskPayload } from '@/types';

function upsertTaskInBoard(board: Board, task: Task): Board {
    const next = cloneBoard(board);

    for (const column of next.columns) {
        column.tasks = column.tasks.filter((entry) => entry.id !== task.id);
    }

    const target = next.columns.find((column) => column.id === task.column_id);

    if (target) {
        target.tasks.push(task);
        target.tasks.sort((a, b) => (a.rank ?? '').localeCompare(b.rank ?? ''));
    }

    return next;
}

function removeTaskFromBoard(board: Board, taskId: number): Board {
    const next = cloneBoard(board);

    for (const column of next.columns) {
        column.tasks = column.tasks.filter((task) => task.id !== taskId);
    }

    return next;
}

function patchBoardCaches(
    queryClient: ReturnType<typeof useQueryClient>,
    boardId: number,
    updater: (board: Board) => Board,
): { previousDetail?: Board; previousList?: Board[] } {
    const detailKey = boardKeys.detail(boardId);
    const previousDetail = queryClient.getQueryData<Board>(detailKey);
    const previousList = queryClient.getQueryData<Board[]>(boardKeys.all);

    if (previousDetail) {
        queryClient.setQueryData(detailKey, updater(previousDetail));
    }

    if (previousList) {
        queryClient.setQueryData(
            boardKeys.all,
            previousList.map((board) => (board.id === boardId ? updater(board) : board)),
        );
    }

    return { previousDetail, previousList };
}

export function useTaskMutations(boardId: number) {
    const queryClient = useQueryClient();

    const invalidate = async (): Promise<void> => {
        await queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
        await queryClient.invalidateQueries({ queryKey: boardKeys.all });
    };

    /** Sync commit of the post-drag layout. Returns the prior cache for rollback. */
    const commitColumns = (
        columns: Column[],
    ): { previousDetail?: Board; previousList?: Board[] } => {
        return patchBoardCaches(queryClient, boardId, (board) =>
            replaceBoardColumns(board, columns),
        );
    };

    const createMutation = useMutation({
        mutationFn: ({ columnId, payload }: { columnId: number; payload: CreateTaskPayload }) =>
            createTask(columnId, payload),
        onSuccess: async (task) => {
            patchBoardCaches(queryClient, boardId, (board) => upsertTaskInBoard(board, task));
            await invalidate();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ taskId, payload }: { taskId: number; payload: UpdateTaskPayload }) =>
            updateTask(taskId, payload),
        onSuccess: async (task) => {
            patchBoardCaches(queryClient, boardId, (board) => upsertTaskInBoard(board, task));
            await invalidate();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (taskId: number) => deleteTask(taskId),
        onSuccess: async (_result, taskId) => {
            patchBoardCaches(queryClient, boardId, (board) => removeTaskFromBoard(board, taskId));
            await invalidate();
        },
    });

    const moveMutation = useMutation({
        mutationFn: ({
            taskId,
            payload,
        }: {
            taskId: number;
            payload: MoveTaskPayload;
            task: Task;
        }) => moveTask(taskId, payload),
        onMutate: async () => {
            // BoardView already committed the drop layout via commitColumns.
            // Only cancel in-flight refetches so they cannot overwrite it.
            await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });
            await queryClient.cancelQueries({ queryKey: boardKeys.all });
        },
        onSuccess: (task) => {
            // Update ranks in place — do not re-sort by rank here or the list
            // can visibly jump away from the already-committed drop order.
            patchBoardCaches(queryClient, boardId, (board) => {
                const next = cloneBoard(board);

                for (const column of next.columns) {
                    column.tasks = column.tasks.map((entry) =>
                        entry.id === task.id ? { ...entry, ...task } : entry,
                    );
                }

                return next;
            });
        },
        onSettled: () => {
            // Background reconcile — keep showing optimistic/success data meanwhile.
            void queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
            void queryClient.invalidateQueries({ queryKey: boardKeys.all });
        },
    });

    const restoreBoard = (rollback: {
        previousDetail?: Board;
        previousList?: Board[];
    }): void => {
        if (rollback.previousDetail) {
            queryClient.setQueryData(boardKeys.detail(boardId), rollback.previousDetail);
        }

        if (rollback.previousList) {
            queryClient.setQueryData(boardKeys.all, rollback.previousList);
        }
    };

    return {
        createTask: createMutation,
        updateTask: updateMutation,
        deleteTask: deleteMutation,
        moveTask: moveMutation,
        commitColumns,
        restoreBoard,
    };
}

export { computeMoveNeighbors, neighborsFromOrderedTasks } from '@/features/board/moveNeighbors';
