import { Injectable } from '@nestjs/common';
import type { RateLimitCategory } from './rate-limit.decorator';

interface WindowEntry {
  count: number;
  resetAt: number;
}

interface LimitDefinition {
  limit: number;
  windowMs: number;
}

const limits: Readonly<Record<RateLimitCategory, LimitDefinition>> = {
  LOGIN: { limit: 5, windowMs: 60 * 1000 },
  TOPIC: { limit: 5, windowMs: 10 * 60 * 1000 },
  ANSWER: { limit: 20, windowMs: 10 * 60 * 1000 },
  REPORT: { limit: 10, windowMs: 60 * 60 * 1000 },
  COMMUNITY_POST: { limit: 10, windowMs: 10 * 60 * 1000 },
  COMMUNITY_COMMENT: { limit: 30, windowMs: 10 * 60 * 1000 },
  PREORDER: { limit: 5, windowMs: 10 * 60 * 1000 },
};

export type RateLimitResult =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; retryAfterSeconds: number; resetAt: number };

@Injectable()
export class RateLimitService {
  private readonly windows = new Map<string, WindowEntry>();

  consume(
    category: RateLimitCategory,
    principal: string,
    now = Date.now(),
  ): RateLimitResult {
    const definition = limits[category];
    const key = `${category}:${principal}`;
    const existing = this.windows.get(key);
    const entry =
      existing === undefined || existing.resetAt <= now
        ? { count: 0, resetAt: now + definition.windowMs }
        : existing;
    if (entry.count >= definition.limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
        resetAt: entry.resetAt,
      };
    }
    entry.count += 1;
    this.windows.set(key, entry);
    if (this.windows.size > 1000) this.prune(now);
    return {
      allowed: true,
      remaining: definition.limit - entry.count,
      resetAt: entry.resetAt,
    };
  }

  clear(): void {
    this.windows.clear();
  }

  private prune(now: number): void {
    for (const [key, entry] of this.windows) {
      if (entry.resetAt <= now) this.windows.delete(key);
    }
  }
}
