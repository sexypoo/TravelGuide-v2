# TravelGuide frontend

Next.js frontend scaffold for TravelGuide v2. T00 contains only the product
premise and a real backend connectivity diagnostic.

## Prerequisites

- Node.js 20.x
- Corepack
- The backend running at `http://localhost:3001`

## First setup

Run all commands from this `frontend/` directory.

```bash
corepack enable
cp .env.example .env.local
yarn install
yarn dev
```

Open `http://localhost:3000`. The page requests the relative endpoint
`/api/v1/health/live`; Next.js proxies it to `API_INTERNAL_URL`.

## Quality commands

```bash
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn build
yarn verify
```

## Environment

`API_INTERNAL_URL` is a server-only absolute HTTP(S) origin. It is validated as
Next.js loads its configuration and is never exposed as a hardcoded browser API
origin. Browser requests stay relative to preserve same-origin cookies.

## Docker

```bash
docker build -t travelguide-frontend .
docker run --rm -p 3000:3000 travelguide-frontend
```

Override `API_INTERNAL_URL` at image build time when the deployment proxy target
differs:

```bash
docker build --build-arg API_INTERNAL_URL=http://api:3001 -t travelguide-frontend .
```

## Troubleshooting

- If the page shows `API 연결 안 됨`, confirm the backend health endpoint works
  directly, then confirm `API_INTERNAL_URL` matches its origin.
- If port 3000 is occupied, run `yarn dev --port 3002`.
- If Yarn reports 1.x, use `corepack yarn --version` and confirm `4.2.2`.
- Use Node 20.x; other Node majors are not the supported project runtime.
