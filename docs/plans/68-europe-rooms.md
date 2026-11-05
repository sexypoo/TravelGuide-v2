# 68 유럽 교환학생 도시 도움방

## Goal

제주 1개 방을 여러 도시 방으로 넓힌다. 첫 대상은 유럽 한국인 교환학생
(자기 도시에선 현지인, 방학엔 여행자). 결정은 ADR-053.

## Files

- `backend/prisma/destinations.ts` (+spec): 도시 목록, seed가 배포마다 upsert
- `backend/prisma/seed.ts`: 목록을 돌며 여행지와 방 upsert
- `frontend/src/lib/rooms/presentation.ts` (+test): 나라별 묶기, 내 방, `?city=`
- `frontend/src/app/app/rooms/page.tsx`: 도움방 목록, 하단 메뉴 연결
- `frontend/src/app/app/page.tsx`: 홈은 내 방만, 없으면 고르기 안내
- `frontend/src/app/app/verifications/{traveler,local}/page.tsx`,
  `components/verifications/city-picker.tsx`: 도시 고르기
- `frontend/src/app/app/questions/[id]/page.tsx`: 토픽의 방을 실제로 찾기
- 제주 고정 문구·경로: 잠긴 방, 인증 폼, 타임라인, 비로그인 홈, 개인정보 처리방침, 테스트 결과
- `docs/PRODUCT.md`, `docs/DECISIONS.md`

## Migrations

없음. 도시는 seed 데이터다(배포 시 `yarn db:seed`).

## Tests

- 단위: 도시 seed 형식, 방 묶기·내 방·도시 찾기, 바뀐 문구와 링크
- E2E 전체(제주 흐름 회귀)
- `yarn verify` 두 앱, 390x844·1440x900 확인

## Risks

- 방이 많아 빈 방이 보인다. 목록에 상태를 보이고 홈에는 내 방만 둔다.
- 토픽 상세는 서버에서 토픽을 한 번 더 읽어 방을 찾는다.
- 아이슬란드 반경 300km는 넓다. 현지인 인증은 관리자 심사가 최종 판단이다.
