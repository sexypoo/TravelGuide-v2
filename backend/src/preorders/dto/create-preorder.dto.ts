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

export class CreatePreorderDto {
  @Transform(trimString)
  @IsString({ message: '이름을 입력해 주세요.' })
  @Length(1, 30, { message: '이름은 30자 이내로 입력해 주세요.' })
  @Matches(/\S/u, { message: '이름을 입력해 주세요.' })
  name!: string;

  @Transform(normalizeEmail)
  @IsEmail({}, { message: '올바른 이메일 주소를 입력해 주세요.' })
  @MaxLength(320, { message: '이메일은 320자 이내로 입력해 주세요.' })
  email!: string;

  @IsBoolean({ message: '개인정보 수집 동의가 필요합니다.' })
  @Equals(true, { message: '개인정보 수집 동의가 필요합니다.' })
  privacyConsent!: boolean;
}
