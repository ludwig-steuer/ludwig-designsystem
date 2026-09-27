import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { BatonMeta, ProcessPhase } from "@/ui/v3/patterns/Process";
import { ClientYearPage, type BatchEntry, type ClientYearVM, type Task } from "./ClientYearPage";

/**
 * The start page of a client's year (0207, brief F312) in the six scenarios of
 * §6. Invented client, invented numbers in the ranges of the page profile
 * (p50 86 · p90 190 open cases, documents p50 64).
 */
const meta: Meta = { title: "Seiten/Mandantenjahr", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

const HOLDER = {
  ludwig: { key: "agent", label: "Ludwig", color: "var(--color-accent-700)" },
  client: { key: "mandant", label: "Mandant", color: "var(--color-text-muted)" },
  datev: { key: "datev", label: "DATEV", color: "var(--color-text-muted)" },
  firm: { key: "kanzlei", label: "Kanzlei", color: "var(--color-primary)" },
} satisfies Record<string, BatonMeta>;

const MONTH = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const PHASES = ["Buchen", "Prüfen", "Übertragen", "Angekommen"];

function phases(at: number, status: ProcessPhase["status"] = "active"): ProcessPhase[] {
  return PHASES.map((label, i) => ({ key: label, label, sub: "", states: [], status: i < at ? "done" : i === at ? status : "pending" }));
}

/** Months 1..done in DATEV, then the open ones — newest first, as the history lists them. */
function history(done: number, open: { month: number; word: string; at: number; failed?: boolean }[] = []): BatchEntry[] {
  const entries: BatchEntry[] = [];
  for (let m = 1; m <= done; m++) {
    entries.push({ key: `b${m}`, period: MONTH[m - 1]!, number: `2026-000${m}`, state: "done", word: "in DATEV", phases: phases(4), href: `#stapel=${m}` });
  }
  for (const o of open) {
    entries.push({
      key: `b${o.month}`,
      period: MONTH[o.month - 1]!,
      number: `2026-000${o.month}`,
      state: o.failed ? "failed" : "open",
      word: o.word,
      phases: phases(o.at, o.failed ? "failed" : "active"),
      href: `#stapel=${o.month}`,
    });
  }
  return entries.reverse();
}

const PROFILE = {
  name: "Musterbau Schneider GmbH & Co. KG",
  datevNumber: "10234",
  chart: "SKR 04",
  taxation: "Soll-Versteuerung",
  rhythm: "monatlich",
  responsible: "M. Muster",
  mirrorAsOf: "24.09.2026 · vor 3 Tagen",
};

const TASKS: Task[] = [
  { key: "review", level: "warning", title: "Stapel 2026-0009 prüfen", sub: "August · 86 Buchungsvorschläge, 4 Rückfragen", action: { label: "Zur Abnahme", href: "#abnahme" } },
  { key: "questions", level: "info", title: "3 Rückfragen an die Kanzlei beantworten", sub: "älteste seit 12.09.2026", action: { label: "Rückfragen öffnen", href: "#rueckfragen" } },
  { key: "docs", level: "info", title: "5 Belege prüfen", sub: "Ludwig konnte sie nicht allein einordnen", action: { label: "Belege öffnen", href: "#belege" } },
];

const NORMAL: ClientYearVM = {
  year: 2026,
  profile: PROFILE,
  counts: { documents: 64, openCases: 86, inDatevUntil: "31.07.2026" },
  tasks: TASKS,
  elsewhere: [
    { holder: HOLDER.ludwig, text: "2 Stapel werden gebucht", href: "#stapel" },
    { holder: HOLDER.client, text: "1 Nachforderung offen, Frist 30.09.2026", href: "#nachforderungen" },
  ],
  batches: history(7, [{ month: 8, word: "Kanzlei prüft", at: 1 }]),
};

/** 1 — the usual case: three tasks of the practice, work with Ludwig and the client, the year at 7 of 12. */
export const Normal: Story = { render: () => <ClientYearPage vm={NORMAL} /> };

/** 2 — nothing to do: the empty list says what happens next; everything runs with Ludwig and DATEV. */
export const NothingToDo: Story = {
  render: () => (
    <ClientYearPage
      vm={{
        ...NORMAL,
        tasks: [],
        nextUp: "der nächste Stapel öffnet am 01.10.2026",
        elsewhere: [
          { holder: HOLDER.ludwig, text: "Stapel 2026-0009 wird gebucht", href: "#stapel=9" },
          { holder: HOLDER.datev, text: "Stapel 2026-0008 wartet auf die Bestätigung", href: "#stapel=8" },
        ],
        batches: history(7, [{ month: 8, word: "Ludwig bucht", at: 0 }]),
      }}
    />
  ),
};

/** 3 — something is stuck: the transfer failed, twelve documents to check, the batch overdue (F312 idea 7). */
export const Stuck: Story = {
  render: () => (
    <ClientYearPage
      vm={{
        ...NORMAL,
        tasks: [
          { key: "failed", level: "error", title: "Übertragung an DATEV gescheitert", sub: "Stapel 2026-0008 · DATEV meldet: Wirtschaftsjahr nicht angelegt", action: { label: "Zum Stapel", href: "#stapel=8" } },
          { key: "overdue", level: "warning", title: "Stapel August ist überfällig", sub: "die UStVA ist am 10.10.2026 fällig; der Stapel ist noch nicht freigegeben", action: { label: "Zur Abnahme", href: "#abnahme" } },
          { key: "docs", level: "warning", title: "12 Belege prüfen", sub: "Ludwig konnte sie nicht allein einordnen", action: { label: "Belege öffnen", href: "#belege" } },
        ],
        batches: history(6, [
          { month: 7, word: "Übertragung gescheitert", at: 2, failed: true },
          { month: 8, word: "Kanzlei prüft", at: 1 },
        ]),
      }}
    />
  ),
};

/** 4 — a new client: the setup waits for release, no batch yet, the year empty. */
export const NewClient: Story = {
  render: () => (
    <ClientYearPage
      vm={{
        ...NORMAL,
        profile: { ...PROFILE, name: "Holzhandel Weber e. K.", datevNumber: "10871", responsible: null, mirrorAsOf: null },
        counts: { documents: 0, openCases: 0, inDatevUntil: null },
        tasks: [{ key: "onboarding", level: "warning", title: "Einrichtung freigeben", sub: "Ludwig hat Kontenrahmen und Konten vorbereitet", action: { label: "Zur Einrichtung", href: "#onboarding" } }],
        elsewhere: [],
        batches: [],
      }}
    />
  ),
};

/** 5 — dense: nine tasks, 190 open cases — five stand open, the rest behind „alle anzeigen". */
export const Dense: Story = {
  render: () => (
    <ClientYearPage
      vm={{
        ...NORMAL,
        counts: { documents: 102, openCases: 190, inDatevUntil: "30.06.2026" },
        tasks: [
          ...TASKS,
          { key: "q2", level: "info", title: "Stapel 2026-0007 freigeben", sub: "Juli · alles geprüft", action: { label: "Zur Freigabe", href: "#f" } },
          { key: "d2", level: "info", title: "Kontoauszug 08/2026 zuordnen", sub: "Bankkonto fehlt", action: { label: "Zuordnen", href: "#k" } },
          { key: "d3", level: "info", title: "2 Dauerbuchungen bestätigen", sub: "Miete, Leasing", action: { label: "Bestätigen", href: "#d" } },
          { key: "d4", level: "info", title: "4 Rückfragen des Mandanten beantwortet", sub: "Antworten prüfen", action: { label: "Antworten lesen", href: "#a" } },
          { key: "d5", level: "info", title: "Belegart für 3 Scans festlegen", sub: "unbekanntes Formular", action: { label: "Festlegen", href: "#s" } },
          { key: "d6", level: "info", title: "Kreditkartenabrechnung zerlegen", sub: "9 Belege im Sammel-PDF", action: { label: "Öffnen", href: "#z" } },
        ],
        batches: history(6, [
          { month: 7, word: "freigegeben, wird übertragen", at: 2 },
          { month: 8, word: "Kanzlei prüft", at: 1 },
        ]),
      }}
    />
  ),
};

/** 6 — narrow (tablet): profile → tasks → batch history, stacked in this order. */
export const Narrow: Story = {
  render: () => (
    <div style={{ width: "48rem" }}>
      <ClientYearPage vm={NORMAL} />
    </div>
  ),
};
