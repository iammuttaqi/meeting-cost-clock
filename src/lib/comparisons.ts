import type { CurrencyCode } from '../types.ts';
import { CURRENCIES } from './currencies.ts';

export interface ComparisonItem {
  id: string;
  label: string;
  singular: string;
  plural: string;
  unitCostUsd: number;
}

export const COMPARISONS: ComparisonItem[] = [
  {
    id: 'coffee',
    label: 'Espresso Drinks',
    singular: 'espresso drink',
    plural: 'espresso drinks',
    unitCostUsd: 4.5,
  },
  {
    id: 'pizza',
    label: 'Large Pizzas',
    singular: 'large pizza',
    plural: 'large pizzas',
    unitCostUsd: 18.0,
  },
  {
    id: 'subscription',
    label: 'Software Seats',
    singular: 'month of software',
    plural: 'months of software',
    unitCostUsd: 25.0,
  },
  {
    id: 'headphones',
    label: 'ANC Headphones',
    singular: 'pair of ANC headphones',
    plural: 'pairs of ANC headphones',
    unitCostUsd: 349.0,
  },
];

/**
 * Calculates the quantity of a comparison item equivalent to the current cost.
 */
export function getComparisonCount(
  cost: number,
  currencyCode: CurrencyCode,
  unitCostUsd: number,
): number {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const localUnitCost = unitCostUsd * currency.comparisonScale;
  if (localUnitCost <= 0) return 0;
  return cost / localUnitCost;
}

/**
 * Formats count into human-friendly decimal string.
 */
export function formatComparisonCount(count: number): string {
  if (count < 0.05) return '0.0';
  if (count < 10) return count.toFixed(1);
  return Math.floor(count).toLocaleString('en-US');
}
