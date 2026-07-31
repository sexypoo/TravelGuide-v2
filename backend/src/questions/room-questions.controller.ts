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
import { CreateQuestionDto } from './dto/create-question.dto';
import { ListQuestionsDto } from './dto/list-questions.dto';
import type {
  QuestionListResponse,
  QuestionResponse,
} from './dto/question.response';
import { QuestionsService } from './questions.service';

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
  create(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateQuestionDto,
  ): Promise<QuestionResponse> {
    return this.questions.create(slug, user, input);
  }
}
