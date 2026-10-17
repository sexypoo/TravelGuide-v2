import { AppFrame } from '@/components/app/app-frame';
import { AppNavigation } from '@/components/app/app-navigation';
import { AppProviders } from '@/components/providers/app-providers';
import { getCurrentUser } from '@/lib/auth/session';

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (user === null) {
    // Each page calls requireUser with its own path, so the login redirect
    // keeps the exact `next` instead of falling back to /app.
    return <>{children}</>;
  }

  return (
    <AppFrame chrome={<AppNavigation nickname={user.nickname} />}>
      <AppProviders currentUserId={user.id}>{children}</AppProviders>
    </AppFrame>
  );
}
