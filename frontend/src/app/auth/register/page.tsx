import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';
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

  return (
    <AuthShell
      eyebrow="여행 정보를 나누는 첫 단계"
      title="계정 만들기"
      description="커뮤니티는 가입 후 바로 이용할 수 있어요."
      alternateHref="/auth/login"
      alternatePrompt="이미 계정이 있나요?"
      alternateLabel="로그인"
      nextPath={nextPath}
    >
      <AuthForm mode="register" nextPath={nextPath} />
    </AuthShell>
  );
}
