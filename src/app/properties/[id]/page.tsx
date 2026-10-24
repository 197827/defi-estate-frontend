import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getProperty } from '@/services/api';
import { formatBps, formatUsdCents } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getProperty(id);
  if (!result.ok) notFound();
  const p = result.data;

  const stats = [
    ['Valuation', formatUsdCents(p.valuationUsdCents)],
    ['Share price', formatUsdCents(p.sharePriceUsdCents)],
    ['Total shares', p.totalShares.toLocaleString('en-US')],
    ['Expected yield', formatBps(p.expectedYieldBps)],
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{p.name}</h1>
        <p className="text-muted flex items-center gap-1 text-sm">
          <MapPin className="h-4 w-4" aria-hidden />
          {p.location.address}, {p.location.city}, {p.location.country}
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
