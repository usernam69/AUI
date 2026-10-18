// Skills: short sets of instructions that change how AUI answers. A skill is turned on for one
// chat (or always) and its instructions join the system prompt. The small on-device models
// have limited room, so each skill and the total are capped.

export const MAX_NAME = 40;
export const MAX_DESCRIPTION = 140;
export const MAX_INSTRUCTIONS = 1200;
export const PROMPT_BUDGET = 1600;

export const BUILTIN_SKILLS = [
  { id: "summarize", name: "Summarizer", description: "Boil long text down to the key points.", instructions: "Summarize what the user gives you. Start with one sentence stating the main point, then list at most five bullet points with the key facts. Keep names, numbers and dates exact. Do not add opinions." },
  { id: "eli5", name: "Explain simply", description: "Plain words, short sentences, a small example.", instructions: "Explain things the way you would to a curious ten-year-old. Use everyday words and short sentences. Give one concrete example or comparison. Avoid jargon; if you must use a technical word, explain it right away." },
  { id: "proofread", name: "Proofreader", description: "Fix spelling and grammar, show what changed.", instructions: "Proofread the user's text. First give the corrected text. Then list each change on its own line as: old → new, with a few words on why. Keep the writer's voice and meaning. Do not rewrite sentences that are already correct." },
  { id: "translate", name: "Translator", description: "Translate and keep the tone.", instructions: "Translate the user's text. If they name a language, use it; otherwise translate into English, or into Spanish if the text is already English. Keep the tone, names and formatting. Give only the translation, then one short note if a phrase has no direct equivalent." },
  { id: "review", name: "Code reviewer", description: "Find bugs and risks before you ship.", instructions: "Review the code the user gives you. List real problems first: bugs, crashes, security holes, wrong edge cases. For each, say where it is, what goes wrong, and show the fix. Then mention at most three smaller improvements. Skip style nitpicks. If the code looks fine, say so." },
  { id: "tutor", name: "Study tutor", description: "Teaches with questions instead of answers.", instructions: "Act as a patient tutor. Do not give the final answer straight away. Explain the idea in two or three sentences, then ask one question that makes the student take the next step. If they are stuck, give a hint, not the answer. Praise correct reasoning briefly." },
  { id: "brainstorm", name: "Brainstormer", description: "Plenty of ideas, then a pick.", instructions: "Brainstorm. Give 8 varied ideas as a numbered list, one line each, from safe to surprising. Do not judge them while listing. At the end, pick the one you would try first and say why in one sentence." },
  { id: "email", name: "Email writer", description: "Clear, polite emails that get answered.", instructions: "Write the email the user describes. Give a subject line, then the body. Keep it short: lead with the request or the news, add the needed detail, end with a clear next step. Match the tone they ask for; default to friendly and professional." },
  { id: "notes", name: "Meeting notes", description: "Turn rough notes into decisions and tasks.", instructions: "Turn the user's rough notes into tidy meeting notes with three sections: Decisions, Action items (who and what, with a due date if given), and Open questions. Use short bullets. Do not invent anything that is not in the notes." },
  { id: "debug", name: "Debugger", description: "Work out why something is failing.", instructions: "Help debug the problem. Restate the symptom in one line. Give the most likely cause first, then up to two others. For each, say how to check it. End with the smallest change that should fix the most likely cause. Ask for the error message or code if you do not have it." },
  { id: "decide", name: "Decision helper", description: "Pros, cons and a recommendation.", instructions: "Help the user decide. List the options, then pros and cons for each as short bullets. Point out what matters most given what they told you. End with a clear recommendation and the one thing that would change it." },
  { id: "rewrite", name: "Rewriter", description: "Same message, different tone.", instructions: "Rewrite the user's text in the tone they ask for (for example formal, friendly, shorter, bolder). Keep every fact and the meaning. Give only the rewritten text unless they ask for options; if they do, give three labelled versions." }
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
    if (used + line.length > PROMPT_BUDGET) break;
    lines.push(line);
    used += line.length;
  }
  return lines.length ? `Follow these skills the user switched on:\n${lines.join("\n")}` : "";
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
