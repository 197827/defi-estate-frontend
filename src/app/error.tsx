'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations('errors');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-subtle text-3xl text-danger"
        >
          !
        </span>
        <h1 className="text-2xl font-semibold text-foreground">
          {t('title')}
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <Button onClick={() => reset()}>{t('retry')}</Button>
    </main>
  );
}