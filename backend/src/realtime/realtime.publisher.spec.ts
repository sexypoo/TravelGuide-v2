import { realtimeRoomKey } from './realtime.publisher';

describe('realtime room key', () => {
  it('uses only the server-resolved destination room id', () => {
    expect(realtimeRoomKey('room-internal-id')).toBe(
      'destination-room:room-internal-id',
    );
  });
});
