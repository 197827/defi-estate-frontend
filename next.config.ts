import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Validate NEXT_PUBLIC_* environment variables at build/boot time so that
// misconfiguration fails early with a readable message instead of silently
// at request time. Set SKIP_ENV_VALIDATION=true to bypass (e.g. CI type checks).
import './src/lib/env';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);