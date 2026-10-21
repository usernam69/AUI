// Where AUI lives. Change this to open a copy you host yourself.
export const AUI_URL = "https://usernam69.github.io/AUI/chat/";

// The text travels after the "#", which the browser never sends to a server, so it stays on the
// computer until AUI itself (running in the page) reads it.
export function openAui(text) {
  const clipped = String(text || "").trim().slice(0, 6000);
  chrome.tabs.create({ url: `${AUI_URL}#ask=${encodeURIComponent(clipped)}` });
}
