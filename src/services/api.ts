import type { ApiResponse, Paginated, Property } from '@/shared';

export type TransactionHistoryType = 'transfer' | 'mint' | 'yield_claim';

export interface TransactionHistoryItem {
  id: string;
  type: TransactionHistoryType;
  propertyId: string;
  propertyName: string;
  amount: string;
  date: string;
  txHash: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type Result<T> = { ok: true; data: T } | { ok: false; message: string };

export interface ListPropertiesOptions {
  page?: number;
  city?: string;
  type?: string;
  minYieldBps?: number;
}

export interface TransactionHistoryOptions {
  page?: number;
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

/**
 * Fetches the connected wallet's transaction history (share transfers, mints
 * and yield claims) from the backend indexer.
 *
 * Fallback: until the indexer endpoint exists, the same data can be derived
 * from Soroban RPC by querying contract events (e.g. `getEvents` filtered by
 * the wallet address and the property token contracts) and mapping them into
 * `TransactionHistoryItem`. That path should live behind this function so
 * callers keep the same `Result<Paginated<TransactionHistoryItem>>` shape.
 */
export function getTransactionHistory(
  walletAddress: string,
  options: TransactionHistoryOptions = {},
): Promise<Result<Paginated<TransactionHistoryItem>>> {
  const { page = 1 } = options;
  const params = new URLSearchParams();
  params.set('page', String(page));
  return request(
    `/portfolio/${encodeURIComponent(walletAddress)}/history?${params.toString()}`,
  );
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