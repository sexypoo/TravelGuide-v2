import { HttpStatus, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import type { RoomAccessResponse } from './room-access.types';

@Injectable()
export class RoomAccessService {
  getAccess(user: AuthenticatedUser): RoomAccessResponse {
    if (user.role === 'ADMIN') {
      return {
        status: 'AVAILABLE',
        labelKo: '입장 가능',
        canViewContent: true,
      };
    }

    return {
      status: 'VERIFICATION_REQUIRED',
      labelKo: '인증 필요',
      canViewContent: false,
    };
  }

  assertCanViewContent(user: AuthenticatedUser): void {
    if (!this.getAccess(user).canViewContent) {
      throw new ProblemException(
        'ROOM_ACCESS_DENIED',
        '유효한 여행자 또는 현지인 인증이 필요합니다.',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
