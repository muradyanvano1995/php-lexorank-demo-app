import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ParseRankForm } from '@/components/forms/playground/ParseRankForm';

describe('ParseRankForm', () => {
    it('submits rank strings through the playground callback', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue({
            rank: '0|hzzzzz:',
            bucket: '0',
            length: 10,
            is_min: false,
            is_max: false,
        });
        const onResult = vi.fn();

        render(<ParseRankForm onSubmit={onSubmit} onResult={onResult} />);

        await user.type(screen.getByLabelText(/rank string/i), '0|hzzzzz:');
        await user.click(screen.getByRole('button', { name: /parse rank/i }));

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('0|hzzzzz:'));
        expect(onResult).toHaveBeenCalled();
    });
});
