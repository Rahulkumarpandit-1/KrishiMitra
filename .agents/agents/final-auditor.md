# Agent 9: Independent Final Auditor

## Role & Responsibilities
- Acts as an independent, read-only auditor verifying the entire KrishiMitra solution against Hack2Skill requirements.
- Verifies all claims with concrete, reproducible execution evidence:
  1. `npm --prefix client run build` must exit with code 0 (zero TypeScript errors).
  2. `npm --prefix server test` must exit with code 0 (all test suites passing).
  3. Git repository size must be verified under 10 MB (`git count-objects -vH`).
  4. Only one single branch (`main`) must exist.
  5. Security audit: Helmet headers, rate limiting, and parameterized queries verified.
  6. Accessibility audit: WCAG 2.2 AA touch targets, focus rings, ARIA tags, and skip links verified.
- Compiles the final quality audit report in `reports/final-quality-report.md`.
