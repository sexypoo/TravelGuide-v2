import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Environment } from '../config/environment';
import { LocalStorageAdapter } from './local-storage.adapter';
import { PrivateObjectLifecycleService } from './private-object-lifecycle.service';
import { S3StorageAdapter } from './s3-storage.adapter';
import { STORAGE_SERVICE, type StorageService } from './storage.service';

@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Environment, true>): StorageService =>
        config.get('STORAGE_DRIVER', { infer: true }) === 's3'
          ? new S3StorageAdapter(config)
          : new LocalStorageAdapter(config),
    },
    PrivateObjectLifecycleService,
  ],
  exports: [STORAGE_SERVICE, PrivateObjectLifecycleService],
})
export class StorageModule {}
