export type RoomAccessStatus =
  | 'AVAILABLE'
  | 'TRAVELER_PENDING'
  | 'LOCAL_PENDING'
  | 'VERIFICATION_REQUIRED';

export interface RoomAccessResponse {
  status: RoomAccessStatus;
  labelKo: '입장 가능' | '여행자 심사 중' | '현지인 심사 중' | '인증 필요';
  canViewContent: boolean;
  canChat: boolean;
  canCreateTopic: boolean;
  canAskQuestion: boolean;
  canAnswer: boolean;
  participantKind: RoomParticipantKind | null;
}
import type { RoomParticipantKind } from '@prisma/client';
