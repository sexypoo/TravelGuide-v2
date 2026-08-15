# T27 public preorder registration

## Goal

Ship a focused public preorder flow at `/preorder` that records consented
interest in PostgreSQL and is safe to demonstrate as a real end-to-end feature.

## Product and design

- Audience: travelers who need current human judgment when plans change;
  geography is not part of the core identity.
- Page job: explain the service problem, product flow, and trust model before
  completing one preorder submission.
- Color: white `#ffffff`, ink `#302d39`, pale lilac `#f7f4ff`, magenta
  `#cf426f`, plum `#914ba5`, iris `#7068d8`.
- Type: existing display face for the promise, existing body face for the form,
  and compact utility labels for product states.
- Layout: a clean navigation and thesis hero with a code-native room preview,
  followed by problem, three-step flow, trust, and preorder sections.
- Signature: a visible decision trail connects one traveler question to two
  differently sourced human answers.
- Trust message: contrast experience-based answers with promotional listings,
  and state the implemented advertisement-reporting and moderation path rather
  than promising that advertisements can never appear.
- Hero identity: show the `여쭈어` service name and compact `여JJU` wordmark as a
  distinct brand lockup before the promise so the name is not read only as a
  verb in the headline.
- Reference boundary: use `kipit.kr` only for its clear information rhythm,
  spacious sections, product preview, and single repeated CTA. Do not copy its
  content, visual assets, metrics, testimonials, or distinctive compositions.
- Geography: mention Jeju once as the first pilot region near the preorder form,
  not as the service's headline identity.

## Backend files

- `backend/prisma/schema.prisma` and a new migration: add `PreorderRegistration`
  with unique normalized email, name, `consentedAt`, and `createdAt`.
- `backend/src/preorders/*`: public controller, DTO, service, response, module,
  and focused tests.
- `backend/src/app.module.ts`: register the preorder module.
- `backend/src/common/rate-limit/*`: add a dedicated public preorder limit.
- `backend/test/preorders.e2e-spec.ts`: verify real PostgreSQL persistence,
  validation, idempotent duplicates, and non-disclosing responses.

## Frontend files

- `frontend/src/app/preorder/page.tsx`: public page metadata and composition.
- `frontend/src/components/preorders/preorder-form.tsx`: accessible client form
  with validation, submitting, success, and error states.
- `frontend/src/lib/api/preorders.ts` and focused tests: API contract.
- `frontend/src/lib/preorders/validation.ts` and focused tests: immediate field
  feedback mirroring server constraints.
- `frontend/src/app/page.tsx` and `globals.css`: landing CTA and responsive page
  styling.

## Documentation

- Add the user-requested P1 scope and acceptance behavior to the functional and
  acceptance specs.
- Record the minimal-data and non-enumeration decision in `docs/DECISIONS.md`.
- Update release notes/status after verification.

## Migration and dependencies

- Add one forward-only Prisma migration; do not use `prisma db push`.
- No new dependency.
- Apply the migration to the currently running local PostgreSQL database before
  browser verification.

## Tests

1. DTO/service unit tests for normalization, persistence, and duplicate races.
2. Real-PostgreSQL integration test for create, validation, and duplicate row
   count.
3. Frontend validation, API client, and form interaction tests.
4. Backend/frontend lint and typecheck.
5. Backend/frontend production builds.
6. Browser verification at 390x844 and 1440x900, including a real submission.

## Risks

- Public forms attract spam; mitigate with a dedicated IP-based rate limit.
- Email is personal data; store the minimum, require explicit consent, expose no
  list endpoint, and return an indistinguishable duplicate success response.
- A migration applied while the API watcher is running may require Prisma client
  regeneration and an API restart before runtime verification.
