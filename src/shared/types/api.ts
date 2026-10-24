export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type TransactionHistoryType = 'mint' | 'transfer' | 'yield_claim';

export interface TransactionHistoryItem {
  id: string;
  /** ISO 8601 timestamp of the transaction */
  timestamp: string;
  propertyId: string;
  propertyName: string;
  type: TransactionHistoryType;
  /** Amount as a string to preserve precision */
  amount: string;
  txHash: string;
  explorerUrl: string;
}

export type TransactionHistoryResponse = Paginated<TransactionHistoryItem>;