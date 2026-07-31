import { IsString, MaxLength, MinLength } from 'class-validator';

export class AcceptAnswerDto {
  @IsString({ message: '채택할 답변을 선택해 주세요.' })
  @MinLength(1, { message: '채택할 답변을 선택해 주세요.' })
  @MaxLength(64, { message: '답변 식별자가 너무 깁니다.' })
  answerId!: string;
}
