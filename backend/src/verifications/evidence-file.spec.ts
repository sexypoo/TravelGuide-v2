import { ProblemException } from '../common/http/problem.exception';
import { type EvidenceFile, validateEvidenceFile } from './evidence-file';

function file(mimetype: string, buffer: Buffer): EvidenceFile {
  return {
    originalname: 'proof',
    mimetype,
    size: buffer.byteLength,
    buffer,
  };
}

describe('validateEvidenceFile', () => {
  it.each([
    ['image/jpeg', Buffer.from([0xff, 0xd8, 0xff, 0x00])],
    [
      'image/png',
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ],
    ['application/pdf', Buffer.from('%PDF-1.4')],
  ])('accepts a matching %s signature', (mimetype, contents) => {
    expect(() => validateEvidenceFile(file(mimetype, contents))).not.toThrow();
  });

  it('rejects a spoofed allowed MIME type', () => {
    expect(() =>
      validateEvidenceFile(file('image/jpeg', Buffer.from('executable'))),
    ).toThrow(ProblemException);
  });
});
