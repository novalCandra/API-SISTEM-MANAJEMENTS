import { NotFoundError, UnprocessableEntityError } from '../errors/AppError';
import type { IItemRepository, IPhotoRepository } from '../repositories/interfaces';
import type { IStorageProvider } from '../storage/interfaces';
import type { Photo } from '../types/domain';
import { newId } from '../utils/id';
import type { ImageProcessor } from './image.processor';

export interface PhotoUploadInput {
  buffer: Buffer;
  itemId?: string | null;
  itemName?: string;
  quantity: number;
  worker: string;
}

export class PhotoService {
  constructor(
    private readonly photos: IPhotoRepository,
    private readonly items: IItemRepository,
    private readonly storage: IStorageProvider,
    private readonly processor: ImageProcessor,
  ) {}

  async list(userId: string): Promise<Photo[]> {
    const photos = await this.photos.findByUser(userId);
    return Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        url: await this.storage.getUrl(photo.path),
      })),
    );
  }

  async upload(userId: string, input: PhotoUploadInput): Promise<Photo> {
    let itemName = input.itemName?.trim() ?? '';

    if (input.itemId) {
      const item = await this.items.findById(userId, input.itemId);
      if (!item) {
        throw new NotFoundError('Barang tidak ditemukan');
      }
      itemName = item.name;
    }

    if (!itemName) {
      throw new UnprocessableEntityError('Nama produk wajib diisi');
    }

    const processed = await this.processor.process(input.buffer);
    const stored = await this.storage.save(processed.buffer, {
      contentType: processed.contentType,
      extension: processed.extension,
      userId,
    });

    const photo: Photo = {
      id: newId(),
      userId,
      itemId: input.itemId ?? null,
      itemName,
      quantity: Math.floor(input.quantity),
      worker: input.worker.trim(),
      url: stored.url,
      path: stored.path,
      createdAt: new Date().toISOString(),
    };

    return this.photos.create(photo);
  }

  async remove(userId: string, id: string): Promise<void> {
    const photo = await this.photos.findById(userId, id);
    if (!photo) {
      throw new NotFoundError('Foto tidak ditemukan');
    }
    await this.storage.remove(photo.path);
    await this.photos.remove(userId, id);
  }
}
