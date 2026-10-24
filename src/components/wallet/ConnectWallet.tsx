'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, LogOut, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { shortenAddress } from '@/lib/format';
import { useWallet } from '@/components/wallet/WalletProvider';

export function ConnectWallet() {
  const { address, connect, disconnect, error } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function handleConnect() {
    await connect();
  }

  async function handleCopy() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      // Clipboard access may be unavailable; fail silently.
    }
  }

  function handleDisconnect() {
    disconnect();
    setOpen(false);
  }

  return (
    <div className="relative flex items-center gap-2" ref={containerRef}>
      {error && <span className="text-danger hidden text-xs sm:inline">{error}</span>}
      {address ? (
        <>
          <Button
            variant="secondary"
            onClick={() => setOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <Wallet className="h-4 w-4" aria-hidden />
            {shortenAddress(address)}
          </Button>
          {open && (
            <div
              role="menu"
              className="border-border bg-background absolute right-0 top-full z-50 mt-2 w-56 rounded-md border p-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleCopy}
                className="hover:bg-muted flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm"
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
                {copied ? 'Copied!' : 'Copy address'}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleDisconnect}
                className="hover:bg-muted flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Disconnect
              </button>
            </div>
          )}
        </>
      ) : (
        <Button variant="secondary" onClick={handleConnect}>
          <Wallet className="h-4 w-4" aria-hidden />
          Connect wallet
        </Button>
      )}
    </div>
  );
}