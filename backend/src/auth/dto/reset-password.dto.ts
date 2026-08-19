import { IsString, Length, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/u)
  token!: string;

  @IsString()
  @Length(10, 72)
  @Matches(/[A-Za-z]/, { message: 'password must contain a letter' })
  @Matches(/\d/, { message: 'password must contain a number' })
  password!: string;
}
