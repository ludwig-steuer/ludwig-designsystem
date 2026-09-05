import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Disclosure } from "./Disclosure";
import { RawRecord, RawValue } from "./RawRecord";
import { Card, CardHead } from "./Table";

const meta: Meta<typeof RawRecord> = { title: "v3/Primitives/Tabelle/RawRecord", component: RawRecord };
export default meta;
type Story = StoryObj<typeof RawRecord>;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 720 }}>
      <Card>
        <CardHead title="Rohdaten" sub="ludwig.client_accounting_case" />
        <div style={{ padding: "12px 16px" }}>{children}</div>
      </Card>
    </div>
  );
}

const CASE_ROW: Record<string, unknown> = {
  id: "e3a1c07f-2f4b-4a2e-9d51-8b0f2c1d4477",
  client_id: 4711,
  case_number: "2026-0815",
  status: "needs_clarification",
  disposition: "kanzlei",
  net_amount: 124090,
  currency: "EUR",
  is_reverse_charge: false,
  needs_receipt: true,
  created_at: "2026-08-26T14:03:11Z",
  closed_at: null,
  period: "2026-08-01",
  external_ref: "RE-4471",
  metadata: { source: "email", confidence: 0.87, rules: ["skonto", "vorsteuer"] },
  tags: ["eingangsrechnung", "wiederkehrend"],
  summary: "Wartung der Heizungsanlage, Rechnung 2026-0412.",
};

/** Eine Zeile, wie sie aus `select *` kommt — alle Schlüssel, alphabetisch. */
export const Filled: Story = {
  render: () => (
    <Frame>
      <RawRecord record={CASE_ROW} />
    </Frame>
  ),
};

/**
 * Jeder Zweig der Erkennung nebeneinander. Zahlen stehen **ungruppiert** —
 * `1234567` ist eine ID, keine Million —, `boolean` steht als `true`, nicht
 * als „ja", und ein ISO-Zeitstempel geht durch `Time`, behält den rohen Wert
 * aber im `title`.
 */
export const DataTypes: Story = {
  render: () => (
    <Frame>
      <RawRecord
        record={{
          a_null: null,
          b_undefined: undefined,
          c_boolean_true: true,
          d_boolean_false: false,
          e_number: 42,
          f_number_long: 1234567,
          g_bigint: 9007199254740993n,
          h_date: "2026-08-26",
          i_timestamp: "2026-08-26T14:03:11Z",
          j_array: ["skonto", "vorsteuer", "wiederkehrend"],
          k_object: { source: "email", confidence: 0.87 },
          l_string: "needs_clarification",
        }}
      />
    </Frame>
  ),
};

const OCR = `# Rechnung 2026-0412\n\n**DomainFactory GmbH** · Kundennummer 88213\n\n| Position | Menge | Preis |\n|---|---|---|\n| Wartung Heizungsanlage | 1 | 980,00 € |\n| Umwälzpumpe | 1 | 260,00 € |\n\nZahlbar innerhalb von 14 Tagen ohne Abzug. `.repeat(60);

const PROMPT =
  "System: Du bist ein Buchhaltungsassistent.\\nUser: Ordne den folgenden Beleg zu.\\n\\tBeleg: RE-4471\\n\\tBetrag: 1.475,60 EUR\\nAssistant: Ich schlage 6815 vor.";

/**
 * Rand: lange Werte. Alle drei stehen hinter einer Klappe mit Zeichen- und
 * Zeilenzahl. Beim Prompt sind `\n` und `\t` **literal** in der Spalte
 * gespeichert — ohne Auflösung wäre das eine endlose Zeile.
 */
export const LongValues: Story = {
  render: () => (
    <Frame>
      <RawRecord
        record={{
          ocr_markdown: OCR,
          llm_prompt: PROMPT,
          payload: {
            event: "case.created",
            case: { id: "e3a1c07f", number: "2026-0815", amount: 124090 },
            actor: { kind: "agent", version: "2026.8.3" },
            trace: ["classify", "extract", "propose", "await_clarification"],
          },
        }}
      />
    </Frame>
  ),
};

/**
 * `format` überschreibt die Erkennung je Schlüssel: OCR-Text als Markdown,
 * eine Referenz, die wie ein Datum aussieht, als Text — und eine Zahl, die
 * wirklich ein Betrag ist, gruppiert.
 *
 * Zwei der fünf Zeilen sind da, um zu beweisen, dass der Override **greift**,
 * und tragen deshalb Werte, die `auto` anders behandeln würde: die Kennung
 * sieht wie ein Datum aus und bleibt durch `text` trotzdem roh stehen, und
 * der Zeitstempel mit Leerzeichen statt `T` fällt durch die `auto`-Erkennung,
 * wird mit `date` aber als Zeitpunkt gelesen. Ein Override
 * auf einen Wert, den `auto` ohnehin so zeigt, beweist nichts.
 */
export const Formats: Story = {
  render: () => (
    <Frame>
      <RawRecord
        record={{
          amount_cents: 1234567,
          external_ref: "2026-08-26",
          ocr_markdown: "## Rechnung 2026-0412\n\n**DomainFactory GmbH**\n\nZahlbar in 14 Tagen.",
          payload_text: '{"event":"case.created","amount":124090}',
          posted_on: "2026-08-26 09:15:00",
        }}
        format={{
          amount_cents: "number",
          external_ref: "text",
          ocr_markdown: "markdown",
          payload_text: "json",
          posted_on: "date",
        }}
      />
    </Frame>
  ),
};

/** Eine Zeile ohne Schlüssel sagt das, statt eine leere Fläche zu zeigen. */
export const Empty: Story = {
  render: () => (
    <Frame>
      <RawRecord record={{}} empty="Keine Felder in dieser Zeile." />
    </Frame>
  ),
};

/**
 * Wie der Rohdaten-Tab: je DB-Tabelle eine Klappe, darin je Zeile ein
 * `RawRecord` mit `label`. Die Sektion selbst ist **keine** Komponente —
 * `Disclosure` um n × `RawRecord` ist an der Aufrufstelle zehn Zeilen Markup.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 720, display: "grid", gap: 8 }}>
      <Disclosure summary="ludwig.client_accounting_case" count={1} defaultOpen>
        <RawRecord record={CASE_ROW} label="#1 · id=e3a1c07f" />
      </Disclosure>
      <Disclosure summary="ludwig.client_accounting_event" count={6}>
        <div style={{ display: "grid", gap: 16 }}>
          <RawRecord
            record={{ id: "a1", kind: "invoice", amount: 124090, booked: false, created_at: "2026-08-26T14:03:11Z" }}
            label="#1 · id=a1"
          />
          <RawRecord
            record={{ id: "a2", kind: "payment", amount: 124090, booked: true, created_at: "2026-08-29T09:12:00Z" }}
            label="#2 · id=a2"
          />
        </div>
      </Disclosure>
      <Disclosure summary="ludwig.ops_llm_call_logs" count={12}>
        <RawRecord
          record={{ id: 88213, model: "claude-opus-5", prompt: PROMPT, tokens_in: 1840, tokens_out: 96 }}
          label="#1 · id=88213"
        />
      </Disclosure>
    </div>
  ),
};

/** `RawValue` allein — so zeigt die DATEV-Seite einzelne Rohwerte in Zellen. */
export const SingleValues: Story = {
  render: () => (
    <div style={{ maxWidth: 420, display: "grid", gap: 6, fontSize: 12.5 }}>
      <RawValue value={null} />
      <RawValue value={true} />
      <RawValue value={1234567} />
      <RawValue value="2026-08-26T14:03:11Z" />
      <RawValue value={1234567} format="number" />
    </div>
  ),
};
