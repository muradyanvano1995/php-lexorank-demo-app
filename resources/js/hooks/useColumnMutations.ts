import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardKeys } from '@/api/boards';
import { createColumn, deleteColumn, reorderColumns, updateColumn } from '@/api/columns';
import { cloneBoard } from '@/features/board/optimisticMove';
import type { Board, Column, CreateColumnPayload, UpdateColumnPayload } from '@/types';

function patchBoardCaches(
    queryClient: ReturnType<typeof useQueryClient>,
    boardId: number,
    updater: (board: Board) => Board,
): void {
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
}

function appendColumn(board: Board, column: Column): Board {
    const next = cloneBoard(board);
    next.columns = [...next.columns, { ...column, tasks: column.tasks ?? [] }].sort(
        (a, b) => a.position - b.position,
    );

    return next;
}

function renameColumn(board: Board, column: Column): Board {
    const next = cloneBoard(board);
    next.columns = next.columns.map((entry) =>
        entry.id === column.id ? { ...entry, name: column.name, updated_at: column.updated_at } : entry,
    );

    return next;
}

function removeColumn(board: Board, columnId: number): Board {
    const next = cloneBoard(board);
    next.columns = next.columns
        .filter((column) => column.id !== columnId)
        .map((column, position) => ({ ...column, position }));

    return next;
}

export function useColumnMutations(boardId: number) {
    const queryClient = useQueryClient();

    const invalidate = async (): Promise<void> => {
        await queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
        await queryClient.invalidateQueries({ queryKey: boardKeys.all });
    };

    const createMutation = useMutation({
        mutationFn: (payload: CreateColumnPayload) => createColumn(boardId, payload),
        onSuccess: async (column) => {
            patchBoardCaches(queryClient, boardId, (board) => appendColumn(board, column));
            await invalidate();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            columnId,
            payload,
        }: {
            columnId: number;
            payload: UpdateColumnPayload;
        }) => updateColumn(columnId, payload),
        onSuccess: async (column) => {
            patchBoardCaches(queryClient, boardId, (board) => renameColumn(board, column));
            await invalidate();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (columnId: number) => deleteColumn(columnId),
        onSuccess: async (_result, columnId) => {
            patchBoardCaches(queryClient, boardId, (board) => removeColumn(board, columnId));
            await invalidate();
        },
    });

    const reorderMutation = useMutation({
        mutationFn: (orderedIds: number[]) =>
            reorderColumns(boardId, { ordered_ids: orderedIds }),
        onMutate: async (orderedIds) => {
            await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });
            const previousDetail = queryClient.getQueryData<Board>(boardKeys.detail(boardId));

            if (previousDetail) {
                const byId = new Map(previousDetail.columns.map((column) => [column.id, column]));
                const nextColumns = orderedIds
                    .map((id, position) => {
                        const column = byId.get(id);

                        return column ? { ...column, position } : null;
                    })
                    .filter((column): column is Column => column !== null);

                patchBoardCaches(queryClient, boardId, (board) => ({
                    ...board,
                    columns: nextColumns,
                }));
            }

            return { previousDetail };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousDetail) {
                queryClient.setQueryData(boardKeys.detail(boardId), context.previousDetail);
            }
        },
        onSuccess: (board) => {
            queryClient.setQueryData(boardKeys.detail(boardId), board);
        },
        onSettled: async () => {
            await invalidate();
        },
    });

    return {
        createColumn: createMutation,
        updateColumn: updateMutation,
        deleteColumn: deleteMutation,
        reorderColumns: reorderMutation,
    };
}
