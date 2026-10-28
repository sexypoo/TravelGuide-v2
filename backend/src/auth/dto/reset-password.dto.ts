import { IsString, Length, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/u)
  token!: string;

  @IsString()
  @Length(10, 72)
  @Matches(/[A-Za-z]/, { message: '비밀번호에 영문자를 넣어 주세요.' })
  @Matches(/\d/, { message: '비밀번호에 숫자를 넣어 주세요.' })
  password!: string;
}
