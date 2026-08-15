import { assertSafeObjectKey } from './storage-object-key';

describe('assertSafeObjectKey', () => {
  it('accepts generated profile image keys', () => {
    expect(() =>
      assertSafeObjectKey(
        'profile-images/cmse9tn2u0001w46h0icpk3xr/123e4567-e89b-12d3-a456-426614174000',
      ),
    ).not.toThrow();
  });

  it('rejects traversal and unsupported private storage prefixes', () => {
    expect(() =>
      assertSafeObjectKey(
        'profile-images/user-1/../../123e4567-e89b-12d3-a456-426614174000',
      ),
    ).toThrow('Unsafe private storage object key');
    expect(() =>
      assertSafeObjectKey(
        'public/user-1/123e4567-e89b-12d3-a456-426614174000',
      ),
    ).toThrow('Unsafe private storage object key');
  });
});
