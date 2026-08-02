import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { buffer } from 'node:stream/consumers';
import { tmpdir } from 'node:os';
import type { Environment } from '../config/environment';
import { LocalStorageAdapter } from './local-storage.adapter';

describe('LocalStorageAdapter', () => {
  const storageDirectory = join(
    tmpdir(),
    `travelguide-storage-${randomUUID()}`,
  );
  const config = new ConfigService<Environment, true>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://example.test/travelguide',
    API_HOST: '127.0.0.1',
    API_PORT: 3001,
    WEB_ORIGIN: 'http://localhost:3000',
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN_SECONDS: 86_400,
    STORAGE_DRIVER: 'local',
    LOCAL_STORAGE_DIR: storageDirectory,
  });
  const adapter = new LocalStorageAdapter(config);

  afterAll(async () => {
    await rm(storageDirectory, { recursive: true, force: true });
  });

  it('rejects traversal and non-generated object keys', async () => {
    await expect(adapter.getPrivateDownload('../etc/passwd')).rejects.toThrow(
      'Unsafe private storage object key',
    );
    await expect(
      adapter.getPrivateDownload('verification/user-id/../../secret-file'),
    ).rejects.toThrow('Unsafe private storage object key');
  });

  it('accepts generated answer media keys inside private storage', async () => {
    const objectKey =
      'answer-media/room-id/123e4567-e89b-12d3-a456-426614174000';
    await adapter.putPrivate({ objectKey, contents: Buffer.from('answer') });
    const stream = await adapter.getPrivateDownload(objectKey);
    expect(stream).toBeInstanceOf(Readable);
    expect((await buffer(stream)).toString()).toBe('answer');
  });

  it('accepts generated question media keys inside private storage', async () => {
    const objectKey =
      'question-media/room-id/123e4567-e89b-12d3-a456-426614174000';
    await adapter.putPrivate({ objectKey, contents: Buffer.from('question') });
    const stream = await adapter.getPrivateDownload(objectKey);
    expect(stream).toBeInstanceOf(Readable);
    expect((await buffer(stream)).toString()).toBe('question');
  });
});
