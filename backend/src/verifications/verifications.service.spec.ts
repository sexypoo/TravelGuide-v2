import type { Destination } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  PrivateUpload,
  StorageService,
  StoredObject,
} from '../storage/storage.service';
import type { EvidenceFile } from './evidence-file';
import { VerificationsService } from './verifications.service';

class CleanupTrackingStorage implements StorageService {
  storedKey: string | null = null;
  deletedKey: string | null = null;

  putPrivate(input: PrivateUpload): Promise<StoredObject> {
    this.storedKey = input.objectKey;
    return Promise.resolve({
      objectKey: input.objectKey,
      sizeBytes: input.contents.byteLength,
    });
  }

  getPrivateDownload(): Promise<string> {
    return Promise.resolve('/private/path');
  }

  delete(objectKey: string): Promise<void> {
    this.deletedKey = objectKey;
    return Promise.resolve();
  }
}

function destination(): Destination {
  const now = new Date();
  return {
    id: 'destination-id',
    slug: 'jeju',
    nameKo: '제주',
    countryCode: 'KR',
    timezone: 'Asia/Seoul',
    centerLatitude: new Prisma.Decimal('33.3617'),
    centerLongitude: new Prisma.Decimal('126.5292'),
    radiusKm: new Prisma.Decimal('80'),
    createdAt: now,
    updatedAt: now,
  };
}

describe('VerificationsService storage consistency', () => {
  const prisma = new PrismaService();
  const storage = new CleanupTrackingStorage();
  const service = new VerificationsService(prisma, storage);

  beforeEach(() => {
    jest.restoreAllMocks();
    storage.storedKey = null;
    storage.deletedKey = null;
  });

  it('deletes the private object when the DB insert fails', async () => {
    jest
      .spyOn(prisma.destination, 'findUnique')
      .mockResolvedValue(destination());
    jest
      .spyOn(prisma.verification, 'findFirst')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    jest
      .spyOn(prisma.verification, 'create')
      .mockRejectedValue(new Error('database unavailable'));
    const proof: EvidenceFile = {
      originalname: 'ticket.jpg',
      mimetype: 'image/jpeg',
      size: 4,
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0x00]),
    };

    await expect(
      service.createTraveler(
        'user-id',
        {
          destinationId: 'destination-id',
          startsAt: new Date(Date.now() + 60_000).toISOString(),
          endsAt: new Date(Date.now() + 120_000).toISOString(),
        },
        proof,
      ),
    ).rejects.toThrow('database unavailable');

    expect(storage.storedKey).toMatch(/^verification\/user-id\//);
    expect(storage.deletedKey).toBe(storage.storedKey);
  });
});
