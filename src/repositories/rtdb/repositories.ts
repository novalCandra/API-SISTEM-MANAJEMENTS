import type { DataSnapshot, Query } from 'firebase-admin/database';
import { getRealtimeDatabase } from '../../config/firebase';
import { BadRequestError } from '../../errors/AppError';
import type {
  IItemRepository,
  INoteRepository,
  IPhotoRepository,
  IProductionRepository,
  IRefreshTokenRepository,
  IUserRepository,
} from '../interfaces';
import type {
  Item,
  Note,
  Photo,
  Production,
  RefreshTokenRecord,
  User,
} from '../../types/domain';

const SEGMENT = /^[A-Za-z0-9_-]{1,150}$/;

const seg = (value: string): string => {
  if (!SEGMENT.test(value)) {
    throw new BadRequestError('Referensi data tidak valid');
  }
  return value;
};

const childList = <T>(snapshot: DataSnapshot): T[] => {
  const value = snapshot.val() as Record<string, unknown> | null;
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).map(([key, entry]) => ({
    ...(entry as Record<string, unknown>),
    id: key,
  })) as T[];
};

const single = <T>(snapshot: DataSnapshot): T | null => {
  if (!snapshot.exists()) return null;
  const value = snapshot.val() as Record<string, unknown>;
  return { ...value, id: snapshot.key ?? '' } as T;
};

const write = async (path: string, data: unknown): Promise<void> => {
  await getRealtimeDatabase().ref(path).set(data);
};

export class RtdbUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const snapshot = await getRealtimeDatabase().ref(`users/${seg(id)}`).once('value');
    return single<User>(snapshot);
  }

  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await getRealtimeDatabase()
      .ref('users')
      .orderByChild('email')
      .equalTo(email.trim().toLowerCase())
      .limitToFirst(1)
      .once('value');
    return childList<User>(snapshot)[0] ?? null;
  }

  async create(user: User): Promise<User> {
    const { id, ...data } = user;
    await write(`users/${seg(id)}`, data);
    return user;
  }

  async update(id: string, patch: Partial<User>): Promise<User | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const { id: _ignored, ...data } = patch;
    await getRealtimeDatabase().ref(`users/${seg(id)}`).update(data);
    return this.findById(id);
  }
}

export class RtdbItemRepository implements IItemRepository {
  async findAllByUser(userId: string): Promise<Item[]> {
    const snapshot = await getRealtimeDatabase()
      .ref(`items/${seg(userId)}`)
      .orderByChild('name')
      .once('value');
    return childList<Item>(snapshot);
  }

  async findById(userId: string, id: string): Promise<Item | null> {
    const snapshot = await getRealtimeDatabase()
      .ref(`items/${seg(userId)}/${seg(id)}`)
      .once('value');
    const item = single<Item>(snapshot);
    if (!item || item.userId !== userId) return null;
    return item;
  }

  async create(item: Item): Promise<Item> {
    const { id, ...data } = item;
    await write(`items/${seg(item.userId)}/${seg(id)}`, data);
    return item;
  }

  async update(userId: string, id: string, patch: Partial<Item>): Promise<Item | null> {
    const existing = await this.findById(userId, id);
    if (!existing) return null;
    const { id: _ignored, userId: _owner, ...data } = patch;
    await write(`items/${seg(userId)}/${seg(id)}`, { ...existing, ...data });
    return this.findById(userId, id);
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const existing = await this.findById(userId, id);
    if (!existing) return false;
    await getRealtimeDatabase().ref(`items/${seg(userId)}/${seg(id)}`).remove();
    return true;
  }
}

export class RtdbProductionRepository implements IProductionRepository {
  async findByUser(userId: string, options?: { since?: string }): Promise<Production[]> {
    let query: Query = getRealtimeDatabase()
      .ref(`productions/${seg(userId)}`)
      .orderByChild('createdAt');
    if (options?.since) {
      query = query.startAt(options.since);
    }
    const snapshot = await query.once('value');
    return childList<Production>(snapshot).reverse();
  }

  async findById(userId: string, id: string): Promise<Production | null> {
    const snapshot = await getRealtimeDatabase()
      .ref(`productions/${seg(userId)}/${seg(id)}`)
      .once('value');
    const production = single<Production>(snapshot);
    if (!production || production.userId !== userId) return null;
    return production;
  }

  async create(production: Production): Promise<Production> {
    const { id, ...data } = production;
    await write(`productions/${seg(production.userId)}/${seg(id)}`, data);
    return production;
  }
}

export class RtdbPhotoRepository implements IPhotoRepository {
  async findByUser(userId: string): Promise<Photo[]> {
    const snapshot = await getRealtimeDatabase()
      .ref(`photos/${seg(userId)}`)
      .orderByChild('createdAt')
      .once('value');
    return childList<Photo>(snapshot).reverse();
  }

  async findById(userId: string, id: string): Promise<Photo | null> {
    const snapshot = await getRealtimeDatabase()
      .ref(`photos/${seg(userId)}/${seg(id)}`)
      .once('value');
    const photo = single<Photo>(snapshot);
    if (!photo || photo.userId !== userId) return null;
    return photo;
  }

  async create(photo: Photo): Promise<Photo> {
    const { id, ...data } = photo;
    await write(`photos/${seg(photo.userId)}/${seg(id)}`, data);
    return photo;
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const existing = await this.findById(userId, id);
    if (!existing) return false;
    await getRealtimeDatabase().ref(`photos/${seg(userId)}/${seg(id)}`).remove();
    return true;
  }
}

export class RtdbNoteRepository implements INoteRepository {
  async findByUser(userId: string): Promise<Note[]> {
    const snapshot = await getRealtimeDatabase()
      .ref(`notes/${seg(userId)}`)
      .orderByChild('createdAt')
      .once('value');
    return childList<Note>(snapshot).reverse();
  }

  async findById(userId: string, id: string): Promise<Note | null> {
    const snapshot = await getRealtimeDatabase()
      .ref(`notes/${seg(userId)}/${seg(id)}`)
      .once('value');
    const note = single<Note>(snapshot);
    if (!note || note.userId !== userId) return null;
    return note;
  }

  async create(note: Note): Promise<Note> {
    const { id, ...data } = note;
    await write(`notes/${seg(note.userId)}/${seg(id)}`, data);
    return note;
  }

  async update(userId: string, id: string, patch: Partial<Note>): Promise<Note | null> {
    const existing = await this.findById(userId, id);
    if (!existing) return null;
    const { id: _ignored, userId: _owner, ...data } = patch;
    await write(`notes/${seg(userId)}/${seg(id)}`, { ...existing, ...data });
    return this.findById(userId, id);
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const existing = await this.findById(userId, id);
    if (!existing) return false;
    await getRealtimeDatabase().ref(`notes/${seg(userId)}/${seg(id)}`).remove();
    return true;
  }
}

export class RtdbRefreshTokenRepository implements IRefreshTokenRepository {
  async create(record: RefreshTokenRecord): Promise<RefreshTokenRecord> {
    const { id, ...data } = record;
    await write(`refreshTokens/${seg(id)}`, data);
    return record;
  }

  async findById(id: string): Promise<RefreshTokenRecord | null> {
    const snapshot = await getRealtimeDatabase().ref(`refreshTokens/${seg(id)}`).once('value');
    return single<RefreshTokenRecord>(snapshot);
  }

  async revoke(id: string, replacedBy: string | null = null): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) return;
    const { id: _ignored, ...data } = existing;
    await write(`refreshTokens/${seg(id)}`, {
      ...data,
      revokedAt: new Date().toISOString(),
      replacedBy,
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const snapshot = await getRealtimeDatabase()
      .ref('refreshTokens')
      .orderByChild('userId')
      .equalTo(userId)
      .once('value');

    const updates: Record<string, unknown> = {};
    const revokedAt = new Date().toISOString();
    for (const [key, value] of Object.entries(snapshot.val() ?? {})) {
      const record = value as { revokedAt?: string | null };
      if (!record?.revokedAt && SEGMENT.test(key)) {
        updates[`refreshTokens/${key}/revokedAt`] = revokedAt;
        updates[`refreshTokens/${key}/replacedBy`] = null;
      }
    }

    if (Object.keys(updates).length > 0) {
      await getRealtimeDatabase().ref().update(updates);
    }
  }
}
