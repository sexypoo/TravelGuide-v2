import { Injectable } from '@nestjs/common';
import type { StorageService, StoredObject } from './storage.service';

@Injectable()
export class S3StorageAdapter implements StorageService {
  constructor() {
    throw new Error(
      'S3 private storage is not configured: install and configure the production adapter before deployment',
    );
  }

  putPrivate(): Promise<StoredObject> {
    return Promise.reject(new Error('S3 private storage is unavailable'));
  }

  getPrivateDownload(): Promise<string> {
    return Promise.reject(new Error('S3 private storage is unavailable'));
  }

  delete(): Promise<void> {
    return Promise.reject(new Error('S3 private storage is unavailable'));
  }
}
