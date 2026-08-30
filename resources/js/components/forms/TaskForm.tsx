import { rules, useForm, ValidationMode } from '@muradyanvano/use-form';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ApiError } from '@/api/client';
import { mapServerErrors } from '@/lib/serverErrors';
import type { Task, TaskFormValues, TaskPriority } from '@/types';

const priorityOptions: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export type TaskFormProps = {
    mode: 'create' | 'edit';
    initialTask?: Task;
    submitting?: boolean;
    onSubmit: (values: TaskFormValues) => Promise<void>;
    onCancel?: () => void;
};

function toFormValues(task?: Task): TaskFormValues {
    return {
        title: task?.title ?? '',
        description: task?.description ?? '',
        priority: task?.priority ?? 'medium',
        assigneeName: task?.assignee_name ?? '',
        dueDate: task?.due_date ?? '',
    };
}

export function TaskForm({
    mode,
    initialTask,
    submitting = false,
    onSubmit,
    onCancel,
}: TaskFormProps) {
    const form = useForm<TaskFormValues>({
        defaultValues: toFormValues(initialTask),
        mode: ValidationMode.OnBlur,
        rules: {
            title: [rules.required(), rules.minLength(3), rules.maxLength(160)],
            description: [rules.maxLength(5000)],
            assigneeName: [rules.maxLength(120)],
        },
        onSubmit: async (values, helpers) => {
            try {
                await onSubmit(values);
            } catch (error) {
                if (error instanceof ApiError && error.body?.errors) {
                    helpers.setErrors(mapServerErrors<TaskFormValues>(error.body.errors), {
                        source: 'server',
                    });
                    return;
                }

                helpers.setSubmitError(
                    error instanceof Error ? error.message : 'Something went wrong.',
                );
            }
        },
    });

    useEffect(() => {
        form.reset(toFormValues(initialTask));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when task identity changes
    }, [initialTask?.id]);

    return (
        <>
            <form
                noValidate
                onSubmit={(event) => {
                    void form.handleSubmit(event);
                }}
                className="space-y-4"
            >
                <div>
                    <label
                        htmlFor={form.getFieldId('title')}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Title
                    </label>
                    <Input {...form.register('title')} error={Boolean(form.errors.title)} />
                    {form.errors.title ? (
                        <p
                            id={form.getErrorId('title')}
                            className="mt-1 text-sm text-danger"
                            role="alert"
                        >
                            {form.errors.title}
                        </p>
                    ) : null}
                </div>

                <div>
                    <label
                        htmlFor={form.getFieldId('description')}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Description
                    </label>
                    <Textarea
                        {...form.register('description')}
                        error={Boolean(form.errors.description)}
                    />
                    {form.errors.description ? (
                        <p
                            id={form.getErrorId('description')}
                            className="mt-1 text-sm text-danger"
                            role="alert"
                        >
                            {form.errors.description}
                        </p>
                    ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor={form.getFieldId('priority')}
                            className="mb-1.5 block text-sm font-medium"
                        >
                            Priority
                        </label>
                        <Select {...form.register('priority')}>
                            {priorityOptions.map((priority) => (
                                <option key={priority} value={priority}>
                                    {priority}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label
                            htmlFor={form.getFieldId('assigneeName')}
                            className="mb-1.5 block text-sm font-medium"
                        >
                            Assignee
                        </label>
                        <Input
                            {...form.register('assigneeName')}
                            error={Boolean(form.errors.assigneeName)}
                            placeholder="Optional"
                        />
                        {form.errors.assigneeName ? (
                            <p
                                id={form.getErrorId('assigneeName')}
                                className="mt-1 text-sm text-danger"
                                role="alert"
                            >
                                {form.errors.assigneeName}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div>
                    <label
                        htmlFor={form.getFieldId('dueDate')}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Due date
                    </label>
                    <Input
                        {...form.register('dueDate', { type: 'text' })}
                        type="date"
                        error={Boolean(form.errors.dueDate)}
                    />
                    {form.errors.dueDate ? (
                        <p
                            id={form.getErrorId('dueDate')}
                            className="mt-1 text-sm text-danger"
                            role="alert"
                        >
                            {form.errors.dueDate}
                        </p>
                    ) : null}
                </div>

                {form.submitError ? (
                    <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                        {form.submitError}
                    </p>
                ) : null}

                <div className="flex justify-end gap-2 pt-2">
                    {onCancel ? (
                        <Button type="button" variant="secondary" onClick={onCancel}>
                            Cancel
                        </Button>
                    ) : null}
                    <Button type="submit" disabled={submitting || form.isSubmitting}>
                        {(submitting || form.isSubmitting) && (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        )}
                        {mode === 'create' ? 'Create task' : 'Save changes'}
                    </Button>
                </div>
            </form>
        </>
    );
}
