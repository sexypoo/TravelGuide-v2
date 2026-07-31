import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export type QuestionListStatus = 'OPEN' | 'RESOLVED';

export class ListQuestionsDto {
  @IsOptional()
  @IsIn(['OPEN', 'RESOLVED'])
  status: QuestionListStatus = 'OPEN';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cursor?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;
}
