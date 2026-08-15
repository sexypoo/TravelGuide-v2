import { validatePreorder } from './validation';

describe('validatePreorder', () => {
  it('accepts a complete registration', () => {
    expect(
      validatePreorder({
        name: '제주 여행자',
        email: 'traveler@example.com',
        privacyConsent: true,
      }),
    ).toEqual({});
  });

  it('returns actionable field errors', () => {
    expect(
      validatePreorder({ name: ' ', email: 'invalid', privacyConsent: false }),
    ).toEqual({
      name: '이름을 입력해 주세요.',
      email: '올바른 이메일 주소를 입력해 주세요.',
      privacyConsent: '개인정보 수집 동의가 필요합니다.',
    });
  });
});
