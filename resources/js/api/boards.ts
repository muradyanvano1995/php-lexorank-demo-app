import { apiRequest, unwrapCollection, unwrapResource } from '@/api/client';
import type { ApiResource } from '@/api/client';
import type { Board } from '@/types';

export async function fetchBoards(): Promise<Board[]> {
    const response = await apiRequest<ApiResource<Board[]>>('/boards');

    return unwrapCollection(response);
}

export async function fetchBoard(id: number): Promise<Board> {
    const response = await apiRequest<ApiResource<Board>>(`/boards/${id}`);

    return unwrapResource(response);
}

export const boardKeys = {
    all: ['boards'] as const,
    detail: (id: number) => ['boards', id] as const,
};
