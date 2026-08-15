import { Prisma } from '@prisma/client';
import { PreordersService } from './preorders.service';

describe('PreordersService', () => {
  it('stores a normalized applicant with a consent timestamp', async () => {
    type CreateArguments = {
      data: { name: string; email: string; consentedAt: Date };
    };
    const create = jest
      .fn<Promise<unknown>, [CreateArguments]>()
      .mockResolvedValue({});
    const prisma = {
      preorderRegistration: { create },
    };
    const service = new PreordersService(prisma as never);

    await service.register({
      name: ' 제주 여행자 ',
      email: ' Traveler@Example.COM ',
      privacyConsent: true,
    });

    const stored = create.mock.calls[0]?.[0].data;
    expect(stored).toMatchObject({
      name: '제주 여행자',
      email: 'traveler@example.com',
    });
    expect(stored?.consentedAt).toBeInstanceOf(Date);
  });

  it('treats a unique-email conflict as the same successful registration', async () => {
    const duplicate = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '5.22.0' },
    );
    const prisma = {
      preorderRegistration: {
        create: jest.fn().mockRejectedValue(duplicate),
      },
    };
    const service = new PreordersService(prisma as never);

    await expect(
      service.register({
        name: '중복 신청자',
        email: 'same@example.com',
        privacyConsent: true,
      }),
    ).resolves.toBeUndefined();
  });
});
