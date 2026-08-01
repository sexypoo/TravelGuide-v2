import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { RoomsModule } from '../rooms/rooms.module';
import { StorageModule } from '../storage/storage.module';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { RoomQuestionsController } from './room-questions.controller';

@Module({
  imports: [PrismaModule, RoomsModule, RealtimeModule, StorageModule],
  controllers: [RoomQuestionsController, QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
