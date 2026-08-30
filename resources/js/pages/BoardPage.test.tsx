import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BoardPage } from '@/pages/BoardPage';
import type { Board } from '@/types';
import { ToastProvider } from '@/components/ui/ToastProvider';

const board: Board = {
    id: 1,
    name: 'Product Delivery',
    description: 'Demo',
    created_at: null,
    updated_at: null,
    columns: [
        {
            id: 10,
            board_id: 1,
            name: 'Backlog',
            position: 0,
            created_at: null,
            updated_at: null,
            tasks: [
                {
                    id: 100,
                    column_id: 10,
                    title: 'Refine onboarding checklist',
                    description: null,
                    priority: 'medium',
                    assignee_name: 'Ava',
                    due_date: null,
                    rank: '0|100000:',
                    rank_length: 10,
                    bucket: '0',
                    created_at: null,
                    updated_at: null,
                },
            ],
        },
    ],
};

vi.mock('@/api/boards', async () => {
    const actual = await vi.importActual<typeof import('@/api/boards')>('@/api/boards');

    return {
        ...actual,
        fetchBoards: vi.fn(async () => [board]),
        fetchBoard: vi.fn(async () => board),
    };
});

function renderBoardPage() {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return render(
        <QueryClientProvider client={client}>
            <ToastProvider>
                <MemoryRouter>
                    <BoardPage />
                </MemoryRouter>
            </ToastProvider>
        </QueryClientProvider>,
    );
}

describe('BoardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads and renders board tasks', async () => {
        renderBoardPage();

        await waitFor(() => {
            expect(screen.getByText('Refine onboarding checklist')).toBeInTheDocument();
        });
        expect(screen.getByText('Backlog')).toBeInTheDocument();
    });
});
