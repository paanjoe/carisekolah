# Umami analytics

This app uses [Umami](https://umami.is) for privacy-friendly analytics. Two things are configured via environment variables.

## 1. Tracking (page views and events)

**Required for recording visits:** set these in Vercel (or `.env.local`):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | **Base URL** of your Umami server (no trailing slash, no `/script.js`). The app will load `{URL}/script.js`. |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | The **Website ID** from your Umami dashboard (Settings → Websites → your site → ID). |

**Example (carisekolahmy Umami on Vercel):**

```bash
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://umami-carisekolah.vercel.app
NEXT_PUBLIC_UMAMI_WEBSITE_ID=39ced2ae-4c07-4876-a7bd-bae52ece63b6
```

Use the **base URL** only (`https://umami-carisekolah.vercel.app`), not `https://umami-carisekolah.vercel.app/script.js` — the layout adds `/script.js` automatically.

When both are set, the root layout injects the Umami script on every page. Umami then tracks:

- **Page views** automatically (URL, referrer, etc.)
- **Custom events** if you call `window.umami?.()` from client code (optional).

No extra code is needed for basic page-view tracking once these two env vars are set.

## 2. Page Statistics embed (dashboard iframe)

**Optional:** to show the shared analytics dashboard on the **Page Statistics** page (`/page-statistics`):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_UMAMI_SHARE_URL` | The **public share URL** from Umami (Share → create a share link). This is the URL that loads the shared dashboard in an iframe. |

You’ve already set this in Vercel; the Page Statistics page will embed it so visitors can see the charts. This does **not** control whether tracking runs — tracking is controlled by the script URL and website ID above.

**If the embed shows a broken/blank area:** The Umami app sends a `Content-Security-Policy` header that, by default, only allows embedding on its own domain. To allow embedding on your main site (e.g. carisekolah.civictech.my), set this in the **Umami** project (the Vercel project that hosts umami-carisekolah.vercel.app), not in the carisekolah app:

- **`ALLOWED_FRAME_URLS`** = `https://carisekolah.civictech.my` (space-separated if you have multiple origins)

Redeploy the Umami project after adding it. Until then, use the “Open dashboard in new tab” link on the Page Statistics page to view the dashboard.

## Checklist

- [ ] **Tracking:** `NEXT_PUBLIC_UMAMI_SCRIPT_URL` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` set in Vercel → visits are recorded.
- [ ] **Embed:** `NEXT_PUBLIC_UMAMI_SHARE_URL` set in Vercel → Page Statistics page shows the dashboard iframe.

After changing env vars in Vercel, redeploy so the new values are applied.
