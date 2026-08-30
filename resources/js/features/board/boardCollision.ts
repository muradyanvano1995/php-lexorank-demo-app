import {
    closestCenter,
    pointerWithin,
    type CollisionDetection,
    type Collision,
} from '@dnd-kit/core';

export function isColumnDroppableId(id: string | number): boolean {
    return String(id).startsWith('column-');
}

export function isColumnSortableId(id: string | number): boolean {
    const value = String(id);

    return value.startsWith('column-') && !value.startsWith('column-drop-');
}

/**
 * Among concurrent collisions, prefer a task over its parent column droppable.
 * Empty columns only expose the column id — that still wins via pointerWithin.
 */
export function preferTaskOverColumn(collisions: Collision[]): Collision[] {
    if (collisions.length === 0) {
        return collisions;
    }

    const taskHit = collisions.find((hit) => !isColumnDroppableId(hit.id));

    if (taskHit) {
        return [taskHit];
    }

    return [collisions[0]];
}

function preferColumnSortable(collisions: Collision[]): Collision[] {
    const columnHits = collisions.filter((hit) => isColumnDroppableId(hit.id));

    if (columnHits.length === 0) {
        return [];
    }

    const sortable = columnHits.find((hit) => isColumnSortableId(hit.id));

    return [sortable ?? columnHits[0]];
}

/**
 * Empty columns need pointer-within for tasks. While dragging a column, ignore
 * nested task hits so column order does not oscillate into an update loop.
 */
export const boardCollisionDetection: CollisionDetection = (args) => {
    const activeType = args.active.data.current?.type;
    const pointerHits = pointerWithin(args);
    const baseHits = pointerHits.length > 0 ? pointerHits : closestCenter(args);

    if (activeType === 'column') {
        return preferColumnSortable(baseHits);
    }

    if (pointerHits.length > 0) {
        return preferTaskOverColumn(pointerHits);
    }

    return closestCenter(args);
};
