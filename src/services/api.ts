import type { ApiResponse, Paginated, Property } from '@/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const USE_MOCK_API =
  process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.LHCI_MOCK_API === 'true';

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    name: 'Sunset Apartments',
    city: 'Lisbon',
    type: 'apartment',
    yieldBps: 650,
    tokenContractId: 'mock-token-1',
  } as Property,
  {
    id: '2',
    name: 'Harbor Offices',
    city: 'Porto',
    type: 'office',
    yieldBps: 720,
    tokenContractId: 'mock-token-2',
  } as Property,
];

function mockListProperties(options: ListPropertiesOptions): Paginated<Property> {
  const { page = 1, city, type, minYieldBps } = options;
  const filtered = MOCK_PROPERTIES.filter((p) => {
    if (city !== undefined && city !== '' && p.city !== city) return false;
    if (type !== undefined && type !== '' && p.type !== type) return false;
    if (minYieldBps !== undefined && p.yieldBps < minYieldBps) return false;
    return true;
  });
  return { items: filtered, page, total: filtered.length, pageSize: filtered.length };
}

function mockGetProperty(id: string): Property | undefined {
  return MOCK_PROPERTIES.find((p) => p.id === id);
}

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
  if (USE_MOCK_API) {
    return Promise.resolve({ ok: true, data: mockListProperties(options) });
  }
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (city !== undefined && city !== '') params.set('city', city);
  if (type !== undefined && type !== '') params.set('type', type);
  if (minYieldBps !== undefined) params.set('minYieldBps', String(minYieldBps));
  return request(`/properties?${params.toString()}`);
}

export function getProperty(id: string): Promise<Result<Property>> {
  if (USE_MOCK_API) {
    const property = mockGetProperty(id);
    return Promise.resolve(
      property !== undefined
        ? { ok: true, data: property }
        : { ok: false, message: 'Property not found' },
    );
  }
  return request(`/properties/${encodeURIComponent(id)}`);
}

export async function createProperty(input: unknown): Promise<Result<Property>> {
  try {
    const res = await fetch(`${API_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const body = (await res.json()) as ApiResponse<Property>;
    return body.success
      ? { ok: true, data: body.data }
      : { ok: false, message: body.error.message };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}