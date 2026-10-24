const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatUsdCents(cents: number): string {
  return usd.format(cents / 100);
}

export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
