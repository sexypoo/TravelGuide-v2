import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { QuestionDetailResponse } from './dto/question.response';
import { QuestionsService } from './questions.service';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @Get(':questionId')
  get(
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<QuestionDetailResponse> {
    return this.questions.get(questionId, user);
  }
}
