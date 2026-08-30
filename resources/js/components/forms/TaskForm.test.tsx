import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskForm } from '@/components/forms/TaskForm';
import { ApiError } from '@/api/client';
import type { Task } from '@/types';

describe('TaskForm', () => {
    it('registers fields with accessible ids and validates required title', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(<TaskForm mode="create" onSubmit={onSubmit} />);

        const title = screen.getByLabelText(/title/i);
        expect(title).toHaveAttribute('id');
        expect(title.id.length).toBeGreaterThan(0);

        await user.click(screen.getByRole('button', { name: /create task|save changes/i }));

        await waitFor(() => {
            expect(screen.getByText(/required|at least/i)).toBeInTheDocument();
        });
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('prevents duplicate submit while submitting and shows submitting state', async () => {
        const user = userEvent.setup();
        let resolveSubmit: (() => void) | undefined;
        const onSubmit = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveSubmit = resolve;
                }),
        );

        render(<TaskForm mode="create" onSubmit={onSubmit} />);

        await user.type(screen.getByLabelText(/title/i), 'Valid task title');
        const button = screen.getByRole('button', { name: /create task/i });
        await user.click(button);
        await user.click(button);

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        expect(button).toBeDisabled();

        resolveSubmit?.();
        await waitFor(() => expect(button).not.toBeDisabled());
    });

    it('maps laravel server errors and preserves values on failure', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockRejectedValue(
            new ApiError('The given data was invalid.', 422, {
                message: 'The given data was invalid.',
                errors: {
                    title: ['The title has already been taken.'],
                    assignee_name: ['Assignee is invalid.'],
                },
            }),
        );

        render(<TaskForm mode="create" onSubmit={onSubmit} />);

        await user.type(screen.getByLabelText(/title/i), 'Duplicate title here');
        await user.type(screen.getByLabelText(/assignee/i), 'Ava');
        await user.click(screen.getByRole('button', { name: /create task/i }));

        await waitFor(() => {
            expect(screen.getByText('The title has already been taken.')).toBeInTheDocument();
            expect(screen.getByText('Assignee is invalid.')).toBeInTheDocument();
        });

        expect(screen.getByLabelText(/title/i)).toHaveValue('Duplicate title here');
        expect(screen.getByLabelText(/assignee/i)).toHaveValue('Ava');
    });

    it('loads edit default values', () => {
        const task: Task = {
            id: 9,
            column_id: 1,
            title: 'Existing task',
            description: 'Desc',
            priority: 'urgent',
            assignee_name: 'Noah',
            due_date: '2030-02-01',
            rank: '0|hzzzzz:',
            rank_length: 10,
            bucket: '0',
            created_at: null,
            updated_at: null,
        };

        render(<TaskForm mode="edit" initialTask={task} onSubmit={vi.fn()} />);

        expect(screen.getByLabelText(/title/i)).toHaveValue('Existing task');
        expect(screen.getByLabelText(/description/i)).toHaveValue('Desc');
        expect(screen.getByLabelText(/assignee/i)).toHaveValue('Noah');
        expect(screen.getByLabelText(/due date/i)).toHaveValue('2030-02-01');
        expect(screen.getByLabelText(/priority/i)).toHaveValue('urgent');
    });

    it('submits valid values', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<TaskForm mode="create" onSubmit={onSubmit} />);

        await user.type(screen.getByLabelText(/title/i), 'Ship the board');
        await user.click(screen.getByRole('button', { name: /create task/i }));

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        expect(onSubmit.mock.calls[0][0].title).toBe('Ship the board');
        expect(onSubmit.mock.calls[0][0].priority).toBe('medium');
    });
});
