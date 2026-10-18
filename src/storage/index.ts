import { config } from '../config/env';
import { FirebaseStorageProvider } from './FirebaseStorageProvider';
import { LocalStorageProvider } from './LocalStorageProvider';
import type { IStorageProvider } from './interfaces';

export function createStorageProvider(): IStorageProvider {
  if (config.STORAGE_DRIVER === 'firebase') {
    return new FirebaseStorageProvider();
  }
  return new LocalStorageProvider();
}

export type { IStorageProvider } from './interfaces';
