import type { Server } from 'socket.io';
import type { Logger } from '../config/logger';
import type { IRealtimePublisher } from './publisher';
import { RtdbEventStore } from './rtdbEventStore';

export type RealtimeDriver = 'socket' | 'rtdb';

export class RealtimeGateway implements IRealtimePublisher {
  private server: Server | null = null;

  constructor(
    private readonly driver: RealtimeDriver,
    private readonly events: RtdbEventStore,
    private readonly logger: Logger,
  ) {}

  attach(server: Server): void {
    this.server = server;
  }

  emitToUser(userId: string, event: string, payload?: unknown): void {
    if (this.driver !== 'rtdb') {
      this.emitDirect(userId, event, payload);
      return;
    }

    this.events.publish(userId, event, payload).catch((error: unknown) => {
      this.logger.error({ err: error, userId, event }, 'realtime publish failed, using socket');
      this.emitDirect(userId, event, payload);
    });
  }

  private emitDirect(userId: string, event: string, payload?: unknown): void {
    if (!this.server) return;
    this.server.to(userRoom(userId)).emit(event, payload ?? {});
  }
}

export const userRoom = (userId: string): string => `user:${userId}`;
