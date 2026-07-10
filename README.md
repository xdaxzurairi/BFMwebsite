# Handoff: Baseball Federation Malaysia (BFM) — League Management Web App

## Overview
A public-facing website + role-based management console for the Baseball Federation of Malaysia (BFM). It covers:
- A public marketing/browse site (clubs, players, tournaments, standings, matches, news)
- A **Club Manager** console (manage own club's players/officials, register for tournaments)
- An **Admin** console (approve registrations, manage all clubs/tournaments/matches/payments/news)

Bilingual UI (Bahasa Melayu + English), togglable at runtime.

## About the Design Files
The files in `design/` are **design references built in HTML/React (via Babel, no build step)** — they demonstrate the intended look, motion, copy, and interaction flows. They are **not production code to ship as-is**. Your task is to **recreate this design in the target stack** — this project is intended for **Next.js + Supabase + Vercel** (per the product brief) — using Next.js' routing/data patterns, Supabase Postgres + Auth + RLS, and Supabase client libraries, rather than the localStorage-backed mock store used in the prototype.

A companion `schema.sql` is included as a **MySQL/MariaDB** reference schema — port its tables/columns/constraints to Postgres (Supabase) syntax; the shapes and relationships should carry over directly (see "Porting the schema to Supabase/Postgres" below).

## Fidelity
**High-fidelity.** Colors, type, spacing, motion, and copy (BM + EN) in the HTML prototype are final-intent — recreate them pixel-for-pixel where practical. The layout is responsive-ready but was primarily designed/tested at desktop widths (~1280–1440px); tighten breakpoints as needed for mobile.

## How the prototype is organized
```
design/
  Baseball Federation Malaysia.html   -- entry point, loads React/Babel + all scripts below
  app/
    styles.css      -- design tokens (colors, type, shadow, radius) + all component CSS
    data.js          -- mock data layer: seed shape, i18n dictionary, CRUD functions (localStorage-backed)
    ui.jsx           -- shared primitives: Button, Modal, Field/Input/Select, StatusBadge, Avatar, ClubLogo,
                        Reveal (scroll animation), Counter (animated count-up), Countdown, icon set
    landing.jsx       -- welcome/landing page: 3 hero variants (Stadium/Diamond/Bold), stats band,
                        next-tournament countdown, featured clubs, news, join CTA, marquee ticker
    browse.jsx        -- public pages: Clubs, ClubDetail, PlayerDetail, Players (leaderboard),
                        Tournaments, TournamentDetail, Matches, Standings, News
    dashboard.jsx      -- Club Manager + Admin dashboards, ALL CRUD forms/modals
    app.jsx            -- app shell: React context (role/lang/route), Nav, SignIn, Footer, router/outlet
  assets/
    bfm-logo.png        -- full BFM wordmark/logo lockup (transparent PNG, cleaned from provided source)
    bfm-crest.png        -- crest/tiger mark only (used in nav, favicon, cards)
    field.jpg             -- baseball field/diamond photo used as hero background texture
schema.sql            -- MySQL/MariaDB reference schema (tables, FKs, views, no seed data)
```
Note: the prototype currently ships with **demo data cleared** (all tables start empty) — the Admin console is meant to be the first stop to add clubs/tournaments/news, then Club Managers add players/officials.

## Screens / Views

### 1. Landing / Welcome page (`landing.jsx` → `Landing`)
- **Purpose**: Public entry point; sets tone, funnels to Explore or Register.
- **Layout**: Full-bleed hero (100vh) → marquee ticker (recent results) → 4-up stats band → next-tournament countdown band (dark) → featured clubs (4-up grid) → news (3-up grid, first card larger) → join CTA banner → footer.
- **3 selectable hero variants** (persisted to localStorage, switchable via a bottom-right pill control on the hero):
  1. **Stadium** (`HeroStadium`): full-bleed `assets/field.jpg` background with a dark green gradient scrim, parallax on scroll (translateY via scroll listener, factor 0.18 for bg, -0.12 for a decorative ring), large headline (Archivo 900, NOT Anton — Anton's tall metrics cause line overlap on wrapped text), a frosted glass card showing the BFM logo lockup, and a floating "2026 Season is live" card animated with a 6s `floaty` keyframe (positioned `bottom:-74px` so it sits below/clear of the logo card, not overlapping it).
  2. **Split Diamond** (`HeroSplit`): 50/50 split — left cream panel with headline/CTAs, right dark-green panel with a rotated-square "diamond" motif (CSS transform, not SVG) containing the crest in a white circle, plus a stats card.
  2. **Bold Type** (`HeroType`): full-bleed field photo, dark gradient overlay, giant centered headline with one line in stroke-only text (`-webkit-text-stroke`), background marquee of club names at low opacity, crest above the kicker.
- **Motion**: `Reveal` component uses `IntersectionObserver` to add an `in` class (fade+translateY) as sections scroll into view; `Counter` animates numbers counting up on first intersection (cubic ease-out, 1400ms); `Countdown` recomputes a day/hour/min/sec split every second via `setInterval`.

### 2. Public browse pages (`browse.jsx`)
- **ClubsPage**: search + state filter + category filter (club/school) chips → responsive card grid (club color band, logo badge overlapping -30px, name, state, category+player-count badges).
- **ClubDetail**: colored hero band (club's brand color) with logo, name, manager/state/player-count; 3 stat cards (players/hits/runs); tabs for Roster (sortable-by-avg table) and Officials (card grid).
- **PlayerDetail**: split card — colored panel with giant jersey number, info panel with stat tiles (batting avg is the "hero" stat, larger + clay-colored).
- **PlayersPage**: league-wide leaderboard, search + club filter, sorted by batting average desc.
- **TournamentsPage** / **TournamentCard**: status filter chips (all/upcoming/ongoing/completed); card shows status badge, level badge, description, dates/venue, teams-registered/max, entry fee.
- **TournamentDetail**: dark hero with status/level/category badges, title, description, a metrics grid (dates, venue, entry fee, prize pool, teams, registration close), then tabs: Teams (registered clubs), Matches (list), Standings (table). Manager role sees a "Register" CTA here if status is upcoming.
- **MatchesPage/MatchList**: card per match, round badge, home/away club logos + names, big score (or status badge if not completed yet).
- **StandingsPage/StandingsTable**: per-tournament dropdown (only tournaments with completed matches show), table with P/W/L/D/RD/Pts, computed client-side from match results (see Standings Logic below).
- **NewsPage**: card grid, image placeholder + category badge + date + title + body excerpt.

### 3. Manager dashboard (`dashboard.jsx` → `ManagerDashboard`)
Sidebar sections: Overview, **Club Profile** (edit name/state/manager/phone/email/color), **Manage Players** (full CRUD — add/edit/deactivate, jersey number uniqueness, position dropdown, medical clearance checkbox), **Manage Officials** (full CRUD), **My Registrations** (list + withdraw + a "Register for Tournament" modal that lists open tournaments, shows entry fee/dates/reg-close, prevents duplicate registration, submits as `pending`).
If the manager's linked club doesn't exist yet (fresh/empty data), shows an empty-state message instead of crashing — a real app would derive `club_id` from the authenticated user's profile row.

### 4. Admin dashboard (`dashboard.jsx` → `AdminDashboard`)
Sidebar sections: Overview (metrics + pending-registrations quick-approve list), **Registrations** (approve/reject/delete, status filter chips), **Tournaments** (full CRUD, create/edit modal with all schema fields), **Matches** (schedule new matches, edit scores/status, delete), **Clubs** (full CRUD, color picker), **News** (full CRUD, bilingual fields), **Payments** (record payment against an approved registration, delete/refund, running revenue total).

### 5. Sign-in (`app.jsx` → `SignIn`)
Three role cards (Public / Club Manager / Admin) — this is a **demo-mode role switcher**, not real auth. Replace with Supabase Auth + a `role` claim/column check.

## Interactions & Behavior
- **Global router**: simple client-side state machine in `app.jsx` (`route = {name, params}`), persisted to `localStorage` (`bfm_prefs`) so refresh doesn't lose place. Port to Next.js file-based routing (`app/` router) with real URLs.
- **Toasts**: `window.toast(msg, isError)` dispatches a custom event; `ToastHost` renders/auto-dismisses after 2.8s.
- **Confirm dialogs**: `useConfirm()` hook returns `{ask(message, onYes), node}` — renders a Modal; used before every delete.
- **Modals**: `Modal` component (Escape-to-close, click-outside-to-close, optional `wide`), used for every create/edit form.
- **Language toggle**: `lang` is `0` (BM) or `1` (EN), indexes into the `DICT` object in `data.js` (`DICT['key'][lang]`). Persisted to localStorage.
- **Nav becomes transparent-on-dark ("on-hero")** only on the landing route while unscrolled; switches to solid/light on scroll or other routes (scroll listener toggles a class).

## State Management (prototype) → replace with real data layer
The prototype's `app/data.js` is an in-memory object (`db`) seeded once, mutated by CRUD functions, and persisted to `localStorage` (key `bfm_data_v4`) with a pub/sub (`subscribe`) so React re-renders on any mutation. In the real app:
- Replace with **Supabase Postgres tables** (see schema below) queried via `@supabase/supabase-js` (or `@supabase/ssr` in Next.js Server Components/Route Handlers).
- Replace the pub/sub with React Query / SWR or Supabase Realtime subscriptions.
- Replace the demo `SignIn` role-switcher with **Supabase Auth**; store `role` and `club_id` on a `profiles`/`users` table (already modeled in `schema.sql`), and gate pages with middleware + RLS policies (see below).

## Standings logic (must be replicated exactly)
Computed client-side from completed matches for a given tournament (see `BFM.standingsFor` in `data.js` and the `v_standings` SQL view):
- For each completed match, both teams get `mp += 1`, `runs_for`/`runs_against` accumulate.
- Win = 3 points, draw = 1 point each, loss = 0.
- Sort by `points DESC`, then `run_diff DESC`.
- `schema.sql` includes a `v_standings` SQL view doing the same math server-side (recommended: port this to a Postgres view or a Supabase Edge Function/RPC).

## Design Tokens (from `app/styles.css`, defined as CSS custom properties in `:root`)
**Colors** (OKLCH, with fallbacks noted):
- `--field: oklch(0.47 0.10 152)` (primary green), `--field-deep`, `--field-darker`, `--field-bright`, `--field-glow`
- `--clay: oklch(0.635 0.145 47)` (accent/CTA), `--clay-deep`, `--clay-bright`
- `--cream: oklch(0.965 0.014 84)` (page bg), `--paper` (card bg), `--sand` (muted bg)
- `--ink: oklch(0.22 0.022 152)` (primary text), `--ink-soft`, `--ink-faint`, `--line`, `--line-soft`
- Status colors: `--ok`, `--warn`, `--bad`, `--info`

**Typography**:
- Display/headline: `'Anton'` — **only for large single-line numerals/short words** (Anton's tall glyph metrics cause overlap on wrapped multi-line text; use Archivo 900 for wrapping headlines instead — see hero implementation note above).
- Body/UI: `'Archivo'` (400/500/600/700/800/900 loaded) — note: the "Baseball Federation Malaysia" nav wordmark specifically uses `'Anton'` per a later direct edit (single line, safe).
- Monospace (kickers, labels, stat labels, badges): `'Space Mono'`.
- A Google Font `Open Sans` stylesheet link was also added to `<head>` per a direct edit request (400/500/600/700) — check `Baseball Federation Malaysia.html` head for current intent before dropping it.

**Shape**: `--r-sm: 6px`, `--r: 12px`, `--r-lg: 20px`, `--r-xl: 28px`. Pills/buttons are fully rounded (`border-radius: 999px`).
**Shadow**: `--shadow-sm`, `--shadow`, `--shadow-lg` (all soft, green-tinted).
**Motion easing**: `--ease: cubic-bezier(.22,.61,.36,1)`, `--ease-out: cubic-bezier(.16,1,.3,1)`.

## Assets
- `assets/bfm-logo.png` / `assets/bfm-crest.png` — derived from a user-provided BFM tiger-crest logo file; the original had a baked-in checkerboard (not real alpha) which was **chroma-keyed out programmatically** (low-saturation, high-lightness pixels → transparent) and auto-cropped to the crest bounding box. If a cleaner/official vector (SVG/AI) logo exists, use that instead of this raster derivative.
- `assets/field.jpg` — a stock baseball-diamond photo provided by the user; used as hero background/texture. Confirm licensing before using in production; swap for BFM's own photography if available.
- All three images were also inlined as base64 into `app/assets-data.js` (`window.BFM_ASSETS = {logo, crest, field}`) purely so a static single-file bundler could package them — **this file is a build artifact, not a source of truth**; use the actual files in `assets/` in the real app (e.g. Next.js `public/` folder or Supabase Storage).

## Porting the schema to Supabase/Postgres
`schema.sql` (root of this handoff) is written for **MySQL/MariaDB**. Key adjustments for Postgres/Supabase:
- `INT UNSIGNED AUTO_INCREMENT` → `bigint generated always as identity` (or `uuid default gen_random_uuid()` if you prefer UUID PKs, which is idiomatic for Supabase + RLS).
- `ENUM(...)` columns → Postgres native `ENUM` types (`CREATE TYPE x AS ENUM (...)`) or a `CHECK` constraint on `text`.
- `DATETIME` → `timestamptz`; `DATE` stays `date`.
- The `v_standings` / `v_player_stats` views port almost directly — swap `IF`/`CASE WHEN` syntax stays valid in Postgres.
- Add **Row Level Security (RLS)** policies once ported:
  - `clubs`, `tournaments`, `matches`, `news`, `v_standings`: public `SELECT`.
  - `players`, `officials`: `SELECT` public; `INSERT/UPDATE/DELETE` restricted to the owning club's manager (`auth.uid()` maps to a `users.user_id` whose `club_id` matches the row) or admin role.
  - `registrations`: club managers can `INSERT` for their own club and `SELECT` their own; only admin role can `UPDATE status` (approve/reject) or `DELETE`.
  - `payments`: admin-only read/write (or restrict `SELECT` to the owning club + admin).
  - Use a `role` column/claim (`user` / `club_manager` / `admin` / `technical_admin`) checked via a Postgres function or Supabase custom claim in JWT.

## Files
- `design/Baseball Federation Malaysia.html` — open directly in a browser to see the working prototype (no build step; loads React/ReactDOM/Babel from a CDN + the `app/*.js(x)` files below it).
- `design/app/*.js` / `*.jsx` — all prototype source, described above.
- `design/assets/*` — logo/crest/photo assets.
- `schema.sql` — MySQL/MariaDB reference schema (tables + FKs + views), **no seed/demo data** (ship empty, populate via the app's own CRUD).
