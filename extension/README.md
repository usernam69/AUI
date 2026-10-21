# Ask AUI (browser extension)

Ask AUI about the page you are reading. Select text and right-click for Ask, Explain simply or Make flashcards, or press the toolbar button for the whole page.

The text goes into the address after `#`, which a browser never sends to a server, and AUI reads it in the page and puts it in the message box. You still press Send yourself.

## Install it (Chrome, Edge, Brave)

1. Open `chrome://extensions` and turn on Developer mode.
2. Choose Load unpacked and pick this `extension` folder.

It asks for three permissions: context menus (the right-click items), `activeTab` and `scripting` (to read the page you press the button on, only when you press it).

To use a copy of AUI you host yourself, change `AUI_URL` in `aui.js`.
