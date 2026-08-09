import { ProblemException } from '../common/http/problem.exception';
import {
  MAX_USER_AVATAR_BYTES,
  validateUserAvatar,
  type UserAvatarFile,
} from './user-avatar-file';

const png: UserAvatarFile = {
  originalname: 'avatar.png',
  mimetype: 'image/png',
  size: 8,
  buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
};

describe('validateUserAvatar', () => {
  it('accepts a real supported image signature', () => {
    expect(() => validateUserAvatar(png)).not.toThrow();
  });

  it('rejects missing, oversized, and disguised files', () => {
    expect(() => validateUserAvatar(undefined)).toThrow(ProblemException);
    expect(() =>
      validateUserAvatar({ ...png, size: MAX_USER_AVATAR_BYTES + 1 }),
    ).toThrow(ProblemException);
    expect(() =>
      validateUserAvatar({ ...png, buffer: Buffer.from('not-an-image') }),
    ).toThrow(ProblemException);
  });
});
