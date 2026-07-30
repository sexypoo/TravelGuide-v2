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
  @Matches(/[A-Za-z]/, { message: 'password must contain a letter' })
  @Matches(/\d/, { message: 'password must contain a number' })
  password!: string;

  @Transform(trimString)
  @IsString()
  @Length(2, 20)
  @Matches(/\S/u, { message: 'nickname must not be blank' })
  nickname!: string;

  @IsBoolean()
  @Equals(true)
  termsAgreed!: boolean;
}
