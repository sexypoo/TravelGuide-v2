import { ApiProblem } from '@/lib/api/problem-details';

export const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);

export function proofError(file: File | undefined): string | undefined {
  if (file === undefined) return '증빙 파일을 선택해 주세요.';
  if (!allowedTypes.has(file.type))
    return 'JPEG, PNG, PDF 파일만 선택할 수 있어요.';
  if (file.size > MAX_PROOF_BYTES) return '증빙 파일은 5MB 이하여야 해요.';
  return undefined;
}

export function applicationError(error: unknown): string {
  if (error instanceof ApiProblem) {
    const messages: Readonly<Record<string, string>> = {
      UPLOAD_TOO_LARGE: '증빙 파일은 5MB 이하여야 해요.',
      UPLOAD_TYPE_NOT_ALLOWED: '파일 내용과 형식을 다시 확인해 주세요.',
      VERIFICATION_ALREADY_PENDING: '이미 같은 유형의 신청이 심사 중이에요.',
      INVALID_TRAVEL_DATES: '여행 시작일과 종료일을 다시 확인해 주세요.',
      TRAVEL_END_DATE_IN_PAST: '오늘 이후의 여행 종료일을 선택해 주세요.',
      GPS_ACCURACY_TOO_LOW:
        '위치 정확도가 낮아요. 열린 장소에서 다시 확인해 주세요.',
      OUTSIDE_DESTINATION_AREA: '현재 위치가 제주 인증 범위 밖이에요.',
    };
    return messages[error.code] ?? error.message;
  }
  return '신청을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.';
}

export function localDateToIso(value: string, endOfDay: boolean): string {
  const suffix = endOfDay ? 'T23:59:59.999' : 'T00:00:00.000';
  return new Date(`${value}${suffix}`).toISOString();
}
