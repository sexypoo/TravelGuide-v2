export interface RecentIds {
  /** Records the id and returns true only the first time it is seen. */
  markSeen: (id: string) => boolean;
}

export function createRecentIds(capacity: number): RecentIds {
  const ids = new Set<string>();
  return {
    markSeen(id) {
      if (ids.has(id)) return false;
      ids.add(id);
      if (ids.size > capacity) {
        const oldest = ids.values().next();
        if (oldest.done !== true) ids.delete(oldest.value);
      }
      return true;
    },
  };
}
