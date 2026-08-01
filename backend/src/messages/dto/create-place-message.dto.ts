import { Transform, Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

function trim(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreatePlaceMessageDto {
  @Transform(({ value }): unknown => trim(value))
  @IsString()
  @MaxLength(100)
  placeName!: string;

  @Transform(({ value }): unknown => trim(value))
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @Type(() => Number)
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsLongitude()
  longitude!: number;

  @Transform(({ value }): unknown => trim(value))
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
