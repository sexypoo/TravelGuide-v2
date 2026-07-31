import { AnswerSourceType } from '@prisma/client';
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

export class CreateAnswerDto {
  @Transform(({ value }): unknown => trim(value))
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  content!: string;

  @IsEnum(AnswerSourceType)
  sourceType!: AnswerSourceType;

  @Transform(({ value }): unknown => trim(value))
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  sourceUrl?: string | null;
}
