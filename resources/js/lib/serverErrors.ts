import type { LaravelValidationErrors } from '@/types';

const FIELD_ALIASES: Record<string, string> = {
    assignee_name: 'assigneeName',
    due_date: 'dueDate',
};

export function snakeToCamelField(field: string): string {
    if (field in FIELD_ALIASES) {
        return FIELD_ALIASES[field];
    }

    return field.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

export function mapServerErrors<T extends Record<string, unknown>>(
    errors: LaravelValidationErrors | undefined,
): Partial<Record<keyof T & string, string>> {
    if (!errors) {
        return {};
    }

    const mapped: Partial<Record<keyof T & string, string>> = {};

    for (const [field, messages] of Object.entries(errors)) {
        const key = snakeToCamelField(field) as keyof T & string;
        const message = messages.find((entry) => entry.trim().length > 0);

        if (message) {
            mapped[key] = message;
        }
    }

    return mapped;
}
