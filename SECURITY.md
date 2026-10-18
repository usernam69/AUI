# Security

## Reporting a problem

Email **supportaton@gmail.com** with the steps to reproduce. Please don't open a public issue for security problems. The public policy and thank-you list are at https://usernam69.github.io/AUI/security.html.

## Threat model (799)

| Risk | What could happen | What protects against it |
| --- | --- | --- |
| Malicious model output or files (XSS) | A reply or an attached file injects script into the page | Markdown is rendered with DOMPurify; the Content Security Policy blocks inline scripts and scripts from other hosts; code "Run" uses a sandboxed iframe without `allow-same-origin`; CI renders known XSS payloads (`scripts/xss-check.mjs`) |
| Prompt injection in files | A document tells the model to ignore the user | File text is fenced and labelled as data in the prompt; files with AI-directed instructions are flagged in the tray |
| A compromised CDN | A third-party library is replaced with malicious code | Markdown, highlighting, math and fonts are vendored in `AUI Code/modules/vendor` and `AUI Code/fonts`; remaining CDN imports are pinned to exact versions and only `esm.sh` and `cdn.jsdelivr.net` are allowed by the CSP |
| Someone else using the device | Chats are read on a shared or stolen computer | Optional passphrase encryption (AES-GCM, PBKDF2 310k), auto-lock, clear on close, retention, "Keep me signed in" off, sign out everywhere |
| Account takeover | Password guessing or reuse | Supabase rate limits, client-side back-off after failed attempts, strength meter, optional TOTP two-factor |
| Cross-account data access | One user reads or changes another's data | Row-level security on `user_data` and `beta_requests`; `supabase/account_extras.sql` adds the missing `with check` on updates and confirmed-email staff checks |
| Clickjacking | AUI is framed by another site | GitHub Pages can't send `frame-ancestors`, so the app refuses to run inside a frame from another origin |
| Leaked secrets | A private key is committed | The only key in the code is Supabase's publishable key, which is designed to be public and is limited by row-level security; CI scans for private keys and service-role tokens |

## The Supabase key (763)

`sb_publishable_…` is a publishable key. It identifies the project and only allows what row-level security permits. The service-role key must never be committed; `scripts/security-check.mjs` fails CI if a service-role JWT or private key appears in the repository.

## Updating vendored libraries (770)

See `AUI Code/modules/vendor/README.md`. CI's security job also reports when a newer `@mlc-ai/web-llm` is published (769).

## Access review (798)

Every three months:

1. Check that only the owner and support addresses are listed in `is_aui_staff()` (`supabase/account_extras.sql`) and in `CONFIG.ACCOUNT_ROLES` (`AUI Code/chat/app.js`).
2. In Supabase, check Authentication → Users for unexpected accounts with those emails, and Project Settings → API for rotated keys.
3. In GitHub, check repository collaborators, deploy keys and the `github-pages` environment rules.
4. Review the Beta admin "reviewed" list for approvals nobody remembers making.
