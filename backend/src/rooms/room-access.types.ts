export type RoomAccessStatus = 'AVAILABLE' | 'VERIFICATION_REQUIRED';

export interface RoomAccessResponse {
  status: RoomAccessStatus;
  labelKo: '입장 가능' | '인증 필요';
  canViewContent: boolean;
}
