import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class SaveTravelRecordDto {
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  title!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  destination!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/u)
  startedOn!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/u)
  endedOn!: string;

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string | null;
}
