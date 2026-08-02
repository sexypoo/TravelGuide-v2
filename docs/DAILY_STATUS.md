# TravelGuide v2 일일 상태

## 2026-08-02

- 완료 Task: T18; T10 자동화 구성, T11 저장소 배포 준비 완료
- 완료 acceptance IDs: backend E2E-001~026, E2E-028 health/CORS
- 실행 명령: backend lint/format/typecheck/unit/build 및 PostgreSQL integration 별도 성공; frontend verify; Playwright `--list`; browser fixture
- 테스트 결과: backend 27 unit suites/71 + 9 integration suites/37, frontend 37 suites/90, Playwright 2 tests discovered
- 커버리지: backend 합산 84.95/62.48/82.94/85.66, frontend 전체 소스 56.91/60.09/58.08/57.89 (statements/branches/functions/lines)
- Blocker: 현재 Docker 엔진과 사용 가능한 브라우저가 없고, 실제 HTTPS 도메인/호스트 및 PostgreSQL/S3 production 자격 증명 없음
- 알려진 위험: Nginx/PM2 실호스트 검증, 브라우저 시나리오 3회 연속 실행, 모바일 GPS·시각 검수 미완료
- 다음 작업: T12 로컬 릴리스 준비 후 production 인프라에서 `smoke:production`과 브라우저 리허설
- 배포 가능 여부: 코드·runbook 준비 완료, 외부 인프라 smoke 전까지 실제 배포 승인은 보류
- 참고: backend 전체 `verify` 재실행은 unit 71개 통과 후 종료된 Docker 엔진 때문에 integration DB 준비 단계에서 중단됨

---

## YYYY-MM-DD

- 완료 Task:
- 완료 acceptance IDs:
- 실행 명령:
- 테스트 결과:
- Blocker:
- 알려진 위험:
- 다음 작업:
- 배포 가능 여부:
