# 여쭈어 (Yeojju / 여JJU) 인수 테스트 명세

- 목적: Codex와 사람이 같은 기준으로 P0 완료 여부를 판단한다.
- 테스트 방식: 실제 PostgreSQL, 실제 API, 실제 Socket.io, 실제 브라우저
- 금지: P0 E2E에서 네트워크 응답을 고정 mock으로 대체

---

## 1. 테스트 계정과 환경

테스트는 매 실행마다 격리된 DB를 사용한다.

권장 역할:

- `traveler`: 일반 사용자
- `localA`: 일반 사용자
- `localB`: 일반 사용자
- `unverified`: 일반 사용자
- `admin`: 관리자

날짜 기반 인증은 테스트 시각을 기준으로 유효하도록 fixture를 만든다. 프로덕션 코드에 테스트 전용 우회 분기를 넣지 않는다.

---

## 2. 필수 E2E 시나리오

### E2E-001 회원가입과 로그인

```gherkin
Given 가입되지 않은 이메일이 있다
When 사용자가 유효한 이메일, 비밀번호, 닉네임으로 회원가입한다
Then 회원가입이 성공한다
And 인증 쿠키가 설정된다
And /auth/me에서 자신의 공개 가능한 정보만 조회된다
And 응답에 passwordHash가 없다

When 사용자가 로그아웃한다
Then 인증 쿠키가 제거된다
And 보호된 API는 401을 반환한다
```

### E2E-002 중복 회원가입 방지

```gherkin
Given 이미 가입된 이메일과 닉네임이 있다
When 같은 이메일로 회원가입한다
Then 409와 EMAIL_ALREADY_EXISTS를 반환한다

When 같은 닉네임으로 회원가입한다
Then 409와 NICKNAME_ALREADY_EXISTS를 반환한다
```

### E2E-003 미인증 사용자 방 잠금

```gherkin
Given 로그인했지만 유효한 인증이 없는 사용자가 있다
When 방 목록을 조회한다
Then 제주 방 메타데이터와 잠금 상태를 볼 수 있다

When 제주 방 질문 목록을 조회한다
Then 403과 ROOM_ACCESS_DENIED를 반환한다

When Socket room.join을 요청한다
Then join이 거부된다
```

### E2E-004 여행자 인증 신청

```gherkin
Given 로그인한 미인증 사용자가 있다
When 유효한 여행 기간과 JPEG 증빙을 제출한다
Then PENDING 여행자 인증이 생성된다
And 사용자는 상태 조회에서 심사 중을 본다
And 아직 제주 방 콘텐츠에 접근할 수 없다
```

### E2E-005 여행자 인증 파일 검증

```gherkin
Given 로그인한 사용자가 있다
When 5MB를 초과한 파일을 제출한다
Then 400과 UPLOAD_TOO_LARGE를 반환한다
And 인증 레코드가 생성되지 않는다

When 실행 파일 MIME을 제출한다
Then 400과 UPLOAD_TYPE_NOT_ALLOWED를 반환한다
And 파일이 공개 경로에 남지 않는다
```

### E2E-006 현지인 GPS 검증

```gherkin
Given 로그인한 미인증 사용자가 있다
When 제주 반경 내부의 좌표와 정확도 100m, 유효한 증빙을 제출한다
Then PENDING 현지인 인증이 생성된다

When 정확도 300m인 좌표를 제출한다
Then 400과 GPS_ACCURACY_TOO_LOW를 반환한다

When 제주 반경 밖 좌표를 제출한다
Then 400과 OUTSIDE_DESTINATION_AREA를 반환한다
```

### E2E-007 관리자 여행자 승인

```gherkin
Given PENDING 여행자 인증이 있다
And 관리자가 로그인했다
When 관리자가 신청 상세와 비공개 증빙을 조회한다
Then 증빙을 볼 수 있다
And 일반 사용자는 같은 증빙 endpoint에 접근할 수 없다

When 관리자가 승인한다
Then 인증 상태가 APPROVED가 된다
And reviewedById와 reviewedAt이 기록된다
And 여행 기간이 현재 유효하면 제주 방 접근이 허용된다
```

### E2E-008 관리자 현지인 승인과 만료

```gherkin
Given PENDING 현지인 인증이 있다
When 관리자가 승인한다
Then 인증 상태가 APPROVED가 된다
And expiresAt이 승인일로부터 90일로 설정된다
And 사용자는 제주 방에서 답변 권한을 가진다
```

### E2E-009 관리자 반려

```gherkin
Given PENDING 인증이 있다
When 관리자가 반려 사유 없이 반려한다
Then 400을 반환한다

When 관리자가 10자 이상의 사유로 반려한다
Then 상태가 REJECTED가 된다
And 사용자 상태 화면에 반려 사유가 보인다
And 사용자는 새 신청을 제출할 수 있다
```

### E2E-010 중복 심사 경쟁 방지

```gherkin
Given 하나의 PENDING 인증이 있다
When 두 관리자 요청이 거의 동시에 승인과 반려를 시도한다
Then 하나만 성공한다
And 다른 요청은 VERIFICATION_ALREADY_REVIEWED를 반환한다
And 최종 상태와 reviewer 정보가 일관된다
```

### E2E-011 여행자의 질문 작성

```gherkin
Given 현재 유효한 제주 여행자 인증 사용자가 있다
When 카테고리 PLACE, 긴급도 URGENT, 유효한 본문으로 질문을 작성한다
Then OPEN 질문이 DB에 저장된다
And expiresAt이 생성 시각 24시간 후다
And 방 피드에 질문이 표시된다
And 인증 여행자 배지가 표시된다
```

### E2E-012 질문 작성 권한 거부

```gherkin
Given 제주 현지인 인증만 가진 사용자가 있다
When 질문을 작성한다
Then 403과 TRAVELER_VERIFICATION_REQUIRED를 반환한다

Given 여행 기간이 종료되고 24시간이 지난 여행자 인증 사용자가 있다
When 질문을 작성한다
Then 403을 반환한다
```

### E2E-013 열린 질문 최대 개수

```gherkin
Given 같은 사용자가 제주 방에 OPEN 질문 3개를 가지고 있다
When 네 번째 질문을 작성한다
Then 409와 OPEN_QUESTION_LIMIT_REACHED를 반환한다
```

### E2E-014 현지인의 답변 작성

```gherkin
Given 유효한 제주 현지인 인증 사용자가 있다
And OPEN이며 만료되지 않은 질문이 있다
When sourceType ON_SITE_NOW와 유효한 본문으로 답변한다
Then 답변이 DB에 저장된다
And 답변에 인증 현지인 배지 정보가 포함된다
And 질문 답변 수가 증가한다
```

### E2E-015 공식 출처 URL 검증

```gherkin
Given 유효한 현지인이 있다
When OFFICIAL_SOURCE를 선택하고 URL을 생략한다
Then 400과 SOURCE_URL_REQUIRED를 반환한다

When http URL을 제출한다
Then 400과 INVALID_SOURCE_URL을 반환한다

When https URL을 제출한다
Then 답변 작성이 성공한다
```

### E2E-016 자기 질문 답변 금지

```gherkin
Given 한 사용자가 유효한 여행자 인증과 현지인 인증을 모두 가진다
And 자신이 작성한 OPEN 질문이 있다
When 같은 사용자가 답변한다
Then 403과 CANNOT_ANSWER_OWN_QUESTION을 반환한다
```

### E2E-017 세 브라우저 실시간 답변

```gherkin
Given traveler, localA, localB가 각자 별도 browser context로 로그인했다
And 세 사용자가 제주 방에 입장했다
When traveler가 REST로 질문을 작성한다
Then localA와 localB 화면에 새 질문이 새로고침 없이 나타난다

When localA가 첫 답변을 작성한다
Then traveler와 localB 화면에 1초 내 답변이 나타난다

When localB가 두 번째 답변을 작성한다
Then traveler와 localA 화면에 1초 내 답변이 나타난다
And 각 답변은 한 번만 렌더링된다
```

### E2E-018 소켓 재연결 복구

```gherkin
Given traveler가 질문 상세를 보고 있다
When 네트워크를 끊은 동안 localA가 답변을 작성한다
And traveler의 네트워크를 복구한다
Then Socket이 재연결되고 room에 재join한다
And REST refetch 후 누락된 답변이 표시된다
And 중복 답변이 없다
```

### E2E-018A 인증 참여자 방 메시지

```gherkin
Given 유효한 여행자와 현지인이 제주 방에 입장했다
When 여행자가 일반 메시지를 작성한다
Then 메시지가 DB에 plain text로 저장된다
And 두 사용자 화면에 room.message.created 이벤트가 한 번 전달된다

When 현지인이 일반 메시지를 작성한다
Then 메시지에는 인증 현지인 공개 배지만 포함된다
And 이메일, 증빙, GPS는 응답과 이벤트에 포함되지 않는다
```

### E2E-018B 메시지를 토픽으로 전환

```gherkin
Given 유효한 참여자가 자신의 제주 방 메시지를 작성했다
When category와 urgency를 지정해 메시지를 토픽으로 전환한다
Then 원문을 본문으로 가진 OPEN 토픽이 하나 생성된다
And room.question.created 이벤트가 전달된다

When 같은 메시지를 다시 전환한다
Then 409와 MESSAGE_ALREADY_PROMOTED를 반환한다

When 다른 사용자 또는 다른 방 메시지를 전환한다
Then 토픽이 생성되지 않는다
```

### E2E-019 답변 채택과 해결

```gherkin
Given traveler 자신의 OPEN 질문에 localA와 localB 답변이 있다
When traveler가 localA 답변을 채택한다
Then acceptedAnswerId가 localA 답변 id가 된다
And 질문 status가 RESOLVED가 된다
And resolvedAt이 기록된다
And 모든 방 참가자 화면에 상태가 실시간 반영된다

When localB가 추가 답변을 작성한다
Then 409와 QUESTION_NOT_OPEN을 반환한다
```

### E2E-020 타인 질문 채택 금지

```gherkin
Given 다른 여행자가 작성한 OPEN 질문이 있다
When 현재 사용자가 답변을 채택하려 한다
Then 403과 NOT_QUESTION_OWNER를 반환한다
```

### E2E-021 답변 없이 해결

```gherkin
Given traveler 자신의 OPEN 질문이 있다
When traveler가 해결됨으로 표시한다
Then status가 RESOLVED가 된다
And acceptedAnswerId는 null이다
And 새 답변은 거부된다
```

### E2E-022 만료 질문

```gherkin
Given expiresAt이 지난 OPEN 질문이 있다
When 질문 목록과 상세를 조회한다
Then 사용자에게 EXPIRED 상태로 보인다

When 현지인이 답변하려 한다
Then 409와 QUESTION_EXPIRED를 반환한다
```

### E2E-023 신고 생성

```gherkin
Given 로그인한 사용자가 다른 사람의 답변을 보고 있다
When FALSE_INFORMATION 사유로 신고한다
Then PENDING 신고가 생성된다

When 같은 대상을 다시 신고한다
Then 409와 REPORT_ALREADY_EXISTS를 반환한다
```

### E2E-024 자신의 콘텐츠 신고 금지

```gherkin
Given 사용자가 자신의 질문을 보고 있다
When 자신의 질문을 신고한다
Then 400과 CANNOT_REPORT_OWN_CONTENT를 반환한다
```

### E2E-025 관리자 신고 처리와 soft delete

```gherkin
Given PENDING 답변 신고가 있다
When 관리자가 콘텐츠 숨김으로 처리한다
Then report status가 RESOLVED가 된다
And answer.removedAt이 기록된다
And 일반 사용자 응답은 원문 대신 삭제 안내를 반환한다
And 방 구독자에게 room.content.removed가 전송된다
```

### E2E-026 일반 사용자 관리자 API 차단

```gherkin
Given 일반 사용자가 로그인했다
When /admin/verifications 또는 /admin/reports를 호출한다
Then 403과 ADMIN_REQUIRED를 반환한다
```

### E2E-027 모바일 핵심 흐름

```gherkin
Given viewport가 390x844다
When 사용자가 로그인, 방 입장, 질문 작성, 답변 확인, 채택을 수행한다
Then 가로 스크롤이 없다
And 하단 버튼과 입력 필드가 브라우저 UI와 겹치지 않는다
And 키보드 포커스만으로 핵심 동작이 가능하다
```

### E2E-028 배포 스모크 테스트

```gherkin
Given 프로덕션과 동일한 HTTPS 배포 환경이 있다
When /health/live를 호출한다
Then 200을 반환한다

When /health/ready를 호출한다
Then DB 연결이 정상일 때 200을 반환한다

When 두 브라우저가 Socket.io로 제주 방에 연결한다
Then WebSocket upgrade가 성공한다
And 질문과 답변 이벤트가 전달된다
```

---

## 3. 백엔드 통합 테스트 세부 목록

| ID | 대상 | 핵심 assertion |
|---|---|---|
| INT-AUTH-01 | register | normalize, hash, unique, cookie |
| INT-AUTH-02 | login | wrong email/password code 분리 여부는 보안 정책에 따라 일관 |
| INT-VER-01 | traveler apply | date rule, pending uniqueness |
| INT-VER-02 | local apply | distance, accuracy, file rule |
| INT-VER-03 | review | state transition, reviewer audit |
| INT-ROOM-01 | access | traveler window, local expiry, admin bypass |
| INT-QST-01 | create | role, max open, expiry |
| INT-ANS-01 | answer | role, own question, source URL |
| INT-QST-02 | accept | transaction, ownership, same question |
| INT-QST-03 | resolve | state transition, answer rejection afterward |
| INT-REP-01 | report | target exists, unique, own content |
| INT-ADM-01 | remove | soft delete, public DTO redaction |

---

## 4. 수동 발표 검수

자동 테스트 외에 발표 전 사람이 확인한다.

- [ ] 실제 휴대전화 Safari/Chrome에서 GPS 권한 동작
- [ ] HTTPS에서 cookie와 Socket 동작
- [ ] 관리자 증빙 URL이 일반 사용자에게 열리지 않음
- [ ] 긴 질문과 긴 닉네임에서 레이아웃 유지
- [ ] 빈 피드와 API 오류 화면
- [ ] 소켓 끊김 배너와 재연결
- [ ] 발표용 계정과 seed가 production 데이터와 분리됨
- [ ] 서버 로그에 JWT, 파일 URL, 좌표가 없음
- [ ] 발표 화면에 개인 증빙 원본이 노출되지 않음

---

## 5. 테스트 종료 보고 형식

Codex는 각 작업 종료 시 다음 형식으로 보고한다.

```text
Implemented:
- ...

Commands run:
- yarn ... -> PASS/FAIL

Acceptance tests covered:
- E2E-...
- INT-...

Not run:
- 명령과 이유

Risks / follow-ups:
- ...
```
