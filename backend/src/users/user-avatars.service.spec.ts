import { Logger } from '@nestjs/common';
import { Readable } from 'node:stream';
import { UserAvatarsService } from './user-avatars.service';
import type { UserAvatarFile } from './user-avatar-file';
import type {
  PrivateUpload,
  StorageService,
  StoredObject,
} from '../storage/storage.service';
import { PrivateObjectLifecycleService } from '../storage/private-object-lifecycle.service';

interface AvatarUpdateInput {
  where: { id: string };
  data: {
    avatarObjectKey: string;
    avatarOriginalName: string;
    avatarMimeType: string;
    avatarSizeBytes: number;
  };
}

interface AvatarRemoveInput {
  where: { id: string };
  data: {
    avatarObjectKey: null;
    avatarOriginalName: null;
    avatarMimeType: null;
    avatarSizeBytes: null;
  };
}

const avatar: UserAvatarFile = {
  originalname: 'my-avatar.png',
  mimetype: 'image/png',
  size: 8,
  buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
};

function createStorage(): jest.Mocked<StorageService> {
  const storage: jest.Mocked<StorageService> = {
    putPrivate: jest.fn<Promise<StoredObject>, [PrivateUpload]>(),
    getPrivateDownload: jest.fn(),
    delete: jest.fn(),
  };
  storage.putPrivate.mockResolvedValue({ objectKey: 'new', sizeBytes: 8 });
  storage.getPrivateDownload.mockResolvedValue(Readable.from('avatar'));
  storage.delete.mockResolvedValue(undefined);
  return storage;
}

function createService(
  prisma: object,
  storage: jest.Mocked<StorageService>,
): UserAvatarsService {
  return new UserAvatarsService(
    prisma as never,
    storage,
    new PrivateObjectLifecycleService(storage),
  );
}

describe('UserAvatarsService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores a new image and cleans the previous object', async () => {
    const update = jest.fn<Promise<{ id: string }>, [AvatarUpdateInput]>();
    update.mockResolvedValue({ id: 'user-1' });
    const prisma = {
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ avatarObjectKey: 'profile-images/old' }),
        update,
      },
    };
    const storage = createStorage();
    const service = createService(prisma, storage);

    await service.update('user-1', avatar);

    const stored = storage.putPrivate.mock.calls[0]?.[0];
    expect(stored?.objectKey).toMatch(/^profile-images\/user-1\//);
    expect(stored?.contents).toEqual(avatar.buffer);
    const updated = update.mock.calls[0]?.[0];
    expect(updated?.where).toEqual({ id: 'user-1' });
    expect(updated?.data).toMatchObject({
      avatarOriginalName: 'my-avatar.png',
      avatarMimeType: 'image/png',
      avatarSizeBytes: 8,
    });
    expect(storage.delete.mock.calls).toEqual([['profile-images/old']]);
  });

  it('does not delete an old object when the user had no avatar', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ avatarObjectKey: null }),
        update: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
    };
    const storage = createStorage();
    const service = createService(prisma, storage);

    await service.update('user-1', avatar);

    expect(storage.delete.mock.calls).toHaveLength(0);
  });

  it('rejects an avatar update for a missing user before uploading', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
    };
    const storage = createStorage();
    const service = createService(prisma, storage);

    await expect(service.update('missing', avatar)).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
    expect(storage.putPrivate.mock.calls).toHaveLength(0);
  });

  it('cleans the new object and safely logs when the database update fails', async () => {
    const databaseError = Object.assign(
      new Error('postgresql://secret@localhost failed'),
      { code: 'P2025' },
    );
    const prisma = {
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ avatarObjectKey: 'profile-images/old' }),
        update: jest.fn().mockRejectedValue(databaseError),
      },
    };
    const storage = createStorage();
    const errorLog = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const service = createService(prisma, storage);

    await expect(service.update('user-1', avatar)).rejects.toBe(databaseError);
    expect(storage.delete.mock.calls[0]?.[0]).toMatch(
      /^profile-images\/user-1\//,
    );
    expect(errorLog.mock.calls[0]?.[0]).toContain(
      'Error code=P2025 message=[redacted-database-url] failed',
    );
  });

  it('handles a non-Error database rejection without exposing details', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ avatarObjectKey: null }),
        update: jest.fn().mockRejectedValue('database unavailable'),
      },
    };
    const storage = createStorage();
    const errorLog = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const service = createService(prisma, storage);

    await expect(service.update('user-1', avatar)).rejects.toBe(
      'database unavailable',
    );
    expect(errorLog).toHaveBeenCalledWith(
      'Profile avatar database update failed: UnknownException',
    );
  });

  it('removes avatar metadata before deleting the old object', async () => {
    const update = jest.fn<Promise<{ id: string }>, [AvatarRemoveInput]>();
    update.mockResolvedValue({ id: 'user-1' });
    const prisma = {
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ avatarObjectKey: 'profile-images/old' }),
        update,
      },
    };
    const storage = createStorage();
    const service = createService(prisma, storage);

    await service.remove('user-1');

    expect(update.mock.calls[0]?.[0]).toMatchObject({
      where: { id: 'user-1' },
      data: { avatarObjectKey: null },
    });
    expect(storage.delete.mock.calls).toEqual([['profile-images/old']]);
  });

  it('rejects avatar removal for a missing user', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
    };
    const storage = createStorage();
    const service = createService(prisma, storage);

    await expect(service.remove('missing')).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
    expect(prisma.user.update.mock.calls).toHaveLength(0);
  });

  it('returns a private avatar download when all metadata exists', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          avatarObjectKey: 'profile-images/user-1/current',
          avatarOriginalName: 'current.png',
          avatarMimeType: 'image/png',
        }),
      },
    };
    const storage = createStorage();
    const service = createService(prisma, storage);

    await expect(service.get('user-1')).resolves.toMatchObject({
      mimeType: 'image/png',
      originalName: 'current.png',
    });
    expect(storage.getPrivateDownload.mock.calls).toEqual([
      ['profile-images/user-1/current', 300],
    ]);
  });

  it.each([
    null,
    {
      avatarObjectKey: null,
      avatarOriginalName: 'current.png',
      avatarMimeType: 'image/png',
    },
    {
      avatarObjectKey: 'profile-images/user-1/current',
      avatarOriginalName: null,
      avatarMimeType: 'image/png',
    },
    {
      avatarObjectKey: 'profile-images/user-1/current',
      avatarOriginalName: 'current.png',
      avatarMimeType: null,
    },
  ])('rejects an incomplete avatar record: %p', async (record) => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(record) },
    };
    const storage = createStorage();
    const service = createService(prisma, storage);

    await expect(service.get('user-1')).rejects.toMatchObject({
      code: 'PROFILE_IMAGE_NOT_FOUND',
    });
    expect(storage.getPrivateDownload.mock.calls).toHaveLength(0);
  });
});
