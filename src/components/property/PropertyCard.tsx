import Link from 'next/link';
import type { Property } from '@/shared';
import { Card } from '@/components/ui/Card';
import { formatBps, formatUsdCents } from '@/lib/format';

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="hover:border-primary space-y-3 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-medium">{property.name}</h2>
          <span className="bg-surface-raised text-muted rounded-full px-2 py-0.5 text-xs">
            {property.status.replace('_', ' ')}
          </span>
        </div>
        <p className="text-muted text-sm">
          {property.location.city}, {property.location.country}
        </p>
        <div className="flex justify-between text-sm">
          <span>{formatUsdCents(property.sharePriceUsdCents)} / share</span>
          <span className="text-primary">{formatBps(property.expectedYieldBps)} yield</span>
        </div>
      </Card>
    </Link>
  );
}
