# T15 topic image

## Goal

Add one optional private evidence image to directly created topics while
preserving the existing JSON creation and message-promotion paths.

## Data and API

- Add nullable image object key, original name, MIME, and size fields to
  `Question` in one Prisma migration.
- Add `POST /api/v1/rooms/:slug/questions/images` using the shared 10 MiB image
  signature validator.
- Add authenticated `GET /api/v1/questions/:questionId/image`; authorize using
  the question room destination before resolving private storage.
- Return `image: { url, originalName, mimeType } | null` from question list,
  detail, create, and Socket payloads. Removed topics always return null.

## Backend files

- Prisma schema and migration.
- Questions module, controllers, service, and response DTO.
- Local storage key allow-list.
- Response, access/removal, signature/size, and orphan-cleanup tests.

## Frontend files

- Question API parser and multipart create helper.
- Question composer optional image picker and validation copy.
- Topic list thumbnail and detail evidence panel.
- API/component fixtures and regression tests.

## Design direction

- Palette stays Canvas `#fff9fb`, Ink `#494653`, Berry `#cf426f`, Plum
  `#914ba5`, Iris `#7068d8`.
- Type roles stay the existing display/body/utility system.
- The image is evidence, not a hero: cards use a restrained 3:2 thumbnail and
  detail uses a bordered field-note panel below the topic text.
- Signature element: a small `현장 사진` stamp overlaps the detail image edge;
  it encodes the image's purpose rather than decorating the page.

## Risks

- Private images cannot use Next image optimization without forwarding auth;
  use the protected same-origin endpoint directly.
- Upload-before-transaction requires best-effort deletion on every DB error.
- Existing records and message-promoted topics must parse with `image: null`.

