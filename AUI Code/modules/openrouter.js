// Online replies through OpenRouter, for skills that need a larger model than the one on the
// device (the Homework Helper). The key belongs to the user and is typed into the app. It is
// kept in this browser only: never in the synced settings, never in a data export.

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const KEY_INFO = "https://openrouter.ai/api/v1/auth/key";
const KEY_STORE = "aui.openrouterKey";
const MODEL_STORE = "aui.openrouterModel";
export const DEFAULT_MODEL = "openrouter/auto";

const read = name => {
  try { return localStorage.getItem(name) || ""; } catch { return ""; }
};

export const getKey = () => read(KEY_STORE);
export const getModel = () => read(MODEL_STORE) || DEFAULT_MODEL;
export const hasKey = () => looksLikeKey(getKey());

// OpenRouter keys start with "sk-or-". This only catches typos and pasted junk.
export const looksLikeKey = value => /^sk-or-[A-Za-z0-9_-]{16,}$/.test(String(value ?? "").trim());

export function saveKey(key, model) {
  const clean = String(key ?? "").trim();
  if (!looksLikeKey(clean)) throw new Error("That doesn't look like an OpenRouter key. It starts with sk-or-.");
  const name = String(model ?? "").trim() || DEFAULT_MODEL;
  if (!/^[\w.:@~+-]+(\/[\w.:@~+-]+)*$/.test(name) || name.length > 120) throw new Error("That model name doesn't look right. Example: openrouter/auto");
  localStorage.setItem(KEY_STORE, clean);
  localStorage.setItem(MODEL_STORE, name);
}

export function removeKey() {
  try {
    localStorage.removeItem(KEY_STORE);
    localStorage.removeItem(MODEL_STORE);
  } catch {}
}

// Turn an HTTP failure into something a student can act on.
export function friendlyStatus(status, detail = "") {
  const extra = detail ? ` (${String(detail).slice(0, 160)})` : "";
  if (status === 401) return "OpenRouter didn't accept the key. Check it, or make a new one.";
  if (status === 402) return "The OpenRouter account is out of credits.";
  if (status === 403) return `OpenRouter blocked this request${extra}.`;
  if (status === 404) return `OpenRouter doesn't know that model${extra}. Change it in the Homework Helper setup.`;
  if (status === 408 || status === 504) return "OpenRouter took too long to answer. Try again.";
  if (status === 429) return "OpenRouter says to slow down. Wait a moment and try again.";
  if (status >= 500) return `OpenRouter had a problem${extra}. Try again in a moment.`;
  return `OpenRouter returned an error ${status}${extra}.`;
}

// Server-sent events arrive in arbitrary pieces. Feed each piece in; it returns the text that
// is complete so far and what is left over for the next piece.
export function parseSse(buffer) {
  const tokens = [];
  let error = "";
  let done = false;
  const lines = buffer.split(/\r?\n/);
  const rest = lines.pop();
  for (const line of lines) {
    if (!line.startsWith("data:")) continue; // comments such as ": OPENROUTER PROCESSING"
    const data = line.slice(5).trim();
    if (!data) continue;
    if (data === "[DONE]") { done = true; continue; }
    let json;
    try { json = JSON.parse(data); } catch { continue; }
    if (json.error) error = json.error.message || "OpenRouter stopped the reply.";
    const text = json.choices?.[0]?.delta?.content;
    if (text) tokens.push(text);
  }
  return { tokens, rest, error, done };
}

export async function* streamOpenRouter(messages, { signal, maxTokens = 1500, temperature = 0.6, key = getKey(), model = getModel() } = {}) {
  if (!looksLikeKey(key)) throw new Error("Add your OpenRouter key first.");
  let response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${key.trim()}`,
        "Content-Type": "application/json",
        "X-Title": "AUI"
      },
      body: JSON.stringify({ model, messages, stream: true, max_tokens: maxTokens, temperature })
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new Error(/Offline-only/.test(error?.message) ? error.message : "Couldn't reach OpenRouter. Check your internet connection.");
  }
  if (!response.ok) {
    let detail = "";
    try { detail = (await response.json())?.error?.message || ""; } catch {}
    throw new Error(friendlyStatus(response.status, detail));
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSse(buffer);
      buffer = parsed.rest;
      for (const token of parsed.tokens) yield token;
      if (parsed.error) throw new Error(parsed.error);
      if (parsed.done) return;
    }
    // A last line that arrived without its newline.
    const tail = parseSse(`${buffer}\n`);
    for (const token of tail.tokens) yield token;
    if (tail.error) throw new Error(tail.error);
  } finally {
    reader.cancel().catch(() => {});
  }
}

// Ask OpenRouter about the key (name, spending limit) without sending any chat.
export async function checkKey(key = getKey()) {
  if (!looksLikeKey(key)) throw new Error("That doesn't look like an OpenRouter key. It starts with sk-or-.");
  let response;
  try {
    response = await fetch(KEY_INFO, { headers: { Authorization: `Bearer ${key.trim()}` } });
  } catch (error) {
    throw new Error(/Offline-only/.test(error?.message) ? error.message : "Couldn't reach OpenRouter. Check your internet connection.");
  }
  if (!response.ok) throw new Error(friendlyStatus(response.status));
  const data = (await response.json())?.data || {};
  return { label: data.label || "your key", limit: data.limit ?? null, remaining: data.limit_remaining ?? null, free: Boolean(data.is_free_tier) };
}
