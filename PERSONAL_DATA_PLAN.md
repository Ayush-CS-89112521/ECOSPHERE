# EcoSphere personal accounts

Product decision: EcoSphere is free. No billing or paid access tiers.

Selected initial account data: saved locations, alert preferences, earned achievements.

## Responsibilities

- Clerk manages sign-in, sessions, account identity and credentials.
- MongoDB stores application data tied to the verified Clerk user ID (`User.userId`, unique).
- The backend verifies the Clerk session on each private request and enforces ownership.
- Public environmental telemetry remains accessible without signing in and is shared across users.
- Passwords and session tokens must not be stored in MongoDB application documents.

## Initial data

The existing User schema already includes saved locations, notification preferences and gamification achievements. Alerts initially mean saved opt-in preferences; actual alert delivery needs its own implementation and consent controls. Earned achievements must be awarded from verified backend activity. The current public notebook contains illustrative examples, not a person's earned records.

## Proposed next integration

1. Configure MongoDB and matching Clerk frontend/backend keys in local environment files.
2. On sign-in, synchronize the verified account and retrieve its personal record. Prefer a current-user endpoint whose identity comes from the token, avoiding client-selected user IDs.
3. Wire saved-location and alert-preference controls to protected persistence endpoints. Start with one location and one alert preference saved across sign-out/sign-in and a second browser session.
4. Display only that user's earned achievements and award them through verified backend events.
5. Exercise two-account isolation: one person cannot read or update another person's data. Verify deletion and session-expiry behavior using isolated data.

Existing APIs and schema provide a starting point. This follow-up removed billing; it did not claim or implement the complete signed-in personal UI or verify a live database connection.

## Billing removal completed

Removed the billing route/controller, dedicated subscription model, embedded subscription fields/index declaration, paid plan constants, billing rate limiter, premium history gate and Stripe package/lockfile entry. Account creation/sync no longer creates a subscription record. All accounts share the same 50-location storage safeguard, with no paid upgrade path. Existing public/environmental and account-auth behavior remains.

Clerk raw-body signature verification, replay receipts, account creation/update/deletion handlers, preferences, saved locations, and achievement storage remain. Obsolete billing tests were removed; regressions verify retired endpoints return 404 and user synchronization/location storage work without billing records.

Previously stored billing documents, fields or indexes in any database were not migrated or deleted: no database was accessed. Historical repair reports, audit evidence and logs remain as records of earlier work.

## Verification after removal

- Frontend: 8 suites / 58 tests pass.
- Backend: 10 suites / 45 tests pass, including Clerk signature and replay tests.
- Production build: exit 0.
- Lint: exit 0, four existing image warnings.
- Backend HTTP smoke checks pass without starting MongoDB or scheduling background jobs.
- No Stripe package is installed; no billing references remain in production source.
