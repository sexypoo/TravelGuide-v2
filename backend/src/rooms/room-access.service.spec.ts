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
      canAskQuestion: false,
      canAnswer: false,
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
      canAskQuestion: true,
      canAnswer: false,
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
      canAskQuestion: false,
      canAnswer: true,
    });
  });

  it('requires an approved traveler specifically when asking a question', async () => {
    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(verification('LOCAL'))
      .mockResolvedValueOnce(null);

    await expect(
      service.assertCanAskQuestion(user('USER'), 'jeju-id'),
    ).rejects.toMatchObject({
      code: 'TRAVELER_VERIFICATION_REQUIRED',
    });

    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(verification('TRAVELER'))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    await expect(
      service.assertCanAskQuestion(user('USER'), 'jeju-id'),
    ).resolves.toBeUndefined();
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
      canAskQuestion: false,
      canAnswer: false,
    });
    expect(findFirst).not.toHaveBeenCalled();
    await expect(
      service.assertCanViewContent(user('ADMIN'), 'jeju-id'),
    ).resolves.toBeUndefined();
  });
});
