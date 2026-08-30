import { Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { TaskForm } from '@/components/forms/TaskForm';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Dialog } from '@/components/ui/Dialog';
import type { Task, TaskFormValues } from '@/types';

export type TaskDialogMode = 'create' | 'edit';

export type TaskDialogState =
    | { open: false }
    | {
          open: true;
          mode: 'create';
          columnId: number;
      }
    | {
          open: true;
          mode: 'edit';
          task: Task;
      };

type OpenTaskDialogState = Exclude<TaskDialogState, { open: false }>;

export type TaskDialogProps = {
    state: TaskDialogState;
    onOpenChange: (open: boolean) => void;
    submitting?: boolean;
    onCreate: (columnId: number, values: TaskFormValues) => Promise<void>;
    onUpdate: (task: Task, values: TaskFormValues) => Promise<void>;
    onDelete?: (task: Task) => Promise<void>;
};

export function TaskDialog({
    state,
    onOpenChange,
    submitting = false,
    onCreate,
    onUpdate,
    onDelete,
}: TaskDialogProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const cached = useRef<OpenTaskDialogState | null>(null);

    if (state.open) {
        cached.current = state;
    }

    const content = cached.current;

    if (!content) {
        return null;
    }

    const isEdit = content.mode === 'edit';
    const title = isEdit ? 'Edit task' : 'New task';
    const description = isEdit ? 'Update task details.' : 'Add a task to this column.';

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
                title={title}
                description={description}
                headerActions={
                    isEdit && onDelete ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-danger hover:bg-danger/10 hover:text-danger"
                            aria-label="Delete task"
                            disabled={submitting}
                            onClick={() => setConfirmDelete(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : undefined
                }
            >
                <TaskForm
                    mode={content.mode}
                    initialTask={isEdit ? content.task : undefined}
                    submitting={submitting}
                    onCancel={() => onOpenChange(false)}
                    onSubmit={async (values) => {
                        if (content.mode === 'create') {
                            await onCreate(content.columnId, values);
                        } else {
                            await onUpdate(content.task, values);
                        }

                        onOpenChange(false);
                    }}
                />
            </Dialog>

            {isEdit && onDelete ? (
                <ConfirmDialog
                    open={state.open && confirmDelete}
                    title="Delete task?"
                    description={`“${content.task.title}” will be permanently removed from the board.`}
                    confirmLabel="Delete task"
                    submitting={submitting}
                    onOpenChange={setConfirmDelete}
                    onConfirm={async () => {
                        await onDelete(content.task);
                        setConfirmDelete(false);
                        onOpenChange(false);
                    }}
                />
            ) : null}
        </>
    );
}
