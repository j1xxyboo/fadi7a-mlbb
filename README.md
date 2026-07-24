# EXPOSED MLBB DZ

Anonymous media-sharing platform — share images and videos anonymously or under your username. Frontend-only demo built with **React, TypeScript and Tailwind CSS**. All data is mocked; no backend, no real auth.

## Branding

The navbar and favicon load the logo from `public/logo.png`. Drop your logo file there (exact name `logo.png`); until it exists, the app falls back to a styled text wordmark.

## Features

- Masonry home feed (Latest / Trending / Images / Videos) with infinite scroll and skeleton loaders
- Anonymous vs named posting — ghost avatar for anonymous posts, colored initial avatars for named ones
- Upload modal with drag & drop, caption character counter and a "Post anonymously" toggle
- Post detail view with large media, video player and a comment section (comments can be anonymous too)
- Profile page showing only non-anonymous posts
- Dark theme by default with a light-mode toggle, red accent, film-grain texture and micro-interactions
- Fully responsive: masonry grid on desktop, 2 columns on tablet, single column on mobile with a bottom navigation bar

## Getting started

```bash
npm install
npm run dev
```

## Stack

- React 18 + TypeScript (Vite)
- Tailwind CSS

## Wiring a real backend later

All data access is isolated in `src/api/mockApi.ts` and consumed through hooks (`src/hooks/usePosts.ts`) — swap the mock implementations for real HTTP calls without touching any UI component. Mock content lives in `src/data/mockData.ts`.
