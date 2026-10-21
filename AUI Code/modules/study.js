// Study tools that need no model: flashcards with spaced repetition, a notebook for mistakes,
// a study streak with badges, a weekly recap, and an exam planner. Everything here is plain data
// in and out, so it can be tested without a browser.

const DAY = 86400000;
const TEN_MINUTES = 10 * 60 * 1000;
export const MAX_CARDS = 1500;
export const MAX_MISTAKES = 300;

const clean = (value, max) => String(value ?? "").replace(/\s+/g, " ").replace(/\*\*|__/g, "").trim().slice(0, max);
const makeId = prefix => `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;

// --- Flashcards ---

const FIELD_PAIRS = [["front", "back"], ["question", "answer"], ["q", "a"], ["term", "definition"], ["prompt", "answer"]];

function fromJson(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end <= start) return [];
  let data;
  try { data = JSON.parse(text.slice(start, end + 1)); } catch { return []; }
  if (!Array.isArray(data)) return [];
  return data.map(item => {
    if (Array.isArray(item) && item.length >= 2) return { front: item[0], back: item[1] };
    if (!item || typeof item !== "object") return null;
    const lower = Object.fromEntries(Object.entries(item).map(([key, value]) => [key.toLowerCase(), value]));
    for (const [front, back] of FIELD_PAIRS) if (lower[front] != null && lower[back] != null) return { front: lower[front], back: lower[back] };
    return null;
  }).filter(Boolean);
}

// Cards from a model's reply. Understands JSON, "Q: ... A: ..." pairs, "term :: meaning",
// "term | meaning" (including table rows) and list lines like "1. term: meaning".
export function parseCards(text, limit = 60) {
  const source = String(text ?? "");
  let pairs = fromJson(source);
  if (!pairs.length) {
    const lines = source.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    let question = null;
    for (const line of lines) {
      const q = line.match(/^(?:[-*]\s*|\d+[.)]\s*)?\**(?:Q|Question|Front)\**\s*[:.)]\**\s*(.+)$/i);
      const a = line.match(/^(?:[-*]\s*)?\**(?:A|Answer|Back)\**\s*[:.)]\**\s*(.+)$/i);
      if (q) { question = q[1]; continue; }
      if (a && question) { pairs.push({ front: question, back: a[1] }); question = null; continue; }
      question = null;
      if (/^\|?[\s:|-]+\|?$/.test(line)) continue; // table separator
      let match = null;
      if (line.startsWith("|")) {
        const cells = line.split("|").map(cell => cell.trim()).filter(Boolean);
        if (cells.length >= 2) match = [line, cells[0], cells[1]];
      } else {
        match = line.match(/^(?:[-*]\s*|\d+[.)]\s*)?(.{1,160}?)\s*(?:::|\s\|\s|\s[\u2013\u2014-]\s)\s*(.{2,600})$/);
        if (!match && /^(?:[-*]|\d+[.)])\s/.test(line)) match = line.match(/^(?:[-*]|\d+[.)])\s*\**([^:*|]{1,120})\**\s*:\s+(.{2,600})$/);
      }
      if (match) pairs.push({ front: match[1], back: match[2] });
    }
  }
  const seen = new Set();
  const cards = [];
  for (const pair of pairs) {
    const front = clean(pair.front, 240);
    const back = clean(pair.back, 700);
    if (front.length < 2 || back.length < 1) continue;
    const key = front.toLowerCase();
    if (seen.has(key) || /^(term|question|front|word|name|concept)$/i.test(front)) continue;
    seen.add(key);
    cards.push({ front, back });
    if (cards.length >= limit) break;
  }
  return cards;
}

export function newCard(front, back, deck = "General", now = Date.now()) {
  return { id: makeId("card"), front: clean(front, 240), back: clean(back, 700), deck: clean(deck, 40) || "General", ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, created: now };
}

// Grade: 0 again, 1 hard, 2 good, 3 easy. Returns a new card; "again" comes back in ten minutes.
export function reviewCard(card, grade, now = Date.now()) {
  const next = { ...card };
  const reps = card.reps || 0;
  const interval = card.interval || 0;
  const ease = card.ease || 2.5;
  if (grade <= 0) {
    next.reps = 0;
    next.lapses = (card.lapses || 0) + 1;
    next.interval = 0;
    next.ease = Math.max(1.3, ease - 0.2);
    next.due = now + TEN_MINUTES;
    return next;
  }
  if (grade === 1) {
    next.interval = Math.max(1, Math.round(interval * 1.2));
    next.ease = Math.max(1.3, ease - 0.15);
  } else if (grade === 2) {
    next.interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(interval * ease);
  } else {
    next.interval = reps === 0 ? 3 : Math.max(4, Math.round(interval * ease * 1.3));
    next.ease = ease + 0.15;
  }
  next.reps = reps + 1;
  next.due = now + next.interval * DAY;
  return next;
}

export const isDue = (card, now = Date.now()) => card.due <= now;
export const dueCards = (cards, deck = "", now = Date.now()) =>
  cards.filter(card => isDue(card, now) && (!deck || card.deck === deck)).sort((a, b) => a.due - b.due);

export function deckSummary(cards, now = Date.now()) {
  const decks = new Map();
  for (const card of cards) {
    const entry = decks.get(card.deck) || { name: card.deck, total: 0, due: 0, fresh: 0 };
    entry.total += 1;
    if (isDue(card, now)) entry.due += 1;
    if (card.reps === 0 && !card.lapses) entry.fresh += 1;
    decks.set(card.deck, entry);
  }
  return [...decks.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// "Next time in 3 days" for the buttons on a card.
export function intervalLabel(card, grade, now = Date.now()) {
  const next = reviewCard(card, grade, now);
  if (next.interval === 0) return "10 min";
  return next.interval === 1 ? "1 day" : `${next.interval} days`;
}

// --- Mistake notebook ---

export function newMistake({ question, answer = "", note = "", topic = "" }, now = Date.now()) {
  return { id: makeId("mistake"), question: String(question ?? "").trim().slice(0, 1200), answer: String(answer ?? "").trim().slice(0, 3000), note: clean(note, 400), topic: clean(topic, 40), created: now, fixed: false };
}

// --- Streak, badges ---

const pad = number => String(number).padStart(2, "0");
export const dayKey = (time = Date.now()) => {
  const date = new Date(time);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const shiftDay = (key, offset) => {
  const [year, month, day] = key.split("-").map(Number);
  return dayKey(new Date(year, month - 1, day + offset, 12).getTime());
};

export function recordDay(days, now = Date.now()) {
  const today = dayKey(now);
  if (days.includes(today)) return days;
  return [...days, today].slice(-800);
}

// One missed day does not break a streak; two in a row do. A rest day is allowed about once a week.
export function streakInfo(days, now = Date.now()) {
  const active = new Set(days);
  const today = dayKey(now);
  const walk = from => {
    let cursor = from;
    let count = 0;
    let rests = 0;
    let walked = 0;
    while (walked < 800) {
      if (active.has(cursor)) count += 1;
      else if (active.has(shiftDay(cursor, -1)) && rests < 1 + Math.floor(walked / 7)) rests += 1;
      else break;
      cursor = shiftDay(cursor, -1);
      walked += 1;
    }
    return count;
  };
  const activeToday = active.has(today);
  const current = activeToday ? walk(today) : walk(shiftDay(today, -1));
  let longest = 0;
  for (const day of [...active].slice(-400)) longest = Math.max(longest, walk(day));
  return { current, longest, activeToday };
}

export const BADGES = [
  { id: "first-card", name: "First deck", text: "Made your first flashcards.", test: s => s.cardsMade >= 1 },
  { id: "first-review", name: "First review", text: "Reviewed a flashcard.", test: s => s.reviews >= 1 },
  { id: "reviews-100", name: "100 reviews", text: "Reviewed 100 flashcards.", test: s => s.reviews >= 100 },
  { id: "streak-3", name: "Three days", text: "Studied 3 days in a row.", test: s => s.longest >= 3 },
  { id: "streak-7", name: "A full week", text: "Studied 7 days in a row.", test: s => s.longest >= 7 },
  { id: "streak-30", name: "A month", text: "Studied 30 days in a row.", test: s => s.longest >= 30 },
  { id: "mistakes-5", name: "Learning from slips", text: "Saved 5 mistakes to learn from.", test: s => s.mistakes >= 5 },
  { id: "planner", name: "Planner", text: "Built a study plan.", test: s => s.plans >= 1 }
];

export const earnedBadges = stats => BADGES.filter(badge => badge.test(stats));

// --- Weekly recap ---

export function weeklyRecap({ chats = [], study = {}, now = Date.now() }) {
  const since = now - 7 * DAY;
  const perDay = {};
  const topics = new Map();
  let messages = 0;
  const touched = new Set();
  for (const chat of chats) {
    if (chat.temporary) continue;
    let own = 0;
    for (const message of chat.messages || []) {
      if (message.role !== "user" || !(message.timestamp >= since) || message.timestamp > now) continue;
      own += 1;
      messages += 1;
      const key = dayKey(message.timestamp);
      perDay[key] = (perDay[key] || 0) + 1;
    }
    if (own) {
      touched.add(chat.id);
      const topic = chat.folder || chat.title || "Untitled";
      topics.set(topic, (topics.get(topic) || 0) + own);
    }
  }
  const reviewedThisWeek = (study.reviewLog || []).filter(([day]) => day >= dayKey(since)).reduce((sum, [, count]) => sum + count, 0);
  const mistakesThisWeek = (study.mistakes || []).filter(item => item.created >= since).length;
  const stuck = (study.cards || []).filter(card => card.lapses >= 2).sort((a, b) => b.lapses - a.lapses).slice(0, 5).map(card => card.front);
  const streak = streakInfo(study.days || [], now);
  return {
    messages,
    chats: touched.size,
    activeDays: Object.keys(perDay).length,
    topics: [...topics.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
    cardsReviewed: reviewedThisWeek,
    cardsDue: dueCards(study.cards || [], "", now).length,
    mistakesSaved: mistakesThisWeek,
    mistakesOpen: (study.mistakes || []).filter(item => !item.fixed).length,
    stuck,
    streak: streak.current
  };
}

export function recapText(recap, name = "") {
  const lines = [`${name ? `${name}'s` : "My"} study week`];
  lines.push(`Questions asked: ${recap.messages} in ${recap.chats} ${recap.chats === 1 ? "chat" : "chats"}, on ${recap.activeDays} ${recap.activeDays === 1 ? "day" : "days"}.`);
  if (recap.topics.length) lines.push(`Main topics: ${recap.topics.map(topic => topic.name).join(", ")}.`);
  lines.push(`Flashcards reviewed: ${recap.cardsReviewed}. Due now: ${recap.cardsDue}.`);
  lines.push(`Mistakes saved this week: ${recap.mistakesSaved}. Still to work on: ${recap.mistakesOpen}.`);
  if (recap.stuck.length) lines.push(`Cards that keep coming back: ${recap.stuck.join("; ")}.`);
  lines.push(`Study streak: ${recap.streak} ${recap.streak === 1 ? "day" : "days"}.`);
  return lines.join("\n");
}

// --- Exam planner ---

export const MAX_EXAMS = 6;
export const MAX_TOPICS = 30;
const parseDay = key => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || "");
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  return dayKey(date.getTime()) === key ? date : null;
};
const daysBetween = (from, to) => Math.round((parseDay(to) - parseDay(from)) / DAY);

// A day-by-day plan: each topic is learned once, revisited the next day, three days later and a week
// later, and the last days before an exam are for practice and a light review.
export function buildPlan({ exams = [], minutesPerDay = 60, today = dayKey() }) {
  const problems = [];
  const valid = [];
  for (const exam of exams.slice(0, MAX_EXAMS)) {
    const name = clean(exam.name, 60);
    const topics = [...new Set((Array.isArray(exam.topics) ? exam.topics : String(exam.topics || "").split(/[,\n;]/)).map(topic => clean(topic, 60)).filter(Boolean))].slice(0, MAX_TOPICS);
    if (!name) { problems.push("Every exam needs a name."); continue; }
    if (!parseDay(exam.date)) { problems.push(`${name}: pick the exam date.`); continue; }
    const left = daysBetween(today, exam.date);
    if (left < 1) { problems.push(`${name}: the exam date has to be after today.`); continue; }
    if (left > 120) { problems.push(`${name}: plans cover up to 120 days. Come back closer to the date.`); continue; }
    if (!topics.length) { problems.push(`${name}: list at least one topic.`); continue; }
    valid.push({ name, date: exam.date, topics, left });
  }
  const days = new Map();
  const add = (index, task) => {
    const key = shiftDay(today, index);
    const day = days.get(key) || { date: key, tasks: [] };
    day.tasks.push(task);
    days.set(key, day);
  };
  for (const exam of valid) {
    const studyDays = Math.max(1, exam.left - (exam.left >= 4 ? 2 : 0));
    const learnDays = Math.max(1, Math.ceil(studyDays * 0.7));
    exam.topics.forEach((topic, i) => {
      const at = Math.min(learnDays - 1, Math.floor((i * learnDays) / exam.topics.length));
      add(at, { exam: exam.name, kind: "learn", topic });
      for (const gap of [1, 3, 7]) if (at + gap < exam.left - 1) add(at + gap, { exam: exam.name, kind: "review", topic });
    });
    if (exam.left >= 4) {
      add(exam.left - 2, { exam: exam.name, kind: "practice", topic: "Practice questions on every topic" });
      add(exam.left - 1, { exam: exam.name, kind: "review", topic: "Light review of your notes, then rest" });
    }
    add(exam.left, { exam: exam.name, kind: "exam", topic: exam.name });
  }
  const plan = [...days.values()].sort((a, b) => a.date.localeCompare(b.date)).map(day => {
    const work = day.tasks.filter(task => task.kind !== "exam");
    return { ...day, minutes: work.length ? Math.max(10, Math.round(Math.min(Math.max(10, minutesPerDay), 600) / work.length)) : 0 };
  });
  return { plan, problems };
}

const icsEscape = text => String(text).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const icsDate = key => key.replace(/-/g, "");

// A calendar file with one all-day event per planned day.
export function planToIcs(plan, stamp = new Date()) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AUI//Study plan//EN", "CALSCALE:GREGORIAN"];
  const stampText = `${stamp.getUTCFullYear()}${pad(stamp.getUTCMonth() + 1)}${pad(stamp.getUTCDate())}T${pad(stamp.getUTCHours())}${pad(stamp.getUTCMinutes())}${pad(stamp.getUTCSeconds())}Z`;
  plan.forEach((day, index) => {
    const exam = day.tasks.find(task => task.kind === "exam");
    const summary = exam ? `Exam: ${exam.topic}` : `Study: ${[...new Set(day.tasks.map(task => task.topic))].slice(0, 3).join(", ")}`;
    const description = day.tasks.map(task => `${{ learn: "Learn", review: "Review", practice: "Practice", exam: "Exam" }[task.kind]} (${task.exam}): ${task.topic}`).join("\n");
    lines.push("BEGIN:VEVENT", `UID:aui-plan-${icsDate(day.date)}-${index}@aui`, `DTSTAMP:${stampText}`, `DTSTART;VALUE=DATE:${icsDate(day.date)}`, `DTEND;VALUE=DATE:${icsDate(shiftDay(day.date, 1))}`, `SUMMARY:${icsEscape(summary)}`, `DESCRIPTION:${icsEscape(description)}`, "END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

// The saved study data, made safe to use even if it came from an old backup or a hand-edited file.
export function normalizeStudy(value) {
  const study = value && typeof value === "object" ? value : {};
  const text = (item, max) => String(item ?? "").slice(0, max);
  const number = (item, fallback = 0) => (Number.isFinite(Number(item)) ? Number(item) : fallback);
  return {
    cards: (Array.isArray(study.cards) ? study.cards : []).filter(card => card && card.front && card.back).slice(0, MAX_CARDS).map(card => ({
      id: text(card.id, 40) || `card-${Math.random().toString(36).slice(2, 10)}`, front: text(card.front, 240), back: text(card.back, 700), deck: text(card.deck, 40) || "General",
      ease: Math.min(Math.max(number(card.ease, 2.5), 1.3), 4), interval: Math.max(0, Math.round(number(card.interval))), reps: Math.max(0, Math.round(number(card.reps))),
      lapses: Math.max(0, Math.round(number(card.lapses))), due: number(card.due, Date.now()), created: number(card.created, Date.now())
    })),
    mistakes: (Array.isArray(study.mistakes) ? study.mistakes : []).filter(item => item && item.question).slice(0, MAX_MISTAKES).map(item => ({
      id: text(item.id, 40) || `mistake-${Math.random().toString(36).slice(2, 10)}`, question: text(item.question, 1200), answer: text(item.answer, 3000), note: text(item.note, 400), topic: text(item.topic, 40), created: number(item.created, Date.now()), fixed: Boolean(item.fixed)
    })),
    days: (Array.isArray(study.days) ? study.days : []).filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day)).slice(-800),
    reviewLog: (Array.isArray(study.reviewLog) ? study.reviewLog : []).filter(row => Array.isArray(row) && /^\d{4}-\d{2}-\d{2}$/.test(row[0])).map(row => [row[0], Math.max(0, Math.round(number(row[1])))]).slice(-120),
    exams: (Array.isArray(study.exams) ? study.exams : []).slice(0, 6).map(exam => ({ name: text(exam?.name, 60), date: text(exam?.date, 10), topics: text(Array.isArray(exam?.topics) ? exam.topics.join(", ") : exam?.topics, 600) })),
    minutes: Math.min(Math.max(number(study.minutes, 60), 10), 600),
    classes: Object.fromEntries(Object.entries(study.classes && typeof study.classes === "object" ? study.classes : {}).slice(0, 40).map(([name, entry]) => [text(name, 40), { notes: text(entry?.notes, 600), goal: text(entry?.goal, 100) }])),
    sources: (Array.isArray(study.sources) ? study.sources : []).slice(0, 100).map(source => ({ text: text(source?.text, 800), html: text(source?.html, 1200) })).filter(source => source.text),
    counts: { reviews: Math.max(0, Math.round(number(study.counts?.reviews))), cardsMade: Math.max(0, Math.round(number(study.counts?.cardsMade))), mistakes: Math.max(0, Math.round(number(study.counts?.mistakes))), plans: Math.max(0, Math.round(number(study.counts?.plans))) }
  };
}

// Combine a backup's study data with what is already here: nothing is lost, nothing is doubled.
export function mergeStudy(current, incoming) {
  const a = normalizeStudy(current);
  const b = normalizeStudy(incoming);
  const byId = (list, extra) => {
    const seen = new Set(list.map(item => item.id));
    return [...list, ...extra.filter(item => !seen.has(item.id))];
  };
  const reviewLog = new Map(a.reviewLog);
  for (const [day, count] of b.reviewLog) reviewLog.set(day, Math.max(reviewLog.get(day) || 0, count));
  return {
    ...a,
    cards: byId(a.cards, b.cards).slice(0, MAX_CARDS),
    mistakes: byId(a.mistakes, b.mistakes).slice(0, MAX_MISTAKES),
    days: [...new Set([...a.days, ...b.days])].sort().slice(-800),
    reviewLog: [...reviewLog.entries()].sort((x, y) => x[0].localeCompare(y[0])).slice(-120),
    exams: a.exams.some(exam => exam.name) ? a.exams : b.exams,
    classes: { ...b.classes, ...a.classes },
    sources: [...a.sources, ...b.sources.filter(source => !a.sources.some(own => own.text === source.text))].slice(0, 100),
    counts: Object.fromEntries(Object.keys(a.counts).map(key => [key, Math.max(a.counts[key], b.counts[key])]))
  };
}
