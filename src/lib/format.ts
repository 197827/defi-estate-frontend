const DEFAULT_LOCALE = 'en';

function createUsdFormatter(locale: string): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' });
}

const usdFormatters = new Map<string, Intl.NumberFormat>();

function getUsdFormatter(locale: string): Intl.NumberFormat {
  let formatter = usdFormatters.get(locale);
  if (!formatter) {
    formatter = createUsdFormatter(locale);
    usdFormatters.set(locale, formatter);
  }
  return formatter;
}

const percentFormatters = new Map<string, Intl.NumberFormat>();

function getPercentFormatter(locale: string): Intl.NumberFormat {
  let formatter = percentFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    percentFormatters.set(locale, formatter);
  }
  return formatter;
}

export function formatUsdCents(cents: number, locale: string = DEFAULT_LOCALE): string {
  return getUsdFormatter(locale).format(cents / 100);
}

export function formatBps(bps: number, locale: string = DEFAULT_LOCALE): string {
  return getPercentFormatter(locale).format(bps / 10000);
}

export function dollarsToCents(dollars: number | string): number {
  const value = typeof dollars === 'string' ? Number(dollars) : dollars;
  if (!Number.isFinite(value)) return NaN;
  return Math.round(value * 100);
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}