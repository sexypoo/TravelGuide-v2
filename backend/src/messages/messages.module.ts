import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { RoomsModule } from '../rooms/rooms.module';
import { MessagesService } from './messages.service';
import { RoomMessagesController } from './room-messages.controller';

@Module({
  imports: [PrismaModule, RoomsModule, RealtimeModule],
  controllers: [RoomMessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
