# 여쭈어 (여JJU) 일일 상태

## 2026-08-15

- 완료 Task: T28 Next.js 보안 유지보수판 적용
- 변경: Next.js 및 eslint-config-next 15.5.2 → 15.5.21; Vercel 취약 버전
  보호 우회 없음
- 실행 명령: frontend next version, lint, format check, typecheck, Jest 전체,
  production build
- 테스트 결과: Next.js 15.5.21 확인, frontend 55 suites/128 tests 통과,
  lint/typecheck/format check/build 성공
- 배포 가능 여부: 취약 프레임워크 버전 차단 원인 제거; Vercel 재배포 필요

- 완료 Task: T27 공개 사전예약 페이지와 PostgreSQL 실제 저장
- 완료 acceptance IDs: E2E-029, INT-PRE-01; 이름·이메일 정규화, 필수 동의,
  중복 비공개 성공, 공개 목록 차단, 모바일 390px 무가로스크롤
- 실행 명령: Prisma generate/format/migrate deploy/validate, T27 backend unit 및
  PostgreSQL integration, frontend API/validation/form tests, 양쪽 lint/typecheck/
  format check/build, 인앱 브라우저 실제 폼 제출과 DB 조회
- 테스트 결과: T27 backend unit 2/2, integration 7/7, frontend focused 7/7;
  프로덕션 빌드 성공, 브라우저 콘솔 오류·경고 0
- 개인정보 범위: 이름, 정규화 이메일, 동의 시각, 생성 시각만 저장; 공개 조회 API 없음
- 배포 가능 여부: 로컬 기능 게이트 통과; 실제 운영 전 개인정보 보존·철회 정책 확정 필요

- 완료 Task: T25 최종 MVP 릴리스 안정화 로컬 범위
- 완료 acceptance IDs: 공개 프로필 계약 회귀, 발표 데모 리셋, 승인 인증 CTA,
  핵심 실시간방 우선순위, E2E-017/018/027 자동화 재검증
- 실행 명령: Node 20.20.2 backend/frontend `verify`, PostgreSQL T25 통합 테스트,
  Playwright 3회, guarded local demo seed, 390x844 및 1440x900 화면 검수
- 테스트 결과: backend 33/92 unit + 12/40 integration, frontend 50/120,
  Playwright 2/2가 36.4s·38.0s·33.5s로 3회 연속 성공
- 데모 상태: 리셋 1.54s, 대표 토픽 OPEN, 현재 답변 2개, 공유 카드 1개,
  보이는 관리 데모 메시지 3개
- Blocker: 실제 HTTPS/S3/PM2 호스트 smoke, 물리 모바일 GPS·키보드,
  수동 4계정 리허설 3회, 백업 영상은 미완료
- 배포 가능 여부: 로컬 발표 후보는 통과; 외부 릴리스 게이트 전 태그 금지

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
