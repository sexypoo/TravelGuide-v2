import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ReviewDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ReviewVerificationDto {
  @IsEnum(ReviewDecision)
  decision!: ReviewDecision;

  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string | null;
}
