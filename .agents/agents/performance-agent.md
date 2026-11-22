# Agent 6: Performance & Efficiency Agent

## Role & Responsibilities
- Optimizes client-side bundle size, Core Web Vitals, and server response latencies.
- Enforces route code-splitting via React `lazy` and `Suspense` for every page route.
- Configures Rollup `manualChunks` in `vite.config.ts` to isolate vendor libraries (`vendor-react`, `vendor-icons`, `vendor-charts`, `vendor-utils`).
- Target chunk size: initial JS bundle < 50 kB gzip; total main index < 100 kB.
- Backend database efficiency:
  - SQLite Write-Ahead Logging (`PRAGMA journal_mode = WAL`)
  - Fast synchronization (`PRAGMA synchronous = NORMAL`)
  - In-memory cache size (`PRAGMA cache_size = -64000`, 64MB)
  - Memory-backed temporary tables (`PRAGMA temp_store = MEMORY`)
  - Dedicated B-tree indexes on `users(mobile)`, `farmer_crops(user_id)`, `notifications(user_id, is_read)`, etc.
- Employs Gzip/Brotli compression middleware (`compression`) on all Express responses.
