// In-browser small language model (SLM) powered by WebLLM + WebGPU.
// The model is downloaded once, cached by the browser, and runs fully on-device.

const WEBLLM_URL = "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm";
export const SLM_MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

let enginePromise = null;

function abortError() {
  return new DOMException("Generation stopped", "AbortError");
}

export function isSlmSupported() {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export function loadSlm(onProgress) {
  if (!isSlmSupported()) {
    return Promise.reject(new Error("AUI runs its model in your browser and needs WebGPU. Try a recent desktop Chrome, Edge, or Safari."));
  }
  if (!enginePromise) {
    enginePromise = import(WEBLLM_URL)
      .then(webllm => webllm.CreateMLCEngine(SLM_MODEL_ID, {
        initProgressCallback: report => onProgress?.(report)
      }))
      .catch(error => {
        enginePromise = null;
        throw error;
      });
  }
  return enginePromise;
}

export async function* streamSlm(messages, { onProgress, signal } = {}) {
  const loaded = await loadSlm(onProgress);
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
