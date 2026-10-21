// Citations in APA 7, MLA 9 and Chicago (bibliography entry), built from fields the student types
// in. No model is involved, so the punctuation is always the same and never invented.

export const STYLES = [["apa", "APA 7"], ["mla", "MLA 9"], ["chicago", "Chicago"]];
export const TYPES = [["website", "Web page"], ["book", "Book"], ["article", "Journal article"]];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT_MONTHS = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];

const clean = (value, max = 300) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// "Ada Lovelace" or "Lovelace, Ada" or one per line.
export function parseAuthors(value) {
  const list = Array.isArray(value) ? value : String(value ?? "").split(/\r?\n|;|\s+and\s+|\s&\s/i);
  return list.map(entry => {
    if (entry && typeof entry === "object") return { first: clean(entry.first, 60), last: clean(entry.last, 60) };
    const text = clean(entry, 120);
    if (!text) return null;
    if (text.includes(",")) {
      const [last, first] = text.split(",").map(part => part.trim());
      return { first: first || "", last };
    }
    const parts = text.split(" ");
    return parts.length === 1 ? { first: "", last: parts[0] } : { first: parts.slice(0, -1).join(" "), last: parts.at(-1) };
  }).filter(Boolean).slice(0, 20);
}

const initials = first => first.split(/[\s-]+/).filter(Boolean).map(part => `${part[0].toUpperCase()}.`).join(" ");

const monthIndex = value => {
  const text = clean(value, 20).toLowerCase();
  if (!text) return -1;
  const number = Number(text);
  if (Number.isInteger(number) && number >= 1 && number <= 12) return number - 1;
  return MONTHS.findIndex(name => name.toLowerCase().startsWith(text.slice(0, 3)));
};

const withEnd = text => (/[.?!]$/.test(text) ? text : `${text}.`);

// A piece of text can be italic. A reference is a list of pieces; it renders as plain text or as HTML.
const plain = text => ({ text });
const italic = text => ({ text, italic: true });
const escapeHtml = text => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function render(pieces) {
  const kept = pieces.filter(piece => piece && piece.text);
  return {
    text: kept.map(piece => piece.text).join("").replace(/\s+/g, " ").replace(/\.\./g, ".").replace(/\s+([.,])/g, "$1").trim(),
    html: kept.map(piece => (piece.italic ? `<i>${escapeHtml(piece.text)}</i>` : escapeHtml(piece.text))).join("").replace(/\s+/g, " ").replace(/\.\./g, ".").replace(/\s+([.,])/g, "$1").trim()
  };
}

const link = source => {
  const doi = clean(source.doi, 120).replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  if (doi) return `https://doi.org/${doi}`;
  return clean(source.url, 400);
};

function apaAuthors(authors) {
  const names = authors.map(author => (author.first ? `${author.last}, ${initials(author.first)}` : author.last));
  if (names.length <= 1) return names[0] || "";
  if (names.length === 2) return `${names[0]}, & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, & ${names.at(-1)}`;
}

function mlaAuthors(authors) {
  if (!authors.length) return "";
  const first = authors[0].first ? `${authors[0].last}, ${authors[0].first}` : authors[0].last;
  if (authors.length === 1) return first;
  if (authors.length === 2) return `${first}, and ${authors[1].first ? `${authors[1].first} ${authors[1].last}` : authors[1].last}`;
  return `${first}, et al.`;
}

function chicagoAuthors(authors) {
  if (!authors.length) return "";
  const full = authors.map((author, index) => (index === 0 && author.first ? `${author.last}, ${author.first}` : author.first ? `${author.first} ${author.last}` : author.last));
  if (full.length === 1) return full[0];
  if (full.length <= 10) return `${full.slice(0, -1).join(", ")}, and ${full.at(-1)}`;
  return `${full.slice(0, 7).join(", ")}, et al.`;
}

function apa(source, authors) {
  const month = monthIndex(source.month);
  const day = clean(source.day, 2);
  const date = source.year ? `(${clean(source.year, 4)}${source.type === "website" && month >= 0 ? `, ${MONTHS[month]}${day ? ` ${day}` : ""}` : ""})` : "(n.d.)";
  const head = authors.length ? [plain(withEnd(apaAuthors(authors))), plain(` ${date}. `)] : [];
  const title = clean(source.title);
  const where = link(source);
  if (source.type === "book") {
    const edition = clean(source.edition, 30);
    return [...head, ...(authors.length ? [] : [italic(withEnd(title)), plain(` ${date}. `)]), ...(authors.length ? [italic(title), plain(edition ? ` (${edition} ed.)` : ""), plain(". ")] : []), plain(source.publisher ? withEnd(clean(source.publisher)) : ""), plain(where ? ` ${where}` : "")];
  }
  if (source.type === "article") {
    const volume = clean(source.volume, 10);
    const issue = clean(source.issue, 10);
    const pages = clean(source.pages, 20).replace(/-/g, "–");
    return [...head, ...(authors.length ? [plain(withEnd(title)), plain(" ")] : [plain(withEnd(title)), plain(` ${date}. `)]), italic(clean(source.container)), plain(volume ? ", " : ""), italic(volume), plain(issue ? `(${issue})` : ""), plain(pages ? `, ${pages}` : ""), plain("."), plain(where ? ` ${where}` : "")];
  }
  return [...head, ...(authors.length ? [italic(title), plain(". ")] : [italic(title), plain(`. ${date}. `)]), plain(source.container ? withEnd(clean(source.container)) : ""), plain(where ? ` ${where}` : "")];
}

function mla(source, authors) {
  const month = monthIndex(source.month);
  const day = clean(source.day, 2);
  const year = clean(source.year, 4);
  const names = mlaAuthors(authors);
  const title = clean(source.title);
  const where = link(source).replace(/^https?:\/\//, "");
  const head = names ? [plain(withEnd(names)), plain(" ")] : [];
  if (source.type === "book") {
    const edition = clean(source.edition, 30);
    return [...head, italic(title), plain(". "), plain([edition ? `${edition} ed.` : "", clean(source.publisher), year].filter(Boolean).join(", ")), plain("."), plain(where ? ` ${where}.` : "")];
  }
  if (source.type === "article") {
    const parts = [clean(source.volume) ? `vol. ${clean(source.volume, 10)}` : "", clean(source.issue) ? `no. ${clean(source.issue, 10)}` : "", year, clean(source.pages) ? `pp. ${clean(source.pages, 20).replace(/-/g, "–")}` : ""].filter(Boolean);
    return [...head, plain(`“${withEnd(title)}” `), italic(clean(source.container)), plain(parts.length ? `, ${parts.join(", ")}` : ""), plain("."), plain(where ? ` ${where}.` : "")];
  }
  const date = [day, month >= 0 ? SHORT_MONTHS[month] : "", year].filter(Boolean).join(" ");
  const accessed = clean(source.accessed, 30);
  return [...head, plain(`“${withEnd(title)}” `), italic(clean(source.container)), plain(date ? `, ${date}` : ""), plain(where ? `, ${where}` : ""), plain("."), plain(accessed ? ` Accessed ${accessed}.` : "")];
}

function chicago(source, authors) {
  const month = monthIndex(source.month);
  const day = clean(source.day, 2);
  const year = clean(source.year, 4);
  const names = chicagoAuthors(authors);
  const title = clean(source.title);
  const where = link(source);
  const head = names ? [plain(withEnd(names)), plain(" ")] : [];
  if (source.type === "book") {
    const edition = clean(source.edition, 30);
    return [...head, italic(title), plain(". "), plain(edition ? `${edition} ed. ` : ""), plain([clean(source.publisher), year].filter(Boolean).join(", ")), plain("."), plain(where ? ` ${where}.` : "")];
  }
  if (source.type === "article") {
    const volume = clean(source.volume, 10);
    const issue = clean(source.issue, 10);
    const pages = clean(source.pages, 20).replace(/-/g, "–");
    return [...head, plain(`“${withEnd(title)}” `), italic(clean(source.container)), plain(volume ? ` ${volume}` : ""), plain(issue ? `, no. ${issue}` : ""), plain(year ? ` (${year})` : ""), plain(pages ? `: ${pages}` : ""), plain("."), plain(where ? ` ${where}.` : "")];
  }
  const date = [month >= 0 ? MONTHS[month] : "", day, year].filter(Boolean).join(" ").replace(/^(\w+) (\d{1,2}) (\d{4})$/, "$1 $2, $3");
  return [...head, plain(`“${withEnd(title)}” `), plain(source.container ? withEnd(clean(source.container)) : ""), plain(date ? ` ${withEnd(date)}` : ""), plain(where ? ` ${where}.` : "")];
}

export function formatCitation(style, input) {
  const source = { ...input, type: ["book", "article"].includes(input.type) ? input.type : "website" };
  const authors = parseAuthors(source.authors);
  if (!clean(source.title)) return { error: "Add the title." };
  if (!["apa", "mla", "chicago"].includes(style)) return { error: "Choose APA, MLA or Chicago." };
  if (source.type === "article" && !clean(source.container)) return { error: "Add the journal name." };
  const pieces = { apa, mla, chicago }[style](source, authors);
  return render(pieces);
}

// What goes in the sentence: (Lovelace, 1843), (Lovelace 12) or (Lovelace 1843).
export function inTextCitation(style, input) {
  const authors = parseAuthors(input.authors);
  const year = clean(input.year, 4) || "n.d.";
  const names = authors.map(author => author.last);
  const label = !names.length ? `“${clean(input.title, 40)}”` : names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} ${style === "apa" ? "&" : "and"} ${names[1]}` : `${names[0]} et al.`;
  if (style === "apa") return `(${label}, ${year})`;
  if (style === "mla") return `(${label}${clean(input.page, 12) ? ` ${clean(input.page, 12)}` : ""})`;
  return `(${label} ${year})`;
}
