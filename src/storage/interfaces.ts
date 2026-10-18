export interface StoredFile {
  path: string;
  url: string;
}

export interface SaveFileOptions {
  contentType: string;
  extension: string;
  userId: string;
}

export interface IStorageProvider {
  save(buffer: Buffer, options: SaveFileOptions): Promise<StoredFile>;
  remove(path: string): Promise<void>;
  getUrl(path: string): Promise<string>;
}
