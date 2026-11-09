/** Widens a code map so lookups by any API error code type-check. */
function errorsByCode(map: Record<string, string>): Record<string, string> {
  return map;
}

export const verifications = {
  qualification: {
    approvedAction: '인증 현황 보기',
    approvedBodyTraveler: (city: string): string =>
      `${city} 실시간 도움방에서 질문하고 현장 답변을 받을 수 있어요.`,
    approvedBodyLocal: (city: string): string =>
      `${city} 실시간 도움방에서 현장 정보를 답변할 수 있어요.`,
    approvedTitleTraveler: (city: string): string => `${city} 여행자 인증 완료`,
    approvedTitleLocal: (city: string): string => `${city} 현지인 인증 완료`,
    pendingAction: '인증 현황에서 확인',
    pendingBody: '같은 유형은 심사가 끝난 뒤 다시 신청할 수 있어요.',
    pendingTitleTraveler: '여행자 인증 심사 중',
    pendingTitleLocal: '현지인 인증 심사 중',
    startTravelerAction: '여행자 인증 시작',
    startTravelerBody: '여행 일정과 증빙을 준비해 질문할 수 있어요.',
    startTravelerTitle: '여행 중인가요?',
    startLocalAction: '현지인 인증 시작',
    startLocalBody: '현재 위치와 거주 증빙을 준비해 답변할 수 있어요.',
    startLocalTitle: '그 도시에 살거나 공부하고 있나요?',
  },
  page: {
    title: '참여 자격',
    description: '질문하려면 여행자 인증, 답변하려면 현지인 인증이 필요해요.',
    backLabel: '내 정보',
    submittedTraveler: '여행자 인증을 보냈어요',
    submittedLocal: '현지인 인증을 보냈어요',
    submittedBody: '관리자가 확인하면 여기에 바로 반영돼요.',
    mine: '내 인증',
    emptyTitle: '아직 신청한 인증이 없어요',
    emptyDescription: '아래에서 참여 방식을 골라 신청하세요.',
    apply: '새로 신청하기',
    travelerTitle: '여행자 인증',
    travelerDescription:
      '일정과 예약 증빙으로 신청해요. 승인되면 질문할 수 있어요.',
    localTitle: '현지인 인증',
    localDescription:
      '위치와 거주·학업 증빙으로 신청해요. 승인되면 답변할 수 있어요.',
    privacyNotice: '증빙과 정확한 위치는 공개되지 않고 관리자 심사에만 쓰여요.',
  },
  picker: {
    domestic: '국내 여행지',
    temporary: '임시 운영',
    backLabel: '참여 자격',
    rechoose: '도시 다시 고르기',
    travelerTitle: '여행자 인증 신청',
    travelerDescription:
      '어느 도시를 여행하나요? 승인되면 여행 기간 동안 그 도시 도움방에서 질문할 수 있어요.',
    travelerRow: (city: string): string => `${city} 도움방에서 질문해요`,
    travelerFormTitle: (city: string): string => `${city} 여행자 인증`,
    travelerFormDescription: (city: string): string =>
      `승인되면 여행 기간 동안 ${city} 도움방에서 질문할 수 있어요.`,
    localTitle: '현지인 인증 신청',
    localDescription:
      '어느 도시에 살거나 공부하고 있나요? 승인되면 그 도시 도움방에서 답할 수 있어요.',
    localRow: (city: string): string => `${city} 도움방에서 답해요`,
    localFormTitle: (city: string): string => `${city} 현지인 인증`,
    localFormDescription: (city: string): string =>
      `승인되면 ${city} 도움방에서 여행자 질문에 답할 수 있어요.`,
  },
  status: {
    labels: {
      PENDING: '심사 중',
      APPROVED: '승인 완료',
      REJECTED: '반려됨',
      REVOKED: '자격 회수',
      EXPIRED: '기간 만료',
    },
    travelerTitle: (city: string): string => `${city} 여행자 인증`,
    localTitle: (city: string): string => `${city} 현지인 인증`,
    validDefault: '승인 후 90일 동안 유효',
    validUntil: (date: string): string => `${date}까지 유효`,
    progressLabel: '인증 진행 상태',
    steps: ['제출', '심사', '참여'],
    reasonTitle: '다시 확인할 내용',
    reapply: '새로 신청하기',
    revoked: '자격 관련 문의는 운영팀에 알려 주세요.',
  },
  form: {
    prepareLabel: '신청 전에 준비할 것',
    proofHint: 'JPEG, PNG, PDF 파일, 최대 5MB',
    proofPick: '파일 고르기',
    proofChange: '바꾸기',
    sending: '신청 보내는 중',
    proofMissing: '증빙 파일을 선택해 주세요.',
    proofType: 'JPEG, PNG, PDF 파일만 선택할 수 있어요.',
    proofTooLarge: '증빙 파일은 5MB 이하여야 해요.',
    consentMissing: '증빙 사용 목적과 개인정보 안내에 동의해 주세요.',
    submitFailed: '신청을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.',
    startDate: '시작일',
    endDate: '종료일',
  },
  errors: errorsByCode({
    UPLOAD_TOO_LARGE: '증빙 파일은 5MB 이하여야 해요.',
    UPLOAD_TYPE_NOT_ALLOWED: '파일 내용과 형식을 다시 확인해 주세요.',
    VERIFICATION_ALREADY_PENDING: '이미 같은 유형의 신청이 심사 중이에요.',
    INVALID_TRAVEL_DATES: '여행 시작일과 종료일을 다시 확인해 주세요.',
    TRAVEL_END_DATE_IN_PAST: '오늘 이후의 여행 종료일을 선택해 주세요.',
    GPS_ACCURACY_TOO_LOW:
      '위치 정확도가 낮아요. 열린 장소에서 다시 확인해 주세요.',
    OUTSIDE_DESTINATION_AREA: '현재 위치가 선택한 도시의 인증 범위 밖이에요.',
  }),
  traveler: {
    datesMissing: '여행 시작일과 종료일을 선택해 주세요.',
    datesOrder: '여행 시작일은 종료일보다 늦을 수 없어요.',
    prepareDates: '여행 일정',
    prepareDatesText: '도움방을 이용할 시작일과 종료일',
    prepareProof: '예약 증빙',
    prepareProofText: '항공권이나 숙소 예약 내역 한 장',
    datesTitle: '여행 일정',
    datesDescription: '도움방을 이용할 날짜를 골라 주세요.',
    proofTitle: '여행 증빙',
    proofDescription: '항공권이나 숙소 예약 내역을 올려 주세요.',
    proofLabel: '증빙 파일 선택',
    note: '관리자에게 남길 메모 (선택)',
    notePlaceholder: '확인에 도움이 되는 내용을 적어 주세요.',
    consentTitle: '증빙 확인 및 개인정보 이용에 동의합니다.',
    consentBody:
      '제출한 파일과 일정은 인증 심사에만 사용되며 일반 사용자에게 공개되지 않습니다.',
    submit: '여행자 인증 신청하기',
  },
  local: {
    locateStates: {
      idle: '아직 확인하지 않았어요',
      locating: '위치를 확인하고 있어요',
      done: '위치 확인 완료',
      error: '위치를 확인하지 못했어요',
    },
    permissionDenied:
      '위치 권한이 꺼져 있어요. 브라우저 설정에서 위치 접근을 허용해 주세요.',
    timeout: '위치 확인 시간이 초과됐어요. 열린 장소에서 다시 시도해 주세요.',
    unavailable:
      '현재 위치를 확인할 수 없어요. 기기의 위치 서비스를 확인해 주세요.',
    unsupported: '이 브라우저에서는 위치 확인을 사용할 수 없어요.',
    lowAccuracy: (meters: number): string =>
      `정확도가 ${meters}m예요. 200m 이내가 되도록 열린 장소에서 다시 확인해 주세요.`,
    outside: (city: string): string =>
      `현재 위치가 ${city} 인증 범위 밖이에요. ${city} 안에서 다시 확인해 주세요.`,
    inside: (city: string, meters: number): string =>
      `${city} 안에서 확인했어요. 정확도 ${meters}m`,
    locationFirst: (city: string): string =>
      `${city} 안에서 현재 위치를 먼저 확인해 주세요.`,
    noteTooShort: (city: string): string =>
      `${city}와의 관계를 30자 이상 적어 주세요.`,
    prepareLocation: '현재 위치 확인',
    prepareLocationText: (city: string): string =>
      `${city} 안에서 버튼 한 번으로 확인해요`,
    prepareProof: '연고 증빙',
    prepareProofText: '거주, 근무, 학업을 확인할 수 있는 서류 한 장',
    locationTitle: '현재 위치',
    locationDescription: (city: string, radiusKm: number): string =>
      `${city} 중심 반경 ${radiusKm}km 안에 있는지만 확인해요. 좌표는 화면에 표시하지 않아요.`,
    locationHint: '정확도 200m 이내에서 확인돼요',
    locating: '위치 확인 중…',
    locate: '현재 위치 확인',
    relocate: '위치 다시 확인',
    tiesTitle: '연고 확인',
    tiesDescription: '관리자가 확인할 수 있도록 구체적으로 알려 주세요.',
    proofType: '연고 유형',
    proofTypes: {
      RESIDENCE: '거주',
      WORK: '근무',
      STUDY: '학업',
      OTHER: '기타',
    },
    note: '관계 설명',
    notePlaceholder: (city: string): string =>
      `${city}에서 생활하거나 공부한 기간, 잘 아는 동네 등을 30자 이상 적어 주세요.`,
    proofLabel: '연고 증빙 선택',
    consentTitle: '위치·증빙 확인 및 개인정보 이용에 동의합니다.',
    consentBody:
      '정확한 위치와 파일은 인증 심사에만 사용되며 일반 사용자에게 공개되지 않습니다.',
    submit: '현지인 인증 신청하기',
  },
};
