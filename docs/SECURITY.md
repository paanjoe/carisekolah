# Security

This document summarizes security practices for **carisekolahmy** (official domain: carisekolah.civictech.my) and how to report vulnerabilities.

## Reporting vulnerabilities

If you discover a security issue, please report it responsibly. You can open a private security advisory on GitHub (Repository → Security → Advisories) or contact the maintainers. Do not open public issues for security vulnerabilities.

## Implemented measures

### HTTP security headers

Configured in `next.config.ts`:

- **Content-Security-Policy (CSP)** — Restricts script, style, image, and connect sources. Umami analytics origin is added when `NEXT_PUBLIC_UMAMI_SCRIPT_URL` is set. `frame-ancestors 'none'` prevents embedding.
- **Strict-Transport-Security (HSTS)** — Applied in production only.
- **X-Content-Type-Options: nosniff** — Prevents MIME sniffing.
- **Referrer-Policy: strict-origin-when-cross-origin** — Limits referrer leakage.
- **X-Frame-Options: DENY** — Prevents clickjacking.

### API hardening

- **`/api/schools/suggest`** — Query parameters validated with Zod (`q` max length 200, `limit` 1–20). Invalid input returns 400. User input is normalized and used only for in-memory search (no raw injection into external systems).
- **Rate limiting** — In-memory rate limiter (see `lib/rate-limit.ts`) applied to the suggest API: 60 requests per minute per client identifier (IP from `x-forwarded-for` or fallback). Exceeding returns 429 with `Retry-After`.

### Data and configuration

- No secrets in the repo. Credentials (e.g. Supabase, analytics) are via environment variables.
- Dynamic route params (e.g. `[schoolCode]`) are decoded and validated; invalid lookups return 404 via `notFound()`.

## Running checks

- **Dependency audit**
  ```bash
  npm audit
  ```
  Address reported vulnerabilities where possible; use `npm audit fix` with care to avoid breaking changes.

- **Lint**
  ```bash
  npm run lint
  ```

## Deployment

- The official production domain is **carisekolah.civictech.my**.
- Vercel (or similar) should set `NODE_ENV=production` so HSTS and production CSP apply.
- Ensure env vars for analytics/optional services are set only in the host’s environment, not in the repository.
