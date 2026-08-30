import { describe, expect, it } from 'vitest';
import { isColumnDroppableId, isColumnSortableId, preferTaskOverColumn } from './boardCollision';
import type { Collision } from '@dnd-kit/core';

function hit(id: string | number): Collision {
    return { id };
}

describe('boardCollision helpers', () => {
    it('detects column droppable ids', () => {
        expect(isColumnDroppableId('column-3')).toBe(true);
        expect(isColumnDroppableId('column-drop-3')).toBe(true);
        expect(isColumnDroppableId(42)).toBe(false);
    });

    it('detects column sortable ids', () => {
        expect(isColumnSortableId('column-3')).toBe(true);
        expect(isColumnSortableId('column-drop-3')).toBe(false);
    });

    it('prefers a task collision over a parent column', () => {
        expect(preferTaskOverColumn([hit('column-1'), hit(7)]).map((entry) => entry.id)).toEqual([
            7,
        ]);
    });

    it('keeps the column collision when the destination is empty', () => {
        expect(preferTaskOverColumn([hit('column-2')]).map((entry) => entry.id)).toEqual([
            'column-2',
        ]);
    });
});
