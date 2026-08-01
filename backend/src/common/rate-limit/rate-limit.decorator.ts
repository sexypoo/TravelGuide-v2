import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_CATEGORY = 'travelguide:rate-limit-category';
export type RateLimitCategory = 'LOGIN' | 'TOPIC' | 'ANSWER' | 'REPORT';

export function RateLimit(
  category: RateLimitCategory,
): ReturnType<typeof SetMetadata> {
  return SetMetadata(RATE_LIMIT_CATEGORY, category);
}
