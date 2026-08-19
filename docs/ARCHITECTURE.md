# 여쭈어 (여JJU) 아키텍처 결정서

- 상태: 2.5주 MVP 고정
- 원칙: 구조는 확장 가능하게, 기능은 최소로

---

## 1. 목표

이 아키텍처는 다음을 우선한다.

1. Codex가 저장소 구조와 실행 명령을 빠르게 이해할 것
2. 기능별 책임이 분리되어 한 작업의 변경 범위가 작을 것
3. 실제 PostgreSQL·Socket.io·파일 저장소를 사용해 발표에서 끝까지 동작할 것
4. 2.5주 안에 구현·테스트·배포가 가능할 것
5. 기존 1:1 매칭 코드에 종속되지 않을 것

마이크로서비스나 과도한 추상화는 사용하지 않는다. 하나의 NestJS API와 하나의 Next.js 웹으로 구성한 모듈러 모놀리스를 사용한다.

---

## 2. 고정 기술 스택

가능하면 아래 버전을 고정하고, 설치 충돌이 없는 한 임의 업그레이드하지 않는다.

```text
Runtime           Node.js 20.x
Package manager   Yarn 4.2.2, nodeLinker: node-modules
Frontend          Next.js 15.5.21, React 19.1.1, TypeScript 5.8.3
Styling           Tailwind CSS 3.4.1
Server state      TanStack Query 5.x
Backend           NestJS 11.x
ORM               Prisma 5.22.0
Database          PostgreSQL 16
Realtime          Socket.io 4.x
Validation        class-validator, class-transformer
Authentication    passport-jwt, cookie-parser, bcrypt
Testing           Jest, Supertest, Playwright
Infra             Docker Compose, Nginx, PM2
```

새 패키지가 필요하면 다음을 기록한다.

- 왜 표준 라이브러리로 해결할 수 없는지
- 번들·보안·호환성 영향
- 제거 가능한 대안

---

## 3. 저장소 구조

```text
travelguide-v2/
├── AGENTS.md
├── CODEX_START_HERE.md
├── README.md
├── package.json
├── yarn.lock
├── .yarnrc.yml
├── .env.example
├── docker-compose.yml
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   └── tests/
│   └── api/
│       ├── src/
│       │   ├── common/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── destinations/
│       │   ├── verifications/
│       │   ├── rooms/
│       │   ├── messages/
│       │   ├── questions/
│       │   ├── reports/
│       │   ├── admin/
│       │   ├── storage/
│       │   ├── realtime/
│       │   └── prisma/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       └── test/
├── packages/
│   ├── contracts/
│   │   └── src/
│   └── config/
│       └── src/
├── docs/
│   ├── MVP_FUNCTIONAL_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── ACCEPTANCE_TESTS.md
│   ├── EXECUTION_PLAN.md
│   ├── DECISIONS.md
│   └── plans/
└── tasks/
```

### 3.1 디렉터리 책임

- `apps/web`: 렌더링, 폼, React Query 캐시, Socket 구독, 접근성
- `apps/api`: 인증, 권한, 도메인 규칙, DB, 파일 저장, 실시간 이벤트
- `packages/contracts`: enum, API 공개 타입, 공통 상수. DB 내부 타입은 두지 않는다.
- `packages/config`: ESLint·TypeScript 설정 공유
- `docs/plans`: Codex가 작업 전 작성하는 실행 계획

---

## 4. 백엔드 모듈 경계

### auth

- register/login/logout/me
- JWT 생성·검증
- cookie 설정
- `CurrentUser` decorator
- `JwtAuthGuard`

### users

- 내 프로필
- 공개 사용자 카드
- 사용자 조회 유틸리티

### destinations

- 제주 seed 조회
- destination/room 메타데이터
- 거리 계산 유틸리티

### verifications

- 여행자·현지인 신청
- 상태 조회
- 유효 자격 판정
- GPS 반경 검사
- 증빙 저장 연계

### rooms

- 방 목록·상세
- `RoomAccessService`
- 방의 메시지·토픽 접근 권한

### messages

- 최신 메시지와 이전 cursor 페이지 조회
- 인증 참여자 메시지 생성
- 작성 시점 참여자 배지 보존

### questions

- 구조화 토픽 생성·조회
- 본인 메시지의 1회 토픽 전환
- 답변 생성
- 채택·해결
- 상태·만료 판정

### reports

- 신고 생성
- 대상 검증

### admin

- 인증 심사
- 신고 심사·콘텐츠 soft delete
- 관리자 KPI P1

### storage

- `StorageService` interface
- `LocalStorageAdapter` 개발·테스트
- `S3StorageAdapter` 배포
- admin-only evidence access

### realtime

- Socket gateway
- cookie auth adapter
- room join authorization
- REST 서비스가 호출하는 `RealtimePublisher`

### common

- global validation pipe
- exception filter
- request id middleware
- rate limiting
- logger
- pagination helpers

---

## 5. 의존성 방향

```text
Controller/Gateway
  -> Application Service
      -> PrismaService / StorageService / RealtimePublisher
```

규칙:

- Controller는 입력 변환과 응답만 담당한다.
- 도메인 규칙은 Service에 둔다.
- 다른 모듈의 Prisma 모델을 직접 조작하지 않고 공개 Service를 우선 사용한다.
- `RoomAccessService`는 REST와 Socket에서 공유한다.
- `RealtimePublisher`는 저장 성공 이후 호출한다.
- Socket Gateway에서 DB 쓰기 로직을 중복 구현하지 않는다.
- 작은 MVP이므로 별도 repository layer는 기본적으로 만들지 않는다. 같은 쿼리가 반복되거나 교체 필요성이 생길 때만 도입한다.

---

## 6. 인증 구조

### 6.1 쿠키

```text
name      tg_access
httpOnly  true
sameSite  lax
secure    production only
path      /
maxAge    24 hours
```

### 6.2 JWT payload

```json
{
  "sub": "userId",
  "role": "USER",
  "iat": 0,
  "exp": 0
}
```

- 이메일·닉네임·인증 상태를 JWT에 넣지 않는다.
- 인증 상태는 요청 시 DB에서 판정한다.
- 관리자 role 변경 후 기존 토큰이 남을 수 있으므로 AdminGuard는 DB user role을 확인하거나 짧은 만료를 사용한다.
- P0에서는 refresh token을 구현하지 않는다.

### 6.3 WebSocket

- handshake의 cookie를 파싱해 같은 JWT 전략을 사용한다.
- 연결 인증과 room join 권한은 별개로 검사한다.
- 인증 만료 후 재연결이 실패하면 UI는 로그인 만료 상태를 표시한다.

### 6.4 계정 복구와 외부 인증

- 비밀번호 재설정 원문 토큰은 메일에만 전달하고 DB에는 SHA-256 해시만 저장한다.
- 비밀번호 변경 시 `sessionVersion`을 증가시키며 JWT·REST·Socket 인증에서 동일 값을 검사한다.
- 소셜 계정은 `(provider, providerUserId)`로 식별하고 제공자가 검증한 이메일로만 기존 계정과 연결한다.
- OAuth state는 JWT로 서명하고 제공자·nonce·내부 next 경로·10분 만료를 포함한다.
- Google·Kakao는 공식 userinfo, Apple은 JWKS로 검증한 ID token만 신뢰한다.
- 재설정 메일은 Resend HTTPS API를 사용하며 API 키·토큰·Apple 개인 키를 로그에 남기지 않는다.

---

## 7. 데이터 일관성

### 7.1 쓰기 흐름

```text
Client
  -> REST mutation
      -> validate auth and state
      -> DB transaction if needed
      -> commit
      -> publish Socket event
      -> HTTP response
```

Socket 이벤트 발행 실패로 DB 쓰기를 롤백하지 않는다. 이벤트 실패는 로그로 남기고, 클라이언트는 재연결 후 REST refetch로 복구한다.

### 7.2 채택 트랜잭션

답변 채택은 다음 조건을 같은 트랜잭션에서 검사·수정한다.

- question.authorId == currentUser.id
- question.status == OPEN
- question.expiresAt > now
- answer.questionId == question.id
- answer.removedAt == null

성공 시:

- acceptedAnswerId
- status RESOLVED
- resolvedAt
- updatedAt

### 7.3 관리자 심사

`updateMany where id=? and status=PENDING` 방식 또는 transaction을 이용해 동일 신청의 중복 처리 경쟁을 막는다. 갱신 row count가 0이면 `VERIFICATION_ALREADY_REVIEWED`를 반환한다.

---

## 8. 실시간 설계

### 8.1 룸 키

내부 Socket room:

```text
destination-room:{destinationRoomId}
```

클라이언트는 `roomSlug`만 보내고 서버가 id를 해석한다.

### 8.2 이벤트 발행 위치

- 질문 생성 서비스
- 메시지 생성 서비스
- 답변 생성 서비스
- 질문 채택·해결 서비스
- 관리자 콘텐츠 숨김 서비스

### 8.3 이벤트 payload

HTTP 응답 DTO와 동일한 공개 DTO를 사용한다. Prisma raw object를 그대로 보내지 않는다.

### 8.4 중복·순서

- entity id로 중복 제거
- `createdAt`과 id를 사용해 안정 정렬
- 이벤트 순서를 절대적으로 가정하지 않는다.
- 상태 업데이트 이벤트가 생성 이벤트보다 먼저 도착해도 refetch로 복구 가능해야 한다.

---

## 9. 파일 저장

### 9.1 StorageService

```ts
interface StorageService {
  putPrivate(input: PrivateUpload): Promise<StoredObject>;
  getPrivateDownload(objectKey: string, expiresInSeconds: number): Promise<string>;
  delete(objectKey: string): Promise<void>;
}
```

### 9.2 개발·테스트

- 로컬 비공개 디렉터리 사용
- 정적 public 경로로 노출하지 않음
- admin endpoint가 인증 후 파일을 stream하거나 임시 URL 제공

### 9.3 프로덕션

- private S3 bucket
- public access block
- 서버 IAM 최소 권한
- object key: `verification/{userId}/{uuid}`
- 원본 파일명은 object key에 포함하지 않음

### 9.4 실패 처리

- DB 생성 전에 파일 저장이 성공하고 DB가 실패하면 catch에서 파일 삭제 시도
- 파일 저장 실패 시 DB 신청을 생성하지 않음
- 정리 실패는 warning 로그와 object key를 남겨 수동 정리 가능하게 함

---

## 10. 프론트엔드 구조

### 10.1 App Router

- `(public)`: signed-out service home, auth
- `(app)`: 인증된 사용자 layout
- `admin`: 관리자 layout

### 10.2 feature 폴더 예시

```text
features/
├── auth/
├── profile/
├── verifications/
├── rooms/
├── questions/
├── reports/
└── admin/
```

각 feature는 필요할 때 다음을 가진다.

```text
components/
api.ts
hooks.ts
queries.ts
types.ts
constants.ts
utils.ts
index.ts
```

파일이 작고 한 곳에서만 쓰이면 불필요하게 모두 분리하지 않는다.

### 10.3 API client

- relative `/api/v1`
- `credentials: 'include'`
- JSON과 multipart 처리
- Problem Details를 typed error로 변환
- 401 시 로그인 만료 처리
- component에서 직접 fetch하지 않음

### 10.4 React Query

- auth/me를 최상위 authenticated layout에서 조회
- mutation success와 Socket event가 같은 query key를 갱신
- staleTime은 짧게 설정하되 Socket이 진실의 유일한 원천이 되지 않게 함

### 10.5 Socket provider

- 인증 layout에 하나만 생성
- room 페이지 입장 시 join, 이탈 시 leave
- reconnect 시 현재 room 재join
- 이벤트 listener를 중복 등록하지 않음
- cleanup 테스트 포함

---

## 11. 로컬 개발 명령

루트 package.json이 최소 다음을 제공한다.

```bash
yarn dev
yarn dev:web
yarn dev:api
yarn db:up
yarn db:down
yarn db:migrate
yarn db:seed
yarn lint
yarn typecheck
yarn test
yarn test:integration
yarn test:e2e
yarn build
yarn verify
```

`yarn dev`는 웹과 API를 병렬 실행한다.

---

## 12. 환경 변수

예시만 커밋한다.

```bash
NODE_ENV=development
DATABASE_URL=postgresql://travelguide:travelguide@localhost:5432/travelguide
JWT_SECRET=change-me
JWT_EXPIRES_IN=24h
WEB_ORIGIN=http://localhost:3000
API_PORT=3001
STORAGE_DRIVER=local
LOCAL_STORAGE_DIR=.data/private-uploads
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
RESEND_API_KEY=
EMAIL_FROM=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
KAKAO_OAUTH_CLIENT_ID=
KAKAO_OAUTH_CLIENT_SECRET=
APPLE_OAUTH_CLIENT_ID=
APPLE_OAUTH_TEAM_ID=
APPLE_OAUTH_KEY_ID=
APPLE_OAUTH_PRIVATE_KEY=
OAUTH_TOKEN_ENCRYPTION_KEY=
```

규칙:

- 앱 시작 시 필수 환경 변수를 검증하고 누락 시 즉시 종료
- `JWT_SECRET=change-me`는 production에서 거부
- 로그에 환경 변수 값을 출력하지 않음
- Apple 로그인을 설정하면 `OAUTH_TOKEN_ENCRYPTION_KEY`도 64자리 hex로 함께 설정하며 refresh token은 AES-256-GCM으로 암호화

### 12.1 계정 삭제 경계

- `DELETE /auth/account`는 JWT 인증 뒤 비밀번호 계정의 현재 비밀번호와 정확한 확인 문구를 검증한다.
- 사용자의 콘텐츠 ID와 연쇄 삭제될 답변·댓글 ID를 같은 Prisma 트랜잭션에서 수집하고, 대상 신고·동일 이메일 사전예약·사용자를 삭제한다.
- 질문·게시물 cascade가 다른 작성자의 답변·댓글을 제거할 수 있으므로 해당 이미지 키와 신고 대상도 삭제 전 수집한다.
- 커밋 후 공유 `PrivateObjectLifecycleService`를 통해 아바타, 증빙, 질문·답변·채팅 파일을 중복 없이 정리한다.
- Apple refresh token 폐기는 로컬 자격증명 삭제 전에 수행한다. 원격 제공자와 PostgreSQL은 원자적 트랜잭션을 공유하지 않으므로 실패 시 로컬 삭제를 시작하지 않고 재시도 가능 상태로 둔다.

---

## 13. 배포 구조

### 13.1 프로세스

```text
travelguide-web  Next.js production server
travelguide-api  NestJS production server
```

### 13.2 Nginx

- `/api/v1/` -> api
- `/socket.io/` -> api with upgrade headers
- `/` -> web
- HTTPS redirect
- upload body size 6 MB 이상
- security headers

### 13.3 배포 순서

1. backup or snapshot
2. code update
3. install with frozen lockfile
4. `prisma migrate deploy`
5. build
6. restart API and Web
7. health check
8. login and socket smoke test

---

## 14. 품질 게이트

PR 또는 작업 종료 전에:

```bash
yarn lint
yarn typecheck
yarn test
yarn build
```

DB·권한·Socket 변경은 추가로:

```bash
yarn test:integration
yarn test:e2e
```

Codex는 명령을 실제 실행하고 성공 여부를 보고한다. 실행하지 못했다면 이유와 재현 명령을 명확히 남긴다.

---

## 15. 의도적으로 하지 않는 아키텍처

- NestJS와 Next.js를 하나의 런타임으로 합치지 않음
- GraphQL 사용 안 함
- Redis 사용 안 함
- 별도 notification service 사용 안 함
- background queue 사용 안 함
- PostGIS 사용 안 함
- event bus 사용 안 함
- design system package 분리 안 함
- 모든 도메인에 repository/interface를 억지로 만들지 않음
- CQRS, DDD aggregate를 형식적으로 도입하지 않음

이 선택은 기술 부채가 아니라 2.5주 MVP의 의도적 단순화다.
