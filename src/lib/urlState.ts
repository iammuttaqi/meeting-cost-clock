import type { AttendeeRole, CurrencyCode } from '../types.ts';
import { CURRENCIES, DEFAULT_CURRENCY } from './currencies.ts';

export const DEFAULT_ROLES: AttendeeRole[] = [
  { id: 'role-1', name: 'Engineering', count: 4, rate: 95 },
  { id: 'role-2', name: 'Design', count: 2, rate: 80 },
  { id: 'role-3', name: 'Product', count: 1, rate: 90 },
];

/**
 * Sanitizes role name to safe alphanumeric / basic punctuation and max length.
 */
function sanitizeName(raw: string): string {
  return raw
    .replace(/[^\w\s-]/gi, '')
    .trim()
    .slice(0, 32) || 'Attendee';
}

/**
 * Parses URL search params or hash into validated roles and currency.
 */
export function parseUrlState(searchOrHash: string): {
  currency: CurrencyCode;
  roles: AttendeeRole[];
} {
  let search = searchOrHash;
  if (search.startsWith('#')) {
    search = search.slice(1);
  }
  if (search.startsWith('?')) {
    search = search.slice(1);
  }

  const params = new URLSearchParams(search);

  // 1. Currency
  const rawCurrency = (params.get('c') || params.get('currency') || '').toUpperCase();
  const currency: CurrencyCode = rawCurrency in CURRENCIES ? (rawCurrency as CurrencyCode) : DEFAULT_CURRENCY;

  // 2. Roles
  const rawRoles = params.get('r') || params.get('roles');
  if (!rawRoles) {
    // If currency changed from USD to INR/BDT with default setup, scale rates appropriately if wanted,
    // or return default roles
    return { currency, roles: DEFAULT_ROLES };
  }

  try {
    const roleItems = rawRoles.split(',');
    const parsed: AttendeeRole[] = [];

    for (let i = 0; i < roleItems.length && parsed.length < 25; i++) {
      const parts = roleItems[i].split(':');
      if (parts.length >= 3) {
        const name = sanitizeName(decodeURIComponent(parts[0]));
        const count = Math.min(9999, Math.max(1, parseInt(parts[1], 10) || 1));
        const rate = Math.min(1000000, Math.max(0, parseFloat(parts[2]) || 0));

        parsed.push({
          id: `role-url-${i + 1}`,
          name,
          count,
          rate,
        });
      }
    }

    if (parsed.length > 0) {
      return { currency, roles: parsed };
    }
  } catch {
    // Fallback on corrupt input
  }

  return { currency, roles: DEFAULT_ROLES };
}

/**
 * Serializes currency and roles into URL query string.
 */
export function serializeUrlState(currency: CurrencyCode, roles: AttendeeRole[]): string {
  const params = new URLSearchParams();
  params.set('c', currency);

  const rolesEncoded = roles
    .map((r) => `${encodeURIComponent(r.name.trim())}:${r.count}:${r.rate}`)
    .join(',');

  params.set('r', rolesEncoded);
  return `?${params.toString()}`;
}

/**
 * Updates browser URL in place without reload.
 */
export function syncUrlState(currency: CurrencyCode, roles: AttendeeRole[]): void {
  if (typeof window === 'undefined') return;
  const newQuery = serializeUrlState(currency, roles);
  const newUrl = `${window.location.pathname}${newQuery}`;
  window.history.replaceState(null, '', newUrl);
}
