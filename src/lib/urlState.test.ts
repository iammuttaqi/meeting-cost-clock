import { describe, it, expect } from 'vitest';
import { parseUrlState, serializeUrlState, DEFAULT_ROLES } from './urlState.ts';

describe('urlState serialization and deserialization', () => {
  it('falls back to default currency and roles on empty input', () => {
    const res = parseUrlState('');
    expect(res.currency).toBe('USD');
    expect(res.roles).toEqual(DEFAULT_ROLES);
  });

  it('serializes and deserializes roles and currency roundtrip', () => {
    const originalRoles = [
      { id: 'r1', name: 'Engineering', count: 5, rate: 120 },
      { id: 'r2', name: 'Product', count: 2, rate: 95 },
    ];
    const query = serializeUrlState('EUR', originalRoles);
    expect(query).toContain('c=EUR');
    expect(query).toContain('Engineering%3A5%3A120');

    const parsed = parseUrlState(query);
    expect(parsed.currency).toBe('EUR');
    expect(parsed.roles.length).toBe(2);
    expect(parsed.roles[0].name).toBe('Engineering');
    expect(parsed.roles[0].count).toBe(5);
    expect(parsed.roles[0].rate).toBe(120);
    expect(parsed.roles[1].name).toBe('Product');
    expect(parsed.roles[1].count).toBe(2);
    expect(parsed.roles[1].rate).toBe(95);
  });

  it('safely clamps corrupted counts and rates', () => {
    const malformed = '?c=BDT&r=Dev:-10:-50,QA:99999999:999999999';
    const parsed = parseUrlState(malformed);
    expect(parsed.currency).toBe('BDT');
    expect(parsed.roles.length).toBe(2);
    // count must clamp to minimum 1
    expect(parsed.roles[0].count).toBe(1);
    // rate must clamp to minimum 0
    expect(parsed.roles[0].rate).toBe(0);
    // max clamps
    expect(parsed.roles[1].count).toBe(9999);
    expect(parsed.roles[1].rate).toBe(1000000);
  });

  it('falls back gracefully on unknown currency', () => {
    const parsed = parseUrlState('?c=XYZ&r=Lead:1:100');
    expect(parsed.currency).toBe('USD');
    expect(parsed.roles[0].name).toBe('Lead');
  });

  it('sanitizes malicious characters in role names', () => {
    const dangerous = '?c=USD&r=%3Cscript%3Ealert(1)%3C%2Fscript%3E:2:80';
    const parsed = parseUrlState(dangerous);
    expect(parsed.roles[0].name).not.toContain('<script>');
  });
});
