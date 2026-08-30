# Project architecture

## Boundaries

| Side | Responsibility |
| --- | --- |
| Laravel (`app/`, `routes/api.php`) | Persistence, validation, LexoRank math, JSON API |
| React (`resources/js`) | UI, forms (`@muradyanvano/use-form`), DnD UX, TanStack Query cache |
| Blade (`resources/views/app.blade.php`) | Mount `#root` + Vite entry only |

**No Inertia.** Controllers return JSON or the SPA shell view — never Inertia responses.

## Directory structure

```text
app/
  Enums/TaskPriority.php
  Http/Controllers/Api/...
  Http/Requests/...
  Http/Resources/...
  Models/{Board,Column,Task}.php
  Services/{TaskRankingService,ColumnRebalanceService,ColumnDiagnosticsService,LexoRankPlaygroundService}.php
database/migrations|seeders|factories
routes/api.php
routes/web.php          # SPA catch-all
resources/js/
  api/                  # typed fetch client
  components/{ui,layout,board,forms,diagnostics}/
  features/{board,tasks,playground,diagnostics}/
  hooks/ lib/ pages/ styles/ test/ types/
  app.tsx router.tsx
```

## Dependency direction

- React → HTTP `/api/*` only (no PHP imports, no LexoRank JS).
- Controllers → Form Requests + Resources + Services.
- Services → Eloquent + `LexoRankService` / `Rebalancer` (container singletons).
- Models may use `HasLexoRank` + `LexoRankCast`; they do not call HTTP.

## Public API contracts

Stable JSON shapes are owned by API Resources. Clients rely on:

- Boards with nested columns and ordered tasks
- Task CRUD + `POST .../move` with `column_id`, `before_id`, `after_id`
- Column diagnostics + rebalance result mapping
- LexoRank playground parse/between/generate + health

See `laravel-api.md` for routes and status codes.

## Server-state vs form-state

| Concern | Owner |
| --- | --- |
| Boards/tasks from API | TanStack Query |
| Form values, touched, client errors, submit | `@muradyanvano/use-form` |
| Dialog open, filters, drag overlay | Local React state |

Never duplicate one form’s values in both `useState` and `useForm`.
