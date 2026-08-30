import { rules, useForm, ValidationMode } from '@muradyanvano/use-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/api/client';
import { mapServerErrors } from '@/lib/serverErrors';
import type { LexoRankParseResult } from '@/types';

type ParseFormValues = {
    rank: string;
};

export type ParseRankFormProps = {
    onSubmit: (rank: string) => Promise<LexoRankParseResult>;
    onResult: (result: LexoRankParseResult) => void;
};

export function ParseRankForm({ onSubmit, onResult }: ParseRankFormProps) {
    const form = useForm<ParseFormValues>({
        defaultValues: { rank: '' },
        mode: ValidationMode.OnBlur,
        rules: {
            rank: [rules.required(), rules.minLength(1)],
        },
        onSubmit: async (values, helpers) => {
            try {
                const result = await onSubmit(values.rank.trim());
                onResult(result);
            } catch (error) {
                if (error instanceof ApiError && error.body?.errors) {
                    helpers.setErrors(mapServerErrors<ParseFormValues>(error.body.errors), {
                        source: 'server',
                    });
                    return;
                }

                helpers.setSubmitError(error instanceof Error ? error.message : 'Parse failed.');
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
            <div>
                <label
                    htmlFor={form.getFieldId('rank')}
                    className="mb-1.5 block text-sm font-medium"
                >
                    Rank string
                </label>
                <Input
                    {...form.register('rank')}
                    placeholder="0|hzzzzz:"
                    error={Boolean(form.errors.rank)}
                />
                {form.errors.rank ? (
                    <p
                        id={form.getErrorId('rank')}
                        className="mt-1 text-sm text-danger"
                        role="alert"
                    >
                        {form.errors.rank}
                    </p>
                ) : null}
            </div>
            {form.submitError ? (
                <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {form.submitError}
                </p>
            ) : null}
            <Button type="submit" disabled={form.isSubmitting}>
                {form.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Parse rank
            </Button>
        </form>
    );
}
