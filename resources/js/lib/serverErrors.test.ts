import { describe, expect, it } from 'vitest';
import { mapServerErrors, snakeToCamelField } from '@/lib/serverErrors';

describe('serverErrors', () => {
    it('maps laravel snake_case fields to form camelCase', () => {
        expect(snakeToCamelField('assignee_name')).toBe('assigneeName');
        expect(snakeToCamelField('due_date')).toBe('dueDate');
        expect(snakeToCamelField('title')).toBe('title');

        const mapped = mapServerErrors<{ title: string; assigneeName: string; dueDate: string }>({
            title: ['The title field is required.'],
            assignee_name: ['Too long.'],
            due_date: ['Invalid date.'],
        });

        expect(mapped).toEqual({
            title: 'The title field is required.',
            assigneeName: 'Too long.',
            dueDate: 'Invalid date.',
        });
    });
});
