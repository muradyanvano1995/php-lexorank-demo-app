import { describe, expect, it } from 'vitest';
import { applyOptimisticMoveFixture } from './optimisticMove';

describe('optimistic move helpers', () => {
    it('moves a task across columns and can roll back to snapshot', () => {
        const { before, afterMove, restored } = applyOptimisticMoveFixture();

        expect(afterMove.columns[0].tasks.map((task) => task.id)).toEqual([1]);
        expect(afterMove.columns[1].tasks.map((task) => task.id)).toEqual([2, 3]);
        expect(restored).toEqual(before);
    });
});
