import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { getMessages } from '@/i18n/server';
import { getCurrentUser } from '@/lib/auth/session';
import { safeNextPath } from '@/lib/auth/safe-next-path';

interface RegisterPageProps {
  searchParams: Promise<{
    next?: string | string[];
  }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps): Promise<React.JSX.Element> {
  const [user, parameters] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);
  // The signed-in redirect, the sign-up form, and the login link share this.
  const nextPath = safeNextPath(parameters.next);
  if (user !== null) {
    redirect(user.isAdmin ? '/admin' : nextPath);
  }

  const t = await getMessages();
  return (
    <AuthShell
      copy={t.auth.register}
      backLabel={t.auth.backToStart}
      alternateHref="/auth/login"
      nextPath={nextPath}
    >
      <AuthForm mode="register" nextPath={nextPath} />
    </AuthShell>
  );
}
