import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, resolve, sep } from 'node:path';
import type { Readable } from 'node:stream';
import type { Environment } from '../config/environment';
import type {
  PrivateUpload,
  StorageService,
  StoredObject,
} from './storage.service';
import { assertSafeObjectKey } from './storage-object-key';

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

  getPrivateDownload(objectKey: string): Promise<Readable> {
    return Promise.resolve().then(() =>
      createReadStream(this.resolveObjectPath(objectKey)),
    );
  }

  async delete(objectKey: string): Promise<void> {
    await rm(this.resolveObjectPath(objectKey), { force: true });
  }

  private resolveObjectPath(objectKey: string): string {
    assertSafeObjectKey(objectKey);

    const path = resolve(this.root, objectKey);
    if (!path.startsWith(`${this.root}${sep}`)) {
      throw new Error('Private storage object escaped its root');
    }

    return path;
  }
}
