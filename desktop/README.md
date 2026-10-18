# AUI desktop

AUI in its own window. This is a small Electron shell around https://usernam69.github.io/AUI/chat/: the app, the skills and the on-device model all come from the website, so the desktop app gets every website update without a new download.

## Run it

```
cd desktop
npm install
npm start
```

Set `AUI_URL` to open another address (for example a local copy of the site).

## Build installers

```
npm run dist
```

Installers land in `desktop/dist/` (Windows `.exe`, macOS `.dmg`, Linux `.AppImage`; each builds on its own operating system).

GitHub builds all three: push a tag such as `desktop-v1.0.0` (or run the "Desktop app" workflow by hand) and the installers are attached to a GitHub release. The home page's download button points at the latest release.

## What the shell does

- No Node access for the page (`contextIsolation`, `sandbox`, no `nodeIntegration`).
- Links to other sites open in your normal browser. Google and Supabase sign-in pages open inside the window.
- The window drops the "Electron" part of its user agent, because Google refuses sign-in from windows that announce themselves as Electron.
- Microphone, clipboard and notification requests are allowed for AUI only.
- If the site can't be reached, an offline page with a retry button is shown.

The macOS and Windows builds are not code-signed, so the first launch shows a warning ("unidentified developer" / SmartScreen). Signing needs a paid certificate.
