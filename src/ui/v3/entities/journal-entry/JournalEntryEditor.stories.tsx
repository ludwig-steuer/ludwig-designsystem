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

/** S0 — der Regelfall: eine Zeile, Rest geht auf, nur Anzeige. */
export const S0_Simple: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor {...BASE} editable={false} onEdit={() => {}} />
    </Frame>
  ),
};

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

/** S10 — Zahlungssatz: Belegseite Haben, Gegenkonto Bank. */
export const S10_Payment: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        belegSide="H"
        rows={[{ ...ROW, side: "H", bu: "", konto: "70044", kontoName: "Bürobedarf Meier GmbH", text: "Zahlung RE-4471" }]}
        gegenkonto={{ konto: "1800", name: "Bank", tag: "Zahlungskonto" }}
        editable={false}
        onEdit={() => {}}
      />
    </Frame>
  ),
};

/** S11 — gesperrt: der Grund steht da, und der eine erlaubte Ausweg. */
export const S11_Locked: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        status="posted"
        editable={false}
        locked={{
          reason: "Der Satz liegt bereits in DATEV.",
          actionLabel: "Storno + Neu",
          onAction: () => {},
        }}
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

/** S15 — freigegeben: Anzeige, Bearbeiten möglich, Löschen erlaubt. */
export const S15_Released: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        status="accepted"
        editable={false}
        deletable
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </Frame>
  ),
};

/** S17 — gebucht: kein Bearbeiten mehr, nur noch lesen. */
export const S17_Posted: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor {...BASE} status="posted" editable={false} />
    </Frame>
  ),
};

/** S18 — storniert: der Satz bleibt stehen, mit Grund. */
export const S18_Reversed: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        status="reversed"
        editable={false}
        reversedReason="Doppelt erfasst — der Beleg lag schon an 2026-0031."
      />
    </Frame>
  ),
};

/** S19 — der Judge bestätigt mit Hinweis: die Begründung ist einsehbar. */
export const S19_JudgeWithNote: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        editable={false}
        onEdit={() => {}}
        aiReview={{
          verdict: "confirm_with_note",
          confidence: "yellow",
          rationale:
            "Bürobedarf Meier GmbH liefert regelmäßig Verbrauchsmaterial; die Positionen sind Toner und Papier. Konto 6815 folgt der bisherigen Behandlung.",
          judgeReasoning: "Konto und Steuerschlüssel plausibel. Der Betrag liegt 18 % über dem Monatsschnitt.",
          sources: [
            { key: "1", art: "beleg", label: "RE-4471 vom 21.08.2026", quote: "Toner HP 415A, 4 Stück" },
            { key: "2", art: "regel", label: "Konvention „Bürobedarf auf 6815“ vom 12.08.2026" },
          ],
        }}
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

/** Ohne Zeilen — der Editor sagt, dass nothing zu speichern ist. */
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

/* ── 0015 · Die drei Punkte der Freigabe ──────────────────────────────────
   Sie stehen am Ende, weil sie nicht zu den 24 Zuständen des Prototyps
   gehören, sondern Fähigkeiten sind, die der Aufrufer einschaltet. */

/**
 * §1 — das **Journal in der DATEV-Stapelordnung**: Konto · Kontoname ·
 * Buchungstext · Soll · Haben. Der BU-Schlüssel steht **nicht** hier, sondern
 * in der Editorzeile: er ist eine Eingabe, keine Buchungszeile. Der Text kommt
 * jetzt mit — die Steuerzeile trägt den ihrer Zeile, das Gegenkonto den der
 * ersten.
 */
export const JournalWithPostingText: Story = {
  render: () => (
    <Frame>
      <JournalEntryEditor
        {...BASE}
        rows={[
          { ...ROW, text: "Bürobedarf August" },
          {
            ...ROW,
            id: "2",
            umsatz: "89,90",
            bu: "9",
            konto: "6820",
            kontoName: "Porto",
            text: "Porto August",
          },
        ]}
        editable={false}
        onEdit={() => {}}
      />
    </Frame>
  ),
};

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
          // Die geltende Nummer: die mit DATEV-Herkunft schlägt die errechnete.
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
