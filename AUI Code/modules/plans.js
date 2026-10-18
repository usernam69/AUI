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
