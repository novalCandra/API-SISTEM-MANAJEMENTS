import type {
  IItemRepository,
  IProductionRepository,
  IUserRepository,
} from '../repositories/interfaces';
import type { DashboardSnapshot } from '../types/domain';
import { toStockView } from './item.service';

const startOfTodayIso = (): string => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
};

export class DashboardService {
  constructor(
    private readonly items: IItemRepository,
    private readonly productions: IProductionRepository,
    private readonly users: IUserRepository,
  ) {}

  async snapshot(userId: string): Promise<DashboardSnapshot> {
    const since = startOfTodayIso();
    const [user, items, todayProductions] = await Promise.all([
      this.users.findById(userId),
      this.items.findAllByUser(userId),
      this.productions.findByUser(userId, { since }),
    ]);

    const output = todayProductions.reduce((sum, item) => sum + item.quantity, 0);
    const profit = todayProductions.reduce((sum, item) => sum + item.profit, 0);

    const stocks = items.map(toStockView);
    const lowStock = stocks.filter((stock) => stock.status !== 'AMAN');
    const dailyTarget = user?.dailyTarget ?? 0;
    const percent = dailyTarget > 0 ? Math.min(100, Math.round((output / dailyTarget) * 100)) : 0;

    return {
      target: { dailyTarget, achieved: output, percent },
      today: { output, profit, transactions: todayProductions.length },
      stocks,
      lowStock,
    };
  }
}
