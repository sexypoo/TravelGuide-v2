import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { I18nProvider } from '@/i18n/client';
import { RegionCourse } from './region-course';
import { ShareActions } from './share-actions';
import { TravelTest } from './travel-test';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const push = jest.fn();

beforeEach(() => {
  jest.mocked(useRouter).mockReturnValue({
    push,
  } as unknown as ReturnType<typeof useRouter>);
});

describe('travel type test in English (#80)', () => {
  it('runs the quiz in English and scores the same way', () => {
    render(
      <I18nProvider locale="en">
        <TravelTest />
      </I18nProvider>,
    );

    expect(
      screen.getByRole('heading', { name: 'What kind of traveler are you?' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(
      screen.getByRole('heading', { name: 'Day one, 7 a.m. Where are you?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Back to the start' }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Already on a summit, watching the sunrise',
      }),
    );
    expect(
      screen.getByRole('heading', { name: 'How do you plan a trip?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Previous question' }),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/[가-힣]/u);
  });

  it('shows the course and share actions in English', () => {
    render(
      <I18nProvider locale="en">
        <RegionCourse type="food" />
        <ShareActions type="food" />
      </I18nProvider>,
    );

    expect(
      screen.getByRole('heading', {
        name: 'A day in Jeju for the Alley Foodie',
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Seoul' }));
    expect(screen.getByText('Gwangjang Market')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ask locals in the Seoul help room' }),
    ).toHaveAttribute('href', '/app/rooms/seoul');
    expect(
      screen.getByRole('button', { name: 'Share result' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save as image' }),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/[가-힣]/u);
  });
});
