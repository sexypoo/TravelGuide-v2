import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TravelGuide — 제주 실시간 여행 도움방',
  description:
    '여행이 틀어지는 순간, 인증된 현지인에게 판단을 묻는 제주 도움방',
};

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#F7F5FA',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
