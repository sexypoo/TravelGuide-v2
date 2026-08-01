import { AnswerSourceType, CrowdLevel, EntryStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
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

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  waitMinutes?: number;

  @IsOptional()
  @IsEnum(CrowdLevel)
  crowdLevel?: CrowdLevel;

  @IsOptional()
  @IsEnum(EntryStatus)
  entryStatus?: EntryStatus;

  @IsOptional()
  @IsDateString()
  observedAt?: string;
}
