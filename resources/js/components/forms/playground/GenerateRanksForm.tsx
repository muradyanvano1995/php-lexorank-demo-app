import { rules, useForm, ValidationMode } from '@muradyanvano/use-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ApiError } from '@/api/client';
import { mapServerErrors } from '@/lib/serverErrors';
import type { LexoRankGenerateResult } from '@/types';

type GenerateFormValues = {
    count: string;
    bucket: string;
};

export type GenerateRanksFormProps = {
    buckets: string[];
    onSubmit: (count: number, bucket?: string) => Promise<LexoRankGenerateResult>;
    onResult: (result: LexoRankGenerateResult) => void;
};

export function GenerateRanksForm({ buckets, onSubmit, onResult }: GenerateRanksFormProps) {
    const form = useForm<GenerateFormValues>({
        defaultValues: { count: '5', bucket: buckets[0] ?? '0' },
        mode: ValidationMode.OnBlur,
        rules: {
            count: [
                rules.required(),
                rules.custom((value) => {
                    const parsed = Number(value);

                    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
                        return 'Count must be an integer between 1 and 100.';
                    }

                    return undefined;
                }),
            ],
        },
        onSubmit: async (values, helpers) => {
            try {
                const result = await onSubmit(Number(values.count), values.bucket || undefined);
                onResult(result);
            } catch (error) {
                if (error instanceof ApiError && error.body?.errors) {
                    helpers.setErrors(mapServerErrors<GenerateFormValues>(error.body.errors), {
                        source: 'server',
                    });
                    return;
                }

                helpers.setSubmitError(error instanceof Error ? error.message : 'Generate failed.');
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
                        htmlFor={form.getFieldId('count')}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Count
                    </label>
                    <Input
                        {...form.register('count')}
                        type="number"
                        min={1}
                        max={100}
                        error={Boolean(form.errors.count)}
                    />
                    {form.errors.count ? (
                        <p
                            id={form.getErrorId('count')}
                            className="mt-1 text-sm text-danger"
                            role="alert"
                        >
                            {form.errors.count}
                        </p>
                    ) : null}
                </div>
                <div>
                    <label
                        htmlFor={form.getFieldId('bucket')}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Bucket
                    </label>
                    <Select {...form.register('bucket')}>
                        {buckets.map((bucket) => (
                            <option key={bucket} value={bucket}>
                                Bucket {bucket}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
            {form.submitError ? (
                <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {form.submitError}
                </p>
            ) : null}
            <Button type="submit" disabled={form.isSubmitting}>
                {form.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Generate ranks
            </Button>
        </form>
    );
}
