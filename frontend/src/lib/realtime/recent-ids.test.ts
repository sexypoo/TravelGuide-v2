import { createRecentIds } from './recent-ids';

describe('createRecentIds', () => {
  it('reports only the first sighting of an id', () => {
    const recent = createRecentIds(3);
    expect(recent.markSeen('a')).toBe(true);
    expect(recent.markSeen('a')).toBe(false);
  });

  it('forgets the oldest id once capacity is exceeded', () => {
    const recent = createRecentIds(2);
    recent.markSeen('a');
    recent.markSeen('b');
    recent.markSeen('c');
    expect(recent.markSeen('b')).toBe(false);
    expect(recent.markSeen('c')).toBe(false);
    expect(recent.markSeen('a')).toBe(true);
  });
});
