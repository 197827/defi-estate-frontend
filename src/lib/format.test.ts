import { describe, expect, it } from 'bun:test';
import { formatBps, formatUsdCents, shortenAddress } from './format';

describe('format helpers', () => {
  it('formats USD cents', () => {
    expect(formatUsdCents(500_000)).toBe('$5,000.00');
  });

  it('formats basis points as a percentage', () => {
    expect(formatBps(750)).toBe('7.50%');
  });

  it('shortens Stellar addresses', () => {
    const address = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H';
    expect(shortenAddress(address)).toBe('GBRP...OX2H');
    expect(shortenAddress('GABC')).toBe('GABC');
  });
});
