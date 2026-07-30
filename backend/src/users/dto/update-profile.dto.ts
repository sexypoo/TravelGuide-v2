import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class UpdateProfileDto {
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @Length(2, 20)
  @Matches(/\S/u, { message: 'nickname must not be blank' })
  nickname?: string;

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string | null;
}
