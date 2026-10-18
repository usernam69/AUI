import { marked } from "https://esm.sh/marked@16.1.2";
import DOMPurify from "https://esm.sh/dompurify@3.2.6";
import hljs from "https://esm.sh/highlight.js@11.11.1/lib/common";
import katex from "https://esm.sh/katex@0.16.22";

marked.setOptions({
  gfm: true,
  breaks: true,
  async: false
});

const cache = new Map();
const CACHE_LIMIT = 80;

const SANITIZE = { USE_PROFILES: { html: true }, ADD_ATTR: ["target", "rel", "aria-label"] };

// Index of the last blank line that is not inside a code fence, or -1.
function stableSplit(text) {
  let index = text.lastIndexOf("

");
  while (index > 0) {
    if ((text.slice(0, index).match(/^```/gm) || []).length % 2 === 0) return index;
    index = text.lastIndexOf("

", index - 1);
  }
  return -1;
}

// While streaming, only the unfinished last block is re-parsed on each paint.
function renderStreamingTail(container, text) {
  const split = stableSplit(text);
  if (split < 400) return false;
  const stable = text.slice(0, split);
  let tail = container.querySelector(":scope > .streamTail");
  if (container._auiStable !== stable || !tail) {
    container.innerHTML = `${DOMPurify.sanitize(marked.parse(stable), SANITIZE)}<div class="streamTail"></div>`;
    container._auiStable = stable;
    tail = container.lastElementChild;
  }
  tail.innerHTML = DOMPurify.sanitize(marked.parse(text.slice(split)), SANITIZE);
  // Force the final, non-streaming render to rebuild everything in one piece.
  container._auiRenderedSource = null;
  return true;
}

export function renderRichMarkdown(container, source, { streaming = false } = {}) {
  const text = String(source || "");
  if (streaming && renderStreamingTail(container, text)) {
    enhanceCodeBlocks(container);
    const blocks = [...container.querySelectorAll("pre code")];
    blocks.slice(0, text.split("```").length % 2 === 0 ? -1 : undefined).forEach(highlightCached);
    return;
  }
  container._auiStable = null;
  let html = !streaming ? cache.get(text) : null;

  if (!html) {
    html = DOMPurify.sanitize(marked.parse(prepareFootnotes(text)), {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target", "rel", "aria-label"]
    });
    if (!streaming) remember(text, html);
  }

  if (container._auiRenderedSource !== text) {
    container.innerHTML = html;
    container._auiRenderedSource = text;
  }

  // Code controls are lightweight and remain useful while the response streams.
  enhanceCodeBlocks(container);

  // Finished code blocks get highlighted even mid-stream, from a cache so repaints stay cheap.
  if (streaming) {
    const blocks = [...container.querySelectorAll("pre code")];
    blocks.slice(0, text.split("```").length % 2 === 0 ? -1 : undefined).forEach(highlightCached);
    return;
  }

  container.querySelectorAll("a[href]").forEach(link => {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
  container.querySelectorAll("img").forEach(image => {
    image.loading = "lazy";
    image.decoding = "async";
  });

  container.querySelectorAll("pre code").forEach(highlightCached);

  renderMath(container);
  enhanceRendered(container);
}

const highlightCache = new Map();
function highlightCached(block) {
  if (block.dataset.highlighted) return;
  const source = block.textContent;
  const language = [...block.classList].find(name => name.startsWith("language-"))?.slice(9);
  const key = `${language || ""}\u0000${source}`;
  let result = highlightCache.get(key);
  if (!result) {
    try {
      result = language && hljs.getLanguage(language)
        ? { html: hljs.highlight(source, { language }).value, language }
        : (() => {
          const hinted = guessLanguage(source);
          if (hinted) return { html: hljs.highlight(source, { language: hinted }).value, language: hinted };
          const auto = hljs.highlightAuto(source);
          return { html: auto.value, language: auto.language };
        })();
    } catch {
      return;
    }
    highlightCache.set(key, result);
    if (highlightCache.size > 200) highlightCache.delete(highlightCache.keys().next().value);
  }
  block.innerHTML = result.html;
  block.classList.add("hljs");
  block.dataset.highlighted = "yes";
  // Unlabeled blocks get the guessed language in their header.
  const label = block.closest(".codeBlock")?.querySelector(".codeHeader > span:first-child");
  if (label && label.textContent === "code" && result.language) {
    label.textContent = result.language;
    block.closest(".codeBlock").dataset.language = result.language;
  }
}

// Cheap, reliable hints first; highlight.js's auto-detect often confuses Python and Ruby.
function guessLanguage(source) {
  if (/^\s*(def|class) \w+.*:\s*$/m.test(source) || /^\s*(import \w+|from \w+ import)/m.test(source)) return "python";
  if (/^\s*[{[]/.test(source) && /"\s*:/.test(source)) return "json";
  if (/^\s*<(!doctype|html|div|body|head)/i.test(source)) return "xml";
  if (/(const|let|function|=>|console\.log)/.test(source)) return "javascript";
  if (/^\s*(SELECT|INSERT|UPDATE|CREATE TABLE)/im.test(source)) return "sql";
  if (/^#!\/bin\/(ba)?sh|^\s*(sudo |npm |git |cd |echo )/m.test(source)) return "bash";
  return "";
}

// Footnotes: [^1] references and "[^1]: text" definitions become a numbered list.
function prepareFootnotes(text) {
  if (!/\[\^[^\]]+\]:/.test(text)) return text;
  const notes = [];
  const body = text.replace(/^\[\^([^\]]+)\]:\s*(.+)$/gm, (_, id, note) => {
    notes.push([id, note]);
    return "";
  });
  if (!notes.length) return text;
  const order = notes.map(([id]) => id);
  const linked = body.replace(/\[\^([^\]]+)\]/g, (match, id) => {
    const index = order.indexOf(id);
    return index < 0 ? match : `<sup class="footnoteRef">${index + 1}</sup>`;
  });
  return `${linked}\n\n<hr class="footnoteRule">\n\n${notes.map(([, note], index) => `${index + 1}. ${note}`).join("\n")}`;
}

const EMOJI_CODES = {
  smile: "😄", grin: "😁", joy: "😂", wink: "😉", heart: "❤️", thumbsup: "👍", "+1": "👍", thumbsdown: "👎", "-1": "👎",
  fire: "🔥", rocket: "🚀", tada: "🎉", star: "⭐", sparkles: "✨", warning: "⚠️", check: "✅", white_check_mark: "✅",
  x: "❌", bulb: "💡", eyes: "👀", thinking: "🤔", clap: "👏", pray: "🙏", muscle: "💪", coffee: "☕", pizza: "🍕",
  bug: "🐛", memo: "📝", book: "📖", calendar: "📅", lock: "🔒", key: "🔑", gear: "⚙️", zap: "⚡", robot: "🤖",
  wave: "👋", ok_hand: "👌", sunglasses: "😎", cry: "😢", sob: "😭", angry: "😠", sweat_smile: "😅", party: "🥳",
  heart_eyes: "😍", rainbow: "🌈", sun: "☀️", moon: "🌙", earth: "🌍", computer: "💻", phone: "📱", chart: "📈", pin: "📌"
};

function walkText(container, visit) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: node => node.parentElement?.closest("code, pre, .katex, a") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(visit);
}

function enhanceRendered(container) {
  // 269 emoji shortcodes
  walkText(container, node => {
    if (!node.nodeValue.includes(":")) return;
    node.nodeValue = node.nodeValue.replace(/:([a-z0-9_+-]{1,20}):/g, (match, code) => EMOJI_CODES[code] || match);
  });

  // 268 callouts: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > [!CAUTION]
  container.querySelectorAll("blockquote").forEach(quote => {
    const first = quote.querySelector("p");
    const match = /^\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i.exec(first?.textContent || "");
    if (!match) return;
    const kind = match[1].toLowerCase();
    quote.classList.add("callout", `callout-${kind}`);
    first.innerHTML = first.innerHTML.replace(/^\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*(<br>)?/i, "");
    const title = document.createElement("strong");
    title.className = "calloutTitle";
    title.textContent = kind[0].toUpperCase() + kind.slice(1);
    quote.prepend(title);
  });

  // 274 long bare URLs show just the domain
  container.querySelectorAll("a[href]").forEach(link => {
    if (link.textContent === link.getAttribute("href") && link.textContent.length > 50) {
      try {
        const url = new URL(link.href);
        link.textContent = `${url.hostname}${url.pathname.length > 1 ? "/…" : ""}`;
        link.title = link.href;
      } catch {}
    }
  });

  // 267 task lists become clickable
  container.querySelectorAll('input[type="checkbox"]').forEach((box, index) => {
    box.disabled = false;
    box.dataset.taskIndex = String(index);
    box.closest("li")?.classList.add("taskItem");
  });

  // 270 click math to copy its LaTeX source
  container.querySelectorAll(".mathBlock, .mathInline").forEach(math => {
    const source = math.querySelector('annotation[encoding="application/x-tex"]')?.textContent;
    if (source) {
      math.dataset.tex = source;
      math.title = "Click to copy LaTeX";
    }
  });

  // 260/261 tables: sortable headers and CSV download
  container.querySelectorAll("table").forEach(table => {
    if (table.parentElement?.classList.contains("tableWrap")) return;
    const wrap = document.createElement("div");
    wrap.className = "tableWrap";
    const tools = document.createElement("div");
    tools.className = "tableTools";
    tools.innerHTML = '<button type="button" data-table-csv>Download CSV</button>';
    table.before(wrap);
    wrap.append(tools, table);
    table.querySelectorAll("th").forEach((th, column) => {
      th.tabIndex = 0;
      th.dataset.sortColumn = String(column);
      th.title = "Sort by this column";
    });
  });

  // 264/265 long replies: table of contents and collapsible sections
  const headings = [...container.querySelectorAll(":scope > h2, :scope > h3")];
  if (headings.length >= 3) {
    headings.forEach((heading, index) => {
      heading.id = heading.id || `section-${Math.random().toString(36).slice(2, 8)}-${index}`;
      heading.classList.add("foldable");
      heading.tabIndex = 0;
    });
  }
  if (headings.length >= 4 && !container.querySelector(":scope > .replyToc")) {
    const toc = document.createElement("nav");
    toc.className = "replyToc";
    toc.setAttribute("aria-label", "Contents");
    toc.innerHTML = `<strong>Contents</strong>${headings.map(heading => `<a href="#${heading.id}" data-toc-link>${escapeText(heading.textContent)}</a>`).join("")}`;
    container.prepend(toc);
  }

  // 276 lead paragraph of long replies
  if (container.textContent.length > 800) container.querySelector(":scope > p")?.classList.add("leadParagraph");

  // 254/256/257 code tools
  container.querySelectorAll(".codeBlock").forEach(block => {
    const actions = block.querySelector(".codeHeaderActions");
    if (!actions || actions.querySelector("[data-code-lines]")) return;
    const language = (block.dataset.language || block.querySelector(".codeHeader > span")?.textContent || "").toLowerCase();
    actions.insertAdjacentHTML("afterbegin", '<button type="button" data-code-lines aria-pressed="false" aria-label="Show line numbers">#</button><button type="button" data-code-download aria-label="Download code">Download</button>');
    if (["html", "xml", "svg", "javascript", "js", "css"].includes(language)) {
      actions.insertAdjacentHTML("afterbegin", '<button type="button" data-code-run aria-label="Run this code in a sandbox">Run</button>');
    }
  });

  // 262/263 diagrams and charts render after the page is ready
  renderDiagrams(container);
  renderCharts(container);
}

let mermaidPromise = null;
async function renderDiagrams(container) {
  const blocks = [...container.querySelectorAll("pre code.language-mermaid")];
  if (!blocks.length) return;
  try {
    mermaidPromise ||= import("https://esm.sh/mermaid@11.4.1").then(module => {
      const mermaid = module.default;
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: document.documentElement.dataset.theme === "light" ? "default" : "dark" });
      return mermaid;
    });
    const mermaid = await mermaidPromise;
    for (const code of blocks) {
      const host = code.closest(".codeBlock") || code.closest("pre");
      if (host.classList.contains("hasRendering")) continue;
      const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).slice(2)}`, code.textContent);
      const figure = document.createElement("figure");
      figure.className = "diagram";
      figure.innerHTML = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } });
      host.after(figure);
      host.classList.add("hasRendering");
    }
  } catch {
    // Invalid diagrams stay visible as code.
  }
}

// ```chart blocks hold JSON: {"type":"bar"|"line","labels":[...],"data":[...]}
function renderCharts(container) {
  container.querySelectorAll("pre code.language-chart").forEach(code => {
    const host = code.closest(".codeBlock") || code.closest("pre");
    if (host.nextElementSibling?.classList.contains("miniChart")) return;
    let spec;
    try { spec = JSON.parse(code.textContent); } catch { return; }
    const values = (spec.data || []).map(Number).filter(Number.isFinite);
    const labels = (spec.labels || values.map((_, index) => String(index + 1))).map(String);
    if (!values.length) return;
    const width = 560;
    const height = 220;
    const pad = 28;
    const max = Math.max(...values, 0) || 1;
    const step = (width - pad * 2) / values.length;
    const y = value => height - pad - (value / max) * (height - pad * 2);
    let marks = "";
    if (spec.type === "line") {
      const points = values.map((value, index) => `${pad + step * index + step / 2},${y(value)}`).join(" ");
      marks = `<polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>` + values.map((value, index) => `<circle cx="${pad + step * index + step / 2}" cy="${y(value)}" r="3.5" fill="var(--accent)"><title>${escapeText(labels[index] || "")}: ${value}</title></circle>`).join("");
    } else {
      marks = values.map((value, index) => `<rect x="${pad + step * index + step * 0.15}" y="${y(value)}" width="${step * 0.7}" height="${height - pad - y(value)}" rx="4" fill="var(--accent)"><title>${escapeText(labels[index] || "")}: ${value}</title></rect>`).join("");
    }
    const axis = labels.map((label, index) => `<text x="${pad + step * index + step / 2}" y="${height - 8}" text-anchor="middle" font-size="11" fill="var(--muted)">${escapeText(label.slice(0, 10))}</text>`).join("");
    const figure = document.createElement("figure");
    figure.className = "miniChart";
    figure.innerHTML = `${spec.title ? `<figcaption>${escapeText(spec.title)}</figcaption>` : ""}<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeText(spec.title || "Chart")}"><line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="var(--border-strong)"/>${marks}${axis}</svg>`;
    host.after(figure);
    host.classList.add("hasRendering");
  });
}

function remember(source, html) {
  cache.set(source, html);
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
}

function renderMath(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const parent = walker.currentNode.parentElement;
    if (!parent?.closest("code, pre, .katex")) nodes.push(walker.currentNode);
  }

  for (const node of nodes) {
    const value = node.nodeValue;
    if (!value?.includes("$")) continue;
    const pattern = /(\$\$[\s\S]+?\$\$|\$(?!\s)(?:\\.|[^$\n])+?\$)/g;
    if (!pattern.test(value)) continue;
    pattern.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    while ((match = pattern.exec(value))) {
      fragment.append(document.createTextNode(value.slice(lastIndex, match.index)));
      const displayMode = match[0].startsWith("$$");
      const expression = match[0].slice(displayMode ? 2 : 1, displayMode ? -2 : -1);
      const wrapper = document.createElement(displayMode ? "div" : "span");
      wrapper.className = displayMode ? "mathBlock" : "mathInline";
      try {
        katex.render(expression, wrapper, { displayMode, throwOnError: false, trust: false, strict: "ignore" });
      } catch {
        wrapper.textContent = match[0];
      }
      fragment.append(wrapper);
      lastIndex = pattern.lastIndex;
    }
    fragment.append(document.createTextNode(value.slice(lastIndex)));
    node.replaceWith(fragment);
  }
}

function enhanceCodeBlocks(container) {
  container.querySelectorAll("pre").forEach(pre => {
    if (pre.parentElement?.classList.contains("codeBlock")) return;
    const code = pre.querySelector("code");
    const languageClass = [...(code?.classList || [])].find(name => name.startsWith("language-"));
    const language = languageClass?.replace("language-", "") || "code";
    const wrapper = document.createElement("div");
    wrapper.className = "codeBlock";
    const header = document.createElement("div");
    header.className = "codeHeader";
    header.innerHTML = `<span>${escapeText(language)}</span><span class="codeHeaderActions"><button type="button" data-wrap-code aria-pressed="false" aria-label="Wrap long lines">Wrap</button><button type="button" data-copy-code aria-label="Copy ${escapeText(language)} code">Copy</button></span>`;
    pre.before(wrapper);
    wrapper.append(header, pre);
  });
}

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}
