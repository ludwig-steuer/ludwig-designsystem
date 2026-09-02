/**
 * Deterministische Richtungszeile für Beleg-Zusammenfassungen.
 *
 * Owner-Entscheid 2026-08-14: Die Classifier-`summary` ist Orientierungs-Info
 * und darf keine Richtungsaussagen mehr enthalten (das billige Modell hat bei
 * drei SCV-Ausgangsrechnungen die Richtung erfunden — bei 20.000 EUR hätte das
 * Erlös zu Aufwand gedreht). Die Richtung wird deshalb überall dort, wo die
 * Zusammenfassung dem Buchungsagenten oder der UI präsentiert wird, aus den
 * VERIFIZIERTEN strukturierten Feldern gerendert: `doc_direction`
 * (deterministisch über UStID-/Namens-Abgleich aufgelöst) plus Gegenpartei.
 *
 * Prinzip: fehlt `doc_direction` oder ist es nicht incoming/outgoing, gibt
 * es KEINE Richtungszeile — lieber nichts als geraten.
 */

export interface DocDirectionLineInput {
  /** Verifiziertes `doc_direction` des Invoice-Subtyps: 'inbound' | 'outbound'. */
  docDirection: string | null | undefined;
  /** Aussteller laut Extraktion (bei incoming die Gegenpartei). */
  vendorName?: string | null;
  /** Empfänger laut Extraktion (bei outgoing die Gegenpartei). */
  customerName?: string | null;
  /** Brutto-Betrag (Zahl oder SQL-String). */
  amount?: number | string | null;
  currency?: string | null;
}

const AMOUNT_FMT = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Rendert z.B. `Eingangsrechnung von Telekom · 119,00 EUR` bzw.
 * `Ausgangsrechnung an Certina Management · 20.000,00 EUR`.
 *
 * `null` wenn keine verifizierte Richtung vorliegt (doc_direction fehlt oder
 * ist weder incoming noch outgoing). Gegenpartei/Betrag sind optional — was
 * fehlt, wird weggelassen, nie geraten.
 */
export function renderDocDirectionLine(input: DocDirectionLineInput): string | null {
  const role = input.docDirection;
  if (role !== "inbound" && role !== "outbound") return null;

  const counterparty =
    role === "inbound"
      ? clean(input.vendorName)
      : clean(input.customerName);

  let line =
    role === "inbound"
      ? counterparty
        ? `Eingangsrechnung von ${counterparty}`
        : "Eingangsrechnung"
      : counterparty
        ? `Ausgangsrechnung an ${counterparty}`
        : "Ausgangsrechnung";

  const amount = toNumber(input.amount);
  if (amount != null) {
    line += ` · ${AMOUNT_FMT.format(amount)} ${clean(input.currency) ?? "EUR"}`;
  }
  return line;
}

/**
 * Stellt die Richtungszeile einer (Classifier-)Zusammenfassung voran.
 * Ohne verifizierte Richtung kommt die Zusammenfassung unverändert zurück;
 * ohne Zusammenfassung steht die Richtungszeile allein.
 */
export function prefixSummaryWithDirectionLine(
  summary: string | null | undefined,
  input: DocDirectionLineInput,
): string | null {
  const line = renderDocDirectionLine(input);
  const text = clean(summary);
  if (line == null) return text ?? null;
  return text ? `${line}\n${text}` : line;
}

function clean(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}
