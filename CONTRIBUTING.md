# Contributing

1. Fork the repository and branch from `develop`: `feat/<name>`, `fix/<name>`, `docs/<name>`.
2. One logical change per commit, using [Conventional Commits](https://www.conventionalcommits.org/).
3. Run `make check` and make sure it passes.
4. Run the end-to-end suite with `bun run test:e2e` (Playwright) and make sure it passes.
5. Open a pull request against `develop` using the PR template.

CI (`.github/workflows/ci.yml`) runs type-check, ESLint, Prettier, `bun test` and `next build`. A separate e2e job runs the Playwright suite against a mocked API and uploads the report on failure.

Never commit `.env` files or secret keys. Report vulnerabilities privately to the maintainers.