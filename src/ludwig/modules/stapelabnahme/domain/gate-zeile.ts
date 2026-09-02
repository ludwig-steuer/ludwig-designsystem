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

  const label =
    ersterText(o, [
      "label",
      "accountNumber",
      "caseNumber",
      "name",
      "postingDate",
      "title",
      "fileName",
    ]) ?? "—";

  const amount = leseBetrag(o.amount ?? o.balance ?? o.rest ?? o.openAmount);

  // Ohne `problem` sagt die Zeile, was sie hat — nie das rohe Objekt. Ein
  // JSON-Dump in der Spalte ist für die Prüferin keine Auskunft.
  const problem =
    ersterText(o, ["problem", "reason", "note", "blockedReason"]) ??
    (tx ? "Auszugszeile ohne Sachverhalt." : "Ohne nähere Angabe des Gates.");

  return { transactionId: tx, label, amount, problem };
}
