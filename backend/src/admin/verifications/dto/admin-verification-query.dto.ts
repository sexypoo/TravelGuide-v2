import { VerificationStatus, VerificationType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

function trim(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class AdminVerificationQueryDto {
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;

  @IsOptional()
  @IsEnum(VerificationType)
  type?: VerificationType;

  @Transform(({ value }): unknown => trim(value))
  @IsOptional()
  @IsString()
  destinationId?: string;
}
