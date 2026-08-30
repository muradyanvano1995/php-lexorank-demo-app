import { apiRequest, unwrapResource } from '@/api/client';
import type { ApiResource } from '@/api/client';
import type { Board, Column, CreateColumnPayload, UpdateColumnPayload } from '@/types';

export type { CreateColumnPayload, UpdateColumnPayload };

export type ReorderColumnsPayload = {
    ordered_ids: number[];
};

export async function createColumn(
    boardId: number,
    payload: CreateColumnPayload,
): Promise<Column> {
    const response = await apiRequest<ApiResource<Column>>(`/boards/${boardId}/columns`, {
        method: 'POST',
        body: payload,
    });

    return unwrapResource(response);
}

export async function updateColumn(
    columnId: number,
    payload: UpdateColumnPayload,
): Promise<Column> {
    const response = await apiRequest<ApiResource<Column>>(`/columns/${columnId}`, {
        method: 'PATCH',
        body: payload,
    });

    return unwrapResource(response);
}

export async function deleteColumn(columnId: number): Promise<void> {
    await apiRequest<void>(`/columns/${columnId}`, {
        method: 'DELETE',
    });
}

export async function reorderColumns(
    boardId: number,
    payload: ReorderColumnsPayload,
): Promise<Board> {
    const response = await apiRequest<ApiResource<Board>>(`/boards/${boardId}/columns/reorder`, {
        method: 'POST',
        body: payload,
    });

    return unwrapResource(response);
}
