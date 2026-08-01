import { CommunityPostCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ListCommunityPostsDto {
  @IsOptional()
  @IsEnum(CommunityPostCategory)
  category?: CommunityPostCategory;

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
