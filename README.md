# Airhorny

A web-based air horn soundboard.

## Local development

```bash
npm install
npm run watch
```

The dev server proxies `airhorny.test` via BrowserSync (Laravel Valet).

## Deploy

Production deploys from the **`pages`** branch to [Cloudflare Pages](https://airhorny.com).

Pushing to `main` triggers a GitHub Action that merges into `pages`, rebuilds assets, and pushes — no manual dist merges needed.

### Cloudflare Pages settings

| Setting | Value |
|---------|-------|
| Production branch | `pages` |
| Build command | `npm run production` |
| Build output directory | `/` (project root) |
| Node version | 20 |

The `pages` branch includes prebuilt `dist/` assets. The `_headers` file configures cache behavior for HTML, scripts, styles, and sounds.

## PWA

The site is installable on mobile via Add to Home Screen. A service worker caches the app shell and sounds for offline use.
