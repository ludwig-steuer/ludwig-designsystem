import { randomBytes } from "node:crypto";

/**
 * Opake, mandantenübergreifend eindeutige Roundtrip-Referenz für den
 * DATEV-Export (`client_journal_entry.export_ref`, exportiert als
 * Zusatzinformation 2 „LudwigAI-Ref"). Sie macht den Rückweg von einer
 * DATEV-Zeile auf DIE EINE Ludwig-Buchung eindeutig — der Sachverhalts-Match
 * (Zusatzinfo 1) reicht nicht, weil an einem Sachverhalt mehrere Buchungen
 * hängen (Sollstellung, Zahlung, Storno).
 *
 * Bewusst NICHT die interne UUID: interne Schlüssel gehören nicht in den
 * externen DATEV-Contract (decision-log 2026-07-28). Eigene, opake Identität.
 *
 * Format: „LW-" + 8 Zeichen Crockford-Base32 (ohne I/L/O/U — nicht mit 1/0
 * verwechselbar). Entropie 32^8 = 2^40 ≈ 1,1·10¹²; Kollision praktisch
 * ausgeschlossen, der Unique-Index + Retry beim Vergeben ist das Netz. Rein
 * zufällig, nicht fortlaufend (Owner-Wunsch 2026-07-28).
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford-Base32, 32 Zeichen
const REF_LENGTH = 8;

/** Prüfmuster für eine gültige Export-Referenz (Format-Guard/Tests). */
export const EXPORT_REF_PATTERN = /^LW-[0-9A-HJKMNP-TV-Z]{8}$/;

export function generateExportRef(): string {
  const bytes = randomBytes(REF_LENGTH);
  let code = "";
  // 256 = 8×32 → `& 31` ist über 0..31 gleichverteilt, kein Modulo-Bias.
  for (let i = 0; i < REF_LENGTH; i++) code += ALPHABET[bytes[i]! & 31];
  return `LW-${code}`;
}

/**
 * Beide Rückkanal-Werte teilen sich EINE Zusatzinformation.
 *
 * DATEV liefert im Read nur eine ZI zurück (einzelnes Objekt statt Array,
 * `api-verhalten.md`) — und das war ausgerechnet ZI 1, die Sachverhaltsnummer,
 * die nach einem Reset neu vergeben wird und damit kein Identifikator ist. Die
 * Ref wäre einer, kam aber nie an: `ludwig_export_ref` war bei 0 von 550
 * Spiegelzeilen befüllt. Seit 2026-08-28 stehen deshalb beide Werte in ZI 1,
 * getrennt durch `|` (`2026-0007|LW-AAAA0001`).
 *
 * Der Trenner ist sicher: die Nummer besteht aus Ziffern und einem Bindestrich,
 * die Ref aus `LW-` + Crockford-Base32. `MAX_ZUSATZINFO_INHALT` ist 210 Zeichen,
 * gebraucht werden ~21.
 */
const ZI_SEPARATOR = "|";

/** `2026-0007` + `LW-AAAA0001` → `2026-0007|LW-AAAA0001`. Fehlt eine Hälfte, steht die andere allein. */
export function formatLudwigZusatzinfo(
  caseNumber: string | null | undefined,
  exportRef: string | null | undefined,
): string | null {
  if (caseNumber && exportRef) return `${caseNumber}${ZI_SEPARATOR}${exportRef}`;
  return caseNumber || exportRef || null;
}

/**
 * Gegenstück zu `formatLudwigZusatzinfo`. Liest auch den **Altbestand ohne
 * Trenner** — dort steht entweder die blanke Nummer (ZI 1 alt) oder die blanke
 * Ref (ZI 2 alt); welche von beiden, entscheidet das Ref-Format.
 */
export function parseLudwigZusatzinfo(content: string | null | undefined): {
  caseNumber: string | null;
  exportRef: string | null;
} {
  const raw = content?.trim();
  if (!raw) return { caseNumber: null, exportRef: null };
  const sep = raw.indexOf(ZI_SEPARATOR);
  if (sep >= 0) {
    return {
      caseNumber: raw.slice(0, sep).trim() || null,
      exportRef: raw.slice(sep + 1).trim() || null,
    };
  }
  return EXPORT_REF_PATTERN.test(raw)
    ? { caseNumber: null, exportRef: raw }
    : { caseNumber: raw, exportRef: null };
}
