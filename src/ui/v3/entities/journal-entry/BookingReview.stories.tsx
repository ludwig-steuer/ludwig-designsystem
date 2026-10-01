import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import type { CheckItem } from "../../patterns/Review";
import { Button } from "../../primitives/Button";
import { FieldList } from "../../primitives/FieldList";
import { BookingReview, type BookingReviewEntry } from "./BookingReview";
import type { JournalLine } from "./JournalEntryCompact";
import { JournalEntryEditor, type EditorRow } from "./JournalEntryEditor";
import { JournalEntryGrid } from "./JournalEntryGrid";

const meta: Meta<typeof BookingReview> = {
  title: "v3/Entitäten/Buchungssatz/BookingReview",
  component: BookingReview,
};
export default meta;
type Story = StoryObj<typeof BookingReview>;

const HREFS = { accountHref: (n: string) => `#account=${n}`, taxKeyHref: (k: string) => `#taxKey=${k}` };

/** An invoice for office supplies: expense, input tax, creditor — every line. */
const INVOICE_LINES: JournalLine[] = [
  { side: "debit", accountNumber: "4930", accountName: "Bürobedarf", amount: 1240.0, text: "Bürobedarf August", taxKey: "9" },
  { side: "debit", accountNumber: "1576", accountName: "Abziehbare Vorsteuer 19 %", amount: 235.6, text: "Bürobedarf August" },
  { side: "credit", accountNumber: "70044", accountName: "Bürobedarf Meier GmbH", amount: 1475.6, text: "Bürobedarf August" },
];
const PAYMENT_LINES: JournalLine[] = [
  { side: "debit", accountNumber: "70044", accountName: "Bürobedarf Meier GmbH", amount: 1475.6, text: "Zahlung RE-4471" },
  { side: "credit", accountNumber: "1800", accountName: "Bank", amount: 1475.6, text: "Zahlung RE-4471" },
];
/** § 13b booked straight against the bank — one entry, the tax pair and the bank line all shown (§3a). */
const REVERSE_CHARGE_BANK_LINES: JournalLine[] = [
  { side: "debit", accountNumber: "6837", accountName: "Aufwendungen für die zeitlich befristete Überlassung von Rechten", amount: 1.5, text: "FTC Gephyra", taxKey: "94" },
  { side: "debit", accountNumber: "1407", accountName: "Abziehbare Vorsteuer nach § 13b UStG 19 %", amount: 0.29, text: "FTC Gephyra" },
  { side: "credit", accountNumber: "3837", accountName: "Umsatzsteuer nach § 13b UStG 19 %", amount: 0.29, text: "FTC Gephyra" },
  { side: "credit", accountNumber: "1802", accountName: "Bank Kreditkarte", amount: 1.5, text: "FTC Gephyra" },
];

const CHECKS_WITH_FINDING: CheckItem[] = [
  { code: "P-UST", question: "Passt der Steuerschlüssel zum ausgewiesenen Steuersatz?", reason: "Beleg weist 7 % aus, gebucht wurde BU 9 (19 %).", state: "red" },
  { code: "P-BETRAG", question: "Stimmt der gebuchte Betrag mit dem Beleg überein?", reason: "Betrag und Beleg stimmen auf den Cent.", state: "green" },
  { code: "P-BELEG", question: "Stimmt die Belegnummer mit dem Beleg überein?", reason: "Belegfeld 1 entspricht der Nummer auf dem Beleg.", state: "green" },
  { code: "P-KONTO", question: "Passt das Sachkonto zur Leistung?", reason: "Wie die letzten drei Buchungen dieser Gegenpartei.", state: "green" },
  { code: "P-13B", question: "Ist die Umkehr der Steuerschuld richtig behandelt?", reason: "Ob § 13b greift, ist am Beleg nicht vermerkt.", state: "open" },
];
const CHECKS_PASSED: CheckItem[] = [
  { code: "P-BETRAG", question: "Stimmt der gebuchte Betrag mit dem Beleg überein?", reason: "Betrag und Beleg stimmen auf den Cent.", state: "green" },
  { code: "P-AUSGLEICH", question: "Gleicht die Zahlung den offenen Posten aus?", reason: "RE-4471 ist mit dieser Zahlung ausgeglichen.", state: "green" },
];

const RATIONALE =
  "Bürobedarf Meier GmbH liefert seit 2024 Büromaterial; die letzten drei Rechnungen stehen auf 4930 Bürobedarf mit BU 9. Die Rechnung weist 19 % aus.";

/** Liste, kompakt — wie im Aufklapper von T3: Satz, Begründung, Prüfpunkte mit Befund, Judge. Ohne Belege. */
export const ListCompact: Story = {
  render: () => (
    <div style={{ maxWidth: 1180, background: "var(--color-bg-soft)", padding: "var(--space-5)" }}>
      <BookingReview
        {...HREFS}
        show={{ evidence: false }}
        entries={[
          {
            id: "je-1",
            lines: INVOICE_LINES,
            currency: "EUR",
            kindLabel: "Aufwand",
            kindDescription: "Ein Sachkonto für Aufwand, ein Personenkonto — eine Eingangsrechnung.",
            status: "proposed",
            rationale: RATIONALE,
            verdict: "adjust",
            judgeReasoning: "Steuerschlüssel von 8 auf 9 korrigiert: die Rechnung weist 19 % aus.",
            checks: CHECKS_WITH_FINDING,
          },
        ]}
      />
    </div>
  ),
};

const GRID_ROW = (over: Partial<EditorRow> & { id: string }): EditorRow => ({
  datum: "2026-08-21",
  amount: "1.475,60",
  side: "S",
  bu: "9",
  account: "4930",
  accountName: "Bürobedarf",
  externalDocumentNumber: "RE-4471",
  text: "Bürobedarf August",
  ...over,
});

/** Liste, voll — der Satz mit allen DATEV-Spalten, lesend (`JournalEntryGrid` im Slot). */
export const ListFull: Story = {
  render: () => (
    <div style={{ maxWidth: 1180, background: "var(--color-bg-soft)", padding: "var(--space-5)" }}>
      <BookingReview
        lines="full"
        show={{ evidence: false }}
        entries={[
          {
            id: "je-1",
            lines: INVOICE_LINES,
            currency: "EUR",
            kindLabel: "Aufwand",
            status: "proposed",
            rationale: RATIONALE,
            checks: CHECKS_WITH_FINDING,
            full: (
              <JournalEntryGrid
                rows={[GRID_ROW({ id: "1" })]}
                status="proposed"
                mode="full"
                contraAccount={{ account: "70044", name: "Bürobedarf Meier GmbH" }}
                documentNumber="RE-4471"
                documentAmount={1475.6}
                accountFramework="skr03"
              />
            ),
          },
        ]}
      />
    </div>
  ),
};

const DOCUMENT = (
  <FieldList
    title="Beleg & USt"
    rows={[
      ["Aussteller", "Bürobedarf Meier GmbH"],
      ["Nummer / Datum", "RE-4471 · 21.08.2026"],
      ["Leistungszeitraum", "August 2026"],
      ["Netto / USt / Brutto", "1.240,00 € · 235,60 € · 1.475,60 €"],
      ["Empfänger", "der Mandant"],
    ]}
  />
);

/**
 * Fall-Ansicht, voll und bearbeitbar: der Editor steht im Slot und bearbeitet
 * den Satz; Beleg & USt rechts; „Diesen Satz ablehnen" unter den Blöcken.
 */
export const CaseEditable: Story = {
  render: function Render() {
    const [editing, setEditing] = useState(true);
    return (
      <div style={{ maxWidth: 1246 }}>
        <BookingReview
          lines="full"
          entries={[
            {
              id: "je-1",
              lines: INVOICE_LINES,
              currency: "EUR",
              kindLabel: "Aufwand",
              status: "proposed",
              rationale: RATIONALE,
              verdict: "adjust",
              judgeReasoning: "Steuerschlüssel von 8 auf 9 korrigiert: die Rechnung weist 19 % aus.",
              checks: CHECKS_WITH_FINDING,
              evidence: DOCUMENT,
              actions: (
                <Button variant="tertiary" size="sm">
                  Diesen Satz ablehnen
                </Button>
              ),
              full: (
                <JournalEntryEditor
                  mode="full"
                  rows={[GRID_ROW({ id: "1" })]}
                  contraAccount={{ account: "70044", name: "Bürobedarf Meier GmbH" }}
                  documentNumber="RE-4471"
                  documentAmount={1475.6}
                  documentSide="S"
                  status="proposed"
                  accountFramework="skr03"
                  editable={editing}
                  onEdit={() => setEditing(true)}
                  onCancel={() => setEditing(false)}
                  onSave={() => setEditing(false)}
                />
              ),
            },
          ]}
        />
      </div>
    );
  },
};

/** Routinefall: keine Begründung, Judge bestätigt ohne Satz — es bleiben Kopf, Satz und Prüfpunkte. */
export const RoutineCase: Story = {
  render: () => (
    <div style={{ maxWidth: 1180, background: "var(--color-bg-soft)", padding: "var(--space-5)" }}>
      <BookingReview
        {...HREFS}
        entries={[
          {
            id: "je-1",
            lines: INVOICE_LINES,
            currency: "EUR",
            kindLabel: "Aufwand",
            status: "proposed",
            rationale: null,
            verdict: "confirm",
            judgeReasoning: null,
            checks: CHECKS_PASSED,
          },
        ]}
      />
    </div>
  ),
};

/**
 * „Aufwand mit Zahlung" (P58) in beiden Formen (§3a): oben ein Fall mit zwei
 * Sätzen — Rechnung und Zahlung —, jeder vollständig mit eigenen Prüfpunkten;
 * darunter ein Einzelsatz, der Aufwand direkt an die Bank bucht, mit allen vier
 * Zeilen einschließlich des § 13b-Steuerpaars.
 */
export const ExpenseWithPayment: Story = {
  render: () => {
    const twoEntries: BookingReviewEntry[] = [
      { id: "je-inv", lines: INVOICE_LINES, currency: "EUR", kindLabel: "Aufwand mit Zahlung", kindDescription: "Rechnung und Zahlung in einem Fall (P58).", status: "proposed", checks: CHECKS_WITH_FINDING },
      { id: "je-pay", lines: PAYMENT_LINES, currency: "EUR", kindLabel: "Aufwand mit Zahlung", kindDescription: "Rechnung und Zahlung in einem Fall (P58).", status: "proposed", checks: CHECKS_PASSED },
    ];
    return (
      <div style={{ display: "grid", gap: "var(--space-6)", maxWidth: 1180 }}>
        <div style={{ background: "var(--color-bg-soft)", padding: "var(--space-5)" }}>
          <BookingReview {...HREFS} entries={twoEntries} />
        </div>
        <div style={{ background: "var(--color-bg-soft)", padding: "var(--space-5)" }}>
          <BookingReview
            {...HREFS}
            entries={[
              {
                id: "je-ftc",
                lines: REVERSE_CHARGE_BANK_LINES,
                currency: "EUR",
                kindLabel: "Aufwand mit Zahlung",
                kindDescription: "Sachkonto und Geldkonto im selben Satz (P58).",
                status: "proposed",
                rationale: "Lizenzgebühr eines Anbieters in Irland, per Kreditkarte bezahlt — § 13b, BU 94.",
                checks: CHECKS_PASSED,
              },
            ]}
          />
        </div>
      </div>
    );
  },
};
