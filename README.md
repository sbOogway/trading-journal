# Trading Journal

A public trading journal built with [Astro](https://astro.build) and published to GitHub Pages at
https://sboogway.github.io/trading-journal/

## Writing an entry

Add a Markdown file to `src/content/blog/`. The frontmatter drives the trade card at the top of the post:

```md
---
title: "ETHUSDT short: chasing the entry"
description: "One-line summary (optional)"
pubDate: 2026-09-18T17:30:13
asset: ETHUSDT
platform: BYBIT
side: SHORT          # LONG | SHORT
risk: 1% of capital
---

Body of the entry...
```

`asset`, `platform`, `side` and `risk` are optional — leave them out for non-trade posts.
The schema lives in `src/content.config.ts`.

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Start local dev server at `localhost:4321`   |
| `npm run build`   | Build the production site to `./dist/`       |
| `npm run preview` | Preview the build locally before deploying   |

## Deploying

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.

## Where things are

- `src/content/blog/` — journal entries
- `src/components/TradeCard.astro` — the trade metadata card
- `src/pages/index.astro` — the entry list on the homepage
- `src/layouts/BlogPost.astro` — single-entry layout
- `src/styles/global.css` — colours, fonts, typography
- `src/consts.ts` — site title and description
