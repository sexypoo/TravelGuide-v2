# T22 — 채팅 장소 찜

## 목표

- 인증방에서 받은 장소 메시지를 사용자 계정에 저장하거나 해제한다.
- 저장한 장소를 프로필에서 다시 확인하고 외부 지도로 열 수 있다.
- 지도 공급자 도입 전에도 동작하며 향후 공급자 장소 ID를 확장할 수 있다.

## 백엔드

- `PlaceFavorite`에 사용자, 원본 메시지, 장소 스냅샷과 생성 시각을 저장한다.
- 같은 사용자가 같은 메시지를 중복 저장하지 못하게 DB unique constraint를 둔다.
- 목록, 저장, 해제 API는 JWT 인증과 방 열람 권한/소유권을 검증한다.
- 삭제되었거나 장소가 아닌 메시지는 저장하지 않는다.

## 프론트엔드

- 장소 메시지 카드에 접근 가능한 찜 토글을 표시한다.
- 저장 상태는 React Query 캐시에서 즉시 반영하고 실패 시 안내한다.
- `/app/saved-places`에서 저장한 장소를 최신순으로 표시한다.
- 프로필에서 저장 목록으로 이동할 수 있게 한다.

## 검증

- Prisma 생성 및 마이그레이션 SQL 검사
- backend unit/build/lint/test
- frontend 찜 상호작용 unit test, lint/typecheck/build
- 빈 목록, 저장 중, 실패 상태와 모바일 카드 폭 확인

## 실행 결과

- backend Prisma generate/validate, lint, typecheck, build 성공
- backend 단위 테스트 29 suites / 81 tests 성공
- frontend 전체 verify 성공: 39 suites / 95 tests, lint, format, typecheck, build
- T22 PostgreSQL 통합 테스트는 작성했으나 로컬 Docker daemon이 꺼져 있어 실행 보류
