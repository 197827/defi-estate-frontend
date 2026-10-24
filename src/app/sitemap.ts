import type { MetadataRoute } from 'next';
import { listProperties } from '@/lib/api/properties';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    const properties = await listProperties();
    const tokenized = properties.filter(
      (property) => property.status === 'tokenized',
    );

    for (const property of tokenized) {
      entries.push({
        url: `${BASE_URL}/properties/${property.id}`,
        lastModified: property.updatedAt ? new Date(property.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch {
    // Gracefully return the partial list (home page only) if the API fails.
  }

  return entries;
}