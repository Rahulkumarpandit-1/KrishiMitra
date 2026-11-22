# Agent 3: Testing & QA Agent

## Role & Responsibilities
- Authors and maintains automated test suites covering unit, integration, and end-to-end user journeys.
- Executes tests continuously: before, during, and after code modifications.
- Verifies edge cases: empty payloads, invalid phone numbers, short passwords, network disconnects, and malformed files.
- Detects regressions immediately and blocks releases if any test suite fails.
- Current active test coverage:
  - `auth.test.js` (Auth, registration, JWT)
  - `security.test.js` (SQL injection, XSS, token tampering)
  - `admin.test.js` (RBAC, admin isolation)
  - `crops.test.js` (Reference crops, farmer crops, activities, calendar)
  - `weather.test.js` (Open-Meteo & resilient agro-weather fallback)
  - `disease.test.js` (Perceptual hash vision diagnosis, report archiving)
  - `soil.test.js` (NPK calculation, soil type analysis)
  - `profile.test.js` (Profile synchronization, AI chat)
  - `notifications.test.js` (Priority dispatch, unread counts)
  - `knowledge.test.js` (Public knowledge search, category filters)
  - `e2e-workflow.test.js` (Full 11-step farmer lifecycle)
- Command: `npm --prefix server test`
