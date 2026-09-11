/**
 * Wie eine offene Gate-Zeile in der Abnahme gelesen wird (F123 §6).
 *
 * Die Gates liefern **rohe Objekte** in unterschiedlicher Form: Gate 2a nennt
 * die Bankzeile `bankTransactionId`, Gate 4d nennt sie `transactionId`; die
 * einen tragen `amount` als Zahl, die anderen als String aus dem
 * `numeric`-Cast; manche haben ein `problem`, andere nicht.
 *
 * Bis F123 las Schritt 4 nur eine der beiden Schreibweisen — der Drawer-Link
 * entstand für 2a-Zeilen deshalb **nie**, Beträge standen als „—" da, und wo
 * `problem` fehlte, landete das rohe JSON in der Spalte. Drei Fehler mit
 * derselben Ursache: die Zeile wurde geraten statt gelesen.
 *
 * Rein und ohne IO — deshalb testbar.
 */

export interface GateZeile {
  /** Die Bankzeile, wenn es eine gibt — für den Kontoauszug-Drawer. */
  transactionId: string | null;
  /** Was in der ersten Spalte steht. Nie leer. */
  label: string;
  /** Betrag als Zahl, egal wie das Gate ihn geliefert hat. */
  amount: number | null;
  /** Was an der Zeile fehlt — in Worten, nie als JSON. */
  problem: string;
  /** Die Befundart, wie das Gate sie benennt (`kind`); null, wenn keine da ist. */
  kind: string | null;
  /** Verrechnungskonto-Kategorie bei `clearing_balance` (Gate 4d); sonst null. */
  clearingAccountType: string | null;
}

/**
 * Befunde, die die Abnahme als **Hinweis** zeigt statt als Mangel
 * (Owner-Entscheid 2026-09-08):
 *
 *  - `clearing_balance` — ein Verrechnungskonto steht nicht auf null. Ein
 *    Saldo will angesehen werden, aber er macht den Stapel nicht falsch.
 *    **Außer Zentralregulierung** (`central_settlement`, F206, Owner
 *    2026-09-10): dort geht jede Abrechnung auf null auf, ein Saldo heißt,
 *    eine Abrechnung ist nicht aufgelöst — bei 10160 hat das die Kanzlei
 *    gemerkt, nicht Ludwig. Quittiert wird er wie jeder Mangel.
 *
 * Für den **Agenten** bleibt der Befund Arbeitsauftrag: die Gates rechnen
 * unverändert, nur die Kanzlei-Ansicht stuft sie ein.
 *
 * `expected_payment_missing` stand hier bis zum 08.09.2026 daneben. Die
 * ausgebliebene erwartete Zahlung ist seither überhaupt kein Gate-Befund mehr,
 * sondern ein gewöhnlicher offener Posten (`sachverhalt.md` S18) — sie steht
 * in Schritt 5 bei den offenen Posten und wird nirgends quittiert.
 */
export function isHinweis(befund: { kind: string | null; clearingAccountType?: string | null }): boolean {
  return befund.kind === "clearing_balance" && befund.clearingAccountType !== "central_settlement";
}

/**
 * Befundarten, die in der Abnahme **nichts** zu suchen haben: Gate 4d fasst
 * die Ergebnisse anderer Gates noch einmal zusammen („Details: Gate 2a"). In
 * der Abnahme hat jedes dieser Gates einen eigenen Schritt mit der vollen
 * Liste — die Zusammenfassung wäre eine Dublette ohne Gegenstand und ohne
 * Betrag.
 */
export const DUBLETTEN_ARTEN = new Set(["summary"]);

export interface GeteilteBefunde {
  /** Was den Stapel wirklich aufhält. */
  maengel: GateZeile[];
  /** Was gesehen werden will, aber nicht blockiert. */
  hinweise: GateZeile[];
}

/**
 * Ist dieser Befund ein Mangel? Alles ohne bekannte Art ist einer — eine Zeile
 * verschwindet nie, nur weil sie unbenannt ist.
 */
export function istMangel(raw: unknown): boolean {
  const z = leseGateZeile(raw);
  if (z.kind === null) return true;
  return !isHinweis(z) && !DUBLETTEN_ARTEN.has(z.kind);
}

/**
 * Ein Gate-Ergebnis in Mängel und Hinweise teilen. Zusammenfassungszeilen
 * fallen weg.
 */
export function teileGateBefunde(open: readonly unknown[]): GeteilteBefunde {
  const maengel: GateZeile[] = [];
  const hinweise: GateZeile[] = [];
  for (const raw of open) {
    const z = leseGateZeile(raw);
    if (z.kind !== null && DUBLETTEN_ARTEN.has(z.kind)) continue;
    (isHinweis(z) ? hinweise : maengel).push(z);
  }
  return { maengel, hinweise };
}

/** `"1.234,50"`, `"1234.50"` und `1234.5` ergeben alle dieselbe Zahl. */
export function leseBetrag(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  // Numeric-Casts aus Postgres kommen als `"1234.50"`, deutsche Formate als
  // `"1.234,50"`. Das Komma entscheidet.
  const normalisiert = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  const n = Number(normalisiert);
  return Number.isFinite(n) ? n : null;
}

function ersterText(o: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim() !== "") return v;
    if (typeof v === "number") return String(v);
  }
  return null;
}

export function leseGateZeile(raw: unknown): GateZeile {
  const o = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;

  // Beide Schreibweisen — Gate 2a und Gate 4d benennen dieselbe Sache anders.
  const tx = ersterText(o, ["transactionId", "bankTransactionId"]);

  // Ein Konto ist seine Nummer UND sein Name — „1590" allein sagt der
  // Buchhalterin nicht, was sie ansehen soll (Owner 2026-09-08).
  const kontoName = ersterText(o, ["accountName"]);
  const kontoNummer = ersterText(o, ["accountNumber"]);
  const label =
    (kontoNummer !== null && kontoName !== null ? `${kontoNummer} · ${kontoName}` : null) ??
    ersterText(o, [
      "label",
      "accountNumber",
      "caseNumber",
      "name",
      "postingDate",
      "title",
      "fileName",
    ]) ??
    "—";

  const amount = leseBetrag(o.amount ?? o.balance ?? o.rest ?? o.openAmount);

  // Ohne `problem` sagt die Zeile, was sie hat — nie das rohe Objekt. Ein
  // JSON-Dump in der Spalte ist für die Prüferin keine Auskunft.
  const problem =
    ersterText(o, ["problem", "reason", "note", "blockedReason"]) ??
    (tx ? "Auszugszeile ohne Sachverhalt." : "Ohne nähere Angabe des Gates.");

  return {
    transactionId: tx,
    label,
    amount,
    problem,
    kind: ersterText(o, ["kind"]),
    clearingAccountType: ersterText(o, ["clearingAccountType"]),
  };
}
