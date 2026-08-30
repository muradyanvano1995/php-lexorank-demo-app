# React + TypeScript

## Stack

- React **19** + React DOM
- TypeScript (strict)
- Vite + `@vitejs/plugin-react`
- React Router
- TanStack Query v5
- Tailwind CSS v4

Entry: `resources/js/app.tsx` → `router.tsx` → pages.

## Conventions

- Function components only; prefer composition over monoliths (especially board).
- Strict TS: no unjustified `any`. Prefer shared types in `resources/js/types`.
- Accessible components: labels, focus rings, dialogs, keyboard DnD.
- Server state via TanStack Query hooks in `features/*/`; invalidate or optimistically patch board queries after mutations.
- API client in `resources/js/api` — typed fetch, throws on non-OK with parsed Laravel errors.

## Component boundaries

| Area | Path |
| --- | --- |
| Primitives | `components/ui` |
| Shell | `components/layout` |
| Board pieces | `components/board` |
| Forms | `components/forms` |
| Diagnostics widgets | `components/diagnostics` |
| Pages | `pages` |

## Prohibitions

- No Inertia, Redux, React Hook Form, Formik, TanStack Form.
- No client-side LexoRank math.
