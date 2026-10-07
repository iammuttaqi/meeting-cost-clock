import { describe, it, expect } from 'vitest';
import { COMPARISONS, getComparisonCount, formatComparisonCount } from './comparisons.ts';

describe('comparisons logic', () => {
  it('calculates coffee comparison count correctly in USD', () => {
    // 4.5 USD per coffee, so $45 meeting is 10 coffees
    const count = getComparisonCount(45, 'USD', 4.5);
    expect(count).toBeCloseTo(10, 1);
    expect(formatComparisonCount(count)).toBe('10');
  });

  it('calculates pizza comparison count correctly', () => {
    // 18 USD per pizza, $90 is 5 pizzas
    const count = getComparisonCount(90, 'USD', 18.0);
    expect(count).toBeCloseTo(5, 1);
    expect(formatComparisonCount(count)).toBe('5.0');
  });

  it('handles 0 cost with 0.0 display', () => {
    const count = getComparisonCount(0, 'USD', 4.5);
    expect(count).toBe(0);
    expect(formatComparisonCount(count)).toBe('0.0');
  });

  it('adjusts comparison scale across other currencies', () => {
    // INR scale is ~84.0, so unit cost for coffee is 4.5 * 84 = 378 INR
    const count = getComparisonCount(3780, 'INR', 4.5);
    expect(count).toBeCloseTo(10, 1);
  });

  it('contains four designated comparison items', () => {
    expect(COMPARISONS.length).toBe(4);
    const ids = COMPARISONS.map((c) => c.id);
    expect(ids).toContain('coffee');
    expect(ids).toContain('pizza');
    expect(ids).toContain('subscription');
    expect(ids).toContain('headphones');
  });
});
