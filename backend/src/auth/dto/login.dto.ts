import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class LoginDto {
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  password!: string;
}
