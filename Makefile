# Run the same checks as CI before you push.

.PHONY: check fix test-e2e help

help:
	@echo "make check     type-check, lint, prettier, test, next build (same as CI)"
	@echo "make test-e2e  run Playwright e2e smoke tests (bun run test:e2e)"
	@echo "make fix       prettier --write"

check:
	bun install --frozen-lockfile
	bun run type-check
	bun run lint
	bun run format:check
	bun test
	bun run build

test-e2e:
	bun run test:e2e

fix:
	bun run format