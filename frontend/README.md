# TravelGuide frontend

Next.js frontend for TravelGuide v2. T01 includes the product landing page,
real cookie-based registration/login/logout, and server-validated user/admin
shells.

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

Open `http://localhost:3000`. Browser requests use relative `/api/v1/*` paths;
Next.js proxies them to `API_INTERNAL_URL` so the httpOnly auth cookie stays
same-origin.

## Routes

- `/`: landing page and live API diagnostic
- `/auth/register`: account creation with automatic login
- `/auth/login`: login with safe protected-route return
- `/app`: authenticated user shell
- `/app/rooms/jeju`: real Jeju room metadata and truthful access lock
- `/app/verifications`: own traveler/local verification status and reapplication
- `/app/verifications/traveler`: traveler dates and private proof application
- `/app/verifications/local`: geolocation, relationship, and private proof application
- `/app/profile`: own profile view and update
- `/admin`: authenticated admin verification list, private evidence, and review

`/app` and `/admin` validate the incoming cookie against the backend. A missing
or expired session redirects to login. Tokens are never stored in browser
storage or returned to frontend JavaScript.

Verification uploads use `FormData` and accept one JPEG, PNG, or PDF up to 5MB.
Exact GPS coordinates are never rendered. Administrator evidence is loaded only
after an explicit click, opened through a short-lived object URL, and not kept in
the client cache.

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
