import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ReportReviewDecision {
  KEEP = 'KEEP',
  REMOVE = 'REMOVE',
  DISMISS = 'DISMISS',
}

export class ReviewReportDto {
  @IsEnum(ReportReviewDecision, { message: '처리 결정을 확인해 주세요.' })
  decision!: ReportReviewDecision;

  @IsOptional()
  @IsString({ message: '처리 메모를 확인해 주세요.' })
  @MaxLength(300, { message: '처리 메모는 300자 이하여야 합니다.' })
  note?: string;
}
