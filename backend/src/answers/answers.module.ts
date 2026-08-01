import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { RoomsModule } from '../rooms/rooms.module';
import { StorageModule } from '../storage/storage.module';
import {
  AnswerImagesController,
  AnswersController,
} from './answers.controller';
import { AnswersService } from './answers.service';

@Module({
  imports: [PrismaModule, RoomsModule, RealtimeModule, StorageModule],
  controllers: [AnswersController, AnswerImagesController],
  providers: [AnswersService],
  exports: [AnswersService],
})
export class AnswersModule {}
