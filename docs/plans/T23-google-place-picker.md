# T23 — Google 지도 장소 선택과 채팅 공유

## 목표

- `+ → 장소`에서 전체 화면 모바일 시트로 지도를 열고 장소를 검색한다.
- 현재 위치 주변의 영업 중 식당을 명시적 사용자 동작으로 조회한다.
- 선택한 Google 장소를 채팅 카드로 보내고 기존 찜 기능과 연결한다.

## 백엔드

- Places API (New) Text Search와 Nearby Search를 서버에서 호출한다.
- FieldMask와 결과 수·반경을 제한하고 API 키 누락/외부 장애를 명확한 Problem Details로 반환한다.
- Google Place ID를 메시지와 찜 스냅샷에 저장한다.

## 프론트엔드

- 브라우저 제한 키로 Google 지도만 렌더링한다.
- 검색과 주변 장소 데이터는 동일 출처 backend API를 사용한다.
- 장소 선택기는 채팅 높이를 줄이지 않는 모바일 우선 modal/bottom sheet로 제공한다.
- 선택 후 composer에는 작은 장소 미리보기만 남긴다.

## 검증

- API 응답 파서, 외부 오류, 반경/좌표 검증 단위 테스트
- 장소 검색·현재 위치·선택·전송 컴포넌트 테스트
- backend/frontend 전체 lint, typecheck, test, build
