# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repository.

## What this is

The defi-estate web app (Next.js 16 App Router, React 19, Tailwind CSS 4). It reads property data from `defi-estate-backend` and lets investors sign their own contract calls (share transfers, yield claims) against `defi-estate-contract` with a Stellar wallet. Admin actions are signed by the backend, never in the browser.

## Non-negotiables

- **`make check` must pass** before work is called done (type-check, lint, prettier, tests, `next build`).
- **Use the design system**: tokens in `src/app/globals.css`, components in `src/components/ui`, documented in `docs/design-system.md`. No hardcoded colors.
- **Icons come from `lucide-react` only.** No second icon library, and no emojis in place of icons.
- Server components fetch through `src/services/api.ts`; anything touching the wallet is a client component.
- **`src/shared` is mirrored from `defi-estate-backend`.** When a type or contract ID changes there, make the same change here.
- **Contract IDs are data**: `src/shared/contracts/contracts.<network>.json`, never hardcoded.
- Never commit `.env*` files.

## End-to-end tests

- E2E tests live in `e2e/` and are driven by Playwright (`playwright.config.ts`), which starts the app with `next start` against a mocked API.
- Run them locally with `bun run test:e2e`. They also run in CI via the `e2e` job in `.github/workflows/ci.yml`, which uploads the report on failure.
- When adding or changing a page or navigation flow, add or update the corresponding test in `e2e/`.

## Commit conventions

Conventional Commits: `<type>(<scope>): <short lowercase summary>`. Scopes: `ui`, `properties`, `wallet`, `shared`, `ci`, `docs`.