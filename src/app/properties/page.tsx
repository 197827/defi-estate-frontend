import { getTranslations } from 'next-intl/server';
import { PropertyCard } from '@/components/property/PropertyCard';
import { listProperties } from '@/services/api';

export const dynamic = 'force-dynamic';

export default async function PropertiesPage() {
  const t = await getTranslations('Properties');
  const result = await listProperties();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted text-sm">{t('subtitle')}</p>
      </div>

      {!result.ok ? (
        <p className="text-danger text-sm">{t('apiError', { message: result.message })}</p>
      ) : result.data.items.length === 0 ? (
        <p className="text-muted text-sm">{t('empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.items.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}