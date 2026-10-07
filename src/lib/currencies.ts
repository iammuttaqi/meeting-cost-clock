import type { CurrencyCode, CurrencyConfig } from '../types.ts';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    defaultRate: 85,
    comparisonScale: 1.0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    defaultRate: 75,
    comparisonScale: 0.92,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    defaultRate: 65,
    comparisonScale: 0.78,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    defaultRate: 1500,
    comparisonScale: 84.0,
  },
  BDT: {
    code: 'BDT',
    symbol: '৳',
    name: 'Bangladeshi Taka',
    locale: 'bn-BD',
    defaultRate: 2000,
    comparisonScale: 120.0,
  },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

/**
 * Formats a currency amount into tabular mechanical digit string components:
 * symbol, integer part with commas, and 2-decimal fractional part.
 */
export function formatCurrencyAmount(amount: number, currencyCode: CurrencyCode): {
  symbol: string;
  formattedText: string;
  parts: string[];
} {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const safeAmount = Math.max(0, Number.isFinite(amount) ? amount : 0);

  // Format to 2 decimal places with standard commas for mechanical split-flap readability
  const fixed = safeAmount.toFixed(2);
  const [intPart, decPart] = fixed.split('.');

  // Format integer with commas
  const formattedInt = Number(intPart).toLocaleString('en-US');
  const fullText = `${currency.symbol} ${formattedInt}.${decPart}`;

  // Split into character cells for the split-flap board
  const parts = fullText.split('');

  return {
    symbol: currency.symbol,
    formattedText: fullText,
    parts,
  };
}

/**
 * Formats seconds into HH:MM:SS string and split characters.
 */
export function formatDuration(totalSeconds: number): {
  formattedText: string;
  parts: string[];
} {
  const safeSeconds = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    formattedText,
    parts: formattedText.split(''),
  };
}
