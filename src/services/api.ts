import type { ApiResponse, Paginated, Property } from '@/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type Result<T> = { ok: true; data: T } | { ok: false; message: string };

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

export function listProperties(page = 1): Promise<Result<Paginated<Property>>> {
  return request(`/properties?page=${page}`);
}

export function getProperty(id: string): Promise<Result<Property>> {
  return request(`/properties/${encodeURIComponent(id)}`);
}
