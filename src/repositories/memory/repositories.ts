import type {
  Item,
  Note,
  Photo,
  Production,
  RefreshTokenRecord,
  User,
} from '../../types/domain';
import type {
  IItemRepository,
  INoteRepository,
  IPhotoRepository,
  IProductionRepository,
  IRefreshTokenRepository,
  IUserRepository,
} from '../interfaces';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export class MemoryStore {
  users = new Map<string, User>();
  items = new Map<string, Item>();
  productions = new Map<string, Production>();
  photos = new Map<string, Photo>();
  notes = new Map<string, Note>();
  refreshTokens = new Map<string, RefreshTokenRecord>();

  reset(): void {
    this.users.clear();
    this.items.clear();
    this.productions.clear();
    this.photos.clear();
    this.notes.clear();
    this.refreshTokens.clear();
  }
}

export class MemoryUserRepository implements IUserRepository {
  constructor(private readonly store: MemoryStore) {}

  async findById(id: string): Promise<User | null> {
    const user = this.store.users.get(id);
    return user ? clone(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.store.users.values()) {
      if (user.email === normalized) return clone(user);
    }
    return null;
  }

  async create(user: User): Promise<User> {
    this.store.users.set(user.id, clone(user));
    return clone(user);
  }

  async update(id: string, patch: Partial<User>): Promise<User | null> {
    const current = this.store.users.get(id);
    if (!current) return null;
    const next = { ...current, ...patch, id: current.id } as User;
    this.store.users.set(id, next);
    return clone(next);
  }
}

export class MemoryItemRepository implements IItemRepository {
  constructor(private readonly store: MemoryStore) {}

  async findAllByUser(userId: string): Promise<Item[]> {
    return [...this.store.items.values()]
      .filter((item) => item.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(clone);
  }

  async findById(userId: string, id: string): Promise<Item | null> {
    const item = this.store.items.get(id);
    if (!item || item.userId !== userId) return null;
    return clone(item);
  }

  async create(item: Item): Promise<Item> {
    this.store.items.set(item.id, clone(item));
    return clone(item);
  }

  async update(userId: string, id: string, patch: Partial<Item>): Promise<Item | null> {
    const current = this.store.items.get(id);
    if (!current || current.userId !== userId) return null;
    const next = { ...current, ...patch, id: current.id, userId: current.userId } as Item;
    this.store.items.set(id, next);
    return clone(next);
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const current = this.store.items.get(id);
    if (!current || current.userId !== userId) return false;
    return this.store.items.delete(id);
  }
}

export class MemoryProductionRepository implements IProductionRepository {
  constructor(private readonly store: MemoryStore) {}

  async findByUser(userId: string, options?: { since?: string }): Promise<Production[]> {
    return [...this.store.productions.values()]
      .filter((p) => p.userId === userId)
      .filter((p) => (options?.since ? p.createdAt >= options.since : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(clone);
  }

  async findById(userId: string, id: string): Promise<Production | null> {
    const found = this.store.productions.get(id);
    if (!found || found.userId !== userId) return null;
    return clone(found);
  }

  async create(production: Production): Promise<Production> {
    this.store.productions.set(production.id, clone(production));
    return clone(production);
  }
}

export class MemoryPhotoRepository implements IPhotoRepository {
  constructor(private readonly store: MemoryStore) {}

  async findByUser(userId: string): Promise<Photo[]> {
    return [...this.store.photos.values()]
      .filter((photo) => photo.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(clone);
  }

  async findById(userId: string, id: string): Promise<Photo | null> {
    const found = this.store.photos.get(id);
    if (!found || found.userId !== userId) return null;
    return clone(found);
  }

  async create(photo: Photo): Promise<Photo> {
    this.store.photos.set(photo.id, clone(photo));
    return clone(photo);
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const found = this.store.photos.get(id);
    if (!found || found.userId !== userId) return false;
    return this.store.photos.delete(id);
  }
}

export class MemoryNoteRepository implements INoteRepository {
  constructor(private readonly store: MemoryStore) {}

  async findByUser(userId: string): Promise<Note[]> {
    return [...this.store.notes.values()]
      .filter((note) => note.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(clone);
  }

  async findById(userId: string, id: string): Promise<Note | null> {
    const found = this.store.notes.get(id);
    if (!found || found.userId !== userId) return null;
    return clone(found);
  }

  async create(note: Note): Promise<Note> {
    this.store.notes.set(note.id, clone(note));
    return clone(note);
  }

  async update(userId: string, id: string, patch: Partial<Note>): Promise<Note | null> {
    const current = this.store.notes.get(id);
    if (!current || current.userId !== userId) return null;
    const next = { ...current, ...patch, id: current.id, userId: current.userId } as Note;
    this.store.notes.set(id, next);
    return clone(next);
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const found = this.store.notes.get(id);
    if (!found || found.userId !== userId) return false;
    return this.store.notes.delete(id);
  }
}

export class MemoryRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly store: MemoryStore) {}

  async create(record: RefreshTokenRecord): Promise<RefreshTokenRecord> {
    this.store.refreshTokens.set(record.id, clone(record));
    return clone(record);
  }

  async findById(id: string): Promise<RefreshTokenRecord | null> {
    const found = this.store.refreshTokens.get(id);
    return found ? clone(found) : null;
  }

  async revoke(id: string, replacedBy: string | null = null): Promise<void> {
    const found = this.store.refreshTokens.get(id);
    if (!found) return;
    found.revokedAt = new Date().toISOString();
    found.replacedBy = replacedBy;
    this.store.refreshTokens.set(id, found);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    for (const record of this.store.refreshTokens.values()) {
      if (record.userId === userId && !record.revokedAt) {
        record.revokedAt = new Date().toISOString();
      }
    }
  }
}
