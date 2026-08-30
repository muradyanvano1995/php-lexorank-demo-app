# Drag and drop

## Library

- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

## Architecture

- Board-level `DndContext` + `DragOverlay`
- Local `columns` state mirrors the board while dragging
- **Same-column:** live `arrayMove` on `onDragOver` so siblings animate aside
  (collision uses `closestCenter` after `pointerWithin` to reduce down-drag
  oscillation). Finalize on `onDragEnd` if needed.
- **Cross-column:** move the card into the destination list on `onDragOver`
  (skip no-op reinserts to avoid thrash)
- Sensors: pointer + keyboard
- Collision: `boardCollisionDetection` — `pointerWithin` first (so **empty
  columns** are droppable), then `closestCenter`. Prefer a task hit over its
  parent column droppable.
- Cross-column `onDragEnd` fallback relocates when `onDragOver` never ran
  (empty destination).
- **Columns:** header grip reorders columns horizontally (`type: 'column'`);
  task drag is disabled while a column is dragging and vice versa.
- Column highlight uses tracked `overColumnId` (not droppable `isOver`) so the
  ring stays while hovering tasks inside a column, not only the empty border.
- Drag feel: semi-visible sortable ghost + `DragOverlay` (no drop animation —
  that collapsed then expanded the card on release); measure droppables with
  `WhileDragging` (not `Always` — that remeasures every render and can loop
  with live column reorder into "Maximum update depth exceeded").
- While dragging a column, collision ignores nested tasks and only targets
  other columns, so column order does not thrash.

## Neighbor calculation

After the final ordered list is known, use
`neighborsFromOrderedTasks(orderedTasks, movedTaskId)`:

- `before_id` = previous task in the new order
- `after_id` = next task in the new order

Then `POST /api/tasks/{task}/move`. Skip the request when neighbors are unchanged.

**Never** compute LexoRank strings in the client.

## Optimistic updates

1. Keep a drag-origin snapshot of columns.
2. On `onDragEnd`, **commit** the final columns into the board query cache
   (`commitColumns`) and **keep** `dragColumns` set to that layout until the
   move mutation `onSettled` — clearing immediately lets a stale `board` prop
   flash the card back to the source column (especially cross-column).
3. On API error: `restoreBoard` from the `commitColumns` snapshot, then clear
   local drag state.
4. No-op drops clear `dragColumns` immediately (no mutation).

## Accessibility

- Keyboard sortable activations via dnd-kit keyboard sensor
- Honor reduced motion for overlay transitions
