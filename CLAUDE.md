# CREB site code

Custom JS/CSS for **compoundrealestatebonds.com** (Webflow). Source lives here, is built into `dist/`, and is served to the live site by jsDelivr from version tags. This replaces the code that used to sit inline in Webflow's custom code fields (which cap at 50,000 characters each).

Owner: Usman (Outcraft) — designer, not a full-time engineer. Explain changes in plain language.

## How it reaches the site

```
src/  →  npm run build  →  dist/  →  git tag vX.Y.Z + push  →  jsDelivr  →  Webflow tags  →  visitor
```

Webflow loads exactly two files, pinned to a tag:

- Head: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/usmankdesign/creb-site-code@vX.Y.Z/dist/main.min.css">`
- Footer: `<script src="https://cdn.jsdelivr.net/gh/usmankdesign/creb-site-code@vX.Y.Z/dist/main.min.js" defer></script>`

Full reference copies of both Webflow fields are in `webflow/head-code.html` and `webflow/footer-code.html`. Keep them in sync with what's in Webflow.

## Structure

```
src/
├── main.js          entry — imports every module, runs each isolated in try/catch
├── main.css         entry — @imports every stylesheet (bundled by esbuild)
├── config.js        Klaviyo IDs, rates, breakpoints, app host — single source of truth
├── utils/           dom (onReady, onClick), storage (safe localStorage), klaviyo (subscribe)
├── styles/          one CSS file per feature
└── modules/
    ├── nav/         mega-menu, mobile-menu
    ├── forms/       phone-input, klaviyo-forms, bond-guide-form
    ├── tracking/    attribution
    ├── ui/          cookie-banner, faq, copyright-year, contact-cta, co-tabs
    └── calculators/ returns-calculator, card-calculator
test/smoke.cjs       jsdom smoke test of the built bundle
webflow/             reference copies of the Webflow head/footer fields
dist/                built output — committed (jsDelivr serves it)
```

## Workflow for any change

1. `git fetch origin main && git rebase origin/main`
2. `npm ci` (first time in a session)
3. Edit `src/` only. Never hand-edit `dist/`.
4. `npm run build && npm test` — both must pass.
5. Bump the version: patch for fixes/tweaks, minor for new features. Update `package.json` `version`, add a `CHANGELOG.md` entry, and update the `@vX.Y.Z` in both `webflow/*.html` files.
6. Commit `src/`, `dist/`, `CHANGELOG.md`, `package.json`, `webflow/` together.
7. `git tag vX.Y.Z && git push origin main --tags`
8. Verify both jsDelivr URLs for the new tag return the new build.
9. Give Usman the two updated Webflow lines. **He pastes them and publishes — never publish the Webflow site yourself.**

## Rules

- **Tags are immutable.** Never move, delete or reuse a tag. jsDelivr caches tagged files permanently; a fix always gets a new tag. Rolling back = pointing Webflow at the previous tag.
- **Every module must guard itself.** Exit quietly if its elements aren't on the page — the bundle loads on every page.
- **New module checklist:** file in the right `modules/` folder, header comment (what it does, required selectors, related CSS file), exported `initX()`, registered in `MODULES` in `main.js`, CSS in `styles/` and imported in `main.css`, smoke test updated.
- **Shared values go in `config.js`** — never hard-code IDs, rates or breakpoints in a module.
- **Don't change localStorage keys** (`cookieAccepted`, UTM/click-ID keys, `_creb_attr_ts`) — existing visitors' attribution and cookie consent depend on them.
- **Attribution is business-critical** (feeds ROAS reporting into app.compoundbanc.com). Treat changes to `modules/tracking/attribution.js` with extra care and test the link decoration.
- **Stays inline in Webflow, not in this repo:** meta/verification tags, ContentSquare, Optibase (and its `.optibase-hidden` anti-flicker style), Hotjar, GA4, Intercom, Meta Pixel. Vendor snippets stay as vendors ship them.
- **CSS loads in the head** (render-blocking, avoids unstyled flashes). **JS loads in the footer with `defer`.**
- Webflow allows duplicate IDs across nav/desktop/mobile variants — select with `querySelectorAll('[id="x"]')` when an ID may repeat.
- Keep code ES2018-compatible (esbuild target).
