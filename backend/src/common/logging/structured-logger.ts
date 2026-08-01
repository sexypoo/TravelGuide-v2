import type { LoggerService, LogLevel } from '@nestjs/common';

type Writer = (line: string, level: LogLevel) => void;

function defaultWriter(line: string, level: LogLevel): void {
  const stream =
    level === 'error' || level === 'fatal' ? process.stderr : process.stdout;
  stream.write(`${line}\n`);
}

function messageText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.name;
  return 'Structured event';
}

function requestFields(value: unknown): Record<string, unknown> {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('event' in value) ||
    value.event !== 'http_request'
  ) {
    return { message: messageText(value) };
  }
  const record = value as Record<string, unknown>;
  return {
    event: 'http_request',
    requestId: record.requestId,
    method: record.method,
    path: record.path,
    status: record.status,
    durationMs: record.durationMs,
    ...(typeof record.userId === 'string' ? { userId: record.userId } : {}),
  };
}

export class StructuredLogger implements LoggerService {
  constructor(
    private readonly enabled = true,
    private readonly writer: Writer = defaultWriter,
  ) {}

  log(message: unknown, context?: string): void {
    this.write('log', message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write('error', message, context, trace);
  }

  warn(message: unknown, context?: string): void {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write('debug', message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write('verbose', message, context);
  }

  fatal(message: unknown, context?: string): void {
    this.write('fatal', message, context);
  }

  private write(
    level: LogLevel,
    message: unknown,
    context?: string,
    trace?: string,
  ): void {
    if (!this.enabled) return;
    this.writer(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        ...(context === undefined ? {} : { context }),
        ...requestFields(message),
        ...(trace === undefined ? {} : { trace }),
      }),
      level,
    );
  }
}
