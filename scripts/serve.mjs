// Local preview that behaves like GitHub Pages: the site is served under /AUI/
// with the same link rewrites the deploy workflow applies. No dependencies.
// Usage: node scripts/serve.mjs [port]   then open http://localhost:8080/AUI/
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../AUI Code/", import.meta.url)));
const port = Number(process.argv[2]) || 8080;
const BASE = "/AUI/";
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".xml": "application/xml", ".md": "text/markdown; charset=utf-8"
};

async function resolveFile(path) {
  const target = join(root, decodeURIComponent(path));
  if (!target.startsWith(root)) return null;
  for (const candidate of [target, join(target, "index.html"), `${target}.html`]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {}
  }
  return null;
}

createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (!url.pathname.startsWith(BASE)) {
    response.writeHead(302, { location: BASE });
    return response.end();
  }
  const file = await resolveFile(url.pathname.slice(BASE.length));
  if (!file) {
    response.writeHead(404, { "content-type": TYPES[".html"] });
    return response.end(await readFile(join(root, "404.html")).catch(() => "Not found"));
  }
  let body = await readFile(file);
  const type = TYPES[extname(file)] || "application/octet-stream";
  if (extname(file) === ".html") {
    body = body.toString("utf8")
      .replace(/(src|href|content)="\/([^/"][^"]*)?"/g, (_, attribute, rest = "") => `${attribute}="${BASE}${rest}"`)
      .replace('register("/chat/sw.js"', `register("${BASE}chat/sw.js"`);
  } else if (extname(file) === ".js" && !file.endsWith(join("chat", "sw.js"))) {
    body = body.toString("utf8").replace(/"\/(chat|beta|about)(\/?)(["?])/g, `"${BASE}$1$2$3`);
  }
  response.writeHead(200, { "content-type": type, "cache-control": "no-store" });
  response.end(body);
}).listen(port, () => console.log(`AUI preview: http://localhost:${port}${BASE}`));
