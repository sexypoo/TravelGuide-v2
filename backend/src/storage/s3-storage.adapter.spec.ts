import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import { buffer } from 'node:stream/consumers';
import type { Environment } from '../config/environment';
import { S3StorageAdapter } from './s3-storage.adapter';

const objectKey = 'verification/user-1/123e4567-e89b-12d3-a456-426614174000';

function createAdapter(): {
  adapter: S3StorageAdapter;
  commands: unknown[];
  responses: unknown[];
} {
  const config = new ConfigService<Environment, true>({
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://database.example/travelguide',
    API_HOST: '127.0.0.1',
    API_PORT: 3001,
    WEB_ORIGIN: 'https://travel.example',
    JWT_SECRET: 'production-secret-longer-than-thirty-two-characters',
    JWT_EXPIRES_IN_SECONDS: 86_400,
    STORAGE_DRIVER: 's3',
    LOCAL_STORAGE_DIR: '.data/private-uploads',
    S3_REGION: 'ap-northeast-2',
    S3_BUCKET: 'travelguide-private',
  });
  const commands: unknown[] = [];
  const responses: unknown[] = [];
  const send = jest.fn((command: unknown): Promise<unknown> => {
    commands.push(command);
    return Promise.resolve(responses.shift());
  });
  return {
    adapter: new S3StorageAdapter(config, { send } as never),
    commands,
    responses,
  };
}

describe('S3StorageAdapter', () => {
  it('stores a private encrypted object without a public ACL', async () => {
    const { adapter, commands, responses } = createAdapter();
    responses.push({});

    await expect(
      adapter.putPrivate({ objectKey, contents: Buffer.from('proof') }),
    ).resolves.toEqual({ objectKey, sizeBytes: 5 });
    const command = commands[0];
    if (!(command instanceof PutObjectCommand)) {
      throw new Error('Expected PutObjectCommand');
    }
    expect(command.input).toMatchObject({
      Bucket: 'travelguide-private',
      Key: objectKey,
      ContentLength: 5,
      ServerSideEncryption: 'AES256',
    });
    expect(command.input).not.toHaveProperty('ACL');
  });

  it('streams private downloads and deletes only safe object keys', async () => {
    const { adapter, commands, responses } = createAdapter();
    responses.push({ Body: Readable.from('proof') });

    const stream = await adapter.getPrivateDownload(objectKey, 60);
    expect((await buffer(stream)).toString()).toBe('proof');
    expect(commands[0]).toBeInstanceOf(GetObjectCommand);

    responses.push({});
    await adapter.delete(objectKey);
    expect(commands[1]).toBeInstanceOf(DeleteObjectCommand);
    await expect(adapter.delete('../private')).rejects.toThrow(
      'Unsafe private storage object key',
    );
  });
});
