import type { Request, Response } from 'express';
import type { IRealtimePublisher } from '../realtime/publisher';
import { SOCKET_EVENTS } from '../realtime/events';
import type { ItemBody, ItemUpdateBody } from '../schemas/item.schema';
import type { ItemService } from '../services/item.service';
import type { StockView } from '../types/domain';
import { asyncHandler } from '../utils/asyncHandler';

const matchesQuery = (item: StockView, query: string): boolean => {
  const needle = query.toLowerCase();
  return (
    item.name.toLowerCase().includes(needle) ||
    (item.sku ?? '').toLowerCase().includes(needle)
  );
};

export class ItemController {
  constructor(
    private readonly items: ItemService,
    private readonly realtime: IRealtimePublisher,
  ) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const { q } = req.query as { q?: string };
    let data = await this.items.list(userId);
    if (q) {
      data = data.filter((item) => matchesQuery(item, q));
    }
    res.json({ data });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const item = await this.items.get(req.user!.sub, req.params.id as string);
    res.json({ data: item });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const item = await this.items.create(userId, req.body as ItemBody);
    this.realtime.emitToUser(userId, SOCKET_EVENTS.stockUpdated, { item });
    this.realtime.emitToUser(userId, SOCKET_EVENTS.dashboardRefresh, {});
    res.status(201).json({ data: item });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const item = await this.items.update(userId, req.params.id as string, req.body as ItemUpdateBody);
    this.realtime.emitToUser(userId, SOCKET_EVENTS.stockUpdated, { item });
    this.realtime.emitToUser(userId, SOCKET_EVENTS.dashboardRefresh, {});
    res.json({ data: item });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    await this.items.remove(userId, req.params.id as string);
    this.realtime.emitToUser(userId, SOCKET_EVENTS.stockUpdated, { id: req.params.id });
    this.realtime.emitToUser(userId, SOCKET_EVENTS.dashboardRefresh, {});
    res.status(204).send();
  });
}
