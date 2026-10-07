export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'BDT';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  defaultRate: number; // default hourly rate benchmark for this currency
  comparisonScale: number; // relative purchasing scale roughly compared to USD 1.0
}

export interface AttendeeRole {
  id: string;
  name: string;
  count: number;
  rate: number;
}

export interface ClockState {
  isRunning: boolean;
  elapsedSeconds: number;
  totalCost: number;
}

export interface ComparisonMetric {
  id: string;
  name: string;
  baseCost: number; // in USD
  unit: string;
  icon: string;
}
