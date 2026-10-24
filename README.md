# defi-estate-frontend

Web app for [defi-estate](https://github.com/defi-estate), a real estate tokenization and rental yield platform on Stellar. Built with Next.js 16, React 19, Tailwind CSS 4 and `lucide-react`, with Freighter wallet connect.

## Related repositories

- [defi-estate-backend](https://github.com/defi-estate/defi-estate-backend): REST API this app reads from
- [defi-estate-contract](https://github.com/defi-estate/defi-estate-contract): Soroban contracts investors sign against (transfers, yield claims)

## Quick start

Requirements: [Bun](https://bun.sh) 1.3+, and the backend running on port 3001.

```bash
bun install
cp .env.example .env.local
bun run dev            # http://localhost:3000
```

Install the [Freighter](https://www.freighter.app/) extension and switch it to Testnet to use wallet features.

## Layout

| Path                  | What it is                                                             |
| --------------------- | ---------------------------------------------------------------------- |
| `src/app/`            | App Router pages: home, `/properties`, `/properties/[id]`              |
| `src/components/ui/`  | design system components (`Button`, `Card`)                            |
| `src/components/`     | feature components (layout, property, wallet)                          |
| `src/services/api.ts` | typed API client                                                       |
| `src/shared/`         | domain types and contract-ID registry (mirrored from the backend repo) |
| `src/app/globals.css` | design tokens                                                          |

## Commands

```bash
make check             # same as CI
bun test
bun run build
make fix               # prettier
```

Design system: [docs/design-system.md](docs/design-system.md).
