import { describe, expect, it } from 'vitest';
import { computeStockStatus } from '../src/utils/stock';

describe('computeStockStatus', () => {
  it('returns HABIS when stock is zero', () => {
    expect(computeStockStatus({ stock: 0, minStock: 10 })).toBe('HABIS');
  });

  it('returns HABIS when stock is negative', () => {
    expect(computeStockStatus({ stock: -5, minStock: 10 })).toBe('HABIS');
  });

  it('returns MENIPIS when stock is at or below the minimum', () => {
    expect(computeStockStatus({ stock: 10, minStock: 10 })).toBe('MENIPIS');
    expect(computeStockStatus({ stock: 3, minStock: 10 })).toBe('MENIPIS');
  });

  it('returns AMAN when stock is above the minimum', () => {
    expect(computeStockStatus({ stock: 11, minStock: 10 })).toBe('AMAN');
  });
});
