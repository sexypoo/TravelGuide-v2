import { fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '@/i18n/client';
import type { Verification } from '@/lib/api/verifications';
import { parseOwnProfile } from '@/lib/api/profile';
import { getQualificationPresentation } from '@/lib/verifications/presentation';
import { profilePayload } from '@/test/fixtures';
import { AccountDeletionPanel } from '../profile/account-deletion-panel';
import { ProfileForm } from '../profile/profile-form';
import { LocalVerificationForm } from './local-verification-form';
import { VerificationStatusCard } from './verification-status-card';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const rejected: Verification = {
  id: 'verification-1',
  destination: { id: 'destination-1', slug: 'jeju', nameKo: '제주' },
  type: 'LOCAL',
  status: 'REJECTED',
  startsAt: null,
  endsAt: null,
  localProofType: 'RESIDENCE',
  note: null,
  reviewedAt: null,
  rejectionReason: 'Blurry document',
  expiresAt: null,
  createdAt: '2026-07-20T00:00:00.000Z',
};

const HANGUL = /[가-힣]/u;

describe('profile and verification in English', () => {
  it('shows a verification card with English copy and city name', () => {
    const { container } = render(
      <I18nProvider locale="en">
        <VerificationStatusCard verification={rejected} canReapply />
      </I18nProvider>,
    );
    expect(
      screen.getByRole('heading', { name: 'Local verification · Jeju' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByText('Valid for 90 days after approval')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Apply again' })).toHaveAttribute(
      'href',
      '/app/verifications/local?city=jeju',
    );
    expect(container.textContent).not.toMatch(HANGUL);
  });

  it('validates the local form in English', () => {
    const { container } = render(
      <I18nProvider locale="en">
        <LocalVerificationForm
          destination={{
            id: 'destination-busan',
            slug: 'busan',
            nameKo: '부산',
            center: { latitude: 35.1, longitude: 129 },
            radiusKm: 20,
          }}
        />
      </I18nProvider>,
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Apply for local verification' }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please check your current location inside Busan first.',
    );
    expect(container.textContent).not.toMatch(HANGUL);
  });

  it('renders the profile form and deletion panel in English', () => {
    render(
      <I18nProvider locale="en">
        <ProfileForm profile={parseOwnProfile(profilePayload)} />
        <AccountDeletionPanel hasPassword />
      </I18nProvider>,
    );
    expect(screen.getByLabelText('Nickname')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Food hunting/ }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));
    const submit = screen.getByRole('button', {
      name: 'Delete account permanently',
    });
    fireEvent.change(screen.getByLabelText('Current password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/To confirm, type delete account/), {
      target: { value: 'delete account' },
    });
    expect(submit).toBeEnabled();
  });

  it('describes qualifications in English', () => {
    expect(
      getQualificationPresentation(
        [{ ...rejected, type: 'TRAVELER', status: 'APPROVED' }],
        'TRAVELER',
        'en',
      ).title,
    ).toBe('Verified as a traveler in Jeju');
  });
});
