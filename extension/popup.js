import { openAui } from "./aui.js";

const status = document.getElementById("status");

// The selected text if there is any, otherwise the start of the page.
async function readPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !/^https?:/.test(tab.url || "")) throw new Error("Open a web page first.");
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({ selection: String(getSelection()).trim(), text: document.body?.innerText || "", title: document.title })
  });
  return { ...result, url: tab.url };
}

async function run(make) {
  status.textContent = "Reading the page…";
  try {
    const page = await readPage();
    const body = (page.selection || page.text).replace(/\n{3,}/g, "\n\n").slice(0, 3500);
    openAui(make(body, page.title));
    window.close();
  } catch (error) {
    status.textContent = error.message || "Couldn't read this page.";
  }
}

document.getElementById("ask").addEventListener("click", () => run((body, title) => `I'm reading "${title}". Here is the text:\n\n${body}\n\nMy question: `));
document.getElementById("quiz").addEventListener("click", () => run((body, title) => `Quiz me on this text from "${title}", one question at a time:\n\n${body}`));
document.getElementById("cards").addEventListener("click", () => run((body, title) => `Make flashcards from this text from "${title}":\n\n${body}`));
