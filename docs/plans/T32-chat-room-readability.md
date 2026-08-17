# T32 Chat room readability

## Goal

Turn the focused room into a legible field conversation for a Korean traveler
or local contributor using one hand in a noisy, bright, moving environment. The
single job is to identify who said what and when, then respond without
squinting. Realtime data, authorization, and the T30 viewport contract remain
unchanged.

## Design pass 1 — field transmission system

### Subject, audience, and job

- Subject: short, trustworthy radio exchanges from a live travel scene.
- Audience: Korean travelers and verified locals reading in a native WebView,
  often outdoors and in motion.
- Single job: distinguish sender, time, and message content, then answer quickly.

### Color tokens

- Radio Ink `#282531`: primary message copy and decisive controls.
- Field Gray `#625c69`: supporting metadata.
- Paper `#fff9fb`: focused-room canvas.
- Signal White `#ffffff`: received message and composer surfaces.
- Live Magenta `#c73568`: live and active-room signal.
- Guide Iris `#675dda`: own-message, navigation, and focus signal.

Lines and quiet states derive from these six colors with opacity. Ordinary
message surfaces do not introduce extra gradients.

### Type roles

- Room display: Wanted Sans, 760–820, 20–26px with tight Korean display spacing.
- Message body: Pretendard, 600, at least 15px with 1.6 line height.
- Utility: Pretendard/SUIT, 720–800, at least 12px for sender, time, badges, and
  control labels.

### Layout

```text
┌ back      제주 실시간방      live ┐
├────── [ 대화 ] [ 실시간 토픽 ] ──┤
│  ● NAME · TIME                     │
│  ┌ received field message ┐        │
│                       나 · TIME ●  │
│          ┌ own message ┐           │  internal scroll
│                                  … │
├ [+] 지금 본 것, 궁금한 것… [send] ┤
└──────────── safe area ─────────────┘
```

The signature element is a small signal notch beside message metadata. It
borrows the live-route language of the broader product without turning the
timeline into a decorative rail or adding new controls.

## Design pass 2 — critique and revision

The first idea (larger bubbles and larger text) is too generic and would only
scale the existing hierarchy. The revision treats each message as a compact
field transmission: sender and time share a stronger utility line, a signal
notch makes the live source recognizable, received messages use crisp paper,
and own messages use a quiet iris wash with an ink-strength border. Alternating
alignment remains a secondary cue rather than the only distinction.

The deliberate aesthetic risk is removing gradients and plum decoration from
ordinary messages in favor of flatter, higher-contrast transmission cards.
Brand color is concentrated in the signal notch, selected room mode, focus
ring, and send action. This makes dense conversations calmer while retaining a
recognizable live-room identity.

## Files

- `frontend/src/app/chat-room.css`: isolated final-cascade room readability,
  signal motif, responsive type scale, controls, focus, and reduced motion.
- `frontend/src/app/layout.tsx`: load the room stylesheet after existing app
  styles.
- `frontend/src/components/app/app-frame.tsx` and its test: keep the compact
  room inside the smaller current height when a browser resize arrives before
  `visualViewport.height` has caught up.
- `frontend/e2e/critical-room.spec.ts`: assert readable computed type, touch
  targets, fixed document geometry, and internal scroll owners.
- `tasks/T32_CHAT_ROOM_READABILITY.md`: task scope and acceptance.
- `docs/DECISIONS.md` and `docs/RELEASE_NOTES.md`: record the room visual
  contract and release impact.

## Migrations and dependencies

- No database migration.
- No API, authorization, Socket.io, or shared-contract change.
- No production dependency.

## Verification

1. Run focused message, room, app-frame, and layout tests.
2. Run the real-stack room scenarios at 390x844, 390x640, and 1440x900.
3. Inspect 390x844 and 1440x900 screenshots for hierarchy, clipping, and topic
   readability; revise weak or generic surfaces.
4. Run frontend lint, format check, typecheck, full tests, and production build.
5. Deploy the verified Vercel web bundle and inspect the installed iOS simulator
   app, leaving the Railway frontend untouched.

## Risks

- Larger message copy can reduce the usable timeline height; the room must keep
  its existing shrinkable grid and scroll-owner rules.
- Stronger borders or signal decoration can create noise in dense timelines;
  the motif stays on metadata rather than connecting every bubble.
- A 16px textarea and 44px controls can increase composer height in compact
  viewports; 390x640 remains a regression gate.
- Browsers can briefly report a stale visual-viewport height after resizing;
  the room height must never exceed the simultaneously available inner height.
- Broad topic-card overrides could affect full-page question views; all new
  selectors stay scoped to `.appShell--room`.

## Results

- Added a room-scoped final-cascade visual layer with 15px+ message copy, 12px+
  metadata, a 16px composer, 44px mobile controls, distinct received/own
  transmission cards, and a restrained signal-notch motif.
- Applied the same readable hierarchy to the mobile mode switcher, live-topic
  rail, rich topic/place messages, attachment menu, focus states, and reduced
  motion without changing data or authorization behavior.
- Hardened room height synchronization to use the smaller current visual and
  layout viewport after a real-browser compact-resize run exposed a stale
  visual-viewport value.
- Visually inspected message and topic captures at 390x844, 390x640, and
  1440x900; the composer stays visible, the document stays fixed, and selected
  content remains the only scroll owner.
- Full frontend verification passed: 55 suites / 131 tests with the coverage
  gate, lint, format, typecheck, and the Next.js 15.5.21 production build.
- The complete real-stack Playwright suite passed 4 scenarios in 1.5 minutes,
  covering bidirectional chat/topic recovery, compact room containment, the
  mobile route deck, and the desktop shell.
