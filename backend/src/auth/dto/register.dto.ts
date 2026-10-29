import { Transform, type TransformFnParams } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class RegisterDto {
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @Length(10, 72)
  @Matches(/[A-Za-z]/, { message: '비밀번호에 영문자를 넣어 주세요.' })
  @Matches(/\d/, { message: '비밀번호에 숫자를 넣어 주세요.' })
  password!: string;

  @Transform(trimString)
  @IsString()
  @Length(2, 20)
  @Matches(/\S/u, { message: '닉네임을 입력해 주세요.' })
  nickname!: string;

  @IsBoolean()
  @Equals(true)
  termsAgreed!: boolean;
}
