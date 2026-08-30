# Laravel API

## Routing

- API file: `routes/api.php` registered in `bootstrap/app.php` with default `/api` prefix.
- Web: `routes/web.php` serves the SPA shell for non-API GET routes (React Router).

## Controllers

Thin controllers under `app/Http/Controllers/Api/`:

- `BoardController` — index/show
- `ColumnController` — store/update
- `ColumnReorderController` — reorder columns on a board
- `TaskController` — store/update/destroy
- `TaskMoveController` — move
- `ColumnRebalanceController` — rebalance
- `ColumnDiagnosticsController` — diagnostics
- `LexoRankHealthController` / `LexoRankPlaygroundController`

Inject services; return Resources or JSON arrays. No business logic in controllers.

## Form Requests

All mutating endpoints use Form Requests (`authorize(): true` for this demo). Repeat client rules on the server (title length, priority enum, due_date, neighbor IDs).

## Resources

- `BoardResource`, `ColumnResource`, `TaskResource`
- Eager-load `columns.tasks` ordered by `rank` to avoid N+1.

## Services

| Service | Role |
| --- | --- |
| `TaskRankingService` | Insert + move with locks, `between()`, collision retries |
| `ColumnOrderingService` | Create column (next position), rename, reorder positions |
| `ColumnRebalanceService` | Locked ordered rebalance via `Rebalancer` |
| `ColumnDiagnosticsService` | Lengths, buckets, duplicates, soft rebalance hint |
| `LexoRankPlaygroundService` | Parse / between / generate for the UI playground |

## Transactions & concurrency

- Move and rebalance wrap DB work in transactions.
- Lock destination column tasks (`lockForUpdate`) before neighbor resolution.
- Unique `(column_id, rank)` collisions: retry up to **3** times; then **409**.

## JSON conventions

- Success: Resource / `{ data: ... }` as implemented by controllers.
- Validation: Laravel **422** `{ message, errors: { field: [msgs] } }` (snake_case keys).
- Conflict: **409** with message when move retries exhaust.
- Domain LexoRank exceptions map to **422** (invalid ranks/bounds) or **409** as appropriate.
