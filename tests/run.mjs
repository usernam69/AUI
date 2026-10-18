// Dependency-free checks for AUI. Run with: node tests/run.mjs
// Covers the cloud storage functions, local retrieval, the SLM stream/abort/progress
// logic (with a mock engine) and syntax of every JavaScript file.
import { readFileSync, readdirSync, statSync, writeFileSync, mkdtempSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "AUI Code");
let passed = 0;
const test = async (name, fn) => { await fn(); passed += 1; console.log("ok -", name); };

// --- syntax of every JS file (the bundled engine is checked as a module only)
const walk = dir => readdirSync(dir).flatMap(name => {
  const full = join(dir, name);
  return statSync(full).isDirectory() ? (name === "node_modules" ? [] : walk(full)) : [full];
});
await test("all JavaScript files parse", () => {
  for (const file of walk(root).filter(f => f.endsWith(".js") && !f.includes("/vendor/"))) {
    execFileSync(process.execPath, ["--check", file]);
  }
});

const load = file => import(pathToFileURL(join(root, file)).href);
const sandbox = mkdtempSync(join(tmpdir(), "aui-test-"));

// --- storage
await test("cloud storage functions", async () => {
  const { serializeForCloud, loadCloudData, saveCloudData } = await load("modules/storage.js");
  const state = {
    user: { id: 1 }, loggedIn: true, pendingAttachments: [1],
    chats: [{ id: "c", messages: [{ attachments: [{ dataUrl: "x".repeat(1_300_000), name: "a" }] }] }],
    memory: [{ user: "u", ai: "a" }], settings: { memory: true }
  };
  const cloud = serializeForCloud(state);
  assert.deepEqual(Object.keys(cloud), ["chats", "memory", "settings", "updated_at"]);
  assert.equal(cloud.chats[0].messages[0].attachments[0].dataUrl, undefined);
  const builder = result => {
    const calls = [];
    const q = { };
    for (const m of ["select", "eq", "maybeSingle", "single", "upsert"]) q[m] = (...a) => { calls.push([m, ...a]); return q; };
    q.then = resolve => resolve(result);
    return { calls, client: { from: table => { calls.push(["from", table]); return q; } } };
  };
  const ok = builder({ data: { updated_at: "SERVER", chats: [1] }, error: null });
  assert.deepEqual(await loadCloudData(ok.client, "u1"), { updated_at: "SERVER", chats: [1] });
  assert.deepEqual(ok.calls[0], ["from", "user_data"]);
  assert.equal((await saveCloudData(ok.client, "u1", cloud)).updated_at, "SERVER");
  await assert.rejects(saveCloudData(builder({ data: null, error: new Error("rls") }).client, "u1", cloud), /rls/);
});

// --- retrieval
await test("local retrieval finds the relevant passage", async () => {
  const { pickRelevantText } = await load("modules/rag.js");
  const filler = i => `Paragraph ${i} is about gardening and weather and other unrelated chores. `.repeat(6);
  let doc = "";
  for (let i = 0; i < 40; i++) doc += filler(i) + "\n\n";
  doc += "The invoice total for the Zephyr contract is 4,820 euros.\n\n";
  for (let i = 40; i < 60; i++) doc += filler(i) + "\n\n";
  const out = pickRelevantText(doc, "What is the invoice total for the Zephyr contract?", 1500);
  assert.ok(out.length <= 1500 && out.includes("4,820 euros"));
  assert.equal(pickRelevantText("tiny", "q", 1500), "tiny");
  assert.ok(pickRelevantText("x".repeat(100000), "x", 1000).length <= 1000);
});

// --- SLM engine wrapper with a mock engine
const mockEngine = join(sandbox, "mock-webllm.mjs");
writeFileSync(mockEngine, `
export async function CreateMLCEngine(id, { initProgressCallback }) {
  globalThis.__modelId = id;
  for (let i = 1; i <= 3; i++) { await new Promise(r => setTimeout(r, 30)); initProgressCallback({ progress: i / 3, timeElapsed: i * 3, text: "Fetching param cache[1/3]: " + (i * 100) + "MB fetched." }); }
  let interrupted = false;
  return { interruptGenerate() { interrupted = true; }, chat: { completions: { async create() {
    interrupted = false;
    return (async function* () { for (const t of ["a", "b", "c", "d"]) { if (interrupted) return; await new Promise(r => setTimeout(r, 20)); yield { choices: [{ delta: { content: t } }] }; } })();
  } } } };
}`);
const slmSource = readFileSync(join(root, "modules/slm.js"), "utf8")
  .replace(/const ENGINE_SOURCES = \[[\s\S]*?\];/, `const ENGINE_SOURCES = [${JSON.stringify(pathToFileURL(mockEngine).href)}];`);
const freshSlm = async tag => {
  const file = join(sandbox, `slm-${tag}.mjs`);
  writeFileSync(file, slmSource);
  return import(pathToFileURL(file).href);
};
const setGpu = value => Object.defineProperty(globalThis, "navigator", { value, configurable: true });
const collect = async (slm, options) => {
  const out = [];
  try { for await (const token of slm.streamSlm([], options)) out.push(token); } catch (error) { return { out, error: error.name }; }
  return { out };
};

await test("SLM streams tokens and reports progress", async () => {
  setGpu({ gpu: { requestAdapter: async () => ({ features: new Set(["shader-f16"]), limits: { maxBufferSize: 1e9 } }) } });
  const slm = await freshSlm("normal");
  const reports = [];
  const result = await collect(slm, { onProgress: (report, model) => reports.push(slm.describeProgress(report, model)) });
  assert.deepEqual(result.out, ["a", "b", "c", "d"]);
  assert.equal(reports.length, 3);
  assert.match(reports[1], /67%.*200 MB of about 880 MB.*MB\/s.*left/);
  assert.equal(globalThis.__modelId, "Llama-3.2-1B-Instruct-q4f16_1-MLC");
});
await test("SLM picks a model by device", async () => {
  const pick = async (adapter, memory) => {
    setGpu({ deviceMemory: memory, gpu: { requestAdapter: async () => adapter } });
    return (await (await freshSlm("pick" + Math.random())).pickModel()).id;
  };
  assert.equal(await pick({ features: new Set(), limits: { maxBufferSize: 4 * 1024 ** 3 } }, 8), "Llama-3.2-1B-Instruct-q4f32_1-MLC");
  assert.equal(await pick({ features: new Set(["shader-f16"]), limits: { maxBufferSize: 4 * 1024 ** 3 } }, 8), "Llama-3.2-3B-Instruct-q4f16_1-MLC");
  assert.equal(await pick({ features: new Set(["shader-f16"]), limits: { maxBufferSize: 4 * 1024 ** 3 } }, 4), "Llama-3.2-1B-Instruct-q4f16_1-MLC");
  assert.equal(await pick(null, 8), "Llama-3.2-1B-Instruct-q4f32_1-MLC");
});
await test("Stop mid-reply throws AbortError", async () => {
  setGpu({ gpu: {} });
  const slm = await freshSlm("midstop");
  const controller = new AbortController();
  const got = [];
  await assert.rejects(async () => { for await (const t of slm.streamSlm([], { signal: controller.signal })) { got.push(t); if (got.length === 2) controller.abort(); } }, { name: "AbortError" });
  assert.deepEqual(got, ["a", "b"]);
});
await test("Stop during load is immediate", async () => {
  setGpu({ gpu: {} });
  const slm = await freshSlm("loadstop");
  const controller = new AbortController();
  const started = Date.now();
  setTimeout(() => controller.abort(), 10);
  await assert.rejects(async () => { for await (const t of slm.streamSlm([], { signal: controller.signal })) {} }, { name: "AbortError" });
  assert.ok(Date.now() - started < 80);
});
await test("a second caller gets progress after the first was aborted", async () => {
  setGpu({ gpu: {} });
  const slm = await freshSlm("second");
  await collect(slm, { onProgress: () => assert.fail("stale listener"), signal: AbortSignal.abort() });
  const seen = [];
  await collect(slm, { onProgress: report => seen.push(report.progress) });
  assert.equal(seen.length, 3);
});
await test("engine falls back to the next source", async () => {
  setGpu({ gpu: {} });
  const file = join(sandbox, "slm-fallback.mjs");
  writeFileSync(file, readFileSync(join(root, "modules/slm.js"), "utf8").replace(/const ENGINE_SOURCES = \[[\s\S]*?\];/,
    `const ENGINE_SOURCES = ["./does-not-exist.mjs", ${JSON.stringify(pathToFileURL(mockEngine).href)}];`));
  const slm = await import(pathToFileURL(file).href);
  assert.deepEqual((await collect(slm, {})).out, ["a", "b", "c", "d"]);
});
await test("a failed model download gives a friendly error", async () => {
  setGpu({ gpu: {} });
  const failing = join(sandbox, "failing-webllm.mjs");
  writeFileSync(failing, `export async function CreateMLCEngine() { throw new TypeError("Failed to fetch"); }`);
  const file = join(sandbox, "slm-failing.mjs");
  writeFileSync(file, readFileSync(join(root, "modules/slm.js"), "utf8").replace(/const ENGINE_SOURCES = \[[\s\S]*?\];/,
    `const ENGINE_SOURCES = [${JSON.stringify(pathToFileURL(failing).href)}];`));
  const slm = await import(pathToFileURL(file).href);
  await assert.rejects(async () => { for await (const t of slm.streamSlm([], {})) {} }, /Couldn't download the AUI model/);
});
await test("no WebGPU gives a clear error", async () => {
  setGpu({});
  const slm = await freshSlm("nogpu");
  await assert.rejects(async () => { for await (const t of slm.streamSlm([], {})) {} }, /needs WebGPU/);
});

// --- chat page prompt helpers (extracted from chat/app.js)
await test("prompt trimming keeps newest turns within budget", async () => {
  const source = readFileSync(join(root, "chat/app.js"), "utf8");
  const start = source.indexOf("const SLM_PROMPT_CHAR_BUDGET");
  const end = source.indexOf("async function consumeEventStream(");
  const file = join(sandbox, "prompt.mjs");
  writeFileSync(file, `import { pickRelevantText } from ${JSON.stringify(pathToFileURL(join(root, "modules/rag.js")).href)};
${source.slice(start, end)}
export { buildSlmUserText, fitSlmMessages };`);
  const { buildSlmUserText, fitSlmMessages } = await import(pathToFileURL(file).href);
  const history = Array.from({ length: 18 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: "x".repeat(1500) + i }));
  const messages = fitSlmMessages("sys", history, "hello");
  assert.ok(messages.reduce((n, m) => n + m.content.length, 0) <= 8000);
  assert.ok(messages.at(-2).content.endsWith("17"));
  const attached = buildSlmUserText("q", [{ name: "a.txt", extractedText: "y".repeat(9000) }, { name: "i.png", kind: "image" }]);
  assert.ok(attached.length < 4200 && attached.includes("can't read"));
});

console.log(`\n${passed} test groups passed`);
