import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { parse } from 'cookie';
import type { Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { AUTH_COOKIE_NAME } from '../auth/auth-cookie';
import { ProblemException } from '../common/http/problem.exception';
import { RoomAccessService } from '../rooms/room-access.service';
import { RoomsService } from '../rooms/rooms.service';
import {
  realtimeRoomKey,
  type RealtimeServer,
  RealtimePublisher,
} from './realtime.publisher';
import type {
  ClientToServerEvents,
  RoomMembershipResult,
  ServerToClientEvents,
  SocketData,
} from './realtime.types';

type RealtimeSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

function roomSlugFrom(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const input = value as Record<string, unknown>;
  return Object.keys(input).length === 1 &&
    typeof input.roomSlug === 'string' &&
    input.roomSlug.length > 0 &&
    input.roomSlug.length <= 64
    ? input.roomSlug
    : null;
}

function membershipFailure(error: unknown): RoomMembershipResult {
  return error instanceof ProblemException
    ? { ok: false, code: error.code, detail: error.detail }
    : {
        ok: false,
        code: 'ROOM_MEMBERSHIP_FAILED',
        detail: '방 실시간 연결을 처리하지 못했습니다.',
      };
}

@WebSocketGateway({
  cors: {
    credentials: true,
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  },
})
export class RealtimeGateway implements OnGatewayInit {
  @WebSocketServer()
  private server!: RealtimeServer;

  constructor(
    private readonly auth: AuthService,
    private readonly rooms: RoomsService,
    private readonly roomAccess: RoomAccessService,
    private readonly publisher: RealtimePublisher,
  ) {}

  afterInit(server: RealtimeServer): void {
    this.publisher.attachServer(server);
    server.use((socket, next) => {
      void this.authenticateSocket(socket, next);
    });
  }

  private async authenticateSocket(
    socket: RealtimeSocket,
    next: (error?: Error) => void,
  ): Promise<void> {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      const token =
        cookieHeader === undefined
          ? undefined
          : parse(cookieHeader)[AUTH_COOKIE_NAME];
      if (token === undefined) {
        throw new Error('Authentication cookie is missing');
      }
      socket.data.user = await this.auth.authenticateToken(token);
      next();
    } catch {
      const error = new Error('로그인이 필요한 실시간 연결입니다.');
      error.name = 'AUTHENTICATION_REQUIRED';
      next(error);
    }
  }

  @SubscribeMessage('room.join')
  async join(
    @ConnectedSocket() client: RealtimeSocket,
    @MessageBody() input: unknown,
  ): Promise<RoomMembershipResult> {
    const roomSlug = roomSlugFrom(input);
    if (roomSlug === null) {
      return {
        ok: false,
        code: 'INVALID_ROOM_MEMBERSHIP_REQUEST',
        detail: 'roomSlug가 필요합니다.',
      };
    }
    const user = client.data.user;
    if (user === undefined) {
      return {
        ok: false,
        code: 'AUTHENTICATION_REQUIRED',
        detail: '로그인이 필요합니다.',
      };
    }
    try {
      const room = await this.rooms.getIdentity(roomSlug);
      await this.roomAccess.assertCanViewContent(user, room.destinationId);
      await client.join(realtimeRoomKey(room.id));
      return { ok: true, roomSlug };
    } catch (error: unknown) {
      return membershipFailure(error);
    }
  }

  @SubscribeMessage('room.leave')
  async leave(
    @ConnectedSocket() client: RealtimeSocket,
    @MessageBody() input: unknown,
  ): Promise<RoomMembershipResult> {
    const roomSlug = roomSlugFrom(input);
    if (roomSlug === null) {
      return {
        ok: false,
        code: 'INVALID_ROOM_MEMBERSHIP_REQUEST',
        detail: 'roomSlug가 필요합니다.',
      };
    }
    try {
      const room = await this.rooms.getIdentity(roomSlug);
      await client.leave(realtimeRoomKey(room.id));
      return { ok: true, roomSlug };
    } catch (error: unknown) {
      return membershipFailure(error);
    }
  }
}
