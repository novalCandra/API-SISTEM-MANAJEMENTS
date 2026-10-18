import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/env';
import { newId } from '../utils/id';
import type { IStorageProvider, SaveFileOptions, StoredFile } from './interfaces';

export class LocalStorageProvider implements IStorageProvider {
  private readonly root: string;

  constructor(root: string = config.UPLOAD_DIR) {
    this.root = path.resolve(root);
  }

  private resolveSafe(relativePath: string): string {
    const target = path.resolve(this.root, relativePath);
    if (target !== this.root && !target.startsWith(this.root + path.sep)) {
      throw new Error('Path traversal detected');
    }
    return target;
  }

  async save(buffer: Buffer, options: SaveFileOptions): Promise<StoredFile> {
    const filename = `${newId()}.${options.extension}`;
    const relativePath = path.posix.join(options.userId, filename);
    const absolute = this.resolveSafe(relativePath);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, buffer);
    return { path: relativePath, url: this.buildUrl(relativePath) };
  }

  async remove(relativePath: string): Promise<void> {
    try {
      await unlink(this.resolveSafe(relativePath));
    } catch {
      return;
    }
  }

  async getUrl(relativePath: string): Promise<string> {
    return this.buildUrl(relativePath);
  }

  private buildUrl(relativePath: string): string {
    return `${config.PUBLIC_BASE_URL.replace(/\/$/, '')}/uploads/${relativePath}`;
  }
}
