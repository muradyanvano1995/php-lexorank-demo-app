import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RebalanceConfirmForm } from '@/components/forms/RebalanceConfirmForm';

describe('RebalanceConfirmForm', () => {
    it('requires REBALANCE confirmation text', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<RebalanceConfirmForm columnName="Backlog" onSubmit={onSubmit} />);

        await user.type(screen.getByLabelText(/confirmation/i), 'nope');
        await user.click(screen.getByRole('button', { name: /rebalance column/i }));

        await waitFor(() => {
            expect(screen.getByText(/type REBALANCE/i)).toBeInTheDocument();
        });
        expect(onSubmit).not.toHaveBeenCalled();

        await user.clear(screen.getByLabelText(/confirmation/i));
        await user.type(screen.getByLabelText(/confirmation/i), 'REBALANCE');
        await user.click(screen.getByRole('button', { name: /rebalance column/i }));

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('REBALANCE'));
    });
});
