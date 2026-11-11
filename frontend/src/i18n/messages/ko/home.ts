type Participant = 'TRAVELER' | 'LOCAL';

export const home = {
  title: '홈',
  greeting: (nickname: string): string => `${nickname}님, 반가워요`,
  /** Two lines of the greeting heading; the screen breaks between them on mobile. */
  heading: (place: string | undefined): readonly [string, string] => [
    place === undefined ? '여행지에서' : `오늘 ${place}에서`,
    '무엇이 궁금하세요?',
  ],
  status: {
    approved: (city: string, participant: Participant): string =>
      `${city} ${participant === 'TRAVELER' ? '여행자' : '현지인'} 인증 완료`,
    pending: (participant: Participant): string =>
      `${participant === 'TRAVELER' ? '여행자' : '현지인'} 인증 심사 중`,
    none: '아직 인증 전이에요',
  },
  noRooms: {
    title: '열려 있는 도움방이 없어요',
    description:
      '지역이 준비되면 이곳에 표시돼요. 그동안 커뮤니티에서 물어보세요.',
  },
  pickRoom: {
    title: (count: number): string => `도시 ${count}곳의 도움방이 열려 있어요`,
    description: '여행할 도시나 사는 도시를 골라 인증하면 이곳에 바로 보여요.',
    action: '도움방 고르기',
  },
  ways: {
    label: '다른 방법으로 참여하기',
    communityTitle: '여행자 커뮤니티',
    communityDescription: '인증 없이도 묻고 나눌 수 있어요',
    roomsTitle: '도시별 도움방',
    roomsDescription: (count: number): string =>
      `${count}개 도시에서 지금 상황을 물어볼 수 있어요`,
  },
  posts: {
    title: '커뮤니티 새 글',
    viewAll: '전체 보기',
    failed: '새 글을 불러오지 못했어요.',
    emptyTitle: '아직 글이 없어요',
    emptyDescription: '여행 중 궁금한 걸 처음으로 물어보세요.',
    comments: (count: number): string => `댓글 ${count}`,
  },
  error: {
    title: '화면을 불러오지 못했어요',
    description: '연결 상태를 확인한 뒤 다시 시도해 주세요.',
    retry: '다시 불러오기',
  },
  loading: '화면을 불러오는 중이에요',
};
