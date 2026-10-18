// Passphrase encryption for chats kept in this browser and for exported backups.
// AES-GCM with a key derived by PBKDF2 (SHA-256, 310,000 rounds). The passphrase never leaves the device.

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ROUNDS = 310_000;

function toBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function fromBase64(text) {
  return Uint8Array.from(atob(text), character => character.charCodeAt(0));
}

export function isSealed(value) {
  return Boolean(value && value.vault === 1 && typeof value.data === "string" && typeof value.iv === "string" && typeof value.salt === "string");
}

export function newSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

export async function deriveKey(passphrase, salt) {
  const base = await crypto.subtle.importKey("raw", encoder.encode(String(passphrase)), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ROUNDS, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function sealWithKey(key, salt, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(text)));
  return { vault: 1, salt: toBase64(salt), iv: toBase64(iv), data: toBase64(data) };
}

// Throws when the key (passphrase) is wrong or the data was changed.
export async function openWithKey(key, envelope) {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(envelope.iv) }, key, fromBase64(envelope.data));
  return decoder.decode(plain);
}

export function saltOf(envelope) {
  return fromBase64(envelope.salt);
}

export async function seal(text, passphrase) {
  const salt = newSalt();
  return sealWithKey(await deriveKey(passphrase, salt), salt, text);
}

export async function open(envelope, passphrase) {
  return openWithKey(await deriveKey(passphrase, saltOf(envelope)), envelope);
}
