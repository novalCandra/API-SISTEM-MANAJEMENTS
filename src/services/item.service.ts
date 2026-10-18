import { NotFoundError, UnprocessableEntityError } from '../errors/AppError';
import type { IItemRepository } from '../repositories/interfaces';
import type { Item, StockView } from '../types/domain';
import { newId } from '../utils/id';
import { computeStockStatus } from '../utils/stock';

export interface ItemInput {
  name: string;
  sku?: string | null;
  unit: string;
  stock: number;
  minStock: number;
  cost: number;
  price: number;
}

export const toStockView = (item: Item): StockView => ({
  ...item,
  status: computeStockStatus(item),
});

export class ItemService {
  constructor(private readonly items: IItemRepository) {}

  async list(userId: string): Promise<StockView[]> {
    const items = await this.items.findAllByUser(userId);
    return items.map(toStockView);
  }

  async get(userId: string, id: string): Promise<Item> {
    const item = await this.items.findById(userId, id);
    if (!item) {
      throw new NotFoundError('Barang tidak ditemukan');
    }
    return item;
  }

  async create(userId: string, input: ItemInput): Promise<StockView> {
    this.assertBusinessRules(input);
    const now = new Date().toISOString();
    const item: Item = {
      id: newId(),
      userId,
      name: input.name.trim(),
      sku: input.sku?.trim() || null,
      unit: input.unit.trim(),
      stock: input.stock,
      minStock: input.minStock,
      cost: input.cost,
      price: input.price,
      createdAt: now,
      updatedAt: now,
    };
    const created = await this.items.create(item);
    return toStockView(created);
  }

  async update(userId: string, id: string, input: Partial<ItemInput>): Promise<StockView> {
    const current = await this.items.findById(userId, id);
    if (!current) {
      throw new NotFoundError('Barang tidak ditemukan');
    }

    if (input.stock !== undefined && input.stock < 0) {
      throw new UnprocessableEntityError('Stok tidak boleh kurang dari 0');
    }
    if (input.minStock !== undefined && input.minStock < 0) {
      throw new UnprocessableEntityError('Stok minimum tidak boleh kurang dari 0');
    }
    if (input.cost !== undefined && input.cost < 0) {
      throw new UnprocessableEntityError('Harga modal tidak boleh negatif');
    }
    if (input.price !== undefined && input.price < 0) {
      throw new UnprocessableEntityError('Harga jual tidak boleh negatif');
    }

    const updated = await this.items.update(userId, id, {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.sku !== undefined ? { sku: input.sku?.trim() || null } : {}),
      ...(input.unit !== undefined ? { unit: input.unit.trim() } : {}),
      ...(input.stock !== undefined ? { stock: input.stock } : {}),
      ...(input.minStock !== undefined ? { minStock: input.minStock } : {}),
      ...(input.cost !== undefined ? { cost: input.cost } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      throw new NotFoundError('Barang tidak ditemukan');
    }
    return toStockView(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    const removed = await this.items.remove(userId, id);
    if (!removed) {
      throw new NotFoundError('Barang tidak ditemukan');
    }
  }

  async incrementStock(userId: string, id: string, delta: number): Promise<StockView> {
    const current = await this.get(userId, id);
    const nextStock = current.stock + delta;
    if (nextStock < 0) {
      throw new UnprocessableEntityError('Stok tidak boleh kurang dari 0');
    }
    const updated = await this.items.update(userId, id, {
      stock: nextStock,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new NotFoundError('Barang tidak ditemukan');
    }
    return toStockView(updated);
  }

  private assertBusinessRules(input: ItemInput): void {
    if (input.stock < 0) {
      throw new UnprocessableEntityError('Stok tidak boleh kurang dari 0');
    }
    if (input.minStock < 0) {
      throw new UnprocessableEntityError('Stok minimum tidak boleh kurang dari 0');
    }
    if (input.cost < 0 || input.price < 0) {
      throw new UnprocessableEntityError('Harga tidak boleh negatif');
    }
  }
}
