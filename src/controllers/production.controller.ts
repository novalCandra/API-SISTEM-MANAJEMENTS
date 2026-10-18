import type { Request, Response } from 'express';
import { SOCKET_EVENTS } from '../realtime/events';
import type { IRealtimePublisher } from '../realtime/publisher';
import type { ProductionBody } from '../schemas/production.schema';
import type { ProductionService } from '../services/production.service';
import { asyncHandler } from '../utils/asyncHandler';

export class ProductionController {
  constructor(
    private readonly productions: ProductionService,
    private readonly realtime: IRealtimePublisher,
  ) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const { since } = req.query as { since?: string };
    const data = await this.productions.list(req.user!.sub, since ? { since } : undefined);
    res.json({ data });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const { production, item } = await this.productions.create(userId, req.body as ProductionBody);
    this.realtime.emitToUser(userId, SOCKET_EVENTS.productionCreated, { production });
    this.realtime.emitToUser(userId, SOCKET_EVENTS.stockUpdated, { item });
    this.realtime.emitToUser(userId, SOCKET_EVENTS.dashboardRefresh, {});
    res.status(201).json({ data: { production, item } });
  });
}
