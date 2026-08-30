# Code quality

## PHP

- Pint: `vendor/bin/pint --dirty --format agent`
- Explicit types, Form Requests, thin controllers
- No edits under `vendor/`

## TypeScript

- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run format:check` / `npm run format` — Prettier
- Strict mode; no unjustified `any`

## Build

```bash
npm run build    # production Vite assets
composer validate --strict
composer audit
```

## Prohibited shortcuts

- Skipping skill updates when behavior changes
- Installing Inertia or alternate form libraries
- Path/local Composer or npm package overrides for the two demo packages
- Committing secrets or editing lockfiles by hand without install tools
- Claiming a validation command passed without running it
