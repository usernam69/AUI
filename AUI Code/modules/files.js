// File and image helpers that run in the browser. Heavy libraries load only when first used
// and are cached by the service worker afterwards; nothing is uploaded anywhere.

const PDFJS_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
const TESSERACT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.esm.min.js";
const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1/dist/transformers.min.js";
const JSZIP_URL = "https://esm.sh/jszip@3.10.1";
const HEIC_URL = "https://esm.sh/heic2any@0.0.4";

export const FILE_LIMITS = { file: "18 MB", audio: "25 MB", video: "200 MB", files: 10 };

// 651: text from a PDF, page by page.
export async function extractPdfText(file, onProgress = () => {}) {
  const pdfjs = await import(PDFJS_URL);
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = [];
  const count = Math.min(pdf.numPages, 300);
  for (let number = 1; number <= count; number += 1) {
    const page = await pdf.getPage(number);
    const content = await page.getTextContent();
    const text = content.items.map(item => `${item.str}${item.hasEOL ? "\n" : " "}`).join("").replace(/[ \t]+\n/g, "\n").trim();
    if (text) pages.push(`[Page ${number}]\n${text}`);
    onProgress(Math.round((number / count) * 100));
  }
  return { text: pages.join("\n\n"), pages: pdf.numPages };
}

// 662/663/698/699: read the text in an image.
let ocrWorker = null;
export async function ocrImage(source, onProgress = () => {}) {
  if (!ocrWorker) {
    const tesseract = await import(TESSERACT_URL);
    const createWorker = tesseract.createWorker || tesseract.default?.createWorker;
    ocrWorker = createWorker("eng", 1, {
      logger: message => {
        if (message.status === "recognizing text") onProgress(Math.round(message.progress * 100));
      }
    });
  }
  const worker = await ocrWorker;
  const { data } = await worker.recognize(source);
  return data.text.trim();
}

// 661/667/673/674: small models through transformers.js, on the CPU so they don't fight the chat model for GPU memory.
let transformersModule = null;
const pipelines = new Map();
async function getPipeline(task, model, onProgress) {
  const key = `${task}|${model}`;
  if (!pipelines.has(key)) {
    transformersModule ||= import(TRANSFORMERS_URL);
    pipelines.set(key, transformersModule.then(({ pipeline }) => pipeline(task, model, {
      progress_callback: report => {
        if (report.status === "progress" && Number.isFinite(report.progress)) onProgress(Math.round(report.progress));
      }
    })).catch(error => {
      pipelines.delete(key);
      throw error;
    }));
  }
  return pipelines.get(key);
}

export async function captionImage(url, onProgress = () => {}) {
  const captioner = await getPipeline("image-to-text", "Xenova/vit-gpt2-image-captioning", onProgress);
  const [result] = await captioner(url, { max_new_tokens: 30 });
  return String(result?.generated_text || "").trim();
}

// RawImage.toCanvas() gives an OffscreenCanvas in some builds and a normal canvas in others.
async function canvasToDataUrl(canvas) {
  if (canvas.toDataURL) return canvas.toDataURL("image/png");
  const blob = await canvas.convertToBlob({ type: "image/png" });
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export async function removeBackground(url, onProgress = () => {}) {
  const remover = await getPipeline("background-removal", "Xenova/modnet", onProgress);
  const [image] = await remover(url);
  return canvasToDataUrl(image.toCanvas());
}

// The upscaler needs a lot of memory, so it works on small pictures (the ones that need it most).
export const MAX_UPSCALE_SIDE = 320;
export async function upscaleImage(url, onProgress = () => {}) {
  const probe = new Image();
  probe.src = url;
  await probe.decode();
  if (Math.max(probe.naturalWidth, probe.naturalHeight) > MAX_UPSCALE_SIDE) {
    throw new Error(`This picture is already ${probe.naturalWidth}×${probe.naturalHeight}. Upscaling works on pictures up to ${MAX_UPSCALE_SIDE} pixels wide.`);
  }
  const upscaler = await getPipeline("image-to-image", "Xenova/swin2SR-classical-sr-x2-64", onProgress);
  const image = await upscaler(url);
  return canvasToDataUrl(image.toCanvas());
}

export async function transcribeAudio(file, onProgress = () => {}) {
  const context = new AudioContext({ sampleRate: 16000 });
  const decoded = await context.decodeAudioData(await file.arrayBuffer());
  context.close().catch(() => {});
  const samples = decoded.numberOfChannels > 1
    ? decoded.getChannelData(0).map((value, index) => (value + decoded.getChannelData(1)[index]) / 2)
    : decoded.getChannelData(0);
  const transcriber = await getPipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en", onProgress);
  const result = await transcriber(samples, { chunk_length_s: 30, stride_length_s: 5 });
  return { text: String(result?.text || "").trim(), seconds: Math.round(decoded.duration) };
}

// 668: a few evenly spaced frames from a video, as JPEG files.
export async function extractVideoFrames(file, count = 4) {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  video.src = url;
  try {
    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve;
      video.onerror = () => reject(new Error(`${file.name} can't be played in this browser.`));
    });
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1024 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const frames = [];
    for (let index = 0; index < count; index += 1) {
      const time = (video.duration * (index + 0.5)) / count;
      await new Promise(resolve => {
        video.onseeked = resolve;
        video.currentTime = time;
      });
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.85));
      frames.push(new File([blob], `${file.name.replace(/\.[^.]+$/, "")} at ${Math.round(time)}s.jpg`, { type: "image/jpeg" }));
    }
    return { frames, seconds: Math.round(video.duration) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// 666: iPhone photos (HEIC) become JPEG.
export async function convertHeic(file) {
  const { default: heic2any } = await import(HEIC_URL);
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(result) ? result[0] : result;
  return new File([blob], file.name.replace(/\.hei[cf]$/i, ".jpg"), { type: "image/jpeg" });
}

// 687: the files inside a zip, ready to attach like a folder.
export async function readZip(file) {
  const { default: JSZip } = await import(JSZIP_URL);
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const root = file.name.replace(/\.zip$/i, "");
  const files = [];
  for (const entry of Object.values(zip.files)) {
    if (entry.dir || files.length >= 500) continue;
    const blob = await entry.async("blob");
    const name = entry.name.split("/").pop();
    const inner = new File([blob], name, { type: "" });
    Object.defineProperty(inner, "auiRelativePath", { value: `${root}/${entry.name}` });
    files.push(inner);
  }
  return files;
}

// 686: a Jupyter notebook as readable cells.
export function notebookToText(source) {
  const notebook = JSON.parse(source);
  const join = value => (Array.isArray(value) ? value.join("") : String(value || ""));
  return (notebook.cells || []).map((cell, index) => {
    const body = join(cell.source).trim();
    const outputs = (cell.outputs || []).map(output => join(output.text || output.data?.["text/plain"])).filter(Boolean).join("\n").trim();
    return `[Cell ${index + 1}, ${cell.cell_type}]\n${body}${outputs ? `\n[Output]\n${outputs.slice(0, 2000)}` : ""}`;
  }).join("\n\n");
}

// 653/683: parse CSV (quotes and all) into rows.
export function parseCsv(text, limit = 5000) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const source = String(text).replace(/^﻿/, "");
  const delimiter = (source.split("\n")[0].match(/;/g) || []).length > (source.split("\n")[0].match(/,/g) || []).length ? ";" : ",";
  for (let index = 0; index < source.length && rows.length < limit; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === delimiter) {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some(cell => cell !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (field || row.length) {
    row.push(field);
    if (row.some(cell => cell !== "")) rows.push(row);
  }
  return rows;
}

// 653: column-by-column facts the small model can't work out by reading thousands of rows.
export function summarizeTable(rows) {
  if (rows.length < 2) return "";
  const [header, ...body] = rows;
  const lines = [`${body.length} rows, ${header.length} columns.`];
  header.forEach((name, column) => {
    const values = body.map(row => (row[column] ?? "").trim()).filter(Boolean);
    const numbers = values.map(value => Number(value.replace(/[$€£,%\s]/g, ""))).filter(Number.isFinite);
    if (numbers.length >= values.length * 0.8 && numbers.length) {
      const sum = numbers.reduce((total, value) => total + value, 0);
      lines.push(`- ${name}: numbers, min ${Math.min(...numbers)}, max ${Math.max(...numbers)}, average ${Number((sum / numbers.length).toPrecision(6))}, total ${Number(sum.toPrecision(10))}`);
    } else {
      const counts = new Map();
      values.forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([value, count]) => `${value} (${count})`).join(", ");
      lines.push(`- ${name}: text, ${counts.size} different values${top ? `; most common: ${top}` : ""}`);
    }
  });
  return lines.join("\n");
}

// 681: line-by-line differences between two texts.
export function lineDiff(before, after, limit = 2000) {
  const a = String(before).split(/\r?\n/).slice(0, limit);
  const b = String(after).split(/\r?\n/).slice(0, limit);
  const table = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      out.push({ type: "same", text: a[i] });
      i += 1;
      j += 1;
    } else if (j < b.length && (i >= a.length || table[i][j + 1] >= table[i + 1][j])) {
      out.push({ type: "added", text: b[j] });
      j += 1;
    } else {
      out.push({ type: "removed", text: a[i] });
      i += 1;
    }
  }
  return out;
}

// 700: money amounts on receipt lines.
export function parseReceipt(text) {
  const items = [];
  let total = null;
  String(text).split(/\r?\n/).forEach(line => {
    const match = /^(.*?)[\s.:$€£]*(-?\d{1,5}(?:[.,]\d{2}))\s*$/.exec(line.trim());
    if (!match) return;
    const label = match[1].replace(/[\s.:$€£]+$/, "").trim() || "Item";
    const amount = Number(match[2].replace(",", "."));
    if (/\b(sub ?total|tax|vat|tip|change|cash|card|visa|balance)\b/i.test(label)) return;
    if (/\btotal\b/i.test(label)) total = amount;
    else items.push({ label, amount });
  });
  const sum = Math.round(items.reduce((value, item) => value + item.amount, 0) * 100) / 100;
  return { items, total: total ?? sum };
}
