/**
 * F303 T303.2 — Zone 2 der Stapel-Übersicht: je Mangel eine Zeile mit Weg
 * hinaus, Kritikalität absteigend (D24). Rein, ohne IO; die Komponente
 * rendert nur die Liste und setzt aus `target` den Link.
 *
 * F304 (L-352): keine Zeile für Nachforderungen beim Mandanten — Warten auf
 * eine andere Partei trägt der Staffelstab „Mandant (wartet)" (§2.3, D22).
 */

export type DefectTone = "danger" | "warning" | "neutral";

/** Wohin der Weg hinaus führt — die Seite kennt die Pfade. */
export type DefectTarget = "entries" | "accounts" | "review_clarifications";

export interface Defect {
  key: "unbalanced" | "masterdata" | "clarifications_accounting";
  tone: DefectTone;
  kicker: string;
  title: string;
  action: { label: string; target: DefectTarget };
}

export interface DefectInput {
  sumDebit: string | number;
  sumCredit: string | number;
  counts: { clarificationsOpenAccounting: number };
}

const EUR = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const eur = (value: string | number) => `${EUR.format(Number(value))} €`;

export function batchDefects(
  detail: DefectInput,
  masterdata: { blocked: boolean; summary: string } | null,
): Defect[] {
  const defects: Defect[] = [];
  if (Number(detail.sumDebit) !== Number(detail.sumCredit)) {
    defects.push({
      key: "unbalanced",
      tone: "danger",
      kicker: "Buchungen",
      title: `Soll ${eur(detail.sumDebit)} ≠ Haben ${eur(detail.sumCredit)} — geht nicht auf`,
      action: { label: "Buchungen", target: "entries" },
    });
  }
  if (masterdata?.blocked) {
    defects.push({
      key: "masterdata",
      tone: "warning",
      kicker: "Personenkonten",
      title: masterdata.summary,
      action: { label: "Konten", target: "accounts" },
    });
  }
  const accounting = detail.counts.clarificationsOpenAccounting;
  if (accounting > 0) {
    defects.push({
      key: "clarifications_accounting",
      tone: "warning",
      kicker: "Klärungen",
      title: `${accounting} ${accounting === 1 ? "Klärung wartet" : "Klärungen warten"} auf die Kanzlei`,
      action: { label: "Zur Abnahme", target: "review_clarifications" },
    });
  }
  return defects;
}

/**
 * Der Satz, wenn Zone 2 leer ist (Profil stapel-detail, Zone 2). Er wiederholt
 * keine Zahl aus den Kopf-Fakten (D24): die Summe steht nur hier.
 */
export function batchNothingOpenText(detail: Pick<DefectInput, "sumDebit">): string {
  return `Nichts offen — Soll und Haben gehen mit ${eur(detail.sumDebit)} auf, keine Klärung wartet auf die Kanzlei.`;
}
