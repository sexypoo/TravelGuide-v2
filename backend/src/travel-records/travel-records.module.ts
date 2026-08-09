import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TravelRecordsController } from './travel-records.controller';
import { TravelRecordsService } from './travel-records.service';

@Module({
  imports: [PrismaModule],
  controllers: [TravelRecordsController],
  providers: [TravelRecordsService],
})
export class TravelRecordsModule {}
