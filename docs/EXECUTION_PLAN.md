# 여쭈어 (여JJU) — 2.5주 Codex 실행 계획

- 기간 가정: 13 개발일
- 작업 방식: 한 번에 하나의 검토 가능한 vertical slice
- 코드 동결: Day 9 종료 후 신규 P0 기능 추가 금지
- Day 10~13: 통합, 테스트, 배포, 발표 안정화

---

## 1. Codex 운영 방식

### 1.1 한 작업의 표준 루프

각 Task에서 Codex는 다음 순서를 지킨다.

1. `AGENTS.md`와 관련 문서 읽기
2. 현재 저장소와 기존 구현 검사
3. 수정할 파일과 테스트를 명시한 계획 작성
4. `docs/plans/Txx-*.md`에 계획 저장
5. 해당 Task 범위만 구현
6. 관련 테스트 실행
7. 전체 품질 명령 중 가능한 범위 실행
8. diff 자체 검토
9. 구현·테스트·위험 요약 후 중지

한 Task가 끝나기 전에 다음 Task를 섞지 않는다.

### 1.2 Codex 병렬화 규칙

병렬 subagent는 다음에만 사용한다.

- 서로 다른 디렉터리를 수정하는 독립 작업
- 문서·테스트 검토
- UI 시각 검수
- 보안 리뷰

병렬로 수정하지 않는 영역:

- `schema.prisma`
- Prisma migration
- 공통 contracts
- auth cookie/JWT
- `RoomAccessService`
- root package manager 설정

### 1.3 Git 규칙

- Task 시작 전 clean working tree
- Task별 branch 또는 checkpoint
- 자동 생성 파일을 제외하고 diff를 사람이 검토
- migration은 수정 대신 새 migration 생성
- force push 금지

---

## 2. 13일 일정

| Day | Task | 목표 | 발표 가치 |
|---:|---|---|---|
| 1 | T00 | 저장소·환경·CI scaffold | Codex가 안정적으로 반복 작업 가능 |
| 2 | T01 | DB 기초·회원가입·로그인 | 실제 사용자 세션 |
| 3 | T02 | 제주·프로필·방 잠금 | 새 서비스 정보 구조 확인 |
| 4 | T03 | 여행자·현지인 인증 backend | 신뢰 핵심 데이터 |
| 5 | T04 | 인증 UI·관리자 심사 | 인증 흐름 완결 |
| 6 | T05 | 방·질문 backend | 여행자 문제 제출 |
| 7 | T06 | 답변·Socket backend | 다수 현지인 실시간 답변 |
| 8 | T07 | 방·질문·답변 frontend | 핵심 사용자 경험 완결 |
| 9 | T08 | 채택·해결·신고·관리자 처리 | 의사결정과 안전 흐름 완결 |
| 10 | T09 | 보안·오류·로그·health | 발표 중 장애 감소 |
| 11 | T10 | 통합·Playwright·시각 QA | 핵심 시나리오 자동 검증 |
| 12 | T11 | HTTPS 배포·seed·smoke | 실제 발표 주소 |
| 13 | T12 | 회귀 수정·리허설·동결 | 안정된 발표 빌드 |

주말·야간 버퍼는 신규 기능이 아니라 버그·배포 문제에만 사용한다.

---

## 3. Task 정의

## T00 저장소 scaffold

**목표**

- 신규 모노레포 생성
- Web/API/contracts/config 구조
- 로컬 PostgreSQL
- lint/typecheck/test/build 기반
- CI

**주요 산출물**

- root workspace
- Next.js, NestJS 앱
- Docker Compose
- Prisma 초기 연결
- README와 env validation
- `/health/live` 임시 또는 정식 endpoint

**완료 조건**

```bash
yarn install
yarn db:up
yarn dev
yarn lint
yarn typecheck
yarn test
yarn build
```

모두 실행 가능. 빈 화면이나 기본 페이지라도 Web과 API 연결을 확인한다.

**금지**

- 제품 기능 구현
- UI 라이브러리 대량 도입
- 기존 MVP 소스 복사

---

## T01 DB와 인증

**목표**

- User 모델
- 회원가입·로그인·로그아웃·me
- httpOnly cookie JWT
- 공통 validation/exception/requestId

**완료 조건**

- AUTH-001~003
- E2E-001, E2E-002 일부 또는 통합 테스트
- 비밀번호·JWT 미노출
- 보호 route 동작

**리뷰 포인트**

- CORS credentials
- cookie 옵션
- 이메일 정규화
- role과 인증 자격의 분리

---

## T02 Destination, profile, room shell

**목표**

- Destination/Room 모델과 제주 seed
- 내 프로필·공개 카드
- 방 목록·잠금 상태
- 사용자 홈 UI

**완료 조건**

- DEST-001, ROOM-001, PROF-001
- 미인증 사용자는 방 피드 접근 403
- 홈에서 인증 CTA 표시
- 모바일 390px에서 기본 레이아웃 정상

---

## T03 인증 backend와 storage

**목표**

- Verification 모델
- local/private storage adapter
- 여행자 신청
- 현지인 신청
- GPS 거리·정확도 검증
- 인증 상태 조회
- 관리자 review API

**완료 조건**

- VER-001~003, ADM-001 API
- E2E-004~010에 필요한 backend
- 실제 multipart 파일 처리
- 파일 실패 시 DB·파일 일관성
- 관리자 외 증빙 접근 금지

**리스크**

- 파일 업로드와 DB 원자성
- 날짜 timezone
- GPS 단위와 distance 계산

---

## T04 인증 frontend와 관리자 심사 UI

**목표**

- 여행자·현지인 신청 폼
- geolocation UX
- 인증 상태 화면
- 관리자 심사 목록·상세·승인·반려

**완료 조건**

- 사용자가 신청부터 상태 확인까지 완료
- 관리자가 실제 파일을 확인하고 처리
- 승인 후 사용자 새로고침 시 방 접근 상태 변경
- 권한 거부·정확도 부족·파일 오류 표시

---

## T05 방과 질문 backend

**목표**

- `RoomAccessService`
- 방 상세·질문 목록 cursor pagination
- 질문 생성·상세
- 열린 질문 3개 제한
- 만료 상태

**완료 조건**

- ROOM-002~003, QST-001~002
- E2E-011~013 backend
- REST와 향후 Socket에서 재사용할 접근 서비스
- DTO에 비공개 필드 없음

---

## T06 답변과 실시간 backend

**목표**

- Answer 모델·생성
- 근거 유형과 공식 URL 검증
- Socket gateway
- room join 권한
- 질문·답변 이벤트
- 재연결을 위한 REST 진실 원칙

**완료 조건**

- ANS-001, RT-001~003
- E2E-014~018 backend와 socket
- 두 실제 socket client에서 이벤트 확인
- DB 커밋 전 이벤트가 나가지 않음

---

## T07 핵심 room frontend

**목표**

- 제주 방 피드
- 질문 작성
- 질문 상세
- 답변 작성
- React Query와 Socket cache 동기화
- 모바일 UX

**완료 조건**

- 여행자·현지인 별 UI 권한 분기
- 질문·답변이 새로고침 없이 보임
- 이벤트 중복 없음
- reconnect 후 refetch
- loading/empty/error/retry

**시각 검수**

- 390x844
- 768x1024
- 1440x900

---

## T07A 대화 중심 방 전환 backend

**목표**

- 인증 참여자 메시지 저장·cursor 조회
- 여행자·현지인 메시지 및 토픽 작성
- 본인 메시지의 1회 토픽 전환
- 커밋 후 실시간 메시지 이벤트

**완료 조건**

- 미인증 사용자와 관리자의 쓰기 거부
- 공개 DTO에 인증 증빙·GPS·이메일 비노출
- 중복·타인·다른 방 메시지 전환 거부
- 실제 PostgreSQL과 Socket client에서 메시지 이벤트 확인

---

## T08 채택, 해결, 신고

**목표**

- 답변 채택 transaction
- 답변 없이 해결
- Report 생성
- 관리자 Report UI와 soft delete
- 관련 Socket update

**완료 조건**

- QST-003, SAFE-001~002, ADM-002
- E2E-019~026
- 해결 후 답변 차단
- 삭제 콘텐츠 원문 비노출

Day 9 종료 시 P0 기능 동결.

---

## T09 hardening

**목표**

- rate limit
- 보안 헤더
- health live/ready
- 구조화 로그와 requestId
- env 검증
- 오류 메시지·빈 상태·재시도
- 접근성 1차 점검

**완료 조건**

- secret/좌표/증빙 URL이 로그에 없음
- production env 누락 시 fail fast
- 일반 사용자 admin API 403
- API 오류가 프론트에서 사용자 친화적으로 표시

---

## T10 자동 테스트와 시각 QA

**목표**

- backend integration test 완성
- Playwright multi-context E2E
- socket reconnect test
- 모바일·데스크톱 visual check
- coverage gate

**완료 조건**

- `ACCEPTANCE_TESTS.md` P0 핵심 시나리오 통과
- `yarn verify` 통과
- flaky test 재실행 없이 안정
- Codex가 Playwright로 실제 UI를 열고 스크린샷 검토

---

## T11 배포

**목표**

- production build
- Nginx HTTPS same-origin
- WebSocket upgrade
- RDS 또는 배포 PostgreSQL migration
- private storage 설정
- demo seed
- PM2 자동 시작

**완료 조건**

- HTTPS 주소에서 E2E smoke
- geolocation 동작
- cookie 정상
- socket 정상
- 서버 재부팅 후 자동 시작
- `/health/ready` 200

---

## T12 발표 동결

**목표**

- 전체 리허설
- 버그만 수정
- 발표용 데이터 초기화 절차
- 장애 대비

**완료 조건**

- 10분 이내 seed/reset 가능
- 세 계정 시연 3회 연속 성공
- 백업 영상
- 발표 직전 체크리스트 문서
- release tag 생성

---

## T13 신뢰할 수 있는 실시간 콘텐츠 개선

**우선순위**

- P0: 메시지 신고·관리자 숨김, 현장 정보 작성자 중복 제거와 30분 신선도 표시
- P1: 답변 현장 사진, 장소 좌표 직접 지정, 토픽 카테고리 필터

**완료 조건**

- 모든 채팅 메시지 형식을 신고할 수 있고 숨김 시 본문과 첨부가 함께 가려짐
- 같은 사용자의 최신 현장 답변만 집계되고 30분이 지나면 지난 정보로 표시됨
- 답변 사진이 비공개 저장소와 방 조회 권한을 거쳐 제공됨
- 기기 위치와 직접 입력 좌표가 같은 장소 메시지 계약으로 전송됨
- 서버 필터와 프론트 캐시 키가 토픽 카테고리를 구분함
- 상세 설계와 검증 명령은 `docs/plans/T13-trusted-live-content.md`를 따름

---

## T14 브라우저 알림

**목표**

- 웹앱을 열어 둔 사용자가 백그라운드 탭에서도 새 메시지와 답변을 확인
- 사용자 동작 기반 권한 요청과 브라우저별 사용 설정 제공

**완료 조건**

- 보이지 않는 탭에서 다른 사용자의 메시지·답변만 한 번 알림
- 알림 클릭 시 관련 방 또는 토픽으로 이동
- 권한 거부·미지원 상태가 방 기능을 막지 않음
- 새로고침 후 알림 사용 선택 유지

---

## T15 토픽 사진 첨부

**목표**

- 직접 생성하는 토픽에 비공개 현장 사진 한 장 첨부
- 목록과 상세에서 본문보다 낮은 위계의 근거 자료로 표시

**완료 조건**

- 기존 JSON 생성과 사진 multipart 생성이 모두 동작
- 방 조회 권한이 있는 사용자만 사진 조회
- 숨김·업로드 실패 시 사진 노출과 고아 파일 방지
- JPEG·PNG·WebP 시그니처와 10 MiB 제한 검증

---

## T16 토픽 자동 만료

**목표**

- 마감된 토픽을 DB에서 EXPIRED로 전환
- 진행 중 목록과 상세·Socket 상태 일치

**완료 조건**

- 시작 시와 60초 주기로 조건부 batch 실행
- 커밋된 만료만 실시간 이벤트 발행
- 동시 실행에도 중복 전환·이벤트 없음
- 만료 토픽이 진행 중·해결됨 목록에서 제거됨

---

## T17 공개 기여자 프로필

**목표**

- 답변 작성자의 인증 지역과 공개 기여 이력을 확인
- 평점·순위 없이 답변 신뢰 판단에 필요한 사실만 제공

**완료 조건**

- 공개 프로필 API가 소개·가입일·답변 수·채택 수를 제공
- 숨김 콘텐츠는 통계에서 제외
- 답변 카드에서 공개 프로필로 이동 가능
- 모바일·데스크톱 프로필 화면과 오류 상태 제공

---

## T18 관리자 KPI 대시보드

**목표**

- MVP 핵심 지표를 실제 DB에서 계산해 운영 화면으로 제공

**완료 조건**

- 관리자 전용 metrics API와 화면 연결
- 질문·답변·해결·채택·응답 속도 지표 제공
- 현지인별 공개 답변 수 제공
- 빈 데이터와 모바일 레이아웃 처리

---

## T36 계정 복구와 소셜 인증

**목표**

- 30분·1회 사용 비밀번호 재설정 메일과 기존 세션 무효화
- Google, Kakao, Apple 로그인과 검증 이메일 기반 계정 연결
- 모바일·데스크톱 인증 화면과 설정 가능한 제공자 노출

**완료 조건**

- AUTH-004~005, E2E-031~032
- 재설정 원문 토큰·OAuth 비밀값 비저장·비노출
- 기존 register/login/logout/me와 Socket 인증 회귀 없음
- 실제 외부 성공 검수에 필요한 콜백 URL과 환경변수 문서화

---

## T40 계정 삭제와 개인정보 공개

**목표**

- 앱·웹의 본인 확인 계정 영구 삭제
- 공개 개인정보 처리방침과 앱스토어용 외부 삭제 안내 URL
- Apple refresh token 암호화 저장·폐기

**완료 조건**

- AUTH-006, E2E-033, INT-AUTH-03
- 관리자 삭제 차단과 비밀번호/확인 문구 재검증
- 연쇄 콘텐츠·대상 신고·사전예약·비공개 파일까지 정리
- 390x844와 1440x900에서 프로필 및 공개 정책 경로 검수

---

## 4. 매일 종료 기준

매일 끝날 때 다음을 남긴다.

- 오늘 완료 Task와 acceptance ID
- 실행한 명령과 결과
- 남은 blocker
- 다음 날 첫 작업
- 배포 가능 여부
- 회귀 위험

`docs/DAILY_STATUS.md`를 갱신해도 된다.

---

## 5. 지연 대응

### Day 5까지 인증이 완결되지 않음

- S3 adapter를 미루고 local private storage로 발표
- UI 미세 디자인 중단
- profile edit 제거

### Day 7까지 Socket이 불안정

- write는 REST 유지
- server emit과 join 권한만 최소화
- typing/presence는 절대 추가하지 않음
- reconnect 시 전체 detail refetch로 단순화

### Day 9까지 신고가 미완료

- 신고 생성과 관리자 목록·상태 변경까지만
- 콘텐츠 soft delete UI는 관리자 API로 최소 구현
- 핵심 채팅 흐름은 건드리지 않음

### Day 11 배포 장애

- 같은 도메인 Nginx를 우선
- 외부 서비스를 추가해 구조를 바꾸지 않음
- 안정된 EC2 한 대 배포를 사용

---

## 6. Codex 검토 분리

다음 시점에는 구현 agent와 별도의 review agent를 사용하는 것이 좋다.

- T03 종료: 인증·파일·개인정보 리뷰
- T06 종료: Socket 권한·중복·재연결 리뷰
- T08 종료: 소유권·상태 전이·soft delete 리뷰
- T10 종료: 전체 보안·회귀 리뷰

Review agent는 코드를 직접 대규모 수정하지 않고, 우선순위가 있는 발견 사항과 재현 방법을 반환한다. 수정은 원래 작업 agent 또는 별도 작은 Task로 수행한다.
