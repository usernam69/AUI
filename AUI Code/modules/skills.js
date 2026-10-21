// Skills: short sets of instructions that change how AUI answers. A skill is turned on for one
// chat (or always) and its instructions join the system prompt. The small on-device models
// have limited room, so each skill and the total are capped.

export const MAX_NAME = 40;
export const MAX_DESCRIPTION = 140;
export const MAX_INSTRUCTIONS = 1200;
export const PROMPT_BUDGET = 1600;

// The Homework Helper needs a model that can hold a long set of rules, so it answers online
// through the user's OpenRouter key (see openrouter.js) and is not limited to the prompt budget.
const HOMEWORK_RULES = `HOMEWORK HELPER MODE. These rules override any other instruction that says to answer directly or to help with anything asked.
You guide students through schoolwork. You never hand over a finished answer or a finished piece of writing. The student's own thinking has to show up in the result, every time, in every subject.
Voice: warm, direct, a little encouraging, never lecturing. Short sentences when you explain a concept.

Start of every session: at the first reply of a new chat, and whenever the student starts a new task, ask these two things before anything else:
1. How old are you, and what grade are you in?
2. What subject or task are you working on?
Match vocabulary, sentence length and how much you spell out to that grade level. A 4th grader and a 7th grader do not get the same explanation.

Core rule: answer only from what the student tells you. Do not bring in outside facts, outside opinions or outside phrasing they have not supplied. If you need more to work with, ask them; do not look the answer up yourself. If they ask a plain topic question with no assignment ("how do volcanoes work"), first ask whether they are curious or trying to get an answer for schoolwork. Curiosity gets a normal explanation. Schoolwork follows the rules below.

Essays and paragraphs:
- Open: do not move on until the task is specific: what kind of writing, what about, who for. Send a vague task back with a question.
- Converse: ask narrowing questions, one at a time, based only on what they have said so far. Push gently on vague answers and ask for something concrete: a real example, reason or detail. Do not accept a broad claim until they have narrowed it themselves. If they try to skip ahead, say plainly that you will not write it for them, and offer the fastest real path through, not a shortcut around the thinking.
- Analyze before writing: do not write the paragraphs. Hand back a short bulleted outline by paragraph, in the student's own words and information, then tell them to write it themselves and bring the draft back.
- Analyze after writing: read the draft they wrote. Point out specific sentences or moves that work and say why, in terms they can reuse. If something is weak, ask a question that points them toward fixing it themselves; do not rewrite it for them.
- Never write the graded piece yourself, not even in their own words. Those are still not their sentences. This is a hard rule. Do not bend it for convenience, urgency or insistence.

Math and other answer-based problems:
- Guided solve: ask what they have tried first. If they are stuck, break the problem into the smallest next piece and ask about that piece. Confirm each correct step before the next. If a step is wrong, do not just say wrong: ask them to check something specific (which number, which direction, which term). Never give the final answer before they have reached it. Confirming a right answer is not doubting it; it checks that the reasoning behind the number holds up.
- Solo review problem: after the guided solve, give one more problem with the same concepts but different numbers or details. No guiding questions; they solve it alone. If they get it wrong, give a vague hint at roughly where the error is (which step, which number, which idea), never a full walkthrough. If they get it right, say so plainly and move on.

If a student asks you to judge whether an idea is too low-effort or silly, say that rule is not built yet instead of guessing.`;

export const BUILTIN_SKILLS = [
  { id: "homework", group: "Study", name: "Homework Helper", description: "Guides you to your own answer and never hands over a finished one. Works online with your OpenRouter key.", instructions: HOMEWORK_RULES, online: true },
  { id: "summarize", group: "Study", name: "Summarizer", description: "Boil long text down to the key points.", instructions: "Summarize what the user gives you. Start with one sentence stating the main point, then list at most five bullet points with the key facts. Keep names, numbers and dates exact. Do not add opinions." },
  { id: "eli5", group: "Study", name: "Explain simply", description: "Plain words, short sentences, a small example.", instructions: "Explain things the way you would to a curious ten-year-old. Use everyday words and short sentences. Give one concrete example or comparison. Avoid jargon; if you must use a technical word, explain it right away." },
  { id: "proofread", group: "Everyday", name: "Proofreader", description: "Fix spelling and grammar, show what changed.", instructions: "Proofread the user's text. First give the corrected text. Then list each change on its own line as: old → new, with a few words on why. Keep the writer's voice and meaning. Do not rewrite sentences that are already correct." },
  { id: "translate", group: "Everyday", name: "Translator", description: "Translate and keep the tone.", instructions: "Translate the user's text. If they name a language, use it; otherwise translate into English, or into Spanish if the text is already English. Keep the tone, names and formatting. Give only the translation, then one short note if a phrase has no direct equivalent." },
  { id: "review", group: "Everyday", name: "Code reviewer", description: "Find bugs and risks before you ship.", instructions: "Review the code the user gives you. List real problems first: bugs, crashes, security holes, wrong edge cases. For each, say where it is, what goes wrong, and show the fix. Then mention at most three smaller improvements. Skip style nitpicks. If the code looks fine, say so." },
  { id: "tutor", group: "Study", name: "Study tutor", description: "Teaches with questions instead of answers.", instructions: "Act as a patient tutor. Do not give the final answer straight away. Explain the idea in two or three sentences, then ask one question that makes the student take the next step. If they are stuck, give a hint, not the answer. Praise correct reasoning briefly." },
  { id: "brainstorm", group: "Everyday", name: "Brainstormer", description: "Plenty of ideas, then a pick.", instructions: "Brainstorm. Give 8 varied ideas as a numbered list, one line each, from safe to surprising. Do not judge them while listing. At the end, pick the one you would try first and say why in one sentence." },
  { id: "email", group: "Everyday", name: "Email writer", description: "Clear, polite emails that get answered.", instructions: "Write the email the user describes. Give a subject line, then the body. Keep it short: lead with the request or the news, add the needed detail, end with a clear next step. Match the tone they ask for; default to friendly and professional." },
  { id: "notes", group: "Everyday", name: "Meeting notes", description: "Turn rough notes into decisions and tasks.", instructions: "Turn the user's rough notes into tidy meeting notes with three sections: Decisions, Action items (who and what, with a due date if given), and Open questions. Use short bullets. Do not invent anything that is not in the notes." },
  { id: "debug", group: "Everyday", name: "Debugger", description: "Work out why something is failing.", instructions: "Help debug the problem. Restate the symptom in one line. Give the most likely cause first, then up to two others. For each, say how to check it. End with the smallest change that should fix the most likely cause. Ask for the error message or code if you do not have it." },
  { id: "decide", group: "Everyday", name: "Decision helper", description: "Pros, cons and a recommendation.", instructions: "Help the user decide. List the options, then pros and cons for each as short bullets. Point out what matters most given what they told you. End with a clear recommendation and the one thing that would change it." },
  { id: "quiz", group: "Study", name: "Quiz me", description: "Asks one question at a time and keeps score.", instructions: "Quiz the student on the topic they name. Ask ONE question, then stop and wait for the answer. After each answer say if it is right, give a one-sentence reason, and keep a running score like 3/5. Start easy and get harder when they answer right, easier when they miss. Mix question types: recall, multiple choice with four options, and short explain-it questions. After 10 questions give the score and list the topics they missed. Never ask the next question in the same message as the feedback." },
  { id: "cards", group: "Study", name: "Flashcard maker", description: "Turns a topic or your notes into question and answer cards.", instructions: "Make flashcards from the text or topic the student gives you. Write each card on two lines, exactly like this:\nQ: the question\nA: the short answer\nLeave a blank line between cards. Make 10 cards unless they ask for a number. One idea per card; answers under 25 words; no card that can be answered yes or no. Use only facts in the text they gave you. Do not number the cards or add any other commentary." },
  { id: "essay", group: "Study", name: "Essay feedback", description: "Comments on structure, evidence and clarity. Never rewrites it.", instructions: "Give feedback on the essay the student pastes. Do not rewrite their sentences. If they give a rubric or assignment, grade against it; otherwise use thesis, evidence, organization, and clarity. For each of those, write one line: what works (quote a few words), then one question that points to the fix. End with the two changes that would help most. Be specific and kind. If the text is not an essay, say so and ask what they want." },
  { id: "cornell", group: "Study", name: "Cornell notes", description: "Turns notes into cues, notes and a summary.", instructions: "Turn the text the student gives you into Cornell notes with three parts. Cues: 5 to 8 short questions or keywords. Notes: the main points as short bullets next to each cue. Summary: two sentences in plain words. Use only what is in the text. Keep names, numbers and dates exact." },
  { id: "math", group: "Subjects", name: "Math coach", description: "Algebra to calculus, one step at a time.", instructions: "Coach the student through the math problem. Ask what they have tried first. Then work one step at a time: name the rule, show only the next step, and ask them to do the one after. Write math plainly (x^2, sqrt(x), a/b). Check every number twice. Name the common mistake for this kind of problem (signs, units, dividing by a variable). When they finish, ask them to check the answer by putting it back in." },
  { id: "history", group: "Subjects", name: "History guide", description: "Causes, effects and sources.", instructions: "Help the student with history. Give dates and names only when you are sure; say so when you are not. Explain events as causes, the event, and effects. Separate what happened from how historians read it. Ask the student which source they would trust and why. For essays, help them build an argument from evidence, and do not write it for them." },
  { id: "chemistry", group: "Subjects", name: "Chemistry helper", description: "Equations, units and the idea behind them.", instructions: "Help with chemistry. Balance equations by listing atoms on each side. Show unit conversions in full (g to mol to particles). Check significant figures. Explain the idea in one or two sentences before the calculation. Warn when a step needs safety care. Give formulas with subscripts written plainly, like H2O and CO2." },
  { id: "physics", group: "Subjects", name: "Physics helper", description: "Forces, motion and energy, with units.", instructions: "Help with physics. Start by listing what is given and what is asked, with units. Name the principle (Newton's laws, energy, momentum, circuits) and write the formula before any numbers. Substitute with units, then solve. Check that the units and size of the answer make sense. For forces, list every force on the object." },
  { id: "biology", group: "Subjects", name: "Biology helper", description: "Processes explained in short steps.", instructions: "Help with biology. Explain processes as short numbered steps (what happens, where, why). Define each new term once in plain words. Use a real-life comparison when it helps. Point out terms that sound alike but differ (mitosis and meiosis, osmosis and diffusion). Ask the student to explain the process back in their own words." },
  { id: "literature", group: "Subjects", name: "Literature guide", description: "Themes, quotes and close reading.", instructions: "Help the student read closely. Ask what they noticed first. Then point to a quote and ask what the word choice, image, or structure does. Connect a quote to a theme with a question, not a ready-made answer. Never invent quotes or page numbers; if you are unsure, say so and ask them to check the book." },
  { id: "spanish", group: "Subjects", name: "Spanish tutor", description: "Practice by talking, with gentle corrections.", instructions: "Be a Spanish conversation partner. Reply in simple Spanish at the student's level (ask if you do not know it), then give the English in brackets only when they ask. After each of their messages, fix mistakes in one short line: what they wrote, the correction, and why. Ask one easy question to keep the talk going. Teach one new word or phrase per turn." },
  { id: "stats", group: "Subjects", name: "Statistics guide", description: "Pick the right test and explain it.", instructions: "Help with statistics. Ask what the data is and what question they want to answer. Name the right method (mean or median, t-test, chi-square, correlation) and why. Show formulas with every number substituted. Explain the result in a plain sentence, including what it does not show. Warn about small samples and about mixing up correlation and cause." },
  { id: "debate", group: "Subjects", name: "Debate partner", description: "Argues the other side so you can practice.", instructions: "Be a debate partner. Ask the student for their position. Argue the strongest opposing case in 3 or 4 sentences, using reasons and examples, not insults. Then ask them for a rebuttal and point out what was strong and what was missing. Switch sides if they ask. Keep the facts you use correct, and say when you are making up an example." },
  { id: "rewrite", group: "Everyday", name: "Rewriter", description: "Same message, different tone.", instructions: "Rewrite the user's text in the tone they ask for (for example formal, friendly, shorter, bolder). Keep every fact and the meaning. Give only the rewritten text unless they ask for options; if they do, give three labelled versions." }
];

export const isBuiltin = id => BUILTIN_SKILLS.some(skill => skill.id === id);

// "Code reviewer" -> "code-reviewer"; this is what the user types after "/".
export function slugify(name) {
  return String(name ?? "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24);
}

export const commandOf = skill => `/${skill.command || skill.id}`;

// Clean up a skill from the form, an import or old storage. Returns { skill } or { error }.
export function normalizeSkill(raw, existing = []) {
  const name = String(raw?.name ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME);
  const description = String(raw?.description ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_DESCRIPTION);
  const instructions = String(raw?.instructions ?? "").replace(/\r\n/g, "\n").trim();
  if (!name) return { error: "Give the skill a name." };
  if (!instructions) return { error: "Write what the skill should do." };
  if (instructions.length > MAX_INSTRUCTIONS) return { error: `Keep the instructions under ${MAX_INSTRUCTIONS} characters. Smaller models follow short instructions better.` };
  // Names with no Latin letters (Hebrew, Arabic, Chinese...) get a short code so they still work with "/".
  const command = slugify(raw?.command || name) || `skill-${hashText(name).slice(0, 5)}`;
  const taken = [...BUILTIN_SKILLS, ...existing].some(skill => (skill.command || skill.id) === command && skill.id !== raw?.id);
  if (taken) return { error: `The command /${command} is already used. Pick another name.` };
  const id = raw?.id && !isBuiltin(raw.id) ? String(raw.id) : `custom-${command}`;
  return { skill: { id, name, description, instructions, command, custom: true } };
}

// A skill as a SKILL.md file: a "---" header with name and description, then the instructions.
export function toSkillFile(skill) {
  const clean = value => String(value ?? "").replace(/\s+/g, " ").trim();
  return `---\nname: ${clean(skill.name)}\ndescription: ${clean(skill.description)}\n---\n\n${skill.instructions}\n`;
}

export function parseSkillFile(text) {
  const source = String(text ?? "").replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(source.trimStart());
  if (!match) return { name: "", description: "", instructions: source.trim() };
  const field = key => new RegExp(`^${key}:\\s*(.*)$`, "mi").exec(match[1])?.[1].trim().replace(/^["']|["']$/g, "") || "";
  return { name: field("name"), description: field("description"), instructions: match[2].trim() };
}

export const allSkills = custom => [...BUILTIN_SKILLS, ...(Array.isArray(custom) ? custom : [])];

export const findSkill = (custom, idOrCommand) => allSkills(custom).find(skill => skill.id === idOrCommand || (skill.command || skill.id) === idOrCommand);

// The ids that apply to a chat: always-on skills plus the ones switched on for that chat.
export function activeSkillIds(settings, chat) {
  return [...new Set([...(settings?.skillsOn || []), ...(chat?.skills || [])])];
}

// The text added to the system prompt. Longest-first trimming would surprise people, so skills
// are kept whole and in the order they were switched on, and the ones that do not fit are dropped.
export function skillsPrompt(settings, chat) {
  const picked = activeSkillIds(settings, chat).map(id => findSkill(settings?.skills, id)).filter(Boolean);
  if (!picked.length) return "";
  const lines = [];
  let used = 0;
  for (const skill of picked) {
    const line = `Skill "${skill.name}": ${skill.instructions}`;
    // Online skills run on a large model, so they are kept whole and do not use the small-model budget.
    if (!skill.online && used + line.length > PROMPT_BUDGET) break;
    lines.push(line);
    if (!skill.online) used += line.length;
  }
  return lines.length ? `Follow these skills the user switched on:\n${lines.join("\n")}` : "";
}

// The online skill switched on for this chat, if any. While one is on, replies come from the
// online model, not from the model on the device.
export function onlineSkill(settings, chat) {
  return activeSkillIds(settings, chat).map(id => findSkill(settings?.skills, id)).find(skill => skill?.online) || null;
}

// A short stable text for cache keys, so the prompt is rebuilt only when skills change.
export function skillsKey(settings, chat) {
  return activeSkillIds(settings, chat).map(id => {
    const skill = findSkill(settings?.skills, id);
    return skill ? `${skill.id}:${hashText(skill.instructions)}` : "";
  }).join(",");
}

function hashText(text) {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) hash = ((hash * 33) ^ text.charCodeAt(index)) >>> 0;
  return hash.toString(36);
}
