import { HttpStatus } from '@nestjs/common';
import { ProblemException } from '../common/http/problem.exception';

export const MAX_MESSAGE_IMAGE_BYTES = 10 * 1024 * 1024;

export interface MessageImageFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

function detectedMimeType(buffer: Buffer): string | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'image/png';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

export function validateMessageImage(
  file: MessageImageFile | undefined,
): asserts file is MessageImageFile {
  if (file === undefined || file.size === 0) {
    throw new ProblemException(
      'MESSAGE_IMAGE_REQUIRED',
      '보낼 이미지를 선택해 주세요.',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (file.size > MAX_MESSAGE_IMAGE_BYTES) {
    throw new ProblemException(
      'UPLOAD_TOO_LARGE',
      '이미지는 10MB 이하여야 합니다.',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (detectedMimeType(file.buffer) !== file.mimetype) {
    throw new ProblemException(
      'UPLOAD_TYPE_NOT_ALLOWED',
      'JPEG, PNG, WebP 이미지만 보낼 수 있습니다.',
      HttpStatus.BAD_REQUEST,
    );
  }
}
