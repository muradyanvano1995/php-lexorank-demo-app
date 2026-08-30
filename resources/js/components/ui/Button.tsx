import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const variants = {
    primary: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm disabled:opacity-50',
    secondary:
        'bg-surface-raised text-foreground border border-border hover:bg-accent-muted/40 disabled:opacity-50',
    ghost: 'text-foreground hover:bg-accent-muted/50 disabled:opacity-50',
    danger: 'bg-danger/10 text-danger hover:bg-danger/20 disabled:opacity-50',
} as const;

const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
    icon: 'h-9 w-9 shrink-0 p-0',
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof variants;
    size?: keyof typeof sizes;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className, variant = 'primary', size = 'md', type = 'button', ...props },
    ref,
) {
    return (
        <button
            ref={ref}
            type={type}
            className={cn(
                'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium motion-safe-transition focus-visible:outline-none disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        />
    );
});
