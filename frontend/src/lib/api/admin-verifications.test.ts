import {
  openVerificationEvidence,
  parseAdminVerification,
} from './admin-verifications';

const payload = {
  id: 'verification-1',
  applicant: { id: 'user-1', nickname: '제주현지인' },
  destination: { id: 'destination-jeju', slug: 'jeju', nameKo: '제주' },
  type: 'LOCAL',
  status: 'PENDING',
  startsAt: null,
  endsAt: null,
  localProofType: 'RESIDENCE',
  gpsSummary: {
    accuracyMeters: 83,
    capturedAt: '2026-07-31T10:00:00.000Z',
    withinDestinationRadius: true,
  },
  note: '제주에서 거주하고 있으며 지역 생활 정보를 알고 있습니다.',
  reviewedById: null,
  reviewedAt: null,
  rejectionReason: null,
  expiresAt: null,
  createdAt: '2026-07-31T10:00:00.000Z',
  proofObjectKey: 'must-not-survive',
  gpsLat: 33.3617,
  gpsLng: 126.5292,
};

describe('admin verification API', () => {
  it('keeps the admin DTO limited to review-safe fields', () => {
    const parsed = parseAdminVerification(payload);
    expect(parsed.gpsSummary).toEqual(payload.gpsSummary);
    expect(JSON.stringify(parsed)).not.toContain('proofObjectKey');
    expect(JSON.stringify(parsed)).not.toContain('gpsLat');
    expect(JSON.stringify(parsed)).not.toContain('gpsLng');
  });

  it('loads evidence only on call and revokes the object URL', async () => {
    const blob = new Blob(['proof'], { type: 'application/pdf' });
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValue({
        ok: true,
        status: 200,
        blob: async () => blob,
      } as Response);
    const createObjectURL = jest.fn(() => 'blob:private-proof');
    const revokeObjectURL = jest.fn();
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    });

    await openVerificationEvidence('verification-1');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:private-proof');
    click.mockRestore();
  });
});
