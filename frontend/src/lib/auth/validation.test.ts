import { safeNextPath } from './safe-next-path';
import { validateLogin, validateRegistration } from './validation';

describe('auth validation', () => {
  it('accepts a valid registration and rejects every required boundary', () => {
    expect(
      validateRegistration({
        email: 'user@example.com',
        password: 'password123',
        nickname: '제주여행자',
        termsAgreed: true,
      }),
    ).toEqual({});

    expect(
      validateRegistration({
        email: 'not-an-email',
        password: 'short',
        nickname: ' ',
        termsAgreed: false,
      }),
    ).toEqual({
      email: '이메일 형식을 확인해 주세요.',
      password: '영문과 숫자를 포함해 10~72자로 입력해 주세요.',
      nickname: '닉네임은 공백을 제외하고 2~20자로 입력해 주세요.',
      termsAgreed: '서비스 이용을 위해 필수 약관에 동의해 주세요.',
    });
  });

  it('does not impose registration password rules during login', () => {
    expect(
      validateLogin({ email: 'user@example.com', password: 'existing-secret' }),
    ).toEqual({});
    expect(validateLogin({ email: 'user@example.com', password: '' })).toEqual({
      password: '비밀번호를 입력해 주세요.',
    });
  });
});

describe('safe next path', () => {
  it('keeps local paths and rejects protocol-relative or non-path values', () => {
    expect(safeNextPath('/app')).toBe('/app');
    expect(safeNextPath('/admin?tab=reports')).toBe('/admin?tab=reports');
    expect(safeNextPath('//evil.example')).toBe('/app');
    expect(safeNextPath('https://evil.example')).toBe('/app');
    expect(safeNextPath(['/admin'])).toBe('/app');
  });
});
