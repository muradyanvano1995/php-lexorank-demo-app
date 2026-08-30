# Testing

## Backend (Pest)

```bash
php artisan test --compact
```

Cover:

- Package discovery / `LexoRankService` + `Rebalancer` singletons / facade
- Cast + `HasLexoRank` + `orderByRank`
- Task create at start/end/between; same + cross-column move
- Invalid neighbors; collision retries → 409
- Canonical rank persistence; rebalance mapping + bucket rotation
- Diagnostics + playground endpoints
- Form Request validation (422)

Use factories/seed helpers; SQLite `:memory:` via `phpunit.xml`.

## Frontend (Vitest + Testing Library)

```bash
npm run test
```

Cover:

- use-form registration, rules, server-error mapping, field/error IDs
- focus-first-error, duplicate-submit prevention, submitting state
- edit defaults, reset on success, preserve values on failure
- controlled fields via `useController`
- board loading/render; optimistic move + rollback (mock API only)
- diagnostics + playground forms + rebalance confirm

**Mock API boundaries only — do not mock `@muradyanvano/use-form` itself.**

## Regression policy

Every bug fix gets a failing-then-passing test when feasible.

## Fixtures

Deterministic board seed: Backlog / In Progress / Review / Done + ~20–30 tasks with `initialRanks()`.
