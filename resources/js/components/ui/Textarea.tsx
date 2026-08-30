import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { className, error, ...props },
    ref,
) {
    return (
        <textarea
            ref={ref}
            className={cn(
                'min-h-24 w-full rounded-lg border bg-surface-raised px-3 py-2 text-sm text-foreground shadow-sm motion-safe-transition placeholder:text-muted focus-visible:outline-none',
                error ? 'border-danger' : 'border-border focus-visible:border-accent',
                className,
            )}
            {...props}
        />
    );
});
