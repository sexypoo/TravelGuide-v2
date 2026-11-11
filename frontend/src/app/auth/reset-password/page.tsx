import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { getMessages } from '@/i18n/server';
import { PasswordRecoveryForm } from '@/components/auth/password-recovery-form';
import { getCurrentUser } from '@/lib/auth/session';

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (user !== null) redirect(user.isAdmin ? '/admin' : '/app');
  const rawToken = (await searchParams).token;
  const token = typeof rawToken === 'string' ? rawToken : undefined;

  const t = await getMessages();
  return (
    <AuthShell
      copy={t.auth.reset}
      backLabel={t.auth.backToStart}
      alternateHref="/auth/forgot-password"
    >
      <PasswordRecoveryForm mode="reset" token={token} />
    </AuthShell>
  );
}
