# TravelGuide v2 일일 상태

## 2026-08-02

- 완료 Task: T18; T10 자동화 구성, T11 저장소 배포 준비 완료; T12 릴리스 문서 준비 중
- 완료 acceptance IDs: backend E2E-001~026, E2E-028 health/CORS
- 실행 명령: backend lint/format/typecheck/unit/build 및 PostgreSQL integration 별도 성공; frontend verify; Playwright `--list`; browser fixture
- 테스트 결과: backend 27 unit suites/71 + 9 integration suites/37, frontend 37 suites/90, Playwright 2 tests x 3 consecutive runs passed
- 커버리지: backend 합산 85.23/62.85/84.24/85.96, frontend 전체 소스 56.91/60.09/58.08/57.89 (statements/branches/functions/lines)
- Blocker: in-app browser는 사용할 수 없고, 실제 HTTPS 도메인/호스트 및 PostgreSQL/S3 production 자격 증명 없음
- 알려진 위험: Nginx/PM2 실호스트 검증, 물리 모바일 GPS·시각 검수, 수동 4계정 리허설 미완료
- 다음 작업: production 인프라에서 smoke/reboot 후 traveler + local A/B + admin 수동 리허설 3회
- 배포 가능 여부: 코드·runbook 준비 완료, 외부 인프라 smoke 전까지 실제 배포 승인은 보류
- 참고: Docker를 재시작하고 PostgreSQL을 55432로 포워딩한 뒤 backend 전체 `verify`가 통과함
- T12 상태: release notes, 알려진 제한, 비파괴 demo 재시드와 3회 리허설 체크리스트 작성; release tag는 생성하지 않음

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
