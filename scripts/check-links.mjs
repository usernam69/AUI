// Fails the deploy if a page links to a file that isn't in the built site.
// Usage: node scripts/check-links.mjs <site-folder> <base-path>
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";

const [siteDir = "_site", base = "/"] = process.argv.slice(2);
const root = resolve(siteDir);

const walk = dir => readdirSync(dir).flatMap(name => {
  const full = join(dir, name);
  return statSync(full).isDirectory() ? walk(full) : [full];
});

function exists(path) {
  const clean = decodeURIComponent(path.split(/[?#]/)[0]);
  const target = join(root, clean);
  if (!target.startsWith(root)) return false;
  if (existsSync(target) && statSync(target).isFile()) return true;
  return existsSync(join(target, "index.html")) || existsSync(`${target}.html`);
}

const broken = [];
for (const file of walk(root).filter(name => name.endsWith(".html"))) {
  const html = readFileSync(file, "utf8")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<template[\s\S]*?<\/template>/gi, "");
  for (const [, , url] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|blob:|#|javascript:)/i.test(url) || url.includes("${")) continue;
    let path;
    if (url.startsWith(base)) path = url.slice(base.length);
    else if (url.startsWith("/")) {
      broken.push(`${relative(root, file)}: ${url} (missing the ${base} prefix)`);
      continue;
    } else {
      path = relative(root, join(dirname(file), url)).replace(/\\/g, "/");
    }
    if (path === "" || path.endsWith("/")) path += "index.html";
    if (!exists(path)) broken.push(`${relative(root, file)}: ${url}`);
  }
}

if (broken.length) {
  console.error(`Broken links:\n${broken.join("\n")}`);
  process.exit(1);
}
console.log("All internal links resolve.");
