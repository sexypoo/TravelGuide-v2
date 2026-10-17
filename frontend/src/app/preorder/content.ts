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
  title: string;
  description: string;
}> = [
  {
    title: '여행 일정을 확인하고 들어와요',
    description:
      '여행자와 현지인의 자격을 확인해, 누구의 답인지 분명한 도움방을 만듭니다.',
  },
  {
    title: '한 사람을 기다리지 않고 물어요',
    description:
      '여행지 도움방에 상황을 남기면 여러 인증 참여자가 각자의 현장 경험으로 답합니다.',
  },
  {
    title: '모인 답을 보고 바로 결정해요',
    description:
      '여러 사람의 답을 나란히 보고, 지금 내 여행에 맞는 선택을 빠르게 합니다.',
  },
];
