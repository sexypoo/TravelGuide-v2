'use client';

interface AppErrorProps {
  reset: () => void;
  title?: string;
}

export function AppError({
  reset,
  title = '화면을 불러오지 못했어요',
}: AppErrorProps): React.JSX.Element {
  return (
    <section className="appError" role="alert">
      <span aria-hidden="true">!</span>
      <h1>{title}</h1>
      <p>연결 상태를 확인한 뒤 다시 시도해 주세요.</p>
      <button type="button" onClick={reset}>
        다시 불러오기
      </button>
    </section>
  );
}
