import type { Metadata } from 'next';
import { TravelTest } from '@/components/travel-test/travel-test';
import { getMessages } from '@/i18n/server';
import { TestShell } from './test-shell';

// The OG image stays Korean in both languages (`public/test/og/`).
export async function generateMetadata(): Promise<Metadata> {
  const t = (await getMessages()).travelTest.meta;
  return {
    title: t.title,
    description: t.description,
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      images: ['/test/og/intro.png'],
    },
  };
}

export default function TravelTestPage(): React.JSX.Element {
  return (
    <TestShell>
      <TravelTest />
    </TestShell>
  );
}
