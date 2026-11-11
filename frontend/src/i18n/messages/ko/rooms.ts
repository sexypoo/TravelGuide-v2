export const rooms = {
  roomName: (city: string): string => `${city} 도움방`,
  /** Shown instead of the API's Korean `labelKo`, keyed by access status. */
  access: {
    AVAILABLE: '입장 가능',
    TRAVELER_PENDING: '여행자 심사 중',
    LOCAL_PENDING: '현지인 심사 중',
    VERIFICATION_REQUIRED: '인증 필요',
  },
  list: {
    title: '도움방',
    description:
      '여행지마다 그곳에 사는 사람에게 지금 상황을 물어볼 수 있어요.',
    emptyTitle: '열려 있는 도움방이 없어요',
    emptyDescription: '지역이 준비되면 이곳에 표시돼요.',
    domestic: '국내 여행지',
    temporary: '임시 운영',
    temporaryNote:
      '해외 교환학생이 직접 운영해 보는 방이에요. 언제든 닫힐 수 있어요.',
  },
  locked: {
    description: '인증된 여행자와 현지인만 대화할 수 있어요.',
    backLabel: '도움방 목록',
    pendingTitle: '심사가 끝나면 대화방이 열려요',
    lockedTitle: (city: string): string => `인증하면 ${city} 도움방이 열려요`,
    pendingBody: '심사 결과는 참여 자격 화면에서 확인할 수 있어요.',
    lockedBody:
      '여행자는 여행 일정과 예약 증빙으로, 현지인은 위치와 거주 증빙으로 인증해요.',
    viewReview: '심사 현황 보기',
    verifyTraveler: '여행자로 인증하기',
    verifyLocal: '현지인으로 인증하기',
    areaLabel: '도움 지역',
    areaTitle: (city: string): string => `${city} 전역`,
    areaDescription: (radiusKm: number): string =>
      `중심에서 반경 ${radiusKm}km 안의 지금을 나눠요`,
    privacyTitle: '증빙은 공개되지 않아요',
    privacyDescription:
      '관리자 심사에만 쓰이고, 정확한 위치도 다른 사람에게 보이지 않아요',
    communityNotice:
      '인증 없이도 커뮤니티에서 여행 정보를 묻고 나눌 수 있어요.',
  },
  card: {
    noTopics: '아직 진행 중인 토픽이 없어요',
    openTopics: (count: number, more: boolean): string =>
      `진행 중인 토픽 ${more ? `${count}개 이상` : `${count}개`}`,
    live: '지금 열려 있어요',
    pendingSub: '심사가 끝나면 인증된 여행자, 현지인과 바로 대화할 수 있어요.',
    lockedSub: '인증한 여행자와 현지인만 들어와 지금 상황을 묻고 답해요.',
    viewReview: '심사 현황 보기',
    verifyAndJoin: '인증하고 참여하기',
    viewIntro: '방 소개 보기',
    liveSub: '인증된 여행자와 현지인이 지금 상황을 나눠요.',
    feedLabel: '진행 중인 토픽',
    postedAt: (relative: string): string => `${relative}에 올라왔어요`,
    answersLabel: (count: number): string => `답변 ${count}개`,
    answersShort: (count: number): string => `답 ${count}`,
    enter: '방 들어가기',
  },
  experience: {
    connection: {
      connecting: '연결 확인 중',
      connected: '실시간 연결됨',
      reconnecting: '다시 연결 중',
      offline: '실시간 연결 끊김',
    },
    connectedNote: '인증된 여행자와 현지인만 대화해요',
    role: {
      BOTH: '여행자 · 현지인 인증',
      LOCAL: '인증 현지인',
      TRAVELER: '인증 여행자',
      none: '관리자 · 읽기 전용',
    },
    home: '홈으로',
    viewTabs: '방 보기',
    chatTab: '대화',
    topicsTab: '실시간 토픽',
    conversationLabel: (city: string): string => `${city} 대화`,
    liveChatHeading: '실시간 대화',
    offlineNotice:
      '인터넷 연결을 확인해 주세요. 연결되면 놓친 대화를 자동으로 다시 불러와요.',
    reconnectingNotice:
      '실시간 연결을 복구하고 있어요. 연결되면 놓친 대화를 자동으로 다시 불러와요.',
    openTopics: '진행 중인 토픽',
    newTopic: '새 토픽',
    closeComposer: '토픽 작성 닫기',
    topicStatus: '토픽 상태',
    open: '진행 중',
    resolved: '해결됨',
  },
  notifications: {
    loading: {
      label: '알림 확인 중',
      detail: '브라우저 상태를 확인하고 있어요.',
    },
    unsupported: {
      label: '알림 미지원',
      detail: '이 브라우저에서는 시스템 알림을 사용할 수 없어요.',
    },
    blocked: {
      label: '브라우저에서 차단됨',
      detail: '브라우저 사이트 설정에서 알림 권한을 허용해 주세요.',
    },
    prompt: {
      label: '알림 켜기',
      detail: '다른 탭을 보는 동안 새 메시지와 답변을 알려드려요.',
    },
    disabled: {
      label: '알림 꺼짐',
      detail: '이 브라우저에서 다시 알림을 받을 수 있어요.',
    },
    enabled: {
      label: '알림 사용 중',
      detail: '웹앱을 열어 둔 동안 백그라운드 소식을 알려드려요.',
    },
  },
};
