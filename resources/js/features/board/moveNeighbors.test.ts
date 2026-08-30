import { describe, expect, it } from 'vitest';
import {
    computeMoveNeighbors,
    neighborsFromOrderedTasks,
    sameNeighbors,
} from '@/features/board/moveNeighbors';
import type { Task } from '@/types';

function task(id: number, columnId = 1): Task {
    return {
        id,
        column_id: columnId,
        title: `Task ${id}`,
        description: null,
        priority: 'medium',
        assignee_name: null,
        due_date: null,
        rank: `0|${id}`,
        rank_length: 4,
        bucket: '0',
        created_at: null,
        updated_at: null,
    };
}

describe('neighborsFromOrderedTasks', () => {
    it('reads neighbors after a downward arrayMove', () => {
        // [1,2,3] -> move 2 after 3 => [1,3,2]
        const ordered = [task(1), task(3), task(2)];

        expect(neighborsFromOrderedTasks(ordered, 2)).toEqual({ before_id: 3 });
    });

    it('reads neighbors after an upward arrayMove', () => {
        // [1,2,3] -> move 3 before 1 => [3,1,2]
        const ordered = [task(3), task(1), task(2)];

        expect(neighborsFromOrderedTasks(ordered, 3)).toEqual({ after_id: 1 });
    });

    it('reads between neighbors', () => {
        const ordered = [task(1), task(3), task(2), task(4)];

        expect(neighborsFromOrderedTasks(ordered, 2)).toEqual({
            before_id: 3,
            after_id: 4,
        });
    });

    it('detects unchanged neighbor pairs', () => {
        expect(sameNeighbors({ before_id: 1, after_id: 3 }, { before_id: 1, after_id: 3 })).toBe(
            true,
        );
        expect(sameNeighbors({ before_id: 1 }, { before_id: 3 })).toBe(false);
    });
});

describe('computeMoveNeighbors', () => {
    const tasks = [task(1), task(2), task(3)];

    it('computes start end and between neighbors without inventing ranks', () => {
        expect(computeMoveNeighbors(tasks, 99, 0)).toEqual({ after_id: 1 });
        expect(computeMoveNeighbors(tasks, 99, 3)).toEqual({ before_id: 3 });
        expect(computeMoveNeighbors(tasks, 2, 1)).toEqual({ before_id: 1, after_id: 3 });
    });
});
