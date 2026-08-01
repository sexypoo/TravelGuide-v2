import { StructuredLogger } from './structured-logger';

describe('StructuredLogger', () => {
  it('emits allow-listed request fields without private input', () => {
    const lines: string[] = [];
    const logger = new StructuredLogger(true, (line: string) =>
      lines.push(line),
    );
    logger.log(
      {
        event: 'http_request',
        requestId: 'req_1',
        method: 'POST',
        path: '/api/v1/reports',
        status: 201,
        durationMs: 12.5,
        userId: 'user-1',
        cookie: 'must-not-leak',
        gpsLat: 33.123,
      },
      'HTTP',
    );
    const output: unknown = JSON.parse(lines[0] ?? '{}');
    expect(output).toMatchObject({
      level: 'log',
      context: 'HTTP',
      event: 'http_request',
      requestId: 'req_1',
      status: 201,
      userId: 'user-1',
    });
    expect(lines[0]).not.toMatch(/cookie|must-not-leak|gpsLat|33\.123/);
  });
});
