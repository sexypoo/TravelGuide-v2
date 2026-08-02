export interface PrivateUpload {
  objectKey: string;
  contents: Buffer;
}

export interface StoredObject {
  objectKey: string;
  sizeBytes: number;
}

export interface StorageService {
  putPrivate(input: PrivateUpload): Promise<StoredObject>;
  getPrivateDownload(
    objectKey: string,
    expiresInSeconds: number,
  ): Promise<Readable>;
  delete(objectKey: string): Promise<void>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
import type { Readable } from 'node:stream';
