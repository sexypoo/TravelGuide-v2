# 여쭈어 (Yeojju / 여JJU)

여행지의 지금을 인증된 여행자와 현지인에게 묻는 실시간 도움방입니다.
저장소와 기술 식별자는 안정성을 위해 `TravelGuide v2`를 유지합니다.

## 파일

- `AGENTS.md`: Codex가 매 작업마다 자동으로 따라야 할 짧은 저장소 규칙
- `CODEX_START_HERE.md`: 최초 프롬프트, 작업·리뷰·UI 검수 방법
- `docs/MVP_FUNCTIONAL_SPEC.md`: 제품 기능과 인수 조건의 최종 기준
- `docs/ARCHITECTURE.md`: 저장소, 모듈, 인증, 실시간, 배포 결정
- `docs/ACCEPTANCE_TESTS.md`: 실제 DB·Socket·브라우저 인수 시나리오
- `docs/EXECUTION_PLAN.md`: 13일 일정과 Task 완료 조건
- `docs/DECISIONS.md`: 고정 결정과 신규 ADR 기록
- `docs/DAILY_STATUS.md`: 일일 진행 기록 템플릿
- `tasks/T00~T12`: Codex에 순서대로 넣을 작업 명세

## 사용 순서

1. 새 `travelguide-v2` Git 저장소를 만든다.
2. 이 폴더 내용을 저장소 루트에 복사한다.
3. `CODEX_START_HERE.md`의 최초 프롬프트로 T00을 실행한다.
4. 각 Task 완료 후 diff와 테스트 결과를 검토한다.
5. T01부터 T12까지 순서대로 진행한다.

## 핵심 컷라인

- 제주 1개 지역
- 반응형 웹만
- 증빙·관리자 승인 기반 여행자/현지인 인증
- 질문 카드와 답변 스레드
- REST 저장 + Socket.io 실시간 갱신
- 답변 채택·해결
- 신고·관리자 처리
- 실제 PostgreSQL과 HTTPS 배포

1:1 매칭, 결제, Flutter, AI, 다국어, 지도는 제외한다.
