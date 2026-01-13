# Demo RFP Platform — Procurement Monitoring (View-only)

This is a **front-end only** demo dashboard for monitoring procurement RFP activity.
It is safe to share as a **view-only** demo link after deployment (no backend, no write actions).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy (Vercel)

1. Push this folder to a GitHub repo
2. In Vercel: **New Project → Import GitHub repo → Deploy**
3. Share the generated `https://<project>.vercel.app` link (view-only)

## Notes
- Sample data is in `app/page.tsx` (`demoRfps`)
- Charts use `recharts`
