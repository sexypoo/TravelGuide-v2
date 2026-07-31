import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, resolve, sep } from 'node:path';
import type { Environment } from '../config/environment';
import type {
  PrivateUpload,
  StorageService,
  StoredObject,
} from './storage.service';

const SAFE_OBJECT_KEY = /^verification\/[A-Za-z0-9_-]+\/[0-9a-f-]{36}$/;

@Injectable()
export class LocalStorageAdapter implements StorageService {
  private readonly root: string;

  constructor(config: ConfigService<Environment, true>) {
    const configuredRoot = config.get('LOCAL_STORAGE_DIR', { infer: true });
    this.root = isAbsolute(configuredRoot)
      ? resolve(configuredRoot)
      : resolve(process.cwd(), configuredRoot);
  }

  async putPrivate(input: PrivateUpload): Promise<StoredObject> {
    const path = this.resolveObjectPath(input.objectKey);
    await mkdir(resolve(path, '..'), { recursive: true, mode: 0o700 });
    await writeFile(path, input.contents, { flag: 'wx', mode: 0o600 });
    return { objectKey: input.objectKey, sizeBytes: input.contents.byteLength };
  }

  getPrivateDownload(objectKey: string): Promise<string> {
    return Promise.resolve().then(() => this.resolveObjectPath(objectKey));
  }

  async delete(objectKey: string): Promise<void> {
    await rm(this.resolveObjectPath(objectKey), { force: true });
  }

  private resolveObjectPath(objectKey: string): string {
    if (!SAFE_OBJECT_KEY.test(objectKey)) {
      throw new Error('Unsafe private storage object key');
    }

    const path = resolve(this.root, objectKey);
    if (!path.startsWith(`${this.root}${sep}`)) {
      throw new Error('Private storage object escaped its root');
    }

    return path;
  }
}
