import { ConfigService } from '@nestjs/config';
import type { Environment } from '../config/environment';
import { LocalStorageAdapter } from './local-storage.adapter';

describe('LocalStorageAdapter', () => {
  const config = new ConfigService<Environment, true>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://example.test/travelguide',
    API_PORT: 3001,
    WEB_ORIGIN: 'http://localhost:3000',
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN_SECONDS: 86_400,
    STORAGE_DRIVER: 'local',
    LOCAL_STORAGE_DIR: '/tmp/travelguide-storage-test',
  });
  const adapter = new LocalStorageAdapter(config);

  it('rejects traversal and non-generated object keys', async () => {
    await expect(adapter.getPrivateDownload('../etc/passwd')).rejects.toThrow(
      'Unsafe private storage object key',
    );
    await expect(
      adapter.getPrivateDownload('verification/user-id/../../secret-file'),
    ).rejects.toThrow('Unsafe private storage object key');
  });

  it('accepts generated answer media keys inside private storage', async () => {
    await expect(
      adapter.getPrivateDownload(
        'answer-media/room-id/123e4567-e89b-12d3-a456-426614174000',
      ),
    ).resolves.toContain('/answer-media/room-id/');
  });

  it('accepts generated question media keys inside private storage', async () => {
    await expect(
      adapter.getPrivateDownload(
        'question-media/room-id/123e4567-e89b-12d3-a456-426614174000',
      ),
    ).resolves.toContain('/question-media/room-id/');
  });
});
