import { Logger } from '@nestjs/common';
import { PrivateObjectLifecycleService } from './private-object-lifecycle.service';
import type { StorageService } from './storage.service';

function createStorage(): jest.Mocked<StorageService> {
  return {
    putPrivate: jest.fn().mockResolvedValue({
      objectKey: 'question-media/room-1/object-1',
      sizeBytes: 4,
    }),
    getPrivateDownload: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  };
}

describe('PrivateObjectLifecycleService', () => {
  const upload = {
    objectKey: 'question-media/room-1/object-1',
    contents: Buffer.from('test'),
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('persists after the private upload succeeds', async () => {
    const storage = createStorage();
    const persist = jest.fn().mockResolvedValue({ id: 'record-1' });
    const service = new PrivateObjectLifecycleService(storage);

    await expect(service.storeThenPersist(upload, persist)).resolves.toEqual({
      id: 'record-1',
    });
    expect(storage.putPrivate.mock.calls).toEqual([[upload]]);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(storage.delete.mock.calls).toHaveLength(0);
  });

  it('does not persist or compensate when the upload itself fails', async () => {
    const storage = createStorage();
    const uploadError = new Error('storage unavailable');
    storage.putPrivate.mockRejectedValue(uploadError);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const persist = jest.fn();
    const service = new PrivateObjectLifecycleService(storage);

    await expect(service.storeThenPersist(upload, persist)).rejects.toBe(
      uploadError,
    );
    expect(persist).not.toHaveBeenCalled();
    expect(storage.delete.mock.calls).toHaveLength(0);
  });

  it('deletes the new object and preserves a persistence error', async () => {
    const storage = createStorage();
    const persistenceError = new Error('database rejected the record');
    const service = new PrivateObjectLifecycleService(storage);

    await expect(
      service.storeThenPersist(upload, () => Promise.reject(persistenceError)),
    ).rejects.toBe(persistenceError);
    expect(storage.delete.mock.calls).toEqual([[upload.objectKey]]);
  });

  it('preserves a persistence error when compensating deletion also fails', async () => {
    const storage = createStorage();
    const persistenceError = new Error('database rejected the record');
    storage.delete.mockRejectedValue(new TypeError('storage unavailable'));
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const service = new PrivateObjectLifecycleService(storage);

    await expect(
      service.storeThenPersist(upload, () => Promise.reject(persistenceError)),
    ).rejects.toBe(persistenceError);
    expect(warn).toHaveBeenCalledWith(
      'Private object cleanup failed: TypeError',
    );
  });

  it('swallows unknown cleanup failures in the explicit best-effort path', async () => {
    const storage = createStorage();
    storage.delete.mockRejectedValue('unavailable');
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const service = new PrivateObjectLifecycleService(storage);

    await expect(
      service.deleteBestEffort(upload.objectKey),
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      'Private object cleanup failed: UnknownError',
    );
  });
});
