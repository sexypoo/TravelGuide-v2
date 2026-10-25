import { TRAVEL_STYLES } from '@/lib/api/profile';
import {
  isTravelTypeKey,
  scoreTravelTest,
  TRAVEL_TEST_QUESTIONS,
  TRAVEL_TYPE_KEYS,
  TRAVEL_TYPES,
} from './content';

describe('travel type test content', () => {
  it('asks ten questions with four distinct types each', () => {
    expect(TRAVEL_TEST_QUESTIONS).toHaveLength(10);
    for (const question of TRAVEL_TEST_QUESTIONS) {
      const types = question.options.map((option) => option.type);
      expect(new Set(types).size).toBe(4);
    }
  });

  it('lets every type win and gives each at least four answers', () => {
    for (const key of TRAVEL_TYPE_KEYS) {
      const answers = TRAVEL_TEST_QUESTIONS.flatMap((question) =>
        question.options.filter((option) => option.type === key),
      );
      expect(answers.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('maps types to existing profile travel styles and valid matches', () => {
    for (const key of TRAVEL_TYPE_KEYS) {
      const type = TRAVEL_TYPES[key];
      for (const style of type.styles) {
        expect(TRAVEL_STYLES).toContain(style);
      }
      expect(type.match).not.toBe(key);
      expect(isTravelTypeKey(type.match)).toBe(true);
    }
  });
});

describe('scoreTravelTest', () => {
  it('returns null without answers', () => {
    expect(scoreTravelTest([])).toBeNull();
  });

  it('picks the type with the most answers', () => {
    expect(scoreTravelTest(['food', 'dawn', 'food', 'night'])).toBe('food');
  });

  it('breaks a tie with the most recent pick', () => {
    expect(scoreTravelTest(['food', 'dawn', 'dawn', 'food'])).toBe('food');
    expect(scoreTravelTest(['food', 'dawn'])).toBe('dawn');
  });
});

describe('isTravelTypeKey', () => {
  it('accepts known keys only', () => {
    expect(isTravelTypeKey('slow')).toBe(true);
    expect(isTravelTypeKey('SLOW')).toBe(false);
    expect(isTravelTypeKey('admin')).toBe(false);
  });
});
