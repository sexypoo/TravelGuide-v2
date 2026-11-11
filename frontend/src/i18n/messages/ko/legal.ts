export const legal = {
  shell: {
    navLabel: '정책 문서',
    privacy: '개인정보 처리방침',
    accountDeletion: '계정 삭제',
    login: '로그인',
    /** Shown only on translated copies of the legal notices. */
    translationNotice: '',
  },
  privacy: {
    metaTitle: '개인정보 처리방침',
    metaDescription: '여쭈어 서비스의 개인정보 수집, 이용, 보관 및 삭제 안내',
    eyebrow: '시행일 2026년 8월 20일',
    title: '개인정보 처리방침',
    description:
      '여쭈어는 여행 도움방 운영에 필요한 정보만 처리하고, 위치·인증 증빙을 공개 프로필과 분리합니다.',
    infoTitle: '1. 처리하는 정보',
    info: [
      {
        term: '계정·프로필',
        detail:
          '이메일, 암호화된 비밀번호, 닉네임, 소개, 여행 스타일, 프로필 사진, 소셜 로그인 제공자 식별자',
      },
      {
        term: '인증·위치',
        detail:
          '여행 일정 또는 현지인 증빙 파일, 도시 범위 확인용 GPS 좌표·정확도·촬영 시각, 심사 상태와 사유',
      },
      {
        term: '서비스 활동',
        detail:
          '질문, 답변, 채팅, 커뮤니티 게시물·댓글, 신고, 찜한 장소, 여행 기록과 첨부 이미지',
      },
      {
        term: '신청 정보',
        detail: '사전예약 이름, 이메일, 동의 시각',
      },
    ],
    purposeTitle: '2. 이용 목적과 공개 범위',
    purposeBody:
      '계정 인증, 프로필 표시, 도시별 도움방 권한 판정, 실시간 질문·답변과 커뮤니티 운영, 신고 처리, 저장 기능 및 보안에 사용합니다. 닉네임과 사용자가 게시한 콘텐츠는 다른 이용자에게 보일 수 있습니다. 이메일, 비밀번호, 정확한 GPS 좌표와 원본 인증 증빙은 공개 응답으로 제공하지 않으며 권한 있는 심사 흐름에서만 접근합니다.',
    retentionTitle: '3. 보관과 삭제',
    retentionBody:
      '계정 정보와 서비스 활동은 계정 유지 기간 동안 보관합니다. 비밀번호 재설정 링크는 30분 동안만 유효합니다. 계정 삭제가 완료되면 계정과 연결된 공개 콘텐츠, 인증·여행 기록, 신고, 동일 이메일의 사전예약 정보 및 비공개 파일을 삭제합니다. 현재 서비스에는 계정 삭제 후 별도 법정 보존 대상으로 설정된 항목이 없습니다.',
    retentionLink: '계정 삭제 범위와 방법 자세히 보기',
    vendorsTitle: '4. 외부 서비스와 처리 인프라',
    vendorsBody:
      '서비스 제공을 위해 배포·데이터베이스·비공개 파일 저장 인프라를 사용합니다. 설정된 기능에 한해 Google·Kakao·Apple 로그인, Google Places/Maps, Resend 이메일 전송과 통신할 수 있습니다. 소셜 로그인 제공자가 전달한 정보는 계정 연결에 필요한 범위에서만 저장하며, Apple refresh token은 암호화해 보관하고 계정 삭제 때 폐기합니다.',
    choicesTitle: '5. 이용자의 선택과 문의',
    choicesBody:
      '프로필에서 공개 정보를 수정하고 계정을 직접 삭제할 수 있습니다. 앱을 설치할 수 없는 경우에도 웹 삭제 페이지를 이용할 수 있습니다. 그 밖의 개인정보 문의는 앱스토어에 표시된 개발자 연락처를 이용해 주세요. 방침이 바뀌면 이 페이지의 시행일을 갱신해 알립니다.',
  },
  accountDeletion: {
    metaTitle: '계정 삭제 안내',
    metaDescription: '여쭈어 계정과 연결된 개인정보를 영구 삭제하는 방법',
    eyebrow: '계정 관리',
    title: '여쭈어 계정 삭제',
    description:
      '앱이 없어도 웹에서 로그인해 본인 계정을 직접 삭제할 수 있습니다.',
    deletedTitle: '계정 삭제가 완료되었습니다.',
    deletedDescription: '계정과 연결된 데이터의 삭제 요청을 처리했습니다.',
    deletedWarning: '삭제된 계정은 복구할 수 없습니다.',
    deletedBody: '다시 이용하려면 새로운 계정을 만들어 주세요.',
    home: '홈으로 돌아가기',
    howTitle: '삭제 방법',
    steps: [
      {
        title: '웹 또는 앱에서 로그인',
        body: '삭제할 계정의 소유자임을 먼저 확인합니다.',
      },
      {
        title: '프로필 → 계정 관리',
        body: '계정 삭제 살펴보기를 선택합니다.',
      },
      {
        title: '본인 확인 후 영구 삭제',
        body: '비밀번호 계정은 현재 비밀번호를 입력하고, 모든 계정은 확인 문구를 입력합니다.',
      },
    ],
    loginCta: '로그인하고 계정 삭제하기',
    scopeTitle: '함께 삭제되는 항목',
    scopeLabel: '계정 삭제 범위',
    scopeItems: ['계정', '공개 콘텐츠', '비공개 증빙·업로드'],
    scopeBody:
      '프로필, 로그인 연결, 여행·인증 기록, 질문·답변·채팅·커뮤니티 게시물, 찜한 장소, 동일 이메일의 사전예약 정보와 관련 비공개 파일을 삭제합니다. 다른 콘텐츠에서 계정 삭제로 함께 사라지는 답변·댓글의 신고 기록도 정리합니다.',
    timingTitle: '처리 시점과 주의사항',
    timingBody:
      '확인을 마치면 운영 데이터베이스에서 즉시 삭제를 시작하며, 완료된 계정은 복구할 수 없습니다. Sign in with Apple 계정은 Apple 연결 해제를 먼저 처리합니다. 소유권 확인을 위해 로그인은 필요하지만 모바일 앱 설치는 필요하지 않습니다.',
  },
  preorder: {
    metaTitle: '여쭈어 사전예약',
    metaDescription:
      '여행이 틀어지는 순간, 인증된 여행자와 현지인에게 지금 필요한 판단을 물어보세요.',
    navLabel: '사전예약 페이지 메뉴',
    navAbout: '서비스 소개',
    navHow: '이용 방법',
    navPreorder: '사전예약',
    login: '로그인',
    heroKicker: '첫 파일럿 지역 · 제주',
    heroTitleLine1: '여행이 막막한 순간,',
    heroTitleLine2: '여쭈어에 물어보세요.',
    heroText:
      '여행 중인 사람의 방금 경험과 인증 현지인의 생활 추천을 한곳에서 비교하고, 달라진 여행에 필요한 판단을 빠르게 얻으세요.',
    heroPrimary: '사전예약하기',
    heroSecondary: '서비스 둘러보기',
    problemTitle: '여행은 계획대로만 흘러가지 않으니까.',
    problemLede:
      '오래된 검색 결과보다 지금 그곳을 아는 사람의 판단이 필요한 순간이 있습니다.',
    problems: [
      {
        title: '갑작스러운 변수',
        description: '날씨, 휴무, 교통처럼 검색만으로 대응하기 어려운 순간',
      },
      {
        title: '정보의 시차',
        description: '지금 줄이 긴지, 실제로 운영 중인지 알 수 없는 정보',
      },
      {
        title: '광고 같은 추천',
        description: '누가 왜 추천하는지 알 수 없는 홍보성 목록과 후기',
      },
    ],
    howTitle: '여행이 달라진 그 순간부터, 답을 얻을 때까지.',
    howLede: '인증부터 현장 답변까지 하나의 흐름으로 이어집니다.',
    moments: [
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
    ],
    trustTitle: '광고보다 경험을, 추천보다 근거를 함께 봐요.',
    trustLede:
      '인증된 여행자와 현지인에게 내 상황을 직접 묻고, 누가 어떤 경험으로 답했는지 확인합니다. 광고·홍보성 답변은 신고해 운영 검토를 요청할 수 있어요.',
    trustPoints: [
      '인증된 참여자 배지',
      '방금 경험·생활 추천 등 답변 근거',
      '채택과 해결 상태',
      '광고·홍보성 답변 신고 및 관리',
    ],
    signupTitle: '여행의 변수를 사람들의 답으로 바꾸는 첫 출발.',
    signupBody:
      '첫 파일럿은 제주에서 시작하지만, 여쭈어가 향하는 곳은 모든 여행지입니다. 오픈 소식과 참여 방법을 가장 먼저 받아보세요.',
    formLabel: '사전예약 신청',
    footerTagline: '여행의 변수에, 사람들의 답.',
    footerNavLabel: '정책 안내',
    footerPrivacy: '개인정보 처리방침',
    copyright: '© 2026 여쭈어',
    form: {
      saveFailed: '신청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      successKicker: '신청 완료',
      successTitle: '첫 출발 명단에 등록했어요.',
      successBody: '첫 파일럿 소식이 준비되면 입력한 이메일로 알려드릴게요.',
      successLink: '여쭈어 더 알아보기',
      kicker: '사전예약',
      title: '첫 오픈 소식 받기',
      body: '필요한 안내만 이메일로 보내드려요.',
      name: '이름',
      namePlaceholder: '이름을 입력해 주세요',
      email: '이메일',
      consentRequired: '필수',
      consentText:
        '사전예약 접수와 출시 안내를 위한 이름·이메일 수집에 동의합니다.',
      saving: '저장 중',
      submit: '사전예약 신청하기',
      savingStatus: '사전예약 신청을 저장하고 있습니다.',
    },
    validation: {
      nameMissing: '이름을 입력해 주세요.',
      nameTooLong: '이름은 30자 이내로 입력해 주세요.',
      email: '올바른 이메일 주소를 입력해 주세요.',
      privacyConsent: '개인정보 수집 동의가 필요합니다.',
    },
  },
};
