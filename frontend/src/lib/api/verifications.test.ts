import {
  parseVerifications,
  submitTravelerVerification,
} from './verifications';

const payload = {
  id: 'verification-1',
  destination: { id: 'destination-jeju', slug: 'jeju', nameKo: '제주' },
  type: 'TRAVELER',
  status: 'REJECTED',
  startsAt: '2026-08-01T00:00:00.000Z',
  endsAt: '2026-08-03T00:00:00.000Z',
  localProofType: null,
  note: '항공권입니다.',
  reviewedAt: '2026-07-31T12:00:00.000Z',
  rejectionReason: '여행 기간이 보이도록 다시 제출해 주세요.',
  expiresAt: null,
  createdAt: '2026-07-31T10:00:00.000Z',
  proofObjectKey: 'must-not-survive',
  gpsLat: 33.3617,
};

describe('verification API contracts', () => {
  it('parses own status while dropping storage and GPS fields', () => {
    const result = parseVerifications([payload]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      status: 'REJECTED',
      rejectionReason: payload.rejectionReason,
    });
    expect(JSON.stringify(result)).not.toContain('proofObjectKey');
    expect(JSON.stringify(result)).not.toContain('gpsLat');
  });

  it('sends FormData without overriding its multipart boundary', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValue({ ok: true, status: 201 } as Response);
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });
    const data = new FormData();
    data.set('destinationId', 'destination-jeju');
    await submitTravelerVerification(data);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/verifications/traveler',
      expect.objectContaining({
        body: data,
        credentials: 'include',
        headers: { Accept: 'application/json' },
      }),
    );
  });
});
