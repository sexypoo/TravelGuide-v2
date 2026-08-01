import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import type { AnswerResponse } from './dto/answer.response';
import {
  MAX_MESSAGE_IMAGE_BYTES,
  type MessageImageFile,
  validateMessageImage,
} from '../messages/message-image-file';

const answerImageUpload = FileInterceptor('image', {
  limits: { fileSize: MAX_MESSAGE_IMAGE_BYTES },
});

@Controller('questions/:questionId/answers')
@UseGuards(JwtAuthGuard)
export class AnswersController {
  constructor(private readonly answers: AnswersService) {}

  @Post()
  @RateLimit('ANSWER')
  @UseGuards(RateLimitGuard)
  create(
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateAnswerDto,
  ): Promise<AnswerResponse> {
    return this.answers.create(questionId, user, input);
  }

  @Post('images')
  @RateLimit('ANSWER')
  @UseGuards(RateLimitGuard)
  @UseInterceptors(answerImageUpload)
  createWithImage(
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateAnswerDto,
    @UploadedFile() image: MessageImageFile | undefined,
  ): Promise<AnswerResponse> {
    validateMessageImage(image);
    return this.answers.create(questionId, user, input, new Date(), image);
  }
}

@Controller('answers')
@UseGuards(JwtAuthGuard)
export class AnswerImagesController {
  constructor(private readonly answers: AnswersService) {}

  @Get(':answerId/image')
  async image(
    @Param('answerId') answerId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() response: Response,
  ): Promise<void> {
    const image = await this.answers.getImage(answerId, user);
    response.setHeader('Content-Type', image.mimeType);
    response.setHeader('Cache-Control', 'private, max-age=300');
    await pipeline(createReadStream(image.path), response);
  }
}
