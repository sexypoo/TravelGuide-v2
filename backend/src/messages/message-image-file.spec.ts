import { ProblemException } from '../common/http/problem.exception';
import { validateMessageImage } from './message-image-file';

describe('validateMessageImage', () => {
  it('accepts a PNG only when its bytes match the claimed MIME type', () => {
    const file = {
      originalname: '현장.png',
      mimetype: 'image/png',
      size: 8,
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    };
    expect(() => validateMessageImage(file)).not.toThrow();
    expect(() =>
      validateMessageImage({ ...file, mimetype: 'image/jpeg' }),
    ).toThrow(ProblemException);
  });

  it('rejects an empty upload', () => {
    expect(() => validateMessageImage(undefined)).toThrow(ProblemException);
  });
});
