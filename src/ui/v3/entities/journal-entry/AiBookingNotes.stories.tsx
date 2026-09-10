import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { AmountCell, MonoCell } from "../../primitives/Cells";
import { Card, CardHead } from "../../primitives/Table";
import { DataTable, type ColumnDef } from "../../patterns/DataTable";
import {
  AiBookingNotes,
  AiBookingNotesBody,
  AiBookingNotesCell,
  QUELLE_AUFSCHLAGBAR,
  type AiSource,
  type JudgeVerdict,
} from "./AiBookingNotes";
import type { ConfidenceLevel } from "../../patterns/Confidence";

/**
 * Was der Agent sich gedacht hat — in drei Größen (F123, 0151).
 *
 * Der Kasten steht am einzelnen Satz, die Zelle in einer Liste von Sätzen, und
 * der Rumpf ist das, was beide zeigen. Drei Formen, **ein** Vokabular: das
 * Urteil kommt aus der Achse `judge`, die Konfidenz aus `konfidenz`.
 */
const meta: Meta<typeof AiBookingNotesCell> = {
  title: "v3/Entitäten/Buchungssatz/AiBookingNotes",
  component: AiBookingNotesCell,
};
export default meta;
type Story = StoryObj<typeof AiBookingNotesCell>;

const QUELLEN: AiSource[] = [
  { key: "1", art: "regel", label: "Wiederkehr: Miete Musterstraße" },
  { key: "2", art: "beleg", label: "RE-2026-0042", quote: "Miete August 2026" },
];

/**
 * Quellen, wie sie **heute aus der App kommen**: der Beleg trägt keine
 * Bezeichnung, sondern seine Kennung. Genau das zeigt die Komponente seit dem
 * 2026-09-10 nicht mehr — eine UUID ist kein Name, sie ist ein Schlüssel, den
 * niemand nachschlagen kann.
 *
 * Stehen bleiben Art und Zitat, und das sagt mehr als „442c83b4-3063-…".
 */
const QUELLEN_OHNE_NAMEN: AiSource[] = [
  {
    key: "1",
    art: "beleg",
    quote: "Rechnung der Musterfirma Fahrradteile GmbH vom 16.07.2026 über 25,41 EUR",
  },
  { key: "2", art: "regel", label: "Präzedenz: dieselbe Buchung im Juni" },
];

/**
 * Die vier Urteile nebeneinander, jedes mit seiner Konfidenz. **Erst die
 * Konfidenz, dann das Urteil** (Owner 2026-09-10): das ist die Reihenfolge der
 * Arbeit — der Agent schlägt vor und sagt, wie sicher er war, dann urteilt der
 * Judge darüber. Der Kasten hat es immer schon so gehalten; die Zelle war der
 * Ausreißer.
 *
 * **Das Wort steht dabei**, nicht nur die Farbe: „Bestätigt" in Grün und
 * „Beanstandet" in Gelb unterscheiden sich für ein Viertel der Männer nicht
 * (V7).
 *
 * „Bestätigt mit Hinweis" und „Angepasst" sind beide `info` — die Achse
 * trennt sie im Wort, nicht in der Farbe, weil beide dasselbe bedeuten: der
 * Satz ist fachlich in Ordnung, es gibt nur etwas dazu zu sagen.
 */
export const Cell: Story = {
  render: () => {
    const faelle: [JudgeVerdict, ConfidenceLevel][] = [
      ["confirm", "green"],
      ["confirm_with_note", "green"],
      ["adjust", "yellow"],
      ["flag", "red"],
    ];
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {faelle.map(([verdict, confidence]) => (
          <AiBookingNotesCell key={verdict} verdict={verdict} confidence={confidence} />
        ))}
        <AiBookingNotesCell
          verdict="flag"
          confidence="red"
          errors={["Steuersatz widerspricht dem Beleg.", "Konto ist gesperrt."]}
        />
      </div>
    );
  },
};

/**
 * **Leer bleibt leer.** Ohne Urteil und ohne Konfidenz steht **nichts** da —
 * kein Gedankenstrich. Ein Vorschlag, den kein Judge gesehen hat, ist nicht
 * dasselbe wie einer, der zu nichts beurteilt wurde; der Gedankenstrich würde
 * genau diesen Unterschied einebnen.
 *
 * Der Rahmen macht die leere Zelle sichtbar — im Einsatz ist die Spalte
 * einfach frei.
 */
export const CellEmpty: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 320 }}>
      <div style={{ border: "1px dashed var(--color-border)", padding: 8, minHeight: 32 }}>
        <AiBookingNotesCell verdict={null} />
      </div>
      <div style={{ border: "1px dashed var(--color-border)", padding: 8 }}>
        {/* Nur die Konfidenz, ohne Urteil: der Agent war sich sicher, geprüft
            hat es noch niemand. Auch das ist eine Auskunft. */}
        <AiBookingNotesCell verdict={null} confidence="green" />
      </div>
    </div>
  ),
};

/**
 * Der **Kasten** am einzelnen Satz, wie ihn `JournalEntryEditor` stellt:
 * eingeklappt, sobald es etwas zu lesen gibt, aufgeklappt nur bei
 * Beanstandung oder Fehler.
 */
export const Box: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
      <AiBookingNotes
        verdict="confirm"
        confidence="green"
        rationale="Der Lieferant ist als Vermieter hinterlegt, der Betrag entspricht der Vormonatsmiete."
        judgeReasoning="Konto, Steuersatz und Betrag stimmen mit dem Vertrag überein."
        sources={QUELLEN}
      />
      <AiBookingNotes
        verdict="flag"
        confidence="red"
        rationale="Steuersatz aus der Positionszeile übernommen."
        judgeReasoning="Der Beleg weist 7 % aus. Der Satz bucht 19 % — bitte manuell prüfen."
        errors={["Steuersatz widerspricht dem Beleg."]}
        sources={[{ key: "1", art: "beleg", label: "RE-4471", quote: "zzgl. 7 % USt" }]}
      />
    </div>
  ),
};

/**
 * **Die sieben Quellenarten, und welche ein Ziel haben.**
 *
 * Erhoben aus 919 Quellen auf Staging (2026-09-10). Drei tragen in den Daten
 * immer eine Kennung und lassen sich aufschlagen — Kontoauszug (377), Beleg
 * (361), Rückfrage (10). Vier sind Text: „Bisherige Buchungen" ist eine
 * Aggregation über viele Sätze, „Regel" trägt in **47 von 47** Fällen keine
 * Id, „Gesetz" ist ein Zitat, und „Web" kommt im Bestand nicht vor.
 *
 * **Warum sieben statt fünf:** bis heute hieß alles drei „Beleg" — das
 * Dokument, die Lieferantenhistorie und die Rückfrage. „Beleg · Kreditor
 * 70003, 14 Buchungen, zuletzt 22.06." behauptet ein Dokument, wo eine
 * Zusammenfassung steht, und die kann man nicht aufschlagen.
 */
export const Quellenarten: Story = {
  render: function Arten() {
    const [zuletzt, setZuletzt] = useState<string | null>(null);
    const arten: { art: AiSource["art"]; citation: string }[] = [
      { art: "bank", citation: "Zahlung vom 28.07.2026 über 345,12 €" },
      { art: "beleg", citation: "Rechnung der Musterbau GmbH vom 16.07.2026" },
      { art: "history", citation: "Kreditor 70003, 14 Buchungen, zuletzt 22.06.2026" },
      { art: "klaerung", citation: "Welche Teilnehmer waren dabei?" },
      { art: "regel", citation: "Wiederkehr: Miete Musterstraße, monatlich zum 3." },
      { art: "gesetz", citation: "§ 33 UStDV: Kleinbetragsrechnungen bis 250 €" },
    ];
    return (
      <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
        <AiBookingNotes
          verdict="confirm"
          confidence="green"
          rationale="Alle sechs Arten, die im Bestand vorkommen — die drei mit Ziel sind Knöpfe, die drei ohne bleiben Text."
          sources={arten.map((a, i) => ({
            key: String(i),
            art: a.art,
            quote: a.citation,
            ...(QUELLE_AUFSCHLAGBAR[a.art] ? { onOpen: () => setZuletzt(a.art) } : {}),
          }))}
        />
        <p className="v2muted" style={{ margin: 0 }}>
          {zuletzt ? `Aufgeschlagen: ${zuletzt}` : "Die drei aufschlagbaren Arten reagieren auf einen Klick."}
        </p>
      </div>
    );
  },
};

/**
 * **Quellen ohne Namen — und der Beleg, den man aufschlagen kann** (0155).
 *
 * Links: was die App heute liefert. Der Beleg trägt nur seine Kennung, und die
 * zeigt die Komponente nicht mehr; Art und Zitat bleiben, und die sagen mehr.
 *
 * Rechts: dieselbe Quelle mit `onOpen`. Sie wird ein Knopf und schlägt den
 * Beleg **neben** der Arbeit auf, statt von ihr weg zu springen — die halb
 * geprüfte Buchung darf nicht verlorengehen. Welcher Drawer sich öffnet, weiß
 * der Aufrufer; die Komponente kennt keine Entität.
 */
export const Quellen: Story = {
  render: function Aufschlagen() {
    const [offen, setOffen] = useState<string | null>(null);
    return (
      <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
        <AiBookingNotes
          verdict="confirm"
          confidence="green"
          rationale="Konto und Kreditor wie bei der Rechnung desselben Lieferanten im Juni."
          sources={QUELLEN_OHNE_NAMEN}
        />
        <AiBookingNotes
          verdict="confirm"
          confidence="green"
          rationale="Dieselben Quellen, diesmal mit einem Weg hinein."
          sources={QUELLEN_OHNE_NAMEN.map((q) =>
            q.art === "beleg" ? { ...q, onOpen: () => setOffen(q.key) } : q,
          )}
        />
        <p className="v2muted" style={{ margin: 0 }}>
          {offen ? "Der Aufrufer öffnet jetzt seinen Beleg-Drawer." : "Auf die Quelle Beleg klicken."}
        </p>
      </div>
    );
  },
};

/* ── Im Einsatz: die Buchungsübersicht der Stapelabnahme ─────────────────── */

interface BatchRow {
  id: string;
  beleg: string;
  konto: string;
  text: string;
  amount: number;
  verdict: JudgeVerdict | null;
  confidence: ConfidenceLevel | null;
  rationale?: string;
  judgeReasoning?: string;
  errors?: string[];
}

const STAPEL: BatchRow[] = [
  {
    id: "1",
    beleg: "RE-2026-4471",
    konto: "6310",
    text: "Miete Musterstraße 12, August",
    amount: 1450,
    verdict: "confirm",
    confidence: "green",
    rationale: "Der Lieferant ist als Vermieter hinterlegt, der Betrag entspricht der Vormonatsmiete.",
    judgeReasoning: "Konto, Steuersatz und Betrag stimmen mit dem Vertrag überein.",
  },
  {
    id: "2",
    beleg: "ER-8812",
    konto: "6300",
    text: "Wartung Klimaanlage",
    amount: 1800,
    verdict: "adjust",
    confidence: "yellow",
    rationale: "Konto aus der Vorjahresbuchung desselben Lieferanten.",
    judgeReasoning: "Buchungstext präzisiert — fachlich unverändert.",
  },
  {
    id: "3",
    beleg: "ER-8814",
    konto: "6805",
    text: "Mobilfunk und Festnetz",
    amount: 89,
    verdict: "flag",
    confidence: "red",
    rationale: "Steuersatz aus der Positionszeile übernommen.",
    judgeReasoning: "Der Beleg weist 7 % aus. Der Satz bucht 19 % — bitte manuell prüfen.",
    errors: ["Steuersatz widerspricht dem Beleg."],
  },
  {
    id: "4",
    beleg: "KB-09-31",
    konto: "1600",
    text: "Porto und Verpackung",
    amount: 24.9,
    // Ohne Lauf: die Spalte bleibt leer, und das ist die Auskunft.
    verdict: null,
    confidence: null,
  },
];

const SPALTEN: ColumnDef<BatchRow>[] = [
  { key: "beleg", header: "Belegfeld 1", width: "140px", cell: (r) => <MonoCell value={r.beleg} /> },
  { key: "konto", header: "Konto", width: "80px", cell: (r) => <MonoCell value={r.konto} /> },
  { key: "text", header: "Buchungstext", cell: (r) => <span className="v2main">{r.text}</span> },
  {
    key: "ki",
    header: "KI-Prüfung",
    width: "230px",
    cell: (r) => (
      <AiBookingNotesCell
        verdict={r.verdict}
        confidence={r.confidence}
        {...(r.errors ? { errors: r.errors } : {})}
      />
    ),
  },
  {
    key: "amount",
    header: "Umsatz",
    width: "120px",
    align: "end",
    cell: (r) => <AmountCell value={r.amount} currency="EUR" />,
  },
];

/**
 * **Im Einsatz: Schritt 3 der Stapelabnahme.** Die Zeile beantwortet „hat
 * jemand widersprochen?", der Aufklapper beantwortet „warum?".
 *
 * Genau dafür gibt es die Zelle: in der Liste steht das Urteil mit Wort und
 * Konfidenz, die Begründung liegt eine Umdrehung tiefer. Drei Zeilen Text je
 * Zeile machen aus einem Stapel eine Wand — und ein Stapel hat im Bestand
 * dreistellige Zeilenzahlen.
 *
 * Der Aufklapper zeigt `AiBookingNotesBody` **ohne** eigenen Kopf: Urteil und
 * Konfidenz stehen schon in der Zeile, die man aufgeklappt hat.
 */
export const InUse: Story = {
  render: () => (
    <DataTable<BatchRow>
      rows={STAPEL}
      columns={SPALTEN}
      rowKey={(r) => r.id}
      head={{ title: "Stapel 09/2026", sub: "4 Buchungssätze · 3 geprüft" }}
      expand={(r) =>
        r.verdict || r.errors ? (
          <AiBookingNotesBody
            rationale={r.rationale}
            judgeReasoning={r.judgeReasoning}
            {...(r.errors ? { errors: r.errors } : {})}
          />
        ) : (
          <p className="v2muted" style={{ margin: 0 }}>
            Zu diesem Satz gibt es keine KI-Prüfung — er wurde von Hand gebucht.
          </p>
        )
      }
    />
  ),
};

/**
 * Dieselbe Liste in einer Karte ohne Tabelle — der Fall, in dem nur drei Sätze
 * nebeneinander stehen und der Kasten je Satz noch trägt.
 */
export const InCard: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Card>
        <CardHead title="Vorschlag prüfen" sub="ein Satz, ein Urteil" />
        <div style={{ padding: 16 }}>
          <AiBookingNotes
            verdict="confirm_with_note"
            confidence="green"
            rationale="Wiederkehrende Zahlung, Regel greift seit Januar."
            judgeReasoning="Der Betrag weicht um 12 € nach oben ab — Indexmiete, keine Reparaturpflicht."
            sources={QUELLEN}
          />
        </div>
      </Card>
    </div>
  ),
};
