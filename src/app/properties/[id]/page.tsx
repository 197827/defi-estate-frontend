import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getProperty } from '@/services/api';
import { formatBps, formatUsdCents, formatNumber } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getProperty(id);
  if (!result.ok) notFound();
  const p = result.data;

  const t = await getTranslations('properties.detail');

  const stats = [
    [t('valuation'), formatUsdCents(p.valuationUsdCents)],
    [t('sharePrice'), formatUsdCents(p.sharePriceUsdCents)],
    [t('totalShares'), formatNumber(p.totalShares)],
    [t('expectedYield'), formatBps(p.expectedYieldBps)],
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{p.name}</h1>
        <p className="text-muted flex items-center gap-1 text-sm">
          <MapPin className="h-4 w-4" aria-hidden />
          {t('location', {
            address: p.location.address,
            city: p.location.city,
            country: p.location.country,
          })}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <p className="text-muted text-xs uppercase">{label}</p>
            <p className="mt-1 text-lg font-medium">{value}</p>
          </Card>
        ))}
      </div>
      {p.description && <p className="text-muted max-w-3xl">{p.description}</p>}
    </div>
  );
}