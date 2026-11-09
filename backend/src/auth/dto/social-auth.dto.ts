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

export interface SocialCallbackInput {
  code?: string;
  state?: string;
  error?: string;
}

const callbackLimits: Readonly<Record<keyof SocialCallbackInput, number>> = {
  code: 4096,
  state: 4096,
  error: 255,
};

/**
 * Reads only what the callback needs. Providers add their own fields (Google
 * sends scope, authuser, prompt; Apple may send user), so the callback can't
 * use a strict DTO: the global pipe would reject the login (#76).
 */
export function parseSocialCallback(raw: unknown): SocialCallbackInput {
  const input: SocialCallbackInput = {};
  if (typeof raw !== 'object' || raw === null) return input;
  const record = raw as Record<string, unknown>;
  for (const key of Object.keys(callbackLimits) as Array<
    keyof SocialCallbackInput
  >) {
    const value = record[key];
    if (typeof value === 'string' && value.length <= callbackLimits[key]) {
      input[key] = value;
    }
  }
  return input;
}
