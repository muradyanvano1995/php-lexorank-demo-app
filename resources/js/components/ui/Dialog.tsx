import { X } from 'lucide-react';
import { useEffect, useId, useState, type AnimationEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/bodyScrollLock';
import { cn } from '@/lib/cn';

export type DialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    headerActions?: ReactNode;
    className?: string;
    overlayClassName?: string;
    /** When true, Escape closes only this dialog (for stacked confirmations). */
    captureEscape?: boolean;
};

export function Dialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    headerActions,
    className,
    overlayClassName,
    captureEscape = false,
}: DialogProps) {
    const titleId = useId();
    const descriptionId = useId();
    const [mounted, setMounted] = useState(open);
    const state = open ? 'open' : 'closed';

    useEffect(() => {
        if (open) {
            setMounted(true);
        }
    }, [open]);

    useEffect(() => {
        if (!mounted) {
            return;
        }

        lockBodyScroll();

        return () => {
            unlockBodyScroll();
        };
    }, [mounted]);

    useEffect(() => {
        if (!open || !mounted) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                if (captureEscape) {
                    event.stopImmediatePropagation();
                }

                onOpenChange(false);
            }
        };

        document.addEventListener('keydown', onKeyDown, captureEscape);

        return () => {
            document.removeEventListener('keydown', onKeyDown, captureEscape);
        };
    }, [open, mounted, onOpenChange, captureEscape]);

    const onPanelAnimationEnd = (event: AnimationEvent<HTMLDivElement>): void => {
        if (event.target !== event.currentTarget || open) {
            return;
        }

        setMounted(false);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div
            className={cn(
                'dialog-overlay fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 sm:items-center',
                overlayClassName,
            )}
            data-state={state}
        >
            <button
                type="button"
                aria-label="Close dialog overlay"
                className="fixed inset-0 bg-foreground/40 backdrop-blur-sm"
                tabIndex={open ? 0 : -1}
                onClick={() => onOpenChange(false)}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                data-state={state}
                onAnimationEnd={onPanelAnimationEnd}
                className={cn(
                    'dialog-panel relative z-10 my-auto flex w-full max-w-lg max-h-[min(100dvh-2rem,48rem)] flex-col rounded-xl border border-border bg-surface-overlay shadow-overlay',
                    className,
                )}
            >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border-subtle px-6 py-4">
                    <div className="min-w-0">
                        <h2
                            id={titleId}
                            className="font-display text-lg font-semibold text-foreground"
                        >
                            {title}
                        </h2>
                        {description ? (
                            <p id={descriptionId} className="mt-1 text-sm text-muted">
                                {description}
                            </p>
                        ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                        {headerActions}
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Close"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
                {footer ? (
                    <div className="flex shrink-0 justify-end gap-2 border-t border-border-subtle px-6 py-4">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
