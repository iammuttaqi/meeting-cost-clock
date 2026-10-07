import React from 'react';
import type { CurrencyCode } from '../types.ts';
import { COMPARISONS, getComparisonCount, formatComparisonCount } from '../lib/comparisons.ts';

interface LiveComparisonsProps {
  cost: number;
  currency: CurrencyCode;
}

export const LiveComparisons: React.FC<LiveComparisonsProps> = ({ cost, currency }) => {
  return (
    <div className="comparisons-section" aria-label="Meeting cost comparisons">
      <div className="section-heading">
        <span>Opportunity Cost Equivalence</span>
      </div>

      <div className="comparisons-grid">
        {COMPARISONS.map((item) => {
          const count = getComparisonCount(cost, currency, item.unitCostUsd);
          const formattedCount = formatComparisonCount(count);
          const isSingle = Math.abs(count - 1.0) < 0.05;
          const label = isSingle ? item.singular : item.plural;
          const subText =
            count < 0.05
              ? `0 ${item.plural} burned so far`
              : `≈ ${formattedCount} ${label} burned so far`;

          return (
            <div key={item.id} className="comparison-card" data-testid={`comparison-${item.id}`}>
              <div className="comparison-val-row">
                <span className="comparison-val" data-testid={`comparison-count-${item.id}`}>
                  {formattedCount}
                </span>
              </div>
              <div className="comparison-title">{item.label}</div>
              <div className="comparison-sub">{subText}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
