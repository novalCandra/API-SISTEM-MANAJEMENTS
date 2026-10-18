import type { StockStatus } from '../types/domain';

interface StockInput {
  stock: number;
  minStock: number;
}

export const computeStockStatus = (item: StockInput): StockStatus => {
  if (item.stock <= 0) return 'HABIS';
  if (item.stock <= item.minStock) return 'MENIPIS';
  return 'AMAN';
};
