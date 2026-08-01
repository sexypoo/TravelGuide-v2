import { CommunityPostCategory } from '@prisma/client';
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

export class CreateCommunityPostDto {
  @IsEnum(CommunityPostCategory)
  category!: CommunityPostCategory;

  @Transform(({ value }): unknown => trim(value))
  @IsOptional()
  @IsString()
  @MaxLength(60)
  areaText?: string;

  @Transform(({ value }): unknown => trim(value))
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @Transform(({ value }): unknown => trim(value))
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  content!: string;
}
