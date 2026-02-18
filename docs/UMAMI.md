# Umami analytics

This app uses [Umami](https://umami.is) for privacy-friendly analytics. Two things are configured via environment variables.

## 1. Tracking (page views and events)

**Required for recording visits:** set these in Vercel (or `.env.local`):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | **Base URL** of your Umami server (no trailing slash, no `/script.js`). Must match the script URL shown in your Umami dashboard (Settings → Websites → your site → Tracking code). The app loads `{URL}/script.js`. |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | The **Website ID** from your Umami dashboard (same page; copy the ID from the tracking code). |

**Example (carisekolah production):**

```bash
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://analytics.carisekolah.civictech.my
NEXT_PUBLIC_UMAMI_WEBSITE_ID=39ced2ae-4c07-4876-a7bd-bae52ece63b6
```

Use the **base URL** only (e.g. `https://analytics.carisekolah.civictech.my`), not `.../script.js` — the layout adds `/script.js` automatically.

When both are set, the root layout injects the Umami script on every page. Umami then tracks:

- **Page views** automatically (URL, referrer, etc.)
- **Custom events** if you call `window.umami?.()` from client code (optional).

No extra code is needed for basic page-view tracking once these two env vars are set.

### Events not showing? Troubleshooting

1. **Redeploy after changing env vars**  
   Next.js bakes `NEXT_PUBLIC_*` values into the build. If you added or changed these in Vercel after the last deploy, the live site may still have old (or empty) values. **Trigger a new production deploy** so the build uses the current env vars.

2. **Match the Umami dashboard**  
   In Umami → Settings → Websites → your website, check the **Tracking code** snippet. Your `NEXT_PUBLIC_UMAMI_SCRIPT_URL` must be exactly the **origin** of the script URL (e.g. `https://analytics.carisekolah.civictech.my`). Your `NEXT_PUBLIC_UMAMI_WEBSITE_ID` must match the `data-website-id` in that snippet.

3. **Umami website domain**  
   In the same Umami website settings, ensure the **Domain** (e.g. `carisekolah.civictech.my`) matches the site you’re loading. Some setups ignore or reject events from domains that don’t match.

4. **Confirm script and requests in the browser**  
   Open your live site (e.g. `https://carisekolah.civictech.my`), open DevTools → **Network**. Reload the page. Check that:
   - A request to `https://analytics.carisekolah.civictech.my/script.js` (or your script URL) succeeds.
   - After that, requests to your Umami origin (e.g. `/api/send`) appear when you navigate.  
   If the script is blocked, check the **Console** for Content-Security-Policy or other errors.

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

- [ ] **Tracking:** `NEXT_PUBLIC_UMAMI_SCRIPT_URL` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` set in Vercel (and **redeploy** so the build picks them up) → visits are recorded.
- [ ] **Embed:** `NEXT_PUBLIC_UMAMI_SHARE_URL` set in Vercel → Page Statistics page shows the dashboard link / auto-open.

**Important:** After adding or changing any `NEXT_PUBLIC_*` env vars in Vercel, trigger a new production deploy. The values are embedded at build time; without a redeploy, the old build keeps the old (or empty) values.
