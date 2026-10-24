import Link from 'next/link';
import { Landmark } from 'lucide-react';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';

export function Header() {
  return (
    <header className="border-border border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Landmark className="text-primary h-5 w-5" aria-hidden />
          defi-estate
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/properties" className="text-muted hover:text-text">
            Properties
          </Link>
          <Link href="/portfolio" className="text-muted hover:text-text">
            Portfolio
          </Link>
          <ConnectWallet />
        </nav>
      </div>
    </header>
  );
}