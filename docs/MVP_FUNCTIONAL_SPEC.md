# 여쭈어 (여JJU) — 2.5주 발표용 MVP 기능명세서

- 문서 버전: 1.0
- 작성일: 2026-07-30
- 개발 기간 가정: 13 개발일 + 주말/야간 버퍼
- 구현 방식: Codex를 활용한 그린필드 개발
- 제품 형태: 모바일 우선 반응형 웹
- 파일럿 지역: 제주 1개 지역
- 이 문서의 상태: 구현 범위와 인수 기준의 최종 기준 문서

---

## 1. 문서 사용 원칙

이 문서는 `여쭈어 (여JJU)`의 2.5주 발표용 MVP에서 **무엇을 만들고, 무엇을 만들지 않을지**를 고정한다. 저장소와 내부 기술 식별자는 `TravelGuide v2`를 유지한다.

Codex는 다음 우선순위를 따른다.

1. 이 문서의 P0 요구사항
2. `ACCEPTANCE_TESTS.md`의 시나리오
3. `ARCHITECTURE.md`의 기술 결정
4. `EXECUTION_PLAN.md`의 작업 순서
5. 구현 중 발생한 결정은 `DECISIONS.md`에 기록

문서에 없는 기능은 임의로 추가하지 않는다. 모호한 항목은 가장 단순한 구현을 택하되, 사용자 가치·보안·데이터 무결성에 영향을 주면 작업을 멈추고 결정이 필요하다고 보고한다.

---

## 2. 제품 정의

### 2.1 핵심 문제

여행자는 계획이 어긋나는 순간, 예를 들어 날씨 악화, 휴무, 교통 지연, 현장 혼잡, 예약 취소 같은 변수에 맞닥뜨리면 검색 결과보다 **지금 이 장소를 아는 사람의 판단**이 필요하다. 그러나 낯선 사람의 정보는 신뢰하기 어렵고, 기존 1:1 매칭은 응답 지연과 공급자 부재에 취약하다.

### 2.2 해결 방식

특정 여행지의 **인증된 여행자**와 **인증된 현지인**만 입장할 수 있는 목적형 단체 채팅방을 제공한다. 참여자는 짧은 현장 정보를 실시간으로 공유하고, 오래 남겨 답변할 상황은 구조화 토픽으로 만든다. 현지인은 토픽에 근거 유형을 표시해 답변하고 토픽 작성자는 유용한 답변을 채택해 해결 처리한다.

### 2.3 제품 한 문장

> 여행이 틀어지는 순간, 인증된 현지인 여러 명에게 지금 필요한 판단을 묻는 여행지 실시간 도움방.

### 2.4 이번 MVP에서 검증할 가설

1. 여행자는 돌발 상황에서 검색보다 현지인의 즉시 판단을 원한다.
2. 한 명을 기다리는 1:1 매칭보다 여러 현지인이 보는 지역방이 응답 가능성을 높인다.
3. 여행자·현지인 인증 배지와 답변 근거 표시가 낯선 사람에 대한 불신을 줄인다.
4. 실시간 대화와 토픽-답변-해결 구조의 결합이 자유 대화의 속도와 정보 탐색의 명확성을 함께 제공한다.

---

## 3. MVP 완료 정의

다음 흐름이 실제 배포 환경에서, 실제 PostgreSQL과 실제 Socket.io 연결로 동작하면 발표용 MVP가 완료된 것으로 본다.

1. 일반 사용자가 회원가입하고 로그인한다.
2. 여행자가 제주 여행 증빙과 여행 기간을 제출한다.
3. 현지인이 제주 지역 GPS와 지역 연고 증빙을 제출한다.
4. 관리자가 두 신청을 승인한다.
5. 승인된 여행자와 현지인이 제주 실시간 도움방에서 메시지를 주고받는다.
6. 참여자가 중요한 메시지를 토픽으로 만들고 서로 다른 두 브라우저의 승인된 현지인이 답변한다.
7. 답변이 여행자 화면에 새로고침 없이 1초 내 표시된다.
8. 여행자는 답변의 인증 배지와 근거 유형을 확인한다.
9. 여행자는 한 답변을 채택하며 질문을 해결 처리한다.
10. 사용자는 질문 또는 답변을 신고할 수 있고, 관리자는 신고를 확인해 처리한다.
11. 페이지 새로고침과 소켓 재연결 후에도 질문·답변·해결 상태가 유지된다.
12. 전체 흐름이 HTTPS 배포 주소에서 모바일 화면으로 시연 가능하다.

---

## 4. 범위 결정

### 4.1 반드시 구현하는 P0

- 회원가입, 로그인, 로그아웃, 내 정보
- 제주 1개 여행지와 1개 지역방
- 여행자 인증 신청 및 관리자 승인·반려
- 현지인 인증 신청 및 관리자 승인·반려
- 인증 상태에 따른 방 접근 권한
- 인증 참여자의 방 메시지 작성·목록
- 질문 작성, 목록, 상세
- 현지인의 답변 작성
- Socket.io 실시간 질문·답변·상태 갱신
- 답변 채택 및 질문 해결
- 질문·답변·사용자 신고
- 관리자 인증 심사와 신고 처리
- 모바일 우선 반응형 UI
- 실제 DB 기반 시드 스크립트와 발표 계정
- HTTPS 배포, 헬스 체크, 구조화 로그
- 핵심 통합·E2E 테스트

### 4.2 시간이 남을 때만 구현하는 P1

- 제주 파일럿 사전예약 신청과 최소 개인정보 저장
- 질문 이미지 1장 첨부
- 브라우저 알림
- 현지인 공개 프로필 통계
- 관리자 KPI 대시보드
- 질문 카테고리 필터 고도화
- 질문 자동 만료 배치 작업

### 4.3 이번 MVP에서 절대 구현하지 않는 항목

- 1:1 매칭, 스와이프, 개인 채팅
- 코인, 결제, 환급, 정산
- Flutter 모바일 앱
- 다국어 번역
- 다중 국가·다중 도시 자동 검색
- 외부 도시 자동완성 API
- AI 답변, AI 요약, AI 신고 필터
- 음성·영상 통화
- 읽음 인원, 타이핑 표시, 온라인 인원
- 현지인 순위·평점·리워드
- 전문 가이드 자격 심사 체계
- 지도 탐색, 경로 안내
- SNS 피드, 갤러리, 북마크
- 소셜 로그인, 이메일 인증, 비밀번호 재설정
- 푸시 알림 서버
- 마이크로서비스, 메시지 큐, 이벤트 소싱

---

## 5. 기술·제품 고정 결정

| 항목 | 결정 |
|---|---|
| 저장소 | 기존 MVP와 분리한 신규 `travelguide-v2` 저장소 |
| 제품 | Next.js 기반 반응형 웹만 개발 |
| 백엔드 | NestJS 모듈러 모놀리스 |
| DB | PostgreSQL + Prisma migration |
| 실시간 | 모든 쓰기는 REST, Socket.io는 서버 이벤트 수신 전용 |
| 초기 지역 | 제주 1개 지역을 seed로 생성 |
| 사용자 역할 | 계정 역할은 USER/ADMIN, 여행자·현지인 자격은 인증 상태로 결정 |
| 현지인 검증 | GPS는 보조 신호, 증빙 제출과 관리자 승인이 최종 기준 |
| 방 구조 | 실시간 참여자 채팅 + 구조화 토픽과 답변 스레드 |
| 인증 문서 | 공개하지 않으며 관리자만 접근 가능한 비공개 저장소에 보관 |
| 인증 용어 | UI에는 `인증 현지인`을 사용하고 `공인 가이드`라고 표현하지 않음 |
| 인증 세션 | httpOnly 쿠키 기반 JWT, localStorage 토큰 금지 |
| 배포 | 웹과 API를 동일 도메인에서 HTTPS로 제공 |
| 시간 | DB 저장은 UTC, 표시만 Asia/Seoul |
| UI 언어 | 한국어 단일 언어 |

---

## 6. 사용자 유형과 권한

### 6.1 계정 역할

- `USER`: 일반 사용자. 인증 상태에 따라 여행자·현지인 기능을 가진다.
- `ADMIN`: 모든 방 열람, 인증 심사, 신고 처리 권한을 가진다.

한 사용자는 동시에 유효한 여행자 인증과 현지인 인증을 가질 수 있다. 고정된 `TRAVELER` 또는 `LOCAL` 계정 타입을 만들지 않는다.

### 6.2 인증 상태

- `PENDING`: 심사 대기
- `APPROVED`: 승인
- `REJECTED`: 반려
- `REVOKED`: 관리자 회수
- `EXPIRED`: 유효기간 종료

### 6.3 방 권한 행렬

| 행위 | 미로그인 | 로그인·미인증 | 유효 여행자 | 유효 현지인 | 둘 다 유효 | 관리자 |
|---|---:|---:|---:|---:|---:|---:|
| 랜딩/소개 | 가능 | 가능 | 가능 | 가능 | 가능 | 가능 |
| 방 메타데이터 보기 | 불가 | 가능 | 가능 | 가능 | 가능 | 가능 |
| 방 채팅·토픽 보기 | 불가 | 불가 | 가능 | 가능 | 가능 | 가능 |
| 방 메시지 작성 | 불가 | 불가 | 가능 | 가능 | 가능 | 불가 |
| 토픽 작성·본인 메시지 전환 | 불가 | 불가 | 가능 | 가능 | 가능 | 불가 |
| 답변 작성 | 불가 | 불가 | 가능 | 가능 | 가능 | 불가 |
| 자신의 질문 답변 채택 | 불가 | 불가 | 가능 | 불가 | 가능 | 가능 |
| 신고 | 불가 | 가능 | 가능 | 가능 | 가능 | 가능 |
| 인증 심사 | 불가 | 불가 | 불가 | 불가 | 불가 | 가능 |
| 신고 처리 | 불가 | 불가 | 불가 | 불가 | 불가 | 가능 |

추가 규칙:

- 사용자는 자신의 토픽에 답변을 작성할 수 없다.
- 작성자는 자신의 토픽만 채택·해결할 수 있다.
- 해결되거나 만료된 질문에는 새 답변을 작성할 수 없다.
- 관리자는 시연 및 운영을 위해 모든 방 콘텐츠를 열람할 수 있지만, 일반 사용자처럼 메시지·토픽·답변을 작성하지 않는다.

---

## 7. 핵심 사용자 흐름

### 7.1 여행자 흐름

1. 회원가입 및 로그인
2. 홈에서 제주 방이 잠겨 있음을 확인
3. `여행자 인증하기` 선택
4. 여행지, 여행 시작일, 종료일, 증빙 파일 제출
5. `심사 중` 상태 확인
6. 관리자 승인 후 방 입장
7. 상황 질문 작성
8. 여러 현지인의 답변을 실시간 수신
9. 답변 근거와 인증 정보를 비교
10. 유용한 답변 채택
11. 질문 해결 상태 확인

### 7.2 현지인 흐름

1. 회원가입 및 로그인
2. `현지인 인증하기` 선택
3. 제주 선택, 브라우저 GPS 수집
4. 지역 연고 유형과 증빙 파일 제출
5. 관리자 승인
6. 제주 방 입장
7. 열린 질문 확인
8. 답변 근거 유형을 고르고 답변 작성
9. 여행자가 채택하면 채택 표시 확인

### 7.3 관리자 흐름

1. 관리자 로그인
2. 인증 심사 목록에서 대기 건 확인
3. 증빙, 여행 기간 또는 GPS·연고 정보를 확인
4. 승인 또는 사유를 포함한 반려
5. 신고 목록 확인
6. 콘텐츠 유지, 숨김, 신고 기각 중 하나로 처리

---

## 8. 기능 요구사항

## 8.1 시스템 기반

### SYS-001 신규 저장소와 실행 환경 — P0

**목적**: Codex와 사람이 동일한 명령으로 환경을 재현한다.

**요구사항**

- Yarn workspace 기반 모노레포를 사용한다.
- 루트에서 웹·API·공유 패키지 명령을 실행할 수 있어야 한다.
- `.env.example`만 커밋하고 실제 비밀값은 커밋하지 않는다.
- 로컬 PostgreSQL은 Docker Compose로 실행한다.
- 모든 앱에 lint, typecheck, test, build 명령이 존재한다.
- 루트 `yarn verify`는 lint → typecheck → test → build를 실행한다.
- GitHub Actions에서 최소 lint, typecheck, backend integration test, build를 수행한다.

**인수 조건**

- 새 PC에서 README 순서대로 20분 이내 로컬 실행 가능
- `yarn install`, `yarn db:up`, `yarn db:migrate`, `yarn db:seed`, `yarn dev`가 성공
- `yarn verify`가 0으로 종료

### SYS-002 공통 API 규칙 — P0

- 모든 API는 `/api/v1` 아래에 둔다.
- 입력 DTO는 서버에서 런타임 검증한다.
- 에러는 일관된 Problem Details 형태로 반환한다.
- 모든 응답 시간은 ISO 8601 UTC 문자열이다.
- 요청마다 `requestId`를 생성해 응답 헤더와 로그에 포함한다.
- 비밀번호, JWT, 증빙 파일 URL, 정확한 GPS 좌표를 로그에 남기지 않는다.

에러 예시:

```json
{
  "type": "about:blank",
  "title": "Forbidden",
  "status": 403,
  "code": "ROOM_ACCESS_DENIED",
  "detail": "유효한 여행자 또는 현지인 인증이 필요합니다.",
  "requestId": "req_123"
}
```

---

## 8.2 인증과 사용자

### AUTH-001 회원가입 — P0

**입력**

- 이메일
- 비밀번호
- 닉네임
- 필수 약관 동의 체크

**규칙**

- 이메일은 trim 후 소문자 정규화
- 비밀번호 10~72자, 영문과 숫자 각각 1개 이상
- 닉네임 2~20자, 공백만으로 구성 불가
- 이메일·닉네임 중복은 409
- 비밀번호는 bcrypt cost 12 이상으로 해시
- 성공 후 httpOnly 인증 쿠키를 발급하거나 로그인 페이지로 이동한다. 구현 전반에서 한 방식을 일관되게 사용한다.

**인수 조건**

- 중복 이메일·닉네임을 구분된 오류 코드로 반환
- API 응답과 로그에 passwordHash가 노출되지 않음
- 회원가입 직후 `/auth/me`에서 사용자 정보 확인 가능

### AUTH-002 로그인·세션·로그아웃 — P0

- 로그인 성공 시 `tg_access` httpOnly 쿠키를 설정한다.
- 프로덕션은 `Secure`, `SameSite=Lax`, 적절한 Path를 사용한다.
- 토큰은 localStorage, sessionStorage, URL에 저장하지 않는다.
- 로그아웃은 쿠키를 즉시 제거한다.
- `GET /auth/me`는 사용자, 관리자 여부, 활성 인증 요약을 반환한다.
- 보호 API는 인증 가드가 항상 적용되어야 한다.

### AUTH-003 프론트엔드 접근 제어 — P0

- 비로그인 사용자가 보호 페이지에 접근하면 로그인으로 이동한다.
- 관리자 페이지는 일반 사용자에게 렌더링하지 않는다.
- 프론트엔드 가드는 UX 목적이고, 최종 권한 검사는 API에서 수행한다.

### PROF-001 기본 프로필 — P0

- 사용자 정보: 닉네임, 짧은 소개, 생성일
- 프로필 이미지는 이번 P0에서 제외하며 닉네임 이니셜 아바타를 사용한다.
- 사용자는 닉네임과 소개를 수정할 수 있다.
- 공개 사용자 카드에는 닉네임, 인증 현지인 여부, 인증 지역, 인증일만 표시한다.
- 정확한 GPS, 증빙 유형, 여행 일정, 이메일은 공개하지 않는다.

---

## 8.3 여행지와 방

### DEST-001 여행지 seed — P0

초기 데이터로 다음 여행지를 생성한다.

```text
slug: jeju
nameKo: 제주
countryCode: KR
timezone: Asia/Seoul
center: 33.3617, 126.5292
radiusKm: 80
roomTitle: 제주 실시간 여행 도움방
```

- 외부 지도·도시 자동완성 API는 호출하지 않는다.
- 스키마는 다중 여행지를 지원하지만 UI에서는 제주 1개만 노출한다.

### ROOM-001 방 목록과 잠금 상태 — P0

- 로그인 사용자는 홈에서 제주 방 카드를 본다.
- 카드는 사용자 상태에 따라 `입장 가능`, `여행자 심사 중`, `현지인 심사 중`, `인증 필요`를 표시한다.
- 미인증 사용자는 방 소개는 보지만 질문 피드는 볼 수 없다.
- 방 카드에서 인증 신청으로 바로 이동할 수 있다.

### ROOM-002 방 채팅과 토픽 피드 — P0

- 방의 기본 화면은 최신 참여자 메시지를 시간순으로 보여 주는 실시간 채팅이다.
- 별도 토픽 영역은 `진행 중`과 `해결됨` 두 탭을 제공하며 기본은 `진행 중`이다.
- 인증된 여행자와 현지인은 메시지와 토픽을 작성할 수 있다.
- 자신의 메시지는 카테고리와 긴급도를 지정해 한 번 토픽으로 전환할 수 있다.
- 메시지 목록은 cursor pagination을 사용하고 최신 50개를 가져온다.
- 질문은 최신순으로 가져오되, 상세 스레드는 작성순으로 표시한다.
- 목록은 cursor pagination을 사용하고 최초 20개를 가져온다.
- 각 질문 카드에는 다음이 보인다.
  - 카테고리
  - 긴급도
  - 질문 본문 일부
  - 작성자의 `인증 여행자` 또는 `인증 현지인` 배지
  - 작성 시각
  - 답변 수
  - 상태
- 삭제·숨김된 콘텐츠는 본문 대신 운영 정책에 따른 안내 문구를 표시한다.

### ROOM-003 방 접근 서비스 — P0

서버는 모든 방 조회·쓰기마다 아래를 검사한다.

- 여행자: APPROVED이며 현재 시간이 `여행 시작 24시간 전`부터 `여행 종료 24시간 후` 사이
- 현지인: APPROVED이며 현재 시간이 `expiresAt` 이전
- 관리자: 접근 허용

프론트엔드 상태만 믿지 않는다. REST와 Socket join 모두 동일한 `RoomAccessService`를 사용한다.

---

## 8.4 여행자·현지인 인증

### VER-001 여행자 인증 신청 — P0

**입력**

- destinationId
- 여행 시작일
- 여행 종료일
- 여행 증빙 파일 1개
- 선택 메모 300자 이하

**파일 규칙**

- JPEG, PNG, PDF만 허용
- 최대 5 MB
- Base64 DB 저장 금지
- 원본 파일명은 표시용으로만 보관하고 저장 키는 랜덤 생성
- 파일은 공개 버킷에 저장하지 않는다.

**도메인 규칙**

- 시작일은 종료일보다 늦을 수 없다.
- 종료일은 신청 시각보다 이전일 수 없다.
- 동일 사용자·여행지·유형에 PENDING 신청은 하나만 허용한다.
- 승인된 여행 일정과 완전히 겹치는 신규 신청은 거부한다.
- 신청 직후 상태는 PENDING이다.

**인수 조건**

- 업로드 실패 시 인증 레코드가 생성되지 않거나 고아 파일을 정리한다.
- 사용자는 현재 상태와 반려 사유를 볼 수 있다.
- 승인 전에는 방 콘텐츠에 접근할 수 없다.

### VER-002 현지인 인증 신청 — P0

**입력**

- destinationId
- GPS latitude, longitude, accuracy, capturedAt
- 지역 연고 유형: RESIDENCE, WORK, STUDY, OTHER
- 증빙 파일 1개
- 지역과의 관계 설명 30~300자

**도메인 규칙**

- 브라우저 Geolocation API를 사용한다.
- GPS 정확도가 200m를 초과하면 재시도를 요청한다.
- 위치가 제주 중심 반경 80km 밖이면 제출을 막는다.
- GPS는 현지인 자격의 보조 신호이며, 최종 자격은 관리자 승인으로 결정한다.
- 승인 시 기본 `expiresAt`은 승인일로부터 90일이다.
- 공개 화면에는 제주 인증 여부와 승인일만 표시한다.

### VER-003 인증 상태 조회와 재신청 — P0

- 사용자는 자신의 모든 여행자·현지인 신청 상태를 볼 수 있다.
- REJECTED 상태는 반려 사유를 표시한다.
- 반려 후 수정 제출 대신 새 신청을 생성한다.
- APPROVED 상태는 유효 시작·종료 또는 만료일을 표시한다.
- REVOKED 상태는 운영 문의 안내를 표시한다.

### ADM-001 인증 심사 — P0

관리자 화면 요구사항:

- 상태·유형·여행지 필터
- 제출일 최신순 목록
- 신청자 닉네임, 유형, 여행지, 기간 또는 GPS 요약
- 비공개 증빙 미리보기 또는 다운로드
- 승인 버튼
- 반려 버튼과 필수 사유 입력
- 이미 처리된 건을 중복 처리하지 않도록 낙관적 잠금 또는 상태 조건 업데이트

승인 시:

- 상태 APPROVED
- reviewedById, reviewedAt 기록
- 현지인은 expiresAt 기록
- Socket 또는 인앱 상태 갱신은 선택이며, 새로고침 시 반드시 반영

반려 시:

- 상태 REJECTED
- 10~300자 반려 사유 필수

---

## 8.5 질문과 답변

### QST-001 질문 작성 — P0

**작성 가능 사용자**: 해당 방의 유효 여행자

**입력**

- category
- urgency
- content
- areaText 선택

**카테고리**

- WEATHER: 날씨·운영 여부
- TRANSPORT: 교통·이동
- FOOD: 식당·카페
- PLACE: 대체 일정·장소
- SAFETY: 안전·현장 주의
- OTHER: 기타

**긴급도**

- NORMAL: 오늘 중 답변이 필요
- URGENT: 1시간 내 결정이 필요

**검증**

- content 20~1000자
- areaText 0~60자
- 사용자당 방별 열린 질문 최대 3개
- 질문 생성 시 `expiresAt = createdAt + 24h`
- SAFETY 카테고리에서는 112·119 등 공식 긴급 연락 수단을 우선 이용하라는 안내 문구 표시

**인수 조건**

- 생성 성공 후 DB에 저장되고 생성자에게 응답
- 해당 방 소켓 구독자에게 `room.question.created` 이벤트 전송
- 요청 재시도에 의한 중복 생성을 막기 위해 선택적으로 Idempotency-Key를 지원하거나 버튼 중복 제출을 차단

### QST-002 질문 조회 — P0

- 방 질문 목록은 상태와 cursor를 지원한다.
- 상세는 질문, 작성자 공개 카드, 모든 답변을 반환한다.
- 만료 여부는 서버 시각으로 판단한다.
- 만료된 OPEN 질문은 조회 응답에서 EXPIRED 파생 상태로 표시하고 새 답변을 거부한다.
- 질문 본문은 HTML로 해석하지 않고 텍스트로 렌더링한다.

### ANS-001 인증 참여자 답변 — P0

**작성 가능 사용자**: 해당 방의 유효 여행자 또는 현지인

**입력**

- content
- sourceType
- sourceUrl 선택

**근거 유형**

- ON_SITE_NOW: 지금 직접 확인
- RECENT_EXPERIENCE: 최근 경험
- OFFICIAL_SOURCE: 공식 정보 확인
- PERSONAL_OPINION: 개인 의견

**검증**

- content 10~1000자
- OFFICIAL_SOURCE 선택 시 https URL 필수
- 질문 상태가 OPEN이고 만료 전이어야 함
- 질문 작성자는 자신의 질문에 답변할 수 없음
- 한 참여자가 한 질문에 최대 3개 답변
- 답변자는 작성 당시의 여행자·현지인 인증 유형과 승인일 배지를 표시

**인수 조건**

- DB 저장 후 `room.answer.created` 전송
- 여행자 화면에 새로고침 없이 표시
- 동일 이벤트를 두 번 받아도 중복 렌더링하지 않음

### QST-003 답변 채택과 해결 — P0

- 질문 작성자는 하나의 답변을 채택할 수 있다.
- 채택 API는 트랜잭션으로 `acceptedAnswerId`, `status=RESOLVED`, `resolvedAt`을 함께 저장한다.
- 질문 작성자는 답변을 채택하지 않고 `해결됨`만 표시할 수 있다.
- 해결된 질문은 새 답변을 거부한다.
- 채택 후 변경·재오픈은 P0에서 지원하지 않는다.
- 변경 결과를 `room.question.updated`로 전송한다.

### QST-004 질문 삭제·수정 — 제외

- 일반 사용자의 질문·답변 수정과 삭제는 P0에서 제공하지 않는다.
- 잘못된 내용은 해결 처리 또는 신고를 이용한다.
- 관리자는 운영상 필요한 경우 soft delete할 수 있다.

---

## 8.6 실시간 통신

### RT-001 Socket.io 연결 — P0

- namespace 또는 path는 하나만 사용한다.
- 인증 쿠키로 소켓 사용자를 식별한다.
- 클라이언트의 room join 요청마다 서버가 방 접근 권한을 검사한다.
- 클라이언트가 임의 roomId를 보낸다고 권한을 신뢰하지 않는다.
- 모든 데이터 생성·수정은 REST API에서 수행한다.
- Socket은 DB 커밋 후 변경 사실을 브로드캐스트한다.

### RT-002 이벤트 규격 — P0

클라이언트 → 서버:

```text
room.join      { roomSlug }
room.leave     { roomSlug }
```

서버 → 클라이언트:

```text
room.question.created
room.message.created
room.answer.created
room.question.updated
room.content.removed
```

공통 필드:

```json
{
  "eventId": "evt_xxx",
  "roomSlug": "jeju",
  "occurredAt": "2026-07-30T12:00:00.000Z",
  "payload": {}
}
```

### RT-003 재연결과 데이터 일관성 — P0

- 소켓 연결이 끊기면 Socket.io 기본 재연결을 사용한다.
- 재연결 성공 후 클라이언트는 room에 재join한다.
- 재join 후 메시지·토픽 목록과 현재 상세 토픽을 REST로 재조회한다.
- 이벤트는 UI 즉시 갱신용이며 최종 진실은 DB·REST이다.
- 동일 entity id는 화면에 한 번만 존재하도록 캐시를 병합한다.

---

## 8.7 신고와 운영

### SAFE-001 신고 생성 — P0

신고 대상:

- QUESTION
- ANSWER
- USER

신고 사유:

- SPAM
- ABUSE
- FALSE_INFORMATION
- ADVERTISEMENT
- PRIVACY
- SAFETY
- OTHER

규칙:

- 로그인 사용자만 신고 가능
- 같은 사용자는 같은 대상에 한 번만 신고 가능
- 자신의 콘텐츠 신고 불가
- OTHER는 상세 사유 10~300자 필수
- 신고 생성만으로 콘텐츠를 자동 숨기지 않는다.

### ADM-002 신고 처리 — P0

- 관리자 목록은 상태·대상 유형 필터를 지원한다.
- 상세에서 원문, 신고자, 작성자, 사유를 확인한다.
- 처리 상태: PENDING, REVIEWED, RESOLVED, DISMISSED
- 관리자는 콘텐츠 유지, soft delete, 신고 기각을 선택한다.
- soft delete 시 질문·답변 조회 응답에 삭제 안내를 표시하고 소켓으로 제거 이벤트를 전송한다.
- 처리자와 처리 시각, 처리 메모를 저장한다.

### SAFE-002 기본 악용 방지 — P0

- 로그인: IP 기준 5회/분
- 질문 생성: 사용자 기준 5회/10분
- 답변 생성: 사용자 기준 20회/10분
- 신고 생성: 사용자 기준 10회/시간
- 텍스트는 서버에서 길이를 검증하고 HTML을 허용하지 않는다.
- 업로드 파일의 확장자가 아니라 MIME과 시그니처를 가능한 범위에서 확인한다.

---

## 9. 화면 명세

## 9.1 공통 디자인 원칙

- 모바일 390px 화면을 우선 설계한다.
- 데스크톱에서는 콘텐츠 최대 폭을 제한해 채팅 집중도를 유지한다.
- 기본 색상은 기존 브랜드의 마젠타·퍼플 계열을 쓰되, 배경과 본문은 중립색을 사용한다.
- 색상만으로 상태를 전달하지 않고 텍스트·아이콘을 함께 사용한다.
- 키보드 포커스, label, aria-live를 적용한다.
- 모든 비동기 화면은 loading, empty, error, retry 상태를 가진다.
- 모바일 하단 고정 영역이 입력창이나 버튼을 가리지 않아야 한다.

### 권장 토큰

```text
primary: #EC4899
secondary: #8B5CF6
success: #10B981
warning: #F59E0B
danger: #EF4444
page max width: 720px
admin max width: 1200px
```

## 9.2 라우트

```text
/                         랜딩
/auth/login               로그인
/auth/register            회원가입
/app                      사용자 홈
/app/verifications        내 인증 현황
/app/verifications/traveler 여행자 인증 신청
/app/verifications/local  현지인 인증 신청
/app/rooms/jeju           제주 방
/app/questions/[id]       질문 상세
/app/profile              내 프로필
/admin                    관리자 홈
/admin/verifications      인증 심사
/admin/reports            신고 관리
```

## 9.3 랜딩

필수 구성:

- 헤드라인: `여행이 틀어지는 순간, 지금 그곳을 아는 사람에게 묻다.`
- 3단계 설명: 인증 → 질문 → 여러 현지인 답변
- `시작하기` CTA
- 서비스가 긴급 구조·의료 상담을 대체하지 않는다는 간단한 안내

## 9.4 사용자 홈

- 사용자 인사와 인증 요약
- 제주 방 카드
- 방 접근 상태
- 여행자 인증 CTA
- 현지인 인증 CTA
- 심사 중이면 중복 CTA 대신 상태 표시

## 9.5 인증 신청 화면

공통:

- 한 화면에 모든 필드를 몰아넣지 말고 논리적 섹션으로 구분
- 파일 업로드 전 형식·용량 안내
- 제출 전 개인정보·증빙 사용 목적 동의
- 제출 중 버튼 비활성화
- 성공 후 상태 화면으로 이동

현지인:

- `현재 위치 확인` 버튼
- 성공 시 제주 내부 여부와 정확도만 표시
- 좌표 원문은 일반 UI에 표시하지 않음
- GPS 실패 원인별 안내: 권한 거부, 시간 초과, 정확도 부족, 지역 외부

## 9.6 제주 방

상단:

- 방 제목
- `인증된 여행자와 현지인만 참여` 문구
- 사용자의 현재 자격 배지
- 진행 중/해결됨 탭

본문:

- 질문 카드 피드
- 질문 카드 클릭 시 상세 이동
- 여행자에게만 `지금 질문하기` 버튼 노출
- 현지인에게는 `답변 가능한 질문` 안내

질문 작성:

- 카테고리 선택
- 긴급도 선택
- 지역·장소 텍스트 선택
- 본문
- 글자 수
- 제출

## 9.7 질문 상세

- 질문 카드 전체
- 질문자 인증 여행자 배지
- 상태·만료 안내
- 답변 목록
- 답변자 인증 현지인 배지
- 근거 유형 칩
- 공식 URL은 새 탭과 `noopener noreferrer`
- 질문 작성자에게 채택·해결 버튼
- 현지인에게 답변 폼
- 신고 메뉴
- 새 답변 도착 시 화면 낭독용 aria-live 또는 눈에 띄는 표시

## 9.8 관리자

- 좌측 메뉴 또는 상단 탭: 인증 심사, 신고
- 데스크톱 표 + 모바일 카드 대응
- 증빙은 명시적 버튼을 눌렀을 때만 로드
- 승인·반려·삭제 같은 파괴적 작업은 확인 단계 제공
- 완료 후 목록 상태를 즉시 갱신

---

## 10. 데이터 모델

아래는 논리 모델이며 Prisma 구현 시 필드명과 관계를 유지한다.

### 10.1 User

| 필드 | 타입 | 규칙 |
|---|---|---|
| id | String | cuid, PK |
| email | String | unique, normalized |
| passwordHash | String | 비공개 |
| nickname | String | unique |
| bio | String? | max 300 |
| role | USER/ADMIN | default USER |
| createdAt | DateTime | UTC |
| updatedAt | DateTime | UTC |

### 10.2 Destination

| 필드 | 타입 | 규칙 |
|---|---|---|
| id | String | PK |
| slug | String | unique |
| nameKo | String | 제주 |
| countryCode | String | KR |
| timezone | String | Asia/Seoul |
| centerLat/centerLng | Decimal | GPS 검증 |
| radiusKm | Int | 80 |
| isActive | Boolean | default true |

### 10.3 DestinationRoom

| 필드 | 타입 | 규칙 |
|---|---|---|
| id | String | PK |
| destinationId | String | unique FK |
| title | String | 방 제목 |
| description | String | 방 안내 |
| isOpen | Boolean | default true |

### 10.4 Verification

| 필드 | 타입 | 규칙 |
|---|---|---|
| id | String | PK |
| userId | String | FK |
| destinationId | String | FK |
| type | TRAVELER/LOCAL | 필수 |
| status | enum | default PENDING |
| startsAt | DateTime? | 여행자 필수 |
| endsAt | DateTime? | 여행자 필수 |
| localProofType | enum? | 현지인 필수 |
| proofObjectKey | String | 비공개 저장 키 |
| proofOriginalName | String | 표시용 |
| proofMimeType | String | 검증용 |
| gpsLat/gpsLng | Decimal? | 현지인 필수, 비공개 |
| gpsAccuracyMeters | Int? | 현지인 필수 |
| submittedNote | String? | max 300 |
| reviewedById | String? | 관리자 FK |
| reviewedAt | DateTime? | 처리 시각 |
| rejectionReason | String? | 반려 시 필수 |
| expiresAt | DateTime? | 현지인 승인 시 필수 |
| createdAt/updatedAt | DateTime | UTC |

인덱스:

- `(userId, destinationId, type, status)`
- `(status, createdAt)`
- `(destinationId, type, status)`

### 10.5 Question

| 필드 | 타입 | 규칙 |
|---|---|---|
| id | String | PK |
| roomId | String | FK |
| authorId | String | FK |
| category | enum | 필수 |
| urgency | enum | 필수 |
| content | String | 20~1000 |
| areaText | String? | max 60 |
| status | OPEN/RESOLVED/REMOVED | default OPEN |
| acceptedAnswerId | String? | unique FK |
| expiresAt | DateTime | createdAt + 24h |
| resolvedAt | DateTime? | 해결 시 |
| removedAt | DateTime? | soft delete |
| removedById | String? | 관리자 |
| createdAt/updatedAt | DateTime | UTC |

인덱스:

- `(roomId, status, createdAt)`
- `(authorId, status)`
- `(expiresAt)`

### 10.6 Answer

| 필드 | 타입 | 규칙 |
|---|---|---|
| id | String | PK |
| questionId | String | FK |
| authorId | String | FK |
| content | String | 10~1000 |
| sourceType | enum | 필수 |
| sourceUrl | String? | OFFICIAL_SOURCE 필수 |
| removedAt | DateTime? | soft delete |
| removedById | String? | 관리자 |
| createdAt/updatedAt | DateTime | UTC |

인덱스:

- `(questionId, createdAt)`
- `(authorId, createdAt)`

### 10.7 Report

| 필드 | 타입 | 규칙 |
|---|---|---|
| id | String | PK |
| reporterId | String | FK |
| targetType | enum | QUESTION/ANSWER/USER |
| targetId | String | 대상 id |
| reason | enum | 필수 |
| detail | String? | OTHER 시 필수 |
| status | enum | default PENDING |
| reviewedById | String? | 관리자 |
| reviewedAt | DateTime? | 처리 시 |
| resolutionNote | String? | 처리 메모 |
| createdAt/updatedAt | DateTime | UTC |

제약:

- `(reporterId, targetType, targetId)` unique
- 대상 존재 여부는 서비스에서 검증

---

## 11. API 명세

모든 경로는 `/api/v1` 기준이다.

## 11.1 Auth

```text
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me
```

### POST /auth/register

```json
{
  "email": "traveler@example.com",
  "password": "securepass123",
  "nickname": "제주여행자",
  "termsAccepted": true
}
```

### GET /auth/me 응답 요약

```json
{
  "data": {
    "id": "usr_1",
    "email": "traveler@example.com",
    "nickname": "제주여행자",
    "bio": null,
    "role": "USER",
    "activeAccess": {
      "jeju": ["TRAVELER"]
    }
  }
}
```

## 11.2 Profile

```text
GET    /profile/me
PATCH  /profile/me
GET    /users/:userId/public
```

## 11.3 Destination and Rooms

```text
GET    /destinations
GET    /rooms
GET    /rooms/:roomSlug
GET    /rooms/:roomSlug/questions?status=OPEN&cursor=&limit=20
POST   /rooms/:roomSlug/questions
```

## 11.4 Verification

파일 업로드와 신청을 하나의 multipart 요청으로 구현해도 되고, 업로드 엔드포인트를 분리해도 된다. 단, 비공개 저장·원자성·고아 파일 정리 조건을 지켜야 한다.

```text
GET    /verifications/me
POST   /verifications/traveler       multipart/form-data
POST   /verifications/local          multipart/form-data
```

여행자 필드:

```text
destinationId
startsAt
endsAt
note?
proofFile
```

현지인 필드:

```text
destinationId
latitude
longitude
accuracyMeters
capturedAt
localProofType
note
proofFile
```

## 11.5 Questions and Answers

```text
GET    /questions/:questionId
POST   /questions/:questionId/answers
PATCH  /questions/:questionId/accept-answer
PATCH  /questions/:questionId/resolve
```

### POST /rooms/jeju/questions

```json
{
  "category": "PLACE",
  "urgency": "URGENT",
  "areaText": "서귀포",
  "content": "강풍으로 예정했던 일정이 취소됐습니다. 지금 2시간 안에 갈 수 있는 실내 장소가 있을까요?"
}
```

### POST /questions/:id/answers

```json
{
  "sourceType": "ON_SITE_NOW",
  "content": "현재 서귀포 쪽은 비가 강해서 이동 시간을 넉넉히 잡는 편이 좋습니다. 이중섭미술관은 실내이고 인근 주차장도 이용 가능합니다.",
  "sourceUrl": null
}
```

### PATCH /questions/:id/accept-answer

```json
{
  "answerId": "ans_123"
}
```

## 11.6 Reports

```text
POST   /reports
```

```json
{
  "targetType": "ANSWER",
  "targetId": "ans_123",
  "reason": "FALSE_INFORMATION",
  "detail": "공식 운영 정보와 다릅니다."
}
```

## 11.7 Admin

```text
GET    /admin/verifications?status=PENDING&type=LOCAL
GET    /admin/verifications/:id
PATCH  /admin/verifications/:id/review
GET    /admin/reports?status=PENDING&targetType=ANSWER
GET    /admin/reports/:id
PATCH  /admin/reports/:id/review
GET    /admin/metrics                  P1
```

인증 심사 요청:

```json
{
  "decision": "APPROVE",
  "reason": null
}
```

또는

```json
{
  "decision": "REJECT",
  "reason": "여행 기간을 확인할 수 있는 증빙이 필요합니다."
}
```

---

## 12. 프론트엔드 상태와 데이터 갱신

- 서버 데이터는 TanStack Query 또는 동일 역할의 단일 라이브러리로 관리한다.
- 전역 Context에 서버 데이터 복제본을 저장하지 않는다.
- 인증 사용자, 방 목록, 질문 목록, 질문 상세에 일관된 query key를 사용한다.
- REST mutation 성공 응답을 즉시 캐시에 반영한다.
- Socket 이벤트는 관련 query cache를 갱신하거나 invalidate한다.
- 재연결 시 강제 refetch한다.
- 로딩 중 skeleton, 실패 시 재시도 버튼을 제공한다.
- mutation 중 중복 제출을 방지한다.

권장 query key:

```text
['me']
['verifications', 'me']
['rooms']
['questions', roomSlug, status]
['question', questionId]
['admin', 'verifications', filters]
['admin', 'reports', filters]
```

---

## 13. 보안·개인정보 요구사항

- JWT와 비밀번호를 localStorage에 저장하지 않는다.
- 인증 증빙은 public URL로 제공하지 않는다.
- 관리자 증빙 조회는 인증·권한 검사 후 짧은 서명 URL 또는 서버 스트리밍으로 제공한다.
- 증빙 객체 키에 이메일·닉네임·원본 파일명을 넣지 않는다.
- 업로드 파일명은 화면 표시용으로 escape한다.
- 정확한 GPS는 일반 사용자 응답에 포함하지 않는다.
- 관리자 API는 별도 AdminGuard를 적용한다.
- 모든 리소스 수정은 소유권과 상태를 함께 검사한다.
- Prisma migration 파일을 커밋한다.
- 프로덕션에서 `prisma db push`를 사용하지 않는다.
- CORS는 허용 origin을 명시하고 credentials를 제한한다.
- HTML 입력과 Markdown 렌더링은 P0에서 지원하지 않는다.
- 외부 공식 URL은 `https://`만 허용한다.
- CSP, frame-ancestors, nosniff 등 기본 보안 헤더를 설정한다.
- 증빙 보존 정책은 P0에서 자동 삭제까지 구현하지 않더라도 삭제 예정일과 운영 정책을 문서화한다.

---

## 14. 비기능 요구사항

### 14.1 성능

- 발표 환경 동시 접속 목표: 20명
- 일반 API P95 목표: 500ms 이하, 파일 업로드 제외
- 같은 리전 환경에서 Socket 이벤트 표시 목표: 1초 이내
- 질문 목록 최초 로드 20개, 무한 스크롤 또는 더보기
- N+1 쿼리를 방지한다.

### 14.2 신뢰성

- DB 저장 성공 후에만 소켓 이벤트를 보낸다.
- 질문 채택·해결은 트랜잭션으로 처리한다.
- 관리자 처리 API는 이미 처리된 상태를 조건에 포함해 중복 실행을 막는다.
- 애플리케이션 재시작 후에도 데이터가 유지된다.
- 프론트엔드 새로고침으로 상태가 복구된다.

### 14.3 접근성

- 모든 form control에 label
- 모든 버튼에 명확한 accessible name
- 키보드만으로 로그인, 질문, 답변, 심사 가능
- 포커스 표시 제거 금지
- 오류 메시지는 입력과 연결
- 색상 대비 WCAG AA 수준을 목표

### 14.4 관측성

- `GET /health/live`
- `GET /health/ready`에서 DB 연결 확인
- JSON 구조화 로그
- 로그 필드: timestamp, level, requestId, method, path, status, durationMs, userId 가능 시
- 예외 stack은 서버 로그에만 기록
- 프론트엔드 프로덕션 코드에 `console.log` 금지

---

## 15. 테스트 요구사항

### 15.1 원칙

- P0 흐름에 가짜 API·고정 mock 응답을 사용하지 않는다.
- 백엔드 통합 테스트는 실제 PostgreSQL 테스트 DB를 사용한다.
- E2E는 실제 NestJS, 실제 Next.js, 실제 Socket.io를 대상으로 한다.
- 외부 서비스가 없는 구조를 선택해 테스트 안정성을 높인다.
- UI 스냅샷만으로 기능을 검증하지 않는다.

### 15.2 최소 자동화 범위

Backend integration:

- 회원가입·로그인·me
- 인증 신청 검증
- 관리자 승인·반려
- 방 접근 허용·거부
- 질문 생성 권한
- 답변 생성 권한
- 답변 채택 트랜잭션
- 해결된 질문 답변 거부
- 중복 신고 거부
- 관리자 soft delete

Playwright E2E:

- 여행자 인증 신청 → 관리자 승인 → 방 입장
- 현지인 인증 신청 → 관리자 승인 → 방 입장
- 세 브라우저 context로 여행자 1명·현지인 2명 실시간 시나리오
- 새로고침·소켓 재연결 후 상태 복구
- 신고 → 관리자 처리
- 모바일 390x844과 데스크톱 1440x900 시각·동작 점검

### 15.3 커버리지 게이트

- 핵심 도메인 서비스 line/branch 90% 이상
- 백엔드 전체 line 75% 이상
- 프론트엔드 전체 수치보다 핵심 폼·권한·캐시 로직 테스트를 우선
- 모든 P0 인수 시나리오는 자동 또는 문서화된 수동 테스트로 100% 확인

---

## 16. 시드와 발표 데이터

`yarn db:seed` 또는 `yarn db:seed:demo`가 다음을 생성한다.

- 제주 Destination과 DestinationRoom
- 관리자 1명
- 승인된 여행자 1명
- 승인된 현지인 2명
- 선택적으로 해결된 질문 1개

규칙:

- 계정 비밀번호를 소스에 평문 하드코딩하지 않는다.
- 개발·데모 환경 변수로 입력하거나 seed 실행 시 생성한다.
- 프로덕션 seed는 명시적 플래그 없이는 실행되지 않는다.
- seed 데이터도 실제 테이블과 실제 권한 규칙을 사용한다.

발표 기본 시나리오:

```text
강풍으로 우도 일정이 취소된 제주 여행자가 서귀포에서 2시간 안에 갈 실내 대체 장소를 질문한다.
현지인 A는 지금 직접 확인한 정보를 답한다.
현지인 B는 공식 운영 정보 URL을 근거로 보완 답변한다.
여행자는 현지인 A의 답변을 채택하고 해결 처리한다.
```

---

## 17. 배포 요구사항

### 17.1 로컬

- PostgreSQL: Docker Compose
- API: localhost:3001
- Web: localhost:3000
- 개발 환경은 Secure cookie를 끌 수 있으나 httpOnly와 SameSite는 유지

### 17.2 발표 배포

권장 구성:

```text
Internet
  -> HTTPS Nginx
      -> /api/v1, /socket.io : NestJS
      -> /*                  : Next.js
NestJS/Next.js -> PostgreSQL
NestJS         -> private object storage
```

필수:

- 실제 도메인 또는 안정된 HTTPS 주소
- Geolocation API가 동작하는 HTTPS
- Nginx WebSocket upgrade 헤더
- DB migration deploy
- PM2 또는 동일한 프로세스 관리자
- `.env` 권한 제한
- CORS와 cookie domain 검증
- 발표 전 재부팅 후 자동 시작 확인

---

## 18. KPI 정의

이번 MVP에서 화면 구현 여부와 별개로 데이터로 계산 가능해야 한다.

- 질문 수
- 답변을 1개 이상 받은 질문 비율
- 최초 답변 시간: `min(answer.createdAt) - question.createdAt`
- 10분 이내 답변 비율
- 해결률: RESOLVED / 전체 유효 질문
- 채택률: acceptedAnswerId 존재 / RESOLVED
- 현지인별 답변 수

P0에서는 별도 이벤트 분석 플랫폼을 도입하지 않는다. DB 시각으로 계산한다.

---

## 19. Definition of Done

각 P0 기능은 다음을 모두 만족해야 완료다.

1. 실제 UI와 실제 API가 연결됨
2. 실제 PostgreSQL에 저장됨
3. 인증·권한·입력 검증이 서버에 존재함
4. 성공, 로딩, 빈 상태, 실패 상태가 있음
5. 모바일과 데스크톱에서 레이아웃이 깨지지 않음
6. 관련 자동 테스트가 통과함
7. lint, typecheck, build가 통과함
8. 콘솔 오류와 처리되지 않은 Promise rejection이 없음
9. 비밀값, 개인정보, 정확한 GPS가 노출되지 않음
10. API·스키마 변경이 문서와 migration에 반영됨
11. P0 경로에 TODO, 임시 return, fake delay, hardcoded user id가 없음
12. Codex가 변경 파일, 실행 명령, 테스트 결과, 남은 위험을 요약함

---

## 20. 일정 지연 시 컷라인

일정이 밀리면 아래 순서대로 제거한다.

1. 프로필 소개 수정
2. 관리자 필터 고도화
3. 공개 사용자 통계
4. 질문 이미지
5. 브라우저 알림
6. KPI 대시보드
7. GPS 정확도 UI 시각화

다음은 절대 제거하지 않는다.

- 여행자·현지인 인증과 관리자 승인
- 방 권한 검사
- 질문 작성
- 다수 현지인 답변
- 실시간 갱신
- 답변 채택·해결
- 실제 DB
- 배포 HTTPS
- 핵심 E2E 시나리오

---

## 21. 금지 구현 패턴

- 전체 앱을 한 번에 생성하고 검증 없이 종료
- 빈 함수, placeholder UI, `TODO: implement later`
- API 실패 시 성공으로 위장하는 fallback
- 프론트엔드에서만 권한 검사
- WebSocket 이벤트만 저장하고 DB를 거치지 않는 구조
- 컴포넌트 내부에 API URL 하드코딩
- `any`, `@ts-ignore`, 무분별한 type assertion
- 비밀값·기본 관리자 비밀번호 커밋
- Base64 이미지 DB 저장
- 프로덕션에서 `prisma db push`
- 한 파일에 controller, service, DTO, DB 로직을 모두 넣기
- 이유 없는 신규 패키지 추가
- P0와 무관한 리팩터링·디자인 실험

---

## 22. 최종 발표 검수 체크리스트

- [ ] 발표용 세 계정 로그인 가능
- [ ] 관리자 승인 흐름을 실제로 시연 가능
- [ ] GPS 권한 허용·거부 모두 안내됨
- [ ] 인증 여행자·현지인에게 메시지와 토픽 작성 UI가 보임
- [ ] 현지인만 답변 폼을 볼 수 있음
- [ ] 두 현지인 답변이 여행자에게 실시간 도착
- [ ] 인증 배지와 근거 유형 표시
- [ ] 채택 즉시 해결 상태 반영
- [ ] 새로고침 후 상태 유지
- [ ] 신고와 관리자 처리 가능
- [ ] 모바일 화면에서 키보드가 입력창을 가리지 않음
- [ ] 발표 주소 HTTPS
- [ ] 소켓 재연결 정상
- [ ] 서버 재시작 후 자동 복구
- [ ] 백업용 화면 녹화 준비
- [ ] 실제 비밀값·증빙이 발표 화면에 노출되지 않음
