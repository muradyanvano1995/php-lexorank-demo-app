# UI design

## Direction

Premium SaaS Kanban: calm slate/teal surfaces (not purple-on-white, not cream/terracotta broadsheet). Light and dark themes via `class="dark"` on `document.documentElement`.

## Tokens (CSS variables in `resources/js/styles` / `app.css`)

- `--surface`, `--surface-elevated`, `--border`, `--text`, `--text-muted`
- `--accent`, `--accent-muted`
- Priority colors: low / medium / high / urgent
- Spacing scale via Tailwind; consistent `gap-3`/`gap-4` in boards
- Typography: distinctive UI sans from Vite/Bunny fonts + Tailwind theme

## Components

- Sticky app header with nav + theme toggle + package versions
- Columns: scrollable task lists, empty states, skeletons
- Cards: priority chip, assignee, due date, rank tooltip + copy
- Dialogs: focus trap, Esc close, labelled titles
- Reduced motion: respect `prefers-reduced-motion`

## Responsive

- Desktop: horizontal board scroll
- Mobile: stacked/swipeable columns, full-width dialogs

## Accessibility

- Visible focus rings
- Icon buttons have `aria-label`
- Lucide icons only (no emoji icons)
- Form errors wired with `aria-invalid` / `aria-describedby` from use-form
