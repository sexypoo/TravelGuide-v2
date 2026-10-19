# #13 사용자 행동 신호를 기획 입력으로 수집 (서버 DB 집계)

- 이슈: https://github.com/sexypoo/TravelGuide-v2/issues/13
- 크기: large (관리자 지표 REST 응답 계약에 필드 추가, 출처 문서 수정)
- 위험: high — backend, `frontend/src/lib/api/`, `docs/MVP_FUNCTIONAL_SPEC.md`
  변경이라 자동 머지 대상 아님 (`autopilot:needs-owner`)

## 목표

이슈의 "결정이 필요한 것" 1번에서 가장 좁은 선택지를 택한다: **서버 DB
집계만** 쓰고 기존 관리자 KPI(ADR-025)를 넓힌다. 새 개인정보 수집, 외부
분석 도구, 브라우저 이벤트, 새 테이블·마이그레이션은 없다. 개인정보 처리방침
변경도 필요 없다(이미 저장된 데이터의 건수만 센다).

관리자 운영 지표 화면에서 아래 두 가지를 볼 수 있게 한다.

1. **사용자 퍼널** (중복 없는 사용자 수, 관리자 계정 제외)
   가입 → 인증 신청 → 인증 승인 → 첫 토픽 작성 → 토픽에 답변 받음 → 답변 채택
   - 인증 신청: `Verification`이 1건 이상인 사용자
   - 인증 승인: `status IN (APPROVED, EXPIRED, REVOKED)`인 신청이 1건 이상
     (한 번이라도 승인된 사용자. 개발자가 REVOKED가 승인 후에만 생기는지
     `verifications` 서비스에서 확인하고, 아니면 `reviewedAt` 조건을 함께 쓴다)
   - 승인은 여행자·현지인 수를 따로 함께 반환
   - 첫 토픽: 제거되지 않은 `Question` 작성자
   - 답변 받음: 제거되지 않은 답변이 1개 이상 달린 토픽을 가진 작성자
   - 채택: `acceptedAnswerId`가 있는 토픽을 가진 작성자
   - 각 단계 비율은 바로 앞 단계 대비, 소수점 한 자리 (`percentage` 재사용)
2. **현지인 공급** (기존 질문 집계 보강)
   - 미답변 토픽 수: 답변 0개로 `EXPIRED`된 토픽 수와 비율
   - 토픽당 평균 답변 수 (답변이 달린 토픽 기준, 소수점 한 자리)
   - 첫 답변 시간 중앙값(분) — 평균은 이미 있음, 소수 이상치에 덜 흔들림

## 하지 않는 것

- "방 입장" 단계: 입장 기록이 DB에 없다. 기록하려면 새 테이블과 마이그레이션이
  필요하므로 이번 범위에서 뺀다 (보고서에 오너 결정 사항으로 남김).
- 앱 안 피드백 버튼(이슈 결정 3번): 오너 결정 전이라 만들지 않는다.
- 기간 필터·추세 그래프: ADR-025의 "현재 스냅샷" 원칙을 유지한다.

## 파일

- `backend/src/admin/metrics/admin-metrics.service.ts` — 퍼널·공급 집계 추가.
  `count`/`groupBy`/`findMany({ distinct })`로 사용자 ID 집합만 읽고 개인 필드는
  읽지 않는다. 기존 질문 조회 결과(`questions`)를 재사용해 쿼리 수를 늘리지 않는다.
- `backend/src/admin/metrics/dto/admin-metrics.response.ts` — `userFunnel`,
  `supply` 필드 추가 (기존 필드는 그대로, 하위 호환)
- `backend/src/admin/metrics/admin-metrics.service.spec.ts` — 단위 테스트
- `backend/test/admin-metrics.e2e-spec.ts` (신규) — 실제 PostgreSQL 통합 테스트
- `frontend/src/lib/api/admin-metrics.ts` + `.test.ts` — 런타임 파서 확장
- `frontend/src/app/admin/metrics/page.tsx` — "사용자 흐름" 카드, 공급 지표 추가.
  기존 `styles.funnel` 패턴과 `components/ui` 프리미티브 재사용,
  `components/admin/admin.module.css`에 필요한 클래스만 추가
- `docs/MVP_FUNCTIONAL_SPEC.md` §18 KPI 정의에 퍼널·공급 지표 추가
- `docs/DECISIONS.md` — ADR-051 "기획 입력 신호는 서버 DB 집계로" (ADR-025 확장,
  외부 분석 도구·브라우저 이벤트를 쓰지 않는 이유와 되돌리는 조건)

## 마이그레이션

없음. 기존 인덱스(`Question @@index([authorId, status])`, `Verification` FK)로
파일럿 규모에서 충분하다.

## 테스트

- 단위: 빈 DB(모든 단계 0, 비율 0, 중앙값 null), 한 사용자가 신청 여러 건·
  토픽 여러 개여도 1명으로 세는지, 관리자 제외, 제거된 토픽·답변 제외,
  승인 후 만료·철회된 사용자도 "승인"에 포함, 중앙값 짝수·홀수 개
- 통합(`yarn test:integration`): admin 쿠키로 `GET /api/v1/admin/metrics`가
  실제 데이터로 퍼널을 반환, 일반 사용자 403, 비로그인 401, 응답에 이메일·
  GPS·증빙 키 같은 개인 필드가 없음
- 프런트: 파서가 새 필드를 검증하고 잘못된 형식이면 오류
- 화면: 390x844, 1440x900에서 관리자 지표 화면 확인 (빈 상태 포함)

오늘은 Docker가 꺼져 있어 통합·E2E를 로컬에서 못 돌린다. CI 결과로 확인하고
보고서에 적는다.

## 위험

- 응답에 개인 식별 정보가 섞이지 않게 DTO에 숫자만 둔다 (리뷰 우선순위 2).
- 데모 계정이 퍼널 숫자를 부풀릴 수 있다. 이번에는 관리자만 제외하고 화면에
  "관리자 계정 제외" 안내만 단다. 데모 계정 제외는 오너 결정으로 남긴다.
- 사용자 수가 커지면 요청 시 집계 비용이 늘어난다 (ADR-025와 같은 조건).

## Design

대상 화면은 `/admin/metrics` 하나다. 새 색·글꼴·그라데이션·의존성은 없다.
토큰(`frontend/src/styles/tokens.css`)과 `components/ui`의 `Card`,
`SectionHead`, `EmptyState`, `Button`, `ButtonLink`, 기존
`components/admin/admin.module.css`의 `.funnelCard`, `.funnel`, `.bar`,
`.metricFacts`, `.sectionNote`, 전역 `.srOnly`만 쓴다. 새 화면 문구는 제품
전체 용어(“토픽”)를 따른다. 기존 문구는 아래에 적은 것 외에는 바꾸지 않는다.

### 화면 순서 (위에서 아래, 모든 폭 공통)

1. `AdminFrame` 머리 — `title="운영 지표"` 유지, `description`만 변경
2. **새** 카드 “사용자 흐름” (퍼널)
3. 기존 카드 “질문 전환 흐름” — 그대로
4. 지표 칸 `dl.metricFacts` — 3칸에서 6칸으로 확장
5. 기존 카드 “현지 정보 기여” — 그대로
6. 기존 기준 시각(`.generatedAt`) — 그대로

### 레이아웃

- **390x844**: 왼쪽 메뉴 없이 하단 탭(`AdminFrame` 기존 동작). 본문 폭
  390 − 16×2 = 358px, 카드 안쪽 여백 20px → 퍼널 행 폭 318px. 행은 기존
  `.funnel li` 3열 그대로(라벨 5.5rem · 막대 · 숫자 최소 5.5rem). “첫 토픽
  작성”이 5.5rem 안에 한 줄로 들어간다(15px 기준). 지표 칸은 기존대로 1열로
  6개가 쌓이고 값은 `--text-2xl`. 가로 스크롤이 생기면 안 된다.
- **1440x900**: 왼쪽 메뉴(`--sidenav-width` 16rem) + 본문 최대 72rem,
  좌우 여백 3rem → 본문 약 1056px. 두 퍼널 카드는 나란히 두지 않고 전체 폭으로
  위아래 배치(기존과 동일). 지표 칸은 기존 `repeat(3, …)` 그대로 → 3칸 × 2줄.
- 6칸 순서(1440에선 줄 단위, 390에선 이 순서대로 쌓임):
  - 1줄(속도): 평균 최초 답변 · 첫 답변 중앙값 · 10분 이내 답변
  - 2줄(공급·결과): 토픽당 평균 답변 · 답변 없이 끝난 토픽 · 답변 채택

### “사용자 흐름” 카드 마크업

```tsx
<Card className={styles.funnelCard} aria-labelledby="user-funnel-title">
  <SectionHead
    id="user-funnel-title"
    title="사용자 흐름"
    action={<span className={styles.sectionNote}>관리자 계정 제외</span>}
  />
  <ol className={styles.funnel} aria-label="사용자 흐름"> …6행… </ol>
  <p className={styles.funnelNote}>비율은 바로 앞 단계와 비교한 값이에요.</p>
</Card>
```

- 각 행은 기존 질문 퍼널과 같은 구조: `<span>라벨</span>` · `.bar` · `<strong>`.
- 숫자: `{count.toLocaleString('ko-KR')}<span className="srOnly">명</span>`
- 비율(첫 행 제외): `<small><span className="srOnly">앞 단계의 </span>{percent(rate)}</small>`
  (페이지에 있는 `percent()` 재사용).
- 막대 폭 = 그 행의 앞 단계 대비 비율, `Math.min(100, Math.max(0, rate))`.
  첫 행(가입)은 사용자가 1명 이상이면 100%, 0명이면 0%이고 비율 글자는 없다.
- “인증 승인” 행 바로 아래, 같은 `li` 안에 세부 줄을 둔다:
  `<p className={styles.funnelDetail}>여행자 {n}명 · 현지인 {n}명</p>`
  (숫자는 `toLocaleString('ko-KR')`). 한 사람이 둘 다 승인되면 양쪽에 모두
  들어가므로 합이 승인 수와 다를 수 있다 — 화면에 따로 설명하지 않는다.

`admin.module.css`에 추가할 클래스는 이 두 개뿐이다(값은 모두 기존 토큰):

```css
.funnelDetail {
  grid-column: 2 / -1;
  margin: -0.375rem 0 0;
  color: var(--muted);
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}

.funnelNote {
  margin: 1rem 0 0;
  color: var(--muted);
  font-size: var(--text-sm);
}
```

### 지표 칸 6개 (`dl.metricFacts`, `aria-label="답변 속도와 공급 지표"`)

| dt | dd 값 | dd `<small>` |
| --- | --- | --- |
| 평균 최초 답변 | 기존 그대로 `{n}분` / 없으면 `—` | 답변이 달린 질문 기준 (기존) |
| 첫 답변 중앙값 | `{n}분` (소수 한 자리, `ko-KR`) | 절반의 토픽이 이 시간 안에 답변을 받았어요 |
| 10분 이내 답변 | 기존 그대로 | 첫 답변 속도 (기존) |
| 토픽당 평균 답변 | `{n}개` (소수 한 자리) | 답변이 달린 토픽 기준 |
| 답변 없이 끝난 토픽 | `{count}개` | 전체 토픽의 {percent(rate)} |
| 답변 채택 | 기존 그대로 | 해결 토픽의 {percent} (기존) |

- “첫 답변 중앙값”이 `null`이면 값 `—`, small은 “아직 답변이 달린 토픽이
  없어요”. `—`에는 `aria-label`을 주지 않고 small 문장이 의미를 전한다.
- “토픽당 평균 답변”은 답변 달린 토픽이 0개(`answeredQuestionCount === 0`)이면
  값 `—`, small “아직 답변이 달린 토픽이 없어요”.
- “답변 없이 끝난 토픽”은 0개여도 `0개` / “전체 토픽의 0%”를 그대로 보인다.
- 기존 `metricFacts` dl의 `aria-label`(“응답과 채택 지표”)은 위 값으로 바꾼다.

### 상태

- **로딩**: 지금 `/admin`에는 로딩 화면이 없어 집계 중 빈 화면이 된다. 새
  `frontend/src/app/admin/metrics/loading.tsx` + `loading.module.css`를
  `app/app/loading.tsx`와 같은 구조로 만든다(`Page` 대신 `<div className={styles.root}>`
  안에 같은 블록, CSS는 `app/app/loading.module.css`를 그대로 옮기되
  `.root`에 `max-width: 72rem; margin: 0 auto; padding: 1.25rem var(--page-gutter);`,
  1024px 이상 `padding: 2.5rem 3rem;`). 블록: 제목 1 · 설명 1 · 큰 카드 2
  (퍼널 두 개) · 짧은 카드 1. `role="status" aria-busy="true"`, 숨김 문구
  “운영 지표를 불러오는 중이에요”. `prefers-reduced-motion`에선 깜빡임 없음(기존 CSS 포함).
- **빈 상태**: 가입 사용자 수가 0이면 “사용자 흐름” 카드의 `ol`과 안내 문구
  대신 `EmptyState icon="crowd" title="아직 가입한 사용자가 없어요." description="가입이 생기면 단계별 흐름이 여기에 보여요."`.
  SectionHead(제목·“관리자 계정 제외”)는 남긴다. 다른 카드·지표 칸은 0과 `—`로
  보인다(위 규칙). 기존 “현지 정보 기여” 빈 상태는 그대로.
- **성공**: 위 레이아웃. 갱신 버튼·자동 새로고침 없음(ADR-025 스냅샷 유지),
  맨 아래 기존 “… 기준” 시각이 스냅샷임을 알린다.
- **오류**: 새 `frontend/src/app/admin/metrics/error.tsx`('use client') +
  `error.module.css`(`app/app/error.module.css`와 같은 값, `.root`에 위 로딩과
  같은 폭·여백). `Card` 안 `<div role="alert">`에
  `EmptyState icon="alert" title="운영 지표를 불러오지 못했어요" description="잠시 뒤 다시 시도해 주세요. 계속되면 서버 상태를 확인해 주세요."`,
  action은 `Button variant="primary" size="md" icon="refresh" onClick={reset}` “다시 불러오기”
  다음에 `ButtonLink variant="secondary" size="md" href="/admin"` “관리자 홈으로”
  (두 버튼은 `display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:center` 래퍼, 이 클래스는 `error.module.css`에).
  응답 형식 오류(`parseAdminMetrics` throw)도 같은 화면이다. 401/403은 기존
  `fetchProtectedApi`·`requireAdmin` 동작 그대로.

### 문구 (새로 쓰거나 바뀌는 것 전부)

| 위치 | 문구 |
| --- | --- |
| `AdminFrame` description | 가입부터 답변 채택까지 지금의 흐름을 확인하세요. |
| 카드 제목 | 사용자 흐름 |
| 카드 오른쪽 안내 | 관리자 계정 제외 |
| 퍼널 1~6행 라벨 | 가입 / 인증 신청 / 인증 승인 / 첫 토픽 작성 / 답변 받음 / 답변 채택 |
| 승인 세부 줄 | 여행자 {n}명 · 현지인 {n}명 |
| 카드 아래 안내 | 비율은 바로 앞 단계와 비교한 값이에요. |
| 숨김(스크린리더) | 명 / 앞 단계의 |
| 지표 칸 | 첫 답변 중앙값 / 절반의 토픽이 이 시간 안에 답변을 받았어요 |
| 지표 칸 | 토픽당 평균 답변 / 답변이 달린 토픽 기준 |
| 지표 칸 | 답변 없이 끝난 토픽 / 전체 토픽의 {n}% |
| 값 없음 small | 아직 답변이 달린 토픽이 없어요 |
| dl aria-label | 답변 속도와 공급 지표 |
| 빈 상태 | 아직 가입한 사용자가 없어요. / 가입이 생기면 단계별 흐름이 여기에 보여요. |
| 로딩 숨김 | 운영 지표를 불러오는 중이에요 |
| 오류 | 운영 지표를 불러오지 못했어요 / 잠시 뒤 다시 시도해 주세요. 계속되면 서버 상태를 확인해 주세요. |
| 오류 버튼 | 다시 불러오기 / 관리자 홈으로 |

`APPROVED`, `EXPIRED`, `TRAVELER`, `LOCAL` 같은 값은 화면에 쓰지 않는다.

### 접근성

- 초점 순서: 기존 `AdminFrame` 내비 → (본문엔 새 상호작용 요소 없음) →
  “현지 정보 기여”의 닉네임 링크. 오류 화면: “다시 불러오기” → “관리자 홈으로”.
- 구조: 카드마다 `aria-labelledby`로 `h2` 연결, 퍼널은 순서 있는 `ol`,
  막대는 `aria-hidden="true"`(숫자·비율이 글자로 있음). 스크린리더는 한 행을
  “인증 승인 42명 앞 단계의 80%”처럼 읽는다.
- 대비: 본문 `--ink`, 보조 `--muted`(#736d7b, 흰 카드 위 약 5:1)만 쓴다.
  `--faint`는 새 글자에 쓰지 않는다. 막대 `--iris` 대 `--surface-sunk`는
  비텍스트 3:1 이상. 색만으로 의미를 전하지 않는다.
- 글자 크기: 새 글자 최소 `--text-sm`(14px), 12px 미만 없음(ADR-050).
- 터치 영역: 새 버튼은 오류 화면의 `Button`/`ButtonLink size="md"`
  (`min-height: 2.75rem` = 44px)뿐. 기존 닉네임 링크 행은 52px.
- 확인: 390x844, 1440x900에서 빈 DB와 데이터 있는 DB 둘 다, 가로 스크롤 없음.

### 개발자 참고(디자인 관점 위험)

- 앞 단계보다 다음 단계가 큰 경우(예: 승인 기록 없이 토픽을 쓴 과거 데이터)
  비율이 100%를 넘으면 지금 파서 `isPercentage`(≤100)가 응답 전체를 오류로
  만든다. 백엔드가 비율을 100으로 자르거나 파서가 퍼널 비율만 상한 없이
  받도록 정하고, 화면은 막대만 100%로 자르고 숫자는 받은 값을 그대로 보인다.
