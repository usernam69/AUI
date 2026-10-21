// Share a skill, a flashcard deck, a study plan or a whole chat as a link. The content travels in
// the part of the address after "#", which the browser never sends to any server: whoever opens
// the link reads it in their own browser, and AUI keeps no copy.

export const MAX_LINK_LENGTH = 30000;
const MAX_UNPACKED = 2_000_000;
export const KINDS = ["skill", "deck", "plan", "chat"];

const toBase64Url = bytes => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromBase64Url = text => {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
};

async function pipe(bytes, stream, cap) {
  const writer = stream.writable.getWriter();
  writer.write(bytes).catch(() => {});
  writer.close().catch(() => {});
  const reader = stream.readable.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > cap) {
      reader.cancel().catch(() => {});
      throw new Error("That link unpacks to far too much data.");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) { out.set(chunk, at); at += chunk.length; }
  return out;
}

const hasCompression = () => typeof CompressionStream === "function" && typeof DecompressionStream === "function";

// "skill.z<data>": the kind, then z (compressed) or p (plain), then the data.
export async function encodeShare(kind, data) {
  if (!KINDS.includes(kind)) throw new Error("Unknown kind of link.");
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const packed = hasCompression() ? await pipe(bytes, new CompressionStream("deflate-raw"), MAX_UNPACKED) : bytes;
  const text = `${kind}.${hasCompression() ? "z" : "p"}${toBase64Url(packed)}`;
  if (text.length > MAX_LINK_LENGTH) throw new Error("This is too long to share as a link. Download it as a file instead.");
  return text;
}

export async function decodeShare(text) {
  const match = /^(skill|deck|plan|chat)\.([zp])([A-Za-z0-9_-]+)$/.exec(String(text ?? "").trim());
  if (!match || match[3].length > MAX_LINK_LENGTH) throw new Error("This link is damaged or too long.");
  const [, kind, mode, payload] = match;
  let bytes;
  try { bytes = fromBase64Url(payload); } catch { throw new Error("This link is damaged."); }
  if (mode === "z") {
    if (!hasCompression()) throw new Error("This browser can't open compressed links.");
    try { bytes = await pipe(bytes, new DecompressionStream("deflate-raw"), MAX_UNPACKED); } catch (error) {
      throw new Error(/too much/.test(error.message) ? error.message : "This link is damaged.");
    }
  }
  let data;
  try { data = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new Error("This link is damaged."); }
  if (!data || typeof data !== "object") throw new Error("This link is damaged.");
  return { kind, data };
}

export const shareUrl = (origin, payload) => `${origin}/chat/#share=${payload}`;

// The part after "#share=" in an address, or "" when there is none.
export const shareFromHash = hash => {
  const match = /^#share=([^&]+)$/.exec(String(hash ?? ""));
  return match ? match[1] : "";
};

const text = (value, max) => String(value ?? "").slice(0, max);

// What may be read out of a received link. Anything else in it is dropped.
export function cleanDeck(data) {
  const cards = Array.isArray(data.cards) ? data.cards : [];
  return {
    name: text(data.name, 40).trim() || "Shared deck",
    cards: cards.map(card => ({ front: text(card?.front, 240).trim(), back: text(card?.back, 700).trim() })).filter(card => card.front && card.back).slice(0, 300)
  };
}

export function cleanChat(data) {
  const messages = Array.isArray(data.messages) ? data.messages : [];
  return {
    title: text(data.title, 80).trim() || "Shared chat",
    messages: messages
      .filter(message => message && (message.role === "user" || message.role === "assistant") && typeof message.content === "string" && message.content.trim())
      .map(message => ({ role: message.role, content: text(message.content, 8000) }))
      .slice(0, 200)
  };
}

export function cleanPlanInput(data) {
  const exams = Array.isArray(data.exams) ? data.exams : [];
  return {
    minutesPerDay: Math.min(Math.max(Number(data.minutesPerDay) || 60, 10), 600),
    exams: exams.slice(0, 6).map(exam => ({ name: text(exam?.name, 60), date: text(exam?.date, 10), topics: (Array.isArray(exam?.topics) ? exam.topics : []).slice(0, 30).map(topic => text(topic, 60)) }))
  };
}
