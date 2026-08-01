import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { getCurrentUser } from '@/lib/auth/session';
import { safeNextPath } from '@/lib/auth/safe-next-path';

interface LoginPageProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.JSX.Element> {
  const user = await getCurrentUser();
  if (user !== null) {
    redirect(user.isAdmin ? '/admin' : '/app');
  }

  const nextPath = safeNextPath((await searchParams).next);
  return (
    <AuthShell
      eyebrow="다시 만나서 반가워요"
      title="로그인"
      description="여행지에서 필요한 정보와 대화를 이어서 확인하세요."
      alternateHref="/auth/register"
      alternatePrompt="아직 계정이 없나요?"
      alternateLabel="계정 만들기"
    >
      <AuthForm mode="login" nextPath={nextPath} />
    </AuthShell>
  );
}
