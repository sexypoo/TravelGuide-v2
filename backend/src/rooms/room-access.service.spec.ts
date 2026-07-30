import type { AuthenticatedUser } from '../auth/authenticated-user';
import { ProblemException } from '../common/http/problem.exception';
import { RoomAccessService } from './room-access.service';

function user(role: 'USER' | 'ADMIN'): AuthenticatedUser {
  return {
    id: 'user-id',
    email: 'user@example.com',
    nickname: '사용자',
    role,
    createdAt: new Date('2026-07-31T00:00:00.000Z'),
  };
}

describe('RoomAccessService', () => {
  const service = new RoomAccessService();

  it('keeps a regular user locked until verification exists', () => {
    expect(service.getAccess(user('USER'))).toEqual({
      status: 'VERIFICATION_REQUIRED',
      labelKo: '인증 필요',
      canViewContent: false,
    });
    expect(() => service.assertCanViewContent(user('USER'))).toThrow(
      ProblemException,
    );
  });

  it('allows administrators to inspect room content', () => {
    expect(service.getAccess(user('ADMIN'))).toEqual({
      status: 'AVAILABLE',
      labelKo: '입장 가능',
      canViewContent: true,
    });
    expect(() => service.assertCanViewContent(user('ADMIN'))).not.toThrow();
  });
});
