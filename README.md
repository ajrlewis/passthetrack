<p align="center">
  <img src="public/branding/logo.png" alt="PassTheTrack logo" width="140" />
</p>

# PassTheTrack

PassTheTrack is a browser-based music challenge game where players guess tracks from short audio previews, with scoring that rewards faster recognition and strategic play.

Live site: https://www.passthetrack.com/

## Project Overview

This repository contains the Next.js web app that powers PassTheTrack. Players search for songs, run timed clip rounds, and manage team scores in a fast turn-based flow.

Core capabilities:

- Song search via a server-side Deezer proxy route.
- Round-based clip playback with progressive trial durations.
- Team scoring logic with win/loss state management.
- Privacy/cookie consent handling and analytics gating.
- Optional Lightning donation flow via LNURL endpoints.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Vitest + Testing Library
- Drizzle ORM + Neon Postgres (optional data layer tooling)

## Download and Run Locally

### Prerequisites

- Node.js 20+
- pnpm 9+

### 1. Download the project

```bash
git clone git@github.com:ajrlewis/passthetrack.git
cd passthetrack
```

If you prefer HTTPS:

```bash
git clone https://github.com/ajrlewis/passthetrack.git
cd passthetrack
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables (recommended)

```bash
cp .env.example .env.local
```

`DATABASE_URL` and `DATABASE_URL_UNPOOLED` are only required if you plan to run Drizzle database commands.

### 4. Start the app

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

- `pnpm dev` - Start local development server.
- `pnpm build` - Build for production.
- `pnpm start` - Run the production build.
- `pnpm lint` - Run ESLint.
- `pnpm test` - Run tests once.
- `pnpm test:watch` - Run tests in watch mode.
- `pnpm db:generate` - Generate Drizzle migrations.
- `pnpm db:migrate` - Apply database migrations.
- `pnpm db:check` - Validate migration state.
- `pnpm db:studio` - Open Drizzle Studio.

## Notes

- The home route redirects to `/choose`.
- Game state is managed client-side through React context/hooks.
- Deezer requests are proxied through `/api/deezer` to simplify client integration.
