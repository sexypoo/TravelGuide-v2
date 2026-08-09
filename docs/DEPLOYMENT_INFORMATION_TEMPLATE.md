# TravelGuide v2 Railway 배포 정보 작성서

작성일: `YYYY-MM-DD`
작성자: `[이름 또는 닉네임]`
목표 배포일: `YYYY-MM-DD HH:mm KST`

실제 비밀번호, JWT secret, 데이터베이스 URL, Bucket access key는 이 문서에
기록하지 않습니다. Railway의 Sealed Variable 또는 Variable Reference에 저장하고
아래 표에는 준비 상태만 표시합니다.

## 1. Railway 프로젝트

| 항목 | 작성 값 |
| --- | --- |
| Workspace | `[값]` |
| Project | `[값]` |
| Environment | `production` |
| GitHub 저장소 | `sexypoo/TravelGuide-v2` |
| Branch | `main` |
| 요금제 | `[Free / Hobby / Pro]` |
| 리전 | `[값]` |

## 2. 서비스 연결

| 서비스 | Root Directory | 도메인/상태 |
| --- | --- | --- |
| frontend | `/frontend` | `[공개 URL]` |
| backend | `/backend` | `[공개 URL]` |
| Postgres | 해당 없음 | `[생성 완료 / 미완료]` |
| uploads Bucket | 해당 없음 | `[생성 완료 / 미완료]` |

확인:

- [ ] frontend와 backend가 `sexypoo/TravelGuide-v2`의 `main`을 바라본다.
- [ ] 최신 배포 커밋이 로컬 `main`과 일치한다.
- [ ] backend Healthcheck Path가 `/health/ready`다.
- [ ] Postgres와 Bucket에 불필요한 public endpoint가 없다.

## 3. Backend Variables

| 변수 | 권장 설정 | 완료 |
| --- | --- | --- |
| `NODE_ENV` | `production` | `[ ]` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | `[ ]` |
| `WEB_ORIGIN` | `https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}` | `[ ]` |
| `JWT_SECRET` | 32자 이상 Sealed Variable | `[ ]` |
| `JWT_EXPIRES_IN` | `24h` | `[ ]` |
| `STORAGE_DRIVER` | `s3` | `[ ]` |
| `INITIAL_ADMIN_EMAIL` | 운영 관리자 이메일 | `[ ]` |
| `INITIAL_ADMIN_PASSWORD` | 10~72자 Sealed Variable | `[ ]` |
| `INITIAL_ADMIN_NICKNAME` | 고유한 2~20자 닉네임 | `[ ]` |
| `GOOGLE_PLACES_API_KEY` | Places API (New) 전용 Sealed 서버 키 | `[ ]` |

`PORT`는 Railway가 자동 주입하므로 직접 만들지 않습니다. 기존
`GOOGLE_CLIENT_*`, `CORS_ORIGINS`, `USE_S3`, `AWS_REGION`, `AWS_S3_BUCKET` 변수는
TravelGuide v2의 필수 변수가 아닙니다.

## 4. Railway Bucket Variables

Credentials 탭에서 AWS SDK용 변수를 backend에 자동 주입하는 방식을 권장합니다.

| 변수 | 준비 상태 |
| --- | --- |
| `AWS_ENDPOINT_URL` | `[ ]` |
| `AWS_ACCESS_KEY_ID` | `[ ]` |
| `AWS_SECRET_ACCESS_KEY` | `[ ]` |
| `AWS_S3_BUCKET_NAME` | `[ ]` |
| `AWS_DEFAULT_REGION` | `[ ]` |
| `AWS_S3_URL_STYLE` | `[ ]` |

직접 Reference Variable을 만들 경우에는 아래 이름을 사용합니다.

```text
S3_ENDPOINT=${{uploads.ENDPOINT}}
S3_ACCESS_KEY_ID=${{uploads.ACCESS_KEY_ID}}
S3_SECRET_ACCESS_KEY=${{uploads.SECRET_ACCESS_KEY}}
S3_BUCKET=${{uploads.BUCKET}}
S3_REGION=${{uploads.REGION}}
S3_URL_STYLE=virtual
```

`RAILWAY_BUCKET_NAME` 대신 S3 API용 `BUCKET`을 참조합니다.

## 5. Frontend Variables

| 변수 | 권장 설정 | 완료 |
| --- | --- | --- |
| `API_INTERNAL_URL` | `http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:${{backend.PORT}}` | `[ ]` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps JavaScript API용 HTTP referrer 제한 브라우저 키 | `[ ]` |

Vercel에 frontend를 배포한다면 `API_INTERNAL_URL`에는 Railway backend의
공개 HTTPS URL을 입력합니다. `*.railway.internal` 주소는 Vercel에서 접근할 수
없습니다.

Google Cloud 준비 상태:

- [ ] Maps JavaScript API를 활성화했다.
- [ ] Places API (New)를 활성화했다.
- [ ] 서버 키와 브라우저 키를 분리했다.
- [ ] 브라우저 키에 운영/Preview 도메인 HTTP referrer 제한을 걸었다.
- [ ] Places 사용량 quota와 결제 예산 알림을 설정했다.

frontend의 공개 URL:

```text
[https://...up.railway.app]
```

backend의 공개 URL:

```text
[https://...up.railway.app]
```

## 6. 배포 확인

- [ ] backend 로그에서 `prisma migrate deploy`가 성공했다.
- [ ] `/health/live`가 성공한다.
- [ ] `/health/ready`가 성공한다.
- [ ] frontend가 HTTPS로 열린다.
- [ ] 회원가입과 로그인이 성공한다.
- [ ] 채팅방 입장과 Socket.io 재연결이 성공한다.
- [ ] 이미지 업로드와 권한 있는 다운로드가 성공한다.
- [ ] 재배포 후에도 Bucket 파일이 유지된다.
- [ ] 토픽 공유와 답변 작성이 성공한다.
- [ ] 모바일 너비에서 핵심 화면이 깨지지 않는다.

## 7. 운영 계정과 데이터

비밀번호는 별도 비밀번호 관리자 또는 Railway secret에 저장합니다.

| 역할 | 이메일 | 비밀번호 저장 위치 |
| --- | --- | --- |
| 관리자 | `[이메일]` | `[secret 위치]` |
| 여행자 A | `[이메일]` | `[secret 위치]` |
| 여행자 B | `[이메일]` | `[secret 위치]` |
| 현지인 A | `[이메일]` | `[secret 위치]` |

| 항목 | 작성 값 |
| --- | --- |
| 데모 seed 실행 여부 | `[예 / 아니요]` |
| seed 승인자 | `[이름]` |
| 배포 전 DB backup | `[완료 / 미완료]` |
| rollback 결정자 | `[이름]` |

## 8. 배포 결과

| 항목 | 작성 값 |
| --- | --- |
| 배포 Git SHA | `[값]` |
| migration 결과 | `[성공 / 실패]` |
| frontend deployment ID | `[값]` |
| backend deployment ID | `[값]` |
| smoke 결과 | `[성공 / 실패 및 설명]` |
| rollback 필요 여부 | `[없음 / 설명]` |

## 9. 추후 AWS 이전

- [ ] Railway Bucket의 object 수와 용량을 기록한다.
- [ ] private AWS S3 bucket과 최소 권한 IAM을 준비한다.
- [ ] object key를 유지해 데이터를 복사한다.
- [ ] `S3_ENDPOINT`를 제거하고 AWS S3 변수로 전환한다.
- [ ] 업로드·다운로드와 권한 검사를 마친 뒤 Railway Bucket 삭제를 결정한다.

## 최종 보안 확인

- [ ] 이 문서에 실제 비밀번호가 없다.
- [ ] 이 문서에 JWT secret이 없다.
- [ ] 이 문서에 전체 `DATABASE_URL`이 없다.
- [ ] 이 문서에 Bucket access key가 없다.
- [ ] Git에 `.env` 파일이 포함되지 않았다.
