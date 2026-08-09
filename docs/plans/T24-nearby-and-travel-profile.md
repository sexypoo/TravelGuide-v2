# T24 주변 탐색과 여행 프로필

## 목표

- 채팅 장소 카드를 이름·주소·메모·행동이 빠르게 구분되는 티켓형 카드로 개선한다.
- 장소 전송 모달에서는 검색과 선택에만 집중하고, 영업 중 주변 장소는 `/app/nearby` 메인 탭으로 분리한다.
- 내 프로필에 여행 스타일 태그와 소유자 전용 여행 기록 CRUD를 추가한다.

## 제품·권한 결정

- `travelStyles`는 서버가 허용한 상수 집합에서 최대 5개만 저장한다.
- 여행 기록은 제목, 목적지, 시작일, 종료일, 500자 이하 메모를 갖는다.
- 여행 기록과 여행 스타일 편집은 로그인한 소유자만 가능하며 공개 기여 프로필에는 노출하지 않는다.
- 주변 위치는 DB에 저장하지 않고 사용자의 명시적 버튼 동작으로만 Places API에 전달한다.

## 디자인 계획

- 색상: Canvas `#FFF9FB`, Ink `#494653`, Berry `#CF426F`, Plum `#914BA5`, Iris `#7068D8`, Open `#00A878`.
- 타입: 제목은 Wanted Sans 계열의 760–780 weight, 본문은 Pretendard 계열 650–720, 영업 상태·거리 성격의 보조 정보는 utility mono를 제한적으로 사용한다.
- 레이아웃: 주변 화면은 모바일에서 `현재 위치 CTA → 지도 → 장소 카드 목록`, 데스크톱에서 `지도 3/5 + 목록 2/5` 구조다. 프로필은 공개 정보와 여행 취향을 한 카드에, 여행 기록은 별도 타임라인에 둔다.
- 시그니처: 지도 아래와 채팅 안에서 동일한 핀 레일과 좌우 행동 구조를 쓰는 `place ticket`을 사용해 “장소가 대화에서 여행 계획으로 이어진다”는 제품 맥락을 시각화한다.
- 절제: 새 그라데이션 면적은 선택·저장 CTA에만 쓰고, 카드 본문은 흰색과 선·타이포 위계로 구분한다.

## 백엔드

- `User.travelStyles String[]`와 `TravelRecord` 모델 및 migration 추가.
- `PATCH /api/v1/users/me`에 여행 스타일 갱신 추가.
- `GET/POST /api/v1/travel-records`, `DELETE /api/v1/travel-records/:id` 추가.
- DTO validation, 소유권, 기간 역전, 응답 계약 단위·통합 테스트.

## 프론트엔드

- 장소 선택기에서 주변 식당 동작 제거.
- `/app/nearby`와 `NearbyPlacesExplorer` 추가, 메인 내비게이션에 `주변` 배치.
- 채팅 장소 카드와 주변 장소 카드에 공통 시각 위계 적용.
- 프로필 폼의 여행 스타일 선택, 여행 기록 목록·추가·삭제 UI 및 API 계약 추가.

## 검증

- Backend: format, lint, typecheck, unit, PostgreSQL integration, Prisma validate, build.
- Frontend: format, lint, typecheck, unit coverage, build.
- 390x844 및 1440x900에서 주변 탭, 장소 전송, 프로필/여행 기록을 브라우저 검수한다.
