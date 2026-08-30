import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import type { BoardFiltersState, TaskPriority } from '@/types';

const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

const priorityChipStyles: Record<TaskPriority, string> = {
    low: 'border-slate-300 bg-slate-500/12 text-slate-700 dark:border-slate-600 dark:text-slate-200',
    medium: 'border-sky-300 bg-sky-500/12 text-sky-800 dark:border-sky-600 dark:text-sky-200',
    high: 'border-amber-300 bg-amber-500/12 text-amber-800 dark:border-amber-600 dark:text-amber-200',
    urgent: 'border-rose-300 bg-rose-500/12 text-rose-800 dark:border-rose-600 dark:text-rose-200',
};

export type BoardFiltersProps = {
    filters: BoardFiltersState;
    onChange: (filters: BoardFiltersState) => void;
    visibleCount: number;
    totalCount: number;
};

function activeFilterCount(filters: BoardFiltersState): number {
    let count = 0;

    if (filters.search.trim() !== '') {
        count += 1;
    }

    if (filters.priorities.length > 0 && filters.priorities.length < priorities.length) {
        count += 1;
    }

    return count;
}

export function BoardFilters({ filters, onChange, visibleCount, totalCount }: BoardFiltersProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const panelId = useId();
    const activeCount = activeFilterCount(filters);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onPointerDown = (event: MouseEvent): void => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const togglePriority = (priority: TaskPriority): void => {
        if (filters.priorities.length === 0) {
            onChange({ ...filters, priorities: [priority] });
            return;
        }

        const active = filters.priorities.includes(priority);
        const prioritiesNext = active
            ? filters.priorities.filter((entry) => entry !== priority)
            : [...filters.priorities, priority];

        onChange({ ...filters, priorities: prioritiesNext });
    };

    return (
        <div ref={rootRef} className="relative shrink-0">
            <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-expanded={open}
                aria-controls={panelId}
                aria-haspopup="dialog"
                className={cn(activeCount > 0 && 'border-accent/40 bg-accent-muted/30')}
                onClick={() => setOpen((current) => !current)}
            >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">Filters</span>
                {activeCount > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-foreground">
                        {activeCount}
                    </span>
                ) : null}
            </Button>

            {open ? (
                <div
                    id={panelId}
                    role="dialog"
                    aria-label="Board filters"
                    className="absolute top-full right-0 z-30 mt-2 w-[min(calc(100vw-2rem),22rem)] rounded-xl border border-border bg-surface-overlay p-4 shadow-overlay"
                >
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-sm text-muted">
                            Showing {visibleCount} of {totalCount}
                        </p>
                        {activeCount > 0 ? (
                            <button
                                type="button"
                                className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-muted hover:text-foreground"
                                onClick={() => onChange({ search: '', priorities: [] })}
                            >
                                <X className="h-3 w-3" aria-hidden />
                                Clear
                            </button>
                        ) : null}
                    </div>

                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
                            aria-hidden
                        />
                        <Input
                            aria-label="Search tasks"
                            className="pl-9"
                            placeholder="Search title, assignee…"
                            value={filters.search}
                            onChange={(event) =>
                                onChange({ ...filters, search: event.target.value })
                            }
                        />
                    </div>

                    <div className="mt-3">
                        <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                            Priority
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {priorities.map((priority) => {
                                const active =
                                    filters.priorities.length === 0 ||
                                    filters.priorities.includes(priority);

                                return (
                                    <button
                                        key={priority}
                                        type="button"
                                        aria-pressed={active}
                                        className={cn(
                                            'inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-xs font-medium capitalize motion-safe-transition',
                                            priorityChipStyles[priority],
                                            active
                                                ? 'opacity-100 shadow-sm'
                                                : 'opacity-40 hover:opacity-70',
                                        )}
                                        onClick={() => togglePriority(priority)}
                                    >
                                        {priority}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
