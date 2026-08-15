const SAFE_OBJECT_KEY =
  /^(?:verification|room-media|answer-media|question-media|profile-images)\/[A-Za-z0-9_-]+\/[0-9a-f-]{36}$/;

export function assertSafeObjectKey(objectKey: string): void {
  if (!SAFE_OBJECT_KEY.test(objectKey)) {
    throw new Error('Unsafe private storage object key');
  }
}
