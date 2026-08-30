import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { className, error, ...props },
    ref,
) {
    return (
        <input
            ref={ref}
            className={cn(
                'h-10 w-full rounded-lg border bg-surface-raised px-3 text-sm text-foreground shadow-sm motion-safe-transition placeholder:text-muted focus-visible:outline-none',
                error ? 'border-danger' : 'border-border focus-visible:border-accent',
                className,
            )}
            {...props}
        />
    );
});
