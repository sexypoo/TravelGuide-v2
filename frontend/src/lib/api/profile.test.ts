import {
  parseOwnProfile,
  parsePublicContributorProfile,
  updateOwnProfile,
} from './profile';
import { profilePayload } from '@/test/fixtures';

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

function response(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('profile contract', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  it('maps the owner DTO explicitly without unknown private fields', () => {
    const profile = parseOwnProfile(profilePayload);

    expect(profile).toMatchObject({
      id: 'user-1',
      nickname: '제주여행자',
      bio: '제주 여행을 준비하고 있어요.',
      travelStyles: ['SLOW_TRAVEL', 'FOOD_EXPLORER'],
    });
    expect(JSON.stringify(profile)).not.toContain('passwordHash');
  });

  it('validates public contribution stats and local verification context', () => {
    expect(
      parsePublicContributorProfile({
        id: 'local-1',
        nickname: '제주바람',
        bio: null,
        isVerifiedLocal: true,
        verifiedDestination: { id: 'jeju-1', slug: 'jeju', nameKo: '제주' },
        verifiedAt: '2026-02-01T00:00:00.000Z',
        joinedAt: '2026-01-01T00:00:00.000Z',
        stats: { answerCount: 12, acceptedAnswerCount: 4 },
      }),
    ).toMatchObject({
      nickname: '제주바람',
      stats: { answerCount: 12, acceptedAnswerCount: 4 },
    });
  });

  it('updates through a credentialed relative request', async () => {
    fetchMock.mockResolvedValue(response(profilePayload, 200));

    await expect(
      updateOwnProfile({
        nickname: '제주여행자',
        bio: null,
        travelStyles: ['SLOW_TRAVEL'],
      }),
    ).resolves.toMatchObject({ nickname: '제주여행자' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/users/me',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({
          nickname: '제주여행자',
          bio: null,
          travelStyles: ['SLOW_TRAVEL'],
        }),
      }),
    );
  });

  it('keeps stable nickname conflicts as ApiProblem', async () => {
    fetchMock.mockResolvedValue(
      response(
        {
          type: 'about:blank',
          title: 'Conflict',
          status: 409,
          code: 'NICKNAME_ALREADY_EXISTS',
          detail: '이미 사용 중인 닉네임입니다.',
          requestId: 'req-1',
        },
        409,
      ),
    );

    await expect(
      updateOwnProfile({
        nickname: '중복닉네임',
        bio: null,
        travelStyles: [],
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'NICKNAME_ALREADY_EXISTS',
    });
  });
});
