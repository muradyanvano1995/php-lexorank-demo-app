import { useForm, ValidationMode } from '@muradyanvano/use-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/api/client';
import { mapServerErrors } from '@/lib/serverErrors';
import type { LexoRankBetweenResult } from '@/types';

type BetweenFormValues = {
    lower: string;
    upper: string;
};

export type BetweenRankFormProps = {
    onSubmit: (lower: string, upper: string) => Promise<LexoRankBetweenResult>;
    onResult: (result: LexoRankBetweenResult) => void;
};

export function BetweenRankForm({ onSubmit, onResult }: BetweenRankFormProps) {
    const form = useForm<BetweenFormValues>({
        defaultValues: { lower: '', upper: '' },
        mode: ValidationMode.OnBlur,
        onSubmit: async (values, helpers) => {
            try {
                const result = await onSubmit(values.lower.trim(), values.upper.trim());
                onResult(result);
            } catch (error) {
                if (error instanceof ApiError && error.body?.errors) {
                    helpers.setErrors(mapServerErrors<BetweenFormValues>(error.body.errors), {
                        source: 'server',
                    });
                    return;
                }

                helpers.setSubmitError(error instanceof Error ? error.message : 'Between failed.');
            }
        },
    });

    return (
        <form
            noValidate
            onSubmit={(event) => {
                void form.handleSubmit(event);
            }}
            className="space-y-4"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor={form.getFieldId('lower')}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Lower bound
                    </label>
                    <Input
                        {...form.register('lower')}
                        placeholder="Optional"
                        error={Boolean(form.errors.lower)}
                    />
                    {form.errors.lower ? (
                        <p
                            id={form.getErrorId('lower')}
                            className="mt-1 text-sm text-danger"
                            role="alert"
                        >
                            {form.errors.lower}
                        </p>
                    ) : null}
                </div>
                <div>
                    <label
                        htmlFor={form.getFieldId('upper')}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Upper bound
                    </label>
                    <Input
                        {...form.register('upper')}
                        placeholder="Optional"
                        error={Boolean(form.errors.upper)}
                    />
                    {form.errors.upper ? (
                        <p
                            id={form.getErrorId('upper')}
                            className="mt-1 text-sm text-danger"
                            role="alert"
                        >
                            {form.errors.upper}
                        </p>
                    ) : null}
                </div>
            </div>
            {form.submitError ? (
                <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {form.submitError}
                </p>
            ) : null}
            <Button type="submit" disabled={form.isSubmitting}>
                {form.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Compute between
            </Button>
        </form>
    );
}
