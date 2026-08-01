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
      eyebrow="여행 정보를 나누는 첫 단계"
      title="계정 만들기"
      description="커뮤니티는 가입 후 바로 이용할 수 있어요."
      alternateHref="/auth/login"
      alternatePrompt="이미 계정이 있나요?"
      alternateLabel="로그인"
    >
      <AuthForm mode="register" />
    </AuthShell>
  );
}
