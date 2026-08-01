import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { RoomsModule } from '../rooms/rooms.module';
import { StorageModule } from '../storage/storage.module';
import { MessagesService } from './messages.service';
import {
  MessageImagesController,
  RoomMessagesController,
} from './room-messages.controller';

@Module({
  imports: [PrismaModule, RoomsModule, RealtimeModule, StorageModule],
  controllers: [RoomMessagesController, MessageImagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
