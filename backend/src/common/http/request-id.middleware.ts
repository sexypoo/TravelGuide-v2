import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export function requestIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const startedAt = performance.now();
  const requestId = `req_${randomUUID()}`;
  request.requestId = requestId;
  response.setHeader('X-Request-Id', requestId);
  response.once('finish', () => {
    if (process.env.NODE_ENV === 'test') return;
    Logger.log(
      {
        event: 'http_request',
        requestId,
        method: request.method,
        path: request.path,
        status: response.statusCode,
        durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
        ...(request.user === undefined ? {} : { userId: request.user.id }),
      },
      'HTTP',
    );
  });
  next();
}
