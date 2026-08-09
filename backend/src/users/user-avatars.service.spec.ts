import { UserAvatarsService } from './user-avatars.service';
import type { UserAvatarFile } from './user-avatar-file';
import type { PrivateUpload, StoredObject } from '../storage/storage.service';

interface AvatarUpdateInput {
  where: { id: string };
  data: {
    avatarObjectKey: string;
    avatarOriginalName: string;
    avatarMimeType: string;
    avatarSizeBytes: number;
  };
}

const avatar: UserAvatarFile = {
  originalname: 'my-avatar.png',
  mimetype: 'image/png',
  size: 8,
  buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
};

describe('UserAvatarsService', () => {
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
    const putPrivate = jest.fn<Promise<StoredObject>, [PrivateUpload]>();
    putPrivate.mockResolvedValue({ objectKey: 'new', sizeBytes: 8 });
    const storage = {
      putPrivate,
      getPrivateDownload: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const service = new UserAvatarsService(prisma as never, storage);

    await service.update('user-1', avatar);

    const stored = putPrivate.mock.calls[0]?.[0];
    expect(stored?.objectKey).toMatch(/^profile-images\/user-1\//);
    expect(stored?.contents).toEqual(avatar.buffer);
    const updated = update.mock.calls[0]?.[0];
    expect(updated?.where).toEqual({ id: 'user-1' });
    expect(updated?.data).toMatchObject({
      avatarOriginalName: 'my-avatar.png',
      avatarMimeType: 'image/png',
      avatarSizeBytes: 8,
    });
    expect(storage.delete).toHaveBeenCalledWith('profile-images/old');
  });
});
