'use client';

import { AppError } from '@/components/app/app-error';

export default function ErrorPage({
  reset,
}: {
  reset: () => void;
}): React.JSX.Element {
  return <AppError reset={reset} />;
}
