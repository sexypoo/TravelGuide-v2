import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
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

  return (
    <AuthShell
      eyebrow="새 비밀번호 만들기"
      title="비밀번호 변경"
      description="다른 서비스에서 사용하지 않는 새 비밀번호를 입력해 주세요."
      alternateHref="/auth/forgot-password"
      alternatePrompt="링크에 문제가 있나요?"
      alternateLabel="새 링크 받기"
    >
      <PasswordRecoveryForm mode="reset" token={token} />
    </AuthShell>
  );
}
