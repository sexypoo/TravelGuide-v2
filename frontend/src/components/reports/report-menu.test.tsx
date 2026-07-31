import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReportMenu } from './report-menu';

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

describe('ReportMenu', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });
  });

  it('requires a useful OTHER detail and submits the selected target', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 201 } as Response);
    render(
      <ReportMenu
        targets={[
          { type: 'ANSWER', id: 'answer-1', label: '이 답변' },
          { type: 'USER', id: 'local-1', label: '현지인 사용자' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '신고' }));
    fireEvent.change(screen.getByLabelText('신고 사유'), {
      target: { value: 'OTHER' },
    });
    fireEvent.click(screen.getByRole('button', { name: '신고 접수하기' }));
    expect(screen.getByRole('alert')).toHaveTextContent('10자 이상');
    fireEvent.change(screen.getByLabelText(/자세한 내용/), {
      target: { value: '운영자가 확인해야 할 구체적인 상황입니다.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '신고 접수하기' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('신고가 접수됐어요')).toBeInTheDocument();
  });
});
