# PyCon US 2026 — Speaker & Talks Browser

A mobile-first, installable web app for browsing PyCon US 2026 speakers, talks, and schedule. Built as a static Next.js site over scraped data from `us.pycon.org`.

> Unofficial. Data is scraped at build time; the site has no runtime dependency on pycon.org.

## What you can do

- **Now & Next** — home page shows what's happening *right now* and what's starting in the next hour, updated live every 30s during conference days
- **Browse all 122 speakers** — photos, bios, and links to each speaker's sessions
- **Search across speakers, talk titles, and abstracts** — live, client-side, no server round-trips
- **View talk details** — title, abstract, day/time/room, experience level, cross-linked speakers
- **Filter the schedule** by day (Wed–Sun) and by kind (talks vs tutorials)
- **Star favorites** — saved to `localStorage` on your device, persists across visits
- **Conflict detection on favorites** — automatic warning when two starred sessions overlap, with links to both
- **Share talks** — one-tap native share sheet (Web Share API) on mobile, copy-link fallback on desktop
- **Search speakers on LinkedIn / GitHub** — one-tap external search by speaker name; opens the LinkedIn or GitHub app on mobile via OS universal links if installed
- **Install to home screen + works offline** — PWA manifest, maskable icon, and a service worker that precaches the app shell and serves every visited route from cache. Designed for unreliable conference WiFi.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Scraping | `cheerio` + Node `fetch` (no headless browser needed) |
| Hosting | Vercel (static site; Fluid Compute runtime available but not required) |
| Persistence | `localStorage` (favorites only — no backend) |

## Architecture

```
us.pycon.org HTML
      │
      ▼
scripts/scrape.ts ── (24h-cached .cache/*.html)
      │
      ▼
data/talks.json + data/speakers.json
      │
      ▼
lib/data.ts (typed JSON imports)
      │
      ▼
app/*.tsx (Server Components)
      │
      ▼
244 static HTML pages (5 routes + 122 speakers + 115 talks)
```

Every page is statically pre-rendered via `generateStaticParams`, so the deployed site is plain HTML/JS — zero runtime fetches to PyCon's servers.

### Scraper

`scripts/scrape.ts` walks:
1. `/2026/schedule/talks/` and `/2026/schedule/tutorials/` → unique presentation IDs
2. each `/schedule/presentation/{id}/` → title, abstract, time, room, level, speaker links
3. each linked `/speaker/profile/{id}/` → name, photo, bio

Resilience: SHA-keyed disk cache (`.cache/`) with 24h TTL, 4× exponential-backoff retry, capped concurrency (4 simultaneous fetches) to be polite to pycon.org. A single re-run after a network blip resumes near-instantly from cache.

### Offline / PWA

`public/sw.js` is a hand-rolled service worker (~50 LoC) registered from a client component only in production builds (HMR + caching don't mix). Strategy:

- **Pre-cache on install:** `/`, `/speakers`, `/schedule`, `/favorites`, the manifest, and the icon — the four entry routes load instantly with no network.
- **Cache-first** for `/_next/static/*` (content-hashed, immutable) and the speaker photos on `pycon-assets.s3.amazonaws.com`.
- **Stale-while-revalidate** for same-origin HTML so visited routes are available offline on next reload.
- Cache name is versioned (`pycon-app-v1`); bump it to force-evict on breaking changes.

## Development

```bash
npm install
npm run scrape   # populates data/*.json; cached for 24h
npm run dev      # http://localhost:3000
npm run build    # production build (regenerates all 244 static pages)
```

### Refreshing data

```bash
rm -rf .cache    # optional: force re-fetch from pycon.org
npm run scrape
npm run build
```

## Deployment

Hosted on [Vercel](https://vercel.com). Any push to `main` triggers an automatic build & deploy. The build re-uses the committed `data/*.json`; no scraping happens on Vercel's servers.

## Project layout

```
app/
  page.tsx                # /
  speakers/page.tsx       # /speakers (list + search)
  speakers/[id]/page.tsx  # /speakers/:id
  talks/[id]/page.tsx     # /talks/:id
  schedule/page.tsx       # /schedule (day + kind filter)
  favorites/page.tsx      # /favorites
  layout.tsx              # shared header + bottom nav
components/               # SpeakerCard, TalkCard, FavoriteStar, NowAndNext, ShareButton, *Client
lib/
  data.ts                 # JSON loaders, search-URL helpers
  types.ts                # Speaker, Talk
  time.ts                 # Conference dates, time parsing, conflict detection
  useFavorites.ts         # localStorage hook
scripts/scrape.ts         # scraper
data/                     # generated speakers.json + talks.json (committed)
public/
  manifest.webmanifest    # PWA manifest
  sw.js                   # Service worker (offline support)
  *.svg                   # Icons
```

## License

MIT. Data on this site is owned by the Python Software Foundation / individual speakers; this app simply presents publicly available information for personal use during the conference.
