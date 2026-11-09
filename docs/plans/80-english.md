# 80 영어(EN) 버전

## Goal

앱 화면 전체를 한국어·영어로 전환할 수 있게 한다. 결정은 ADR-054.

## Files

- `frontend/src/i18n/`: `config.ts`(언어 목록, Accept-Language), `server.ts`(`getLocale`, `getMessages`), `client.tsx`(`I18nProvider`, `useMessages`), `runtime.ts`(React 밖 함수용), `messages/{ko,en}/<영역>.ts`
- `frontend/src/components/common/locale-switch.tsx`: 토글
- 화면: 영역별로 문구를 사전으로 옮긴다
- `backend/src/common/http/english-details.ts`(+spec), `validation-message.ts`, `problem-details.filter.ts`, `problem.exception.ts`, `configure-app.ts`

## 단계

1. 기반 + 공통 틀·비로그인 홈·로그인·가입·비밀번호 찾기 + API 오류 영어화
2. 홈, 도움방·채팅·토픽·답변, 커뮤니티, 주변·찜, 내 정보·인증, 여행자 유형 테스트(코스 포함), 개인정보 처리방침·계정 삭제·사전예약

## Migrations

없음.

## Tests

- 사전: 영어에 한국어 키가 모두 있는지, 영어 문구에 한국어가 남지 않았는지, 목록 길이가 같은지
- 화면: 영어 렌더 테스트, 기존 한국어 테스트 유지
- 백엔드: 소스의 모든 한국어 오류 문구가 영어 표에 있는지, 쿠키에 따라 언어가 바뀌는지(통합)
- `yarn verify` 두 앱, E2E

## Risks

- 쿠키를 읽는 페이지는 정적 생성이 아니다.
- 사용자 데이터(글, 방 이름)는 번역하지 않는다.
- 영어 문구 품질은 오너가 훑어봐야 한다.
