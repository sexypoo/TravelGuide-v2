import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  STORAGE_SERVICE,
  type PrivateUpload,
  type StorageService,
} from './storage.service';

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : 'UnknownError';
}

@Injectable()
export class PrivateObjectLifecycleService {
  private readonly logger = new Logger(PrivateObjectLifecycleService.name);

  constructor(
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  async storeThenPersist<T>(
    upload: PrivateUpload,
    persist: () => Promise<T>,
  ): Promise<T> {
    try {
      await this.storage.putPrivate(upload);
    } catch (error: unknown) {
      this.logger.warn(`Private object upload failed: ${errorName(error)}`);
      throw error;
    }

    try {
      return await persist();
    } catch (error: unknown) {
      await this.deleteBestEffort(upload.objectKey);
      throw error;
    }
  }

  async deleteBestEffort(objectKey: string): Promise<void> {
    try {
      await this.storage.delete(objectKey);
    } catch (error: unknown) {
      this.logger.warn(`Private object cleanup failed: ${errorName(error)}`);
    }
  }
}
