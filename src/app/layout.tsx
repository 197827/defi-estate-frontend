import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { WalletProvider } from '@/components/wallet/WalletProvider';

export const metadata: Metadata = {
  title: 'defi-estate',
  description: 'Own fractions of income-producing real estate on Stellar and earn rental yield.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <WalletProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}