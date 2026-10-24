# Design system

## Foundations

Tokens are CSS custom properties in `src/app/globals.css`, exposed to Tailwind through `@theme inline`, so use utility classes such as `bg-surface`, `text-muted`, `border-border`, `text-primary`.

| Token                                       | Use                               |
| ------------------------------------------- | --------------------------------- |
| `--color-bg`                                | page background                   |
| `--color-surface`, `--color-surface-raised` | cards, inputs, hover states       |
| `--color-border`                            | dividers and card borders         |
| `--color-text`, `--color-text-muted`        | primary and secondary text        |
| `--color-primary`, `--color-primary-strong` | actions, positive figures (yield) |
| `--color-accent`                            | highlights                        |
| `--color-danger`                            | errors                            |
| `--radius-card`                             | card corner radius                |

## Components

Shared components live in `src/components/ui`:

- `Button` with `primary` and `secondary` variants
- `Card`

Icons come from `lucide-react` only. Decorative icons get `aria-hidden`.

Add a token or component here before using a new color or pattern in a feature.
