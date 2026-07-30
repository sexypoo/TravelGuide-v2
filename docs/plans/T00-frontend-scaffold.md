# T00 frontend scaffold plan

## Goal and scope

Create only the reproducible Next.js frontend foundation in `frontend/`. It must prove connectivity to the existing backend health endpoint through a relative `/api/v1` request, without adding authentication, room, verification, question, or admin features. Backend files remain unchanged.

## Previous-task check

- Backend T00 is committed as `e4b1903`.
- `backend/` already provides `GET /api/v1/health/live` and its own independent Yarn project.
- The working tree is clean before frontend work begins.

## Repository tree to create

```text
.github/workflows/frontend-ci.yml
frontend/
├── .dockerignore
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── .yarnrc.yml
├── Dockerfile
├── README.md
├── eslint.config.mjs
├── jest.config.mjs
├── jest.setup.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── public/.gitkeep
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── api-connection-status.test.tsx
│   │   └── api-connection-status.tsx
│   └── lib/
│       ├── api/health.ts
│       └── env/server.ts
├── tailwind.config.ts
├── tsconfig.json
└── yarn.lock
```

## Versions and package configuration

- Node.js `20.x`; `yarn@4.2.2`; `nodeLinker: node-modules`.
- Next.js `15.5.2`, React and React DOM `19.1.1`, TypeScript `5.8.3`, Tailwind CSS `3.4.1`.
- Jest/jsdom and Testing Library provide the baseline component test.
- ESLint uses the Next.js core-web-vitals and TypeScript flat configs; Prettier remains independent.
- No component library, state library, icon package, image package, or production dependency beyond Next.js and React is introduced.

## Commands

Run from `frontend/`:

```bash
corepack enable
yarn install
yarn dev
yarn lint
yarn format:check
yarn typecheck
yarn test
yarn build
yarn verify
```

`verify` runs lint, formatting validation, typecheck, unit/component tests, and build.

## Environment and backend proxy

- `API_INTERNAL_URL=http://localhost:3001` is required and validated as an absolute HTTP(S) origin when Next.js loads its configuration.
- Browser code always requests relative `/api/v1`, with `credentials: 'include'`.
- Next.js rewrites `/api/v1/:path*` to the separated backend during development and deployment. No production endpoint is hardcoded into client JavaScript.
- A local ignored `.env.local` will be used for validation; CI supplies the same non-secret development URL.

## Design plan

### Subject and job

- Subject: a traveler in Jeju whose plan has changed unexpectedly.
- Audience: Korean travelers and verified locals encountering the service for the first time.
- Single job: prove the web-to-API route is alive and make the product premise understandable, without pretending later product flows exist.

### Tokens

- `Ink #17131D`: primary type and route line.
- `Paper #F7F5FA`: quiet cool canvas.
- `Signal Magenta #D81B72`: live signal and key phrase only.
- `Jeju Purple #6D3CE7`: secondary endpoint and focus treatment.
- `Sea Mist #DDEEEB`: 제주 coordinate field.
- Display role: narrow Korean/system sans stack with heavy weight and tight tracking.
- Body role: Apple SD Gothic Neo / Noto Sans KR-style system stack.
- Utility role: system monospace for endpoint and live diagnostic values.

### Layout

```text
mobile                     desktop
┌──────────────────┐       ┌──────────────────────────────────┐
│ TG / JEJU     ●  │       │ TG / JEJU                    ●  │
│                  │       │                                  │
│ 제주의 변수에,   │       │ 제주의 변수에,   [traveler]      │
│ 현지의 답.       │       │ 현지의 답.          ╲ signal     │
│                  │       │                       [local]     │
│ [traveler]       │       │                                  │
│      ╲ signal    │       │ ─ API status / endpoint / retry  │
│       [local]    │       │                                  │
│ ─ API status     │       │                                  │
└──────────────────┘       └──────────────────────────────────┘
```

### Signature and critique

- Signature: a single diagonal signal route connects a traveler coordinate to a Jeju-local coordinate; its endpoint changes from neutral to magenta when the API responds.
- Motion: one route-draw and endpoint pulse only; both are disabled by `prefers-reduced-motion`.
- Initial concept risk: a generic centered hero plus rounded status card would be reusable for any SaaS. Revision: use an offset coordinate field, technical route annotations, square geometry, and the actual backend endpoint as structural information rather than decoration.
- Magenta/purple are deliberately restrained to honor the product direction and preserve credibility.

## Behavior and accessibility

- The status component owns loading, connected, and actionable error states.
- Retry repeats the real health request; no fake delays or fixed mock response is used in production.
- Status uses live-region semantics; the retry control is keyboard accessible with a visible focus state.
- Semantic headings, adequate color contrast, 44px minimum interactive target, and reduced-motion handling are included.
- Responsive checks target `390x844` and `1440x900`.

## Tests and CI

- Component test covers loading then successful backend response.
- Component test covers failure and retry recovery.
- CI installs with the immutable frontend lockfile under Node 20, then runs `yarn verify` with `API_INTERNAL_URL` set.
- Local validation runs every frontend command and performs a real browser check against the running backend and frontend.

## Risks and validation

- The host currently uses Node 24 while the fixed runtime is Node 20. Validate the production Docker image under Node 20 in addition to local checks.
- A frontend-only build cannot prove a live backend. Start the existing backend and PostgreSQL, then inspect the proxied health request in a real browser.
- Next.js rewrite mistakes could produce a false disconnected state. Test both direct backend health and the browser-visible relative route.
- External webfonts would make builds network-dependent, so the visual system uses deliberate local system font stacks.
- Browser tooling availability may affect screenshot automation; if unavailable, report the exact checks not run rather than substituting claims.
