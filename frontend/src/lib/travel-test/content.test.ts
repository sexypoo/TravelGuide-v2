import { TRAVEL_STYLES } from '@/lib/api/profile';
import {
  isTravelTypeKey,
  scoreTravelTest,
  TRAVEL_TEST_QUESTIONS,
  TRAVEL_TYPE_KEYS,
  TRAVEL_TYPES,
  travelTestQuestionsFor,
  travelTypesFor,
} from './content';
import { COURSE_REGIONS, courseRegionsFor } from './courses';

const HANGUL = /[가-힣]/u;

function texts(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(texts);
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(texts);
  }
  return [];
}

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

describe('sample courses', () => {
  it('give every type a four-stop day in time order in every region', () => {
    expect(COURSE_REGIONS.map((region) => region.name)).toEqual([
      '제주',
      '부산',
      '강릉',
      '서울',
    ]);
    for (const region of COURSE_REGIONS) {
      for (const key of TRAVEL_TYPE_KEYS) {
        const times = region.courses[key].map((stop) => stop.time);
        expect(times).toHaveLength(4);
        expect([...times].sort()).toEqual(times);
      }
    }
  });
});

describe('English travel test data (#80)', () => {
  it('keeps Korean as the default and the original objects', () => {
    expect(travelTypesFor('ko')).toBe(TRAVEL_TYPES);
    expect(travelTestQuestionsFor('ko')).toBe(TRAVEL_TEST_QUESTIONS);
    expect(courseRegionsFor('ko')).toBe(COURSE_REGIONS);
  });

  it('swaps only the text of types and keeps their structure', () => {
    const en = travelTypesFor('en');
    for (const key of TRAVEL_TYPE_KEYS) {
      const english = en[key];
      const korean = TRAVEL_TYPES[key];
      expect([
        english.styles,
        english.match,
        english.color,
        english.glyph,
      ]).toEqual([korean.styles, korean.match, korean.color, korean.glyph]);
      expect(english.traits).toHaveLength(3);
    }
    expect(texts(en).filter((text) => HANGUL.test(text))).toEqual([]);
  });

  it('asks the same questions with the same scoring', () => {
    const en = travelTestQuestionsFor('en');
    expect(en).toHaveLength(TRAVEL_TEST_QUESTIONS.length);
    en.forEach((question, index) => {
      expect(question.options.map((option) => option.type)).toEqual(
        TRAVEL_TEST_QUESTIONS[index]?.options.map((option) => option.type),
      );
    });
    expect(texts(en).filter((text) => HANGUL.test(text))).toEqual([]);
  });

  it('keeps regions, times, and stop counts and leaves no Korean', () => {
    const en = courseRegionsFor('en');
    expect(en.map((region) => region.name)).toEqual([
      'Jeju',
      'Busan',
      'Gangneung',
      'Seoul',
    ]);
    en.forEach((region, index) => {
      const korean = COURSE_REGIONS[index];
      expect(region.key).toBe(korean?.key);
      for (const key of TRAVEL_TYPE_KEYS) {
        expect(region.courses[key].map((stop) => stop.time)).toEqual(
          korean?.courses[key].map((stop) => stop.time),
        );
      }
    });
    expect(texts(en).filter((text) => HANGUL.test(text))).toEqual([]);
  });
});
