// The Study hub and the citation tool: screens for the logic in study.js, citation.js and share.js.
// app.js hands in what these screens need (see `api`); nothing here reaches into app.js itself.

import {
  parseCards, newCard, reviewCard, dueCards, deckSummary, intervalLabel, newMistake, recordDay, streakInfo, dayKey,
  earnedBadges, BADGES, weeklyRecap, recapText, buildPlan, planToIcs, normalizeStudy, MAX_CARDS, MAX_MISTAKES
} from "./study.js";
import { formatCitation, inTextCitation, STYLES, TYPES } from "./citation.js";
import { encodeShare, decodeShare, shareUrl, shareFromHash, cleanDeck, cleanChat, cleanPlanInput } from "./share.js";

export { normalizeStudy, mergeStudy } from "./study.js";

const TABS = [["today", "Today"], ["cards", "Cards"], ["mistakes", "Mistakes"], ["plan", "Plan"], ["classes", "Classes"], ["progress", "Progress"]];

export function setupStudy(api) {
  const { byId, escapeHtml, simpleDialog, toast } = api;
  // The app can replace its state object (after unlocking or a reset), so always look it up.
  const state = new Proxy({}, { get: (_, key) => api.getState()[key], set: (_, key, value) => { api.getState()[key] = value; return true; } });
  const study = () => {
    if (!state.study || state.study.__ready !== true) {
      state.study = normalizeStudy(state.study);
      Object.defineProperty(state.study, "__ready", { value: true, enumerable: false, configurable: true });
    }
    return state.study;
  };
  const save = () => { api.persist(); };
  let tab = "today";
  let session = null; // the flashcards being reviewed right now

  // Called after anything the student does that counts as studying.
  function noteActivity() {
    const data = study();
    const days = recordDay(data.days);
    if (days !== data.days) { data.days = days; save(); }
  }

  const stats = () => {
    const data = study();
    const streak = streakInfo(data.days);
    return { ...data.counts, longest: streak.longest, streak: streak.current, activeToday: streak.activeToday };
  };

  // --- asking the model for cards ---

  async function askModelForCards(source, count = 10, signal) {
    let out = "";
    const messages = [
      { role: "system", content: "You write flashcards. Follow the format exactly." },
      { role: "user", content: `Make ${count} flashcards from the text below. Write each card on two lines, like this:\nQ: the question\nA: the short answer\nLeave a blank line between cards. One idea per card. Use only facts in the text. Write nothing else.\n\n${source.slice(0, 6000)}` }
    ];
    for await (const token of api.streamModel(messages, { signal, maxTokens: 1400, temperature: 0.3 })) out += token;
    return parseCards(out);
  }

  // A preview where the student can drop cards before they are saved.
  function reviewNewCards(cards, deckName) {
    const known = new Set(study().cards.map(card => `${card.deck}|${card.front.toLowerCase()}`));
    const dialog = simpleDialog("cardPreviewDialog", "Flashcards", `${cards.length} cards found`, `
      <form class="setupBody" id="cardPreviewForm">
        <label>Deck <input name="deck" maxlength="40" value="${escapeHtml(deckName)}" required></label>
        <p class="toolHint">Untick any card that is wrong. Small models make mistakes, so read them before you study them.</p>
        <ul class="cardPreviewList">${cards.map((card, index) => `<li><label><input type="checkbox" name="pick" value="${index}" checked><span><strong>${escapeHtml(card.front)}</strong><small>${escapeHtml(card.back)}</small></span></label></li>`).join("")}</ul>
        <div class="setupActions"><button type="button" class="secondaryBtn" data-close-dialog>Cancel</button><button type="submit" class="primaryBtn">Save cards</button></div>
      </form>`, { wide: true });
    const form = dialog.querySelector("#cardPreviewForm");
    form.addEventListener("submit", event => {
      event.preventDefault();
      const deck = form.deck.value.trim().slice(0, 40) || "General";
      const picked = [...form.querySelectorAll('input[name="pick"]:checked')].map(box => cards[Number(box.value)]);
      const fresh = picked.filter(card => !known.has(`${deck}|${card.front.toLowerCase()}`));
      const room = MAX_CARDS - study().cards.length;
      const added = fresh.slice(0, Math.max(room, 0)).map(card => newCard(card.front, card.back, deck));
      study().cards.push(...added);
      study().counts.cardsMade += added.length;
      noteActivity();
      save();
      dialog.close();
      toast(added.length ? `Saved ${added.length} ${added.length === 1 ? "card" : "cards"} to ${deck}.` : "Those cards were already in the deck.", added.length ? "success" : "info", added.length ? { label: "Study now", duration: 8000, onClick: () => openStudy("cards", { review: deck }) } : undefined);
      if (byId("studyDialog")?.open) render();
    });
  }

  let cardJob = null;
  async function makeCardsFrom(source, deckName) {
    if (cardJob) return toast("Already making cards. Wait for that to finish.", "info");
    const text = String(source || "").trim();
    if (text.length < 40) return toast("There is not enough text to make cards from yet.", "info");
    let cards = parseCards(text);
    if (cards.length < 3) {
      const controller = new AbortController();
      cardJob = controller;
      toast("Making flashcards…", "info", { label: "Cancel", duration: 60000, onClick: () => controller.abort() });
      try {
        cards = await askModelForCards(text, 10, controller.signal);
      } catch (error) {
        cardJob = null;
        return error?.name === "AbortError" ? toast("Cancelled.", "info") : toast(error.message || "Couldn't make cards.", "error");
      }
      cardJob = null;
    }
    if (!cards.length) return toast("The model's answer didn't contain cards I could read. Try again, or add cards by hand.", "error");
    reviewNewCards(cards, deckName);
  }

  function cardsFromMessage(message, chat) {
    const deck = (chat?.folder || chat?.title || "General").slice(0, 40);
    return makeCardsFrom(message.content, deck);
  }

  function cardsFromChat() {
    const chat = api.getChat();
    const text = (chat?.messages || []).filter(message => message.role === "assistant" && message.content && !message.excluded).slice(-6).map(message => message.content).join("\n\n");
    return makeCardsFrom(text, (chat?.folder || chat?.title || "General").slice(0, 40));
  }

  // --- mistakes ---

  function saveMistake(message, chat) {
    const index = chat.messages.findIndex(item => item.id === message.id);
    let user = index - 1;
    while (user >= 0 && chat.messages[user].role !== "user") user -= 1;
    const dialog = simpleDialog("mistakeDialog", "Mistake notebook", "Save this to learn from", `
      <form class="setupBody" id="mistakeForm">
        <label>What went wrong? <textarea name="note" rows="3" maxlength="400" placeholder="I forgot to flip the sign when I moved the term."></textarea></label>
        <label>Topic <input name="topic" maxlength="40" value="${escapeHtml((chat.folder || "").slice(0, 40))}" placeholder="Algebra"></label>
        <div class="setupActions"><button type="button" class="secondaryBtn" data-close-dialog>Cancel</button><button type="submit" class="primaryBtn">Save</button></div>
      </form>`);
    const form = dialog.querySelector("#mistakeForm");
    form.note.focus();
    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = study();
      if (data.mistakes.length >= MAX_MISTAKES) return toast(`The notebook holds ${MAX_MISTAKES}. Delete some fixed ones first.`, "error");
      data.mistakes.unshift(newMistake({ question: user >= 0 ? chat.messages[user].content : "", answer: message.content, note: form.note.value, topic: form.topic.value }));
      data.counts.mistakes += 1;
      noteActivity();
      save();
      dialog.close();
      toast("Saved to your mistake notebook.", "success", { label: "Open", duration: 6000, onClick: () => openStudy("mistakes") });
    });
  }

  // --- the hub ---

  function openStudy(which = tab, options = {}) {
    tab = TABS.some(([id]) => id === which) ? which : "today";
    session = options.review ? startSession(options.review) : null;
    const dialog = simpleDialog("studyDialog", "Study", "Your study space", `
      <div class="studyTabs" role="tablist" aria-label="Study sections">${TABS.map(([id, label]) => `<button type="button" role="tab" id="study-tab-${id}" aria-controls="studyBody" data-study-tab="${id}">${label}</button>`).join("")}</div>
      <div id="studyBody" class="studyBody" role="tabpanel" tabindex="0"></div>`, { wide: true });
    if (!dialog.dataset.studyReady) {
      dialog.dataset.studyReady = "1";
      dialog.addEventListener("click", onClick);
      dialog.addEventListener("submit", onSubmit);
      dialog.addEventListener("keydown", onKey);
      dialog.addEventListener("change", onChange);
    }
    render();
    return dialog;
  }

  function startSession(deck) {
    const queue = dueCards(study().cards, deck === "*" ? "" : deck).slice(0, 40).map(card => card.id);
    return { deck, queue, total: queue.length, shown: false, done: 0, again: 0 };
  }

  const body = () => byId("studyBody");

  function render() {
    const dialog = byId("studyDialog");
    if (!dialog) return;
    dialog.querySelectorAll("[data-study-tab]").forEach(button => {
      const on = button.dataset.studyTab === tab;
      button.setAttribute("aria-selected", String(on));
      button.tabIndex = on ? 0 : -1;
    });
    body().setAttribute("aria-labelledby", `study-tab-${tab}`);
    // Re-drawing removes the button that was just pressed. Keep focus inside the dialog so keys still work.
    const hadFocus = body().contains(document.activeElement) && document.activeElement !== body();
    body().innerHTML = { today: renderToday, cards: renderCards, mistakes: renderMistakes, plan: renderPlan, classes: renderClasses, progress: renderProgress }[tab]();
    if (hadFocus) body().focus();
  }

  function renderToday() {
    const data = study();
    const due = dueCards(data.cards).length;
    const streak = streakInfo(data.days);
    const open = data.mistakes.filter(item => !item.fixed).length;
    const today = dayKey();
    const upcoming = data.exams.filter(exam => exam.date >= today && exam.name).sort((a, b) => a.date.localeCompare(b.date))[0];
    const left = upcoming ? Math.round((new Date(`${upcoming.date}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86400000) : null;
    return `
      <div class="studyGrid">
        <section class="studyTile"><h3>Streak</h3><p class="studyBig">${streak.current} ${streak.current === 1 ? "day" : "days"}</p><small>${streak.activeToday ? "You studied today." : "Ask a question or review a card to keep it going. One missed day is fine."}</small></section>
        <section class="studyTile"><h3>Flashcards</h3><p class="studyBig">${due} due</p><small>${data.cards.length} cards in ${deckSummary(data.cards).length} ${deckSummary(data.cards).length === 1 ? "deck" : "decks"}.</small>${due ? '<button type="button" class="primaryBtn" data-study-review="*">Review now</button>' : ""}</section>
        <section class="studyTile"><h3>Mistakes</h3><p class="studyBig">${open} to work on</p><small>Save a reply from the Save mistake button under it.</small>${open ? '<button type="button" class="secondaryBtn" data-study-tab-go="mistakes">Open notebook</button>' : ""}</section>
        <section class="studyTile"><h3>Next exam</h3><p class="studyBig">${upcoming ? `${left} ${left === 1 ? "day" : "days"}` : "None set"}</p><small>${upcoming ? escapeHtml(upcoming.name) : "Add an exam and AUI builds a day-by-day plan."}</small><button type="button" class="secondaryBtn" data-study-tab-go="plan">${upcoming ? "See the plan" : "Plan an exam"}</button></section>
      </div>
      <h3 class="skillGroup">Start something</h3>
      <div class="studyActions">
        <button type="button" class="secondaryBtn" data-study-act="cards-chat">Make flashcards from this chat</button>
        <button type="button" class="secondaryBtn" data-study-act="quiz">Quiz me on this chat</button>
        <button type="button" class="secondaryBtn" data-study-act="timer">Start a 25-minute focus timer</button>
        <button type="button" class="secondaryBtn" data-study-act="cite">Make a citation</button>
        <button type="button" class="secondaryBtn" data-study-act="skills">Study skills</button>
      </div>
      <p class="toolHint">Everything in the study space stays in this browser. It is not sent to AUI.</p>`;
  }

  function renderCards() {
    const data = study();
    if (session) return renderSession();
    const decks = deckSummary(data.cards);
    return `
      <div class="studyActions">
        <button type="button" class="primaryBtn" data-study-act="cards-chat">Make cards from this chat</button>
        <button type="button" class="secondaryBtn" data-study-act="card-add">Add a card</button>
        <button type="button" class="secondaryBtn" data-study-act="cards-paste">Paste notes or cards</button>
        <button type="button" class="secondaryBtn" data-study-act="cards-import">Import a file</button>
      </div>
      ${decks.length ? `<ul class="deckList">${decks.map(deck => `
        <li class="deckRow"><div><strong>${escapeHtml(deck.name)}</strong><small>${deck.total} ${deck.total === 1 ? "card" : "cards"} · ${deck.due} due · ${deck.fresh} new</small></div>
        <div class="deckButtons">
          <button type="button" class="secondaryBtn" data-study-review="${escapeHtml(deck.name)}" ${deck.due ? "" : "disabled"}>Review</button>
          <button type="button" class="textActionBtn" data-deck-export="${escapeHtml(deck.name)}" aria-label="Download ${escapeHtml(deck.name)}">Download</button>
          <button type="button" class="textActionBtn" data-deck-share="${escapeHtml(deck.name)}" aria-label="Copy a link to ${escapeHtml(deck.name)}">Share link</button>
          <button type="button" class="textActionBtn dangerButton" data-deck-delete="${escapeHtml(deck.name)}" aria-label="Delete ${escapeHtml(deck.name)}">Delete</button>
        </div></li>`).join("")}</ul>` : '<p class="toolHint">No cards yet. Make some from a chat, paste your notes, or add one by hand.</p>'}
      <input type="file" id="studyFileInput" accept=".csv,.tsv,.txt,text/csv,text/plain" hidden>`;
  }

  function renderSession() {
    const data = study();
    const card = data.cards.find(item => item.id === session.queue[0]);
    if (!card) {
      const message = session.total ? `Done. You reviewed ${session.done} ${session.done === 1 ? "card" : "cards"}${session.again ? `, and ${session.again} will come back soon` : ""}.` : "Nothing is due in this deck.";
      return `<div class="studyDone"><p class="studyBig">${message}</p><button type="button" class="primaryBtn" data-study-end>Back to decks</button></div>`;
    }
    const now = Date.now();
    return `
      <div class="reviewHeader"><small>${escapeHtml(card.deck)} · ${session.done + 1} of ${session.total}</small><button type="button" class="textActionBtn" data-study-end>Stop</button></div>
      <div class="reviewCard" aria-live="polite"><p class="reviewFront">${escapeHtml(card.front)}</p>${session.shown ? `<hr><p class="reviewBack">${escapeHtml(card.back)}</p>` : ""}</div>
      ${session.shown
        ? `<div class="gradeRow" role="group" aria-label="How well did you know it?">${[[0, "Again"], [1, "Hard"], [2, "Good"], [3, "Easy"]].map(([grade, label]) => `<button type="button" class="secondaryBtn grade${grade}" data-grade="${grade}"><strong>${label}</strong><small>${intervalLabel(card, grade, now)}</small></button>`).join("")}</div><p class="toolHint">Keys: 1 Again, 2 Hard, 3 Good, 4 Easy.</p>`
        : '<div class="gradeRow"><button type="button" class="primaryBtn" data-study-show>Show the answer</button></div><p class="toolHint">Say the answer to yourself first. Key: Space.</p>'}`;
  }

  function renderMistakes() {
    const list = study().mistakes;
    if (!list.length) return '<p class="toolHint">Nothing saved yet. Under any reply there is a Save mistake button. Use it when you got something wrong, so you can try it again later.</p>';
    return `<ul class="mistakeList">${list.map(item => `
      <li class="mistakeRow${item.fixed ? " isFixed" : ""}" data-mistake-id="${escapeHtml(item.id)}">
        <details><summary><strong>${escapeHtml(item.question.slice(0, 120) || "Saved reply")}</strong>${item.topic ? `<span class="tagChip">${escapeHtml(item.topic)}</span>` : ""}${item.fixed ? '<span class="tagChip">Fixed</span>' : ""}</summary>
          ${item.note ? `<p><strong>What went wrong:</strong> ${escapeHtml(item.note)}</p>` : ""}
          <p class="mistakeAnswer">${escapeHtml(item.answer.slice(0, 1200))}</p></details>
        <div class="deckButtons">
          <button type="button" class="secondaryBtn" data-mistake-retry>Try again</button>
          <button type="button" class="textActionBtn" data-mistake-card>Make a card</button>
          <button type="button" class="textActionBtn" data-mistake-fix>${item.fixed ? "Reopen" : "Mark fixed"}</button>
          <button type="button" class="textActionBtn dangerButton" data-mistake-delete aria-label="Delete this mistake">Delete</button>
        </div></li>`).join("")}</ul>`;
  }

  function renderPlan() {
    const data = study();
    const exams = data.exams.length ? data.exams : [{ name: "", date: "", topics: "" }];
    const built = data.exams.some(exam => exam.name) ? buildPlan({ exams: data.exams, minutesPerDay: data.minutes }) : null;
    return `
      <form id="planForm" class="setupBody" novalidate>
        <p class="toolHint">Add each exam with its date and topics. AUI spreads the topics over the days left, brings each one back after 1, 3 and 7 days, and keeps the last two days for practice and a light review.</p>
        <div id="examRows">${exams.map((exam, index) => examRow(exam, index)).join("")}</div>
        <div class="setupActions studyActionsLeft"><button type="button" class="textActionBtn" data-exam-add>Add another exam</button></div>
        <label>Minutes you can study each day <input type="number" name="minutes" min="10" max="600" step="5" value="${data.minutes}"></label>
        <p class="formError" id="planError" role="alert" hidden></p>
        <div class="setupActions"><button type="submit" class="primaryBtn">Build my plan</button></div>
      </form>
      ${built ? planView(built) : ""}`;
  }

  const examRow = (exam, index) => `
    <fieldset class="examRow"><legend>Exam ${index + 1}</legend>
      <label>Name <input name="exam-name" maxlength="60" value="${escapeHtml(exam.name)}" placeholder="Biology midterm"></label>
      <label>Date <input name="exam-date" type="date" value="${escapeHtml(exam.date)}"></label>
      <label>Topics, separated by commas <textarea name="exam-topics" rows="2" maxlength="600" placeholder="Cells, Photosynthesis, Genetics">${escapeHtml(exam.topics)}</textarea></label>
    </fieldset>`;

  function planView({ plan, problems }) {
    if (!plan.length) return `<p class="formError" role="alert">${problems.map(escapeHtml).join(" ")}</p>`;
    const label = key => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const kind = { learn: "Learn", review: "Review", practice: "Practice", exam: "Exam" };
    return `
      ${problems.length ? `<p class="formError" role="alert">${problems.map(escapeHtml).join(" ")}</p>` : ""}
      <div class="setupActions studyActionsLeft"><button type="button" class="secondaryBtn" data-plan-ics>Download calendar file</button><button type="button" class="textActionBtn" data-plan-copy>Copy as text</button><button type="button" class="textActionBtn" data-plan-share>Share link</button></div>
      <ol class="planList">${plan.map(day => `<li class="planDay${day.tasks.some(task => task.kind === "exam") ? " isExam" : ""}"><h4>${escapeHtml(label(day.date))}${day.minutes ? ` <small>about ${day.minutes} min per task</small>` : ""}</h4><ul>${day.tasks.map(task => `<li><strong>${kind[task.kind]}</strong> ${escapeHtml(task.topic)}${task.kind === "exam" ? "" : ` <small>${escapeHtml(task.exam)}</small>`}</li>`).join("")}</ul></li>`).join("")}</ol>`;
  }

  function renderClasses() {
    const data = study();
    const names = [...new Set([...state.chats.map(chat => chat.folder).filter(Boolean), ...Object.keys(data.classes)])].sort((a, b) => a.localeCompare(b));
    return `
      <p class="toolHint">A class is a folder. Tell AUI about a class once, and every chat in that folder starts with it. Move a chat to a folder from its menu in the sidebar.</p>
      <form id="classForm" class="setupBody">
        ${names.length ? names.map(name => `
        <fieldset class="examRow" data-class="${escapeHtml(name)}"><legend>${escapeHtml(name)}</legend>
          <label>What AUI should know <textarea name="notes" rows="3" maxlength="600" placeholder="Grade 10 chemistry. We are on stoichiometry. The teacher marks units strictly.">${escapeHtml(data.classes[name]?.notes || "")}</textarea></label>
          <label>Your goal <input name="goal" maxlength="100" value="${escapeHtml(data.classes[name]?.goal || "")}" placeholder="Reach a B+ by the final"></label>
        </fieldset>`).join("") : '<p class="toolHint">No folders yet. Open the menu of a chat in the sidebar and choose Move to folder.</p>'}
        ${names.length ? '<div class="setupActions"><button type="submit" class="primaryBtn">Save</button></div>' : ""}
      </form>`;
  }

  function renderProgress() {
    const data = study();
    const info = stats();
    const earned = new Set(earnedBadges(info).map(badge => badge.id));
    const recap = weeklyRecap({ chats: state.chats, study: data });
    const days = new Set(data.days);
    const cells = [];
    const end = new Date();
    for (let i = 83; i >= 0; i -= 1) {
      const key = dayKey(new Date(end.getFullYear(), end.getMonth(), end.getDate() - i, 12).getTime());
      cells.push(`<span class="heatCell${days.has(key) ? " on" : ""}" title="${key}${days.has(key) ? ": studied" : ""}"></span>`);
    }
    return `
      <div class="studyGrid">
        <section class="studyTile"><h3>Streak</h3><p class="studyBig">${info.streak}</p><small>Longest: ${info.longest}. One missed day does not break it.</small></section>
        <section class="studyTile"><h3>Reviews</h3><p class="studyBig">${info.reviews}</p><small>Flashcards reviewed in total.</small></section>
      </div>
      <h3 class="skillGroup">The last 12 weeks</h3>
      <div class="heat" role="img" aria-label="${days.size} days studied in total">${cells.join("")}</div>
      <h3 class="skillGroup">Badges <small>Only you see these. There is no ranking.</small></h3>
      <ul class="badgeList">${BADGES.map(badge => `<li class="badge${earned.has(badge.id) ? " earned" : ""}"><strong>${escapeHtml(badge.name)}</strong><small>${earned.has(badge.id) ? escapeHtml(badge.text) : "Not yet: " + escapeHtml(badge.text.toLowerCase())}</small></li>`).join("")}</ul>
      <h3 class="skillGroup">This week</h3>
      <pre class="recapText">${escapeHtml(recapText(recap, String(state.settings.userName || "").trim().slice(0, 40)))}</pre>
      <div class="setupActions studyActionsLeft"><button type="button" class="secondaryBtn" data-recap-copy>Copy to share with a parent or teacher</button></div>
      <p class="toolHint">The summary has counts and topic names, not your messages.</p>`;
  }

  // --- events ---

  function onClick(event) {
    const target = event.target;
    const tabButton = target.closest("[data-study-tab]");
    if (tabButton) { tab = tabButton.dataset.studyTab; session = null; return render(); }
    const go = target.closest("[data-study-tab-go]");
    if (go) { tab = go.dataset.studyTabGo; return render(); }
    const review = target.closest("[data-study-review]");
    if (review) { tab = "cards"; session = startSession(review.dataset.studyReview); return render(); }
    if (target.closest("[data-study-end]")) { session = null; return render(); }
    if (target.closest("[data-study-show]")) { session.shown = true; return render(); }
    const grade = target.closest("[data-grade]");
    if (grade) return gradeCard(Number(grade.dataset.grade));
    const act = target.closest("[data-study-act]")?.dataset.studyAct;
    if (act) return runAct(act);
    const deckExport = target.closest("[data-deck-export]");
    if (deckExport) return exportDeck(deckExport.dataset.deckExport);
    const deckShare = target.closest("[data-deck-share]");
    if (deckShare) return shareDeck(deckShare.dataset.deckShare);
    const deckDelete = target.closest("[data-deck-delete]");
    if (deckDelete) {
      const name = deckDelete.dataset.deckDelete;
      const removed = study().cards.filter(card => card.deck === name);
      study().cards = study().cards.filter(card => card.deck !== name);
      save();
      render();
      return toast(`Deleted ${name}.`, "info", { label: "Undo", duration: 7000, onClick: () => { study().cards.push(...removed); save(); if (byId("studyDialog")?.open) render(); } });
    }
    const row = target.closest("[data-mistake-id]");
    if (row) {
      const item = study().mistakes.find(entry => entry.id === row.dataset.mistakeId);
      if (!item) return;
      if (target.closest("[data-mistake-retry]")) { api.setComposerText(item.question); byId("studyDialog").close(); return toast("The question is in the message box. Try it without looking at the old answer.", "info"); }
      if (target.closest("[data-mistake-card]")) {
        study().cards.push(newCard(item.question.slice(0, 240), item.note || item.answer.slice(0, 400), item.topic || "Mistakes"));
        study().counts.cardsMade += 1;
        save();
        return toast("Made a card in your Mistakes deck.", "success");
      }
      if (target.closest("[data-mistake-fix]")) { item.fixed = !item.fixed; save(); return render(); }
      if (target.closest("[data-mistake-delete]")) {
        const at = study().mistakes.indexOf(item);
        study().mistakes.splice(at, 1);
        save();
        render();
        return toast("Deleted.", "info", { label: "Undo", duration: 6000, onClick: () => { study().mistakes.splice(at, 0, item); save(); if (byId("studyDialog")?.open) render(); } });
      }
    }
    if (target.closest("[data-exam-add]")) {
      const rows = byId("examRows");
      if (rows.querySelectorAll(".examRow").length >= 6) return toast("Six exams at most.", "info");
      rows.insertAdjacentHTML("beforeend", examRow({ name: "", date: "", topics: "" }, rows.querySelectorAll(".examRow").length));
      return rows.lastElementChild.querySelector("input")?.focus();
    }
    if (target.closest("[data-plan-ics]")) return downloadPlan();
    if (target.closest("[data-plan-copy]")) return copyPlan();
    if (target.closest("[data-plan-share]")) return sharePlan();
    if (target.closest("[data-recap-copy]")) {
      const text = recapText(weeklyRecap({ chats: state.chats, study: study() }), String(state.settings.userName || "").trim().slice(0, 40));
      return api.copyText(text).then(() => toast("Copied.")).catch(() => toast("Couldn't copy.", "error"));
    }
  }

  function onKey(event) {
    if (!session || tab !== "cards" || event.target.closest("input, textarea, select")) return;
    if (event.key === " " && !session.shown && session.queue.length) { event.preventDefault(); session.shown = true; render(); byId("studyBody").focus(); }
    else if (session.shown && /^[1-4]$/.test(event.key)) { event.preventDefault(); gradeCard(Number(event.key) - 1); }
  }

  function onChange(event) {
    if (event.target.id === "studyFileInput") importFile(event.target.files?.[0]);
  }

  function onSubmit(event) {
    if (event.target.id === "planForm") {
      event.preventDefault();
      const form = event.target;
      const names = form.querySelectorAll('[name="exam-name"]');
      const dates = form.querySelectorAll('[name="exam-date"]');
      const topics = form.querySelectorAll('[name="exam-topics"]');
      const exams = [...names].map((input, index) => ({ name: input.value.trim(), date: dates[index].value, topics: topics[index].value.trim() })).filter(exam => exam.name || exam.date || exam.topics);
      const minutes = Math.min(Math.max(Number(form.minutes.value) || 60, 10), 600);
      const result = buildPlan({ exams, minutesPerDay: minutes });
      const error = byId("planError");
      if (!result.plan.length) { error.hidden = false; error.textContent = result.problems.join(" ") || "Add an exam first."; return; }
      const data = study();
      data.exams = exams;
      data.minutes = minutes;
      data.counts.plans += 1;
      noteActivity();
      save();
      render();
      byId("studyBody").querySelector(".planList")?.scrollIntoView({ block: "nearest" });
    } else if (event.target.id === "classForm") {
      event.preventDefault();
      const data = study();
      event.target.querySelectorAll("[data-class]").forEach(box => {
        const notes = box.querySelector('[name="notes"]').value.trim();
        const goal = box.querySelector('[name="goal"]').value.trim();
        if (notes || goal) data.classes[box.dataset.class] = { notes, goal };
        else delete data.classes[box.dataset.class];
      });
      api.clearPromptCache();
      save();
      toast("Saved. AUI will use this in those folders.");
    }
  }

  function gradeCard(grade) {
    if (!session) return;
    const id = session.queue.shift();
    const data = study();
    const at = data.cards.findIndex(card => card.id === id);
    if (at < 0) { session.shown = false; return render(); }
    data.cards[at] = reviewCard(data.cards[at], grade);
    data.counts.reviews += 1;
    const today = dayKey();
    const last = data.reviewLog.at(-1);
    if (last && last[0] === today) last[1] += 1;
    else data.reviewLog = [...data.reviewLog, [today, 1]].slice(-120);
    session.done += 1;
    if (grade === 0) { session.again += 1; session.queue.push(id); session.total += 0; }
    session.shown = false;
    noteActivity();
    save();
    render();
    byId("studyBody").focus();
  }

  function runAct(act) {
    if (act === "cards-chat") return cardsFromChat();
    if (act === "timer") { byId("studyDialog").close(); return api.startFocusTimer(25); }
    if (act === "cite") return openCite();
    if (act === "skills") { byId("studyDialog").close(); return api.openSkills(); }
    if (act === "quiz") { byId("studyDialog").close(); return api.startQuiz(); }
    if (act === "card-add") return addCardDialog();
    if (act === "cards-paste") return pasteDialog();
    if (act === "cards-import") return byId("studyFileInput")?.click();
  }

  function addCardDialog() {
    const dialog = simpleDialog("cardAddDialog", "Flashcards", "Add a card", `
      <form class="setupBody" id="cardAddForm">
        <label>Front (the question) <textarea name="front" rows="2" maxlength="240" required></textarea></label>
        <label>Back (the answer) <textarea name="back" rows="3" maxlength="700" required></textarea></label>
        <label>Deck <input name="deck" maxlength="40" value="${escapeHtml(api.getChat()?.folder || "General")}"></label>
        <div class="setupActions"><button type="button" class="secondaryBtn" data-close-dialog>Cancel</button><button type="submit" class="primaryBtn">Add card</button></div>
      </form>`);
    const form = dialog.querySelector("#cardAddForm");
    form.front.focus();
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (study().cards.length >= MAX_CARDS) return toast(`A study space holds ${MAX_CARDS} cards.`, "error");
      study().cards.push(newCard(form.front.value, form.back.value, form.deck.value));
      study().counts.cardsMade += 1;
      noteActivity();
      save();
      dialog.close();
      render();
      toast("Added.");
    });
  }

  function pasteDialog() {
    const dialog = simpleDialog("cardPasteDialog", "Flashcards", "Paste notes or cards", `
      <form class="setupBody" id="cardPasteForm">
        <p class="toolHint">Paste cards like <code>Q: question</code> then <code>A: answer</code>, or <code>term :: meaning</code> lines. Paste plain notes and AUI writes cards from them.</p>
        <label>Text <textarea name="text" rows="9" maxlength="12000" required></textarea></label>
        <div class="setupActions"><button type="button" class="secondaryBtn" data-close-dialog>Cancel</button><button type="submit" class="primaryBtn">Make cards</button></div>
      </form>`);
    const form = dialog.querySelector("#cardPasteForm");
    form.text.focus();
    form.addEventListener("submit", event => {
      event.preventDefault();
      const text = form.text.value;
      dialog.close();
      makeCardsFrom(text, (api.getChat()?.folder || "Pasted").slice(0, 40));
    });
  }

  async function importFile(file) {
    byId("studyFileInput").value = "";
    if (!file) return;
    if (file.size > 600000) return toast("That file is too big. Keep it under 600 KB.", "error");
    const text = await file.text();
    const rows = /\.(csv|tsv)$/i.test(file.name) ? text.split(/\r?\n/).map(line => line.split(/\t|,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(cell => cell.trim().replace(/^"|"$/g, "").replace(/""/g, '"'))).filter(cells => cells.length >= 2 && cells[0] && cells[1]) : [];
    const cards = rows.length ? rows.slice(0, 300).map(([front, back]) => ({ front, back })) : parseCards(text, 300);
    if (!cards.length) return toast("I couldn't find cards in that file. Use two columns: front, back.", "error");
    reviewNewCards(cards, file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "Imported");
  }

  function exportDeck(name) {
    const cards = study().cards.filter(card => card.deck === name);
    // Tab-separated, front then back: Anki, Quizlet and spreadsheets all read this.
    api.downloadFile(`${name.replace(/[^\w-]+/g, "-").slice(0, 30) || "deck"}.tsv`, cards.map(card => `${card.front.replace(/\t/g, " ")}\t${card.back.replace(/\t/g, " ")}`).join("\n"), "text/tab-separated-values;charset=utf-8");
    toast(`Downloaded ${cards.length} cards. Anki and spreadsheets can open this file.`);
  }

  async function copyLink(kind, data) {
    try {
      const link = shareUrl(location.origin, await encodeShare(kind, data));
      await api.copyText(link);
      toast("Link copied. Anyone who opens it gets their own copy. Nothing is uploaded to AUI.");
    } catch (error) {
      toast(error.message || "Couldn't make a link.", "error");
    }
  }
  const shareDeck = name => copyLink("deck", { name, cards: study().cards.filter(card => card.deck === name).map(card => ({ front: card.front, back: card.back })) });
  const sharePlan = () => copyLink("plan", { minutesPerDay: study().minutes, exams: study().exams.map(exam => ({ ...exam, topics: String(exam.topics).split(/[,\n;]/).map(topic => topic.trim()).filter(Boolean) })) });

  function currentPlan() {
    return buildPlan({ exams: study().exams, minutesPerDay: study().minutes }).plan;
  }
  function downloadPlan() {
    const plan = currentPlan();
    if (!plan.length) return toast("Build a plan first.", "info");
    api.downloadFile("study-plan.ics", planToIcs(plan), "text/calendar;charset=utf-8");
    toast("Downloaded. Open it to add the days to your calendar.");
  }
  function copyPlan() {
    const kind = { learn: "Learn", review: "Review", practice: "Practice", exam: "Exam" };
    const text = currentPlan().map(day => `${day.date}\n${day.tasks.map(task => `  ${kind[task.kind]}: ${task.topic}${task.kind === "exam" ? "" : ` (${task.exam})`}`).join("\n")}`).join("\n\n");
    api.copyText(text).then(() => toast("Copied.")).catch(() => toast("Couldn't copy.", "error"));
  }

  // --- citations ---

  const emptySource = () => ({ type: "website", authors: "", title: "", container: "", publisher: "", year: "", month: "", day: "", url: "", doi: "", volume: "", issue: "", pages: "", edition: "", accessed: "", page: "" });
  let citeStyle = "apa";

  function openCite() {
    const dialog = simpleDialog("citeDialog", "Citations", "Make a citation", `
      <form class="setupBody" id="citeForm" novalidate>
        <div class="citeRow">
          <label>Style <select name="style">${STYLES.map(([id, label]) => `<option value="${id}"${id === citeStyle ? " selected" : ""}>${label}</option>`).join("")}</select></label>
          <label>Source <select name="type">${TYPES.map(([id, label]) => `<option value="${id}">${label}</option>`).join("")}</select></label>
        </div>
        <label>Authors, one per line <textarea name="authors" rows="2" placeholder="Ada Lovelace&#10;Charles Babbage"></textarea></label>
        <label>Title <input name="title" maxlength="300" required></label>
        <label data-for="website article">Website or journal name <input name="container" maxlength="200"></label>
        <label data-for="book">Publisher <input name="publisher" maxlength="200"></label>
        <label data-for="book">Edition, if not the first <input name="edition" maxlength="30" placeholder="2nd"></label>
        <div class="citeRow">
          <label>Year <input name="year" inputmode="numeric" maxlength="4"></label>
          <label data-for="website">Month <input name="month" maxlength="12" placeholder="7 or July"></label>
          <label data-for="website">Day <input name="day" inputmode="numeric" maxlength="2"></label>
        </div>
        <div class="citeRow" data-for="article"><label>Volume <input name="volume" maxlength="10"></label><label>Issue <input name="issue" maxlength="10"></label><label>Pages <input name="pages" maxlength="20" placeholder="45-60"></label></div>
        <label data-for="website article book">Link or DOI <input name="url" maxlength="400" placeholder="https://"></label>
        <label data-for="website">Date you read it, for MLA <input name="accessed" maxlength="30" placeholder="5 May 2026"></label>
        <label>Page for the in-text citation <input name="page" maxlength="12" placeholder="12"></label>
        <p class="formError" id="citeError" role="alert" hidden></p>
        <div class="citeOut" id="citeOut" aria-live="polite"></div>
        <div class="setupActions studyActionsLeft">
          <button type="button" class="primaryBtn" data-cite-copy>Copy citation</button>
          <button type="button" class="secondaryBtn" data-cite-intext>Copy in-text</button>
          <button type="button" class="secondaryBtn" data-cite-add>Add to my list</button>
        </div>
      </form>
      <h3 class="skillGroup">My list <small id="citeCount"></small></h3>
      <ul class="citeList" id="citeList"></ul>
      <div class="setupActions studyActionsLeft"><button type="button" class="secondaryBtn" data-cite-copy-all>Copy the whole list</button><button type="button" class="textActionBtn dangerButton" data-cite-clear>Clear the list</button></div>`, { wide: true });
    const form = dialog.querySelector("#citeForm");
    const out = dialog.querySelector("#citeOut");
    const error = dialog.querySelector("#citeError");
    let latest = null;
    const read = () => Object.fromEntries(new FormData(form).entries());
    const refresh = () => {
      const source = { ...emptySource(), ...read() };
      citeStyle = source.style;
      form.querySelectorAll("[data-for]").forEach(row => { row.hidden = !row.dataset.for.split(" ").includes(source.type); });
      const result = source.title.trim() ? formatCitation(source.style, source) : { error: "" };
      error.hidden = !result.error;
      error.textContent = result.error || "";
      latest = result.error ? null : { ...result, source };
      out.innerHTML = latest ? `<p class="citeText">${result.html}</p>` : "";
    };
    const list = () => {
      const data = study();
      dialog.querySelector("#citeCount").textContent = `${data.sources.length} saved`;
      dialog.querySelector("#citeList").innerHTML = data.sources.map((source, index) => `<li><span>${source.html || escapeHtml(source.text)}</span><button type="button" class="textActionBtn dangerButton" data-cite-remove="${index}" aria-label="Remove this source">Remove</button></li>`).join("") || '<li class="toolHint">Nothing saved yet.</li>';
    };
    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);
    dialog.addEventListener("click", event => {
      const copy = text => api.copyText(text).then(() => toast("Copied.")).catch(() => toast("Couldn't copy.", "error"));
      if (event.target.closest("[data-cite-copy]")) return latest ? copy(latest.text) : toast("Add a title first.", "info");
      if (event.target.closest("[data-cite-intext]")) return latest ? copy(inTextCitation(latest.source.style, latest.source)) : toast("Add a title first.", "info");
      if (event.target.closest("[data-cite-add]")) {
        if (!latest) return toast("Add a title first.", "info");
        const data = study();
        if (data.sources.length >= 100) return toast("The list holds 100 sources.", "error");
        data.sources.push({ text: latest.text, html: latest.html });
        data.sources.sort((a, b) => a.text.localeCompare(b.text));
        save();
        list();
        return toast("Added.");
      }
      if (event.target.closest("[data-cite-copy-all]")) return copy(study().sources.map(source => source.text).join("\n\n"));
      if (event.target.closest("[data-cite-clear]")) { study().sources = []; save(); return list(); }
      const remove = event.target.closest("[data-cite-remove]");
      if (remove) { study().sources.splice(Number(remove.dataset.citeRemove), 1); save(); list(); }
    });
    refresh();
    list();
    form.title.focus();
  }

  // --- links that someone shared ---

  async function handleShareHash() {
    const payload = shareFromHash(location.hash);
    if (!payload) return false;
    history.replaceState(null, "", location.pathname + location.search);
    try {
      const { kind, data } = await decodeShare(payload);
      if (kind === "skill") api.importSkill(data);
      else if (kind === "deck") importSharedDeck(cleanDeck(data));
      else if (kind === "plan") importSharedPlan(cleanPlanInput(data));
      else if (kind === "chat") openSharedChat(cleanChat(data));
    } catch (error) {
      toast(error.message || "That link didn't open.", "error");
    }
    return true;
  }

  function importSharedDeck(deck) {
    if (!deck.cards.length) return toast("That deck is empty.", "error");
    const dialog = simpleDialog("sharedDeckDialog", "Shared with you", `A deck: ${deck.name}`, `
      <p class="toolHint">${deck.cards.length} cards. They are added to your own study space. Read a few first: anyone can make a link.</p>
      <ul class="cardPreviewList">${deck.cards.slice(0, 5).map(card => `<li><span><strong>${escapeHtml(card.front)}</strong><small>${escapeHtml(card.back)}</small></span></li>`).join("")}</ul>
      <div class="setupActions"><button type="button" class="secondaryBtn" data-close-dialog>No thanks</button><button type="button" class="primaryBtn" data-shared-add>Add ${deck.cards.length} cards</button></div>`);
    dialog.querySelector("[data-shared-add]").addEventListener("click", () => {
      const room = MAX_CARDS - study().cards.length;
      study().cards.push(...deck.cards.slice(0, Math.max(room, 0)).map(card => newCard(card.front, card.back, deck.name)));
      study().counts.cardsMade += Math.min(deck.cards.length, Math.max(room, 0));
      save();
      dialog.close();
      openStudy("cards");
    });
  }

  function importSharedPlan(input) {
    const dialog = simpleDialog("sharedPlanDialog", "Shared with you", "A study plan", `
      <p class="toolHint">${input.exams.length} ${input.exams.length === 1 ? "exam" : "exams"}: ${input.exams.map(exam => escapeHtml(exam.name || "Unnamed")).join(", ")}. Adding it replaces the exams in your Plan tab.</p>
      <div class="setupActions"><button type="button" class="secondaryBtn" data-close-dialog>No thanks</button><button type="button" class="primaryBtn" data-shared-add>Use this plan</button></div>`);
    dialog.querySelector("[data-shared-add]").addEventListener("click", () => {
      study().exams = input.exams.map(exam => ({ ...exam, topics: exam.topics.join(", ") }));
      study().minutes = input.minutesPerDay;
      save();
      dialog.close();
      openStudy("plan");
    });
  }

  function openSharedChat(chat) {
    if (!chat.messages.length) return toast("That chat is empty.", "error");
    const dialog = simpleDialog("sharedChatDialog", "Shared with you", chat.title, `
      <p class="toolHint">A read-only copy that came inside the link. It is not saved anywhere until you choose to.</p>
      <div class="sharedChat">${chat.messages.map(message => `<div class="sharedMessage ${message.role}"><strong>${message.role === "user" ? "Question" : "AUI"}</strong><p>${escapeHtml(message.content)}</p></div>`).join("")}</div>
      <div class="setupActions"><button type="button" class="secondaryBtn" data-close-dialog>Close</button><button type="button" class="primaryBtn" data-shared-add>Save a copy as a chat</button></div>`, { wide: true });
    dialog.querySelector("[data-shared-add]").addEventListener("click", () => {
      api.addChat(chat);
      dialog.close();
      toast("Saved as a new chat.");
    });
  }

  async function shareChat(chat) {
    const messages = chat.messages.filter(message => message.content && !message.excluded && (message.role === "user" || message.role === "assistant")).map(message => ({ role: message.role, content: message.content }));
    if (!messages.length) return toast("This chat is empty.", "info");
    return copyLink("chat", { title: chat.title, messages });
  }

  const shareSkill = skill => copyLink("skill", { name: skill.name, description: skill.description || "", instructions: skill.instructions });

  return { openStudy, openCite, noteActivity, saveMistake, cardsFromMessage, shareChat, shareSkill, handleShareHash };
}
