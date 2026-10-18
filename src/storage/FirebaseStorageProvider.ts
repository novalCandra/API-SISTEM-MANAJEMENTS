import { getStorageBucket } from '../config/firebase';
import { newId } from '../utils/id';
import type { IStorageProvider, SaveFileOptions, StoredFile } from './interfaces';

const SIGNED_URL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class FirebaseStorageProvider implements IStorageProvider {
  private readonly prefix = 'photos';

  async save(buffer: Buffer, options: SaveFileOptions): Promise<StoredFile> {
    const filename = `${newId()}.${options.extension}`;
    const storagePath = `${this.prefix}/${options.userId}/${filename}`;
    const file = getStorageBucket().bucket().file(storagePath);

    await file.save(buffer, {
      resumable: false,
      contentType: options.contentType,
      metadata: { cacheControl: 'private, max-age=0, no-transform' },
      preconditionOpts: { ifGenerationMatch: 0 },
    });

    const url = await this.getUrl(storagePath);
    return { path: storagePath, url };
  }

  async remove(storagePath: string): Promise<void> {
    try {
      await getStorageBucket().bucket().file(storagePath).delete();
    } catch {
      return;
    }
  }

  async getUrl(storagePath: string): Promise<string> {
    const [url] = await getStorageBucket().bucket().file(storagePath).getSignedUrl({
      action: 'read',
      version: 'v4',
      expires: Date.now() + SIGNED_URL_TTL_MS,
    });
    return url;
  }
}
