import { render, screen } from '@testing-library/react';
import { I18nProvider } from '../../i18n/client';
import { getMessages } from '../../i18n/server';
import { en } from '../../i18n/messages/en';
import AccountDeletionPage from '../account-deletion/page';
import PrivacyPage from './page';

const englishNotice =
  'This English version is provided for convenience. If it differs from the Korean version, the Korean version applies.';

describe('legal pages', () => {
  afterEach(() => jest.mocked(getMessages).mockReset());

  it('renders the privacy policy in Korean without a translation notice', async () => {
    render(await PrivacyPage());

    expect(
      screen.getByRole('heading', { level: 1, name: '개인정보 처리방침' }),
    ).toBeInTheDocument();
    expect(screen.getByText('시행일 2026년 8월 20일')).toBeInTheDocument();
    expect(screen.queryByText(englishNotice)).not.toBeInTheDocument();
  });

  it('renders the privacy policy in English with the governing-language notice', async () => {
    jest.mocked(getMessages).mockResolvedValue(en);
    render(<I18nProvider locale="en">{await PrivacyPage()}</I18nProvider>);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Privacy Policy' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Effective August 20, 2026')).toBeInTheDocument();
    expect(screen.getByText(englishNotice)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '1. Information we process' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Learn more about what is deleted and how',
      }),
    ).toHaveAttribute('href', '/account-deletion');
    expect(screen.getByRole('navigation')).toHaveAccessibleName(
      'Policy documents',
    );
    expect(
      screen.getByRole('button', { name: 'View in Korean' }),
    ).toHaveTextContent('한국어');
    // Only the language switch keeps Korean; the wordmark is a single syllable.
    expect(document.body.textContent?.replace('한국어', '')).not.toMatch(
      /[가-힣]{2,}/u,
    );
  });

  it('renders account deletion steps in English', async () => {
    jest.mocked(getMessages).mockResolvedValue(en);
    const page = await AccountDeletionPage({
      searchParams: Promise.resolve({}),
    });
    render(<I18nProvider locale="en">{page}</I18nProvider>);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Delete your YeoJJU account',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(englishNotice)).toBeInTheDocument();
    expect(
      screen.getByText('Log in on the web or in the app'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Log in to delete your account' }),
    ).toHaveAttribute('href', '/auth/login?next=%2Fapp%2Fprofile');
  });
});
