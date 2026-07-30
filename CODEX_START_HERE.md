# Codex 시작 안내

이 패키지는 한 번의 거대한 요청으로 전체 앱을 만들기 위한 문서가 아니다. 저장소에 지속 규칙을 두고, 13개의 검토 가능한 작업으로 나눠 Codex가 계획·구현·검증하도록 설계했다.

---

## 1. 권장 시작 방법

1. 새 Git 저장소 `travelguide-v2`를 만든다.
2. 이 패키지의 `AGENTS.md`, `docs/`, `tasks/`를 저장소 루트에 복사한다.
3. Codex를 저장소 루트에서 연다.
4. 먼저 아래 초기 프롬프트를 실행한다.
5. T00이 끝난 뒤 T01~T12를 순서대로 실행한다.
6. 각 Task의 diff와 테스트 결과를 확인한 후 다음 Task로 넘어간다.

기존 MVP 저장소는 별도 폴더나 별도 저장소로 보관한다. Codex에 참고를 허용하더라도 새 저장소에 무차별 복사하지 못하게 한다.

---

## 2. 최초 프롬프트

아래를 그대로 Codex에 입력한다.

```text
Read AGENTS.md, docs/MVP_FUNCTIONAL_SPEC.md, docs/ARCHITECTURE.md,
docs/ACCEPTANCE_TESTS.md, docs/EXECUTION_PLAN.md, and tasks/T00_SCAFFOLD.md.

This is a new greenfield repository for TravelGuide v2. Do not write product
features yet. First inspect the current workspace, identify missing environment
assumptions, and create docs/plans/T00-scaffold.md with:
- exact repository tree to create;
- package versions and workspace configuration;
- commands and environment variables;
- Docker/PostgreSQL setup;
- lint, typecheck, test, build, and CI plan;
- files you will create;
- risks and how you will validate them.

After showing the plan, implement only T00. Run every command required by the
task. Do not move to T01. At the end, report changed files, commands and exact
results, tests not run, and remaining risks.
```

복잡한 초기 설계이므로 Plan mode와 높은 reasoning을 권장한다.

---

## 3. 이후 Task 실행 프롬프트

Task 파일명만 바꿔 아래 형식을 반복한다.

```text
Read AGENTS.md and the source-of-truth docs. Execute only tasks/T01_AUTH.md.

Before editing, inspect the current implementation and create the required plan
under docs/plans/. Verify that the previous task is complete. Implement the task
as a small reviewable vertical slice, run the specified tests and quality
commands, review your own diff against the acceptance IDs, and stop. Do not
start the next task or add out-of-scope features.
```

---

## 4. 작업 중 수정 요청 프롬프트

Codex 결과에 문제가 있을 때 전체 재작성을 요청하지 말고 다음처럼 좁혀서 요청한다.

```text
The T06 implementation violates RT-003: after reconnect, the client rejoins the
room but does not refetch the active question. Inspect only the socket provider,
question query hook, and related tests. Propose the smallest fix, add a regression
test for E2E-018, run the relevant commands, and report the diff. Do not refactor
unrelated query code.
```

---

## 5. 리뷰 전용 프롬프트

핵심 단계가 끝나면 별도 Codex 대화나 subagent에 다음을 요청한다.

```text
Review the current T03 implementation without making broad edits. Read AGENTS.md,
VER-001 through ADM-001, and E2E-004 through E2E-010. Focus on authorization,
private evidence exposure, upload/DB consistency, GPS validation, date boundaries,
and concurrent review races. Return findings ordered by severity with file and
line references, a reproduction or failing-test idea, and the smallest repair.
Do not comment on style unless it creates a correctness risk.
```

T06 리뷰 초점:

```text
Socket authentication, unauthorized room join, duplicate listeners, event order,
reconnect/refetch behavior, and broadcasting before DB commit.
```

T08 리뷰 초점:

```text
Question ownership, answer-question mismatch, transaction boundaries, resolved
state enforcement, report target validation, and private content leakage after
soft delete.
```

---

## 6. UI 검수 프롬프트

T07과 T10에서 브라우저·Playwright를 사용할 수 있을 때 입력한다.

```text
Open the running app in a real browser and verify the authenticated room flow at
390x844 and 1440x900. Use the source-of-truth UI requirements rather than inventing
new design. Test loading, empty, error, long text, two local answers, accepted
answer, and socket reconnect. Capture screenshots for your own review, fix only
observable layout or interaction defects, rerun Playwright, and report the exact
viewports and routes checked.
```

---

## 7. Codex가 질문했을 때 기본 답

문서에 이미 고정된 항목은 다음과 같이 답한다.

- 초기 지역: 제주 1개
- 플랫폼: 반응형 웹만
- 결제: 제외
- 1:1 매칭: 제외
- 인증: 여행자·현지인 모두 증빙 + 관리자 승인
- 현지인 GPS: 보조 신호
- 채팅: 질문 카드 + 답변 스레드
- 쓰기: REST
- 실시간: Socket broadcast
- 언어: 한국어
- 배포: 동일 HTTPS 도메인
- 디자인: 마젠타/퍼플을 절제해 사용

새로운 제품 결정을 묻는다면 구현을 멈추고 결정 내용을 `DECISIONS.md`에 기록한 뒤 진행한다.

---

## 8. 절대 한 번에 요청하지 않을 문장

```text
이 문서대로 전체 앱을 완성해줘.
```

이 요청은 변경 범위가 너무 커서 테스트 누락, 임의 가정, 과도한 리팩터링, 뒤늦은 통합 실패를 만들기 쉽다. 반드시 Task 단위로 실행한다.

---

## 9. 사람이 매 Task 후 확인할 것

- 실제 명령을 실행했는가
- 테스트 결과를 과장하지 않았는가
- 문서에 없는 기능을 추가하지 않았는가
- 데이터·권한 검사를 UI에만 두지 않았는가
- migration과 API contract가 일치하는가
- private 증빙·GPS가 response나 로그에 없는가
- 기존에 통과하던 테스트가 깨지지 않았는가
- 다음 Task 전에 working tree가 이해 가능한 상태인가

