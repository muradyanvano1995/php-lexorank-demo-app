import type { LaravelErrorResponse } from '@/types';

export class ApiError extends Error {
    readonly status: number;
    readonly body: LaravelErrorResponse | null;

    constructor(message: string, status: number, body: LaravelErrorResponse | null = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

function getCsrfToken(): string {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    return token ?? '';
}

type RequestOptions = Omit<RequestInit, 'body'> & {
    body?: unknown;
    params?: Record<string, string | number | undefined | null>;
};

function buildUrl(path: string, params?: RequestOptions['params']): string {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, window.location.origin);

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, String(value));
            }
        }
    }

    return url.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, params, headers, ...rest } = options;
    const method = rest.method ?? (body !== undefined ? 'POST' : 'GET');
    const isJsonBody = body !== undefined && !(body instanceof FormData);

    const response = await fetch(buildUrl(`/api${path}`, params), {
        ...rest,
        method,
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
            ...(method !== 'GET' ? { 'X-CSRF-TOKEN': getCsrfToken() } : {}),
            ...headers,
        },
        body: isJsonBody ? JSON.stringify(body) : (body as BodyInit | undefined),
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json() : null;

    if (!response.ok) {
        const errorBody = payload as LaravelErrorResponse | null;
        const message = errorBody?.message ?? response.statusText ?? 'Request failed';

        throw new ApiError(message, response.status, errorBody);
    }

    return payload as T;
}

export type ApiResource<T> = { data: T };

export function unwrapResource<T>(payload: ApiResource<T> | T): T {
    if (payload !== null && typeof payload === 'object' && 'data' in payload) {
        return (payload as ApiResource<T>).data;
    }

    return payload as T;
}

export function unwrapCollection<T>(payload: ApiResource<T[]> | T[]): T[] {
    return unwrapResource(payload);
}
