import { HttpStatus } from '@nestjs/common';
import { ProblemException } from '../common/http/problem.exception';

export const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;

export interface EvidenceFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
]);

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

  if (buffer.length >= 5 && buffer.subarray(0, 5).toString() === '%PDF-') {
    return 'application/pdf';
  }

  return null;
}

export function validateEvidenceFile(file: EvidenceFile | undefined): void {
  if (file === undefined || file.size === 0) {
    throw new ProblemException(
      'PROOF_FILE_REQUIRED',
      '증빙 파일을 첨부해 주세요.',
      HttpStatus.BAD_REQUEST,
    );
  }

  if (file.size > MAX_EVIDENCE_BYTES) {
    throw new ProblemException(
      'UPLOAD_TOO_LARGE',
      '증빙 파일은 5MB 이하여야 합니다.',
      HttpStatus.BAD_REQUEST,
    );
  }

  if (
    !allowedMimeTypes.has(file.mimetype) ||
    detectedMimeType(file.buffer) !== file.mimetype
  ) {
    throw new ProblemException(
      'UPLOAD_TYPE_NOT_ALLOWED',
      'JPEG, PNG, PDF 파일만 업로드할 수 있습니다.',
      HttpStatus.BAD_REQUEST,
    );
  }
}
