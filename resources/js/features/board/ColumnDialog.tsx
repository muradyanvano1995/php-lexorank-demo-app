import { Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { ColumnForm } from '@/components/forms/ColumnForm';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Dialog } from '@/components/ui/Dialog';
import type { Column } from '@/types';

export type ColumnDialogState =
    | { open: false }
    | { open: true; mode: 'create' }
    | { open: true; mode: 'edit'; column: Column };

type OpenColumnDialogState = Exclude<ColumnDialogState, { open: false }>;

export type ColumnDialogProps = {
    state: ColumnDialogState;
    onOpenChange: (open: boolean) => void;
    submitting?: boolean;
    onCreate: (name: string) => Promise<void>;
    onUpdate: (column: Column, name: string) => Promise<void>;
    onDelete?: (column: Column) => Promise<void>;
};

export function ColumnDialog({
    state,
    onOpenChange,
    submitting = false,
    onCreate,
    onUpdate,
    onDelete,
}: ColumnDialogProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const cached = useRef<OpenColumnDialogState | null>(null);

    if (state.open) {
        cached.current = state;
    }

    const content = cached.current;

    if (!content) {
        return null;
    }

    const isEdit = content.mode === 'edit';
    const taskCount = isEdit ? content.column.tasks.length : 0;

    return (
        <>
            <Dialog
                open={state.open}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setConfirmDelete(false);
                    }

                    onOpenChange(nextOpen);
                }}
                title={isEdit ? 'Edit column' : 'New column'}
                description={isEdit ? 'Rename this column.' : 'Add a column to the board.'}
                headerActions={
                    isEdit && onDelete ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-danger hover:bg-danger/10 hover:text-danger"
                            aria-label="Delete column"
                            disabled={submitting}
                            onClick={() => setConfirmDelete(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : undefined
                }
            >
                <ColumnForm
                    mode={content.mode}
                    initialName={isEdit ? content.column.name : ''}
                    submitting={submitting}
                    onCancel={() => onOpenChange(false)}
                    onSubmit={async (values) => {
                        if (content.mode === 'create') {
                            await onCreate(values.name);
                        } else {
                            await onUpdate(content.column, values.name);
                        }

                        onOpenChange(false);
                    }}
                />
            </Dialog>

            {isEdit && onDelete ? (
                <ConfirmDialog
                    open={state.open && confirmDelete}
                    title="Delete column?"
                    description={
                        taskCount === 0
                            ? `“${content.column.name}” will be permanently removed.`
                            : `“${content.column.name}” and all ${taskCount} task${taskCount === 1 ? '' : 's'} in it will be permanently removed.`
                    }
                    confirmLabel="Delete column"
                    submitting={submitting}
                    onOpenChange={setConfirmDelete}
                    onConfirm={async () => {
                        await onDelete(content.column);
                        setConfirmDelete(false);
                        onOpenChange(false);
                    }}
                />
            ) : null}
        </>
    );
}
