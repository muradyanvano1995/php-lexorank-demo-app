# `@muradyanvano/use-form` integration

## Installed version

- npm: `@muradyanvano/use-form`
- Exact version: **0.1.2** (verify with `npm ls @muradyanvano/use-form`)

## Public entry points only

```ts
import {
  rules,
  useForm,
  ValidationMode,
  useController,
  FormProvider,
  ErrorSource,
} from '@muradyanvano/use-form'

// Dev only (prefer the app wrapper):
import { AppFormDevTools } from '@/components/forms/AppFormDevTools'
```

**Do not** import private paths such as `@muradyanvano/use-form/hooks/...`.

## Forms in this app

| Form | Values |
| --- | --- |
| Create / edit task | `title`, `description`, `priority`, `assigneeName`, `dueDate` |
| Playground parse / between / generate | rank strings + counts (no DevTools) |
| Rebalance confirm | optional confirm text when required |

## Patterns

- `mode: ValidationMode.OnBlur` (or OnSubmit where appropriate).
- Built-in `rules.required()`, `minLength`, `maxLength`, etc.
- Native fields: `form.register('title')` + `getFieldId` / `getErrorId`.
- Custom controls: `useController({ control: form.control, name })`.
- `preventDuplicateSubmit` + disable submit while `isSubmitting`.
- `focusOnError: true` (package default).
- On Laravel **422**, map snake_case → camelCase and call `helpers.setErrors(mapped, { source: 'server' })` or `setError(..., { source: 'server' })`.
- Preserve values on failure; `reset()` only on successful close/create as designed.
- DevTools: `<AppFormDevTools control={form.control} />` on non-playground forms only (e.g. rebalance) — docks `inline`, uses light `--form-devtools-*` tokens from `app.css`, no-ops outside DEV. Do not mount DevTools on LexoRank playground forms. Never ship raw floating/dark `FormDevTools` defaults in this app.

## Prohibited

- `react-hook-form`, `@hookform/*`, `formik`, `@tanstack/react-form`
- Inventing RHF-compatible wrappers
- Duplicating form values in parallel `useState`
