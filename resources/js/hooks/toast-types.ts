export type ToastVariant = 'success' | 'error' | 'info';

export type ToastItem = {
    id: string;
    title: string;
    description?: string;
    variant: ToastVariant;
};
