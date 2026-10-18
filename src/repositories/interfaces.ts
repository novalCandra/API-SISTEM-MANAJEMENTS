import type {
  Item,
  Note,
  Photo,
  Production,
  RefreshTokenRecord,
  User,
} from '../types/domain';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, patch: Partial<User>): Promise<User | null>;
}

export interface IItemRepository {
  findAllByUser(userId: string): Promise<Item[]>;
  findById(userId: string, id: string): Promise<Item | null>;
  create(item: Item): Promise<Item>;
  update(userId: string, id: string, patch: Partial<Item>): Promise<Item | null>;
  remove(userId: string, id: string): Promise<boolean>;
}

export interface IProductionRepository {
  findByUser(userId: string, options?: { since?: string }): Promise<Production[]>;
  findById(userId: string, id: string): Promise<Production | null>;
  create(production: Production): Promise<Production>;
}

export interface IPhotoRepository {
  findByUser(userId: string): Promise<Photo[]>;
  findById(userId: string, id: string): Promise<Photo | null>;
  create(photo: Photo): Promise<Photo>;
  remove(userId: string, id: string): Promise<boolean>;
}

export interface INoteRepository {
  findByUser(userId: string): Promise<Note[]>;
  findById(userId: string, id: string): Promise<Note | null>;
  create(note: Note): Promise<Note>;
  update(userId: string, id: string, patch: Partial<Note>): Promise<Note | null>;
  remove(userId: string, id: string): Promise<boolean>;
}

export interface IRefreshTokenRepository {
  create(record: RefreshTokenRecord): Promise<RefreshTokenRecord>;
  findById(id: string): Promise<RefreshTokenRecord | null>;
  revoke(id: string, replacedBy?: string | null): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}

export interface Repositories {
  users: IUserRepository;
  items: IItemRepository;
  productions: IProductionRepository;
  photos: IPhotoRepository;
  notes: INoteRepository;
  refreshTokens: IRefreshTokenRepository;
}
