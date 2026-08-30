import { createContext, useContext } from 'react';
import type { ToastItem } from '@/hooks/toast-types';

export type ToastContextValue = {
    toasts: ToastItem[];
    push: (toast: Omit<ToastItem, 'id'>) => void;
    dismiss: (id: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }

    return context;
}
