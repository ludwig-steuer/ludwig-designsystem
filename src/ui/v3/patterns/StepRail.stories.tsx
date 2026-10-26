import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { DateRange } from "../primitives/Time";
import { ProgressBar, StepHeader, StepRail, type RailItem } from "./StepRail";

const meta: Meta<typeof StepRail> = { title: "v3/Patterns/Frame/StepRail", component: StepRail };
export default meta;
type Story = StoryObj<typeof StepRail>;

const STEPS: RailItem[] = [
  { key: "0", index: 0, label: "Ergebnis des Stapels", tone: "neutral", counterText: null, href: "#" },
  { key: "1", index: 1, label: "Vollständigkeit", tone: "done", counterText: "erledigt", href: "#" },
  { key: "2", index: 2, label: "Rückfragen", tone: "open", counterText: "2 von 5 offen", href: "#" },
  { key: "3", index: 3, label: "Buchungsvorschläge", tone: "open", counterText: "14 von 116 offen", href: "#", current: true },
  { key: "4", index: 4, label: "Bank", tone: "open", counterText: "1 von 2 offen", href: "#" },
  { key: "5", index: 5, label: "Offene Posten", tone: "done", counterText: "nichts überfällig", href: "#" },
  { key: "6", index: 6, label: "Plausibilität", tone: "open", counterText: "7 auffällig", href: "#" },
  { key: "7", index: 7, label: "Konventionen", tone: "open", counterText: "2 von 3 offen", href: "#" },
  { key: "8", index: 8, label: "Prüfprotokoll", tone: "blocked", counterText: "3 Blocker", href: "#" },
  { key: "9", index: 9, label: "Übergabe an DATEV", tone: "neutral", counterText: null, href: "#" },
  { key: "10", index: 10, label: "Nachlese", tone: "dimmed", counterText: null, href: null, disabledReason: "Die Nachlese füllt sich, sobald DATEV den Stapel gespiegelt hat." },
];

const RailLayout = ({ items }: { items: RailItem[] }) => (
  <div style={{ display: "grid", gridTemplateColumns: "224px minmax(0,1fr)", gap: 24 }}>
    <StepRail
      ariaLabel="Prüfschritte"
      items={items}
      head={
        <div className="review__railhead">
          <div className="lw-overline">Stapelabnahme</div>
        </div>
      }
    />
    <div />
  </div>
);

/**
 * Der Rail sagt auf einen Blick, wo Arbeit liegt: Ampel am Punkt, Menge im
 * Zähler. Rot gibt es nur, wo die Freigabe wirklich gesperrt ist.
 */
export const WithTonesAndCounters: Story = { render: () => <RailLayout items={STEPS} /> };

/** Alles abgearbeitet — der Rail ist grün, Schritt 8 sagt „bereit". */
export const AllDone: Story = {
  render: () => (
    <RailLayout
      items={STEPS.map((s) =>
        s.tone === "dimmed" || s.tone === "neutral"
          ? s
          : { ...s, tone: "done" as const, counterText: s.index === 8 ? "bereit" : "erledigt" },
      )}
    />
  ),
};

/** Frisch angelegt: noch nichts gerechnet, also auch kein Zähler. */
export const NothingComputedYet: Story = {
  render: () => (
    <RailLayout items={STEPS.map((s) => ({ ...s, tone: "neutral" as const, counterText: null }))} />
  ),
};

/** The screen header: the number in the overline, the subject in the title. */
export const ScreenHeader: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <StepHeader
        overline="Schritt 3 · Buchungsvorschläge"
        title="Buchungsvorschläge"
        lead="Stimmen die Vorschläge?"
        prevHref="#"
        nextHref="#"
        nextLabel="Weiter zu Schritt 4"
        actions={<ProgressBar done={41} total={118} />}
      />
    </div>
  ),
};

/** Am Anfang und am Ende ist der jeweilige Weg gesperrt, nicht versteckt. */
export const ScreenHeaderEdge: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <StepHeader
        overline="Schritt 0 · Ergebnis des Stapels"
        title="Abnahme Buchungsstapel"
        lead="Abnahme für August 2026 · 01.08.2026 – 31.08.2026 · Musterfirma GmbH"
        prevHref={null}
        nextHref="#"
        nextLabel="Vollständigkeit"
      />
    </div>
  ),
};

/**
 * Ein Schritt, der im Client-State liegt — ungespeichertes Formular, Assistent
 * im Dialog — kann kein Link sein. Dafür `onPrev`/`onNext`: derselbe Kopf,
 * derselbe Platz, nur Knöpfe statt Links. Vorher blieben einer Seite ohne
 * `href` zwei tote, nicht abschaltbare Knöpfe.
 */
export const ScreenHeaderCallbacks: Story = {
  render: function Render() {
    const [step, setStep] = useState(3);
    return (
      <div style={{ maxWidth: 900 }}>
        <StepHeader
          overline={`Schritt ${step} von 10`}
          title="Buchungen"
          lead="Der Schritt steht im Zustand der Seite, nicht in der URL."
          onPrev={step > 0 ? () => setStep((v) => v - 1) : null}
          onNext={step < 10 ? () => setStep((v) => v + 1) : null}
          nextLabel="Weiter"
        />
      </div>
    );
  },
};

/**
 * Eine Seite, die ihre Schrittwahl ganz woanders trägt, gibt weder `href` noch
 * Callback — dann steht im Kopf gar keine Navigation, statt zweier Attrappen.
 */
export const ScreenHeaderWithoutNav: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <StepHeader
        overline="Schritt 3 von 10"
        title="Buchungen"
        lead="Weiter und Zurück stehen unten in der ActionBar."
        actions={<ProgressBar done={41} total={118} />}
      />
    </div>
  ),
};

/* --- `layout="bar"` (0221): the head bar over the whole batch review --- */

const BAR_STEPS: RailItem[] = [
  { key: "start", index: 1, label: "Start", tone: "done", counterText: "Überblick", href: "#start" },
  { key: "questions", index: 2, label: "Rückfragen", tone: "open", counterText: "11 offen", href: "#questions", current: true },
  { key: "documents", index: 3, label: "Belege", tone: "open", counterText: "5 prüfen", href: "#documents" },
  { key: "accounts", index: 4, label: "Konten", tone: "open", counterText: "1 Warnung", href: "#accounts" },
  { key: "bookings", index: 5, label: "Buchungen", tone: "open", counterText: "109 offen", href: "#bookings" },
  { key: "handover", index: 6, label: "Übergeben", tone: "neutral", counterText: "an DATEV", href: "#handover" },
];

const BarHead = () => (
  <>
    <strong>Stapel 2026-0001 abnehmen</strong>
    <span className="v2sub">
      <DateRange from="2026-01-01" to="2026-01-31" size="sm" />
    </span>
  </>
);

/** The batch review of one batch: the batch and its period on the left, every step one click, its count below. */
export const Bar: Story = {
  render: () => <StepRail layout="bar" ariaLabel="Schritte der Abnahme" head={<BarHead />} items={BAR_STEPS} />,
};

/** A conditional step („Vorsteuer-Aufteilung" only for mixed input-tax use) is an ordinary item; the numbers move up. */
export const BarConditional: Story = {
  render: () => {
    const items: RailItem[] = [
      ...BAR_STEPS.slice(0, 5),
      { key: "vat", index: 6, label: "Vorsteuer-Aufteilung", tone: "open", counterText: "Quote bestätigen", href: "#vat" },
      { ...BAR_STEPS[5]!, index: 7 },
    ];
    return <StepRail layout="bar" ariaLabel="Schritte der Abnahme" head={<BarHead />} items={items} />;
  },
};

/** Every tone side by side: done, current, open, dimmed (not clickable, its reason as title), blocked (clickable — the page says why). */
export const BarStates: Story = {
  render: () => (
    <StepRail
      layout="bar"
      ariaLabel="Schritte der Abnahme"
      head={<BarHead />}
      items={[
        { key: "a", index: 1, label: "Start", tone: "done", counterText: "Überblick", href: "#a" },
        { key: "b", index: 2, label: "Rückfragen", tone: "done", counterText: "alle beantwortet", href: "#b" },
        { key: "c", index: 3, label: "Belege", tone: "open", counterText: "2 prüfen", href: "#c", current: true },
        { key: "d", index: 4, label: "Konten", tone: "open", counterText: "1 Warnung", href: "#d" },
        {
          key: "e",
          index: 5,
          label: "Buchungen",
          tone: "dimmed",
          counterText: "Ludwig bucht",
          href: null,
          disabledReason: "Ludwig bucht gerade nach. Die Vorschläge stehen hier, sobald der Durchgang fertig ist.",
        },
        { key: "f", index: 6, label: "Übergeben", tone: "blocked", counterText: "2 Sperren", href: "#f" },
      ]}
    />
  ),
};
