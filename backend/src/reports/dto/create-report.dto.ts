import { ReportReason, ReportTargetType } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateReportDto {
  @IsEnum(ReportTargetType, { message: '신고 대상을 확인해 주세요.' })
  targetType!: ReportTargetType;

  @IsString({ message: '신고 대상을 확인해 주세요.' })
  @MinLength(1, { message: '신고 대상을 확인해 주세요.' })
  @MaxLength(64, { message: '신고 대상 식별자가 너무 깁니다.' })
  targetId!: string;

  @IsEnum(ReportReason, { message: '신고 사유를 선택해 주세요.' })
  reason!: ReportReason;

  @IsOptional()
  @IsString({ message: '상세 사유를 확인해 주세요.' })
  @MaxLength(300, { message: '상세 사유는 300자 이하여야 합니다.' })
  detail?: string;
}
