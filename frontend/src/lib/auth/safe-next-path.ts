export function safeNextPath(value: string | string[] | undefined): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//')
  ) {
    return '/app';
  }

  return value;
}
