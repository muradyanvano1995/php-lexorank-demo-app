import { apiRequest, unwrapResource } from '@/api/client';
import type { ApiResource } from '@/api/client';
import type {
    ColumnDiagnostics,
    CreateTaskPayload,
    MoveTaskPayload,
    RebalanceResult,
    Task,
    UpdateTaskPayload,
} from '@/types';

export async function createTask(columnId: number, payload: CreateTaskPayload): Promise<Task> {
    const response = await apiRequest<ApiResource<Task>>(`/columns/${columnId}/tasks`, {
        method: 'POST',
        body: payload,
    });

    return unwrapResource(response);
}

export async function updateTask(taskId: number, payload: UpdateTaskPayload): Promise<Task> {
    const response = await apiRequest<ApiResource<Task>>(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: payload,
    });

    return unwrapResource(response);
}

export async function deleteTask(taskId: number): Promise<void> {
    await apiRequest<void>(`/tasks/${taskId}`, { method: 'DELETE' });
}

export async function moveTask(taskId: number, payload: MoveTaskPayload): Promise<Task> {
    const response = await apiRequest<ApiResource<Task>>(`/tasks/${taskId}/move`, {
        method: 'POST',
        body: payload,
    });

    return unwrapResource(response);
}

export async function rebalanceColumn(columnId: number, confirm: string): Promise<RebalanceResult> {
    return apiRequest<RebalanceResult>(`/columns/${columnId}/rebalance`, {
        method: 'POST',
        body: { confirm },
    });
}

export async function fetchColumnDiagnostics(
    columnId: number,
    softLength?: number,
): Promise<ColumnDiagnostics> {
    return apiRequest<ColumnDiagnostics>(`/columns/${columnId}/diagnostics`, {
        params: softLength !== undefined ? { soft_length: softLength } : undefined,
    });
}

export const taskKeys = {
    diagnostics: (columnId: number, softLength?: number) =>
        ['columns', columnId, 'diagnostics', softLength ?? 64] as const,
};
