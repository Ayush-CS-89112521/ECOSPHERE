> **Product update — 7 November 2026:** EcoSphere is free. Stripe, billing endpoints, subscription models/fields, paid plans and premium gates have now been removed. Earlier payment sections below describe historical verification and no longer represent the application. Clerk account-sync webhooks and MongoDB personal-data storage remain. Latest checks: frontend 58 tests, backend 45 tests, production build and lint pass (four existing image warnings). See PERSONAL_DATA_PLAN.md for the selected account scope. No database records were modified or deleted.

# EcoSphere repair and runtime verification

Verified on **7 November 2026 (Asia/Kolkata)**.

**Outcome: feasible local repairs and verification completed; the supplied “All Phases Passed” claim is not supported.** Builds, static checks, deterministic tests, live environmental requests, and browser journeys pass. Live database persistence, authenticated Clerk sessions, and Stripe sandbox transactions remain blocked or untested. Dependency audits still report low/moderate findings.

## 1. Initial repository state

- The application directories and supporting assets were already untracked in Git. Existing work was preserved; no commit, push, deployment, or production database modification was performed.
- Independent baseline: frontend 3 suites / 25 tests passed; backend 3 suites / 9 tests passed; `npx tsc --noEmit` exited 0; ESLint exited 0 with four image warnings.
- The previously added named GSAP/resize cleanup, absolute texture paths, landing unmount cleanup, missing-Unsplash fallback, and import-safe application entry were present. The planet actually loads `/earth/specularClouds.jpg`, not the tracker’s `/earth/clouds.jpg`.
- Backend had no `.env` or `MONGODB_URI`; no local listener on port 27017 or `mongod` command was found. Frontend `.env.local` existed and was left intact. Secret values are not included in this report.
- No browser verification, MongoDB persistence, live authentication, payment execution, or complete API ownership tests could be inferred from the original 34 tests.

## 2. Bugs discovered

| Severity | Reproduction / evidence | Root cause and repair |
|---|---|---|
| High | Successful fallback payload rendered “Ground Node Live” | HTTP success was treated as live-source success; source/freshness now control disclosure. |
| High | Missing city values produced AQI 320, PM2.5 180 and fabricated station rows | Transformer and initial state contained plausible demo measurements; unavailable values now remain null and render an em dash. |
| High | Fallback stations had an observation time 30 minutes before every request | Synthetic timestamps removed; source explicitly identifies synthetic references. |
| High | Anonymous `/user/sync` and gamification mutations; any signed-in user could target another Mongo user ID | Added authentication, identity matching and database ownership checks. |
| High | `CLERK_SECRET_KEY` was listed in Next `env` | Removed the secret from configuration intended to inline environment variables. No claim is made about previous deployments. |
| High | Stripe webhook ran after JSON parsing; several controller methods invoked `this` through unbound callbacks | Mounted raw webhook before JSON middleware; bound controller methods. Real SDK signature/tampering regressions now pass. |
| High | Duplicate webhook events could reapply effects | Persistent unique event receipts acknowledge completed duplicates and reject unresolved processing attempts. |
| High | Legacy environmental aggregator generated random measurements without disclosure | Added synthetic metadata to all its public data methods; background refresh does not save synthetic readings. |
| High | Installed dependencies had critical/high advisories | Updated compatible dependencies, migrated obsolete Clerk Node middleware to `@clerk/express`, updated Nodemailer, and applied scoped patched transitive overrides. Final audits have zero high/critical findings. |
| Medium | Browser screenshot showed only a clipped sliver of the landing globe | Renderer used viewport dimensions inside a small card. It now uses observed container dimensions without overriding CSS sizing. |
| Medium | Concurrent cold-cache requests duplicated upstream work | Added shared in-flight loads and rejection cleanup. |
| Medium | Infinity/string concentrations and invalid categories could become severe readings | Added finite-number validation and bounded interpolation. |
| Medium | Weather timestamps depended on host timezone and only covered one day | Requested Unix timestamps and two forecast days; converted instants to UTC ISO strings. |
| Medium | Dashboard’s 3.5-second timeout was shorter than a possible two-stage upstream fetch; retries included a nonexistent Express endpoint | One same-origin request, a 12-second total deadline, cancellation and request-identity checks through JSON parsing. |
| Medium | Preference schema accepted a flat object while controller read `body.preferences` | Flat validated payload now produces scoped preference updates; location mutations retain their dedicated limit checks. |
| Medium | Free subscriptions required a Stripe customer; users without surnames failed validation | Customer IDs are optional/sparse; surname defaults to an empty string. |
| Medium | Achievement award saved a document twice concurrently, and level calculation preceded new experience | Single save on an award, correct experience order, IST calendar-day streak comparison. |
| Medium | Backend startup did not return a server or coordinate scheduler/database shutdown | Added injected startup dependencies, bounded connection options, returned runtime, idempotent shutdown and signal cleanup. |
| Medium | Requiring email service threw because `createTransporter` does not exist | Corrected to Nodemailer `createTransport`; construction tested without sending email. |
| Low | Biome filter label said vulnerable while filtering critical/emergency examples | Label now matches the filter; exhibit data is explicitly illustrative. |

## 3. Fixes implemented

Changes preserve the custom globe and visual layout. The dashboard now shows observation time rather than response-generation time, identifies cached OpenAQ data, labels its PM-only index as indicative, and avoids calling inferred GRAP bands official active orders. Landing-page static pollution claims were removed. Worlds and achievements clearly identify example content.

The two Next API aliases share the same environmental service. HTTP `no-store` avoids a second CDN cache misrepresenting the in-process cache metadata. The application still requires MongoDB for normal backend startup; import/test isolation does not remove that requirement.

Payment customer creation reuses existing customers and supplies a stable Stripe idempotency key. Webhook receipts preserve unresolved processing records instead of automatically replaying potentially committed effects. This trades automatic recovery for avoiding duplicate effects; reconciliation is required after partial failure.

## 4. Component communication matrix

| Sender / trigger | Receiver / contract | Expected and actual result | Status |
|---|---|---|---|
| Dashboard mount, refresh, 60-second interval | `GET /api/delhi/air-quality`; 12-second deadline | Valid snapshot updates values, source, station list and IST time. Browser showed AQI 414, PM2.5 283 and six stations matching the saved response. | PASS |
| API alias clients | `GET /api/air-quality` | Same service/shape and shared cache; HTTP 200 and matching city AQI. | PASS |
| Next service | OpenAQ station discovery/latest, bounded fetches | Six station responses accepted; snapshot disclosed source `openaq` and observation time. | PASS, live read |
| Next service | Open-Meteo hourly forecast | Live fetch returned 48 hours with absolute instants; weather optional on failure. | PASS, live read |
| Upstream failure | Snapshot fallback -> dashboard transformation | 401/429/500/malformed cases produce labelled synthetic values, no observation timestamp and no live badge. | PASS, isolated tests |
| Landing navigation/unmount | Planet initialization/destroy | Three complete landing/dashboard round trips per browser run; no captured warning/error; globe visibly rendered. | PASS |
| User API consumers (no active frontend caller found) | Sync/preferences/locations/statistics | Guest 401, mismatched identity/owner 403, invalid Mongo ID 400; preference update verified with isolated model. | PASS, isolated tests |
| Gamification API consumers | Streak / achievement routes | Owner reaches mocked persistence; guest and foreign owner rejected. Frontend notebook currently uses static examples. | PASS, isolated; live persistence BLOCKED |
| Payment API consumers | Customer/subscription controllers | Ownership enforced; customer reuse/idempotency tested with provider mock. No transaction sent. | PASS, isolated; live provider NOT TESTED |
| Stripe / Clerk webhook requests | Raw body -> SDK verification -> event receipt -> handler | Real local Stripe/Svix signatures accepted; tampered bodies rejected; duplicate processing tested with model mocks. | PASS, local cryptography / mocked persistence |
| Legacy Express environmental clients | `/api/environmental/*` | Demo current data explicitly synthetic; invalid coordinates 400; image fallback 200. | PASS for executed smoke paths |
| Cross-origin API client | Express CORS | Allowed `http://localhost:3000` origin returned the matching allow-origin header in real HTTP smoke checks. | PASS |

There is no working frontend request chain for user persistence, payments or gamification in the current components. Those workflows were not invented or represented as end-to-end successes.

## 5. Environmental pipeline verification

- Breakpoint, composite index, invalid-number, negative-number, missing-pollutant and category tests pass. The unused standalone engine’s severe-band caps were aligned with the frontend convention.
- The application calculates an **indicative PM sub-index**, not an official CPCB AQI. CPCB requires at least three pollutants, including PM2.5 or PM10, and appropriate averaging. See [CPCB methodology](https://www.airquality.cpcb.gov.in/ccr_docs/About_AQI.pdf).
- The severe-band upper concentration caps are application conventions, not evidence of an official full AQI determination. GRAP and safe-window outputs remain heuristic and cannot confirm a CAQM order.
- Cache tests cover hits, misses, expiration and concurrent refresh; failed loads can be retried. Fallback data is explicitly synthetic, has no observation timestamp and does not become “live” because HTTP succeeded.
- Snapshot metadata includes source, observation/retrieval/generation times, status, freshness and cache age. Individual station observation times remain in the API response.
- Weather Unix time handling follows [Open-Meteo documentation](https://open-meteo.com/en/docs). Its live forecast response returned 48 hourly values beginning `2026-11-06T18:30:00.000Z`.
- Final HTTP evidence: both Next aliases returned HTTP 200, source `openaq`, six stations, AQI 414, latest observation `2026-11-06T21:30:00.000Z` (7 November, 03:00 IST). The runtime script independently recomputes city AQI from station concentrations.
- Exact responses are saved in `verification/runtime-results.json`; these are observations from this run, not a forecast of future availability.

## 6. Three.js verification

The landing globe visibly renders with day/night/cloud textures and correct card sizing. All three actual texture URLs returned HTTP 200. ResizeObserver updates dimensions; destroy disconnects it, removes named listeners/ticker, disposes textures/materials/geometries/renderer and releases the context. Destroy is idempotent. Context restoration reattaches the animation callback.

The lifecycle regression mounts/destroys three instances with real Three.js scene objects and mocked renderer/texture I/O. It verifies container size, callback restoration, listener removal and single texture/renderer disposal. Browser navigation was repeated three times on the final build with no captured warnings/errors.

**NOT TESTED:** actual GPU-memory profiling, long-duration context exhaustion, physical-device performance, and browser-driven context-loss/restoration. Local lifecycle tests are not proof of absence of GPU leaks. WebGL-unavailable handling was inspected; forced browser GPU-disable testing was not executed.

Screenshots: `verification/landing-desktop.png`, `verification/dashboard-desktop.png`, `verification/dashboard-mobile.png`.

## 7. Authentication verification

Guest pages work. A required frontend guard now fails closed when Clerk is unconfigured; component tests verify protected children are not rendered. Backend operations independently enforce authentication and ownership. Missing secret/publishable configuration returns 401. The backend uses the supported [Clerk Express middleware/getAuth flow](https://clerk.com/docs/reference/express/get-auth).

The actual sign-in page displayed guest mode. Live Clerk sign-in, valid/expired real sessions and cross-device identity propagation are **NOT TESTED**. Backend setup requires `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) from the same instance; placeholder keys are not evidence of authentication.

## 8. Backend verification

Application imports do not connect, schedule jobs or open an HTTP listener. Real HTTP smoke tests use a temporary ephemeral listener and close it afterward; no database or scheduler is started. Health, demo source disclosure, image fallback, invalid coordinates, guest denial, missing Stripe configuration and allowed-origin CORS pass.

Startup tests inject isolated database/scheduler dependencies and verify HTTP shutdown, scheduler stop, single database close and removal of signal handlers. Database tests verify missing URI, successful mocked connection, failure/timeout propagation and 5-second connection options. These are **not live MongoDB tests**.

`node src/app.js` exited 1 with `MONGODB_URI environment variable is not set`, as required. Live database integration remains BLOCKED. Transactional consistency, concurrent mutations against MongoDB, scheduler writes and webhook receipt persistence require an isolated configured database before release.

Real Stripe/Svix SDKs verified locally generated signatures and rejected tampering without provider calls. Stripe sandbox subscriptions, invoices and API response compatibility are NOT TESTED. No financial transaction or email was sent.

## 9. End-to-end results

| Workflow | Actual execution | Status |
|---|---|---|
| A: Landing -> globe -> dashboard -> landing | Browser, repeated three round trips on final build | PASS |
| B: Dashboard -> Next API -> engine -> UI | Production server, live upstream reads, displayed AQI/source/time and refresh | PASS |
| C: Upstream failure -> disclosed fallback | Service + transformer + mounted dashboard tests; failure not injected into the live browser | PASS for isolated chain; browser fault injection NOT TESTED |
| D: Sign-in -> protected feature | Guest sign-in displayed; real Clerk session unavailable | BLOCKED for authenticated journey |
| E: User mutation -> database -> UI | Backend ownership and mocked persistence tested; frontend has no active persistence caller | NOT TESTED end to end |
| F: Achievement processing -> persistence -> UI | Backend award/streak tests; frontend achievement exhibit is static and disclosed | NOT TESTED end to end |

Biome filtering and specimen modal open/close were exercised in the browser. The mobile menu navigated to the notebook. At the requested 390px mobile viewport, body scroll width equalled client width (385px after scrollbar); no horizontal overflow was observed. Temporary viewport overrides were reset.

## 10. Final verification matrix

Commands run from the named directory. Full outputs are in `verification/`.

| Directory | Command / check | Exit | Result |
|---|---|---:|---|
| frontend | `npx tsc --noEmit` | 0 | PASS, strict mode preserved |
| frontend | `npm run lint` | 0 | PASS, 0 errors / 4 existing image warnings |
| frontend | `npm run build` | 0 | PASS, Next.js 15.5.29 |
| frontend | `npm test -- --runInBand` | 0 | PASS, 8 suites / 58 tests including components, pipeline and lifecycle |
| backend | `npm test -- --runInBand` | 0 | PASS, 10 suites / 46 tests, isolated integrations and local signatures |
| ecosphere-aqi | `npm test` | 0 | PASS, 11 tests |
| repository | `node verification/runtime-check.mjs` | 0 | PASS, live environmental/asset/page HTTP checks |
| repository | `node verification/backend-runtime.cjs` | 0 | PASS, real ephemeral HTTP listener without MongoDB |
| backend | `node src/app.js` without URI | 1 | PASS for missing-config rejection; configured startup BLOCKED |
| frontend | `npm audit --json` | 1 | FAIL, 24 residual findings: 3 low / 21 moderate / 0 high / 0 critical |
| backend | `npm audit --json` | 1 | FAIL, 19 residual findings: 1 low / 18 moderate / 0 high / 0 critical |
| browser | Navigation, live dashboard, refresh, globe, exhibits, mobile menu/layout | n/a | PASS for described scope |
| external | Live MongoDB / Clerk sessions / Stripe sandbox | n/a | BLOCKED or NOT TESTED as described above |
| GPU | Memory profiling / forced real context recovery | n/a | NOT TESTED |

Intermediate edit verification caught and resolved a Windows UTF-8 encoding problem, two test-module lint names, and a component assertion that accidentally matched a CSS color. Final checks above reflect the corrected files. The production build intentionally skips integrated lint; independent lint was executed.

## 11. Remaining risks

1. **Release verification is incomplete:** real MongoDB, Clerk authentication, Stripe sandbox and concurrent persistence workflows require configured isolated services.
2. Low/moderate dependency findings remain in both trees. Full JSON audit results are saved. No blanket security clearance is claimed; major/breaking audit fixes were not forced.
3. A webhook that partially commits or crashes remains marked `processing` and returns 409 on replay. An operator must reconcile it; cross-document exactly-once transactions and event ordering were not implemented or validated.
4. Legacy Express environmental APIs are demonstrations, not real telemetry. Historical collections may contain older unlabelled demo records; no database was accessed to alter them.
5. Worlds/achievements are illustrative exhibits, not functioning user-persistence journeys. User/payment/gamification frontend integration requires separate product work.
6. PM-only city indices and outdoor estimates are indicative. Incomplete pollutant coverage, averaging, severe-band cap conventions and official CAQM declarations limit their interpretation.
7. Four image-performance lint warnings remain; hardware/GPU profiling is unexecuted. The dev-only component test renderer emits its upstream deprecation warning in verbose runs.

## 12. Files modified

| Files | Purpose |
|---|---|
| `frontend/package.json`, `frontend/package-lock.json` | Patched dependency resolution, component-test dependency, PostCSS override |
| `frontend/next.config.mjs` | Removed secret from inlined env configuration |
| `frontend/src/components/dashboard/Dashboard.tsx` | Unavailable state, same-origin fetch, deadline/cancellation/race protection, truthful source/labels |
| `frontend/src/lib/dashboard-data.js` (new) | Validated, testable dashboard transformation |
| `frontend/src/lib/aqi/aqi.js`, `cache.js`, `fallback.js`, `openaq.js`, `service.js`, `weather.js` | Input validation, shared refresh, synthetic integrity, observation/freshness metadata, absolute weather instants |
| `frontend/src/app/api/air-quality/route.js`, `frontend/src/app/api/delhi/air-quality/route.js` | Prevent misleading secondary HTTP caching |
| `frontend/src/components/3D/planet.ts` | Container sizing, observer cleanup, idempotent disposal, context restoration |
| `frontend/src/components/common/LandingPage.jsx` | Removed fixed current-pollution claims |
| `frontend/src/components/auth/AuthGuard.jsx` | Required authentication fails closed in guest mode |
| `frontend/src/app/worlds/page.jsx`, `frontend/src/app/achievements/page.jsx`, `frontend/src/components/spectacular/EnvironmentalWorlds.jsx` | Exhibit disclosure and accurate filter/model labels |
| `frontend/src/__tests__/contracts.test.js`, `pipeline.test.js`, `planet.test.js`, `dashboard-component.test.js`, `auth.test.js` (new) | Environmental, component, lifecycle, cache and auth regressions |
| `backend/package.json`, `backend/package-lock.json` | Clerk Express migration, Nodemailer update, patched transitive dependencies |
| `backend/src/app.js`, `backend/src/config/database.js`, `backend/src/services/backgroundService.js` | Isolated startup, bounded DB connect, coordinated shutdown, prevent synthetic persistence |
| `backend/src/middleware/auth.js`, `backend/src/middleware/validation.js` | Supported authentication, ownership/identity checks, coordinate and preference validation |
| `backend/src/routes/user.js`, `payment.js`, `gamification.js` | Protected endpoints; raw payment webhook moved to app |
| `backend/src/controllers/userController.js`, `paymentController.js`, `gamificationController.js`, `webhookController.js` | Bound handlers, correct preferences/sync, customer idempotency, event receipts and valid cancellation status |
| `backend/src/models/User.js`, `Subscription.js`, `WebhookEvent.js` (new) | Surname/free-plan validation, gamification persistence and unique webhook receipts |
| `backend/src/services/apiAggregator.js`, `emailService.js`, `webhookEvents.js` (new) | Synthetic disclosure, supported transport construction, replay handling |
| `backend/src/__tests__/security.test.js`, `startup.test.js`, `services.test.js`, `database-isolation.test.js`, `webhooks.test.js`, `webhook-events.test.js`, `webhook-signatures.test.js` (new) | Auth, lifecycle, schema/service, replay and cryptographic regressions |
| `ecosphere-aqi/src/aqi.js`, `ecosphere-aqi/src/service.js` | Align independent engine cap conventions, invalid-input handling and source metadata |
| `ECOSPHERE_REPAIR_PROGRESS.md`, `ECOSPHERE_REPAIR_REPORT.md`, `verification/*` | Progress, report, reproducible HTTP checks, logs, JSON evidence and screenshots |

No unrelated directories were rewritten. No production service was mutated. Verification servers were used locally only.
