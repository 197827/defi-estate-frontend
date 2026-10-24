'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchTokenizedProperties } from '@/lib/api';
import { readTokenBalance } from '@/lib/soroban';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { TokenizedProperty } from '@/types';

interface PortfolioEntry {
  property: TokenizedProperty;
  shares: number;
  value: number;
  annualYield: number;
}

export default function PortfolioPage() {
  const { address, isConnected, connect } = useWallet();
  const [properties, setProperties] = useState<TokenizedProperty[]>([]);
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = useCallback(async () => {
    if (!address) {
      setEntries([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokenizedProperties = await fetchTokenizedProperties();
      setProperties(tokenizedProperties);

      const balances = await Promise.all(
        tokenizedProperties.map(async (property) => {
          const shares = await readTokenBalance(property.tokenAddress, address);
          const value = shares * property.sharePrice;
          const annualYield = value * (property.annualYieldRate / 100);

          return { property, shares, value, annualYield };
        }),
      );

      setEntries(balances.filter((entry) => entry.shares > 0));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load portfolio.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, entry) => ({
          value: acc.value + entry.value,
          annualYield: acc.annualYield + entry.annualYield,
        }),
        { value: 0, annualYield: 0 },
      ),
    [entries],
  );

  if (!isConnected || !address) {
    return (
      <main className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Connect your wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Connect your wallet to view the tokenized properties you own.
            </p>
            <Button onClick={() => void connect()}>Connect wallet</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold">My Portfolio</h1>
        <p className="text-muted-foreground">
          Shares held in tokenized properties and their estimated value.
        </p>
      </div>

      {isLoading && (
        <p className="text-muted-foreground">Loading your portfolio…</p>
      )}

      {error && !isLoading && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={() => void loadPortfolio()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && entries.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No holdings yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You do not hold shares in any tokenized property.
            </p>
            <Button asChild>
              <Link href="/properties">Browse properties</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && entries.length > 0 && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Estimated value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals.value)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Expected annual yield
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals.annualYield)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {entries.map(({ property, shares, value, annualYield }) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle>{property.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Shares held
                      </dt>
                      <dd className="text-lg font-semibold">
                        {formatNumber(shares)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Value at current share price
                      </dt>
                      <dd className="text-lg font-semibold">
                        {formatCurrency(value)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Expected annual yield
                      </dt>
                      <dd className="text-lg font-semibold">
                        {formatCurrency(annualYield)}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4">
                    <Button variant="outline" asChild>
                      <Link href={`/properties/${property.id}`}>
                        View property
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}