import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ClarificationCard, type ClarificationDetailVM } from "@/ui/v3/entities/clarification/ClarificationCard";
import { ClarificationRow, type ClarificationVM } from "@/ui/v3/entities/clarification/Clarification";
import { Checklist, type ChecklistRow } from "@/ui/v3/patterns/Review";
import { StepRail, type RailItem } from "@/ui/v3/patterns/StepRail";
import { AppShell, TopBar } from "@/ui/v3/primitives/AppShell";
import { Banner } from "@/ui/v3/primitives/Banner";
import { Button } from "@/ui/v3/primitives/Button";
import { NavList, type NavSection } from "@/ui/v3/primitives/NavList";
import { Card, CardHead } from "@/ui/v3/primitives/Table";
import { ActionIcon, EntityIcon } from "@/ui/v3/Icons";

/**
 * Two screens for the presentation deck (request ludwig-orga 2026-09-29,
 * owner: from the design system). The client is Fakir Technology Consultants
 * GmbH (42606); every other name is invented — nothing from the pilot, no
 * personal data but the owner's. Shot at 1440 × 900.
 */
const meta: Meta = { title: "Seiten/Deck", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const CLIENT = "Fakir Technology Consultants GmbH · DATEV 42606 · 2026";

const ico = (e: Parameters<typeof EntityIcon>[0]["entity"]) => <EntityIcon entity={e} size={16} />;
const NAV: NavSection[] = [
  { label: "Übersicht", items: [{ label: "Übersicht", href: "/uebersicht", icon: ico("fiscal-year") }] },
  {
    label: "Buchung",
    items: [
      { label: "Eingang", href: "/eingang", icon: <ActionIcon action="upload" size={16} /> },
      { label: "Belege", href: "/belege", icon: ico("source-document") },
      { label: "Sachverhalte", href: "/sachverhalte", icon: ico("accounting-case") },
      { label: "Buchungsstapel", href: "/stapel", icon: ico("batch") },
      { label: "Banken", href: "/banken", icon: ico("bank-account") },
    ],
  },
  {
    label: "Stammdaten",
    items: [
      { label: "Geschäftspartner", href: "/partner", icon: ico("partner") },
      { label: "Konten", href: "/konten", icon: ico("ledger-account") },
    ],
  },
];

const STEPS: [string, string][] = [
  ["result", "Ergebnis des Stapels"],
  ["completeness", "Vollständigkeit"],
  ["questions", "Rückfragen"],
  ["proposals", "Buchungsvorschläge"],
  ["accounts", "Kontenausgleich"],
  ["opos", "Offene Posten"],
  ["plausibility", "Plausibilität"],
  ["conventions", "Konventionen"],
  ["protocol", "Prüfprotokoll"],
  ["handover", "Übergabe an DATEV"],
];

function rail(current: number, counters: Record<number, string>, tones: Record<number, RailItem["tone"]>): RailItem[] {
  return STEPS.map(([key, label], index) => ({
    key,
    index,
    label,
    tone: tones[index] ?? (index < current ? "done" : "neutral"),
    counterText: counters[index] ?? (index < current ? "erledigt" : null),
    href: `#step=${index}`,
    current: index === current,
  }));
}

function Frame({ current, rail: items, children }: { current: string; rail: RailItem[]; children: React.ReactNode }) {
  return (
    <AppShell topbar={<TopBar crumb={CLIENT} />} sidebar={<NavList sections={NAV} activePath="/stapel" />}>
      <div style={{ display: "grid", gridTemplateColumns: "240px minmax(0, 1fr)", gap: "var(--space-6)", padding: "var(--space-6)" }}>
        <StepRail items={items} ariaLabel="Schritte der Stapelabnahme" head={<p className="v2sub">Stapelabnahme · 09-2026-Ludwig</p>} />
        <div style={{ display: "grid", gap: "var(--space-4)", alignContent: "start", minWidth: 0 }}>{children}</div>
      </div>
      <span hidden>{current}</span>
    </AppShell>
  );
}

function StepHead({ step, title, sentence, next }: { step: number; title: string; sentence: string; next: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)" }}>
      <div>
        <p className="v2sub" style={{ margin: 0 }}>
          Schritt {step}
        </p>
        <h1 style={{ margin: 0, fontSize: "var(--fs-h2)" }}>{title}</h1>
        <p className="v2sub" style={{ margin: 0 }}>
          {sentence}
        </p>
      </div>
      <Button variant="primary">{next}</Button>
    </div>
  );
}

/* ── 1 · Rückfragen ─────────────────────────────────────────────────────── */

const Q_BASE = { severity: "required", type: "question", audience: "accounting" } as const;

// Six questions of the batch, four already answered (request ludwig-orga 2026-09-30).
const QUESTIONS: ClarificationVM[] = [
  { ...Q_BASE, id: "q1", title: "Team-Essen oder Bewirtung?", state: "open", raisedAt: "2026-09-26T09:12:00+02:00" },
  { ...Q_BASE, id: "q2", title: "Software-Abo: Lizenz oder Wartung?", state: "open", severity: "optional", raisedAt: "2026-09-26T09:14:00+02:00" },
  { ...Q_BASE, id: "q3", title: "Tankbeleg doppelt?", state: "answered", raisedAt: "2026-09-25T16:40:00+02:00", answeredAt: "2026-09-26T08:05:00+02:00" },
  { ...Q_BASE, id: "q4", title: "Parkgebühr: Reise oder Kfz?", state: "answered", raisedAt: "2026-09-25T16:42:00+02:00", answeredAt: "2026-09-26T08:07:00+02:00" },
  { ...Q_BASE, id: "q5", title: "Monitor: GWG oder Büromaterial?", state: "answered", raisedAt: "2026-09-24T11:20:00+02:00", answeredAt: "2026-09-25T09:30:00+02:00" },
  { ...Q_BASE, id: "q6", title: "Bahnticket: wer ist gereist?", state: "answered", raisedAt: "2026-09-24T11:22:00+02:00", answeredAt: "2026-09-25T09:31:00+02:00" },
];

const OPTION_CUSTOMER = "Kundenbewirtung: 70 % abzugsfähig (4650), 30 % nicht abzugsfähig (4654)";

const DETAIL: ClarificationDetailVM = {
  question: "Wie ist das Essen veranlasst?",
  context:
    "Der Restaurantbeleg nennt vier Personen, ein Bewirtungsbeleg mit Anlass und Teilnehmern liegt nicht vor. " +
    "Mitarbeiterbewirtung und Kundenbewirtung werden steuerlich verschieden behandelt.",
  text: "",
  // Names option 1 verbatim, so it is the preselection (rule S13).
  recommendation: OPTION_CUSTOMER,
  facts: [
    { label: "Betrag", value: "186,40 € (Speisen 152,90 €, Getränke 33,50 €)" },
    { label: "Personen laut Beleg", value: "4" },
    { label: "Datum", value: "18.09.2026, 19:40" },
    { label: "Bewirtungsbeleg", value: "liegt nicht vor" },
  ],
  questionType: "agent_clarification",
  sourceModule: "booking-module",
  answerKind: "single_choice",
  answerOptions: [
    OPTION_CUSTOMER,
    "Team-Event / Mitarbeiterbewirtung: 100 % Freiwillige soziale Aufwendungen (4140)",
    "Arbeitsessen ohne Anlass, nicht abzugsfähig (4654)",
    "Privat veranlasst, keine Betriebsausgabe (1800)",
  ],
  allowFreeText: true,
};

/** Stapelabnahme, Schritt 2: three different questions, one unfolded and answered in one click. */
export const Questions: Story = {
  render: () => (
    <Frame current="2" rail={rail(2, { 2: "2 von 6 offen", 3: "41 von 118 offen" }, { 2: "open", 3: "open" })}>
      <StepHead
        step={2}
        title="Rückfragen"
        sentence="Die Fragen von Ludwig beantworten, damit er die betroffenen Sachverhalte fertig buchen kann."
        next="Weiter zu den Buchungsvorschlägen"
      />
      <div style={{ display: "grid", gridTemplateColumns: "416px minmax(0, 1fr)", gap: "var(--space-4)", alignItems: "start" }}>
        <Card>
          <CardHead title="Fragen an die Kanzlei" meta={<span className="v2muted">6</span>} />
          <div>
            {QUESTIONS.map((q) => (
              <ClarificationRow key={q.id} clarification={q} active={q.id === "q1"} />
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ padding: "var(--space-4)" }}>
            <ClarificationCard
              clarification={{ ...QUESTIONS[0]!, ...DETAIL }}
              mode="answer"
              caseLink={{ label: "Sachverhalt 2026-0142 · Trattoria Da Enzo", href: "#case=2026-0142" }}
              onAnswer={async () => {}}
              onResolve={async () => {}}
              onDefer={async () => {}}
              onSelect={() => {}}
            />
          </div>
        </Card>
      </div>
    </Frame>
  ),
};

/* ── 2 · Prüfprotokoll ──────────────────────────────────────────────────── */

const CHECKS: ChecklistRow[] = [
  { key: "completeness", state: "done", label: "Belege vollständig für den Zeitraum", counter: "231 von 231", progress: 1, jump: "Schritt 1" },
  { key: "questions", state: "done", label: "Rückfragen beantwortet", counter: "3 von 3", progress: 1, jump: "Schritt 2" },
  { key: "proposals", state: "done", label: "Buchungsvorschläge freigegeben", counter: "118 von 118", progress: 1, jump: "Schritt 3" },
  { key: "bank", state: "done", label: "Bankkonten ausgeglichen", counter: "2 von 2", progress: 1, jump: "Schritt 4" },
  { key: "clearing", state: "done", label: "Verrechnungskonten auf null", counter: "3 von 3", progress: 1, jump: "Schritt 4" },
  { key: "opos", state: "done", label: "Offene Posten abgeglichen", counter: "12 von 12", progress: 1, jump: "Schritt 5" },
  { key: "vat", state: "done", label: "Umsatzsteuer plausibel", counter: "5 von 5", progress: 1, jump: "Schritt 6" },
  { key: "conventions", state: "done", label: "Konventionen der Kanzlei eingehalten", counter: "3 von 3", progress: 1, jump: "Schritt 7" },
  { key: "numbers", state: "done", label: "Belegnummern eindeutig", counter: "231 von 231", progress: 1, jump: "Schritt 1" },
];

/** Stapelabnahme, Schritt 8: every check passed, no blocker — ready for the handover. */
export const Protocol: Story = {
  render: () => (
    <Frame current="8" rail={rail(8, { 8: "bereit" }, { 8: "done" })}>
      <StepHead
        step={8}
        title="Prüfprotokoll"
        sentence="Alle Prüfungen des Stapels auf einen Blick — erst wenn nichts blockiert, geht er an DATEV."
        next="Weiter zur Übergabe"
      />
      <Banner tone="success" title="Bereit zur Übergabe">
        Alle 9 Prüfpunkte sind erfüllt, kein Blocker. Der Stapel 09-2026-Ludwig kann an DATEV übergeben werden.
      </Banner>
      <Checklist rows={CHECKS} />
    </Frame>
  ),
};
