'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { isConnected, requestAccess } from '@stellar/freighter-api';
import { Button } from '@/components/ui/Button';
import { shortenAddress } from '@/lib/format';

export function ConnectWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setError(null);
    const installed = await isConnected();
    if (!installed.isConnected) {
      setError('Install the Freighter wallet to continue');
      return;
    }
    const access = await requestAccess();
    if (access.error) {
      setError(String(access.error));
      return;
    }
    setAddress(access.address);
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-danger hidden text-xs sm:inline">{error}</span>}
      <Button variant="secondary" onClick={connect} disabled={address !== null}>
        <Wallet className="h-4 w-4" aria-hidden />
        {address ? shortenAddress(address) : 'Connect wallet'}
      </Button>
    </div>
  );
}
