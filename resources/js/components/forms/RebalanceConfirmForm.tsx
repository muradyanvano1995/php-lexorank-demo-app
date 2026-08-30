import { rules, useForm, ValidationMode } from '@muradyanvano/use-form';
import { AppFormDevTools } from '@/components/forms/AppFormDevTools';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/api/client';
import { mapServerErrors } from '@/lib/serverErrors';

type RebalanceFormValues = {
    confirm: string;
};

export type RebalanceConfirmFormProps = {
    columnName: string;
    submitting?: boolean;
    onSubmit: (confirm: string) => Promise<void>;
    onCancel?: () => void;
};

export function RebalanceConfirmForm({
    columnName,
    submitting = false,
    onSubmit,
    onCancel,
}: RebalanceConfirmFormProps) {
    const form = useForm<RebalanceFormValues>({
        defaultValues: { confirm: '' },
        mode: ValidationMode.OnBlur,
        rules: {
            confirm: [
                rules.required(),
                rules.pattern(/^REBALANCE$/, 'Type REBALANCE to confirm this operation.'),
            ],
        },
        onSubmit: async (values, helpers) => {
            try {
                await onSubmit(values.confirm);
            } catch (error) {
                if (error instanceof ApiError && error.body?.errors) {
                    helpers.setErrors(mapServerErrors<RebalanceFormValues>(error.body.errors), {
                        source: 'server',
                    });
                    return;
                }

                helpers.setSubmitError(
                    error instanceof Error ? error.message : 'Rebalance failed.',
                );
            }
        },
    });

    return (
        <>
            <div className="mb-4 flex gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
                <p className="text-foreground">
                    Rebalancing <strong>{columnName}</strong> will rewrite ranks for every task in
                    the column. This cannot be undone.
                </p>
            </div>
            <form
                noValidate
                onSubmit={(event) => {
                    void form.handleSubmit(event);
                }}
                className="space-y-4"
            >
                <div>
                    <label
                        htmlFor={form.getFieldId('confirm')}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Confirmation
                    </label>
                    <Input
                        {...form.register('confirm')}
                        placeholder="REBALANCE"
                        autoComplete="off"
                        error={Boolean(form.errors.confirm)}
                    />
                    {form.errors.confirm ? (
                        <p
                            id={form.getErrorId('confirm')}
                            className="mt-1 text-sm text-danger"
                            role="alert"
                        >
                            {form.errors.confirm}
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
                    <Button
                        type="submit"
                        variant="danger"
                        disabled={submitting || form.isSubmitting}
                    >
                        {(submitting || form.isSubmitting) && (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        )}
                        Rebalance column
                    </Button>
                </div>
            </form>
            <AppFormDevTools control={form.control} />
        </>
    );
}
