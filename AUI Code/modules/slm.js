// In-browser small language model (SLM) powered by WebLLM + WebGPU.
// The model is downloaded once, cached by the browser, and runs fully on-device.

// Prefer the copy bundled with AUI, then fall back to a pinned CDN build.
const ENGINE_SOURCES = [
  new URL("./vendor/web-llm-0.2.79.js", import.meta.url).href,
  "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm"
];

export const SLM_MODELS = {
  small: { id: "Llama-3.2-1B-Instruct-q4f16_1-MLC", label: "Llama 3.2 1B", approxMB: 880 },
  smallCompat: { id: "Llama-3.2-1B-Instruct-q4f32_1-MLC", label: "Llama 3.2 1B (compatibility build)", approxMB: 1130 },
  large: { id: "Llama-3.2-3B-Instruct-q4f16_1-MLC", label: "Llama 3.2 3B", approxMB: 2260 }
};

let enginePromise = null;
let progressListener = null;
let plannedModel = null;

function abortError() {
  return new DOMException("Generation stopped", "AbortError");
}

export function isSlmSupported() {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

// Pick the biggest model this device can comfortably hold.
export async function pickModel() {
  if (plannedModel) return plannedModel;
  let choice = SLM_MODELS.small;
  try {
    const adapter = await navigator.gpu?.requestAdapter();
    const hasF16 = Boolean(adapter?.features?.has("shader-f16"));
    const bigBuffers = (adapter?.limits?.maxBufferSize || 0) >= 2 * 1024 ** 3;
    const plentyOfMemory = (navigator.deviceMemory || 4) >= 8;
    if (!hasF16) choice = SLM_MODELS.smallCompat;
    else if (bigBuffers && plentyOfMemory) choice = SLM_MODELS.large;
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

export function loadSlm(onProgress) {
  progressListener = onProgress || null;
  if (!isSlmSupported()) {
    return Promise.reject(new Error("AUI runs its model in your browser and needs WebGPU. Try a recent desktop Chrome, Edge, or Safari."));
  }
  if (!enginePromise) {
    enginePromise = Promise.all([importEngine().catch(() => {
      throw new Error("Couldn't load the AUI model engine. Check your connection and try again.");
    }), pickModel()])
      .then(([webllm, model]) => webllm.CreateMLCEngine(model.id, {
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
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}
