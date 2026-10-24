import type { ApiResponse, Paginated, Property } from '@/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type Result<T> = { ok: true; data: T } | { ok: false; message: string };

export interface ListPropertiesOptions {
  page?: number;
  city?: string;
  type?: string;
  minYieldBps?: number;
}

async function request<T>(path: string): Promise<Result<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
    const body = (await res.json()) as ApiResponse<T>;
    return body.success
      ? { ok: true, data: body.data }
      : { ok: false, message: body.error.message };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export function listProperties(
  options: ListPropertiesOptions = {},
): Promise<Result<Paginated<Property>>> {
  const { page = 1, city, type, minYieldBps } = options;
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (city !== undefined && city !== '') params.set('city', city);
  if (type !== undefined && type !== '') params.set('type', type);
  if (minYieldBps !== undefined) params.set('minYieldBps', String(minYieldBps));
  return request(`/properties?${params.toString()}`);
}

export function getProperty(id: string): Promise<Result<Property>> {
  return request(`/properties/${encodeURIComponent(id)}`);
}