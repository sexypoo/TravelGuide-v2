# 42 여행자 유형 테스트 (인바운드 실험 1단계)

## Goal

사용자가 스스로 들어올 이유를 만든다. 로그인 없이 1분 안에 끝나는 여행자
유형 테스트를 열고, 결과를 인스타 스토리와 카톡으로 공유하게 한다.
오너 승인 시안: 2026-10-25. 결정은 ADR-052.

전체 흐름은 테스트(유입) → 현지인 코스(붙잡기) → ♥ 연결(관계)이다. 이
계획은 1단계만 다룬다.

## Files

- `frontend/src/lib/travel-test/content.ts`: 유형 8개, 질문 10개, 채점
- `frontend/src/lib/travel-test/courses.ts`: 유형별 예시 코스, 제주·부산·강릉·서울(AI 도움, 현지인 미확인 표시)
- `frontend/src/components/travel-test/region-course.tsx`: 결과 화면 지역 선택
- `frontend/src/lib/travel-test/share-card.ts`: 1080x1920 결과 카드 캔버스
- `frontend/src/components/travel-test/`: 질문 화면, 공유 버튼, 임시 캐릭터
- `frontend/src/app/test/`: `/test`, `/test/[type]` (정적 생성 8개)
- `frontend/public/test/og/*.png`: 링크 미리보기 이미지 1200x630
- `frontend/src/app/page.tsx`: 비로그인 홈 입구
- `docs/PRODUCT.md`, `docs/DECISIONS.md` (ADR-052)

## Migrations

없음. 백엔드 변경 없음, 서버 저장 없음.

## Tests

- 단위: 질문·유형 구성, 채점과 동점 규칙, 질문 화면 진행과 뒤로 가기, 홈 입구 링크
- E2E: `/test`에서 10문항을 끝내면 결과 페이지가 열린다
- 390x844, 1440x900 화면 확인
- `yarn lint`, `yarn typecheck`, `yarn test`, `yarn build`

## Risks

- 예시 코스는 현지인이 확인하지 않은 내용이다. 화면에 밝히고, 장소 사실관계는
  오너가 한 번 훑어봐야 한다.

- 측정이 없다. 공유·완료 수를 보려면 오너가 방법을 정해야 한다
  (Vercel Web Analytics 같은 외부 도구, 또는 이벤트 테이블과 개인정보
  처리방침 변경).
- 캐릭터가 임시 그림이라 공유 동기가 약할 수 있다. 일러스트는 별도 작업.
- 링크 미리보기 이미지는 커밋된 PNG라 유형 문구를 바꾸면 다시 만들어야 한다
  (빌드한 웹을 띄우고 Playwright로 캔버스를 그려 저장, PR #43 설명 참고).
