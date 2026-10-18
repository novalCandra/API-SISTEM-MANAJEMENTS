import { getRealtimeDatabase } from '../config/firebase';
import type { Logger } from '../config/logger';

export interface RealtimeEventValue {
  event: string;
  payload?: unknown;
  at: number;
  origin?: string;
}

const CLOCK_SKEW_MS = 5_000;

export const isFreshEvent = (value: unknown, now: number, windowMs: number): value is RealtimeEventValue => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<RealtimeEventValue>;
  if (typeof candidate.event !== 'string' || candidate.event.length === 0) return false;
  if (typeof candidate.at !== 'number' || !Number.isFinite(candidate.at)) return false;
  const age = now - candidate.at;
  return age >= -CLOCK_SKEW_MS && age <= windowMs;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export class RtdbEventStore {
  constructor(
    private readonly logger: Logger,
    private readonly origin: string,
    private readonly path = 'realtime',
  ) {}

  async publish(userId: string, event: string, payload?: unknown): Promise<void> {
    const value: RealtimeEventValue = {
      event,
      payload: payload ?? {},
      at: Date.now(),
      origin: this.origin,
    };
    await getRealtimeDatabase().ref(`${this.path}/${userId}`).push(value);
  }

  async cleanup(maxAgeMs: number): Promise<number> {
    const snapshot = await getRealtimeDatabase().ref(this.path).once('value');
    const users = snapshot.val();
    if (!isRecord(users)) return 0;

    const now = Date.now();
    const updates: Record<string, null> = {};

    for (const [userId, events] of Object.entries(users)) {
      if (!isRecord(events)) continue;
      for (const [eventId, event] of Object.entries(events)) {
        if (!isRecord(event)) continue;
        const at = Number(event.at);
        if (Number.isFinite(at) && now - at > maxAgeMs) {
          updates[`${this.path}/${userId}/${eventId}`] = null;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await getRealtimeDatabase().ref().update(updates);
      this.logger.debug({ removed: Object.keys(updates).length }, 'realtime events cleaned up');
    }
    return Object.keys(updates).length;
  }
}

export class RtdbCleanupJob {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly store: RtdbEventStore,
    private readonly logger: Logger,
    private readonly maxAgeMs: number,
    private readonly intervalMs: number,
  ) {}

  start(): void {
    if (this.timer) return;
    this.runOnce();
    this.timer = setInterval(() => this.runOnce(), this.intervalMs);
    this.timer.unref();
    this.logger.info({ intervalMs: this.intervalMs }, 'realtime cleanup job started');
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private runOnce(): void {
    this.store.cleanup(this.maxAgeMs).catch((error: unknown) => {
      this.logger.warn({ err: error }, 'realtime cleanup failed');
    });
  }
}
