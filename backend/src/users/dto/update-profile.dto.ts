import { Transform, type TransformFnParams } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { TRAVEL_STYLES, type TravelStyle } from '../travel-styles';

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

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsIn(TRAVEL_STYLES, { each: true })
  travelStyles?: TravelStyle[];
}
