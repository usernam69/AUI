const STORAGE_KEY = "aui";
const MAX_ATTACHMENT_DATA_LENGTH = 1_200_000;

export function loadStoredState(defaultState) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultState;

  try {
    const value = JSON.parse(saved);
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
  if (this && this.chats && this.settings && ["user", "loggedIn", "loading", "pendingAttachments"].includes(key)) return undefined;
  if (key === "dataUrl" && typeof value === "string" && value.length > MAX_ATTACHMENT_DATA_LENGTH) return undefined;
  if (key === "previewUrl" && typeof value === "string" && value.startsWith("blob:")) return undefined;
  if (key === "generatedImage" && typeof value === "string" && value.startsWith("data:") && value.length > MAX_ATTACHMENT_DATA_LENGTH) return undefined;
  return value;
}

export function saveStoredState(state) {
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
