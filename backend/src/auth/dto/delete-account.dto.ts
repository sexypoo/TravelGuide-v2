import { Transform, type TransformFnParams } from 'class-transformer';
import {
  Equals,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class DeleteAccountDto {
  @Transform(trimString)
  @IsString()
  @Equals('계정 삭제', { message: '확인 문구로 계정 삭제를 입력해 주세요.' })
  confirmation!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password?: string;
}
