import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class SocialStartQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  next?: string;

  @IsOptional()
  @IsIn(['login', 'register'])
  mode?: string;

  @IsOptional()
  @IsIn(['true'])
  termsAgreed?: string;
}

export class SocialCallbackDto {
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4096)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  error?: string;
}
