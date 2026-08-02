# T10 acceptance audit — 2026-08-02

## Automated backend coverage

| Acceptance          | Evidence                                                             |
| ------------------- | -------------------------------------------------------------------- |
| E2E-001–002         | `backend/test/auth.e2e-spec.ts`                                      |
| E2E-003             | `backend/test/t02.e2e-spec.ts`, `t05.e2e-spec.ts`, `t06.e2e-spec.ts` |
| E2E-004–010         | `backend/test/t03.e2e-spec.ts`                                       |
| E2E-011–013         | `backend/test/t05.e2e-spec.ts`                                       |
| E2E-014–018         | `backend/test/t06.e2e-spec.ts`                                       |
| E2E-018A–018B       | `backend/test/t07a.e2e-spec.ts`                                      |
| E2E-019–026         | `backend/test/t08.e2e-spec.ts`, `auth.e2e-spec.ts`                   |
| E2E-028 health/CORS | `backend/test/health.e2e-spec.ts`                                    |

The PostgreSQL integration suite contains 9 suites and 37 tests. It covers the
server-side state, authorization, transaction, privacy, and Socket event rules.

## Coverage baseline and gate

| App                          | Statements | Branches | Functions |  Lines | Gate        |
| ---------------------------- | ---------: | -------: | --------: | -----: | ----------- |
| backend (unit + integration) |     84.95% |   62.48% |    82.94% | 85.66% | 80/60/75/80 |
| frontend (all source)        |     56.91% |   60.09% |    58.08% | 57.89% | 55/59/57/56 |

The backend command merges unit and PostgreSQL integration instrumentation before
enforcing its gate. The frontend gate includes untested source files rather than
reporting only files touched by tests. These gates prevent a regression below the
measured baseline while the browser suite carries cross-client behavior assertions.

## Browser gate

`frontend/e2e/critical-room.spec.ts` contains two real-stack scenarios:

- separate traveler/local contexts, UI login, Socket joins, REST topic and answer
  writes, live rendering, offline interval, reconnect, and missed-answer refetch;
- 390x844 room rendering, composer visibility, and horizontal overflow.

The config compiles and both tests passed three consecutive Chromium runs on
2026-08-02 (31.2s, 30.9s, 29.9s). E2E-017, E2E-018, and the automated portion
of E2E-027 are browser-complete. Physical mobile Safari/Chrome and production
HTTPS remain manual release gates.

## Manual / deployment-only

- E2E-028 HTTPS cookie, Nginx WebSocket upgrade, and production process recovery.
- Physical Safari/Chrome geolocation permission.
- 1440x900 and 390x844 screenshot review, long content, empty/error/locked states.
- Evidence access and log redaction spot-check in the deployed environment.

## Next execution

```bash
cd frontend
TEST_DATABASE_URL=postgresql://... yarn test:e2e
```

The three-run automation gate is complete; continue with the deployment-only
and physical-device checks above.
