# `.ai` — project skills for agents

## How to select skills

1. Start from root `AGENTS.md`.
2. Open this README.
3. For every path or concern you will touch, read the matching files under `.ai/skills/`.
4. Prefer multiple skills when a change spans layers (e.g. move API + DnD UI → `laravel-api`, `lexorank-integration`, `drag-and-drop`, `testing`).

| Concern | Skill |
| --- | --- |
| App layout / SPA vs API | `project-architecture.md` |
| HTTP API / Eloquent / validation | `laravel-api.md` |
| Ranks, moves, rebalance | `lexorank-integration.md` |
| React / TypeScript / Query | `react-typescript.md` |
| Forms | `use-form-integration.md` |
| Visual design / a11y | `ui-design.md` |
| Drag-and-drop | `drag-and-drop.md` |
| Tests | `testing.md` |
| Lint / format / build | `code-quality.md` |

## Architecture truths

- **Laravel is a REST API backend** — JSON under `/api/*`.
- **React is a client-side SPA** inside this Laravel repo (`resources/js`).
- **Blade only hosts the React root** — no Inertia pages or shared props.
- **Inertia is prohibited.**
- **`@muradyanvano/use-form` is mandatory** for every real user-input form.
- **Client validation improves UX; Laravel Form Requests remain authoritative.**
- **LexoRank is computed only by the PHP backend** (`muradyanvano/php-lexorank`). The SPA sends neighbor IDs; it never invents ranks.
- **Skills must describe the repository’s actual implementation.** When code changes, update the skill in the same change.
- **Do not create duplicate or conflicting instruction systems** (second `AGENTS.md`, parallel rule trees that contradict `.ai/skills`, etc.). Boost Laravel skills are supplementary only.

## Stale skill policy

If application code and a skill disagree, **code wins for runtime behavior**, and you must **fix the skill** so the next agent is not misled.
