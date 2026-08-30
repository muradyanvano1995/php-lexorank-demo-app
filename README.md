# LexoRank Demo Application

Production-quality **Laravel 13** demo for **[`muradyanvano/php-lexorank`](https://github.com/muradyanvano1995/php-lexorank)** — a PHP LexoRank library for fractional ranking (Kanban-style ordering without float positions).

| | |
| --- | --- |
| **Package** | [`muradyanvano/php-lexorank`](https://packagist.org/packages/muradyanvano/php-lexorank) **v0.1.1** |
| **Source** | https://github.com/muradyanvano1995/php-lexorank |
| **Stack** | Laravel 13 · PHP 8.4 · React 19 SPA · SQLite |

This app shows how to wire the package into a real API: drag-and-drop moves, unique-rank collisions, column rebalance, diagnostics, and an interactive LexoRank playground. Ranks are computed **only** in PHP via the package — never in JavaScript.

## Purpose

- Kanban board with LexoRank-ordered tasks
- Neighbor-based moves (`before` / `after`) through the REST API
- Collision retries and **409** when ranks are too dense
- Column rebalance into the next LexoRank bucket
- Rank diagnostics and playground (`parse` / `between` / `generate`)

## Architecture

- **Laravel 13** REST JSON API under `/api/*`
- **React 19 + TypeScript SPA** in `resources/js` (Vite)
- **Blade** only hosts `#root` — **no Inertia**
- **TanStack Query** for server state
- **`@dnd-kit`** for drag-and-drop (neighbors sent to the API; ranks never invented in the client)
- **SQLite** by default; schema is MySQL/PostgreSQL friendly

Agent instructions for contributors: [`AGENTS.md`](AGENTS.md) and [`.ai/`](.ai/).

## Laravel 13 compatibility

Verified on **Laravel Framework 13.29.0** / **PHP 8.4.24**.

`muradyanvano/php-lexorank` v0.1.1 auto-discovers its service provider, registers `LexoRankService` + `Rebalancer` singletons, and works with `LexoRankCast` / `HasLexoRank` on Eloquent models in this app.

## LexoRank integration

- Task `rank` column: `string(255)` with unique `(column_id, rank)`
- Cast: `MuradyanVano\LexoRank\Laravel\Casts\LexoRankCast`
- Trait: `MuradyanVano\LexoRank\Laravel\Concerns\HasLexoRank`
- Moves: `TaskRankingService` → `LexoRankService::between($before, $after)` with row locks and up to **3** unique-constraint retries → **409**
- Rebalance: package `Rebalancer` into next bucket; mapping applied in a transaction via query-builder string updates
- Seed ranks: `LexoRankService::initialRanks()`

## Installation

```bash
composer install
npm install
cp .env.example .env   # if needed
php artisan key:generate
touch database/database.sqlite
php artisan migrate:fresh --seed
npm run build
php artisan serve
```

Default DB is SQLite (`DB_CONNECTION=sqlite`).

## Development

```bash
composer run dev
# or separately:
php artisan serve
npm run dev
```

## API endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/boards` | List boards with columns/tasks |
| GET | `/api/boards/{board}` | Show board |
| POST | `/api/columns/{column}/tasks` | Create task (optional neighbors) |
| PATCH | `/api/tasks/{task}` | Update task fields |
| DELETE | `/api/tasks/{task}` | Delete task |
| POST | `/api/tasks/{task}/move` | Move with `column_id`, `before_id`, `after_id` |
| POST | `/api/columns/{column}/rebalance` | `{ "confirm": "REBALANCE" }` |
| GET | `/api/columns/{column}/diagnostics` | Rank length / bucket stats |
| GET | `/api/lexorank/health` | Package health + sample ranks |
| POST | `/api/lexorank/playground/parse` | Parse a rank string |
| POST | `/api/lexorank/playground/between` | Midpoint between bounds |
| POST | `/api/lexorank/playground/generate` | `initialRanks` bulk sample |

### Move payload

```json
{ "column_id": 2, "before_id": 15, "after_id": 16 }
```

`before_id` = previous/lower neighbor; `after_id` = next/upper neighbor. Nulls allow empty / start / end placements.

## Drag-and-drop strategy

1. Optimistic cache update in TanStack Query
2. Compute neighbors from destination ordered list
3. `POST /api/tasks/{id}/move`
4. On error: rollback cache snapshot
5. On settle: invalidate board queries for canonical ranks

## Collision handling

Unique `(column_id, rank)` violations reload neighbors, recompute `between()`, and retry (max 3). Exhaustion returns **409 Conflict**.

## Rebalancing

Locked ordered tasks → `Rebalancer::rebalance()` → next-bucket mapping → persist canonical strings → response includes mapping and before/after max lengths.

## Testing

```bash
php artisan test --compact
npm run test
npm run typecheck
npm run lint
npm run format:check
npm run build
```

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Empty board | `php artisan migrate:fresh --seed` |
| Vite assets missing | `npm run build` or `npm run dev` |
| 409 on move | Dense ranks — run column rebalance from Diagnostics |
| Form 422 | Check Form Request rules; snake_case keys map to camelCase fields |
| Stale agent docs | Update `.ai/skills` with the code change |

## Links

- **GitHub:** https://github.com/muradyanvano1995/php-lexorank
- **Packagist:** https://packagist.org/packages/muradyanvano/php-lexorank
