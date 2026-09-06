/**
 * # Kontoauszugsposition — die Ableitungen
 *
 * Bis 2026-09-06 lagen sie über `ui/` und `infrastructure/` verteilt, obwohl
 * keine davon eine Oberfläche oder eine Datenbank braucht (L-56). Eine
 * v3-Komponente konnte sich dort nicht bedienen und hat sie strukturell
 * deckungsgleich neu definiert.
 *
 * Hier stehen sie als das, was sie sind: reine Funktionen über einer
 * Auszugszeile. Keine React-Abhängigkeit, kein DB-Zugriff — spiegelbar.
 */
import { extractSepaTags, type SepaTags } from "../domain/sepa-tags";

/** ISO-20022-Zweckcodes, wie sie im `PURP`-Tag stehen. */
export const PURP_LABELS: Record<string, string> = {
  RINP: "wiederkehrende Rate",
  SALA: "Gehalt",
  TAXS: "Steuer",
  RENT: "Miete",
  SUPP: "Lieferantenzahlung",
  OTHR: "Sonstiges",
};

export interface PurposeRef {
  key: string;
  value: string;
  hint: string;
}

export interface PurposeParts {
  /** SVWZ-Freitext — nie der rohe Tag-Block. */
  text: string;
  refs: PurposeRef[];
  /** true, wenn ein Tag-Block erkannt wurde (→ Originalwert lohnt sich). */
  hadTags: boolean;
  /** Unveränderter Originalwert, wie er in der DB steht. */
  raw: string;
}

/**
 * Zerlegt einen Verwendungszweck in Anzeigeteile. `sepaTags` (beim Import
 * geparst, aus `raw_payload.parsed_sepa_tags`) gewinnt gegenüber dem
 * Nachparsen — ist aber optional, damit Aufrufer ohne diese Spalte die
 * Komponente trotzdem nutzen können.
 */
export function derivePurposeParts(
  purpose: string | null | undefined,
  sepaTags?: SepaTags | Record<string, string> | null,
): PurposeParts {
  const raw = purpose ?? "";
  const parsed = extractSepaTags(raw);
  const tags: Record<string, string | undefined> = { ...parsed.tags, ...(sepaTags ?? {}) };

  const refDefs: Array<[string, string | undefined, string]> = [
    ["EREF", tags.eref, "End-to-End-Referenz (oft die Rechnungsnummer)"],
    ["KREF", tags.kref, "Kundenreferenz"],
    ["MREF", tags.mref, "Lastschrift-Mandat"],
    ["CRED", tags.cred, "Gläubiger-ID"],
    [
      "PURP",
      tags.purp,
      tags.purp ? `${tags.purp} — ${PURP_LABELS[tags.purp] ?? "ISO-20022-Code"}` : "",
    ],
    ["OAMT", tags.oamt, "Originalbetrag"],
    ["ABWA", tags.abwa, "Abweichender Auftraggeber"],
  ];

  return {
    text: tags.svwz ?? parsed.text,
    refs: refDefs
      .filter((entry): entry is [string, string, string] => Boolean(entry[1]))
      .map(([key, value, hint]) => ({ key, value, hint })),
    hadTags: Object.keys(parsed.tags).length > 0 || Boolean(sepaTags),
    raw,
  };
}

/* ---- Zuordnungs-Zustand (Achse Z) --------------------------------------- */

/**
 * Wie weit eine Auszugszeile Sachverhalten zugeordnet ist.
 *
 * Z0 keiner · Z1 genau einer, Betrag erklärt · Z2 mehrere, Betrag erklärt ·
 * Z3 zugeordnet, aber ein Rest bleibt offen. Die Toleranz von einem halben
 * Cent fängt Rundung aus Teilbeträgen ab.
 */
export type ZState = "Z0" | "Z1" | "Z2" | "Z3";

export function deriveZ(row: { amount: string | number; allocatedSum: number; cases: unknown[] }): ZState {
  if (row.cases.length === 0) return "Z0";
  const explained = Math.abs(Math.abs(Number(row.amount)) - row.allocatedSum) < 0.005;
  if (explained) return row.cases.length === 1 ? "Z1" : "Z2";
  return "Z3";
}

/** Noch nicht zugeordneter Betrag der Zeile. */
export function restOf(row: { amount: string | number; allocatedSum: number }): number {
  return Math.abs(Number(row.amount)) - row.allocatedSum;
}

export type { SepaTags };
