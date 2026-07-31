import { ReportStatus, ReportTargetType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class AdminReportQueryDto {
  @IsOptional()
  @IsEnum(ReportStatus, { message: '신고 상태를 확인해 주세요.' })
  status?: ReportStatus;

  @IsOptional()
  @IsEnum(ReportTargetType, { message: '신고 대상 유형을 확인해 주세요.' })
  targetType?: ReportTargetType;
}
