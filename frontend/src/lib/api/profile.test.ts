import {
  parseOwnProfile,
  parsePublicContributorProfile,
  deleteOwnAccount,
  removeOwnProfileImage,
  updateOwnProfile,
  updateOwnProfileImage,
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
      hasPassword: true,
    });
    expect(JSON.stringify(profile)).not.toContain('passwordHash');
  });

  it('validates public contribution stats and local verification context', () => {
    expect(
      parsePublicContributorProfile({
        id: 'local-1',
        nickname: '제주바람',
        bio: null,
        profileImageUrl: null,
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

  it('uploads and removes a profile image through credentialed requests', async () => {
    fetchMock
      .mockResolvedValueOnce(
        response(
          {
            ...profilePayload,
            profileImageUrl: '/api/v1/users/user-1/avatar',
          },
          200,
        ),
      )
      .mockResolvedValueOnce(response(profilePayload, 200));
    const image = new File(['avatar'], 'avatar.webp', {
      type: 'image/webp',
    });

    await expect(updateOwnProfileImage(image)).resolves.toMatchObject({
      profileImageUrl: '/api/v1/users/user-1/avatar',
    });
    const uploadCall = fetchMock.mock.calls[0];
    expect(uploadCall?.[0]).toBe('/api/v1/users/me/avatar');
    expect(uploadCall?.[1]).toMatchObject({
      method: 'POST',
      credentials: 'include',
    });
    expect(uploadCall?.[1]?.body).toBeInstanceOf(FormData);

    await expect(removeOwnProfileImage()).resolves.toMatchObject({
      profileImageUrl: null,
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/v1/users/me/avatar',
      expect.objectContaining({ method: 'DELETE', credentials: 'include' }),
    );
  });

  it('sends account deletion as an authenticated JSON DELETE', async () => {
    fetchMock.mockResolvedValue(response(null, 204));

    await expect(
      deleteOwnAccount({
        confirmation: '계정 삭제',
        password: 'password123',
      }),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/account',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          confirmation: '계정 삭제',
          password: 'password123',
        }),
      }),
    );
  });
});
