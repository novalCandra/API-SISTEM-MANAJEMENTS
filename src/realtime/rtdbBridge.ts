import type { DataSnapshot, Query } from 'firebase-admin/database';
import type { Server } from 'socket.io';
import { getRealtimeDatabase } from '../config/firebase';
import type { Logger } from '../config/logger';
import { userRoom } from './gateway';
import { isFreshEvent } from './rtdbEventStore';

/**
 * Menjembatani Firebase Realtime Database -> Socket.IO.
 * Server menulis event ke `realtime/{userId}`, bridge meneruskannya ke room
 * Socket.IO milik user tersebut (berlaku lintas instance karena semua instance
 * membaca dari RTDB yang sama).
 */
export interface ISocketBridge {
  setServer(server: Server): void;
  onSocketConnected(userId: string): void;
  onSocketDisconnected(userId: string): void;
  dispose(): void;
}

export class NoopSocketBridge implements ISocketBridge {
  setServer(): void {}
  onSocketConnected(): void {}
  onSocketDisconnected(): void {}
  dispose(): void {}
}

interface Subscription {
  query: Query;
  handler: (snapshot: DataSnapshot) => void;
  count: number;
}

const DEFAULT_EVENT_WINDOW_MS = 30_000;

export class RtdbSocketBridge implements ISocketBridge {
  private server: Server | null = null;
  private readonly subscriptions = new Map<string, Subscription>();

  constructor(
    private readonly logger: Logger,
    private readonly windowMs: number = DEFAULT_EVENT_WINDOW_MS,
    private readonly path: string = 'realtime',
  ) {}

  setServer(server: Server): void {
    this.server = server;
  }

  onSocketConnected(userId: string): void {
    const existing = this.subscriptions.get(userId);
    if (existing) {
      existing.count += 1;
      return;
    }

    try {
      const query = getRealtimeDatabase().ref(`${this.path}/${userId}`).limitToLast(50);
      const handler = (snapshot: DataSnapshot) => this.handle(userId, snapshot);
      query.on('child_added', handler);
      this.subscriptions.set(userId, { query, handler, count: 1 });
      this.logger.debug({ userId }, 'realtime bridge subscribed');
    } catch (error) {
      this.logger.error({ err: error, userId }, 'realtime bridge subscribe failed');
    }
  }

  onSocketDisconnected(userId: string): void {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) return;
    subscription.count -= 1;
    if (subscription.count > 0) return;
    subscription.query.off('child_added', subscription.handler);
    this.subscriptions.delete(userId);
    this.logger.debug({ userId }, 'realtime bridge unsubscribed');
  }

  dispose(): void {
    for (const [userId, subscription] of this.subscriptions) {
      subscription.query.off('child_added', subscription.handler);
      this.subscriptions.delete(userId);
    }
  }

  private handle(userId: string, snapshot: DataSnapshot): void {
    try {
      const value = snapshot.val();
      if (!isFreshEvent(value, Date.now(), this.windowMs)) return;
      this.server?.to(userRoom(userId)).emit(value.event, value.payload ?? {});
    } catch (error) {
      this.logger.error({ err: error, userId }, 'realtime bridge handle failed');
    }
  }
}
