import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@/i18n/client';
import type { QuestionDetail } from '@/lib/api/questions';
import { participantBadgeLabel } from '@/lib/api/participants';
import {
  categoryLabel,
  categoryLabels,
  entryLabel,
  topicLabels,
} from '@/lib/questions/presentation';
import { LiveStatusBoard } from './live-status-board';
import { QuestionCard } from './question-card';

const question: QuestionDetail = {
  id: 'question-1',
  roomId: 'room-jeju',
  author: { id: 'traveler-1', nickname: 'Mina', badge: 'VERIFIED_TRAVELER' },
  category: 'WAITING',
  urgency: 'URGENT',
  content: 'How long is the line at the night market right now?',
  contentFormat: 'PLAIN_TEXT',
  areaText: null,
  image: {
    url: '/api/v1/questions/question-1/image',
    originalName: 'line.png',
    mimeType: 'image/png',
  },
  sourceMessageId: null,
  status: 'OPEN',
  safetyNotice: null,
  answerCount: 2,
  acceptedAnswerId: null,
  expiresAt: '2026-08-02T12:00:00.000Z',
  resolvedAt: null,
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
  answers: [],
  liveSummary: {
    freshness: 'STALE',
    responseCount: 3,
    agreementCount: 2,
    waitMinutes: null,
    crowdLevel: 'VERY_BUSY',
    entryStatus: null,
    lastObservedAt: '2026-08-01T12:08:00.000Z',
    recommendedRecheckAt: '2026-08-01T12:18:00.000Z',
    staleAfter: '2026-08-01T12:38:00.000Z',
    description: 'Based on on-site answers.',
  },
};

const HANGUL = /[가-힣]/u;

describe('topics in English', () => {
  it('renders a topic card without Korean or raw enum values', () => {
    const { container } = render(
      <I18nProvider locale="en">
        <QuestionCard question={question} />
      </I18nProvider>,
    );

    expect(screen.getByText('Wait times')).toBeInTheDocument();
    expect(screen.getByText('Within 1 hour')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Photo attached to topic' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2').closest('span')).toHaveTextContent(
      'Answers 2',
    );
    expect(screen.getByLabelText('Mina · Verified traveler')).toBeVisible();
    expect(container.textContent).not.toMatch(HANGUL);
    expect(container.textContent).not.toMatch(/WAITING|URGENT|VERIFIED_/u);
  });

  it('renders the live status board in English', () => {
    const { container } = render(
      <I18nProvider locale="en">
        <LiveStatusBoard question={question} />
      </I18nProvider>,
    );

    expect(
      screen.getByRole('region', { name: 'On-site update' }),
    ).toHaveAttribute('data-freshness', 'stale');
    expect(screen.getByText(/Older on-site info/u)).toBeInTheDocument();
    expect(screen.getByText('Very busy')).toBeInTheDocument();
    expect(screen.getAllByText('Checking')).toHaveLength(2);
    expect(screen.getByText('2').closest('div') ?? container).toHaveTextContent(
      '2 of 3 on-site reports agree',
    );
    expect(container.textContent).not.toMatch(HANGUL);
  });

  it('keeps Korean label maps and offers locale-aware helpers', () => {
    expect(categoryLabels.WAITING).toBe('대기 현황');
    expect(categoryLabel('WAITING')).toBe('대기 현황');
    expect(categoryLabel('WAITING', 'en')).toBe('Wait times');
    expect(entryLabel('PAUSED', 'en')).toBe('Entry paused');
    expect(topicLabels('en').source.OFFICIAL_SOURCE).toBe('Official info');
    expect(participantBadgeLabel('VERIFIED_LOCAL')).toBe('인증 현지인');
    expect(participantBadgeLabel('VERIFIED_LOCAL', 'en')).toBe(
      'Verified local',
    );
  });
});
