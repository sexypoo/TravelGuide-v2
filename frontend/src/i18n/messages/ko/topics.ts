import type { ParticipantBadge } from '@/lib/api/participants';
import type {
  AnswerSourceType,
  CrowdLevel,
  EntryStatus,
  QuestionCategory,
  QuestionStatus,
  QuestionUrgency,
} from '@/lib/api/questions';

/** Widens a code map so lookups by any API error code type-check. */
function errorsByCode(
  map: Record<string, string>,
): Partial<Record<string, string>> {
  return map;
}

const category: Record<QuestionCategory, string> = {
  WEATHER: '날씨',
  TRANSPORT: '교통·이동',
  FOOD: '맛집·카페',
  PLACE: '장소 추천',
  WAITING: '대기 현황',
  CROWD: '혼잡도',
  OPEN_HOURS: '운영 여부',
  EVENT: '행사·이벤트',
  SAFETY: '안전',
  OTHER: '기타',
};

const crowd: Record<CrowdLevel, string> = {
  QUIET: '여유',
  MODERATE: '보통',
  BUSY: '많음',
  VERY_BUSY: '매우 많음',
};

const entry: Record<EntryStatus, string> = {
  OPEN: '입장 가능',
  LIMITED: '제한 입장',
  PAUSED: '입장 일시 중단',
  CLOSED: '입장 마감',
  UNKNOWN: '확인 필요',
};

const urgency: Record<QuestionUrgency, string> = {
  NORMAL: '오늘 중',
  URGENT: '1시간 내',
};

const status: Record<QuestionStatus, string> = {
  OPEN: '진행 중',
  RESOLVED: '해결됨',
  REMOVED: '숨김',
  EXPIRED: '마감됨',
};

const source: Record<AnswerSourceType, string> = {
  ON_SITE_NOW: '지금 직접 확인',
  RECENT_EXPERIENCE: '최근 경험',
  OFFICIAL_SOURCE: '공식 정보',
  PERSONAL_OPINION: '개인 의견',
};

const badge: Record<ParticipantBadge, string> = {
  VERIFIED_TRAVELER: '인증 여행자',
  VERIFIED_LOCAL: '인증 현지인',
  VERIFIED_BOTH: '여행자 · 현지인 인증',
};

/** Answer form entry select; PAUSED is shorter than the shared label. */
const entryOptions: Record<EntryStatus, string> = {
  OPEN: '입장 가능',
  LIMITED: '제한 입장',
  PAUSED: '일시 중단',
  CLOSED: '입장 마감',
  UNKNOWN: '확인 필요',
};

/** Text after the agreeing count; English names the total here. */
const agreementAfter: (total: number) => string = () => '의 의견이 비슷해요';

export const topics = {
  labels: { category, crowd, entry, urgency, status, source, badge },
  shared: {
    photo: '현장 사진',
    photoAlt: (area: string | null): string =>
      `${area ?? '현장'} 토픽 첨부 사진`,
    loadErrorTitle: '토픽을 불러오지 못했어요',
    reload: '다시 불러오기',
    checkedAt: (time: string): string => `${time} 확인`,
    reportUser: (nickname: string): string => `${nickname} 사용자`,
    pickPhoto: '사진 선택',
    photoTooLarge: '사진은 10MB 이하로 선택해 주세요.',
  },
  card: {
    answers: '답변',
  },
  feed: {
    filtersLabel: '토픽 종류 필터',
    all: '전체',
    loadingLabel: '토픽을 불러오는 중',
    loadErrorDescription: '연결을 확인한 뒤 다시 시도해 주세요.',
    refetchFailed:
      '토픽 목록을 새로 불러오지 못했어요. 보이는 내용이 최신이 아닐 수 있어요.',
    emptyOpenTitle: '아직 진행 중인 토픽이 없어요',
    emptyResolvedTitle: '아직 해결된 토픽이 없어요',
    emptyOpenDescription: '대화에서 중요한 상황을 토픽으로 이어가 보세요.',
    emptyResolvedDescription: '답변을 통해 해결된 토픽이 이곳에 모여요.',
    moreFailed: '토픽을 더 불러오지 못했어요.',
    more: '토픽 더 보기',
  },
  composer: {
    errors: errorsByCode({
      OPEN_QUESTION_LIMIT_REACHED:
        '진행 중인 토픽은 한 방에서 최대 3개까지 만들 수 있어요.',
      ROOM_PARTICIPANT_VERIFICATION_REQUIRED:
        '유효한 여행자 또는 현지인 인증을 다시 확인해 주세요.',
      MESSAGE_ALREADY_PROMOTED: '이미 토픽으로 만든 메시지입니다.',
    }),
    failed: '토픽을 만들지 못했습니다. 연결을 확인하고 다시 시도해 주세요.',
    tooShort: '상황을 이해할 수 있도록 내용을 20자 이상 적어 주세요.',
    titleNew: '새 토픽 만들기',
    titleFromMessage: '이 메시지를 토픽으로 잇기',
    description:
      '답변과 해결 과정을 남길 가치가 있는 상황을 구체적으로 정리해 주세요.',
    categoryLegend: '토픽 종류',
    urgencyLegend: '답변이 필요한 시간',
    area: '지역·장소',
    optional: '선택',
    areaPlaceholder: '예: 제주공항 1층, 서귀포 중문',
    content: '토픽 내용',
    contentPlaceholder:
      '현재 상황, 이미 확인한 내용, 결정해야 하는 시간을 함께 적어 주세요.',
    photoHint: '상황을 확인할 사진 한 장 · 최대 10MB',
    removePhoto: '제거',
    sourceMessage: '원본 메시지',
    safetyHelp:
      '안전 카테고리의 즉시 위험 상황은 답변보다 112·119에 먼저 연락하세요.',
    submitting: '토픽 만드는 중',
    submit: '토픽 만들기',
  },
  detail: {
    title: '토픽',
    backLabel: (destination: string): string => `${destination} 도움방`,
    loadingLabel: '토픽 상세를 불러오는 중',
    loadErrorDescription: '토픽이 삭제되었거나 연결이 잠시 불안정할 수 있어요.',
    offline:
      '인터넷 연결을 확인해 주세요. 연결되면 이 토픽을 자동으로 다시 불러와요.',
    reconnecting:
      '실시간 연결을 복구 중이에요. 연결되면 이 토픽을 자동으로 다시 불러와요.',
    refetchFailed:
      '토픽을 새로 불러오지 못했어요. 보이는 내용이 최신이 아닐 수 있어요.',
    safetyTitle: '긴급 상황 안내',
    closesBefore: '',
    closesAfter: ' 마감',
    reportQuestion: '이 토픽',
    resolvedAccepted: '작성자가 도움이 된 답변을 채택했어요',
    resolvedWithoutAnswer: '작성자가 해결된 상황으로 확인했어요',
    resolvedDefault: '이 토픽은 해결됨으로 마무리되었어요.',
    resolvedAt: (time: string): string => `${time}에 해결되었어요.`,
    answersTitle: (count: number): string => `참여자 답변 ${count}`,
    answersOrder: '먼저 도착한 순서',
    emptyTitle: '아직 도착한 답변이 없어요',
    emptyDescription:
      '실시간 연결을 유지하고 있어요. 참여자의 첫 답변이 오면 바로 보여드릴게요.',
  },
  live: {
    headlineWait: (min: number, max: number): string => `대기 ${min}~${max}분`,
    headlineUpdate: '현장 상태 업데이트',
    stale: '지난 현장 정보',
    live: '실시간 현장 정보',
    agreementBefore: (total: number): string => `현장 확인 ${total}명 중 `,
    agreementCount: (count: number): string => `${count}명`,
    agreementAfter,
    staleStrong: '30분 이상 새 확인이 없어요.',
    staleRest: ' 아래 답변에서 지금 상태를 새로 알려주세요.',
    currentWait: '현재 대기',
    checking: '확인 중',
    crowd: '현장 혼잡',
    entry: '입장 상태',
    recheck: '다시 확인',
  },
  share: {
    shareLabel: '채팅에 공유하기',
    reshareLabel: '채팅에 다시 공유하기',
    sharingLabel: '채팅에 공유 중',
    share: '공유',
    reshare: '다시 공유',
    sharing: '공유 중',
    failed: '토픽을 보내지 못했어요.',
  },
  resolution: {
    failed: '해결 상태를 저장하지 못했습니다. 연결을 확인해 주세요.',
    panelLabel: '토픽 해결 결정',
    title: '도움이 됐다면 해결을 남겨주세요',
    description: '채택은 한 번만 가능하며 이후에는 새 답변을 받을 수 없어요.',
    acceptBefore: '',
    acceptAfter: '이 답변 채택',
    resolveWithout: '답변 없이 해결됨으로 표시',
    selectedFallback: '선택한 현지인',
    confirmAccept: (nickname: string): string =>
      `${nickname}님의 답변을 채택할까요?`,
    confirmResolve: '답변 채택 없이 이 토픽을 해결할까요?',
    irreversible: '완료 후에는 채택을 바꾸거나 토픽을 다시 열 수 없어요.',
    saving: '저장 중…',
    acceptAndResolve: '채택하고 해결',
    resolve: '해결 확정',
  },
  answerCard: {
    accepted: '채택된 답변',
    removed: '숨김 처리된 답변',
    profileLabel: (nickname: string): string => `${nickname} 공개 프로필 보기`,
    verifiedOn: (date: string): string => `${date} 인증`,
    photoCaption: '현장 확인 사진',
    observationLabel: '현장 관찰 정보',
    wait: '대기',
    waitValue: (minutes: number): string => `${minutes}분`,
    crowd: '혼잡',
    entry: '입장',
    openSource: '공식 출처 열기',
    reportAnswer: '이 답변',
  },
  answerForm: {
    errors: errorsByCode({
      ANSWER_LIMIT_REACHED: '이 질문에는 답변을 최대 3개까지 남길 수 있어요.',
      QUESTION_EXPIRED: '답변하는 동안 질문이 마감되었습니다.',
      QUESTION_NOT_OPEN: '이미 해결되었거나 닫힌 질문입니다.',
      SOURCE_URL_REQUIRED: '공식 정보의 HTTPS 주소를 입력해 주세요.',
      INVALID_SOURCE_URL: '출처 주소는 https://로 시작해야 합니다.',
      UPLOAD_TOO_LARGE: '사진은 10MB 이하로 선택해 주세요.',
    }),
    failed: '답변을 보내지 못했습니다. 연결을 확인하고 다시 시도해 주세요.',
    tooShort: '현지 상황을 이해할 수 있도록 10자 이상 적어 주세요.',
    sourceUrlMissing: '공식 정보의 HTTPS 주소를 함께 입력해 주세요.',
    waitInvalid:
      '예상 대기 시간은 0분부터 1440분(24시간)까지 정수로 적어 주세요.',
    observationMissing: '대기 시간, 혼잡도, 입장 상태 중 하나 이상 알려주세요.',
    title: '이 질문에 근거 있는 답을 남겨주세요',
    description:
      '직접 확인한 범위와 정보의 시점을 분명하게 적으면 여행자가 판단하기 쉬워져요.',
    sourceLegend: '답변 근거',
    sourceUrl: '공식 HTTPS 주소',
    observationLegend: '지금 직접 본 현장 상태',
    waitLabel: '예상 대기 시간',
    minutes: '분',
    crowdLabel: '혼잡도',
    entryLabel: '입장 상태',
    select: '선택',
    entryOptions,
    observationNote: '답변을 보내는 시각이 현장 확인 시각으로 함께 기록돼요.',
    content: '답변 내용',
    contentPlaceholder:
      '지금 확인한 상황과 여행자가 취할 수 있는 선택을 적어 주세요.',
    photoHint: '선택 · 최대 10MB',
    reselect: '다시 선택',
    submitting: '답변 보내는 중',
    submit: '답변 보내기',
  },
  hidden: {
    topic: '운영 정책에 따라 숨김 처리된 질문입니다.',
    answer: '운영 정책에 따라 숨김 처리된 답변입니다.',
  },
};
