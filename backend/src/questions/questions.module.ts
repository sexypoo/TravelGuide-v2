import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { RoomsModule } from '../rooms/rooms.module';
import { StorageModule } from '../storage/storage.module';
import { QuestionCommandService } from './question-command.service';
import { QuestionsController } from './questions.controller';
import { QuestionExpiryService } from './question-expiry.service';
import { QuestionQueryService } from './question-query.service';
import { RoomQuestionsController } from './room-questions.controller';

@Module({
  imports: [PrismaModule, RoomsModule, RealtimeModule, StorageModule],
  controllers: [RoomQuestionsController, QuestionsController],
  providers: [
    QuestionQueryService,
    QuestionCommandService,
    QuestionExpiryService,
  ],
})
export class QuestionsModule {}
