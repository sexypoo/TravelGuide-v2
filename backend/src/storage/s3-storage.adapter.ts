import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import type { Environment } from '../config/environment';
import type {
  PrivateUpload,
  StorageService,
  StoredObject,
} from './storage.service';
import { assertSafeObjectKey } from './storage-object-key';

@Injectable()
export class S3StorageAdapter implements StorageService {
  private readonly bucket: string;
  private readonly client: S3Client;

  constructor(config: ConfigService<Environment, true>, client?: S3Client) {
    this.bucket = config.getOrThrow('S3_BUCKET', { infer: true });
    this.client =
      client ??
      new S3Client({
        region: config.getOrThrow('S3_REGION', { infer: true }),
      });
  }

  async putPrivate(input: PrivateUpload): Promise<StoredObject> {
    assertSafeObjectKey(input.objectKey);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.objectKey,
        Body: input.contents,
        ContentLength: input.contents.byteLength,
        ServerSideEncryption: 'AES256',
      }),
    );
    return { objectKey: input.objectKey, sizeBytes: input.contents.byteLength };
  }

  async getPrivateDownload(
    objectKey: string,
    expiresInSeconds: number,
  ): Promise<Readable> {
    void expiresInSeconds;
    assertSafeObjectKey(objectKey);
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }),
    );
    if (!(response.Body instanceof Readable)) {
      throw new Error('Private storage object has no body');
    }
    return response.Body;
  }

  async delete(objectKey: string): Promise<void> {
    assertSafeObjectKey(objectKey);
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: objectKey }),
    );
  }
}
