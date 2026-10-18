# AUI

[![Deploy to GitHub Pages](https://github.com/usernam69/AUI/actions/workflows/pages.yml/badge.svg)](https://github.com/usernam69/AUI/actions/workflows/pages.yml)
[![Tests](https://github.com/usernam69/AUI/actions/workflows/test.yml/badge.svg)](https://github.com/usernam69/AUI/actions/workflows/test.yml)

A private AI chat that runs a small language model in your browser with WebGPU.
Live at **https://usernam69.github.io/AUI/**.

## Project layout

- `AUI Code/` — the website (static HTML, CSS and JavaScript, no build step)
  - `chat/` — the chat app (`app.js`) and its service worker (`sw.js`)
  - `modules/` — the in-browser model (`slm.js`, `slm-worker.js`), Markdown rendering, storage, uploads
- `tests/run.mjs` — dependency-free tests: `node tests/run.mjs`
- `scripts/serve.mjs` — local preview at `/AUI/`, like GitHub Pages
- `scripts/check-links.mjs` — fails the deploy on broken internal links

## Run it locally

```sh
node scripts/serve.mjs
# open http://localhost:8080/AUI/
```

## Deploying

Pushing to `claude/blissful-hopper-04f4rj` runs `.github/workflows/pages.yml`, which:

1. runs the tests,
2. stamps the commit into asset versions (so browsers fetch fresh files),
3. minifies `style.css` and rewrites root links to the `/AUI/` path,
4. checks every internal link, then deploys.

The `github-pages` environment currently only allows that branch. To deploy from `main`
instead, add `main` under **Settings → Environments → github-pages → Deployment branches**
and change the branch in `pages.yml`.

**Rolling back:** open **Actions → Deploy to GitHub Pages → Run workflow** and enter the commit
to deploy in the `ref` box.

**Lighthouse:** after each deploy, `lighthouse.yml` scores the live chat page and saves the
report as a downloadable artifact on the run.
