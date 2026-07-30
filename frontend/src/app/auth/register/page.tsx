import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { getCurrentUser } from '@/lib/auth/session';

export default async function RegisterPage(): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (user !== null) {
    redirect(user.isAdmin ? '/admin' : '/app');
  }

  return (
    <AuthShell
      eyebrow="제주에서 답을 나누는 첫 단계"
      title="계정 만들기"
      description="안전한 도움방을 위해 기본 정보를 확인할게요."
      alternateHref="/auth/login"
      alternatePrompt="이미 계정이 있나요?"
      alternateLabel="로그인"
    >
      <AuthForm mode="register" />
    </AuthShell>
  );
}
