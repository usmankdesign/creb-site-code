# Changelog

Each version is a git tag served by jsDelivr. To roll back, point the Webflow head/footer tags at an earlier version and republish.

## v1.0.2 — 2026-11-13
- Fixed hover tabs not working: the code looked for `.co-tab-wrapper`, but the Webflow class is `.co-tab-wrap`. Tabs now open/close on the homepage (4 sets) and /is-creb-legit.
- Tab body is now found by `.co-tab-body-copy` first, then `.co-tab-body`, then the first `<p>`.
- Only direct children of `.co-tabs-wrapper` count as tabs.
- Smoke test now checks tab open/close and switching.

## v1.0.1 — 2026-11-12
- Added `CLAUDE.md` (project instructions), `CHANGELOG.md`, smoke test (`npm test`) and `webflow/footer-code.html` reference.
- No change to `dist/` — the build is identical to v1.0.0.

## v1.0.0 — 2026-11-12
- Moved all Webflow head CSS and footer JS/CSS into this repo as commented modules.
- Merged two duplicate mega-menu scripts into one (fixes mobile dropdowns opening and closing on the same tap).
- Returns calculator now exits quietly on pages without it (previously threw an error on every other page).
- Each module runs isolated, so an error in one feature can't stop the others.
- Klaviyo IDs, rates and breakpoints centralised in `config.js`.
- Removed invalid declarations from the cookie close-button CSS.
- Third-party tags (GA4, Hotjar, Intercom, Meta Pixel, ContentSquare, Optibase) stay inline in Webflow.
