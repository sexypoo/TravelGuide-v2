import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@/i18n/client';
import { AuthForm } from './auth-form';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('../../lib/api/auth-client', () => ({
  getAuthCapabilities: jest
    .fn()
    .mockResolvedValue({ passwordReset: true, socialProviders: ['google'] }),
  login: jest.fn(),
  register: jest.fn(),
  socialLoginUrl: jest.fn(),
}));

describe('AuthForm in English (#80)', () => {
  it('renders labels, actions, and social login in English', async () => {
    render(
      <I18nProvider locale="en">
        <AuthForm mode="register" />
      </I18nProvider>,
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Nickname')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create account' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /Continue with Google/ }),
    ).toBeInTheDocument();
  });
});
