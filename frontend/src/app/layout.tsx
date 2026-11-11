import type { Metadata, Viewport } from 'next';
import { I18nProvider } from '@/i18n/client';
import { getLocale, getMessages } from '@/i18n/server';
import './fonts/pretendard/pretendard.css';
import './fonts/wanted-sans/wanted-sans.css';
import '../styles/tokens.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return {
    title: { default: t.common.metaTitle, template: t.common.metaTemplate },
    description: t.common.metaDescription,
  };
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f4f3f7',
  interactiveWidget: 'resizes-content',
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.JSX.Element> {
  const locale = await getLocale();
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
