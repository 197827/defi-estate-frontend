'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTransactionHistory } from '@/services/api';
import type { TransactionHistoryItem } from '@/services/api';
import { useWallet } from '@/hooks/useWallet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const EXPLORER_BASE_URL = 'https://stellar.expert/explorer/testnet/tx';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function formatType(type: string): string {
  switch (type) {
    case 'transfer':
      return 'Transfer';
    case 'mint':
      return 'Mint';
    case 'yield_claim':
      return 'Yield claim';
    default:
      return type;
  }
}

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(rows: TransactionHistoryItem[]): string {
  const header = ['Date', 'Property', 'Type', 'Amount', 'Transaction'];
  const lines = rows.map((row) => {
    const explorerUrl = row.txHash ? `${EXPLORER_BASE_URL}/${row.txHash}` : '';
    return [
      formatDate(row.date),
      row.propertyName,
      formatType(row.type),
      row.amount,
      explorerUrl,
    ]
      .map((cell) => escapeCsvValue(String(cell ?? '')))
      .join(',');
  });
  return [header.join(','), ...lines].join('\r\n');
}

export default function PortfolioHistoryPage() {
  const { address, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!isConnected || !address) {
      setTransactions([]);
      setIsLoading(false);
      setError(null);
      return () => {
        isCancelled = true;
      };
    }

    setIsLoading(true);
    setError(null);

    getTransactionHistory(address)
      .then((data) => {
        if (!isCancelled) {
          setTransactions(data);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load transaction history.',
          );
          setTransactions([]);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [address, isConnected]);

  const handleExportCsv = useCallback(() => {
    if (transactions.length === 0) {
      return;
    }
    const csv = buildCsv(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [transactions]);

  const hasTransactions = transactions.length > 0;

  const content = useMemo(() => {
    if (!isConnected || !address) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-16 text-center">
          <p className="text-base font-medium text-neutral-900">No wallet connected</p>
          <p className="text-sm text-neutral-500">
            Connect your wallet to view your transaction history.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      );
    }

    if (!hasTransactions) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-16 text-center">
          <p className="text-base font-medium text-neutral-900">No transactions yet</p>
          <p className="text-sm text-neutral-500">
            Your share transfers, mints and yield claims will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-medium text-neutral-600">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-neutral-600">
                Property
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-neutral-600">
                Type
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-neutral-600">
                Amount
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-neutral-600">
                Explorer
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="whitespace-nowrap px-4 py-3 text-neutral-700">
                  {formatDate(tx.date)}
                </td>
                <td className="px-4 py-3 text-neutral-700">{tx.propertyName}</td>
                <td className="px-4 py-3 text-neutral-700">{formatType(tx.type)}</td>
                <td className="px-4 py-3 text-neutral-700">{tx.amount}</td>
                <td className="px-4 py-3">
                  {tx.txHash ? (
                    <a
                      href={`${EXPLORER_BASE_URL}/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [address, error, hasTransactions, isConnected, isLoading, transactions]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Transaction history</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Your share transfers, mints and yield claims.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleExportCsv}
          disabled={!hasTransactions || isLoading}
        >
          Export CSV
        </Button>
      </div>
      {content}
    </main>
  );
}