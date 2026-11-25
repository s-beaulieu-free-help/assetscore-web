const blocked = [
  "fuck",
  "fucking",
  "fucked",
  "fucker",
  "motherfucker",
  "shit",
  "bullshit",
  "bitch",
  "asshole",
  "bastard",
  "cunt",
  "dick",
  "dickhead",
  "pussy",
  "whore",
  "slut",
  "nigger",
  "nigga",
  "faggot",
  "retard",
  "putain",
  "merde",
  "connard",
  "connasse",
  "salope",
  "encule",
  "enculé",
  "nique",
  "niquer",
  "foutre",
  "pute",
  "batard",
  "bâtard",
  "salaud",
];

const rejection =
  "This review was rejected because it includes profanity or an insult. Criticism of a company, its numbers, or its outlook is allowed. Edit the wording and submit it again.";

function tokens(value: string) {
  return value
    .toLowerCase()
    .replace(/[@]/g, "a")
    .replace(/[0]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[$]/g, "s")
    .replace(/[*'.\-_]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z]+/)
    .filter(Boolean);
}

const blockedTokens = new Set(blocked.flatMap((word) => tokens(word)));

export function reviewRejectionReason(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  if (!text) return null;
  const found = tokens(text).some((token) => blockedTokens.has(token));
  return found ? rejection : null;
}
