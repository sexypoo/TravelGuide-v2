# T47 nearby screen in the T42 direction

## Goal

Bring `/app/nearby` (open restaurants near the current location, T24) into the
T42/T43 system and fix a desktop layout bug. The search behavior, radius,
API, and privacy guarantee (location used for the search only, never stored)
stay the same.

## Problems on the current screen

- **Bug:** at 1440x900 the heading, lede, and map start at x≈130, under the
  fixed desktop side navigation, which covers part of the title. The page
  uses its own full-width container instead of a width that fits beside the
  navigation.
- `NEARBY, RIGHT NOW` is a decorative all-caps English eyebrow.
  `지금 문 연 곳을 가볍게 찾아보세요` is filler and does not say what is
  listed.
- Without a browser key the map says `Google Maps API 키를 설정하면 지도가
  표시됩니다`, and a load failure says `API 키 설정을 확인해 주세요`. Those
  are operator instructions shown to travelers.
- Every row repeats `● 영업 중`, but the search only returns open places.
- Rows are numbered `01`, `02`, … while the map markers have no labels, so
  the numbers connect to nothing.
- Rows are bordered cards inside a bordered panel. The selected row gets a
  magenta border, but magenta is reserved for live verified state.
- The privacy promise appears twice (empty state and footer).
- On desktop the search button floats at the far right, away from the text
  that explains it.

## Design pass 1: system

- Subject: finding somewhere open to eat right now, near where you stand.
- Audience: a traveler on a phone, hungry, possibly in a place they don't know.
- Single job: tap once, see the nearest open restaurants on a map and as a
  list, and open one in Google Maps.

Color: shared tokens. Ink for text, the primary button, and the selected
number. Muted for addresses. `--danger` for errors. No magenta.

Type: `--display` for the 2rem/2.5rem title, `--body` elsewhere. Numbers use
tabular figures.

Layout: max 58rem, centered like the other app pages, so it clears the
desktop navigation. Mobile stacks the map (15rem) above the list. Desktop puts
the map (1fr) beside the list (22rem), both 32rem tall.

```text
지금 문 연 식당
현재 위치에서 1.5km 안의 영업 중 식당을 가까운 순서로 보여줘요.
[ ⌖ 내 주변 보기 ]

┌──────────────────────────────┐  가까운 순서                4곳
│              ①               │  ──────────────────────────────
│        ②          ③          │  ① 동백식당                   ↗
│                 ④            │     제주시 관덕로 14
│                              │  ──────────────────────────────
└──────────────────────────────┘  ② 올레국수                   ↗
                                    …
현재 위치는 검색에만 쓰고 저장하지 않아요.
```

## Design pass 2: critique and revision

- Numbers: kept, because the list really is ordered by distance. They are
  only worth showing if they match the map, so markers now carry the same
  label (`1`, `2`, …). Zero padding is dropped.
- Rows: divided rows instead of cards, matching `/app`. The selected row
  fills its number with ink and gets a surface background. There is no
  colored border.
- Map unavailable: says what the user can still do (`지도를 표시할 수 없어요.
  가까운 식당은 목록으로 확인할 수 있어요.`). Configuration language is
  removed from the UI.
- The privacy line appears once, under the results area. The empty state
  instead tells the user what the button does.
- The per-row `영업 중` is removed. The title and lede already say the list is
  open restaurants.

## Files

- `frontend/src/components/places/nearby-places-explorer.tsx`: structure,
  copy, and marker labels. Search logic is unchanged.
- `frontend/src/components/places/nearby.module.css` (new)
- `frontend/src/types/google-maps.d.ts`: optional `label` on markers
- `frontend/src/app/globals.css`, `frontend/src/app/mobile-app.css`: prune
  `nearbyExplorer*` / `nearbyPlaceCard*` rules (selector-aware, keeps other
  alternatives in groups and `:where()` lists)
- `frontend/e2e/mobile-app-shell.spec.ts`: the nearby entry moves to ids
- `frontend/src/components/places/nearby-places-explorer.test.tsx`: copy

## Migrations

None.

## Tests

- Unit: existing explorer test (search, results, Google Maps link) with
  updated copy. It also asserts that rows no longer repeat `영업 중`.
- E2E: `mobile-app-shell`. Capture at 390x844 and 1440x900 for the initial,
  results, and permission-denied states, checking that the desktop content
  clears the side navigation. Results are captured with a faked nearby
  response only for visual review; there is no Places key locally, and this
  is not a committed test.
- `yarn verify`.

## Risks

- Real Google map tiles can't be checked locally (no key). Marker labels use
  the documented `MarkerOptions.label` string form.
- No new dependencies, no API changes.
