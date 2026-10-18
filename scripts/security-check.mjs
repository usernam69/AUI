// Static security checks for CI (The Probe 760, 761, 769, 795).
// Usage: node scripts/security-check.mjs            (repository checks, fail on problems)
//        node scripts/security-check.mjs --live URL (also check the deployed page's protections)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(fileURLToPath(new URL("..", import.meta.url)));
const site = join(repo, "AUI Code");
const problems = [];
const notes = [];

const walk = dir => readdirSync(dir).flatMap(name => {
  if ([".git", "node_modules", "_site"].includes(name)) return [];
  const full = join(dir, name);
  return statSync(full).isDirectory() ? walk(full) : [full];
});
const files = walk(repo).filter(file => /\.(js|mjs|html|json|sql|md|yml|webmanifest|txt|css)$/.test(file));

// 761: secrets that must never be committed.
const SECRET_PATTERNS = [
  [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, "a private key"],
  [/eyJhbGciOi[\w-]{10,}\.eyJ[\w-]*cm9sZSI6InNlcnZpY2Vfcm9sZS[\w-]*\.[\w-]{20,}/, "a Supabase service-role JWT"],
  [/\bsb_secret_[A-Za-z0-9_-]{16,}/, "a Supabase secret key"],
  [/\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{32,}/, "an API secret key"],
  [/\bAKIA[0-9A-Z]{16}\b/, "an AWS access key"],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}\b/, "a GitHub token"]
];
for (const file of files) {
  if (/[\\/]vendor[\\/]/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const [pattern, label] of SECRET_PATTERNS) {
    if (pattern.test(text)) problems.push(`${relative(repo, file)} contains what looks like ${label}`);
  }
}

// 760: every link that opens a new tab also cuts the opener.
for (const file of files.filter(name => /\.(html|js|mjs)$/.test(name) && !/[\\/]vendor[\\/]/.test(name) && !/scripts[\\/]/.test(name))) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
    if (!/rel=["'][^"']*noopener/i.test(match[0])) problems.push(`${relative(repo, file)}: link opens a new tab without rel="noopener": ${match[0].slice(0, 120)}`);
  }
  for (const match of text.matchAll(/window\.open\((.*?)\);(.*)$/gm)) {
    // A blank window AUI writes into itself (printing) needs its opener; mark it with "opener-needed".
    if (!/noopener/.test(match[1]) && !/opener-needed/.test(match[2])) problems.push(`${relative(repo, file)}: window.open without "noopener": ${match[0].slice(0, 120)}`);
  }
}

// 756: the app pages keep their Content Security Policy and have no inline handlers.
for (const page of ["chat/index.html", "beta/index.html", "beta/admin/index.html"]) {
  const html = readFileSync(join(site, page), "utf8");
  if (!html.includes('http-equiv="Content-Security-Policy"')) problems.push(`${page} has no Content Security Policy`);
  if (/\son[a-z]+=["']/i.test(html)) problems.push(`${page} has an inline event handler, which the CSP blocks`);
}

// 789: vendored files must not pull code from elsewhere.
for (const file of readdirSync(join(site, "modules/vendor")).filter(name => name.endsWith(".mjs"))) {
  const text = readFileSync(join(site, "modules/vendor", file), "utf8");
  if (/(?:from|import)\s?["'](?:\/|https?:)/.test(text)) problems.push(`modules/vendor/${file} imports code from another URL`);
}

// 769: say when a newer WebLLM is out (a note, not a failure).
try {
  const vendored = readdirSync(join(site, "modules/vendor")).find(name => /^web-llm-[\d.]+\.js$/.test(name))?.match(/web-llm-([\d.]+)\.js/)?.[1];
  const response = await fetch("https://registry.npmjs.org/@mlc-ai/web-llm/latest", { signal: AbortSignal.timeout(8000) });
  const latest = (await response.json()).version;
  notes.push(vendored === latest ? `WebLLM ${vendored} is the latest release.` : `WebLLM ${latest} is out (AUI vendors ${vendored}). See modules/vendor/README.md before updating.`);
} catch {
  notes.push("Couldn't reach npm to compare the WebLLM version.");
}

// 795: the deployed page still carries its protections.
const liveIndex = process.argv.indexOf("--live");
if (liveIndex > 0) {
  const url = process.argv[liveIndex + 1];
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const html = await response.text();
    if (!html.includes("Content-Security-Policy")) problems.push(`${url} is served without its Content Security Policy`);
    const https = url.startsWith("https://");
    if (!https) problems.push(`${url} is not served over HTTPS`);
    notes.push(`Live page ${url}: HTTP ${response.status}, CSP ${html.includes("Content-Security-Policy") ? "present" : "missing"}, HSTS ${response.headers.get("strict-transport-security") ? "on" : "off (GitHub Pages sets it on the github.io domain)"}.`);
  } catch (error) {
    problems.push(`Couldn't load ${url}: ${error.message}`);
  }
}

notes.forEach(note => console.log(`note: ${note}`));
if (problems.length) {
  console.error(`Security check found ${problems.length} problem(s):\n${problems.map(problem => `- ${problem}`).join("\n")}`);
  process.exit(1);
}
console.log("Security check passed.");
