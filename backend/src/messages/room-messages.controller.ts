import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { pipeline } from 'node:stream/promises';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateImageMessageDto } from './dto/create-image-message.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreatePlaceMessageDto } from './dto/create-place-message.dto';
import { CreateTopicShareMessageDto } from './dto/create-topic-share-message.dto';
import { ListMessagesDto } from './dto/list-messages.dto';
import type {
  MessageListResponse,
  MessageResponse,
} from './dto/message.response';
import {
  MAX_MESSAGE_IMAGE_BYTES,
  type MessageImageFile,
} from './message-image-file';
import { MessagesService } from './messages.service';

const imageUpload = FileInterceptor('image', {
  limits: { fileSize: MAX_MESSAGE_IMAGE_BYTES },
});

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

  @Post('images')
  @UseInterceptors(imageUpload)
  createImage(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateImageMessageDto,
    @UploadedFile() file: MessageImageFile | undefined,
  ): Promise<MessageResponse> {
    return this.messages.createImage(slug, user, input, file);
  }

  @Post('places')
  createPlace(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreatePlaceMessageDto,
  ): Promise<MessageResponse> {
    return this.messages.createPlace(slug, user, input);
  }

  @Post('topics')
  createTopicShare(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateTopicShareMessageDto,
  ): Promise<MessageResponse> {
    return this.messages.createTopicShare(slug, user, input);
  }
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageImagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get(':messageId/image')
  async image(
    @Param('messageId') messageId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.messages.getImage(messageId, user);
    response.setHeader('Content-Type', image.mimeType);
    response.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(image.originalName)}`,
    );
    response.setHeader('Cache-Control', 'private, max-age=300');
    await pipeline(image.stream, response);
  }
}
