import type { Request, Response } from 'express';
import type { DashboardService } from '../services/dashboard.service';
import { asyncHandler } from '../utils/asyncHandler';

export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  snapshot = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.dashboard.snapshot(req.user!.sub);
    res.json({ data });
  });
}
