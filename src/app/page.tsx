import Link from 'next/link';
import { Building2, Coins, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const FEATURES = [
  {
    icon: Building2,
    title: 'Fractional ownership',
    body: 'Each property is split into on-chain shares, so you can invest from a single share.',
  },
  {
    icon: Coins,
    title: 'Rental yield',
    body: 'Rental income is distributed to shareholders pro rata through a Soroban contract.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified assets',
    body: 'Every listing is reviewed before its token is minted, and holders are whitelisted.',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="space-y-6 pt-8 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Invest in real estate, one share at a time
        </h1>
        <p className="text-muted mx-auto max-w-2xl text-lg">
          defi-estate tokenizes income-producing properties on Stellar and pays rental yield
          directly to your wallet.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/properties">
            <Button>Browse properties</Button>
          </Link>
          <a href="https://developers.stellar.org/docs/build/smart-contracts/overview">
            <Button variant="secondary">How it works</Button>
          </a>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="space-y-3">
            <Icon className="text-primary h-6 w-6" aria-hidden />
            <h2 className="font-medium">{title}</h2>
            <p className="text-muted text-sm">{body}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
