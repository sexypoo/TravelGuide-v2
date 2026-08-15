import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '여쭈어 (여JJU) — 여행지의 지금을 나누는 커뮤니티',
    template: '%s | 여쭈어',
  },
  description:
    '여행 정보를 편하게 나누고, 인증된 참여자와 여행지의 지금을 확인하는 커뮤니티',
};

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fff9fb',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
