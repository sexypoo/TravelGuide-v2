import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordRecoveryForm } from '@/components/auth/password-recovery-form';
import { getCurrentUser } from '@/lib/auth/session';

export default async function ForgotPasswordPage(): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (user !== null) redirect(user.isAdmin ? '/admin' : '/app');

  return (
    <AuthShell
      eyebrow="계정 다시 찾기"
      title="비밀번호 재설정"
      description="가입한 이메일로 30분 동안 사용할 수 있는 안전한 링크를 보내드려요."
      alternateHref="/auth/register"
      alternatePrompt="아직 계정이 없나요?"
      alternateLabel="계정 만들기"
    >
      <PasswordRecoveryForm mode="forgot" />
    </AuthShell>
  );
}
