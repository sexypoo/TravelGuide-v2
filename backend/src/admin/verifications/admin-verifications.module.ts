import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../../storage/storage.module';
import { AdminVerificationsController } from './admin-verifications.controller';
import { AdminVerificationsService } from './admin-verifications.service';

@Module({
  imports: [AuthModule, PrismaModule, StorageModule],
  controllers: [AdminVerificationsController],
  providers: [AdminVerificationsService],
})
export class AdminVerificationsModule {}
