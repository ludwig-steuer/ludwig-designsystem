/**
 * SEPA / MT940-Verwendungszweck-Tags. Banken packen mehrere
 * Pflichtfelder in das einzige Verwendungszweck-Feld und kennzeichnen
 * sie mit 4-stelligen Prefixen (`TAG+wert`). Beispiel aus einem
 * VR-Bank-Export:
 *
 *   EREF+0600496348            MREF+D-VR-50411866-0-001
 *   CRED+DE87ZZZ00000001701    PURP+OTHR andere
 *   OAMT+1596,88               SVWZ+Kd-Nr. 5465260 Vertrag
 *   50411866 Rate 12.2024
 *
 * Wir extrahieren die strukturierten Tags und geben zusätzlich den
 * reinen SVWZ-Text zurück (Freitext, falls vorhanden — sonst Fallback
 * auf den gesamten Block).
 *
 * Bedeutung:
 *  - SVWZ: Eigentlicher Freitext-Verwendungszweck
 *  - EREF: End-to-End-Referenz (Rechnungs-Nr.) — wichtig für späteres Beleg-Matching
 *  - MREF: SEPA-Mandats-Referenz (Lastschrift)
 *  - CRED: SEPA-Creditor-ID (Lastschrift-Gläubiger, DE…ZZZ…)
 *  - KREF: Kunden-Referenz (Daueraufträge)
 *  - PURP: ISO-20022 Purpose-Code (4 Letter, z.B. OTHR, RINP, SALA, TAXS)
 *  - OAMT: Original-Amount (z.B. bei Sammlern oder FX-Umrechnung)
 *  - SVWZ-Folgezeilen / unkategorisierter Schwanz: an SVWZ angehängt
 *
 * Wir matchen Tags **anker-basiert** (lookahead bis zum nächsten Tag
 * oder Stringende) und tolerieren Newlines + multiple Whitespaces
 * mitten im Wert — Banken brechen 27-Zeichen-Felder beliebig um.
 */

const KNOWN_TAGS = ["SVWZ", "EREF", "MREF", "CRED", "KREF", "PURP", "OAMT", "ABWA"] as const;
type SepaTagKey = (typeof KNOWN_TAGS)[number];

export interface SepaTags {
  svwz?: string;
  eref?: string;
  mref?: string;
  cred?: string;
  kref?: string;
  purp?: string;
  oamt?: string;
  /** Abweichender Auftraggeber. */
  abwa?: string;
}

/**
 * Zerlegt einen Verwendungszweck-Block in strukturierte Tags + den
 * eigentlichen SVWZ-Freitext. Wenn kein Tag erkannt wird (z.B. weil
 * der Block schon vorab gestripped wurde), gibt `text` den gesamten
 * getrimmten Input zurück und `tags` ist leer.
 */
export function extractSepaTags(input: string): { text: string; tags: SepaTags } {
  if (!input) return { text: "", tags: {} };

  // Reguläres Pattern: `TAG+`, gefolgt von Wert bis zum nächsten bekannten
  // Tag oder Stringende. Der Lookahead erlaubt optionalen Whitespace vor dem
  // Folge-Tag — manche Banken (Commerzbank-CSV, Staging-Beispiele) kleben
  // die Tags OHNE Trenner aneinander (`EREF+…KREF+NONREFSVWZ+…`).
  const tagAlternation = KNOWN_TAGS.join("|");
  const tagRegex = new RegExp(
    `(${tagAlternation})\\+([\\s\\S]*?)(?=\\s*(?:${tagAlternation})\\+|$)`,
    "g",
  );

  const tags: Partial<Record<SepaTagKey, string>> = {};
  let hasMatch = false;
  for (const m of input.matchAll(tagRegex)) {
    const key = m[1] as SepaTagKey;
    const value = collapseWhitespace(m[2] ?? "");
    if (value.length > 0 && tags[key] === undefined) {
      tags[key] = value;
      hasMatch = true;
    }
  }

  if (!hasMatch) {
    return { text: collapseWhitespace(input), tags: {} };
  }

  const svwz = tags.SVWZ ?? "";
  const result: SepaTags = {};
  if (tags.SVWZ) result.svwz = tags.SVWZ;
  if (tags.EREF) result.eref = tags.EREF;
  if (tags.MREF) result.mref = tags.MREF;
  if (tags.CRED) result.cred = tags.CRED;
  if (tags.KREF) result.kref = tags.KREF;
  if (tags.PURP) result.purp = tags.PURP;
  if (tags.OAMT) result.oamt = tags.OAMT;
  if (tags.ABWA) result.abwa = tags.ABWA;

  // `text` ist primär für `client_bank_transactions.purpose` gedacht:
  // wenn SVWZ vorhanden, nur den Freitext; sonst Fallback auf den
  // gesamten kollabierten Block.
  const text = svwz || collapseWhitespace(input);
  return { text, tags: result };
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
