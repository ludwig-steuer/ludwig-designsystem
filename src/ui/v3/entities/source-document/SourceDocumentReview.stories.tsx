import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import type { ChoiceOption } from "../../patterns/ChoicePrompt";
import { DataTable } from "../../patterns/DataTable";
import { ActionIcon } from "../../Icons";
import { ActionBar } from "../../primitives/ActionBar";
import { Button } from "../../primitives/Button";
import { FieldList } from "../../primitives/FieldList";
import { RecordPager } from "../../primitives/RecordPager";
import { Card, CardHead } from "../../primitives/Table";
import { DateRange } from "../../primitives/Time";
import type { SourceDocumentVM } from "./SourceDocument";
import { SourceDocumentPreview } from "./SourceDocumentPreview";
import { SourceDocumentReview } from "./SourceDocumentReview";
import { DOCUMENT_REVIEW_VIEW, sourceDocumentColumns, sourceDocumentMinWidth } from "./source-document-columns";

const meta: Meta<typeof SourceDocumentReview> = {
  title: "v3/Entitäten/Beleg/SourceDocumentReview",
  component: SourceDocumentReview,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof SourceDocumentReview>;

/** A one-page original as a data URI — no network, the preview is real. */
function original(issuer: string, title: string, lines: [string, string][], total: string) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html><meta charset="utf-8">
<style>
  body { margin: 0; padding: 24px; font: 13px/1.6 -apple-system, system-ui, sans-serif; color: #1b2733; background: #eef2f6; }
  section { background: #fff; padding: 32px 40px; min-height: 520px; box-shadow: 0 1px 3px rgba(15,23,42,.12); }
  h1 { font-size: 18px; margin: 24px 0 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  td { padding: 6px 0; border-bottom: 1px solid #eef2f6; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
</style>
<section><strong>${issuer}</strong><h1>${title}</h1><table>
${lines.map(([a, b]) => `<tr><td>${a}</td><td class="num">${b}</td></tr>`).join("")}
<tr><td><strong>Gesamt</strong></td><td class="num"><strong>${total}</strong></td></tr></table></section>`)}`;
}

/** The decisions of the review (concept §12, owner decisions 1 and 2 of 2026-10-24) — fixture words, as the app's choice model would send them. */
function decisions(recommended: string | null): ChoiceOption[] {
  const all: ChoiceOption[] = [
    {
      id: "process",
      label: "Mit Kommentar noch verarbeiten",
      hint: "Geht an Ludwig zurück, er bucht ihn im nächsten Durchgang.",
      note: { label: "Kommentar an Ludwig", placeholder: "Was soll mit dem Beleg passieren?", required: true },
    },
    { id: "next", label: "In den nächsten Zeitraum", hint: "Gehört in einen späteren Stapel; Ludwig bucht ihn dort." },
    { id: "archive", label: "Archivieren", hint: "Kein Buchungsbeleg; bleibt beim Mandanten abgelegt (z. B. Kontoauszug, Vertrag)." },
    { id: "annual", label: "Jahresabschluss-Ablage", hint: "Kein laufender Beleg; wird für den Jahresabschluss abgelegt." },
    { id: "private", label: "Private Steuererklärung des Mandanten", hint: "Wird für die Einkommensteuer des Mandanten abgelegt." },
    { id: "delete", label: "Löschen", hint: "Nicht aufzubewahren (Werbung, Dublette)." },
    {
      id: "client",
      label: "Beim Mandanten klären",
      hint: "Kommt mit Ihrer Notiz in die Liste für den Mandanten auf der Seite „Übergeben“.",
      note: { label: "Notiz für den Mandanten", placeholder: "Was soll der Mandant beantworten oder liefern?", required: true },
    },
  ];
  return all.map((o) => ({ ...o, recommended: o.id === recommended }));
}

interface ReviewItem {
  document: SourceDocumentVM;
  url: string;
  reasonNote: string | null;
  recommended: string | null;
  why: string | null;
}

/** Five documents of batch 2026-0001 that Ludwig did not book — fictional, modelled on the kinds of the wireframe; the credit note first, as in the spec. */
const ITEMS: ReviewItem[] = [
  {
    document: {
      id: "doc-credit",
      fileName: "2026-01-12_Serverhaus_Gutschrift_-4.76EUR.pdf",
      sourceDocType: "invoice",
      counterparty: "Serverhaus Nord GmbH",
      detail: { kind: "invoice", number: "G0012345", gross: -4.76, currency: "EUR" },
      documentDate: "2026-01-12",
      receivedDate: "2026-01-12",
      status: "human_review",
      reviewReason: "open_findings",
    },
    url: original("Serverhaus Nord GmbH", "Gutschrift G0012345", [["Gutschrift Server S-2 (anteilig)", "−4,00 €"], ["USt 19 %", "−0,76 €"]], "−4,76 €"),
    reasonNote:
      "Die Gutschrift wird mit der nächsten Serverhaus-Rechnung verrechnet, eine eigene Zahlung gibt es nicht. Die Rechnung vom Dezember steht schon in DATEV.",
    recommended: "process",
    why: "Die Gutschrift mindert den Aufwand; Ludwig bucht sie gegen 70031 Serverhaus Nord GmbH, wenn Sie das bestätigen.",
  },
  {
    document: {
      id: "doc-usd",
      fileName: "2026-01-03_Datenbrise_25.00USD.pdf",
      sourceDocType: "invoice",
      counterparty: "Datenbrise Inc.",
      detail: { kind: "invoice", number: "INV-2025-12-0193", gross: 25, currency: "USD" },
      documentDate: "2025-12-31",
      receivedDate: "2026-01-03",
      status: "human_review",
      reviewReason: "open_findings",
    },
    url: original("Datenbrise Inc.", "Invoice INV-2025-12-0193", [["Pro Plan, December 2025", "25,00 USD"]], "25,00 USD"),
    reasonNote:
      "Die Rechnung nennt keinen Leistungszeitraum, und der Betrag steht nur in USD. Für die Buchung fehlt der Euro-Betrag laut Kontoauszug.",
    recommended: "process",
    why: "Die Kartenzahlung über 23,12 € vom 05.01.2026 passt zur Rechnung; mit einem Satz zum Zeitraum bucht Ludwig sie.",
  },
  {
    document: {
      id: "doc-statement",
      fileName: "Hafenbank_Kontoauszug_2026-01.pdf",
      sourceDocType: "bank_statement_pdf",
      counterparty: "Hafenbank AG",
      documentDate: "2026-01-31",
      receivedDate: "2026-02-01",
      status: "human_review",
      reviewReason: "manual_extraction",
    },
    url: original("Hafenbank AG", "Kontoauszug Januar 2026", [["Anfangssaldo", "24.012,40 €"], ["Endsaldo", "24.880,12 €"]], "24.880,12 €"),
    reasonNote: "Die Umsätze dieses Kontos kommen schon über die Schnittstelle. Das PDF ist eine Zweitschrift.",
    recommended: "archive",
    why: "Alle 41 Umsätze des Auszugs stehen schon aus der Bankschnittstelle in Ludwig; das PDF ist nur Ablage.",
  },
  {
    document: {
      id: "doc-private",
      fileName: "Technikhaus_Lindner_Rechnung_TL-118204.pdf",
      sourceDocType: "invoice",
      counterparty: "Lindner Elektro Distribution International GmbH",
      detail: { kind: "invoice", number: "TL-118204", gross: 1329, currency: "EUR" },
      documentDate: "2026-01-18",
      receivedDate: "2026-01-19",
      status: "human_review",
      reviewReason: "unknown_form",
    },
    url: original("Lindner Elektro Distribution International GmbH", "Rechnung TL-118204", [["Smartphone, 256 GB", "1.116,81 €"], ["USt 19 %", "212,19 €"]], "1.329,00 €"),
    reasonNote: "Rechnungsempfänger ist eine Privatperson, nicht die GmbH.",
    recommended: "private",
    why: "Die Rechnung lautet auf eine Privatperson und wurde mit einer privaten Karte bezahlt.",
  },
  {
    document: {
      id: "doc-newsletter",
      fileName: "Brueckner_Branchenbrief_Januar.pdf",
      sourceDocType: "other",
      counterparty: "Verlag Brückner & Sohn",
      documentDate: "2026-01-08",
      receivedDate: "2026-01-08",
      status: "human_review",
      reviewReason: "unknown_form",
    },
    url: original("Verlag Brückner & Sohn", "Branchenbrief Januar 2026", [["Rundschreiben", "—"]], "—"),
    reasonNote: null,
    recommended: "delete",
    why: "Ein Rundschreiben ohne Betrag und ohne Bezug zu einer Zahlung.",
  },
];

const LABEL: Record<string, string> = Object.fromEntries(decisions(null).map((o) => [o.id, o.label]));

function Preview({ item }: { item: ReviewItem }) {
  return (
    <SourceDocumentPreview
      url={item.url}
      title={item.document.sourceDocType === "bank_statement_pdf" ? "Kontoauszug" : "Rechnung"}
      fileName={item.document.fileName}
      pageCount={1}
    />
  );
}

/** One document, as the review shows it: the pager above, the original left, the decision right. */
export const Filled: Story = {
  render: () => {
    const item = ITEMS[0]!;
    return (
      <div style={{ maxWidth: 1180, display: "grid", gap: "var(--space-3)" }}>
        <RecordPager label="Beleg" position={1} total={ITEMS.length} back={{ href: "#overview", label: "Übersicht" }} onPrev={null} onNext={() => {}} />
        <SourceDocumentReview
          document={item.document}
          preview={<Preview item={item} />}
          reasonNote={item.reasonNote}
          options={decisions(item.recommended)}
          recommendation={item.why}
          onDecide={async () => {}}
        />
      </div>
    );
  },
};

/** The round trip: take or overrule the recommendation, a note where one is needed, on to the next; at the end back to the overview. */
export const Interactive: Story = {
  render: () => {
    const [index, setIndex] = useState(0);
    const [decided, setDecided] = useState<Record<string, string>>({});
    const [pending, setPending] = useState(false);
    const item = ITEMS[index]!;
    const last = index === ITEMS.length - 1;
    return (
      <div style={{ maxWidth: 1180, display: "grid", gap: "var(--space-3)" }}>
        <RecordPager
          label="Beleg"
          position={index + 1}
          total={ITEMS.length}
          back={{ href: "#overview", label: "Übersicht" }}
          hotkeys
          onPrev={index > 0 ? () => setIndex(index - 1) : null}
          onNext={!last ? () => setIndex(index + 1) : null}
        />
        <SourceDocumentReview
          document={item.document}
          preview={<Preview item={item} />}
          reasonNote={item.reasonNote}
          options={decisions(item.recommended)}
          recommendation={item.why}
          submitLabel={last ? "Entscheiden und zur Übersicht" : "Entscheiden und weiter"}
          pending={pending}
          onDecide={async (answer) => {
            setPending(true);
            await new Promise((r) => setTimeout(r, 400));
            setPending(false);
            setDecided({ ...decided, [item.document.id]: `${LABEL[answer.optionId ?? ""] ?? "—"}${answer.text ? ` · „${answer.text}“` : ""}` });
            if (!last) setIndex(index + 1);
          }}
        />
        <p className="lw-ui-hint">
          {Object.keys(decided).length === 0
            ? "Noch nichts entschieden."
            : Object.entries(decided)
                .map(([id, word]) => `${ITEMS.find((i) => i.document.id === id)?.document.counterparty}: ${word}`)
                .join(" — ")}
        </p>
      </div>
    );
  },
};

/** Ludwig recommends nothing and wrote no note: no preselection, the button waits for a choice and says so. */
export const WithoutRecommendation: Story = {
  render: () => {
    const item = ITEMS[4]!;
    return (
      <div style={{ maxWidth: 1180 }}>
        <SourceDocumentReview
          document={{ ...item.document, reviewReason: null }}
          preview={<Preview item={item} />}
          reasonNote={null}
          options={decisions(null)}
          recommendation={null}
          onDecide={async () => {}}
        />
      </div>
    );
  },
};

/** Saving (`pending`) and a failed save (`error`): choice and note stay. */
export const States: Story = {
  render: () => {
    const item = ITEMS[1]!;
    const props = {
      document: item.document,
      preview: <Preview item={item} />,
      reasonNote: item.reasonNote,
      options: decisions(item.recommended),
      recommendation: item.why,
      onDecide: async () => {},
    };
    return (
      <div style={{ maxWidth: 1180, display: "grid", gap: "var(--space-6)" }}>
        <SourceDocumentReview {...props} pending />
        <SourceDocumentReview
          {...props}
          error="Die Entscheidung wurde nicht gespeichert. Die Verbindung zum Server ist abgebrochen. Versuchen Sie es noch einmal."
        />
      </div>
    );
  },
};

/** The original is loading or has no preview: a sentence, not a grey box — the slot is the caller's. */
export const PreviewLoading: Story = {
  render: () => {
    const item = ITEMS[2]!;
    return (
      <div style={{ maxWidth: 1180, display: "grid", gap: "var(--space-6)" }}>
        <SourceDocumentReview
          document={item.document}
          preview={<p className="lw-ui-hint">Lade Beleg …</p>}
          reasonNote={item.reasonNote}
          options={decisions(item.recommended)}
          recommendation={item.why}
          onDecide={async () => {}}
        />
        <SourceDocumentReview
          document={item.document}
          preview={
            <SourceDocumentPreview
              url={null}
              unavailableReason="Die Datei liegt nur als Zweitschrift im Postfach des Mandanten."
              title="Kontoauszug"
              fileName={item.document.fileName}
            />
          }
          reasonNote={item.reasonNote}
          options={decisions(item.recommended)}
          recommendation={item.why}
          onDecide={async () => {}}
        />
      </div>
    );
  },
};

/**
 * The way into the step (0223, owner 2026-10-26): an overview, not a list.
 * One sentence and the counts; under them the main way, „3 Belege
 * durchgehen" — it starts the single review at document 1 — and the side
 * way „Überspringen: Konten". The table of every document to check stays,
 * folded (`DataTable` `head.collapsed`); no „Weiter" under it. Below: the
 * same step once everything is decided — the main way names the next step —
 * and once there was nothing to check: the list says so with its number.
 */
export const Overview: Story = {
  render: function OverviewStory() {
    const [went, setWent] = useState<string | null>(null);
    const decidedOf: Record<string, string> = { "doc-statement": "archive", "doc-newsletter": "delete" };
    const cols = (decided: Record<string, string>) =>
      sourceDocumentColumns({
        columns: DOCUMENT_REVIEW_VIEW,
        href: (d) => `#review=${d.id}`,
        review: (d) => {
          const item = ITEMS.find((i) => i.document.id === d.id);
          return {
            recommended: item?.recommended ? (LABEL[item.recommended] ?? null) : null,
            decided: decided[d.id] ? (LABEL[decided[d.id]!] ?? null) : null,
          };
        },
      });
    const allDecided = Object.fromEntries(ITEMS.map((i) => [i.document.id, i.recommended ?? "archive"]));
    const step = (decided: Record<string, string>, items: readonly ReviewItem[] = ITEMS) => {
      const open = items.filter((i) => !decided[i.document.id]).length;
      const columns = cols(decided);
      return (
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <Card>
            <CardHead title="Belege" sub={<DateRange from="2026-01-01" to="2026-01-31" size="sm" />} />
            <div style={{ padding: "var(--space-4)", display: "grid", gap: "var(--space-4)" }}>
              <p className="lw-ui-lead">
                {items.length === 0
                  ? "Im Zeitraum sind 61 Belege eingegangen, Ludwig hat jeden gebucht oder zugeordnet."
                  : `Im Zeitraum sind 61 Belege eingegangen, Ludwig hat die meisten gebucht. ${open > 0 ? `${open} brauchen Ihre Entscheidung.` : "Alle sind entschieden."}`}
              </p>
              {/* At reading width: a count must not stand a page away from its word. */}
              <div style={{ maxWidth: "var(--content-measure)" }}>
                <FieldList
                  tone="soft"
                  rows={[
                    ["Eingegangen", "61"],
                    ["Gebucht", items.length === 0 ? "58" : "53"],
                    ["Warten auf eine Rückfrage", "3"],
                    ["Ohne Buchung oder von Ludwig als nicht buchungsrelevant eingestuft", String(items.length)],
                  ]}
                />
              </div>
              <ActionBar
                primary={
                  open > 0 ? (
                    <Button
                      variant="primary"
                      iconEnd={<ActionIcon action="forward" size={14} />}
                      onClick={() => setWent(`Einzelprüfung beginnt bei Beleg 1 von ${ITEMS.length}.`)}
                    >
                      {open === 1 ? "1 Beleg durchgehen" : `${open} Belege durchgehen`}
                    </Button>
                  ) : (
                    <Button variant="primary" iconEnd={<ActionIcon action="forward" size={14} />} onClick={() => setWent("Weiter zu Konten.")}>
                      Weiter: Konten
                    </Button>
                  )
                }
                secondary={
                  open > 0 ? (
                    <Button variant="secondary" iconEnd={<ActionIcon action="forward" size={14} />} onClick={() => setWent("Übersprungen, weiter zu Konten.")}>
                      Überspringen: Konten
                    </Button>
                  ) : null
                }
              />
            </div>
          </Card>
          <DataTable<SourceDocumentVM>
            rows={items.map((i) => i.document)}
            columns={columns}
            rowKey={(d) => d.id}
            head={{
              title: "Alle zu prüfenden Belege als Liste",
              sub: items.length === 0 ? "kein Beleg zu prüfen" : open > 0 ? `${open} von ${items.length} offen` : `alle ${items.length} entschieden`,
              collapsed: true,
            }}
            minWidth={sourceDocumentMinWidth(columns)}
            // Empty because done — with the number (T6, acceptance 0223 H3).
            empty={{ done: true, title: "Alle 61 Belege sind verarbeitet, zugeordnet oder gesichtet." }}
          />
        </div>
      );
    };
    return (
      <div style={{ maxWidth: 1180, display: "grid", gap: "var(--space-8)" }}>
        {step(decidedOf)}
        <p className="lw-ui-hint">{went ?? "Der Hauptknopf startet die Einzelprüfung; die Liste klappt mit ihrem Kopf auf."}</p>
        {step(allDecided)}
        {step({}, [])}
      </div>
    );
  },
};
