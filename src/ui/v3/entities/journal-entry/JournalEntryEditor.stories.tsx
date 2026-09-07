import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { JournalEntryEditor, type EditorRow } from "./JournalEntryEditor";
import { REGISTER, SOURCE_LABEL } from "../document-number/fixtures";

const meta: Meta<typeof JournalEntryEditor> = {
  title: "v3/Entitäten/Buchungssatz/JournalEntryEditor",
  component: JournalEntryEditor,
};
export default meta;
type Story = StoryObj<typeof JournalEntryEditor>;

/**
 * Die 24 Zustände aus `Buchungseditor-Zustände.dc.html`. Sie sind hier
 * nachgestellt, weil man im laufenden Screen immer nur einen sieht — und
 * gerade die seltenen (gesperrt, storniert, mehrere Fehler) sind die, bei
 * denen sich Fehler einnisten.
 */

const CANDIDATES = {
  agent: [{ number: "6815", name: "Bürobedarf", reason: "Vorschlag des Agenten" }],
  partner: [{ number: "6820", name: "Porto", reason: "zuletzt 12× bei dieser Gegenpartei" }],
};

const ROW: EditorRow = {
  id: "1",
  datum: "2026-08-21",
  umsatz: "1.475,60",
  side: "S",
  bu: "9",
  konto: "6815",
  kontoName: "Bürobedarf",
  beleg1: "RE-4471",
  text: "Bürobedarf August",
  candidates: CANDIDATES,
};

const AGAINST = { konto: "70044", name: "Bürobedarf Meier GmbH", tag: "Kreditor" };

const BASE = {
  rows: [ROW],
  gegenkonto: AGAINST,
  belegNumber: "RE-4471",
  belegAmount: 1475.6,
  belegSide: "S" as const,
  status: "proposed" as const,
  accountFramework: "skr04",
  onSearchAccounts: async () => [{ number: "6600", name: "Werbekosten" }],
};

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="v2card" style={{ padding: 18, maxWidth: 900 }}>
    {children}
  </div>
);

/**
 * S1 — im Formular, mit einer Warnung. Sie **blockiert nicht**: der Satz
 * lässt sich speichern, die Warnung steht sichtbar daneben und bietet ihren
 * Weg an („6820 einsetzen"). Die Quittungspflicht ist mit dem Owner-Entscheid
 * vom 2026-09-07 gestrichen — eine Warnung, die man abhaken **muss**, wird
 * abgehakt und nicht gelesen.
 */
export const S1_EditWithWarning: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        editable
        warnings={[
          {
            code: "P-KONTO",
            message: "Diese Gegenpartei wird sonst auf 6820 gebucht.",
            fixLabel: "6820 einsetzen",
            onFix: () => {},
          },
        ]}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Frame>
  ),
};

/** S2 — Split über zwei Zeilen, Vollansicht mit Währung, Beleg 2 und KOST. */
export const S2_SplitFull: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        mode="voll"
        editable
        rows={[
          { ...ROW, umsatz: "1.000,00", text: "Bürobedarf", kost1: "100" },
          { ...ROW, id: "2", umsatz: "475,60", konto: "6845", kontoName: "EDV-Zubehör", text: "Toner", kost1: "200" },
        ]}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Frame>
  ),
};

/** S3 — Automatikkonto: der Schlüssel steht am Konto, das Feld ist gesperrt. */
export const S3_AutomaticAccount: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        editable
        rows={[{ ...ROW, konto: "4400", kontoName: "Erlöse 19 % USt", buLocked: true }]}
        hints={[{ code: "P-UST", message: "4400 ist ein Automatikkonto — der Steuerschlüssel kommt vom Konto." }]}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Frame>
  ),
};

/** S5 — der Betrag weicht vom Beleg ab: der Rest steht rot im Header. */
export const S5_RemainderDoesNotBalance: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        editable
        rows={[{ ...ROW, umsatz: "1.400,00" }]}
        warnings={[{ code: "P-BETRAG", message: "Beleg 1.475,60 €, gebucht 1.400,00 € — Abweichung 75,60 €." }]}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Frame>
  ),
};

/** S12 — mehrere Fehler: Speichern bleibt gesperrt, jeder Fehler nennt sich. */
export const S12_MultipleErrors: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        editable
        rows={[{ ...ROW, umsatz: "1.400,00", konto: "" }]}
        errors={[
          { code: "P-SUMME", message: "Soll 1.400,00 € gegen Haben 1.475,60 €." },
          { code: "E-KONTO", message: "Für die erste Zeile fehlt das Konto." },
        ]}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Frame>
  ),
};

/** S23 — der Judge beanstandet, und es liegt zusätzlich ein Fehler an. */
export const S23_JudgeFlaggedWithError: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        editable
        errors={[{ code: "P-UST", message: "Beleg weist 7 % aus, gebucht ist BU 9 (19 %)." }]}
        aiReview={{
          verdict: "flag",
          confidence: "red",
          rationale: "Steuersatz aus der Positionszeile übernommen.",
          judgeReasoning: "Der Beleg weist 7 % aus. Der Satz bucht 19 % — bitte manuell prüfen.",
          errors: ["Steuersatz widerspricht dem Beleg."],
          sources: [{ key: "1", art: "beleg", label: "RE-4471", quote: "zzgl. 7 % USt" }],
        }}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Frame>
  ),
};

/**
 * Ohne Zeilen. Die Spec führt „leer" als **nicht anwendbar** — ein
 * Buchungssatz ohne Zeile ist kein Zustand des Editors, sondern ein Fehler
 * des Aufrufers. Die Story steht trotzdem hier, und genau deshalb: der Fehler
 * soll **sichtbar abgefangen** sein, nicht in einer leeren Fläche enden.
 * Gemessen: „Keine Buchungszeilen.", der Hinweis „Noch keine Zeile …",
 * Speichern gesperrt.
 */
export const Empty: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        rows={[]}
        gegenkonto={null}
        editable
        hints={[{ code: "E-LEER", message: "Noch keine Zeile — mit „+ Zeile (Split)“ beginnen." }]}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Frame>
  ),
};

/* ── 0015 · The three points of the release ───────────────────────────────
   They stand at the end because they are not among the 24 states of the
   prototype: they are abilities the caller switches on. */

/**
 * §2 — **Belegfeld 1 in alle Zeilen übernehmen.** Der Knopf steht dort, wo
 * „Rest einsetzen" steht, und erscheint nur, wenn die aktiven Zeilen
 * verschiedene Werte tragen (der leere Wert zählt mit — er ist die häufigste
 * Abweichung). Das Feld selbst ist `DocumentNumberField` (0014), mit dem Weg
 * ins Register und dem Hinweis, wenn die geltende Nummer eine andere ist.
 */
export const DocumentNumberAcrossRows: Story = {
  render: function Render() {
    const [rows, setRows] = useState<EditorRow[]>([
      { ...ROW, beleg1: "RE-4471" },
      { ...ROW, id: "2", umsatz: "89,90", konto: "6820", kontoName: "Porto", beleg1: "", text: "Porto August" },
    ]);
    return (
      <Frame>
        <JournalEntryEditor
          {...BASE}
          rows={rows}
          key={rows.map((r) => r.beleg1).join("|")}
          editable
          documentNumberSourceLabel={SOURCE_LABEL}
          // The number that holds: the one from DATEV beats the computed one.
          dominantDocumentNumber={REGISTER[1]}
          onOpenDocumentNumberRegister={() => {}}
          onSave={(next) => setRows(next)}
        />
      </Frame>
    );
  },
};

/**
 * §3 — **das Gegenkonto ist bearbeitbar**, mit demselben `AccountField` wie
 * die Zeilen. Die Seite (S/H) bleibt fest: sie ist die Gegenseite des Belegs,
 * und ein Umschalter dort erzeugte einen Satz, der nicht aufgeht. Das `≠` in
 * der Summenzeile ist die ehrlichere Rückmeldung.
 */
export const ContraAccountEditable: Story = {
  render: function Render() {
    const [gk, setGk] = useState(AGAINST);
    return (
      <Frame>
        <JournalEntryEditor
          {...BASE}
          gegenkonto={gk}
          editable
          onContraAccountChange={(konto, name) => setGk({ ...gk, konto, name })}
          contraAccountCandidates={{
            partner: [{ number: "70044", name: "Bürobedarf Meier GmbH", reason: "Kreditor des Belegs" }],
            alle: [{ number: "1200", name: "Bank" }],
          }}
          onOpenLedger={() => {}}
          onSave={() => {}}
        />
      </Frame>
    );
  },
};

/**
 * Was **nur** der Editor kann, in einer Story: die drei Schnellaktionen
 * (`quickActions`, mit Alt+K/W/P am Knopf), der Weg zum Steuerschlüssel
 * (`onOpenTaxKey`), die Sperre (`locked`) samt Storno-Grund — und die drei
 * Wege aus dem Lesezustand heraus: `onEdit` schreibt den Satz um, `onDelete`
 * storniert ihn, `deletable` entscheidet, ob es den Weg überhaupt gibt.
 *
 * Diese Props hatten bis zum Schnitt keinen Nachweis: die Datei lag mit
 * 17 Stories über der Grenze, und zwei davon standen ausdrücklich als offene
 * Lücke in 0015 (M11). Nach dem Schnitt ist Platz — das Lesen zeigt jetzt
 * `JournalEntryGrid` (0113). Der dritte Block hier ist der Nachtrag der
 * Abnahme vom 2026-09-07: `onEdit`, `onDelete` und `deletable` hingen an den
 * acht entfernten Lese-Stories und standen danach ohne da.
 */
export const S20_EditorOnly: Story = {
  render: function Render() {
    const [protokoll, setProtokoll] = useState<string[]>([]);
    return (
      <Frame>
        <JournalEntryEditor
          {...BASE}
          editable
          quickActions={{
            klaerungskonto: () => {},
            wieLetzte: () => {},
            privatanteil: () => {},
          }}
          onOpenTaxKey={() => {}}
        />
        <div style={{ height: "var(--space-5)" }} />
        <JournalEntryEditor
          {...BASE}
          status="reversed"
          editable={false}
          locked={{ reason: "Der Satz ist storniert und nicht mehr zu ändern." }}
          reversedReason="Doppelt erfasst, siehe RE-4471-B."
        />
        <div style={{ height: "var(--space-5)" }} />
        {/* Lesend, aber mit beiden Wegen hinaus: „Ändern" und „Löschen".
            `deletable` ohne `onDelete` zeigte keinen Knopf — die Taste gäbe
            es, aber nichts täte sie (V14). */}
        <JournalEntryEditor
          {...BASE}
          status="accepted"
          editable={false}
          deletable
          onEdit={() => setProtokoll((p) => [...p, "Ändern"])}
          onDelete={(grund) => setProtokoll((p) => [...p, `Storniert: ${grund}`])}
        />
        <p className="v2muted">
          {protokoll.length === 0 ? "Noch nichts ausgelöst." : protokoll.join(" · ")}
        </p>
      </Frame>
    );
  },
};
