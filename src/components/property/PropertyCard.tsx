import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Building2 } from 'lucide-react';
import type { Property } from '@/shared';
import { Card } from '@/components/ui/Card';
import { formatBps, formatUsdCents } from '@/lib/format';

export function PropertyCard({ property }: { property: Property }) {
  const t = useTranslations('PropertyCard');
  const tStatus = useTranslations('PropertyStatus');

  const altText = `${property.name} in ${property.location.city}, ${property.location.country}`;

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="hover:border-primary space-y-3 overflow-hidden transition-colors">
        <div className="bg-surface-raised relative aspect-[16/9] w-full overflow-hidden rounded-md">
          {property.imageUrl ? (
            <Image
              src={property.imageUrl}
              alt={altText}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="text-muted flex h-full w-full items-center justify-center">
              <Building2 className="h-10 w-10" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-medium">{property.name}</h2>
          <span className="bg-surface-raised text-muted rounded-full px-2 py-0.5 text-xs">
            {tStatus(property.status)}
          </span>
        </div>
        <p className="text-muted text-sm">
          {property.location.city}, {property.location.country}
        </p>
        <div className="flex justify-between text-sm">
          <span>{t('perShare', { price: formatUsdCents(property.sharePriceUsdCents) })}</span>
          <span className="text-primary">
            {t('yield', { yield: formatBps(property.expectedYieldBps) })}
          </span>
        </div>
      </Card>
    </Link>
  );
}