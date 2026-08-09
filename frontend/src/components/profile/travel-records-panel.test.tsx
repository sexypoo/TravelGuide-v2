import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  createTravelRecord,
  deleteTravelRecord,
  listTravelRecords,
  updateTravelRecord,
} from '@/lib/api/travel-records';
import { TravelRecordsPanel } from './travel-records-panel';

jest.mock('../../lib/api/travel-records', () => ({
  createTravelRecord: jest.fn(),
  deleteTravelRecord: jest.fn(),
  listTravelRecords: jest.fn(),
  updateTravelRecord: jest.fn(),
}));

const listMock = jest.mocked(listTravelRecords);
const createMock = jest.mocked(createTravelRecord);
const deleteMock = jest.mocked(deleteTravelRecord);
const updateMock = jest.mocked(updateTravelRecord);

function renderPanel(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <TravelRecordsPanel />
    </QueryClientProvider>,
  );
}

describe('TravelRecordsPanel', () => {
  beforeEach(() => {
    listMock.mockReset();
    createMock.mockReset();
    deleteMock.mockReset();
    updateMock.mockReset();
  });

  it('creates a dated personal travel record and refreshes the timeline', async () => {
    listMock.mockResolvedValue([]);
    createMock.mockResolvedValue({
      id: 'record-1',
      title: '봄날의 제주',
      destination: '제주',
      startedOn: '2026-04-03',
      endedOn: '2026-04-06',
      note: null,
      createdAt: '2026-04-07T00:00:00.000Z',
      updatedAt: '2026-04-07T00:00:00.000Z',
    });
    renderPanel();
    expect(
      await screen.findByText('첫 여행을 기록해 보세요'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /기록 추가/ }));
    fireEvent.change(screen.getByLabelText('기록 제목'), {
      target: { value: '봄날의 제주' },
    });
    fireEvent.change(screen.getByLabelText('여행지'), {
      target: { value: '제주' },
    });
    fireEvent.change(screen.getByLabelText('시작일'), {
      target: { value: '2026-04-03' },
    });
    fireEvent.change(screen.getByLabelText('종료일'), {
      target: { value: '2026-04-06' },
    });
    fireEvent.click(screen.getByRole('button', { name: '기록 저장' }));

    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith({
        title: '봄날의 제주',
        destination: '제주',
        startedOn: '2026-04-03',
        endedOn: '2026-04-06',
        note: null,
      }),
    );
  });
});
