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
});
