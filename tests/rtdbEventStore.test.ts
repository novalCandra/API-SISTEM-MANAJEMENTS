import { describe, expect, it } from 'vitest';
import { isFreshEvent } from '../src/realtime/rtdbEventStore';

describe('isFreshEvent (Firebase Realtime Database bridge)', () => {
  const now = 1_700_000_000_000;
  const windowMs = 30_000;

  it('accepts a fresh, well-formed event', () => {
    expect(
      isFreshEvent({ event: 'stock:updated', payload: { id: 'a' }, at: now - 1_000 }, now, windowMs),
    ).toBe(true);
  });

  it('accepts events slightly in the future (clock skew)', () => {
    expect(isFreshEvent({ event: 'stock:updated', at: now + 2_000 }, now, windowMs)).toBe(true);
  });

  it('rejects stale events beyond the window', () => {
    expect(isFreshEvent({ event: 'stock:updated', at: now - 60_000 }, now, windowMs)).toBe(false);
  });

  it('rejects events too far in the future', () => {
    expect(isFreshEvent({ event: 'stock:updated', at: now + 600_000 }, now, windowMs)).toBe(false);
  });

  it('rejects malformed payloads', () => {
    expect(isFreshEvent(null, now, windowMs)).toBe(false);
    expect(isFreshEvent('stock:updated', now, windowMs)).toBe(false);
    expect(isFreshEvent({ at: now }, now, windowMs)).toBe(false);
    expect(isFreshEvent({ event: '', at: now }, now, windowMs)).toBe(false);
    expect(isFreshEvent({ event: 'stock:updated', at: 'soon' }, now, windowMs)).toBe(false);
    expect(isFreshEvent({ event: 'stock:updated' }, now, windowMs)).toBe(false);
    expect(isFreshEvent({ event: 'stock:updated', at: Number.NaN }, now, windowMs)).toBe(false);
  });

  it('narrows the type when it returns true', () => {
    const value = { event: 'stock:updated', payload: { stock: 3 }, at: now };
    if (isFreshEvent(value, now, windowMs)) {
      expect(value.payload).toEqual({ stock: 3 });
    } else {
      expect.fail('expected the event to be fresh');
    }
  });
});
