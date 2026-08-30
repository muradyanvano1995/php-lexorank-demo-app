import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

export type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    submitting?: boolean;
    onConfirm: () => void | Promise<void>;
    onOpenChange: (open: boolean) => void;
};

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    submitting = false,
    onConfirm,
    onOpenChange,
}: ConfirmDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            overlayClassName="z-[60]"
            captureEscape
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={submitting}
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        disabled={submitting}
                        onClick={() => {
                            void onConfirm();
                        }}
                    >
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <p className="text-sm text-muted">This action cannot be undone.</p>
        </Dialog>
    );
}
