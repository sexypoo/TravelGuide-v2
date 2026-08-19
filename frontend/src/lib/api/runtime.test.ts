import { isIsoDate, isRecord } from './runtime';

describe('API runtime guards', () => {
  it('accepts non-null objects and arrays as records', () => {
    expect(isRecord({ value: true })).toBe(true);
    expect(isRecord([])).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord('value')).toBe(false);
  });

  it('accepts only canonical ISO timestamps', () => {
    expect(isIsoDate('2026-08-19T07:00:00.000Z')).toBe(true);
    expect(isIsoDate('2026-08-19')).toBe(false);
    expect(isIsoDate('not-a-date')).toBe(false);
    expect(isIsoDate(123)).toBe(false);
  });
});
