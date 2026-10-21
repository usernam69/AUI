// AUI's plans. The model runs on the user's own device, so the plans change the app around
// it (how many custom skills fit, a badge) and nothing about the AI itself. The checkout is
// a demo: it checks the card with the Luhn test and takes no money.

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    blurb: "Everything you need to chat.",
    perks: ["On-device AI chat, unlimited", "All model sizes", "Built-in skills", "3 custom skills"],
    customSkills: 3
  },
  {
    id: "student",
    name: "Student",
    price: 4,
    blurb: "For people in school.",
    perks: ["Everything in Free", "8 custom skills", "Student badge on your profile", "Needs a school email"],
    customSkills: 8,
    school: true
  },
  {
    id: "plus",
    name: "Plus",
    price: 8,
    blurb: "For people who use AUI every day.",
    perks: ["Everything in Free", "15 custom skills", "Plus badge on your profile"],
    customSkills: 15
  },
  {
    id: "pro",
    name: "Pro",
    price: 20,
    blurb: "For building your own toolkit.",
    perks: ["Everything in Plus", "Unlimited custom skills", "Pro badge on your profile"],
    customSkills: Infinity
  }
];

// A school address ends like one: .edu, .ac.uk, .edu.au, .k12.ca.us, .sch.uk and similar. This is a demo
// check on the spelling of the address only. No message is sent, so it cannot show the mailbox is yours.
const SCHOOL_ENDINGS = /(\.edu|\.edu\.[a-z]{2}|\.ac\.[a-z]{2}|\.k12\.[a-z]{2}\.us|\.sch\.[a-z]{2}|\.school\.[a-z]{2,})$/i;
export function schoolEmailProblem(value) {
  const email = String(value ?? "").trim();
  if (!email) return "Enter your school email.";
  const match = /^[^\s@]+@([^\s@]+)$/.exec(email);
  if (!match || email.length > 120) return "That doesn't look like an email address.";
  if (!SCHOOL_ENDINGS.test(match[1])) return "That address doesn't end like a school address (for example .edu or .ac.uk).";
  return "";
}

export const planById = id => PLANS.find(plan => plan.id === id) || PLANS[0];

export const customSkillLimit = id => planById(id).customSkills;

export const priceLabel = plan => (plan.price ? `$${plan.price}/month` : "Free");

// What settings keep about a plan. The card number is never part of it.
export function planRecord(planId, card) {
  const plan = planById(planId);
  if (plan.id === "free") return { plan: "free", planCard: null, planSince: null };
  return {
    plan: plan.id,
    planCard: card ? { brand: String(card.brand || "card").slice(0, 20), last4: String(card.last4 || "").replace(/\D/g, "").slice(-4) } : null,
    planSince: new Date().toISOString()
  };
}
