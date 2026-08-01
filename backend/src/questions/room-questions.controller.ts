import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';
import {
  MAX_MESSAGE_IMAGE_BYTES,
  type MessageImageFile,
  validateMessageImage,
} from '../messages/message-image-file';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ListQuestionsDto } from './dto/list-questions.dto';
import type {
  QuestionListResponse,
  QuestionResponse,
} from './dto/question.response';
import { QuestionsService } from './questions.service';

const questionImageUpload = FileInterceptor('image', {
  limits: { fileSize: MAX_MESSAGE_IMAGE_BYTES },
});

@Controller('rooms/:slug/questions')
@UseGuards(JwtAuthGuard)
export class RoomQuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @Get()
  list(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListQuestionsDto,
  ): Promise<QuestionListResponse> {
    return this.questions.list(slug, user, query);
  }

  @Post()
  @RateLimit('TOPIC')
  @UseGuards(RateLimitGuard)
  create(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateQuestionDto,
  ): Promise<QuestionResponse> {
    return this.questions.create(slug, user, input);
  }

  @Post('images')
  @RateLimit('TOPIC')
  @UseGuards(RateLimitGuard)
  @UseInterceptors(questionImageUpload)
  createWithImage(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateQuestionDto,
    @UploadedFile() image: MessageImageFile | undefined,
  ): Promise<QuestionResponse> {
    validateMessageImage(image);
    return this.questions.create(slug, user, input, new Date(), image);
  }
}
