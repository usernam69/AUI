import { isSealed, deriveKey, sealWithKey, openWithKey, saltOf, newSalt } from "./vault.js";

const STORAGE_KEY = "aui";

// Passphrase lock (The Probe, 764). While the data is locked nothing is written, so the
// encrypted copy can never be replaced by an empty state; once unlocked, every save is encrypted.
let vaultKey = null;
let vaultSalt = null;
let vaultLocked = false;
let vaultWrites = Promise.resolve();

export function isVaultLocked() {
  return vaultLocked;
}

export function isVaultEnabled() {
  return Boolean(vaultKey) || vaultLocked;
}
const MAX_ATTACHMENT_DATA_LENGTH = 1_200_000;

export function loadStoredState(defaultState) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultState;

  try {
    const value = JSON.parse(saved);
    if (isSealed(value)) {
      vaultLocked = true;
      return { ...defaultState, settings: { ...defaultState.settings, ...(value.settings || {}) }, vaultLocked: true };
    }
    return {
      ...defaultState,
      ...value,
      settings: { ...defaultState.settings, ...(value.settings || {}) },
      chats: Array.isArray(value.chats) ? value.chats : [],
      memory: Array.isArray(value.memory) ? value.memory : [],
      user: null,
      loggedIn: false,
      loading: false
    };
  } catch {
    return defaultState;
  }
}

// Session-only fields are stripped from the top level only: memory entries have a nested `user` field that must be kept.
function stateReplacer(key, value) {
  // Temporary chats live only in memory: never saved locally or synced.
  if (key === "chats" && Array.isArray(value)) return value.filter(chat => !chat?.temporary);
  if (this && this.chats && this.settings && ["user", "loggedIn", "loading", "pendingAttachments"].includes(key)) return undefined;
  if (key === "dataUrl" && typeof value === "string" && value.length > MAX_ATTACHMENT_DATA_LENGTH) return undefined;
  if (key === "previewUrl" && typeof value === "string" && value.startsWith("blob:")) return undefined;
  if (key === "generatedImage" && typeof value === "string" && value.startsWith("data:") && value.length > MAX_ATTACHMENT_DATA_LENGTH) return undefined;
  return value;
}

export function saveStoredState(state) {
  if (vaultLocked) return vaultWrites;
  if (vaultKey) {
    const text = JSON.stringify(state, stateReplacer);
    const key = vaultKey;
    const salt = vaultSalt;
    // Only the theme stays readable, so the unlock screen matches the app.
    const visible = { theme: state.settings?.theme || "system" };
    vaultWrites = vaultWrites
      .then(() => sealWithKey(key, salt, text))
      .then(envelope => localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...envelope, settings: visible })))
      .catch(error => console.warn("AUI could not save encrypted data:", error));
    return vaultWrites;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state, stateReplacer));
  } catch (error) {
    console.warn("AUI could not save all local data:", error);
  }
}

// Cloud storage: one row per user in public.user_data (see supabase/chat_storage.sql).
export function serializeForCloud(state) {
  const { chats, memory, settings } = JSON.parse(JSON.stringify(
    { chats: state.chats, memory: state.memory, settings: state.settings },
    stateReplacer
  ));
  return { chats, memory, settings, updated_at: new Date().toISOString() };
}

export async function loadCloudData(supabase, userId) {
  const { data, error } = await supabase
    .from("user_data")
    .select("chats, memory, settings, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function saveCloudData(supabase, userId, cloudData) {
  const { data, error } = await supabase
    .from("user_data")
    .upsert(
      { user_id: userId, chats: cloudData.chats, memory: cloudData.memory, settings: cloudData.settings },
      { onConflict: "user_id" }
    )
    .select("updated_at")
    .single();
  if (error) throw error;
  // Keep the server's timestamp so the background poll doesn't see our own save as a remote change.
  if (data?.updated_at) cloudData.updated_at = data.updated_at;
  return cloudData;
}

export function createId(prefix = "") {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return prefix ? `${prefix}-${random}` : random;
}

export function getVisitorId() {
  const storageKey = "auiVisitorId";
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  let visitorId = localStorage.getItem(storageKey);

  if (!uuidPattern.test(visitorId || "")) {
    visitorId = createUuid();
    localStorage.setItem(storageKey, visitorId);
  }

  return visitorId;
}

function createUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

// Unlock with the passphrase; throws when it's wrong. Returns the saved state like loadStoredState.
export async function unlockVault(passphrase, defaultState) {
  const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (!isSealed(value)) throw new Error("Nothing is locked.");
  const salt = saltOf(value);
  const key = await deriveKey(passphrase, salt);
  const data = JSON.parse(await openWithKey(key, value));
  vaultKey = key;
  vaultSalt = salt;
  vaultLocked = false;
  return {
    ...defaultState,
    ...data,
    settings: { ...defaultState.settings, ...(data.settings || {}) },
    chats: Array.isArray(data.chats) ? data.chats : [],
    memory: Array.isArray(data.memory) ? data.memory : [],
    user: null,
    loggedIn: false,
    loading: false
  };
}

export async function enableVault(passphrase, state) {
  vaultSalt = newSalt();
  vaultKey = await deriveKey(passphrase, vaultSalt);
  vaultLocked = false;
  return saveStoredState(state);
}

export async function disableVault(state) {
  await vaultWrites;
  vaultKey = null;
  vaultSalt = null;
  vaultLocked = false;
  return saveStoredState(state);
}

export function flushVault() {
  return vaultWrites;
}

// "Forgot passphrase": the encrypted data can't be recovered, so it is removed.
export function eraseLockedData() {
  localStorage.removeItem(STORAGE_KEY);
  vaultKey = null;
  vaultSalt = null;
  vaultLocked = false;
}
