# Trading Journal

A public trading journal built with [Astro](https://astro.build) on the [Astro Micro](https://github.com/trevortylerlee/astro-micro) theme, published to GitHub Pages at
https://sboogway.github.io/trading-journal/

## Writing an entry

Add a Markdown file to `src/content/blog/`. The frontmatter drives the trade card at the top of the post:

```md
---
title: "ETHUSDT short: chasing the entry"
description: "One-line summary (optional)"
date: 2026-09-18T17:30:13
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
| `npm run deploy`  | Push `./dist/` to the `gh-pages` branch       |

## Deploying

Deployment is a git hook, not CI. A husky `pre-push` hook (`.husky/pre-push`) runs on every
`git push` from `main`: it builds the site and pushes `dist/` to the `gh-pages` branch, which
GitHub Pages serves. So the workflow is just:

```sh
git add . && git commit -m "New entry" && git push
```

To publish without pushing `main` (e.g. after only changing something locally), run `npm run deploy`
after `npm run build`. The hook is installed automatically by `npm install` (via the `prepare` script).

## Where things are

- `src/content/blog/` — journal entries
- `src/components/TradeCard.astro` — the trade metadata card
- `src/components/ArrowCard.astro` — entry row in lists (side badge + asset)
- `src/pages/index.astro` — homepage; `src/pages/blog/index.astro` — all entries by year
- `src/pages/blog/[...id].astro` — single-entry page
- `src/styles/global.css` — colours, fonts, typography (Tailwind)
- `src/consts.ts` — site title, description, socials
- `src/lib/utils.ts` — `withBase()` for links under the `/trading-journal` base path
