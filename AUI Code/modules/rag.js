// Tiny local retrieval: split long text into chunks and keep the passages most
// relevant to the question (BM25 keyword scoring). Everything runs on-device.

const STOP_WORDS = new Set((
  "a an and are as at be but by for from has have he her his i if in into is it its me my of on or our she so that the their " +
  "them then there these they this to us was we were what when where which who why will with you your about can could do does " +
  "did how not no yes please tell give show"
).split(" "));

export function tokenize(text) {
  return (String(text).toLowerCase().match(/[\p{L}\p{N}]+/gu) || [])
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

export function chunkText(text, size = 600) {
  const chunks = [];
  let current = "";
  const pieces = String(text).split(/\n{2,}|(?<=[.!?])\s+/);
  for (const piece of pieces) {
    if (!piece.trim()) continue;
    if (piece.length > size) {
      if (current) { chunks.push(current); current = ""; }
      for (let start = 0; start < piece.length; start += size) chunks.push(piece.slice(start, start + size));
      continue;
    }
    if (current && current.length + piece.length + 1 > size) {
      chunks.push(current);
      current = "";
    }
    current = current ? `${current} ${piece}` : piece;
  }
  if (current) chunks.push(current);
  return chunks;
}

function scoreChunks(chunks, query) {
  const queryTerms = [...new Set(tokenize(query))];
  const docs = chunks.map(chunk => tokenize(chunk));
  const averageLength = docs.reduce((total, doc) => total + doc.length, 0) / Math.max(1, docs.length) || 1;
  const documentFrequency = new Map();
  for (const term of queryTerms) {
    documentFrequency.set(term, docs.filter(doc => doc.includes(term)).length);
  }
  const k1 = 1.5;
  const b = 0.75;
  return docs.map(doc => {
    let score = 0;
    for (const term of queryTerms) {
      const frequency = doc.filter(word => word === term).length;
      if (!frequency) continue;
      const df = documentFrequency.get(term);
      const idf = Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));
      score += idf * (frequency * (k1 + 1)) / (frequency + k1 * (1 - b + b * doc.length / averageLength));
    }
    return score;
  });
}

// Returns the text itself when it fits; otherwise the best-matching passages in
// their original order, joined with "…" and trimmed to the budget.
export function pickRelevantText(text, query, budget) {
  const source = String(text);
  if (source.length <= budget) return source;

  const chunks = chunkText(source);
  const scores = scoreChunks(chunks, query);
  const order = chunks.map((_, index) => index);
  const anyMatch = scores.some(score => score > 0);
  if (anyMatch) order.sort((a, b) => scores[b] - scores[a] || a - b);

  const chosen = [];
  let used = 0;
  for (const index of order) {
    const cost = chunks[index].length + 3;
    if (used + cost > budget) continue;
    chosen.push(index);
    used += cost;
    if (!anyMatch && used >= budget) break;
  }
  if (!chosen.length) return source.slice(0, budget);
  return chosen.sort((a, b) => a - b).map(index => chunks[index]).join("\n…\n");
}
