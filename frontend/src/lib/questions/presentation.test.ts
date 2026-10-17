import { formatRelativeTime, formatTopicCardTime } from './presentation';

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

describe('formatRelativeTime', () => {
  const now = new Date('2026-10-18T05:00:00.000Z');

  it('uses minutes and hours for recent times and a date after a day', () => {
    expect(formatRelativeTime('2026-10-18T04:59:40.000Z', now)).toBe('방금');
    expect(formatRelativeTime('2026-10-18T04:48:00.000Z', now)).toBe('12분 전');
    expect(formatRelativeTime('2026-10-18T02:00:00.000Z', now)).toBe(
      '3시간 전',
    );
    expect(formatRelativeTime('2026-10-16T05:00:00.000Z', now)).toBe(
      '10월 16일',
    );
  });
});
