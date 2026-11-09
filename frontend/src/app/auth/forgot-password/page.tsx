import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { getMessages } from '@/i18n/server';
import { PasswordRecoveryForm } from '@/components/auth/password-recovery-form';
import { getCurrentUser } from '@/lib/auth/session';

export default async function ForgotPasswordPage(): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (user !== null) redirect(user.isAdmin ? '/admin' : '/app');

  const t = await getMessages();
  return (
    <AuthShell
      copy={t.auth.forgot}
      backLabel={t.auth.backToStart}
      alternateHref="/auth/register"
    >
      <PasswordRecoveryForm mode="forgot" />
    </AuthShell>
  );
}
