import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { LocalProofType } from '@prisma/client';

function trim(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateLocalVerificationDto {
  @Transform(({ value }): unknown => trim(value))
  @IsString()
  destinationId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsLongitude()
  longitude!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  accuracyMeters!: number;

  @IsISO8601({ strict: true, strictSeparator: true })
  capturedAt!: string;

  @IsEnum(LocalProofType)
  localProofType!: LocalProofType;

  @Transform(({ value }): unknown => trim(value))
  @IsString()
  @MinLength(30)
  @MaxLength(300)
  note!: string;
}
