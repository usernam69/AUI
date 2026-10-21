// Runs axe-core on AUI's pages and on the chat dialogs, in light and dark, on a phone and a desktop.
// Fails on any violation, so a contrast, label or name regression is caught before it ships.
// Usage: npm i --no-save playwright axe-core && npx playwright install chromium && node scripts/axe-check.mjs
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axeSource = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
const root = resolve(process.env.AUI_ROOT || fileURLToPath(new URL("../AUI Code/", import.meta.url)));
const TYPES = { ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".html": "text/html", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };

const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path.endsWith("/")) path += "index.html";
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

const PAGES = ["/", "/chat/", "/help.html", "/privacy.html", "/security.html", "/changelog.html", "/accessibility.html", "/status.html", "/about/"];
const COMMANDS = ["/skills", "/study", "/cite", "/exams", "/plans", "/memory", "/settings", "/model"];
const VIEWPORTS = [["phone", 390, 800], ["desktop", 1360, 860]];
const SCHEMES = ["light", "dark"];

const problems = [];
const browser = await chromium.launch();

const scan = async (page, label) => {
  await page.evaluate(axeSource);
  const found = await page.evaluate(() => axe.run(document, { resultTypes: ["violations"] }).then(result => result.violations.map(v => `${v.id} [${v.impact}] ${v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")}`)));
  for (const line of found) problems.push(`${label}: ${line}`);
};

for (const [vname, width, height] of VIEWPORTS) {
  for (const scheme of SCHEMES) {
    const context = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, serviceWorkers: "block", hasTouch: vname === "phone", isMobile: vname === "phone" });
    await context.addInitScript(() => {
      try { localStorage.setItem("aui.setupDone", "1"); } catch {}
    });
    const page = await context.newPage();
    for (const path of PAGES) {
      await page.goto(base + path, { waitUntil: "load" });
      await page.waitForTimeout(700);
      // Sections fade in as they scroll into view; scan them once they are fully shown.
      const tall = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < tall; y += 500) {
        await page.evaluate(top => window.scrollTo(0, top), y);
        await page.waitForTimeout(80);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(700);
      await scan(page, `${vname}/${scheme} ${path}`);
    }
    // Dialogs inside the chat page.
    await page.goto(`${base}/chat/`, { waitUntil: "load" });
    await page.waitForTimeout(900);
    for (const command of COMMANDS) {
      await page.evaluate(() => document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close()));
      await page.fill("#messageInput", command);
      await page.evaluate(() => document.getElementById("messageInput").dispatchEvent(new Event("input", { bubbles: true })));
      await page.waitForTimeout(150);
      await page.evaluate(() => document.querySelector(".composerMenuItem")?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })));
      await page.waitForTimeout(500);
      if (!(await page.evaluate(() => Boolean(document.querySelector("dialog[open]"))))) {
        problems.push(`${vname}/${scheme} ${command}: no dialog opened`);
        continue;
      }
      await scan(page, `${vname}/${scheme} ${command}`);
    }
    await context.close();
  }
}

await browser.close();
server.close();
if (problems.length) {
  console.error(`Accessibility check failed with ${problems.length} problem(s):`);
  for (const problem of problems) console.error(` - ${problem}`);
  process.exit(1);
}
console.log(`Accessibility check passed: ${PAGES.length} pages and ${COMMANDS.length} dialogs, ${VIEWPORTS.length} sizes, ${SCHEMES.length} themes.`);
