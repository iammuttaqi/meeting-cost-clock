import React from 'react';
import type { CurrencyCode } from '../types.ts';
import { CURRENCIES } from '../lib/currencies.ts';

interface CurrencyPickerProps {
  currentCurrency: CurrencyCode;
  onSelectCurrency: (code: CurrencyCode) => void;
  disabled?: boolean;
}

const ORDERED_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'INR', 'BDT'];

export const CurrencyPicker: React.FC<CurrencyPickerProps> = ({
  currentCurrency,
  onSelectCurrency,
  disabled = false,
}) => {
  return (
    <div className="currency-picker-row">
      <div className="currency-picker-label" id="currency-picker-label">
        Meeting Currency
      </div>
      <div
        className="currency-buttons"
        role="group"
        aria-labelledby="currency-picker-label"
      >
        {ORDERED_CURRENCIES.map((code) => {
          const cfg = CURRENCIES[code];
          const isActive = currentCurrency === code;
          return (
            <button
              key={code}
              type="button"
              className={`currency-btn ${isActive ? 'active' : ''}`}
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => onSelectCurrency(code)}
            >
              <span>{cfg.symbol}</span>
              <span>{cfg.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
