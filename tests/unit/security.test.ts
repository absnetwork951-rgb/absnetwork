import { describe, it, expect } from 'vitest';
import {
  generateEntityId,
  generateSessionToken,
  generateOrderNumber,
} from '@/lib/db';

describe('CSPRNG identifier generation (SEC-001 regression)', () => {
  it('session token uses a crypto-random 32-byte value', () => {
    const token = generateSessionToken();
    expect(token.startsWith('sess_')).toBe(true);
    // 5 (prefix) + 64 hex chars = 69
    expect(token.length).toBe(69);
  });

  it('session tokens are unique at scale', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 5000; i++) {
      seen.add(generateSessionToken());
    }
    expect(seen.size).toBe(5000);
  });

  it('entity IDs carry the requested prefix and are unique', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      const id = generateEntityId('pkg');
      expect(id.startsWith('pkg_')).toBe(true);
      seen.add(id);
    }
    expect(seen.size).toBe(2000);
  });

  it('order numbers match the ABS-NET pattern and are unique', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      const num = generateOrderNumber(2026);
      expect(num).toMatch(/^ABS-NET-2026-[0-9A-F]{8}$/);
      seen.add(num);
    }
    expect(seen.size).toBe(2000);
  });
});