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

## Theming

The app ships two themes, dark (default) and light. Every token above is defined twice in `src/app/globals.css`: once on `:root` for dark and once under `[data-theme='light']` for light. Components never branch on the theme; they only use the token utilities, so both themes come for free.

- Default: with no stored choice, the theme follows the OS via `prefers-color-scheme`.
- Toggle: the header renders a `Sun` / `Moon` button (from `lucide-react`) that switches the theme and writes the choice to `localStorage`.
- No flash: an inline script in the document head applies the stored (or OS) theme to `<html data-theme>` before first paint, so the wrong theme is never shown.

Rules for contributors:

- Any new token must get a light value under `[data-theme='light']` in the same change.
- Never hardcode colors (hex, `rgb()`, named colors) in components; use token utilities so both themes stay correct.
- Check new UI in both themes and keep text/background pairs at WCAG AA contrast.

## Components
=======

Shared components live in `src/components/ui`:

- `Button` with `primary` and `secondary` variants
- `Card`
- `Skeleton`
- `Toast` with `Toaster` provider and `useToast` hook

### Toast

Toasts are short-lived success, error and info messages, for example after connecting a wallet or claiming yield. Wrap the app in `Toaster` (once, near the root) and call `useToast` from any client component inside it.

```tsx
const { toast } = useToast();

toast({ title: "Wallet connected", variant: "success" });
toast({ title: "Connection failed", description: error.message, variant: "error" });
```

Variants:

| Variant   | Icon (lucide)    | Token usage                          |
| --------- | ---------------- | ------------------------------------ |
| `success` | `CircleCheck`    | `text-primary` accent                |
| `error`   | `CircleAlert`    | `text-danger` accent                 |
| `info`    | `Info`           | `text-muted` accent                  |

All variants use `bg-surface-raised`, `border-border`, `text-text` and `rounded-card`; icons are decorative (`aria-hidden`).

Behaviour:

- Toasts auto-dismiss after 5 seconds.
- Each toast has a close button that is keyboard focusable, so it can be dismissed with `Enter`/`Space` (or `Escape` while focused).
- The toast region uses `aria-live="polite"` (and `role="status"`) so screen readers announce new toasts; error toasts use `aria-live="assertive"` for immediate announcement.

Where it is used:

- `src/components/wallet/ConnectWallet.tsx` — connection errors

### Skeleton

`Skeleton` renders a placeholder block used while content is loading. It is purely decorative: it is hidden from assistive technology (`aria-hidden`) and marked with `role="presentation"`, so it should always be paired with a meaningful loading announcement elsewhere (for example the `loading.tsx` route files).

Props:

| Prop        | Type                  | Default | Description                                              |
| ----------- | --------------------- | ------- | -------------------------------------------------------- |
| `className` | `string`              | —       | Extra utility classes; use to set size, shape and layout |
| `...props`  | `HTMLAttributes<HTMLDivElement>` | — | Any other `div` attributes are forwarded to the root element |

Token usage:

- Background: `bg-surface-raised` (never a raw color value)
- Corner radius: `rounded-card` (from `--radius-card`)
- Subtle pulse animation via `animate-pulse`

Example:

```tsx
<Skeleton className="h-4 w-2/3" />
<Skeleton className="h-48 w-full" />
```

Where it is used:

- `src/app/properties/loading.tsx` — property list loading state
- `src/app/properties/[id]/loading.tsx` — property detail loading state

Icons come from `lucide-react` only. Decorative icons get `aria-hidden`.

Add a token or component here before using a new color or pattern in a feature.