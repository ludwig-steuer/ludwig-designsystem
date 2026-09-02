import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { JournalEntryEditor, type EditorRow } from "./JournalEntryEditor";

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

const KANDIDATEN = {
  agent: [{ number: "6815", name: "Bürobedarf", reason: "Vorschlag des Agenten" }],
  partner: [{ number: "6820", name: "Porto", reason: "zuletzt 12× bei dieser Gegenpartei" }],
};

const ZEILE: EditorRow = {
  id: "1",
  datum: "2026-08-21",
  umsatz: "1.475,60",
  side: "S",
  bu: "9",
  konto: "6815",
  kontoName: "Bürobedarf",
  beleg1: "RE-4471",
  text: "Bürobedarf August",
  candidates: KANDIDATEN,
};

const GEGEN = { konto: "70044", name: "Bürobedarf Meier GmbH", tag: "Kreditor" };

const BASIS = {
  rows: [ZEILE],
  gegenkonto: GEGEN,
  belegNumber: "RE-4471",
  belegAmount: 1475.6,
  belegSide: "S" as const,
  status: "proposed" as const,
  accountFramework: "skr04",
  onSearchAccounts: async () => [{ number: "6600", name: "Werbekosten" }],
};

const Rahmen = ({ children }: { children: React.ReactNode }) => (
  <div className="v2card" style={{ padding: 18, maxWidth: 900 }}>
    {children}
  </div>
);

/** S0 — der Regelfall: eine Zeile, Rest geht auf, nur Anzeige. */
export const S0_Simple: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor {...BASIS} editable={false} onEdit={() => {}} />
    </Rahmen>
  ),
};

/** S1 — im Formular, mit einer Warnung, die eine Quittung braucht. */
export const S1_EditWithWarning: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor
        {...BASIS}
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
    </Rahmen>
  ),
};

/** S2 — Split über zwei Zeilen, Vollansicht mit Währung, Beleg 2 und KOST. */
export const S2_SplitFull: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor
        {...BASIS}
        mode="voll"
        editable
        rows={[
          { ...ZEILE, umsatz: "1.000,00", text: "Bürobedarf", kost1: "100" },
          { ...ZEILE, id: "2", umsatz: "475,60", konto: "6845", kontoName: "EDV-Zubehör", text: "Toner", kost1: "200" },
        ]}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Rahmen>
  ),
};

/** S3 — Automatikkonto: der Schlüssel steht am Konto, das Feld ist gesperrt. */
export const S3_AutomaticAccount: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor
        {...BASIS}
        editable
        rows={[{ ...ZEILE, konto: "4400", kontoName: "Erlöse 19 % USt", buLocked: true }]}
        hints={[{ code: "P-UST", message: "4400 ist ein Automatikkonto — der Steuerschlüssel kommt vom Konto." }]}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Rahmen>
  ),
};

/** S5 — der Betrag weicht vom Beleg ab: der Rest steht rot im Kopf. */
export const S5_RemainderDoesNotBalance: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor
        {...BASIS}
        editable
        rows={[{ ...ZEILE, umsatz: "1.400,00" }]}
        warnings={[{ code: "P-BETRAG", message: "Beleg 1.475,60 €, gebucht 1.400,00 € — Abweichung 75,60 €." }]}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Rahmen>
  ),
};

/** S10 — Zahlungssatz: Belegseite Haben, Gegenkonto Bank. */
export const S10_Payment: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor
        {...BASIS}
        belegSide="H"
        rows={[{ ...ZEILE, side: "H", bu: "", konto: "70044", kontoName: "Bürobedarf Meier GmbH", text: "Zahlung RE-4471" }]}
        gegenkonto={{ konto: "1800", name: "Bank", tag: "Zahlungskonto" }}
        editable={false}
        onEdit={() => {}}
      />
    </Rahmen>
  ),
};

/** S11 — gesperrt: der Grund steht da, und der eine erlaubte Ausweg. */
export const S11_Locked: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor
        {...BASIS}
        status="posted"
        editable={false}
        locked={{
          reason: "Der Satz liegt bereits in DATEV.",
          actionLabel: "Storno + Neu",
          onAction: () => {},
        }}
      />
    </Rahmen>
  ),
};

/** S12 — mehrere Fehler: Speichern bleibt gesperrt, jeder Fehler nennt sich. */
export const S12_MultipleErrors: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor
        {...BASIS}
        editable
        rows={[{ ...ZEILE, umsatz: "1.400,00", konto: "" }]}
        errors={[
          { code: "P-SUMME", message: "Soll 1.400,00 € gegen Haben 1.475,60 €." },
          { code: "E-KONTO", message: "Für die erste Zeile fehlt das Konto." },
        ]}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Rahmen>
  ),
};

/** S15 — freigegeben: Anzeige, Bearbeiten möglich, Löschen erlaubt. */
export const S15_Released: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor
        {...BASIS}
        status="accepted"
        editable={false}
        deletable
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </Rahmen>
  ),
};

/** S17 — gebucht: kein Bearbeiten mehr, nur noch lesen. */
export const S17_Posted: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor {...BASIS} status="posted" editable={false} />
    </Rahmen>
  ),
};

/** S18 — storniert: der Satz bleibt stehen, mit Grund. */
export const S18_Reversed: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor
        {...BASIS}
        status="reversed"
        editable={false}
        reversedReason="Doppelt erfasst — der Beleg lag schon an 2026-0031."
      />
    </Rahmen>
  ),
};

/** S19 — der Judge bestätigt mit Hinweis: die Begründung ist einsehbar. */
export const S19_JudgeWithNote: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor
        {...BASIS}
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
    </Rahmen>
  ),
};

/** S23 — der Judge beanstandet, und es liegt zusätzlich ein Fehler an. */
export const S23_JudgeFlaggedWithError: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor
        {...BASIS}
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
    </Rahmen>
  ),
};

/** Ohne Zeilen — der Editor sagt, dass nichts zu speichern ist. */
export const Empty: Story = {
  render: () => (
    <Rahmen>
      <JournalEntryEditor
        {...BASIS}
        rows={[]}
        gegenkonto={null}
        editable
        hints={[{ code: "E-LEER", message: "Noch keine Zeile — mit „+ Zeile (Split)“ beginnen." }]}
        onCancel={() => {}}
        onSave={() => {}}
      />
    </Rahmen>
  ),
};
