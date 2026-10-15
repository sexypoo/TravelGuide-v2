import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { getCurrentUser } from '@/lib/auth/session';
import { safeNextPath } from '@/lib/auth/safe-next-path';

const fallbackPath = '/app';
const internalBase = 'https://internal.invalid';
// Backslashes and control characters are normalized by browsers into
// cross-origin URLs (e.g. `/\evil.example`), so reject them before parsing.
const unsafeCharacters = /[\\\u0000-\u001f\u007f]/u;

// Narrows a login `next` value to a same-origin /app path. The signed-in
// redirect and the login form must both use this value.
function internalAppPath(value: string): string {
  if (unsafeCharacters.test(value)) return fallbackPath;

  let url: URL;
  try {
    url = new URL(value, internalBase);
  } catch {
    return fallbackPath;
  }

  if (url.origin !== internalBase) return fallbackPath;
  if (url.pathname !== '/app' && !url.pathname.startsWith('/app/')) {
    return fallbackPath;
  }

  const path = `${url.pathname}${url.search}${url.hash}`;
  return path.startsWith('//') ? fallbackPath : path;
}

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
  const nextPath = internalAppPath(safeNextPath(parameters.next));
  if (user !== null) {
    redirect(user.isAdmin ? '/admin' : nextPath);
  }

  return (
    <AuthShell
      eyebrow="다시 만나서 반가워요"
      title="로그인"
      description="여행지에서 필요한 정보와 대화를 이어서 확인하세요."
      alternateHref="/auth/register"
      alternatePrompt="아직 계정이 없나요?"
      alternateLabel="계정 만들기"
    >
      <AuthForm
        mode="login"
        nextPath={nextPath}
        socialError={parameters.socialError === 'failed'}
      />
    </AuthShell>
  );
}
