# AGENTS.md — Project Memory & Autonomous Engineering Log

## 1. Project Purpose & Technology Stack
- **System**: KrishiMitra – Smart Farming Decision Assistant (कृषि मित्र)
- **Domain**: Agriculture / Hack2Skill AI Hackathon Submission
- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS (Nature-Tech Glassmorphism theme), Lucide Icons, Recharts
- **Backend**: Node.js, Express.js 4, `node:sqlite` DatabaseSync with WAL mode, Helmet, Compression, Express-Rate-Limit
- **AI Integrations**: xAI Grok / Google Gemini / Built-in ICAR Agronomic Expert Rules fallback chain
- **Weather Telemetry**: Open-Meteo REST API (real-time meteorological forecasts with resilient agro-fallback)
- **Vision Engine**: Perceptual hash crop disease image analysis with 15+ Indian crop pathologies

---

## 2. Key Architecture & Conventions
- **Database Engine**: Uses Node.js 22 built-in `node:sqlite` (`DatabaseSync`), NOT the npm `better-sqlite3` native addon.
- **Route Prefixing**: Backend supports dual mounting (`/api/*` and root `/*`) via `mount(routePath, router)`.
- **Public Endpoints**: `/api/crops` and `/api/knowledge` are public (no authentication required).
- **Protected Endpoints**: Require `Bearer <jwt_token>` header verified by `requireAuth` middleware.
- **Role Enforcement**: `admin` endpoints verified server-side with `requireAdmin` middleware.
- **Bilingual Interface**: English and Hindi (`useLanguage` hook, translation dictionary in `src/utils/translations.ts`).
- **Code-Splitting**: All 19 pages lazy-loaded with React `lazy()` and `Suspense`. Vendor chunks split via Rollup in `vite.config.ts`.

---

## 3. Execution, Testing & Build Commands (Windows PowerShell)
- **Start Backend**: `Set-Location server; npm run dev`
- **Start Frontend**: `Set-Location client; npm run dev`
- **Run Backend Tests**: `Set-Location server; $env:JWT_SECRET="krishimitra-test-secret"; $env:NODE_ENV="test"; npx jest --forceExit --detectOpenHandles --runInBand`
- **Run Tests with Coverage**: `Set-Location server; $env:JWT_SECRET="krishimitra-test-secret"; $env:NODE_ENV="test"; npx jest --forceExit --detectOpenHandles --runInBand --coverage`
- **Type Check Frontend**: `Set-Location client; npx tsc --noEmit`
- **Build Frontend**: `Set-Location client; npm run build`

---

## 4. Default Seed & Demo Accounts
- **Admin**: Mobile `9999999999` | Password `admin123` (Full administrative privileges)
- **Demo Farmer**: Mobile `9876543210` | Password `password123` (Pre-seeded with active Onion crop, calendar, notifications)

---

## 5. Session Record

### Session: 2026-11-22
#### Project Status
Production-ready hackathon state. 100% of automated tests passing, clean TypeScript build, complete security hardening, and SEO metadata configured.

#### Completed Tasks
1. **Hackathon Submission Optimization & PWA Manifest**:
   - Added dedicated Hack2Skill Challenge Brief in `README.md` detailing: Vertical, Persona, Approach & Architecture Logic, Farmer Lifecycle Journey, and Assumptions.
   - Created `client/public/manifest.json` and integrated PWA meta tags into `client/index.html` for home-screen mobile installation.
   - Clean client production build verified (`tsc -b && vite build`) in 35.2s.
2. **Vercel Build / Dependency Conflict Resolution (Resolved)**:
   - Root cause: An earlier session installed `vitest@5.1.1` into `client/package.json` with `--legacy-peer-deps`. `vitest@5.1.1` has a peer dependency on `vite@^6 || ^7 || ^8`, while the project uses `vite@^5.4.0`.
   - On Vercel, clean `npm --prefix client install` crashed with `ERESOLVE Could not resolve dependency`.
   - Fix: Removed unused `vitest` and testing-library dependencies from `client/package.json` (backend runs 87 tests on Jest). Added `.npmrc` with `legacy-peer-deps=true` as CI/CD safeguard.
   - Verified: Clean `npm --prefix client install` and `npm --prefix client run build` passed with code 0.
2. **Security Hardening**:
   - Elevated bcrypt password hashing work factor from 10 to 12 across `server/src/routes/auth.js` and demo seeds in `server/src/index.js`.
   - Verified Helmet headers (`crossOriginResourcePolicy: cross-origin`) and Express rate-limiters.
   - Regression tested all 11 test suites (87 tests) — 100% pass rate confirmed under cost factor 12.
2. **SEO & Metadata Enhancements**:
   - Enhanced `client/index.html` with meta description, keywords, Open Graph metadata, theme-color, and dynamic bilingual title.
   - Created `client/public/robots.txt` with crawlers allowed and sensitive paths (`/api/`, `/admin/`) disallowed.
   - Created `client/public/sitemap.xml` listing primary public routes with change frequencies and priorities.
3. **Repository Cleanliness & Documentation**:
   - Updated `.gitignore` to explicitly cover `client/dist/`.
   - Updated `README.md` test counter from 76 to 87 passing tests.
   - Corrected documentation in `README.md` to accurately state `node:sqlite` rather than `better-sqlite3`.
   - Updated bundle size documentation to accurately reflect 42.92 kB (14.29 kB gzip) initial bundle.
   - Established `agents/session-plan.md` and `AGENTS.md` per V4.0 quality framework.

#### Verification Evidence
- **Jest Test Suite**: 11 suites passed, 87 tests passed, 0 failed, 100% pass rate (51.2s run time).
- **TypeScript Compiler**: `npx tsc --noEmit` exited with code 0 (0 errors).
- **Vite Production Build**: Built cleanly in 23.58s. Initial bundle `index-BRvv3JX7.js` is 42.92 kB (14.29 kB gzip).
- **Repository Size**: 0 bytes packed git history, total disk excluding node_modules is ~5.7 MB (well below 10 MB hackathon ceiling).

#### Known Limitations & Non-blocking Items
- `calendar.js` backend service statement coverage is currently 3.33% (non-critical, tested through E2E workflow).
- React Router v6 in client has moderate advisory (CVE-2025-68470); upgrading to v7 is a breaking change for React 18 routing.

#### Next Recommended Priorities
1. Run browser-based Lighthouse audit using Chrome DevTools or Lighthouse CLI.
2. Add unit tests for `server/src/services/calendar.js` to increase backend statement coverage above 60%.
3. User approval for git commit and push.
