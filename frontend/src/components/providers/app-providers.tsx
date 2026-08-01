'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RealtimeProvider } from './realtime-provider';

export function AppProviders({
  children,
  currentUserId,
}: Readonly<{
  children: React.ReactNode;
  currentUserId: string;
}>): React.JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 15_000 },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider currentUserId={currentUserId}>
        {children}
      </RealtimeProvider>
    </QueryClientProvider>
  );
}
