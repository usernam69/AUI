// In-browser small language model (SLM) powered by WebLLM + WebGPU.
// The model is downloaded once, cached by the browser, and runs fully on-device.

// Prefer the copy bundled with AUI, then fall back to a pinned CDN build.
const ENGINE_SOURCES = [
  new URL("./vendor/web-llm-0.2.79.js", import.meta.url).href,
  "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm"
];

export const SLM_MODELS = {
  tiny: { id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC", label: "Qwen 2.5 0.5B", approxMB: 945 },
  tinyCompat: { id: "Qwen2.5-0.5B-Instruct-q4f32_1-MLC", label: "Qwen 2.5 0.5B (compatibility build)", approxMB: 1060 },
  small: { id: "Llama-3.2-1B-Instruct-q4f16_1-MLC", label: "Llama 3.2 1B", approxMB: 880 },
  smallCompat: { id: "Llama-3.2-1B-Instruct-q4f32_1-MLC", label: "Llama 3.2 1B (compatibility build)", approxMB: 1130 },
  large: { id: "Llama-3.2-3B-Instruct-q4f16_1-MLC", label: "Llama 3.2 3B", approxMB: 2260 },
  largeCompat: { id: "Llama-3.2-3B-Instruct-q4f32_1-MLC", label: "Llama 3.2 3B (compatibility build)", approxMB: 2950 }
};

// "fast" trades quality for speed, "smart" the reverse; "balanced" is the default.
export const SLM_SPEEDS = {
  fast: { label: "Fastest", models: ["tiny", "tinyCompat"] },
  balanced: { label: "Balanced", models: ["small", "smallCompat"] },
  smart: { label: "Smartest", models: ["large", "largeCompat"] }
};
const SPEED_KEY = "aui.slmSpeed";

let enginePromise = null;
let progressListener = null;
let plannedModel = null;

export function getSlmSpeed() {
  try {
    const saved = globalThis.localStorage?.getItem(SPEED_KEY);
    if (SLM_SPEEDS[saved]) return saved;
  } catch {}
  return "balanced";
}

// Switching speed drops the loaded engine so the next reply uses the new model.
export function setSlmSpeed(speed) {
  if (!SLM_SPEEDS[speed] || speed === getSlmSpeed()) return;
  try { globalThis.localStorage?.setItem(SPEED_KEY, speed); } catch {}
  plannedModel = null;
  const previous = enginePromise;
  enginePromise = null;
  previous?.then(engine => engine.unload?.()).catch(() => {});
}

function abortError() {
  return new DOMException("Generation stopped", "AbortError");
}

export function isSlmSupported() {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

// Pick the model for the chosen speed, using the f32 build when the GPU lacks f16 support.
export async function pickModel() {
  if (plannedModel) return plannedModel;
  const [normal, compat] = SLM_SPEEDS[getSlmSpeed()].models;
  let choice = SLM_MODELS[normal];
  try {
    const adapter = await navigator.gpu?.requestAdapter({ powerPreference: "high-performance" });
    if (!adapter?.features?.has("shader-f16")) choice = SLM_MODELS[compat];
  } catch {
    // Keep the safe default.
  }
  plannedModel = choice;
  return choice;
}

// Turn a WebLLM progress report into a short, friendly status line.
export function describeProgress(report, model = plannedModel) {
  const progress = Math.min(1, Math.max(0, report?.progress || 0));
  const percent = Math.round(progress * 100);
  const text = String(report?.text || "");
  const fetched = Number(/(\d+)\s*MB fetched/i.exec(text)?.[1]);
  const elapsed = Number(report?.timeElapsed) || 0;
  const parts = [`${percent}%`];
  if (fetched > 0) {
    parts.push(`${fetched} MB${model?.approxMB ? ` of about ${model.approxMB} MB` : ""}`);
    if (elapsed >= 2) parts.push(`${(fetched / elapsed).toFixed(1)} MB/s`);
  }
  if (progress > 0.03 && progress < 1 && elapsed >= 3) {
    const secondsLeft = Math.round(elapsed * (1 - progress) / progress);
    parts.push(secondsLeft >= 90 ? `about ${Math.round(secondsLeft / 60)} min left` : `about ${secondsLeft} s left`);
  }
  const name = model?.label ? ` ${model.label}` : "";
  return `Loading the AUI model${name} in your browser… ${parts.join(" · ")}`;
}

async function importEngine() {
  let lastError;
  for (const source of ENGINE_SOURCES) {
    try {
      return await import(source);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

// Run the model in a Web Worker so the page stays smooth while it thinks;
// fall back to the page itself where workers or the worker API are unavailable.
async function createEngine(webllm, modelId, config) {
  if (typeof Worker === "function" && typeof webllm.CreateWebWorkerMLCEngine === "function") {
    let worker;
    try {
      worker = new Worker(new URL("./slm-worker.js", import.meta.url), { type: "module" });
      const failed = new Promise((_, reject) => worker.addEventListener("error", event => {
        event.preventDefault?.();
        reject(new Error("The model worker could not start"));
      }, { once: true }));
      return await Promise.race([webllm.CreateWebWorkerMLCEngine(worker, modelId, config), failed]);
    } catch (error) {
      worker?.terminate();
      if (/fetch|network|load failed/i.test(String(error?.message || error))) throw error;
    }
  }
  return webllm.CreateMLCEngine(modelId, config);
}

export function loadSlm(onProgress) {
  progressListener = onProgress || null;
  if (!isSlmSupported()) {
    return Promise.reject(new Error("AUI runs its model in your browser and needs WebGPU. Try a recent desktop Chrome, Edge, or Safari."));
  }
  if (!enginePromise) {
    enginePromise = Promise.all([importEngine().catch(() => {
      throw new Error("Couldn't load the AUI model engine. Check your connection and try again.");
    }), pickModel()])
      .then(([webllm, model]) => createEngine(webllm, model.id, {
        initProgressCallback: report => progressListener?.(report, model)
      }).catch(error => {
        if (/fetch|network|load failed/i.test(String(error?.message || error))) {
          throw new Error("Couldn't download the AUI model. Check your connection and try again; parts already downloaded are kept.");
        }
        throw error;
      }))
      .catch(error => {
        enginePromise = null;
        throw error;
      });
  }
  return enginePromise;
}

// True when the model files are already in the browser cache, so loading needs no download.
export async function isModelCached() {
  if (!isSlmSupported()) return false;
  try {
    const [webllm, model] = await Promise.all([importEngine(), pickModel()]);
    return Boolean(await webllm.hasModelInCache(model.id));
  } catch {
    return false;
  }
}

// Start loading in the background without reporting progress; a later reply picks it up.
export function warmSlm() {
  if (enginePromise || !isSlmSupported()) return;
  loadSlm().catch(() => {});
}

function discardEngine(engine) {
  enginePromise = null;
  Promise.resolve(engine.unload?.()).catch(() => {});
}

function whenAborted(signal) {
  return new Promise((_, reject) => {
    if (!signal) return;
    if (signal.aborted) reject(abortError());
    else signal.addEventListener("abort", () => reject(abortError()), { once: true });
  });
}

export async function* streamSlm(messages, { onProgress, signal } = {}) {
  let loaded;
  try {
    // Stop takes effect right away; the download keeps going in the background.
    loaded = await Promise.race([loadSlm(onProgress), whenAborted(signal)]);
  } finally {
    if (progressListener === onProgress) progressListener = null;
  }
  if (signal?.aborted) throw abortError();
  const onAbort = () => loaded.interruptGenerate();
  signal?.addEventListener("abort", onAbort);
  try {
    const stream = await loaded.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1024
    });
    for await (const chunk of stream) {
      if (signal?.aborted) break;
      const token = chunk.choices?.[0]?.delta?.content;
      if (token) yield token;
    }
    if (signal?.aborted) throw abortError();
  } catch (error) {
    // A failed engine (e.g. a lost GPU device) stays broken, so build a fresh one next time.
    if (error?.name !== "AbortError") discardEngine(loaded);
    throw error;
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}
