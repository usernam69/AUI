// Renders known XSS payloads through AUI's Markdown pipeline in a real browser and fails
// if any script runs or any dangerous markup survives (The Probe 759, 800).
// Usage: npm i --no-save playwright && npx playwright install chromium && node scripts/xss-check.mjs
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(process.env.AUI_ROOT || fileURLToPath(new URL("../AUI Code/", import.meta.url)));
const TYPES = { ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".html": "text/html" };

const PAYLOADS = [
  "<script>window.__xss = 1</script>",
  "<img src=x onerror=\"window.__xss = 2\">",
  "[click](javascript:window.__xss=3)",
  "<svg><script>window.__xss = 4</script></svg>",
  "<iframe src=\"javascript:parent.__xss = 5\"></iframe>",
  "<a href=\"jav&#x09;ascript:window.__xss=6\">x</a>",
  "<details open ontoggle=\"window.__xss = 7\">x</details>",
  "<math><mtext><table><mglyph><style><img src=x onerror=\"window.__xss = 8\">",
  "![x](x\" onerror=\"window.__xss=9)",
  "<form action=\"javascript:window.__xss=10\"><button>go</button></form>",
  "```html\n<img src=x onerror=\"window.__xss = 11\">\n```",
  "$\\href{javascript:window.__xss=12}{click}$",
  "| a |\n| - |\n| <img src=x onerror=window.__xss=13> |",
  "<style>@import 'javascript:window.__xss=14'</style>",
  "<object data=\"javascript:window.__xss=15\"></object>",
  "<embed src=\"javascript:window.__xss=16\">",
  "<base href=\"javascript:window.__xss=17//\">",
  "<input autofocus onfocus=\"window.__xss = 18\">",
  "```mermaid\ngraph TD; A[\"<img src=x onerror=window.__xss=19>\"]-->B;\n```",
  "```chart\n{\"title\":\"<img src=x onerror=window.__xss=20>\",\"labels\":[\"<b onmouseover=x>\"],\"data\":[1]}\n```"
];

const server = createServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  if (path === "/") {
    response.writeHead(200, { "content-type": "text/html" });
    return response.end("<!doctype html><html><body><main id=out></main></body></html>");
  }
  try {
    const file = join(root, path);
    if (!file.startsWith(root)) throw new Error("outside");
    const body = await readFile(file);
    response.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end();
  }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage();
const failures = [];
page.on("dialog", dialog => {
  failures.push(`a dialog opened: ${dialog.message()}`);
  dialog.dismiss();
});
await page.goto(`${base}/`);
const results = await page.evaluate(async payloads => {
  const markdown = await import("/modules/markdown.js");
  const out = [];
  for (const payload of payloads) {
    const box = document.createElement("div");
    document.getElementById("out").append(box);
    markdown.renderRichMarkdown(box, payload);
    await new Promise(resolve => setTimeout(resolve, 150));
    // A <form> is allowed through (the CSP's form-action 'self' stops it posting elsewhere);
    // what must never survive is a javascript: action or a handler, which the attribute test catches.
    const dangerous = [...box.querySelectorAll("*")].some(node => [...node.attributes].some(attribute => /^on/i.test(attribute.name) || /^\s*javascript:/i.test(attribute.value)))
      || box.querySelector("script, iframe, object, embed, base, style:not(.katex style)");
    out.push({ payload, dangerous: Boolean(dangerous) });
  }
  return { out, xss: window.__xss || 0 };
}, PAYLOADS);
await page.waitForTimeout(500);
const lateXss = await page.evaluate(() => window.__xss || 0);
results.out.filter(result => result.dangerous).forEach(result => failures.push(`dangerous markup survived: ${result.payload}`));
if (results.xss || lateXss) failures.push(`a payload ran script (marker ${results.xss || lateXss})`);
await browser.close();
server.close();

if (failures.length) {
  console.error(`XSS check failed:\n${failures.map(failure => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`XSS check passed: ${PAYLOADS.length} payloads rendered safely.`);
