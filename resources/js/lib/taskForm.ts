import type { TaskFormValues } from '@/types';

export function taskFormToPayload(values: TaskFormValues) {
    return {
        title: values.title.trim(),
        description: values.description.trim() || null,
        priority: values.priority,
        assignee_name: values.assigneeName.trim() || null,
        due_date: values.dueDate || null,
    };
}
