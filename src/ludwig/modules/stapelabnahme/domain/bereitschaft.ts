/**
 * „Ist alles da?" als drei aufklappbare Zeilen (F109-1).
 *
 * Rein und ohne IO: die Funktion bekommt die beiden Gate-Ergebnisse des
 * Agenten (1a Kontoauszüge, 3f Belege) und schneidet sie in die drei Fragen,
 * die die Kanzlei tatsächlich stellt — Belege **dieser** Periode, Belege
 * **einschließlich Vorperioden**, Kontoauszüge. Die Gates bleiben die Quelle;
 * hier wird nur geteilt und eingefärbt, nie neu gerechnet.
 *
 * Farbe kodiert Kritikalität (A7), nicht Menge:
 *  - **rot** — offene Posten, die diesen Stapel blockieren.
 *  - **gelb** — offen, aber nicht aus dieser Periode (Altlast) bzw. ein
 *    Gate-Hinweis ohne Blocker (ruhendes Zahlungskonto).
 *  - **grün** — nichts offen.
 *
 * Deckungslücken kommen über `deckungsluecke.ts` in Worte (F141) — derselbe
 * Satz, den Schritt 8 zeigt.
 *
 * Die vierte Zeile kommt nicht aus einem Gate: Belege, die **ohne Buchung**
 * erledigt wurden. Für die Gates sind sie fertig — genau deshalb sieht sie
 * sonst niemand mehr, und genau deshalb stehen sie hier (gelb, nie rot).
 */

import { deckungsLueckeAus } from "./deckungsluecke";

export type BereitschaftsStand = "offen" | "hinweis" | "ok";

export interface BereitschaftsPunkt {
  key: string;
  /** Ziel für den Sprung in die Beleg-Ansicht; null bei Kontoauszügen. */
  sourceDocId: string | null;
  label: string;
  /** Belegdatum, ISO; null wo es keins gibt. */
  datum: string | null;
  problem: string;
  /** Ein Gate-Hinweis ohne Blocker steht in derselben Liste, aber gelb. */
  hinweis: boolean;
}

export interface BereitschaftsZeile {
  key: "belege_periode" | "belege_alle" | "auszuege" | "ohne_buchung";
  label: string;
  stand: BereitschaftsStand;
  /** „6 offen" bzw. „vollständig" — rechts in der Zeile. */
  standText: string;
  /** Was im aufgeklappten Zustand steht, wenn nichts offen ist. */
  leerText: string;
  punkte: BereitschaftsPunkt[];
  /** Über dem Listen-Deckel des Gates: so viele Posten fehlen in der Liste. */
  nichtGelistet: number;
  /** Belegzeilen tragen die Nachforderungs-Knöpfe. */
  belege: boolean;
}

/** Was die Funktion aus einem `StepGateStatus` braucht — mehr nicht. */
export interface GateEingang {
  openCount: number;
  open: Array<Record<string, unknown>>;
  warnings?: Array<Record<string, unknown>>;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function belegPunkt(o: Record<string, unknown>, i: number): BereitschaftsPunkt {
  return {
    key: str(o.sourceDocId) ?? `beleg-${i}`,
    sourceDocId: str(o.sourceDocId),
    label: str(o.fileName) ?? "Beleg ohne Dateiname",
    datum: str(o.docDate),
    problem: str(o.problem) ?? "",
    hinweis: false,
  };
}

function kontoPunkt(
  o: Record<string, unknown>,
  i: number,
  hinweis: boolean,
  periodTo: string,
): BereitschaftsPunkt {
  return {
    key: `konto-${hinweis ? "w" : "o"}-${i}`,
    sourceDocId: null,
    label: str(o.label) ?? str(o.accountNumber) ?? str(o.name) ?? "—",
    datum: null,
    // Blocker tragen `problem`, Gate-Warnungen `warning` — ohne das zweite
    // stand hier ein leerer Hinweis (F141).
    problem: deckungsLueckeAus(o, periodTo)?.text ?? str(o.problem) ?? str(o.warning) ?? "",
    hinweis,
  };
}

function zahl(n: number, gedeckelt: boolean): string {
  if (n === 0) return "vollständig";
  return `${gedeckelt ? "mind. " : ""}${n} offen`;
}

export function bereitschaftsZeilen(
  gate1a: GateEingang,
  gate3f: GateEingang,
  periodFrom: string,
  periodTo: string,
  /** Belege, die ohne Buchung erledigt wurden (`application/belege-ohne-buchung.ts`). */
  ohneBuchung: { punkte: BereitschaftsPunkt[]; total: number } = { punkte: [], total: 0 },
): BereitschaftsZeile[] {
  const belege = gate3f.open.map(belegPunkt);
  // Der Gate-Zähler ist ungedeckelt, die Liste nicht. Die Aufteilung kann
  // deshalb nur zählen, was geliefert wurde — das sagt die Zeile dann auch.
  const nichtGelistet = Math.max(0, gate3f.openCount - gate3f.open.length);
  const periode = belege.filter((p) => p.datum != null && p.datum >= periodFrom);
  const nurAltlast = periode.length === 0 && gate3f.openCount > 0;

  const auszugPunkte = [
    ...gate1a.open.map((o, i) => kontoPunkt(o, i, false, periodTo)),
    ...(gate1a.warnings ?? []).map((o, i) => kontoPunkt(o, i, true, periodTo)),
  ];

  return [
    {
      key: "belege_periode",
      label: "Alle Belege der Periode erledigt",
      stand: periode.length > 0 ? "offen" : nurAltlast ? "hinweis" : "ok",
      standText: zahl(periode.length, nichtGelistet > 0),
      leerText: nurAltlast
        ? "In dieser Periode ist jeder Beleg abgeschlossen — offen ist nur Älteres (Zeile darunter)."
        : "Jeder Beleg mit Datum in dieser Periode ist abgeschlossen.",
      punkte: periode,
      nichtGelistet,
      belege: true,
    },
    {
      key: "belege_alle",
      label: "Alle Belege einschließlich Vorperioden erledigt",
      stand: gate3f.openCount === 0 ? "ok" : periode.length > 0 ? "offen" : "hinweis",
      standText: zahl(gate3f.openCount, false),
      leerText: "Jeder Beleg bis zum Ende des Zeitraums ist abgeschlossen.",
      punkte: belege,
      nichtGelistet,
      belege: true,
    },
    {
      key: "auszuege",
      label: "Alle Kontoauszüge erledigt",
      stand:
        gate1a.openCount > 0 ? "offen" : (gate1a.warnings?.length ?? 0) > 0 ? "hinweis" : "ok",
      standText: zahl(gate1a.openCount, gate1a.openCount > gate1a.open.length),
      leerText: "Jedes aktive Zahlungskonto deckt den Zeitraum ab, der Saldenanschluss stimmt.",
      punkte: auszugPunkte,
      nichtGelistet: Math.max(0, gate1a.openCount - gate1a.open.length),
      belege: false,
    },
    {
      key: "ohne_buchung",
      label: "Belege ohne Buchung — mit Begründung erledigt",
      // Nie rot: hier fehlt nichts, hier wurde entschieden. Aber gesehen
      // werden soll die Entscheidung (Owner 2026-09-08).
      stand: ohneBuchung.total > 0 ? "hinweis" : "ok",
      standText: ohneBuchung.total === 0 ? "keine" : `${ohneBuchung.total} Beleg(e)`,
      leerText: "Jeder erledigte Beleg dieses Zeitraums trägt eine Buchung.",
      punkte: ohneBuchung.punkte,
      nichtGelistet: Math.max(0, ohneBuchung.total - ohneBuchung.punkte.length),
      belege: false,
    },
  ];
}
