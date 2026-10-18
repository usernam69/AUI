// Card-number checks for the demo checkout. AUI takes no payment: a card only has to look
// valid (right length, known network prefix, Luhn checksum, unexpired). Nothing here is sent
// anywhere, and callers must not store more than the brand and the last four digits.

export const digitsOnly = value => String(value ?? "").replace(/\D/g, "");

// The Luhn checksum: from the right, double every second digit, subtract 9 from any result
// over 9, and the total must be a multiple of 10.
export function luhnValid(value) {
  const digits = digitsOnly(value);
  if (digits.length < 12 || /^0+$/.test(digits)) return false;
  let sum = 0;
  for (let index = 0; index < digits.length; index += 1) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

// Networks, most specific first. `lengths` are the card lengths each network issues.
const BRANDS = [
  { id: "amex", label: "American Express", pattern: /^3[47]/, lengths: [15], cvc: 4, groups: [4, 6, 5] },
  { id: "visa", label: "Visa", pattern: /^4/, lengths: [13, 16, 19], cvc: 3 },
  { id: "mastercard", label: "Mastercard", pattern: /^(5[1-5]|2(2[2-9]\d|[3-6]\d\d|7[01]\d|720))/, lengths: [16], cvc: 3 },
  { id: "discover", label: "Discover", pattern: /^(6011|65|64[4-9])/, lengths: [16, 17, 18, 19], cvc: 3 },
  { id: "diners", label: "Diners Club", pattern: /^(36|30[0-5]|3095|38|39)/, lengths: [14, 15, 16, 17, 18, 19], cvc: 3 },
  { id: "jcb", label: "JCB", pattern: /^35(2[89]|[3-8])/, lengths: [16, 17, 18, 19], cvc: 3 },
  { id: "unionpay", label: "UnionPay", pattern: /^62/, lengths: [16, 17, 18, 19], cvc: 3 },
  { id: "maestro", label: "Maestro", pattern: /^(50|5[6-9]|6)/, lengths: [12, 13, 14, 15, 16, 17, 18, 19], cvc: 3 }
];

export function cardBrand(value) {
  const digits = digitsOnly(value);
  return BRANDS.find(brand => brand.pattern.test(digits)) || null;
}

// 4242 4242 4242 4242, or 3782 822463 10005 for American Express.
export function formatCardNumber(value) {
  const digits = digitsOnly(value).slice(0, 19);
  const groups = cardBrand(digits)?.groups || [4, 4, 4, 4, 4];
  const parts = [];
  let position = 0;
  for (const size of groups) {
    if (position >= digits.length) break;
    parts.push(digits.slice(position, position + size));
    position += size;
  }
  return parts.join(" ");
}

// "1/30", "01/30" and "01/2030" are all fine. The card is good through the end of that month.
export function parseExpiry(value) {
  const match = /^\s*(\d{1,2})\s*[/\-]?\s*(\d{2}|\d{4})\s*$/.exec(String(value ?? ""));
  if (!match) return null;
  const month = Number(match[1]);
  const year = match[2].length === 2 ? 2000 + Number(match[2]) : Number(match[2]);
  return month >= 1 && month <= 12 ? { month, year } : null;
}

export function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length < 2) return digits;
  // A first digit above 1 can only be a single-digit month, so "3" becomes "03".
  if (digits.length === 2 && Number(digits) > 12) return `0${digits[0]}/${digits[1]}`;
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function expiryProblem(value, now = new Date()) {
  const expiry = parseExpiry(value);
  if (!expiry) return "Use MM/YY, like 08/29.";
  if (expiry.year < now.getFullYear() || (expiry.year === now.getFullYear() && expiry.month < now.getMonth() + 1)) return "This card has expired.";
  if (expiry.year > now.getFullYear() + 20) return "That expiry date is too far away.";
  return "";
}

export function cvcProblem(value, number = "") {
  const digits = String(value ?? "").trim();
  const length = cardBrand(number)?.cvc || 3;
  return new RegExp(`^\\d{${length}}$`).test(digits) ? "" : `The security code is ${length} digits.`;
}

export function numberProblem(value) {
  const digits = digitsOnly(value);
  if (!digits) return "Enter the card number.";
  const brand = cardBrand(digits);
  if (brand && !brand.lengths.includes(digits.length)) return `${brand.label} cards have ${brand.lengths.length === 1 ? brand.lengths[0] : `${brand.lengths[0]}–${brand.lengths.at(-1)}`} digits.`;
  if (!brand && (digits.length < 13 || digits.length > 19)) return "Card numbers have 13 to 19 digits.";
  return luhnValid(digits) ? "" : "This card number isn't valid. Check for a typo.";
}

// The whole form. `last4` and `brand` are the only parts that may be kept afterwards.
export function checkCard({ number, expiry, cvc }, now = new Date()) {
  const errors = {};
  const numberError = numberProblem(number);
  if (numberError) errors.number = numberError;
  const expiryError = expiryProblem(expiry, now);
  if (expiryError) errors.expiry = expiryError;
  const cvcError = cvcProblem(cvc, number);
  if (cvcError) errors.cvc = cvcError;
  const digits = digitsOnly(number);
  return {
    ok: !Object.keys(errors).length,
    errors,
    brand: cardBrand(digits)?.id || "card",
    brandLabel: cardBrand(digits)?.label || "Card",
    last4: digits.slice(-4)
  };
}
