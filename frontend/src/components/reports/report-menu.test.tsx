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

  it('moves focus into the dialog and closes it with Escape', async () => {
    render(
      <ReportMenu
        targets={[{ type: 'QUESTION', id: 'question-1', label: '이 토픽' }]}
      />,
    );
    const trigger = screen.getByRole('button', { name: '신고' });
    fireEvent.click(trigger);

    const closeButton = screen.getByRole('button', { name: '신고 창 닫기' });
    await waitFor(() => expect(closeButton).toHaveFocus());
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('keeps Tab and Shift+Tab inside the dialog', async () => {
    render(
      <ReportMenu
        targets={[{ type: 'QUESTION', id: 'question-1', label: '이 토픽' }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '신고' }));
    const dialog = screen.getByRole('dialog');
    const closeButton = screen.getByRole('button', { name: '신고 창 닫기' });
    const submitButton = screen.getByRole('button', { name: '신고 접수하기' });
    await waitFor(() => expect(closeButton).toHaveFocus());

    submitButton.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(submitButton).toHaveFocus();
  });

  it('moves focus to the confirm button after a successful report', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 201 } as Response);
    render(
      <ReportMenu
        targets={[{ type: 'QUESTION', id: 'question-1', label: '이 토픽' }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '신고' }));
    const submitButton = screen.getByRole('button', { name: '신고 접수하기' });
    submitButton.focus();
    fireEvent.click(submitButton);

    const confirmButton = await screen.findByRole('button', { name: '확인' });
    await waitFor(() => expect(confirmButton).toHaveFocus());
  });

  it('locks page scroll while open and restores it after closing', () => {
    document.body.style.overflow = 'auto';
    render(
      <ReportMenu
        targets={[{ type: 'QUESTION', id: 'question-1', label: '이 토픽' }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '신고' }));
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(screen.getByRole('button', { name: '신고 창 닫기' }));
    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow = '';
  });
});
