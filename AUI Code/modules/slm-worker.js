// Hosts the WebLLM engine off the main thread. The page talks to it through
// CreateWebWorkerMLCEngine in slm.js.
const SOURCES = [
  new URL("./vendor/web-llm-0.2.79.js", import.meta.url).href,
  "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm"
];

const queued = [];
let handler = null;
self.onmessage = message => (handler ? handler.onmessage(message) : queued.push(message));

(async () => {
  for (const source of SOURCES) {
    try {
      const { WebWorkerMLCEngineHandler } = await import(source);
      handler = new WebWorkerMLCEngineHandler();
      queued.splice(0).forEach(message => handler.onmessage(message));
      return;
    } catch {}
  }
  // Surface as a worker "error" event so the page falls back to running the model itself.
  setTimeout(() => { throw new Error("Couldn't load the AUI model engine in a worker"); });
})();
