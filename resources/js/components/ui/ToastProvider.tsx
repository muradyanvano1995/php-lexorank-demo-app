import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ToastContext, type ToastContextValue } from '@/hooks/useToast';
import type { ToastItem } from '@/hooks/toast-types';

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback(
        (toast: Omit<ToastItem, 'id'>) => {
            const id = crypto.randomUUID();
            setToasts((current) => [...current, { ...toast, id }]);

            window.setTimeout(() => dismiss(id), 4500);
        },
        [dismiss],
    );

    const value = useMemo<ToastContextValue>(
        () => ({ toasts, push, dismiss }),
        [toasts, push, dismiss],
    );

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
