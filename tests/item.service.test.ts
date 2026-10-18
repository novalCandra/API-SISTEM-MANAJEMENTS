import { beforeEach, describe, expect, it } from 'vitest';
import { UnprocessableEntityError, NotFoundError } from '../src/errors/AppError';
import { MemoryItemRepository, MemoryStore } from '../src/repositories/memory/repositories';
import { ItemService } from '../src/services/item.service';

const userId = 'user-1';

describe('ItemService', () => {
  let service: ItemService;

  beforeEach(() => {
    service = new ItemService(new MemoryItemRepository(new MemoryStore()));
  });

  const base = {
    name: 'Kopi Bubuk',
    unit: 'pcs',
    stock: 20,
    minStock: 5,
    cost: 8000,
    price: 12000,
  };

  it('creates an item and computes AMAN status', async () => {
    const item = await service.create(userId, base);
    expect(item.name).toBe('Kopi Bubuk');
    expect(item.status).toBe('AMAN');
  });

  it('rejects a negative initial stock', async () => {
    await expect(service.create(userId, { ...base, stock: -1 })).rejects.toBeInstanceOf(
      UnprocessableEntityError,
    );
  });

  it('rejects stock below zero on update', async () => {
    const item = await service.create(userId, base);
    await expect(service.update(userId, item.id, { stock: -3 })).rejects.toBeInstanceOf(
      UnprocessableEntityError,
    );
  });

  it('prevents access to items of another user (IDOR)', async () => {
    const item = await service.create(userId, base);
    await expect(service.get('another-user', item.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('increments stock and flips the status to AMAN', async () => {
    const item = await service.create(userId, { ...base, stock: 0 });
    expect(item.status).toBe('HABIS');
    const updated = await service.incrementStock(userId, item.id, 8);
    expect(updated.stock).toBe(8);
    expect(updated.status).toBe('AMAN');
  });
});
