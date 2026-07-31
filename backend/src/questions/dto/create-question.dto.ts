import { QuestionCategory, QuestionUrgency } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

function trim(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateQuestionDto {
  @IsEnum(QuestionCategory)
  category!: QuestionCategory;

  @IsEnum(QuestionUrgency)
  urgency!: QuestionUrgency;

  @Transform(({ value }): unknown => trim(value))
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  content!: string;

  @Transform(({ value }): unknown => trim(value))
  @IsOptional()
  @IsString()
  @MaxLength(60)
  areaText?: string;
}
