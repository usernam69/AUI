# Vendored libraries

Copied unchanged so AUI doesn't depend on a CDN for its core features (The Probe, 789).

| File | Package | License | Source |
| --- | --- | --- | --- |
| `web-llm-0.2.79.js` | `@mlc-ai/web-llm@0.2.79` (`lib/index.js`) | Apache-2.0 | https://github.com/mlc-ai/web-llm |
| `marked-16.1.2.mjs` | `marked@16.1.2` | MIT | esm.sh bundle `/marked@16.1.2/es2022/marked.bundle.mjs` |
| `dompurify-3.2.6.mjs` | `dompurify@3.2.6` | Apache-2.0 / MPL-2.0 | esm.sh bundle `/dompurify@3.2.6/es2022/dompurify.bundle.mjs` |
| `highlight-11.11.1-common.mjs` | `highlight.js@11.11.1` (common languages) | BSD-3-Clause | esm.sh bundle `/highlight.js@11.11.1/es2022/lib/common.bundle.mjs` |
| `highlight-github-dark-11.11.1.min.css` | `highlight.js@11.11.1` theme | BSD-3-Clause | jsDelivr `styles/github-dark.min.css` (SRI checked) |
| `katex-0.16.22.mjs`, `katex/` | `katex@0.16.22` (JS, CSS, woff2 fonts) | MIT | esm.sh bundle and jsDelivr `dist/` |

Model weights are still downloaded by the engine on first use.

## Updating a library (770)

1. Pick an exact version that has been out for at least two weeks and read its changelog for breaking changes and security fixes.
2. Download the single-file bundle (for esm.sh: `https://esm.sh/<pkg>@<version>?bundle` names the real file) and remove the `sourceMappingURL` line.
3. Check the file has no `import` from another URL: `grep -E '(from|import) ?"(/|https?:)' file.mjs` must print nothing.
4. For files that also exist on jsDelivr with a published SRI hash, compare `openssl dgst -sha384 -binary file | openssl base64 -A` with it.
5. Rename the file with the new version, update the import in `modules/markdown.js` (or `modules/slm.js`) and the list in `chat/sw.js`.
6. Run `node tests/run.mjs` and the browser smoke test, then ship.
