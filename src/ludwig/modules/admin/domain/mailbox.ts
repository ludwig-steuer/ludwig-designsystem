/**
 * F262 — eine aus dem Mailprogramm kopierte Adresse in Adresse und Namen
 * zerlegen: „Amanda Mende <Mende@advicon.tax>", „Mende, Amanda <…>",
 * „"Mende, Amanda" <…>" oder die nackte Adresse. Gespeichert wird der Name
 * immer als „Vorname Nachname" (Owner-Entscheid).
 *
 * Ob die Adresse gültig ist, entscheidet weiter das Zod-Schema des Servers —
 * hier wird nur zerlegt, nicht geprüft.
 */
const MAILBOX = /^\s*(?:"?([^"<>]*?)"?\s*)?<\s*([^<>\s]+@[^<>\s]+)\s*>\s*$/;

function normalizeName(raw: string | undefined): string | null {
  const name = (raw ?? "").replace(/\s+/g, " ").trim();
  if (name === "") return null;
  const parts = name.split(",");
  // Genau ein Komma: „Nachname, Vorname". Mehr Kommas: nichts raten.
  if (parts.length !== 2) return name;
  const nachname = parts[0]!.trim();
  const vorname = parts[1]!.trim();
  if (nachname === "") return vorname || null;
  if (vorname === "") return nachname;
  return `${vorname} ${nachname}`;
}

export function parseMailbox(raw: string): { email: string; displayName: string | null } {
  const m = MAILBOX.exec(raw);
  if (!m) return { email: raw.trim().toLowerCase(), displayName: null };
  return { email: m[2]!.trim().toLowerCase(), displayName: normalizeName(m[1]) };
}
