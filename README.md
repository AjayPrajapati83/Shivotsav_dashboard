# SHIVOTSAV 2026 — MYTHOS: The Legend Awakens

> ⚠️ **This repository must remain PRIVATE.** It contains hardcoded credentials.

Live points-table dashboard for SHIVOTSAV 2026, an inter-college fest themed
"MYTHOS — The Legend Awakens", managed by ESSSqube Events (ES³) and hosted by SVM College.

## Tech Stack

- **Next.js 14+** (App Router) + TypeScript (strict)
- **Tailwind CSS** + shadcn/ui (admin) + Framer Motion (CL animations)
- **Supabase** (Postgres only, free tier) — no Supabase Auth
- **jose** for signed JWT session cookies
- **zod** for validation
- **server-only** to guard secret modules

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Go to **SQL Editor** and run:
   - First: `supabase/schema.sql` (creates tables, triggers, views, RLS)
   - Then: `supabase/seed.sql` (inserts 30 colleges, 36 events, scoring rules)
3. Copy your project URL and **service role key** (Settings → API).

### 2. Configure Environment

Create `.env.local` in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
SESSION_SECRET=generate-a-random-string-of-32-plus-characters
```

> ⚠️ **All env vars are server-only.** None are prefixed with `NEXT_PUBLIC_`.
> The browser never talks to Supabase directly.

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login)

### 4. Login Credentials

| Role  | Email                          | Password           | Home Page |
|-------|--------------------------------|---------------------|-----------|
| CL    | CLFORSHIVOTSAV@SHIVOTSAV.COM   | Shivotsav2026CL@    | `/`       |
| Admin | AjayAdmin90@SHIVOTSAV.COM      | Ajadmin@@9898       | `/admin`  |

### 5. Deploy to Vercel

1. Push to a **private** GitHub repo.
2. Import into Vercel.
3. Add the three env vars above in Vercel's project settings.
4. Deploy. Done.

## Features

### CL Dashboard (/)
- Hero with Shivotsav, ESSSqube, and SVM College logos
- Live leaderboard showing **rank only** (no points exposed)
- Auto-refresh every 15 seconds
- "Select your house" for personalised rank pinning
- Event cards with podium points, department filters
- Scoring rules modal
- Sponsors section (drop images in `/public/sponsors/`)
- Mobile-first with cosmic dark theme + gold shimmer

### Admin Panel (/admin)
- **Standings** — full table with rank, event points, custom ±, total + CSV export
- **Departmental Trophies** — per department, with tie handling
- **Colleges** — add/rename/activate/deactivate
- **Assign Points** — event→college→result flow, live preview, quick bonuses (Full Slot +2000, PR Rally +500), custom adjustments
- **Deduct Points** — NPOOR/NPOR/NPOQ penalties with confirmation dialog, custom deductions
- **History** — audit log, void/unvoid with reason, filters, CSV export
- Light theme, bottom tabs on mobile

## Replacing Placeholder Assets

| Asset | Location | How |
|-------|----------|-----|
| Shivotsav logo | `/public/logos/shivotsav.png` | Replace file, keep name |
| ESSSqube logo | `/public/logos/esssqube.png` | Replace file, keep name |
| SVM College logo | `/public/logos/svm-college.png` | Replace file, keep name |
| Sponsor images | `/public/sponsors/` | Add files + update `src/config/sponsors.ts` |
| House crests | `/public/crests/` | Add SVG files + update `crest_url` via admin |

## Architecture

```
src/
  app/
    (public)/login/        — Login page
    (cl)/                  — CL dashboard
    admin/                 — Admin panel (standings, colleges, assign, deduct, history)
    api/                   — Login, logout, leaderboard, admin APIs
  components/
    cl/                    — Hero, Leaderboard, EventGrid, Starfield, etc.
    ui/                    — shadcn/ui primitives
  config/                  — branding.ts, sponsors.ts
  server/                  — credentials.ts, session.ts, db.ts, leaderboard.ts, admin.ts
  lib/                     — types.ts, scoring.ts, utils.ts
  middleware.ts            — JWT verification, role routing
```

## Security

- Credentials only in server-only modules
- JWT session cookies (httpOnly, Secure, SameSite)
- RLS deny-all on every Supabase table
- CL never receives points data (stripped on server)
- Rate limiting on login
- Timing-safe password comparison
- Security headers (CSP, HSTS, X-Frame-Options, etc.)

## Developer

**Developed by AJAY Prajapati**


## Performance Optimizations

- Mobile animations completely removed for instant card rendering
- Admin tables optimized for touch scrolling
- Responsive layouts for all screen sizes
