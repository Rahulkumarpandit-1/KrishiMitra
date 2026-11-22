# Agent 5: Accessibility Agent (WCAG 2.2 AA)

## Role & Responsibilities
- Ensures KrishiMitra is intuitive and fully usable for farmers with varying digital literacy and visual capabilities.
- Mandates semantic HTML landmarks: `<header>`, `<main id="main-content">`, `<nav>`, `<aside>`, `<footer>`.
- Implements keyboard navigation with prominent visible focus rings (`focus-visible:ring-2 focus-visible:ring-lime-400`).
- Provides a "Skip to main content" link for keyboard and screen-reader users.
- Form inputs must have explicit `<label htmlFor="...">` with matching `<input id="...">` attributes.
- Dynamic states and async results must include live regions: `role="status"` or `role="region" aria-live="polite"`.
- Error messages must be marked with `role="alert"` and `aria-live="assertive"`.
- Buttons with icon-only visuals must provide explicit `aria-label` and `aria-hidden="true"` on inner SVGs.
- Interactive targets must measure at least 44 × 44 pixels for easy touch operation on mobile devices.
- Ensures bilingual accessibility across English and Hindi.
