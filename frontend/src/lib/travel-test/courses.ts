import type { TravelTypeKey } from './content';

// Sample Jeju day courses per travel type (#42, ADR-052). Written by the
// team with AI help, not by verified locals; the UI says so. Replace each
// with a verified local's course as they come in (#14). Keep notes free of
// exact hours, prices, or schedules that go stale.

export type CourseStop = {
  time: string;
  place: string;
  note: string;
};

export const SAMPLE_COURSE_REGION = '제주';

export const SAMPLE_COURSES: Record<TravelTypeKey, readonly CourseStop[]> = {
  dawn: [
    {
      time: '05:30',
      place: '다랑쉬오름 일출',
      note: '정상까지 오르막이 가팔라요. 바람막이를 챙기세요.',
    },
    {
      time: '08:00',
      place: '구좌 동네 해장국집',
      note: '오름에서 내려와 따뜻한 국물로 아침을 해요.',
    },
    {
      time: '10:30',
      place: '비자림 숲길',
      note: '그늘이 깊어서 한낮 전에 걷기 좋아요.',
    },
    {
      time: '14:00',
      place: '종달리 해안도로',
      note: '이른 아침을 보냈다면 바다 보며 쉬어 가요.',
    },
  ],
  food: [
    {
      time: '09:00',
      place: '동문재래시장',
      note: '시장 안쪽 분식과 국숫집으로 아침을 시작해요.',
    },
    {
      time: '12:30',
      place: '고기국수 한 그릇',
      note: '점심시간 직전에 가면 덜 기다려요.',
    },
    {
      time: '15:00',
      place: '제주시민속오일장',
      note: '날짜가 2와 7로 끝나는 날에만 열려요.',
    },
    {
      time: '19:00',
      place: '항구 근처 횟집',
      note: '그날 들어온 생선을 물어보고 주문해요.',
    },
  ],
  slow: [
    {
      time: '10:30',
      place: '애월 해안 카페',
      note: '바다가 보이는 창가 자리에서 오전을 보내요.',
    },
    {
      time: '13:30',
      place: '한담해안산책로',
      note: '애월에서 곽지까지 바다 옆을 천천히 걸어요.',
    },
    {
      time: '16:00',
      place: '동네 책방',
      note: '제주 이야기가 담긴 책 한 권을 골라요.',
    },
    {
      time: '18:00',
      place: '협재해수욕장 노을',
      note: '해 지기 30분 전에 도착하면 좋아요.',
    },
  ],
  mood: [
    {
      time: '06:30',
      place: '광치기해변 일출',
      note: '성산일출봉을 배경으로 해가 떠요.',
    },
    {
      time: '11:00',
      place: '제주도립김창열미술관',
      note: '비 오는 날에도 좋은 조용한 전시 공간이에요.',
    },
    {
      time: '14:00',
      place: '한림 소품샵 골목',
      note: '엽서와 작은 기념품을 모아요.',
    },
    {
      time: '17:30',
      place: '수월봉 노을',
      note: '제주 서쪽 끝이라 노을이 길게 남아요.',
    },
  ],
  night: [
    {
      time: '18:00',
      place: '탑동 바다 산책',
      note: '해 질 무렵 방파제를 따라 걸어요.',
    },
    {
      time: '19:30',
      place: '동문재래시장 야시장',
      note: '줄 짧은 가게부터 하나씩 맛봐요.',
    },
    {
      time: '21:30',
      place: '제주시청 근처 술집 골목',
      note: '늦게까지 여는 가게가 모여 있어요.',
    },
    {
      time: '23:00',
      place: '숙소 근처 밤바다',
      note: '구름 없는 날엔 별도 잘 보여요.',
    },
  ],
  spont: [
    {
      time: '09:00',
      place: '중문색달해변 서핑 체험',
      note: '파도 상황은 그날 아침에 확인해요.',
    },
    {
      time: '12:30',
      place: '바닷가 마을 식당',
      note: '눈에 띄는 동네 밥집에 들어가 봐요.',
    },
    {
      time: '14:30',
      place: '해안 따라 버스 여행',
      note: '마음에 드는 마을에서 내려서 걸어요.',
    },
    {
      time: '18:00',
      place: '도움방에 물어보기',
      note: '"지금 근처에 갈 만한 데 있어요?"',
    },
  ],
  plan: [
    {
      time: '07:30',
      place: '성산일출봉',
      note: '단체 관광객이 오기 전 이른 시간이 좋아요.',
    },
    {
      time: '10:00',
      place: '성산항에서 우도 배',
      note: '바람이 센 날은 운항 여부를 먼저 확인해요.',
    },
    {
      time: '15:00',
      place: '섭지코지',
      note: '우도에서 돌아오는 길에 들르기 좋아요.',
    },
    {
      time: '18:00',
      place: '예약해 둔 흑돼지집',
      note: '저녁 피크 전에 예약해 두면 편해요.',
    },
  ],
  market: [
    {
      time: '09:00',
      place: '제주시민속오일장',
      note: '날짜가 2와 7로 끝나는 날에만 열려요.',
    },
    {
      time: '12:00',
      place: '시장 안 국밥집',
      note: '장 보다가 시장 사람들처럼 점심을 해요.',
    },
    {
      time: '14:30',
      place: '감귤 따기 체험',
      note: '늦가을부터 겨울까지가 제철이에요.',
    },
    {
      time: '18:00',
      place: '서귀포매일올레시장',
      note: '마지막 기념품과 간식을 챙겨요.',
    },
  ],
};
