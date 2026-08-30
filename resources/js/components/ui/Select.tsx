import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    error?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { className, error, children, ...props },
    ref,
) {
    return (
        <div className="relative">
            <select
                ref={ref}
                className={cn(
                    'h-10 w-full appearance-none rounded-lg border bg-surface-raised px-3 pr-9 text-sm text-foreground shadow-sm motion-safe-transition focus-visible:outline-none',
                    error ? 'border-danger' : 'border-border focus-visible:border-accent',
                    className,
                )}
                {...props}
            >
                {children}
            </select>
            <ChevronDown
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted"
            />
        </div>
    );
});
