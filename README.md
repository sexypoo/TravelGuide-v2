# 여쭈어 (여JJU)

여행지의 지금을 인증된 여행자와 현지인에게 묻는 실시간 도움방입니다.
저장소와 기술 식별자는 안정성을 위해 `TravelGuide v2`를 유지합니다.

## 문서

- `CLAUDE.md`: 코딩 에이전트(Claude 등)가 따르는 저장소 규칙과 작업 방식
- `docs/PRODUCT.md`: 지금의 제품 범위, 하지 않는 것, 우선순위
- `docs/MVP_FUNCTIONAL_SPEC.md`: 기능별 요구사항 ID와 세부 동작
- `docs/ACCEPTANCE_TESTS.md`: 실제 DB·Socket·브라우저 인수 시나리오
- `docs/ARCHITECTURE.md`: 모듈, 인증, 실시간, 저장소, 배포 구조
- `docs/DECISIONS.md`: 결정 기록(ADR)
- `docs/DEPLOYMENT.md`: Vercel·Railway 배포와 점검
- `docs/AUTOPILOT.md`: 매일 도는 에이전트 팀의 운영 규칙
- `docs/archive/`, `tasks/`: 발표용 MVP 시기의 실행 계획과 작업 명세(기록용)

## 작업 방식

GitHub 이슈가 작업 단위다. 작은 변경은 이슈 → 브랜치 → PR로 끝내고, DB·인증·
실시간 계약·여러 화면에 걸친 큰 변경만 `docs/plans/`에 계획을 먼저 쓴다.
자세한 규칙은 `CLAUDE.md`를 따른다.
