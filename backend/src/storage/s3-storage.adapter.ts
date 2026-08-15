import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
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

export function buildS3ClientConfig(
  config: ConfigService<Environment, true>,
): S3ClientConfig {
  const endpoint = config.get('S3_ENDPOINT', { infer: true });
  const urlStyle = config.get('S3_URL_STYLE', { infer: true });
  const accessKeyId = config.get('S3_ACCESS_KEY_ID', { infer: true });
  const secretAccessKey = config.get('S3_SECRET_ACCESS_KEY', { infer: true });

  return {
    region: config.getOrThrow('S3_REGION', { infer: true }),
    ...(endpoint === undefined ? {} : { endpoint }),
    ...(accessKeyId === undefined || secretAccessKey === undefined
      ? {}
      : { credentials: { accessKeyId, secretAccessKey } }),
    forcePathStyle: urlStyle === 'path',
  };
}

@Injectable()
export class S3StorageAdapter implements StorageService {
  private readonly bucket: string;
  private readonly client: S3Client;
  private readonly useAwsServerSideEncryption: boolean;

  constructor(config: ConfigService<Environment, true>, client?: S3Client) {
    this.bucket = config.getOrThrow('S3_BUCKET', { infer: true });
    this.useAwsServerSideEncryption =
      config.get('S3_ENDPOINT', { infer: true }) === undefined;
    this.client = client ?? new S3Client(buildS3ClientConfig(config));
  }

  async putPrivate(input: PrivateUpload): Promise<StoredObject> {
    assertSafeObjectKey(input.objectKey);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.objectKey,
        Body: input.contents,
        ContentLength: input.contents.byteLength,
        ...(this.useAwsServerSideEncryption
          ? { ServerSideEncryption: 'AES256' as const }
          : {}),
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
