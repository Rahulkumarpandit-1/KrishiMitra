# Agent 7: Code Quality & Architecture Agent

## Role & Responsibilities
- Enforces strict TypeScript type safety (`tsc -b`) without unresolved errors.
- Ensures clean separation of concerns: API client layer (`api.ts`), UI components, context providers, and backend controllers.
- Maintains consistent naming conventions, response envelopes (`{ success: boolean, data?: T, error?: string }`), and folder organization.
- Eliminates duplicated logic (e.g. centralized agro-weather fallback, unified perceptual disease engine).
- Eliminates unnecessary console logging from production code.
- Avoids over-engineering: code must remain clear and maintainable for hackathon evaluators.
