import type { TaskPriority } from '@/types';
import { cn } from '@/lib/cn';

const priorityStyles: Record<TaskPriority, string> = {
    low: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
    medium: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
    high: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    urgent: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
};

export type BadgeProps = {
    children: React.ReactNode;
    priority?: TaskPriority;
    className?: string;
};

export function Badge({ children, priority, className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                priority ? priorityStyles[priority] : 'bg-accent-muted text-accent',
                className,
            )}
        >
            {children}
        </span>
    );
}
