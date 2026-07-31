import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import type { AnswerResponse } from './dto/answer.response';

@Controller('questions/:questionId/answers')
@UseGuards(JwtAuthGuard)
export class AnswersController {
  constructor(private readonly answers: AnswersService) {}

  @Post()
  create(
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateAnswerDto,
  ): Promise<AnswerResponse> {
    return this.answers.create(questionId, user, input);
  }
}
