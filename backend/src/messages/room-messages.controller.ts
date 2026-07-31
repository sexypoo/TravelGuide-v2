import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { ListMessagesDto } from './dto/list-messages.dto';
import type {
  MessageListResponse,
  MessageResponse,
} from './dto/message.response';
import { MessagesService } from './messages.service';

@Controller('rooms/:slug/messages')
@UseGuards(JwtAuthGuard)
export class RoomMessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  list(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListMessagesDto,
  ): Promise<MessageListResponse> {
    return this.messages.list(slug, user, query);
  }

  @Post()
  create(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateMessageDto,
  ): Promise<MessageResponse> {
    return this.messages.create(slug, user, input);
  }
}
