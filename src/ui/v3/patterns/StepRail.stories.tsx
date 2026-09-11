import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ProgressBar, StepHeader, StepRail, type RailItem } from "./StepRail";

const meta: Meta<typeof StepRail> = { title: "v3/Patterns/Frame/StepRail", component: StepRail };
export default meta;
type Story = StoryObj<typeof StepRail>;

const STEPS: RailItem[] = [
  { key: "0", index: 0, label: "Ergebnis des Stapels", sub: "Was der Agent geschafft hat", tone: "neutral", counterText: null, href: "#" },
  { key: "1", index: 1, label: "Vollständigkeit", sub: "Belege, Bank, Salden", tone: "done", counterText: "erledigt", href: "#" },
  { key: "2", index: 2, label: "Rückfragen", sub: "Fragen, Overrides", tone: "open", counterText: "2 von 5 offen", href: "#" },
  { key: "3", index: 3, label: "Buchungsvorschläge", sub: "Sachverhalt für Sachverhalt", tone: "open", counterText: "14 von 116 offen", href: "#", current: true },
  { key: "4", index: 4, label: "Bank", sub: "Auszug gegen Buchung", tone: "open", counterText: "1 von 2 offen", href: "#" },
  { key: "5", index: 5, label: "Offene Posten", sub: "Wer schuldet wem", tone: "done", counterText: "nichts überfällig", href: "#" },
  { key: "6", index: 6, label: "Plausibilität", sub: "Konten gegen Vormonate", tone: "open", counterText: "7 auffällig", href: "#" },
  { key: "7", index: 7, label: "Konventionen", sub: "Was der Agent gelernt hat", tone: "open", counterText: "2 von 3 offen", href: "#" },
  { key: "8", index: 8, label: "Prüfprotokoll", sub: "Freigeben oder zurückgeben", tone: "blocked", counterText: "3 Blocker", href: "#" },
  { key: "9", index: 9, label: "Übergabe an DATEV", sub: "Weg zu DATEV", tone: "neutral", counterText: null, href: "#" },
  { key: "10", index: 10, label: "Nachlese", sub: "Was DATEV anders gemacht hat", tone: "dimmed", counterText: null, href: null, disabledReason: "Die Nachlese füllt sich, sobald DATEV den Stapel gespiegelt hat." },
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

/** Der Screen-Header: Nummer in der Overline, die Sache in der Überschrift. */
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
