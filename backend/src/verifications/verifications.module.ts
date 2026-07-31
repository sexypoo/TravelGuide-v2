import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { VerificationsController } from './verifications.controller';
import { VerificationsService } from './verifications.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [VerificationsController],
  providers: [VerificationsService],
  exports: [VerificationsService],
})
export class VerificationsModule {}
