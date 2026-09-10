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
 * The 24 states from `Buchungseditor-Zustände.dc.html`, re-enacted because the
 * running screen shows only one at a time — and the rare ones (locked,
 * reversed, several errors) are where bugs settle.
 */

const CANDIDATES = {
  agent: [{ number: "6815", name: "Bürobedarf", reason: "Vorschlag des Agenten" }],
  partner: [{ number: "6820", name: "Porto", reason: "zuletzt 12× bei dieser Gegenpartei" }],
};

const ROW: EditorRow = {
  id: "1",
  datum: "2026-08-21",
  amount: "1.475,60",
  side: "S",
  bu: "9",
  account: "6815",
  accountName: "Bürobedarf",
  externalDocumentNumber: "RE-4471",
  text: "Bürobedarf August",
  candidates: CANDIDATES,
};

const AGAINST = { account: "70044", name: "Bürobedarf Meier GmbH", tag: "Kreditor" };

const BASE = {
  rows: [ROW],
  contraAccount: AGAINST,
  documentNumber: "RE-4471",
  documentAmount: 1475.6,
  documentSide: "S" as const,
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
        mode="full"
        editable
        rows={[
          { ...ROW, amount: "1.000,00", text: "Bürobedarf", costCenter1: "100" },
          { ...ROW, id: "2", amount: "475,60", account: "6845", accountName: "EDV-Zubehör", text: "Toner", costCenter1: "200" },
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
        rows={[{ ...ROW, account: "4400", accountName: "Erlöse 19 % USt", buLocked: true }]}
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
        rows={[{ ...ROW, amount: "1.400,00" }]}
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
        rows={[{ ...ROW, amount: "1.400,00", account: "" }]}
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
 * **Der Regelfall der Stapelabnahme: bestätigt — und die Begründung steht
 * trotzdem da.**
 *
 * Bis 2026-09-10 verschwand der ganze Kasten, sobald der Judge `confirm`
 * sagte und kein Befund anlag. Der Gedanke dahinter war richtig — wer jedem
 * bestätigten Satz seine Begründung aufdrängt, macht sie wertlos —, aber die
 * Folge war falsch: in der Stapelabnahme ist `confirm` der Regelfall, und
 * damit fehlte die Begründung genau dort, wo jemand hundert Sätze durchgeht
 * und bei einem wissen will, warum er so aussieht.
 *
 * Jetzt gilt: **eingeklappt, aber vorhanden.** Aufgeklappt wird weiterhin nur,
 * wo der Judge es verlangt (`flag`) oder ein Fehler anliegt.
 *
 * Die **Konfidenz steht als Wort** neben der Überschrift, nicht nur als
 * farbiger Punkt: hier ist Platz, und eine Farbe ohne Wort ist keine Aussage
 * (V7). `compact` bleibt der Buchungszeile, wo die Spalte schmal ist.
 */
export const S24_ConfirmedWithRationale: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        editable={false}
        aiReview={{
          verdict: "confirm",
          confidence: "green",
          rationale:
            "Der Lieferant ist als Vermieter hinterlegt, der Betrag entspricht der Vormonatsmiete, und die Laufzeit des Vertrags deckt den August.",
          judgeReasoning: "Konto, Steuersatz und Betrag stimmen mit dem Vertrag überein.",
          sources: [
            { key: "1", art: "regel", label: "Wiederkehr: Miete Musterstraße" },
            { key: "2", art: "beleg", label: "RE-2026-0042" },
          ],
        }}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Frame>
  ),
};

/**
 * Die Gegenprobe: **nichts zu sagen, also kein Kasten.** Ohne Begründung,
 * ohne Judge-Satz, ohne Quelle und ohne Befund gibt es nichts aufzuklappen —
 * und ein Kasten, der leer aufgeht, ist ein gebrochenes Versprechen.
 */
export const S25_NothingToExplain: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        editable={false}
        aiReview={{ verdict: "confirm", confidence: "green" }}
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
        contraAccount={null}
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
      { ...ROW, externalDocumentNumber: "RE-4471" },
      { ...ROW, id: "2", amount: "89,90", account: "6820", accountName: "Porto", externalDocumentNumber: "", text: "Porto August" },
    ]);
    return (
      <Frame>
        <JournalEntryEditor
          {...BASE}
          rows={rows}
          key={rows.map((r) => r.externalDocumentNumber).join("|")}
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
          contraAccount={gk}
          editable
          onContraAccountChange={(account, name) => setGk({ ...gk, account: account, name })}
          contraAccountCandidates={{
            partner: [{ number: "70044", name: "Bürobedarf Meier GmbH", reason: "Kreditor des Belegs" }],
            all: [{ number: "1200", name: "Bank" }],
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
    const [log, setLog] = useState<string[]>([]);
    return (
      <Frame>
        <JournalEntryEditor
          {...BASE}
          editable
          quickActions={{
            clarificationAccount: () => {},
            sameAsLast: () => {},
            privateShare: () => {},
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
        {/* Read-only, but with both ways out: "Ändern" and "Löschen". `deletable`
            without `onDelete` showed no button — the key would exist but do nothing (V14). */}
        <JournalEntryEditor
          {...BASE}
          status="accepted"
          editable={false}
          deletable
          onEdit={() => setLog((p) => [...p, "Ändern"])}
          onDelete={(reason) => setLog((p) => [...p, `Storniert: ${reason}`])}
          // The way into the ledger, **read-only** too: it hung on no editor story
          // until 0113, since the eight reading stories moved into the grid.
          onOpenLedger={() => setLog((p) => [...p, "Kontenblatt"])}
        />
        <p className="v2muted">
          {log.length === 0 ? "Noch nichts ausgelöst." : log.join(" · ")}
        </p>
      </Frame>
    );
  },
};
