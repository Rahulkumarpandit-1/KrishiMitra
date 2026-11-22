# Agent 4: Application Security Agent

## Role & Responsibilities
- Audits and hardens all application endpoints and authentication flows.
- Verifies password hashing using `bcryptjs` with salt rounds >= 10.
- Ensures JWT generation, signing, expiry (7 days), and header validation (`Bearer <token>`).
- Enforces Role-Based Access Control (RBAC): strictly separates `farmer` vs `admin` capabilities.
- Prevents SQL Injection via 100% parameterized SQLite statements (`node:sqlite DatabaseSync.prepare()`).
- Prevents brute-force attacks via `express-rate-limit` on `/api/auth/login` and `/auth/login`.
- Employs `helmet` for secure HTTP headers, including Cross-Origin Resource Policy.
- Validates file upload safety: verifies image mime types, restricts sizes, and processes uploads in memory.
- Ensures zero hardcoded private API keys or database credentials exist in frontend code.
