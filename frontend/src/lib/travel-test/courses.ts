import type { TravelTypeKey } from './content';

// Sample day courses per travel type and region (#42, ADR-052). Written by the
// team with AI help, not by verified locals; the UI says so. Replace each
// with a verified local's course as they come in (#14). Keep notes free of
// exact hours, prices, or schedules that go stale.

export type CourseStop = {
  time: string;
  place: string;
  note: string;
};

type RegionCourses = Record<TravelTypeKey, readonly CourseStop[]>;

const JEJU: RegionCourses = {
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

const BUSAN: RegionCourses = {
  dawn: [
    {
      time: '05:40',
      place: '해운대해수욕장 일출',
      note: '동쪽 바다라 해가 정면으로 떠요.',
    },
    {
      time: '08:00',
      place: '돼지국밥 한 그릇',
      note: '이른 아침부터 여는 국밥집이 많아요.',
    },
    {
      time: '10:00',
      place: '이기대 해안산책로',
      note: '바다 옆 바위길이라 운동화가 좋아요.',
    },
    {
      time: '13:00',
      place: '오륙도 스카이워크',
      note: '산책로 끝에서 바다 위 유리길을 걸어요.',
    },
  ],
  food: [
    {
      time: '09:00',
      place: '부평깡통시장',
      note: '어묵과 분식으로 아침을 시작해요.',
    },
    {
      time: '12:00',
      place: '시원한 밀면',
      note: '부산에서 꼭 먹어 보는 여름 별미예요.',
    },
    {
      time: '15:00',
      place: '남포동 길거리 간식',
      note: '씨앗호떡을 들고 골목을 걸어요.',
    },
    {
      time: '19:00',
      place: '자갈치시장 회',
      note: '1층에서 고르고 2층에서 먹는 곳이 많아요.',
    },
  ],
  slow: [
    {
      time: '10:30',
      place: '흰여울문화마을',
      note: '바다를 내려다보는 절벽 마을이에요. 주민이 사는 곳이라 조용히 걸어요.',
    },
    {
      time: '13:00',
      place: '흰여울 해안터널 산책',
      note: '마을 아래 바닷길을 따라 천천히 걸어요.',
    },
    {
      time: '15:30',
      place: '보수동 책방골목',
      note: '오래된 헌책방이 모여 있어요.',
    },
    {
      time: '18:00',
      place: '다대포해수욕장 노을',
      note: '넓은 모래사장 위로 노을이 길게 퍼져요.',
    },
  ],
  mood: [
    {
      time: '06:30',
      place: '청사포 다릿돌전망대',
      note: '바다 위로 뻗은 전망대에서 아침을 봐요.',
    },
    {
      time: '11:00',
      place: 'F1963',
      note: '옛 공장을 고친 문화 공간이라 사진이 잘 나와요.',
    },
    {
      time: '14:00',
      place: '감천문화마을',
      note: '알록달록한 계단 마을이에요. 주민이 사는 곳이라 조용히 다녀요.',
    },
    {
      time: '18:00',
      place: '광안리 해변 노을',
      note: '해가 지면 광안대교에 불이 켜져요.',
    },
  ],
  night: [
    {
      time: '18:00',
      place: '광안리 해변 산책',
      note: '모래사장을 걸으며 해 지는 걸 봐요.',
    },
    {
      time: '19:30',
      place: '광안리 횟집 골목',
      note: '바다가 보이는 자리부터 차요.',
    },
    {
      time: '21:00',
      place: '광안대교 야경',
      note: '해변에 앉아서 다리 불빛을 봐요.',
    },
    {
      time: '22:30',
      place: '해운대 마린시티 야경',
      note: '높은 건물 불빛이 바다에 비쳐요.',
    },
  ],
  spont: [
    {
      time: '09:00',
      place: '송정해수욕장 서핑 체험',
      note: '초보 강습이 많은 해변이에요. 파도는 그날 확인해요.',
    },
    {
      time: '12:30',
      place: '기장시장',
      note: '제철 해산물을 보고 바로 먹어요.',
    },
    {
      time: '14:30',
      place: '해변열차 타기',
      note: '바다 옆 철길을 따라 미포까지 가요.',
    },
    {
      time: '17:30',
      place: '해리단길 골목',
      note: '옛 철길 옆 골목에서 끌리는 가게에 들어가요.',
    },
  ],
  plan: [
    {
      time: '08:30',
      place: '감천문화마을',
      note: '단체 관광객이 오기 전에 둘러봐요.',
    },
    {
      time: '11:30',
      place: '자갈치시장 점심',
      note: '남포동과 붙어 있어 동선이 좋아요.',
    },
    {
      time: '14:00',
      place: '태종대',
      note: '바다 절벽 산책로를 순환 열차로 돌 수 있어요.',
    },
    {
      time: '18:30',
      place: '광안리 오션뷰 저녁',
      note: '야경 자리는 미리 예약해 두면 편해요.',
    },
  ],
  market: [
    {
      time: '09:00',
      place: '부전시장',
      note: '부산에서 손꼽히게 큰 전통시장이에요.',
    },
    {
      time: '12:00',
      place: '국제시장',
      note: '골목마다 파는 물건이 달라 구경할 게 많아요.',
    },
    {
      time: '15:00',
      place: '부평깡통시장',
      note: '어묵과 간식을 기념품으로 챙겨요.',
    },
    {
      time: '19:00',
      place: '부평깡통야시장',
      note: '저녁에 열리는 먹거리 노점을 돌아요.',
    },
  ],
};

const GANGNEUNG: RegionCourses = {
  dawn: [
    {
      time: '05:40',
      place: '정동진 해변 일출',
      note: '해돋이 명소라 일찍 가야 자리가 있어요.',
    },
    {
      time: '08:00',
      place: '초당순두부',
      note: '바닷물로 굳힌 두부로 아침을 해요.',
    },
    {
      time: '10:00',
      place: '경포호 둘레길',
      note: '호수를 따라 평평한 길을 걸어요.',
    },
    { time: '14:00', place: '안목해변 커피거리', note: '바다 보며 쉬어 가요.' },
  ],
  food: [
    {
      time: '08:30',
      place: '초당순두부 마을',
      note: '순두부집이 모여 있는 동네예요.',
    },
    {
      time: '12:00',
      place: '강릉중앙시장',
      note: '닭강정과 장칼국수를 맛봐요.',
    },
    {
      time: '15:00',
      place: '안목해변 커피거리',
      note: '강릉 카페 투어의 시작점이에요.',
    },
    {
      time: '19:00',
      place: '주문진 수산시장',
      note: '그날 들어온 해산물을 골라 먹어요.',
    },
  ],
  slow: [
    {
      time: '10:00',
      place: '안목해변 카페',
      note: '바다가 보이는 창가에서 오전을 보내요.',
    },
    {
      time: '13:00',
      place: '경포호 산책',
      note: '호수 둘레를 따라 천천히 걸어요.',
    },
    {
      time: '15:30',
      place: '오죽헌',
      note: '검은 대나무 숲이 있는 조용한 고택이에요.',
    },
    {
      time: '18:00',
      place: '강문해변 노을',
      note: '경포보다 한적한 해변이에요.',
    },
  ],
  mood: [
    {
      time: '06:00',
      place: '경포해변 일출',
      note: '넓은 모래사장 위로 해가 떠요.',
    },
    {
      time: '11:00',
      place: '하슬라아트월드',
      note: '바다를 내려다보는 언덕 위 미술관이에요.',
    },
    {
      time: '14:00',
      place: '명주동 골목',
      note: '오래된 건물과 작은 카페가 모인 구도심이에요.',
    },
    {
      time: '17:00',
      place: '사천진해변',
      note: '조용한 해변이라 노을 사진이 잘 나와요.',
    },
  ],
  night: [
    {
      time: '18:00',
      place: '경포해변 산책',
      note: '해 질 무렵 바닷바람을 맞아요.',
    },
    {
      time: '19:30',
      place: '월화거리 산책',
      note: '옛 철길을 고친 거리를 따라 걸어요.',
    },
    {
      time: '21:00',
      place: '교동 밤거리',
      note: '늦게까지 여는 가게가 모여 있어요.',
    },
    {
      time: '23:00',
      place: '경포 밤바다',
      note: '파도 소리 들으며 하루를 마무리해요.',
    },
  ],
  spont: [
    {
      time: '09:00',
      place: '금진해변 서핑 체험',
      note: '파도는 그날 아침에 확인해요.',
    },
    {
      time: '12:30',
      place: '바닷가 물회집',
      note: '바다 보이는 동네 식당에 들어가 봐요.',
    },
    {
      time: '14:30',
      place: '정동심곡 바다부채길',
      note: '바다 절벽 옆으로 난 산책로예요. 바람이 세면 닫혀요.',
    },
    {
      time: '18:00',
      place: '명주동 저녁',
      note: '끌리는 골목 식당에서 저녁을 먹어요.',
    },
  ],
  plan: [
    {
      time: '06:00',
      place: '정동진 일출',
      note: '숙소를 가까이 잡으면 편해요.',
    },
    {
      time: '09:30',
      place: '정동심곡 바다부채길',
      note: '정동진에서 바로 이어져요.',
    },
    {
      time: '13:00',
      place: '초당순두부 점심',
      note: '점심시간 직전에 가면 덜 기다려요.',
    },
    {
      time: '16:00',
      place: '경포호와 경포대',
      note: '해 지기 전에 한 바퀴 돌아요.',
    },
  ],
  market: [
    {
      time: '10:00',
      place: '강릉중앙시장',
      note: '닭강정을 기념품으로 많이 사 가요.',
    },
    {
      time: '12:00',
      place: '성남시장',
      note: '중앙시장과 붙어 있어 같이 둘러봐요.',
    },
    {
      time: '15:00',
      place: '주문진 수산시장',
      note: '건어물과 젓갈을 챙겨요.',
    },
    {
      time: '18:00',
      place: '안목 원두 가게',
      note: '강릉 커피 원두를 선물로 사요.',
    },
  ],
};

const SEOUL: RegionCourses = {
  dawn: [
    {
      time: '06:00',
      place: '인왕산 일출 산책',
      note: '성곽길 따라 오르면 도심 위로 해가 떠요.',
    },
    {
      time: '08:30',
      place: '서촌 아침 국밥',
      note: '산에서 내려와 따뜻하게 먹어요.',
    },
    { time: '10:00', place: '경복궁', note: '관람객이 몰리기 전에 둘러봐요.' },
    {
      time: '14:00',
      place: '청계천 산책',
      note: '도심 한가운데 물길을 따라 걸어요.',
    },
  ],
  food: [
    {
      time: '09:00',
      place: '광장시장',
      note: '빈대떡과 마약김밥으로 아침을 해요.',
    },
    {
      time: '12:30',
      place: '을지로 노포 골목',
      note: '오래된 식당이 모여 있어요.',
    },
    {
      time: '15:00',
      place: '망원시장',
      note: '고로케와 간식을 하나씩 맛봐요.',
    },
    {
      time: '19:00',
      place: '연남동 저녁',
      note: '골목마다 작은 식당이 많아요.',
    },
  ],
  slow: [
    {
      time: '10:30',
      place: '서촌 골목 카페',
      note: '한옥 사이 작은 카페에서 오전을 보내요.',
    },
    {
      time: '13:00',
      place: '북촌 한옥마을',
      note: '주민이 사는 곳이라 조용히 걸어요.',
    },
    {
      time: '15:30',
      place: '동네 책방',
      note: '서촌과 북촌에 작은 책방이 많아요.',
    },
    {
      time: '18:00',
      place: '낙산공원 노을',
      note: '성곽 위에서 도심 노을을 봐요.',
    },
  ],
  mood: [
    {
      time: '07:00',
      place: '남산 산책로',
      note: '아침 공기가 맑을 때 걸어요.',
    },
    {
      time: '11:00',
      place: '국립현대미술관 서울관',
      note: '경복궁 옆이라 동선이 좋아요.',
    },
    {
      time: '14:00',
      place: '성수동 소품샵',
      note: '작은 브랜드 가게가 모여 있어요.',
    },
    {
      time: '17:30',
      place: '노들섬 노을',
      note: '한강 한가운데서 노을을 봐요.',
    },
  ],
  night: [
    {
      time: '18:00',
      place: '남산서울타워 야경',
      note: '해 질 때 올라가면 낮과 밤을 다 봐요.',
    },
    {
      time: '20:00',
      place: '을지로 노가리 골목',
      note: '저녁마다 골목에 테이블이 깔려요.',
    },
    {
      time: '22:00',
      place: '익선동 한옥 골목',
      note: '밤에 불 켜진 한옥 가게가 예뻐요.',
    },
    {
      time: '23:30',
      place: '한강 밤 산책',
      note: '강바람 맞으며 하루를 마무리해요.',
    },
  ],
  spont: [
    {
      time: '09:00',
      place: '따릉이 타고 한강',
      note: '공공자전거를 빌려 강을 따라 달려요.',
    },
    {
      time: '12:30',
      place: '동네 시장 점심',
      note: '지나가다 보이는 시장에 들어가 봐요.',
    },
    {
      time: '15:00',
      place: '처음 가 보는 동네',
      note: '지하철 아무 역에서 내려 걸어요.',
    },
    {
      time: '18:00',
      place: '망원한강공원 노을',
      note: '편의점 라면과 함께 노을을 봐요.',
    },
  ],
  plan: [
    { time: '09:00', place: '경복궁', note: '관람객이 몰리기 전에 둘러봐요.' },
    {
      time: '11:30',
      place: '북촌 한옥마을',
      note: '경복궁에서 걸어서 이어져요.',
    },
    {
      time: '14:00',
      place: '인사동',
      note: '기념품 가게와 전통 찻집이 모여 있어요.',
    },
    {
      time: '18:00',
      place: '예약해 둔 저녁',
      note: '주말 저녁은 미리 예약해 두면 편해요.',
    },
  ],
  market: [
    {
      time: '09:00',
      place: '남대문시장',
      note: '이른 아침부터 문을 여는 가게가 많아요.',
    },
    { time: '12:00', place: '광장시장', note: '먹거리 골목에서 점심을 해요.' },
    {
      time: '15:00',
      place: '동대문 상가',
      note: '원단과 액세서리 가게를 구경해요.',
    },
    { time: '18:00', place: '망원시장', note: '저녁 간식과 반찬을 챙겨요.' },
  ],
};

export type CourseRegion = {
  key: string;
  name: string;
  courses: RegionCourses;
};

/** Regions shown on the result page; the first one is the default. */
export const COURSE_REGIONS: readonly CourseRegion[] = [
  { key: 'jeju', name: '제주', courses: JEJU },
  { key: 'busan', name: '부산', courses: BUSAN },
  { key: 'gangneung', name: '강릉', courses: GANGNEUNG },
  { key: 'seoul', name: '서울', courses: SEOUL },
];
