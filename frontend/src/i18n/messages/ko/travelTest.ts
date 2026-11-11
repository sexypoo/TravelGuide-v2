// Travel type test screens (#42, #80). Type, question, and course text lives
// in `lib/travel-test` so only the test pages carry it.
export const travelTest = {
  meta: {
    title: '나는 어떤 여행자일까? 여행자 유형 테스트',
    description:
      '질문 10개로 알아보는 내 여행 유형. 새벽 오름러부터 시장 털이범까지, 로그인 없이 1분이면 끝나요.',
    ogTitle: '나는 어떤 여행자일까?',
    ogDescription: '질문 10개로 알아보는 내 여행 유형. 로그인 없이 1분.',
    resultTitle: (name: string): string => `나는 ${name} · 여행자 유형 테스트`,
    resultDescription: (tagline: string): string =>
      `${tagline}. 너는 어떤 여행자야? 1분 테스트로 알아봐요.`,
    resultOgTitle: (name: string): string => `나는 ${name}`,
    resultOgDescription: (tagline: string): string =>
      `${tagline}. 너는 어떤 여행자야?`,
  },
  intro: {
    kicker: '여쭈어 여행자 유형 테스트',
    titleLine1: '나는 어떤',
    titleLine2: '여행자일까?',
    lede: '질문 10개로 내 여행 유형을 알아보고, 친구와 결과를 나눠 보세요.',
    meta: '1분 · 로그인 없이 · 유형 8가지',
    start: '시작하기',
  },
  quiz: {
    calculating: '결과를 계산하고 있어요.',
    backToIntro: '처음 화면으로',
    previous: '이전 질문',
    progress: '진행도',
  },
  result: {
    you: '나는',
    traitsLabel: '이 유형의 특징',
    matchTitle: '나랑 잘 맞는 여행자',
    ctaTitle: '여행 중 막히면, 지금 그곳을 아는 사람에게',
    ctaText:
      '도시마다 인증된 현지인과 여행자가 모인 도움방에서 지금 상황을 물어볼 수 있어요.',
    ctaAgain: '나도 테스트 해보기',
    othersTitle: '유형 8가지 구경하기',
  },
  course: {
    title: (type: string, region: string): string =>
      `${type}에게 추천하는 ${region}의 하루`,
    regionsLabel: '지역 고르기',
    notice: '여쭈어가 고른 예시 코스예요. 아직 현지인이 확인하지 않았어요.',
    askRoom: (region: string): string =>
      `${region} 도움방에서 현지인에게 물어보기`,
  },
  share: {
    title: '여쭈어 여행자 유형 테스트',
    text: (name: string): string => `나는 ${name}! 너는 어떤 여행자야?`,
    copied: '링크를 복사했어요. 친구에게 붙여 넣어 보세요.',
    shareFailed: '공유하지 못했어요. 주소창의 링크를 복사해 주세요.',
    saved: '이미지를 저장했어요. 스토리에 올려 보세요.',
    saveFailed: '이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요.',
    shareButton: '결과 공유하기',
    saveButton: '이미지로 저장',
    saving: '만드는 중…',
  },
  card: {
    you: '나는',
    footer: (host: string): string =>
      `여쭈어 여행자 유형 테스트 · ${host}/test`,
    critterFailed: '캐릭터 이미지를 불러오지 못했어요.',
    noCanvas: '이 브라우저에서는 이미지를 만들 수 없어요.',
    failed: '이미지를 만들지 못했어요.',
  },
};
