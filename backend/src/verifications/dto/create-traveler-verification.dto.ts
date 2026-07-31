import { Transform } from 'class-transformer';
import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

function trim(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateTravelerVerificationDto {
  @Transform(({ value }): unknown => trim(value))
  @IsString()
  destinationId!: string;

  @IsISO8601({ strict: true, strictSeparator: true })
  startsAt!: string;

  @IsISO8601({ strict: true, strictSeparator: true })
  endsAt!: string;

  @Transform(({ value }): unknown => trim(value))
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
