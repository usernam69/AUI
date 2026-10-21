// The OpenRouter model list: names, prices and which models are free right now. The list is
// public (no key needed). It is cached in this browser for a few hours so the picker opens at once.

const LIST_URL = "https://openrouter.ai/api/v1/models";
const CACHE = "aui.modelList";
const MAX_AGE = 6 * 60 * 60 * 1000;

// openrouter/auto picks a strong model for each question; openrouter/free picks a free one.
export const AUTO_MODEL = "openrouter/auto";

const toNumber = value => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

// One entry per model, with prices per million tokens.
export function parseModels(json) {
  const rows = Array.isArray(json?.data) ? json.data : [];
  return rows
    .filter(row => row && typeof row.id === "string" && row.id.length < 120)
    .map(row => {
      const input = toNumber(row.pricing?.prompt);
      const output = toNumber(row.pricing?.completion);
      const free = row.id.endsWith(":free") || (input === 0 && output === 0);
      return {
        id: row.id,
        name: String(row.name || row.id).slice(0, 80),
        context: Number(row.context_length) || 0,
        inputPerM: input == null ? null : input * 1e6,
        outputPerM: output == null ? null : output * 1e6,
        free,
        vision: Array.isArray(row.architecture?.input_modalities) && row.architecture.input_modalities.includes("image")
      };
    });
}

const money = value => (value < 0.1 ? `$${value.toFixed(3)}` : `$${value.toFixed(2)}`);

// "Free", "$0.15 in · $0.60 out per 1M tokens", or "Price varies" for the routers.
export function priceHint(model) {
  if (model.free) return "Free";
  if (model.inputPerM == null || model.outputPerM == null || model.inputPerM < 0) return "Price varies";
  return `${money(model.inputPerM)} in · ${money(model.outputPerM)} out per 1M tokens`;
}

export function contextHint(model) {
  if (!model.context) return "";
  return model.context >= 1e6 ? `${(model.context / 1e6).toFixed(1)}M context` : `${Math.round(model.context / 1000)}K context`;
}

// Rough cost of one answer, so the picker can say "about $0.002". Free models return 0.
export function costOfReply(model, inputTokens, outputTokens) {
  if (model.free) return 0;
  if (model.inputPerM == null || model.outputPerM == null) return null;
  return (model.inputPerM * inputTokens + model.outputPerM * outputTokens) / 1e6;
}

export function searchModels(list, query = "", { freeOnly = false, visionOnly = false } = {}) {
  const words = String(query).toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter(model => {
    if (freeOnly && !model.free) return false;
    if (visionOnly && !model.vision) return false;
    const text = `${model.id} ${model.name}`.toLowerCase();
    return words.every(word => text.includes(word));
  });
}

// The models to try when the chosen one is busy: the biggest free models in the list.
export function fallbackModels(list, avoid = "") {
  return list
    .filter(model => model.free && model.id !== avoid && model.id !== "openrouter/free" && model.context >= 8000)
    .sort((a, b) => b.context - a.context)
    .slice(0, 3)
    .map(model => model.id);
}

const readCache = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE) || "null");
    return cached && Array.isArray(cached.models) ? cached : null;
  } catch {
    return null;
  }
};

// The cached list, even if it is old. Empty when there is none.
export const cachedModels = () => readCache()?.models || [];

export async function fetchModels({ force = false, signal } = {}) {
  const cached = readCache();
  if (!force && cached && Date.now() - cached.at < MAX_AGE) return cached.models;
  let response;
  try {
    response = await fetch(LIST_URL, { signal });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    if (cached) return cached.models;
    throw new Error("Couldn't load the model list. Check your internet connection.");
  }
  if (!response.ok) {
    if (cached) return cached.models;
    throw new Error(`OpenRouter didn't send the model list (error ${response.status}).`);
  }
  const models = parseModels(await response.json());
  if (!models.length) {
    if (cached) return cached.models;
    throw new Error("OpenRouter sent an empty model list.");
  }
  try {
    localStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), models }));
  } catch {}
  return models;
}
