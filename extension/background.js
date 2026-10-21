import { openAui } from "./aui.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "ask", title: "Ask AUI about “%s”", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "explain", title: "Explain this simply with AUI", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "cards", title: "Make flashcards from this with AUI", contexts: ["selection"] });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const text = info.selectionText || "";
  if (!text) return;
  const source = tab?.title ? `\n\n(From the page: ${tab.title})` : "";
  if (info.menuItemId === "ask") openAui(`About this text, I'd like to understand:\n\n${text}${source}\n\nMy question: `);
  else if (info.menuItemId === "explain") openAui(`Explain this simply:\n\n${text}${source}`);
  else if (info.menuItemId === "cards") openAui(`Make flashcards from this text:\n\n${text}${source}`);
});
