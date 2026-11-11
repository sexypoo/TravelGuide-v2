import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { getMessages } from '@/i18n/server';
import { getCurrentUser } from '@/lib/auth/session';
import { safeNextPath } from '@/lib/auth/safe-next-path';

interface LoginPageProps {
  searchParams: Promise<{
    next?: string | string[];
    socialError?: string | string[];
  }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.JSX.Element> {
  const [user, parameters] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);
  // The signed-in redirect and the login form must both use this value.
  const nextPath = safeNextPath(parameters.next);
  if (user !== null) {
    redirect(user.isAdmin ? '/admin' : nextPath);
  }

  const t = await getMessages();
  return (
    <AuthShell
      copy={t.auth.login}
      backLabel={t.auth.backToStart}
      alternateHref="/auth/register"
      nextPath={nextPath}
    >
      <AuthForm
        mode="login"
        nextPath={nextPath}
        socialError={parameters.socialError === 'failed'}
      />
    </AuthShell>
  );
}
