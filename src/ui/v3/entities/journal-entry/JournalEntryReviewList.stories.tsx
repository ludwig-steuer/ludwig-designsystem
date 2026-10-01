import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { reviewScore } from "@/ludwig/modules/accounting-cases/domain/review-score";
import type { CheckItem } from "../../patterns/Review";
import { JournalEntryCard } from "./JournalEntryCompact";
import { JournalEntryReviewList, type ProposalRow } from "./JournalEntryReviewList";

const meta: Meta<typeof JournalEntryReviewList> = {
  title: "v3/Entitäten/Buchungssatz/JournalEntryReviewList",
  component: JournalEntryReviewList,
};
export default meta;
type Story = StoryObj<typeof JournalEntryReviewList>;

const PARTNERS = ["Deutsche Telekom Geschäftskunden GmbH", "Stadtwerke Beispielstadt", "Aral Tankstelle", "Beispiel Leasing AG", "Hartje KG", "Telekom Deutschland GmbH", "Deutsche Post AG", "Allianz Versicherungs-AG"];
const KINDS = [
  { key: "invoice", label: "Rechnung" },
  { key: "payment", label: "Zahlung" },
  { key: "recurring", label: "Dauerbuchung" },
];

/** Eight checks of an entry — the questions of the case view (0217). */
const CHECK_BASE: [string, string, string][] = [
  ["P-BETRAG", "Stimmt der gebuchte Betrag mit dem Beleg überein?", "Betrag und Beleg stimmen auf den Cent."],
  ["P-BELEG", "Stimmt die Belegnummer mit dem Beleg überein?", "Belegfeld 1 entspricht der Nummer auf dem Beleg."],
  ["P-KONTO", "Passt das Sachkonto zur Leistung?", "Wie die letzten drei Buchungen dieser Gegenpartei."],
  ["P-UST", "Passt der Steuerschlüssel zum ausgewiesenen Steuersatz?", "Beleg weist 19 % aus, gebucht mit BU 9."],
  ["P-LEISTUNG", "Liegt der Leistungszeitraum in dieser Periode?", "Leistung im September 2026."],
  ["P-EMPFAENGER", "Ist der Mandant der Rechnungsempfänger?", "Empfänger laut Beleg ist der Mandant."],
  ["P-VORMONAT", "Wurde im Vormonat gleich gebucht?", "Gleiche Konten wie im Vormonat."],
  ["P-13B", "Ist die Umkehr der Steuerschuld richtig behandelt?", "Lieferant im Inland, § 13b greift nicht."],
];

/** A realistic spread: mostly passed, some with a finding, some thin entries with nothing checkable. */
function checksFor(i: number): CheckItem[] {
  return CHECK_BASE.map(([code, question, reason], k) => {
    if (i % 7 === 5) return { code, question, reason: "Kein Belegbetrag hinterlegt — nicht vergleichbar.", state: "open" as const };
    if (i % 4 === 3 && code === "P-UST")
      return { code, question, reason: "Beleg weist 7 % aus, gebucht wurde BU 9 (19 %).", state: "red" as const };
    if (i % 4 === 2 && code === "P-VORMONAT")
      return { code, question, reason: "Im Vormonat auf 4980 gebucht, jetzt auf 4930.", state: "yellow" as const };
    if (k === 7 && i % 3 === 0) return { code, question, reason: "Ob § 13b greift, ist am Beleg nicht vermerkt.", state: "open" as const };
    return { code, question, reason, state: "green" as const };
  });
}

const VERDICTS = ["confirm", "confirm", "confirm_with_note", "adjust", "flag"] as const;
const PRIOR = [12, 3, 1, 5, 0, 7];

const confidenceFor = (i: number): "red" | "orange" | "yellow" | "green" =>
  i % 11 === 10 ? "red" : i % 7 === 6 ? "orange" : i % 3 === 1 ? "yellow" : "green";

/**
 * The review score as the app computes it — the fixture calls the mirror's own
 * `reviewScore()` (F232), so parts and sums follow the real rules.
 */
function scoreFor(i: number, kind: string, taxKey: string | null, checks: CheckItem[]): ProposalRow["reviewScore"] {
  const s = reviewScore({
    journalEntryId: `je-${i}`,
    origin: kind === "recurring" ? "recurring_rule" : "ai_proposed",
    entryKind: kind === "payment" ? "payment" : "expense",
    verdict: kind === "recurring" ? null : VERDICTS[i % 5]!,
    judgeCriteria: [],
    confidence: confidenceFor(i),
    taxKeys: taxKey ? [taxKey] : [],
    reverseCharge: false,
    checks: checks.map(({ code, state }) => ({ code, state })),
    priorSameBookings: i % 9 === 4 ? 0 : PRIOR[i % 6]!,
  });
  return { score: s.score, reasons: s.reasons, hard: s.hard };
}

/** Short words of the checks, as the brief lists them (F355 §1). */
const CHECK_WORD: Record<string, string> = { "P-UST": "Steuerschlüssel", "P-VORMONAT": "Anders als Vormonat", "P-13B": "§13b prüfen" };

/**
 * The review reasons as the app will resolve them from the registry axis
 * `review_reason` (F355 §1): strongest first, the particular of this case as
 * `detail`. Fixture data — the cell itself knows no word.
 */
function reasonsFor(i: number, kind: string, taxKey: string | null, checks: CheckItem[]): ProposalRow["reviewReasons"] {
  const out: { points: number; r: NonNullable<ProposalRow["reviewReasons"]>[number] }[] = [];
  const verdict = kind === "recurring" ? null : VERDICTS[i % 5]!;
  const red = checks.find((c) => c.state === "red");
  const yellow = checks.find((c) => c.state === "yellow");
  // A red check may come as `danger` from the registry — the cell shows it as warning (A7).
  if (red) out.push({ points: 100, r: { code: `check_red:${red.code}`, label: CHECK_WORD[red.code] ?? red.code, kind: "danger", detail: red.reason } });
  if (verdict === "flag") out.push({ points: 100, r: { code: "judge_flag", label: "Beanstandet", kind: "warning", detail: "Judge: Konto 4930 passt nicht zur Leistung — eher 4980 (Betriebsbedarf)." } });
  if (kind !== "recurring" && confidenceFor(i) === "red") out.push({ points: 100, r: { code: "confidence_red", label: "Ludwig unsicher", kind: "warning", detail: "Ludwig: 38 %" } });
  if (taxKey === "94") out.push({ points: 60, r: { code: "reverse_charge", label: "§13b", kind: "info", detail: "BU 94 · Sachverhalt 7: sonstige EU-Leistung" } });
  if (taxKey === "91") out.push({ points: 60, r: { code: "special_tax_key", label: "Sonderschlüssel", kind: "info", detail: "BU 91 · Innergemeinschaftlicher Erwerb 7 %" } });
  if (verdict === "adjust") out.push({ points: 60, r: { code: "judge_adjust", label: "Korrigiert", kind: "info", detail: "Judge: Steuerschlüssel von 8 auf 9 korrigiert." } });
  if (!red && yellow) out.push({ points: 50, r: { code: `check_yellow:${yellow.code}`, label: CHECK_WORD[yellow.code] ?? yellow.code, kind: "info", detail: yellow.reason } });
  const c = confidenceFor(i);
  if (kind !== "recurring" && (c === "orange" || c === "yellow")) out.push({ points: c === "orange" ? 30 : 25, r: { code: "confidence_low", label: "Ludwig nicht ganz sicher", kind: "info", detail: c === "orange" ? "Ludwig: 62 %" : "Ludwig: 78 %" } });
  if (verdict === "confirm_with_note") out.push({ points: 15, r: { code: "judge_note", label: "Hinweis vom Judge", kind: "info", detail: "Judge: Leistungszeitraum steht nur im Freitext." } });
  return out.sort((a, b) => b.points - a.points).map((x) => x.r);
}

// Batch 09-2026-Ludwig: forty open proposals.
const ROWS: ProposalRow[] = Array.from({ length: 40 }, (_, i) => {
  const kind = KINDS[i % 3]!;
  // § 13b and a special key on a few invoices — review reasons of their own.
  const taxKey = kind.key === "payment" ? null : i % 10 === 7 ? "94" : i % 10 === 3 ? "91" : "9";
  const checks = i === 11 ? null : checksFor(i);
  return {
    id: `case-${i + 1}`,
    number: String(i + 1),
    date: `2026-09-${String((i % 28) + 1).padStart(2, "0")}`,
    counterparty: i === 7 ? null : PARTNERS[i % PARTNERS.length]!,
    title: "Eingangsrechnung ohne erkannten Gegenpart",
    priorSameBookings: i % 9 === 4 ? 0 : PRIOR[i % 6]!,
    accounts:
      i === 11
        ? null
        : {
            // The main account first — the app orders by sum (owner 2026-10-01).
            debit:
              kind.key === "payment"
                ? [{ number: "70021", name: "Muster Bürobedarf GmbH" }]
                : i % 6 === 0
                  ? [{ number: "3100", name: "Fremdleistungen" }, { number: "1576", name: "Abziehbare Vorsteuer 19 %" }, { number: "1571", name: "Abziehbare Vorsteuer 7 %" }]
                  : i % 3 === 0
                    ? [{ number: "4930", name: "Bürobedarf" }, { number: "1576", name: "Abziehbare Vorsteuer 19 %" }]
                    : [{ number: "4930", name: "Bürobedarf" }],
            credit:
              i % 13 === 0
                ? [{ number: "1800", name: "Bank" }, { number: "1360", name: "Geldtransit" }]
                : kind.key === "payment"
                  ? [{ number: "1800", name: "Bank" }]
                  : i % 5 === 0
                    ? [{ number: "1600", name: "Verbindlichkeiten aus Lieferungen und Leistungen" }]
                    : [{ number: "70021", name: "Muster Bürobedarf GmbH" }],
            // A side that carries one account on two lines — only here „3 Zeilen" stays.
            lineCount: i % 13 === 0 ? 3 : i % 6 === 0 ? 4 : i % 3 === 0 ? 3 : i === 10 ? 3 : 2,
          },
    amount: i === 11 ? null : 38.5 + i * 97.35,
    currency: "EUR",
    taxKey,
    documentNumber: i % 5 === 3 ? null : `RE-2026-${String(800 + i)}`,
    documentId: i % 4 === 1 ? null : `doc-${i}`,
    verdict: VERDICTS[i % 5]!,
    confidence: confidenceFor(i),
    kindLabel: kind.label,
    decided: i < 3,
    // One case without an entry: no checks, no score — the app sends none.
    ...(checks
      ? { checks, reviewScore: scoreFor(i, kind.key, taxKey, checks), reviewReasons: reasonsFor(i, kind.key, taxKey, checks) }
      : {}),
  };
});

const HREFS = {
  accountHref: (n: string) => `#account=${n}`,
  documentHref: (id: string) => `#document=${id}`,
  taxKeyHref: (k: string) => `#taxKey=${k}`,
};

const expand = (p: ProposalRow) =>
  p.accounts ? (
    <JournalEntryCard
      caption={p.counterparty ?? p.title}
      currency={p.currency}
      accountHref={HREFS.accountHref}
      lines={[
        ...p.accounts.debit.map((a) => ({ side: "debit" as const, accountNumber: a.number, accountName: a.name ?? null, amount: p.amount ?? 0, taxKey: p.taxKey ?? null })),
        ...p.accounts.credit.map((a) => ({ side: "credit" as const, accountNumber: a.number, accountName: a.name ?? null, amount: (p.amount ?? 0) / p.accounts!.credit.length })),
      ]}
    />
  ) : (
    <span className="v2muted">Zu diesem Sachverhalt liegt noch kein Satz vor.</span>
  );

const actions = (p: ProposalRow) =>
  p.decided
    ? [{ label: "Öffnen", action: async () => {} }]
    : [
        { label: "Freigeben", primary: true, action: async () => {} },
        { label: "Öffnen", action: async () => {} },
      ];

const BULK = [{ label: "Ausgewählte freigeben", action: async () => {} }];

/**
 * Step 3, grouped by entry kind: selection, fold-out, row actions; the caller
 * takes the kind column out inside its groups. Soll and Haben show the main
 * account — number in its own column, the name beside it wrapping, „+n weitere"
 * below (owner 2026-10-01); rows align at the top.
 */
export const Grouped: Story = {
  render: () => (
    <JournalEntryReviewList
      groups={KINDS.map((k) => ({
        key: k.key,
        label: k.label,
        rows: ROWS.filter((r) => r.kindLabel === k.label),
        aside: `${ROWS.filter((r) => r.kindLabel === k.label).length} Sätze`,
      }))}
      head={{ title: "Buchungsvorschläge nach Satzart", sub: "40 von 40 Sachverhalten" }}
      without={["kind"]}
      expand={expand}
      rowActions={actions}
      bulkActions={BULK}
      {...HREFS}
    />
  ),
};

/**
 * Flat, with the kind as a column — and without the name columns
 * (`accountNames={false}`): with the kind they would not fit 1280 px. The
 * number counts the rest („+2 weitere"), the title names every account, and
 * „3 Zeilen" stays only where one account carries several lines (row 11).
 */
export const Flat: Story = {
  render: () => (
    <JournalEntryReviewList
      rows={ROWS.slice(0, 12)}
      accountNames={false}
      head={{ title: "Bitte anschauen", sub: "12 von 40 Sachverhalten" }}
      expand={expand}
      rowActions={actions}
      bulkActions={BULK}
      {...HREFS}
    />
  ),
};

/** Compact, for a drawer or the tab „Zum Schließen": accounts as „A an B", no kind, the review reason last. */
export const Compact: Story = {
  render: () => (
    <div style={{ width: 680 }}>
      <JournalEntryReviewList rows={ROWS.slice(5, 11)} variant="compact" head={{ title: "Zum Schließen" }} bulkActions={BULK} {...HREFS} />
    </div>
  ),
};

/**
 * Checks without a fold-out of the caller (0217): the list unfolds for the
 * checks alone. The row without checks (no entry yet) says so when opened —
 * it does not open onto nothing.
 */
export const ChecksWithoutExpand: Story = {
  render: () => <JournalEntryReviewList rows={ROWS.slice(9, 13)} head={{ title: "Prüfpunkte je Satz", sub: "4 Sachverhalte" }} {...HREFS} />,
};

/** Empty is a success, empty after a filter is not; loading and error keep the head. */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <JournalEntryReviewList rows={[]} head={{ title: "Offen" }} empty={{ title: "Alles abgenommen.", description: "Alle 40 Vorschläge dieses Stapels sind entschieden.", done: true }} />
      <JournalEntryReviewList rows={[]} head={{ title: "Offen" }} filtered={{ summary: "Satzart: Zahlung", resetHref: "#" }} />
      <JournalEntryReviewList rows={[]} head={{ title: "Offen" }} loading />
      <JournalEntryReviewList rows={[]} head={{ title: "Offen" }} error={{ message: "Die Vorschläge des Stapels konnten nicht geladen werden." }} />
    </div>
  ),
};
