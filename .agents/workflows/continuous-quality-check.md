# Continuous Quality-Check Workflow

This workflow executes on every code modification to prevent regressions and enforce quality gates.

## Step 1: Pre-Change Impact Assessment
1. Identify the targeted files and dependent components/endpoints.
2. Confirm existing tests cover the affected functionality.

## Step 2: Implementation & Conventions
1. Implement the minimal, high-clarity change adhering to existing patterns.
2. Ensure no hardcoded secrets or unnecessary dependencies are added.

## Step 3: Type Safety & Build Verification
Execute TypeScript check and Vite production bundling:
```bash
npm --prefix client run build
```
- Must succeed with code 0.
- Check chunk sizes to ensure no single vendor chunk exceeds recommended limits.

## Step 4: Automated Test Execution
Run the full automated test suite:
```bash
npm --prefix server test
```
- All 11 test suites (87+ test cases) must pass.
- Zero failures or skipped tests allowed.

## Step 5: Accessibility & Security Verification
- Ensure any added input has an associated `<label htmlFor="...">`.
- Verify touch targets measure at least 44 × 44px.
- Confirm queries use parameterized SQLite statements.
- Verify security headers and rate limits remain active.

## Step 6: Git Hygiene & Size Check
```bash
git count-objects -vH
```
- Total repo size must remain strictly under 10 MB.
