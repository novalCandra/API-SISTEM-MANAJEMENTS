import { NotFoundError } from '../errors/AppError';
import type { IItemRepository, IProductionRepository } from '../repositories/interfaces';
import type { Production, StockView } from '../types/domain';
import { newId } from '../utils/id';
import { toStockView } from './item.service';

export interface ProductionInput {
  itemId: string;
  quantity: number;
  worker: string;
  note?: string | null;
}

export interface ProductionResult {
  production: Production;
  item: StockView;
}

export class ProductionService {
  constructor(
    private readonly items: IItemRepository,
    private readonly productions: IProductionRepository,
  ) {}

  async list(userId: string, options?: { since?: string }): Promise<Production[]> {
    return this.productions.findByUser(userId, options);
  }

  async create(userId: string, input: ProductionInput): Promise<ProductionResult> {
    const item = await this.items.findById(userId, input.itemId);
    if (!item) {
      throw new NotFoundError('Barang tidak ditemukan');
    }

    const quantity = Math.floor(input.quantity);
    const profit = (item.price - item.cost) * quantity;

    const production: Production = {
      id: newId(),
      userId,
      itemId: item.id,
      itemName: item.name,
      quantity,
      worker: input.worker.trim(),
      note: input.note?.trim() || null,
      unitCost: item.cost,
      unitPrice: item.price,
      profit,
      createdAt: new Date().toISOString(),
    };

    await this.productions.create(production);

    const updated = await this.items.update(userId, item.id, {
      stock: item.stock + quantity,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new NotFoundError('Barang tidak ditemukan');
    }

    return { production, item: toStockView(updated) };
  }
}
