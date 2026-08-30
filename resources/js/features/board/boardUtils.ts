import type { BoardFiltersState, TaskPriority } from '@/types';

export function filterTasks<
    T extends {
        title: string;
        description: string | null;
        assignee_name: string | null;
        priority: TaskPriority;
    },
>(tasks: T[], filters: BoardFiltersState): T[] {
    const query = filters.search.trim().toLowerCase();

    return tasks.filter((task) => {
        const matchesPriority =
            filters.priorities.length === 0 || filters.priorities.includes(task.priority);

        if (!matchesPriority) {
            return false;
        }

        if (!query) {
            return true;
        }

        const haystack = [task.title, task.description ?? '', task.assignee_name ?? '']
            .join(' ')
            .toLowerCase();

        return haystack.includes(query);
    });
}

export function countVisibleTasks(
    columns: Array<{ tasks: Parameters<typeof filterTasks>[0] }>,
    filters: BoardFiltersState,
): number {
    return columns.reduce((total, column) => total + filterTasks(column.tasks, filters).length, 0);
}

export function countTotalTasks(columns: Array<{ tasks: unknown[] }>): number {
    return columns.reduce((total, column) => total + column.tasks.length, 0);
}
