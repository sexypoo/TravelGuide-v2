import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { QuestionCategory } from '@prisma/client';

export type QuestionListStatus = 'OPEN' | 'RESOLVED';

export class ListQuestionsDto {
  @IsOptional()
  @IsIn(['OPEN', 'RESOLVED'])
  status: QuestionListStatus = 'OPEN';

  @IsOptional()
  @IsEnum(QuestionCategory)
  category?: QuestionCategory;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cursor?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;
}
