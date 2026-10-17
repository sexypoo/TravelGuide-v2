const fallbackPath = '/app';
const internalBase = 'https://internal.invalid';
const allowedPrefixes = ['/app', '/admin'];
// Browsers normalize backslashes and control characters into cross-origin
// URLs (e.g. `/\evil.example`), so reject them before parsing.
const unsafeCharacters = /[\\\u0000-\u001f\u007f]/u;

// Narrows a login `next` value to a same-origin /app or /admin path. Admin
// pages check the role themselves.
export function safeNextPath(value: string | string[] | undefined): string {
  if (typeof value !== 'string' || unsafeCharacters.test(value)) {
    return fallbackPath;
  }

  let url: URL;
  try {
    url = new URL(value, internalBase);
  } catch {
    return fallbackPath;
  }

  if (url.origin !== internalBase) return fallbackPath;
  const allowed = allowedPrefixes.some(
    (prefix) =>
      url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
  );
  if (!allowed) return fallbackPath;

  const path = `${url.pathname}${url.search}${url.hash}`;
  return path.startsWith('//') ? fallbackPath : path;
}
