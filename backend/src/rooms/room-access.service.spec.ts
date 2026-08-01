import type { AuthenticatedUser } from '../auth/authenticated-user';
import type { Verification } from '@prisma/client';
import { ProblemException } from '../common/http/problem.exception';
import { PrismaService } from '../prisma/prisma.service';
import { RoomAccessService } from './room-access.service';

function user(role: 'USER' | 'ADMIN'): AuthenticatedUser {
  return {
    id: 'user-id',
    email: 'user@example.com',
    nickname: '사용자',
    role,
    createdAt: new Date('2026-07-31T00:00:00.000Z'),
  };
}

function verification(type: 'TRAVELER' | 'LOCAL'): Verification {
  const now = new Date('2026-07-31T00:00:00.000Z');
  return {
    id: `${type.toLowerCase()}-id`,
    userId: 'user-id',
    destinationId: 'jeju-id',
    type,
    status: 'APPROVED',
    startsAt: type === 'TRAVELER' ? now : null,
    endsAt: type === 'TRAVELER' ? now : null,
    localProofType: type === 'LOCAL' ? 'RESIDENCE' : null,
    proofObjectKey: 'verification/user-id/object-id',
    proofOriginalName: 'proof.pdf',
    proofMimeType: 'application/pdf',
    proofSizeBytes: 5,
    gpsLat: null,
    gpsLng: null,
    gpsAccuracyMeters: null,
    gpsCapturedAt: null,
    submittedNote: null,
    reviewedById: null,
    reviewedAt: now,
    rejectionReason: null,
    expiresAt: type === 'LOCAL' ? new Date(now.getTime() + 1000) : null,
    createdAt: now,
    updatedAt: now,
  };
}

describe('RoomAccessService', () => {
  const prisma = new PrismaService();
  const service = new RoomAccessService(prisma);

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps an unverified regular user locked', async () => {
    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await expect(service.getAccess(user('USER'), 'jeju-id')).resolves.toEqual({
      status: 'VERIFICATION_REQUIRED',
      labelKo: '인증 필요',
      canViewContent: false,
      canChat: false,
      canCreateTopic: false,
      canAskQuestion: false,
      canAnswer: false,
      participantKind: null,
    });

    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    await expect(
      service.assertCanViewContent(user('USER'), 'jeju-id'),
    ).rejects.toBeInstanceOf(ProblemException);
  });

  it('maps approved traveler and local capabilities independently', async () => {
    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(verification('TRAVELER'))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    await expect(service.getAccess(user('USER'), 'jeju-id')).resolves.toEqual({
      status: 'AVAILABLE',
      labelKo: '입장 가능',
      canViewContent: true,
      canChat: true,
      canCreateTopic: true,
      canAskQuestion: true,
      canAnswer: true,
      participantKind: 'TRAVELER',
    });

    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(verification('LOCAL'))
      .mockResolvedValueOnce(null);
    await expect(service.getAccess(user('USER'), 'jeju-id')).resolves.toEqual({
      status: 'AVAILABLE',
      labelKo: '입장 가능',
      canViewContent: true,
      canChat: true,
      canCreateTopic: true,
      canAskQuestion: true,
      canAnswer: true,
      participantKind: 'LOCAL',
    });
  });

  it('allows either verified participant to create a topic', async () => {
    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(verification('LOCAL'))
      .mockResolvedValueOnce(null);

    await expect(
      service.assertCanAskQuestion(user('USER'), 'jeju-id'),
    ).resolves.toBeUndefined();

    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(verification('TRAVELER'))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    await expect(
      service.assertCanAskQuestion(user('USER'), 'jeju-id'),
    ).resolves.toBeUndefined();
  });

  it('preserves both participant capabilities for dual verification', async () => {
    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(verification('TRAVELER'))
      .mockResolvedValueOnce(verification('LOCAL'))
      .mockResolvedValueOnce(null);

    await expect(
      service.getAccess(user('USER'), 'jeju-id'),
    ).resolves.toMatchObject({
      canChat: true,
      canCreateTopic: true,
      canAnswer: true,
      participantKind: 'BOTH',
    });
  });

  it('returns participant kind and verification date when answering', async () => {
    const answerVerifiedAt = new Date('2026-07-01T00:00:00.000Z');
    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(verification('LOCAL'))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        ...verification('LOCAL'),
        reviewedAt: answerVerifiedAt,
      });
    await expect(
      service.assertCanAnswer(
        user('USER'),
        'jeju-id',
        new Date('2026-07-31T00:00:00.000Z'),
      ),
    ).resolves.toEqual({ kind: 'LOCAL', verifiedAt: answerVerifiedAt });

    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(verification('TRAVELER'))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        ...verification('TRAVELER'),
        reviewedAt: answerVerifiedAt,
      });
    await expect(
      service.assertCanAnswer(user('USER'), 'jeju-id'),
    ).resolves.toEqual({ kind: 'TRAVELER', verifiedAt: answerVerifiedAt });

    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    await expect(
      service.assertCanAnswer(user('USER'), 'jeju-id'),
    ).rejects.toMatchObject({ code: 'PARTICIPANT_VERIFICATION_REQUIRED' });
  });

  it('uses inclusive traveler grace boundaries and exclusive local expiry', async () => {
    const now = new Date('2026-07-31T12:00:00.000Z');
    const findFirst = jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await service.getAccess(user('USER'), 'jeju-id', now);
    const travelerQuery = findFirst.mock.calls[0]?.[0];
    const localQuery = findFirst.mock.calls[1]?.[0];
    expect(travelerQuery?.where).toMatchObject({
      startsAt: { lte: new Date('2026-08-01T12:00:00.000Z') },
      endsAt: { gte: new Date('2026-07-30T12:00:00.000Z') },
    });
    expect(localQuery?.where).toMatchObject({ expiresAt: { gt: now } });
  });

  it('allows administrators without querying verification data', async () => {
    const findFirst = jest.spyOn(prisma.verification, 'findFirst');
    await expect(service.getAccess(user('ADMIN'), 'jeju-id')).resolves.toEqual({
      status: 'AVAILABLE',
      labelKo: '입장 가능',
      canViewContent: true,
      canChat: false,
      canCreateTopic: false,
      canAskQuestion: false,
      canAnswer: false,
      participantKind: null,
    });
    expect(findFirst).not.toHaveBeenCalled();
    await expect(
      service.assertCanViewContent(user('ADMIN'), 'jeju-id'),
    ).resolves.toBeUndefined();
  });
});
