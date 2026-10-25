import type { TravelStyle } from '@/lib/api/profile';

// Travel type test (#42, ADR-052). Types are region-neutral; each answer
// gives one point to one type.

export const TRAVEL_TYPE_KEYS = [
  'dawn',
  'food',
  'slow',
  'mood',
  'night',
  'spont',
  'plan',
  'market',
] as const;

export type TravelTypeKey = (typeof TRAVEL_TYPE_KEYS)[number];

export type TravelTypeGlyph =
  | 'sun'
  | 'bowl'
  | 'cup'
  | 'camera'
  | 'moon'
  | 'pin'
  | 'map'
  | 'bag';

export type TravelType = {
  name: string;
  tagline: string;
  description: string;
  traits: readonly [string, string, string];
  styles: readonly TravelStyle[];
  match: TravelTypeKey;
  color: string;
  glyph: TravelTypeGlyph;
};

export const TRAVEL_TYPES: Record<TravelTypeKey, TravelType> = {
  dawn: {
    name: '새벽 오름러',
    tagline: '해 뜨는 걸 봐야 여행이 시작돼요',
    description:
      '알람 없이도 다섯 시에 눈이 떠지는 사람이에요. 사람 없는 정상에서 마시는 커피 한 잔이 여행의 이유예요.',
    traits: ['일출 시간부터 검색', '운동화 필수', '밤 10시면 졸려요'],
    styles: ['NATURE', 'ACTIVITY'],
    match: 'food',
    color: '#00a878',
    glyph: 'sun',
  },
  food: {
    name: '골목 미식가',
    tagline: '줄 서는 집보다 현지인 단골집',
    description:
      '여행지는 결국 먹으러 가는 곳이에요. 메뉴판에 사진 없는 집을 보면 설레요.',
    traits: [
      '식당 리스트가 곧 일정표',
      '하루 다섯 끼 가능',
      '골목 끝까지 가 봐요',
    ],
    styles: ['FOOD_EXPLORER'],
    match: 'slow',
    color: '#c73568',
    glyph: 'bowl',
  },
  slow: {
    name: '느린 산책자',
    tagline: '일정표 없이, 창가 자리에서 반나절',
    description:
      '한 곳에 오래 머무는 게 좋아요. 카페 두 곳이면 하루가 꽉 찬 여행이에요.',
    traits: ['한 곳에 오래 머물러요', '사진보다 기억', '걷다가 멈추는 게 일정'],
    styles: ['SLOW_TRAVEL'],
    match: 'mood',
    color: '#8a3e8f',
    glyph: 'cup',
  },
  mood: {
    name: '감성 수집가',
    tagline: '인생샷 한 장에 30분 기다릴 수 있어요',
    description:
      '빛이 좋은 시간을 알고, 전시와 소품샵을 꼭 들러요. 사진 폴더가 곧 여행 일기예요.',
    traits: ['빛 좋은 시간을 알아요', '전시·소품샵 필수', '필름 카메라 챙김'],
    styles: ['PHOTO', 'CULTURE_ART'],
    match: 'dawn',
    color: '#675dda',
    glyph: 'camera',
  },
  night: {
    name: '밤마실 탐험가',
    tagline: '여행은 해 지고 나서부터',
    description:
      '낮에는 충전, 밤에는 출동이에요. 숙소는 늘 걸어서 나갈 수 있는 곳으로 골라요.',
    traits: ['야장 지도 보유', '아침 일정 없음', '숙소는 번화가 근처'],
    styles: ['NIGHTLIFE'],
    match: 'spont',
    color: '#3b3650',
    glyph: 'moon',
  },
  spont: {
    name: '즉흥 모험가',
    tagline: '계획은 도착해서 세워요',
    description:
      '숙소랑 비행기만 정하면 준비 끝이에요. 길을 잃는 것도 여행이라고 생각해요.',
    traits: [
      '비 오면 우비 사서 나가요',
      '현지인 추천이면 바로 출발',
      '버스 노선 즉석 탐색',
    ],
    styles: ['ACTIVITY', 'SOLO'],
    match: 'night',
    color: '#d4602c',
    glyph: 'pin',
  },
  plan: {
    name: '동선 설계자',
    tagline: '동선 짜는 게 여행의 절반',
    description:
      '오픈 시간, 이동 시간, 플랜 B까지 준비해요. 같이 간 사람들 만족도는 내가 책임져요.',
    traits: ['플랜 B까지 준비', '오픈런 성공률 90%', '일행 만족도 책임'],
    styles: ['FAMILY'],
    match: 'slow',
    color: '#1b8296',
    glyph: 'map',
  },
  market: {
    name: '시장 털이범',
    tagline: '캐리어 하나는 기념품 몫',
    description:
      '시장 가는 날이 여행의 하이라이트예요. 시식은 예의상 다 해 보고, 택배 박스는 단골이에요.',
    traits: ['오일장 날짜 체크', '택배 박스 단골', '시식은 예의상 전부'],
    styles: ['SHOPPING', 'FOOD_EXPLORER'],
    match: 'food',
    color: '#b7800b',
    glyph: 'bag',
  },
};

export type TravelTestQuestion = {
  text: string;
  options: readonly { label: string; type: TravelTypeKey }[];
};

export const TRAVEL_TEST_QUESTIONS: readonly TravelTestQuestion[] = [
  {
    text: '여행 첫날 아침 7시, 나는 어디에?',
    options: [
      { label: '이미 오름 정상에서 해 보는 중', type: 'dawn' },
      { label: '아직 꿈나라, 첫 일정은 브런치', type: 'slow' },
      { label: '숙소 앞 해장국집 줄 서는 중', type: 'food' },
      { label: '오늘 뭐 하지? 지도 여는 중', type: 'spont' },
    ],
  },
  {
    text: '여행 계획, 어떻게 세워요?',
    options: [
      { label: '시간 단위 동선표', type: 'plan' },
      { label: '숙소랑 비행기만 끝', type: 'spont' },
      { label: '가고 싶은 식당 리스트만 빼곡', type: 'food' },
      { label: '사진 찍을 스팟 저장 폴더', type: 'mood' },
    ],
  },
  {
    text: '도착했더니 비가 와요',
    options: [
      { label: '우비 사서 일단 나간다', type: 'spont' },
      { label: '창 넓은 카페에서 비 구경', type: 'slow' },
      { label: '미술관이랑 전시로 바꾼다', type: 'mood' },
      { label: '플랜 B 이미 준비돼 있음', type: 'plan' },
    ],
  },
  {
    text: '여행지에서 꼭 사 오는 건?',
    options: [
      { label: '시장 먹거리 한 박스', type: 'market' },
      { label: '필름 사진과 엽서', type: 'mood' },
      { label: '아무것도요, 기억이면 충분', type: 'slow' },
      { label: '그 지역 술 한 병', type: 'night' },
    ],
  },
  {
    text: '저녁 9시, 나는?',
    options: [
      { label: '숙소에서 내일 동선 체크', type: 'plan' },
      { label: '포차로 2차 가는 중', type: 'night' },
      { label: '야시장 한 바퀴 더', type: 'market' },
      { label: '이미 잠듦, 내일 일출 봐야 해서', type: 'dawn' },
    ],
  },
  {
    text: '밥집 고르는 기준은?',
    options: [
      { label: '현지인 단골인지', type: 'food' },
      { label: '밤 분위기 좋은 곳', type: 'night' },
      { label: '지나가다 끌리는 곳', type: 'spont' },
      { label: '동선상 줄 없는 곳', type: 'plan' },
    ],
  },
  {
    text: '여행 사진첩을 열면?',
    options: [
      { label: '음식 사진이 70%', type: 'food' },
      { label: '산, 바다, 하늘', type: 'dawn' },
      { label: '내가 나온 인생샷', type: 'mood' },
      { label: '사진은 별로 없어요', type: 'slow' },
    ],
  },
  {
    text: '현지인에게 딱 하나만 물을 수 있다면?',
    options: [
      { label: '"여기 사람들 진짜 가는 시장은요?"', type: 'market' },
      { label: '"관광객 없는 산책길 있어요?"', type: 'slow' },
      { label: '"오늘 밤 갈 만한 데 있어요?"', type: 'night' },
      { label: '"지금 일출 보러 가도 돼요?"', type: 'dawn' },
    ],
  },
  {
    text: '같이 가고 싶은 여행 메이트는?',
    options: [
      { label: '혼자가 제일 편해요', type: 'spont' },
      { label: '시장 같이 털어 줄 친구', type: 'market' },
      { label: '사진 잘 찍어 주는 친구', type: 'mood' },
      { label: '내 일정 믿고 따라오는 사람', type: 'plan' },
    ],
  },
  {
    text: '여행 마지막 날, 하고 싶은 건?',
    options: [
      { label: '마지막 일출 한 번 더', type: 'dawn' },
      { label: '시장 들러 양손 가득', type: 'market' },
      { label: '마지막 밤 불태우기', type: 'night' },
      { label: '못 간 곳 몰아서 찍기', type: 'plan' },
    ],
  },
];

export function isTravelTypeKey(value: string): value is TravelTypeKey {
  return (TRAVEL_TYPE_KEYS as readonly string[]).includes(value);
}

/** The type with the most answers; on a tie, the one picked most recently. */
export function scoreTravelTest(
  answers: readonly TravelTypeKey[],
): TravelTypeKey | null {
  const counts = new Map<TravelTypeKey, number>();
  let best: TravelTypeKey | null = null;
  for (const key of answers) {
    const count = (counts.get(key) ?? 0) + 1;
    counts.set(key, count);
    if (best === null || count >= (counts.get(best) ?? 0)) {
      best = key;
    }
  }
  return best;
}
