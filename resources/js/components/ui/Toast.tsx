import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/cn';

const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
} as const;

const variantStyles = {
    success: 'border-success/30 bg-success/10 text-success',
    error: 'border-danger/30 bg-danger/10 text-danger',
    info: 'border-accent/30 bg-accent-muted text-accent',
} as const;

function ToastViewport() {
    const { toasts, dismiss } = useToast();

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-full max-w-sm flex-col gap-2"
        >
            {toasts.map((toast) => {
                const Icon = icons[toast.variant];

                return (
                    <div
                        key={toast.id}
                        className={cn(
                            'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-overlay backdrop-blur-sm',
                            variantStyles[toast.variant],
                        )}
                    >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{toast.title}</p>
                            {toast.description ? (
                                <p className="mt-1 text-sm text-muted">{toast.description}</p>
                            ) : null}
                        </div>
                        <button
                            type="button"
                            aria-label="Dismiss notification"
                            className="rounded-md p-1 text-muted hover:bg-surface-raised/60"
                            onClick={() => dismiss(toast.id)}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export function ToastShell({ children }: { children: ReactNode }) {
    return (
        <ToastProvider>
            {children}
            <ToastViewport />
        </ToastProvider>
    );
}
