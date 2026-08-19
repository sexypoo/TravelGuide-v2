import type { AppIconName } from '@/components/common';

export const preorderProblems: ReadonlyArray<{
  icon: AppIconName;
  title: string;
  description: string;
}> = [
  {
    icon: 'live',
    title: '갑작스러운 변수',
    description: '날씨, 휴무, 교통처럼 검색만으로 대응하기 어려운 순간',
  },
  {
    icon: 'clock',
    title: '정보의 시차',
    description: '지금 줄이 긴지, 실제로 운영 중인지 알 수 없는 정보',
  },
  {
    icon: 'shield',
    title: '광고 같은 추천',
    description: '누가 왜 추천하는지 알 수 없는 홍보성 목록과 후기',
  },
];

export const preorderProductMoments: ReadonlyArray<{
  label: string;
  title: string;
  description: string;
  image: string;
  alt: string;
}> = [
  {
    label: '01 · VERIFY',
    title: '여행 일정을 확인하고 들어와요',
    description:
      '여행자와 현지인의 자격을 확인해, 누구의 답인지 분명한 도움방을 만듭니다.',
    image: '/preorder/traveler-verification-20260819.webp',
    alt: '제주 여행 일정과 증빙을 제출하는 여행자 인증 화면',
  },
  {
    label: '02 · ASK',
    title: '한 사람을 기다리지 않고 물어요',
    description:
      '여행지 도움방에 상황을 남기면 여러 인증 참여자가 각자의 현장 경험으로 답합니다.',
    image: '/preorder/field-answers-20260819.webp',
    alt: '두 명의 인증 현지인이 현장 대기 상황을 답한 화면',
  },
  {
    label: '03 · DECIDE',
    title: '모인 답을 보고 바로 결정해요',
    description:
      '현장 답변을 종합한 대기 시간과 혼잡도처럼 지금 필요한 판단만 빠르게 확인합니다.',
    image: '/preorder/live-result-20260819.webp',
    alt: '현장 답변을 종합해 대기 시간과 혼잡도를 보여 주는 화면',
  },
];
