import type { Metadata } from 'next';
import { TravelTest } from '@/components/travel-test/travel-test';
import { TestShell } from './test-shell';

export const metadata: Metadata = {
  title: '나는 어떤 여행자일까? 여행자 유형 테스트',
  description:
    '질문 10개로 알아보는 내 여행 유형. 새벽 오름러부터 시장 털이범까지, 로그인 없이 1분이면 끝나요.',
  openGraph: {
    title: '나는 어떤 여행자일까?',
    description: '질문 10개로 알아보는 내 여행 유형. 로그인 없이 1분.',
    images: ['/test/og/intro.png'],
  },
};

export default function TravelTestPage(): React.JSX.Element {
  return (
    <TestShell>
      <TravelTest />
    </TestShell>
  );
}
