import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTopicShareMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  questionId!: string;
}
