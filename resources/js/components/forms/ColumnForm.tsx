import { rules, useForm, ValidationMode } from '@muradyanvano/use-form';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mapServerErrors } from '@/lib/serverErrors';

export type ColumnFormValues = {
    name: string;
};

export type ColumnFormProps = {
    mode: 'create' | 'edit';
    initialName?: string;
    submitting?: boolean;
    onSubmit: (values: ColumnFormValues) => Promise<void>;
    onCancel?: () => void;
};

export function ColumnForm({
    mode,
    initialName = '',
    submitting = false,
    onSubmit,
    onCancel,
}: ColumnFormProps) {
    const form = useForm<ColumnFormValues>({
        defaultValues: { name: initialName },
        mode: ValidationMode.OnBlur,
        rules: {
            name: [rules.required(), rules.minLength(1), rules.maxLength(80)],
        },
        onSubmit: async (values, helpers) => {
            try {
                await onSubmit(values);
            } catch (error) {
                if (error instanceof ApiError && error.status === 422 && error.body?.errors) {
                    helpers.setErrors(mapServerErrors(error.body.errors), { source: 'server' });

                    return;
                }

                throw error;
            }
        },
    });

    useEffect(() => {
        form.reset({ name: initialName });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when editing a different column
    }, [initialName, mode]);

    return (
        <>
            <form className="space-y-4" onSubmit={form.handleSubmit} noValidate>
                <div className="space-y-1.5">
                    <label htmlFor={form.getFieldId('name')} className="text-sm font-medium">
                        Name
                    </label>
                    <Input
                        {...form.register('name')}
                        id={form.getFieldId('name')}
                        aria-invalid={Boolean(form.errors.name)}
                        aria-describedby={form.errors.name ? form.getErrorId('name') : undefined}
                        placeholder="e.g. Review"
                        autoFocus
                    />
                    {form.errors.name ? (
                        <p id={form.getErrorId('name')} className="text-sm text-danger">
                            {form.errors.name}
                        </p>
                    ) : null}
                </div>
                {form.submitError ? (
                    <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                        {form.submitError}
                    </p>
                ) : null}
                <div className="flex justify-end gap-2">
                    {onCancel ? (
                        <Button type="button" variant="secondary" onClick={onCancel}>
                            Cancel
                        </Button>
                    ) : null}
                    <Button type="submit" disabled={submitting || form.isSubmitting}>
                        {(submitting || form.isSubmitting) && (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        )}
                        {mode === 'create' ? 'Create column' : 'Save'}
                    </Button>
                </div>
            </form>
        </>
    );
}
