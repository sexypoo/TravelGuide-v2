import { formatTopicCardTime } from './presentation';

describe('question presentation', () => {
  it('uses a compact live-room timestamp for today and a date for older topics', () => {
    const reference = new Date('2026-08-18T03:00:00.000Z');

    expect(formatTopicCardTime('2026-08-18T01:28:00.000Z', reference)).toBe(
      '오늘 오전 10:28',
    );
    expect(formatTopicCardTime('2026-08-17T01:28:00.000Z', reference)).toBe(
      '8월 17일',
    );
  });
});
