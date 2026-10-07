import { describe, it, expect } from 'vitest';
import { formatCurrencyAmount, formatDuration, CURRENCIES } from './currencies.ts';

describe('currencies utilities', () => {
  it('formats USD correctly with commas and two decimals', () => {
    const formatted = formatCurrencyAmount(1234.56, 'USD');
    expect(formatted.symbol).toBe('$');
    expect(formatted.formattedText).toBe('$ 1,234.56');
    expect(formatted.parts).toEqual(['$', ' ', '1', ',', '2', '3', '4', '.', '5', '6']);
  });

  it('formats EUR correctly with € symbol', () => {
    const formatted = formatCurrencyAmount(850.5, 'EUR');
    expect(formatted.symbol).toBe('€');
    expect(formatted.formattedText).toBe('€ 850.50');
  });

  it('formats GBP correctly with £ symbol', () => {
    const formatted = formatCurrencyAmount(95.0, 'GBP');
    expect(formatted.symbol).toBe('£');
    expect(formatted.formattedText).toBe('£ 95.00');
  });

  it('formats INR correctly with ₹ symbol', () => {
    const formatted = formatCurrencyAmount(15000, 'INR');
    expect(formatted.symbol).toBe('₹');
    expect(formatted.formattedText).toBe('₹ 15,000.00');
  });

  it('formats BDT correctly with ৳ symbol', () => {
    const formatted = formatCurrencyAmount(50000, 'BDT');
    expect(formatted.symbol).toBe('৳');
    expect(formatted.formattedText).toBe('৳ 50,000.00');
  });

  it('handles 0 and negative amounts safely', () => {
    const zero = formatCurrencyAmount(0, 'USD');
    expect(zero.formattedText).toBe('$ 0.00');

    const neg = formatCurrencyAmount(-100, 'USD');
    expect(neg.formattedText).toBe('$ 0.00');
  });

  it('formats durations into HH:MM:SS format', () => {
    expect(formatDuration(0).formattedText).toBe('00:00:00');
    expect(formatDuration(45).formattedText).toBe('00:00:45');
    expect(formatDuration(125).formattedText).toBe('00:02:05');
    expect(formatDuration(3665).formattedText).toBe('01:01:05');
  });

  it('contains valid configurations for all 5 required currencies', () => {
    const required = ['USD', 'EUR', 'GBP', 'INR', 'BDT'] as const;
    for (const code of required) {
      expect(CURRENCIES[code]).toBeDefined();
      expect(CURRENCIES[code].symbol.length).toBeGreaterThan(0);
      expect(CURRENCIES[code].defaultRate).toBeGreaterThan(0);
    }
  });
});
