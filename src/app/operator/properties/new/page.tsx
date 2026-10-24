'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { createPropertySchema } from '@/shared/schemas';
import type { z } from 'zod';
import { createProperty } from '@/lib/api/properties';

type FormValues = z.input<typeof createPropertySchema>;

export default function NewPropertyPage() {
  const t = useTranslations('operator.properties.new');
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      valuation: '',
      totalShares: '',
    },
  });

  const valuation = watch('valuation');
  const totalShares = watch('totalShares');

  const valuationNumber = Number(valuation);
  const totalSharesNumber = Number(totalShares);
  const sharePrice =
    Number.isFinite(valuationNumber) &&
    Number.isFinite(totalSharesNumber) &&
    totalSharesNumber > 0
      ? valuationNumber / totalSharesNumber
      : null;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const payload = {
        ...values,
        valuation: Math.round(Number(values.valuation) * 100),
        totalShares: Number(values.totalShares),
      };
      const property = await createProperty(payload);
      router.push(`/operator/properties/${property.id}`);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : t('serverError'),
      );
    }
  });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">{t('title')}</h1>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            {t('fields.name')}
          </label>
          <input
            id="name"
            type="text"
            className="w-full rounded border px-3 py-2"
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium"
          >
            {t('fields.description')}
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full rounded border px-3 py-2"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium">
            {t('fields.location')}
          </label>
          <input
            id="location"
            type="text"
            className="w-full rounded border px-3 py-2"
            {...register('location')}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">
              {errors.location.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="valuation"
            className="mb-1 block text-sm font-medium"
          >
            {t('fields.valuation')}
          </label>
          <input
            id="valuation"
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded border px-3 py-2"
            {...register('valuation')}
          />
          {errors.valuation && (
            <p className="mt-1 text-sm text-red-600">
              {errors.valuation.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="totalShares"
            className="mb-1 block text-sm font-medium"
          >
            {t('fields.totalShares')}
          </label>
          <input
            id="totalShares"
            type="number"
            step="1"
            min="1"
            className="w-full rounded border px-3 py-2"
            {...register('totalShares')}
          />
          {errors.totalShares && (
            <p className="mt-1 text-sm text-red-600">
              {errors.totalShares.message}
            </p>
          )}
        </div>

        <div className="rounded border bg-gray-50 px-3 py-2">
          <span className="text-sm font-medium">{t('sharePrice')}: </span>
          <span className="text-sm">
            {sharePrice !== null ? `$${sharePrice.toFixed(2)}` : '—'}
          </span>
        </div>

        {serverError && (
          <p className="text-sm text-red-600" role="alert">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </button>
      </form>
    </main>
  );
}