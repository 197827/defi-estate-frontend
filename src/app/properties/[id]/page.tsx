import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getProperty } from '@/services/api';
import { formatBps, formatUsdCents, formatNumber } from '@/lib/format';
import { getTokenSupply } from '@/lib/soroban';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getProperty(id);
  if (!result.ok) return {};
  return {
    title: result.data.name,
    description: result.data.description ?? undefined,
  };
}

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

  const supply = p.tokenContractId ? await getTokenSupply(p.tokenContractId).catch(() => null) : null;

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
      {p.tokenContractId && (
        <Card>
          <p className="text-muted text-xs uppercase">Funding progress</p>
          {supply && supply.ok ? (
            <FundingProgress totalSupply={supply.data.totalSupply} maxSupply={supply.data.maxSupply} />
          ) : (
            <p className="text-muted mt-1 text-sm">Funding progress is currently unavailable.</p>
          )}
        </Card>
      )}
      {p.description && <p className="text-muted max-w-3xl">{p.description}</p>}
    </div>
  );
}

function FundingProgress({ totalSupply, maxSupply }: { totalSupply: bigint; maxSupply: bigint }) {
  const sold = totalSupply;
  const percent = maxSupply > 0n ? Number((sold * 10000n) / maxSupply) / 100 : 0;

  return (
    <div className="mt-2 space-y-2">
      <ProgressBar value={percent} />
      <div className="text-muted flex justify-between text-sm">
        <span>{sold.toLocaleString('en-US')} shares sold</span>
        <span>{percent.toFixed(2)}% funded</span>
      </div>
    </div>
  );
}