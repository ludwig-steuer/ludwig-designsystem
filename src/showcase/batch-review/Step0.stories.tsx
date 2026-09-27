import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Step0Result, type Step0Task, type Step0VM } from "./Step0Result";

/**
 * Step 0 of the batch review, „Ergebnis des Stapels" (0208, brief F314) — the
 * nine situations of §4. Invented batch; the counts follow the example of the
 * brief (231 documents, 97 bank transactions).
 */
const meta: Meta = { title: "Seiten/Stapelabnahme/Schritt 0", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

const T = (key: string, label: string, counter: string, step: number, sub?: string): Step0Task => ({
  key,
  label,
  counter,
  step: { label: `Schritt ${step}`, href: `#step=${step}` },
  ...(sub ? { sub } : {}),
});

const ALL_DONE: Step0Task[] = [
  T("docs", "Belege bearbeitet", "231 von 231", 2),
  T("bank", "Bank-Transaktionen zugeordnet", "97 von 97", 4),
  T("cases", "Sachverhalte gebucht oder mit Rückfrage", "86 von 86", 3),
  T("questions", "Rückfragen gestellt", "4", 2),
  T("recurring", "Dauerbuchungen erzeugt", "6 von 6", 5),
  T("opos", "Offene Posten abgeglichen", "12 von 12", 6),
  T("conventions", "Konventionen geprüft", "3 von 3", 7),
];

const REPORT = {
  findings: [
    "Miete August bei Hausverwaltung Meier fehlt auf dem Kontoauszug — die Lastschrift kam erst am 02.09.",
    "Zwei Tankbelege (Aral, 12.08. und 14.08.) haben dieselbe Belegnummer; einer ist vermutlich doppelt eingereicht.",
    "Rechnung Büro Schmidt KG RE-4471 enthält eine Bewirtung — als 70/30 gebucht, bitte prüfen.",
  ],
  summary:
    "231 Belege eingeordnet und ausgelesen, 86 Sachverhalte gebildet, 97 Bank-Transaktionen zugeordnet. " +
    "4 Rückfragen an die Kanzlei gestellt (Bewirtung, zwei Doppelbelege, eine Privatentnahme). " +
    "6 Dauerbuchungen (Miete, Leasing, Versicherungen) aus den Regeln erzeugt.",
};

const BASE: Step0VM = {
  kind: "regular",
  run: { state: "done", number: 1, from: "25.09., 08:29", to: "08:55" },
  open: [],
  done: ALL_DONE,
  coverage: { complete: true, sentence: "Bank gebucht bis 31.08. — der Zeitraum ist voll." },
  report: REPORT,
};

const THREE_OPEN: Pick<Step0VM, "open" | "done"> = {
  open: [
    { ...T("docs", "Belege bearbeitet", "228 von 231", 2, "3 offen, z. B. RE-4471 · Büro Schmidt KG"), level: "warning" },
    { ...T("bank", "Bank-Transaktionen zugeordnet", "95 von 97", 4, "2 ohne Beleg, z. B. 02.08. Lastschrift Telekom 49,90 €"), level: "warning" },
  ],
  done: ALL_DONE.filter((t) => t.key !== "docs" && t.key !== "bank"),
};

/** 1 — Ludwig is still at work: the verdict says so with the time; the list is provisional. */
export const Running: Story = {
  render: () => <Step0Result vm={{ ...BASE, run: { state: "running", number: 1, from: "08:29" }, report: null }} />,
};

/** 2 — done, checklist green, run ended normally: one green verdict, the tasks folded, findings first. */
export const Done: Story = { render: () => <Step0Result vm={BASE} /> };

/** 3 — done, but Ludwig reported the run as incomplete: the reason is part of the one verdict, with „Zurück an Ludwig". */
export const DoneReportedIncomplete: Story = {
  render: () => (
    <Step0Result
      vm={{
        ...BASE,
        incomplete: { at: "25.09., 08:55", reason: "Der Kontoauszug September fehlt noch; die Buchungen ab 01.09. habe ich nicht angefasst." },
      }}
    />
  ),
};

/** 4 — not finished in three places: warning, the three open ones first with count, example and jump; the period gap is one of them. */
export const OpenPlaces: Story = {
  render: () => (
    <Step0Result
      vm={{
        ...BASE,
        ...THREE_OPEN,
        coverage: { complete: false, sentence: "Bank gebucht bis 24.08. — 7 Tage fehlen.", step: { label: "Schritt 1", href: "#step=1" } },
      }}
    />
  ),
};

/** 5 — open places and Ludwig's own report of incompleteness: still one verdict. */
export const OpenPlacesReportedIncomplete: Story = {
  render: () => (
    <Step0Result
      vm={{
        ...BASE,
        ...THREE_OPEN,
        incomplete: { at: "25.09., 08:55", reason: "Drei Belege waren unleserlich; ich habe sie nicht gebucht." },
      }}
    />
  ),
};

/** 6 — moment B: run 2 after the practice's return, visible in the verdict; the new report. */
export const SecondRunAfterReturn: Story = {
  render: () => (
    <Step0Result
      vm={{
        ...BASE,
        run: { state: "done", number: 2, from: "25.09., 14:02", to: "14:20", afterReturn: "24.09." },
        report: {
          findings: ["Die Bewirtung RE-4471 ist jetzt 70/30 gebucht, wie von Ihnen beanstandet."],
          summary: "Ihre drei Punkte aus der Rückgabe bearbeitet; keine neuen Belege seit dem 24.09.",
        },
      }}
    />
  ),
};

/** 7 — no report: one sentence, no empty card. */
export const NoReport: Story = { render: () => <Step0Result vm={{ ...BASE, report: null }} /> };

/** 8 — client batch: only the rows that apply there; completeness means the personal accounts. */
export const ClientBatch: Story = {
  render: () => (
    <Step0Result
      vm={{
        ...BASE,
        kind: "client_batch",
        done: [
          T("questions", "Rückfragen gestellt", "2", 2),
          T("release", "Freigabe vorbereitet", "1 von 1", 8),
          T("probe", "Probe-Export geprüft", "ohne Fehler", 9),
        ],
        coverage: { complete: false, sentence: "3 Personenkonten ohne Namen.", step: { label: "Stammdaten", href: "#masterdata" } },
        report: { findings: [], summary: "Mandantenstapel Kassenbuch August eingelesen, 42 Sätze." },
      }}
    />
  ),
};

/** 9 — moment C: long handed over; the verdict in the past, no button, the list folded, the report to read. */
export const HandedOver: Story = {
  render: () => (
    <Step0Result
      vm={{
        ...BASE,
        handedOver: true,
        incomplete: { at: "25.09., 08:55", reason: "Der Kontoauszug September fehlt noch." },
      }}
    />
  ),
};
