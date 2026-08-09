import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SearchPlacesDto {
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  q!: string;

  @Type(() => Number)
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @Type(() => Number)
  @IsOptional()
  @IsLongitude()
  longitude?: number;
}

export class NearbyPlacesDto {
  @Type(() => Number)
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsLongitude()
  longitude!: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(5000)
  radius = 1500;

  @Transform(({ value }): unknown => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean()
  openNow = true;
}
