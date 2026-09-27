import type { BatonMeta, LogEntry, ProcessPhase, ProcessPhaseStatus } from "@/ui/v3";
import type { ProcessDialogDetail, ProcessLevel, ProcessPicture, ProcessStep } from "@/ui/v3/patterns/ProcessPicture";

/**
 * The scenarios of brief F305 §7 as data for the three sizes (0204). Invented
 * values, nothing from staging. The app derives the same view model in
 * `document-process.ts`; here it is written out by hand so every scenario can
 * be seen before the app connects.
 */

export const HOLDER = {
  processing: { key: "processing", label: "Verarbeitung", color: "var(--color-text-muted)" },
  agent: { key: "agent", label: "Ludwig", color: "var(--color-accent-700)" },
  firm: { key: "kanzlei", label: "Kanzlei", color: "var(--color-primary)" },
  client: { key: "mandant", label: "Mandant", color: "var(--color-text-muted)" },
  datev: { key: "datev", label: "DATEV", color: "var(--color-text-muted)" },
  nobody: { key: "niemand", label: "niemand", color: "var(--color-text-subtle)" },
} satisfies Record<string, BatonMeta>;

type PhaseDef = { key: string; label: string; holder: BatonMeta };

const INTAKE: PhaseDef = { key: "intake", label: "Eingang", holder: HOLDER.client };
const EXTRACT: PhaseDef = { key: "extraction", label: "Auslesen", holder: HOLDER.processing };

/** The path of each document kind (F305 §3.2): which phases exist, and their steps. */
export const PATHS = {
  invoice: {
    label: "Weg einer Rechnung",
    phases: [
      INTAKE,
      EXTRACT,
      { key: "booking", label: "Buchen", holder: HOLDER.agent },
      { key: "review", label: "Prüfen", holder: HOLDER.firm },
      { key: "handover", label: "DATEV", holder: HOLDER.datev },
    ],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Dateikorb freigegeben"],
      ["extraction", "Einordnen"],
      ["extraction", "Auslesen"],
      ["extraction", "Werte prüfen"],
      ["booking", "Sachverhalt zuordnen"],
      ["booking", "Buchung vorschlagen"],
      ["review", "Buchung prüfen"],
      ["handover", "An DATEV übergeben"],
      ["handover", "In DATEV bestätigt"],
    ],
  },
  attachment: {
    label: "Weg eines Lieferscheins",
    phases: [INTAKE, EXTRACT, { key: "assign", label: "Zuordnen", holder: HOLDER.agent }],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Dateikorb freigegeben"],
      ["extraction", "Einordnen"],
      ["extraction", "Auslesen"],
      ["assign", "Sachverhalt zuordnen"],
      ["assign", "Erledigen"],
    ],
  },
  foundation: {
    label: "Weg eines Vertrags",
    phases: [INTAKE, EXTRACT, { key: "assign", label: "Zuordnen", holder: HOLDER.agent }],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Dateikorb freigegeben"],
      ["extraction", "Einordnen"],
      ["extraction", "Auslesen"],
      ["assign", "Sachverhalt zuordnen"],
      ["assign", "Erledigen"],
    ],
  },
  statement: {
    label: "Weg eines Kontoauszugs",
    phases: [INTAKE, { key: "import", label: "Import", holder: HOLDER.processing }],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Dateikorb freigegeben"],
      ["import", "Einordnen"],
      ["import", "Umsätze einlesen"],
      ["import", "Salden prüfen"],
    ],
  },
  report: {
    label: "Weg einer Auswertung",
    phases: [INTAKE, EXTRACT, { key: "acknowledge", label: "Quittieren", holder: HOLDER.agent }],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Dateikorb freigegeben"],
      ["extraction", "Einordnen"],
      ["extraction", "Auslesen"],
      ["acknowledge", "Quittieren"],
    ],
  },
  collection: {
    label: "Weg eines Sammel-PDFs",
    phases: [
      INTAKE,
      { key: "split", label: "Zerlegen", holder: HOLDER.processing },
      { key: "children", label: "Teilbelege", holder: HOLDER.agent },
    ],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Dateikorb freigegeben"],
      ["split", "Einordnen"],
      ["split", "Zerlegen"],
      ["children", "Teilbelege erledigen"],
    ],
  },
  unknown: {
    label: "Weg eines unbekannten Belegs",
    phases: [INTAKE, EXTRACT],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Dateikorb freigegeben"],
      ["extraction", "Einordnen"],
      ["extraction", "Auslesen"],
    ],
  },
  delivery: {
    label: "Weg einer DATEV-Lieferung",
    phases: [INTAKE],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Über Import erledigt"],
    ],
  },
} satisfies Record<string, { label: string; phases: PhaseDef[]; steps: [string, string][] }>;

export type PathKey = keyof typeof PATHS;

/** The reading stages of an invoice — sub-steps of „Auslesen". */
const STAGES = ["Eingeordnet", "Ausgelesen", "Aufbereitet", "Gedeutet"];

function stamp(i: number): string {
  const minute = String(14 + i).padStart(2, "0");
  return `12.09.2026 09:${minute}`;
}

export interface Scenario {
  id: string;
  /** Short description for the story list. */
  name: string;
  sizes: ("cell" | "box" | "dialog")[];
  picture: ProcessPicture;
  detail: ProcessDialogDetail;
}

interface Spec {
  id: string;
  name: string;
  sizes: string;
  path: PathKey;
  /** Index of the phase where the document stands; `phases.length` = all done. */
  at: number;
  /** Status of that phase. */
  status?: ProcessPhaseStatus;
  /** Keep only the first n phases (shortened path, F305 §3.2). */
  keep?: number;
  /** Index into the path's steps: steps before are done, this one carries `status`. */
  step: number;
  headline: string;
  level?: ProcessLevel;
  holder: BatonMeta;
  note?: string;
  running?: ProcessPicture["running"];
  next?: string | null;
  explanation: string;
  reason?: string;
  detailNote?: string;
  end?: string;
  title?: string;
  links?: { label: string; href: string }[];
  history?: LogEntry[] | "error";
  loops?: ProcessDialogDetail["loops"];
  stage?: number;
  technical: Record<string, string>;
}

function build(s: Spec): Scenario {
  const path = PATHS[s.path];
  const defs = path.phases.slice(0, s.keep ?? path.phases.length);
  const phaseStatus = s.status ?? "active";
  const phases: ProcessPhase[] = defs.map((d, i) => ({
    key: d.key,
    label: d.label,
    sub: d.holder.label,
    states: [],
    status: i < s.at ? "done" : i === s.at ? phaseStatus : "pending",
    ...(i === s.at && (phaseStatus === "held" || phaseStatus === "failed") && s.note ? { note: s.note } : {}),
  }));
  const keys = new Set(defs.map((d) => d.key));
  const steps: ProcessStep[] = path.steps
    .filter(([phase]) => keys.has(phase))
    .map(([phase, label], i) => {
      const status: ProcessPhaseStatus = i < s.step ? "done" : i === s.step ? phaseStatus : "pending";
      const def = defs.find((d) => d.key === phase)!;
      const step: ProcessStep = {
        phase,
        label,
        status,
        at: status === "done" ? stamp(i) : undefined,
        actor: def.holder.key === "niemand" ? undefined : def.holder.label,
      };
      if (s.path === "invoice" && label === "Auslesen" && s.stage !== undefined) {
        step.sub = STAGES.map((l, j) => ({ label: l, status: j < s.stage! ? "done" : j === s.stage ? phaseStatus : "pending" }));
      }
      return step;
    });
  const since: Record<string, string> = {};
  defs.forEach((d, i) => {
    if (i < s.at) since[d.key] = `${12 + i}.09.`;
  });
  return {
    id: s.id,
    name: s.name,
    sizes: [...(s.sizes.includes("Z") ? ["cell" as const] : []), ...(s.sizes.includes("B") ? ["box" as const] : []), ...(s.sizes.includes("D") ? ["dialog" as const] : [])],
    picture: {
      phases,
      headline: s.headline,
      level: s.level ?? "none",
      holder: s.holder,
      running: s.running ?? null,
      next: s.next ?? null,
    },
    detail: {
      title: s.title ?? "RE-2026-0815 · Musterbau Schneider GmbH & Co. KG",
      pathLabel: path.label,
      explanation: s.explanation,
      reason: s.reason,
      note: s.detailNote,
      end: s.end,
      phaseSince: since,
      steps,
      loops: s.loops,
      history: s.history ?? [],
      historyHref: "#tab=history",
      technical: Object.entries(s.technical),
      links: s.links,
    },
  };
}

const T = (status: string, extra: Record<string, string> = {}) => ({
  status,
  review_reason: "—",
  processing_stage: "—",
  job: "—",
  done_via: "—",
  ...extra,
});

const CASE_LINK = { label: "Zum Sachverhalt 2026-0334 · Büromaterial August", href: "#case=2026-0334" };
const BATCH_LINK = { label: "Zum Stapel 2026-0009", href: "#batch=2026-0009" };

const HISTORY: LogEntry[] = [
  { id: "h1", at: "2026-09-12T09:14:00+02:00", message: "Datei angekommen (Upload durch den Mandanten)", level: "info", actor: { kind: "user", label: "Mandant" } },
  { id: "h2", at: "2026-09-12T09:16:00+02:00", message: "Als Rechnung eingeordnet", level: "info", actor: { kind: "system", label: "Verarbeitung" } },
  { id: "h3", at: "2026-09-13T08:02:00+02:00", message: "An die Kanzlei übergeben: Leistungszeitraum und USt-IdNr. fehlen", level: "warning", actor: { kind: "agent", label: "Ludwig" } },
];

const LONG_NOTE =
  "Ludwig hat die Rechnung an die Kanzlei gegeben: Der Leistungszeitraum fehlt, die USt-IdNr. des Lieferanten ist nicht lesbar, und der Betrag weicht um 0,12 € von der Summe der Positionen ab. Bitte prüfen Sie, ob eine Teillieferung vorliegt, und ergänzen Sie die fehlenden Angaben am Beleg.";

export const SCENARIOS: Scenario[] = [
  // ── 7.1 invoice ──
  build({ id: "S01", name: "Verarbeitung eingeplant", sizes: "ZBD", path: "invoice", at: 1, step: 2, headline: "Wird eingeordnet", level: "info", holder: HOLDER.processing, running: { since: "eingeplant", live: true }, next: "Ludwig ordnet den Beleg einem Sachverhalt zu und schlägt die Buchung vor.", explanation: "Der Beleg ist angekommen und wartet auf die Verarbeitung.", technical: T("pending", { job: "extract · queued" }) }),
  build({ id: "S02", name: "Wird ausgelesen, Stufe aufbereitet", sizes: "ZBD", path: "invoice", at: 1, step: 3, stage: 2, headline: "Wird ausgelesen", level: "info", holder: HOLDER.processing, running: { since: "seit 40 s", live: true }, next: "Ludwig ordnet den Beleg einem Sachverhalt zu und schlägt die Buchung vor.", explanation: "Ludwig liest die Werte der Rechnung aus.", technical: T("extracting", { processing_stage: "preprocessed", job: "extract · running" }) }),
  build({ id: "S03", name: "Auslese ohne Rückmeldung", sizes: "BD", path: "invoice", at: 1, status: "held", note: "keine Rückmeldung", step: 3, stage: 2, headline: "Verarbeitung hängt", level: "warning", holder: HOLDER.processing, running: { since: "seit 90 s ohne Rückmeldung" }, next: "Nach der Korrektur geht der Beleg weiter.", explanation: "Die Auslese hat seit 90 Sekunden kein Lebenszeichen gegeben.", technical: T("extracting", { processing_stage: "preprocessed", job: "extract · running · stalled" }) }),
  build({ id: "S04", name: "Werte fehlen", sizes: "ZBD", path: "invoice", at: 1, status: "held", note: "Werte fehlen", step: 4, headline: "Werte fehlen", level: "warning", holder: HOLDER.agent, next: "Nach der Korrektur geht der Beleg weiter.", reason: "Werte fehlen", explanation: "Ludwig ergänzt Leistungszeitraum und Steuersatz.", technical: T("agent_review", { review_reason: "open_findings", processing_stage: "interpreted" }) }),
  build({ id: "S05", name: "Auslese abgebrochen", sizes: "ZBD", path: "invoice", at: 1, status: "failed", note: "Auslese abgebrochen", step: 3, stage: 1, headline: "Auslese abgebrochen", level: "error", holder: HOLDER.agent, next: "Nach der Korrektur geht der Beleg weiter.", reason: "Auslese abgebrochen", explanation: "Das Verfahren ist beim Aufbereiten stehen geblieben.", detailNote: "Seite 2 ist ein Bild ohne Text; die Texterkennung lieferte nichts.", technical: T("agent_review", { review_reason: "extraction_error", processing_stage: "extracted", job: "extract · failed" }) }),
  build({ id: "S06", name: "Von Ludwig an die Kanzlei gegeben", sizes: "ZBD", path: "invoice", at: 1, status: "held", note: "Kanzlei prüft", step: 4, headline: "Kanzlei prüft", level: "warning", holder: HOLDER.firm, next: "Nach Ihrer Entscheidung geht der Beleg weiter.", reason: "Von Ludwig übergeben", explanation: "Ludwig konnte den Beleg nicht allein klären.", detailNote: LONG_NOTE, history: HISTORY, technical: T("human_review", { review_reason: "open_findings", processing_stage: "interpreted" }) }),
  build({ id: "S07", name: "Bereit zur Buchung, ohne Sachverhalt", sizes: "ZBD", path: "invoice", at: 2, step: 5, headline: "Bereit zur Buchung", holder: HOLDER.agent, next: "Die Kanzlei prüft die Buchung in der Abnahme des Stapels.", explanation: "Der Beleg ist ausgelesen. Ludwig ordnet ihn einem Sachverhalt zu und schlägt die Buchung vor.", technical: T("bookable", { processing_stage: "interpreted" }) }),
  build({ id: "S08", name: "Bereit zur Buchung, mit Sachverhalt", sizes: "BD", path: "invoice", at: 2, step: 6, headline: "Bereit zur Buchung", holder: HOLDER.agent, next: "Die Kanzlei prüft die Buchung in der Abnahme des Stapels.", explanation: "Der Beleg gehört zum Sachverhalt 2026-0334. Ludwig schlägt die Buchung vor.", links: [CASE_LINK], technical: T("bookable", { processing_stage: "interpreted" }) }),
  build({ id: "S09", name: "Vorgeschlagen", sizes: "ZBD", path: "invoice", at: 3, step: 7, headline: "Vorgeschlagen", holder: HOLDER.firm, next: "Angenommene Buchungen gehen mit dem Stapel an DATEV.", explanation: "Ludwig hat die Buchung vorgeschlagen. Sie prüfen sie in der Abnahme des Stapels.", links: [CASE_LINK, BATCH_LINK], technical: T("done", { done_via: "booking", entry: "proposed" }) }),
  build({ id: "S10", name: "Angenommen", sizes: "ZBD", path: "invoice", at: 4, step: 8, headline: "Angenommen", holder: HOLDER.datev, next: "Der Stapel wird an DATEV übergeben.", explanation: "Die Kanzlei hat die Buchung angenommen. Sie wartet auf die Übergabe.", links: [CASE_LINK, BATCH_LINK], technical: T("done", { done_via: "booking", entry: "accepted" }) }),
  build({ id: "S11", name: "Übergeben, nicht bestätigt", sizes: "ZD", path: "invoice", at: 4, step: 9, headline: "Übergeben", holder: HOLDER.datev, next: "DATEV bestätigt den Stapel.", explanation: "Die Buchung ist an DATEV übergeben, die Bestätigung steht aus.", links: [BATCH_LINK], technical: T("done", { done_via: "booking", entry: "exported" }) }),
  build({ id: "S12", name: "In DATEV", sizes: "ZBD", path: "invoice", at: 5, step: 10, headline: "In DATEV", holder: HOLDER.nobody, explanation: "Die Buchung steht in DATEV. Für diesen Beleg ist nichts mehr zu tun.", links: [CASE_LINK, BATCH_LINK], technical: T("done", { done_via: "booking", entry: "in_datev" }) }),
  build({ id: "S13", name: "Keine Buchung nötig", sizes: "ZBD", path: "invoice", keep: 3, at: 3, step: 7, headline: "Keine Buchung nötig", holder: HOLDER.nobody, end: "Keine Buchung nötig", explanation: "Ludwig hat begründet, warum keine Buchung entsteht.", detailNote: "Rechnung ist bereits über die Kreditkartenabrechnung vom 31.08.2026 gebucht.", technical: T("done", { done_via: "no_booking_required" }) }),
  build({ id: "S14", name: "Wieder geöffnet", sizes: "BD", path: "invoice", at: 2, step: 6, headline: "Bereit zur Buchung", holder: HOLDER.agent, next: "Die Kanzlei prüft die Buchung in der Abnahme des Stapels.", explanation: "Die Kanzlei hat den erledigten Beleg wieder geöffnet. Ludwig bucht neu.", detailNote: "Einwand der Kanzlei: Das Konto 4930 ist falsch, Bürobedarf gehört auf 4910.", loops: { reopened: 1, returned: 0 }, links: [CASE_LINK], technical: T("bookable", { processing_stage: "interpreted" }) }),
  build({ id: "S15", name: "Ersetzt", sizes: "ZD", path: "invoice", keep: 3, at: 3, step: 7, headline: "Ersetzt", holder: HOLDER.nobody, end: "Ersetzt durch eine neue Datei", explanation: "Der Mandant hat eine korrigierte Rechnung geschickt.", links: [{ label: "Zum Nachfolger RE-2026-0815-K", href: "#doc=RE-2026-0815-K" }], technical: T("done", { done_via: "superseded" }) }),
  {
    ...build({ id: "S16", name: "Gelöscht", sizes: "ZB", path: "invoice", at: 0, step: 0, headline: "Gelöscht", holder: HOLDER.nobody, explanation: "Der Beleg ist gelöscht.", technical: T("deleted") }),
    picture: { phases: [], headline: "Gelöscht", level: "none", holder: HOLDER.nobody, next: null },
  },
  // ── 7.2 other paths ──
  build({ id: "S20", name: "Kontoauszug: Bankkonto fehlt", sizes: "ZBD", path: "statement", at: 1, status: "held", note: "Bankkonto fehlt", step: 3, headline: "Bankkonto fehlt", level: "warning", holder: HOLDER.firm, next: "Nach Ihrer Entscheidung geht der Beleg weiter.", reason: "Bankkonto fehlt", explanation: "Zur IBAN DE12 5001 0517 0648 4898 90 gibt es noch kein Bankkonto.", title: "Kontoauszug 08/2026 · Sparkasse Musterstadt", technical: T("human_review", { review_reason: "statement_account_missing" }) }),
  build({ id: "S21", name: "Kontoauszug geht nicht auf", sizes: "ZBD", path: "statement", at: 1, status: "failed", note: "geht nicht auf", step: 4, headline: "Kontoauszug geht nicht auf", level: "error", holder: HOLDER.firm, next: "Nach Ihrer Entscheidung geht der Beleg weiter.", reason: "Kontoauszug geht nicht auf", explanation: "Anfangssaldo plus Umsätze ergibt nicht den Endsaldo.", detailNote: "Anfangssaldo 12.480,17 € + Umsätze −3.912,40 € = 8.567,77 €, Endsaldo laut Auszug 8.617,77 € — es fehlen 50,00 €.", title: "Kontoauszug 08/2026 · Sparkasse Musterstadt", technical: T("human_review", { review_reason: "statement_check_failed" }) }),
  build({ id: "S22", name: "Kontoauszug importiert", sizes: "ZBD", path: "statement", at: 2, step: 5, headline: "Über Import erledigt", holder: HOLDER.nobody, end: "Über Import erledigt", explanation: "64 Umsätze sind eingelesen, die Salden gehen auf.", title: "Kontoauszug 08/2026 · Sparkasse Musterstadt", technical: T("done", { done_via: "import" }) }),
  build({ id: "S23", name: "Kontoauszug abgelehnt", sizes: "ZD", path: "statement", keep: 2, at: 2, step: 5, headline: "Abgelehnt", holder: HOLDER.nobody, end: "Abgelehnt", explanation: "Der Auszug gehört nicht zu diesem Mandanten.", detailNote: "IBAN gehört zur Privatperson des Geschäftsführers.", title: "Kontoauszug 08/2026 · Volksbank", technical: T("done", { done_via: "rejected" }) }),
  build({ id: "S24", name: "Kontoauszug als PDF ohne Auslese", sizes: "ZD", path: "statement", at: 1, status: "held", note: "keine Auslese", step: 3, headline: "Keine automatische Auslese", level: "warning", holder: HOLDER.agent, next: "Nach der Korrektur geht der Beleg weiter.", reason: "Keine automatische Auslese", explanation: "Für dieses Auszugsformat gibt es kein Verfahren.", title: "Kontoauszug 08/2026 · Privatbank (PDF)", technical: T("agent_review", { review_reason: "manual_extraction" }) }),
  build({ id: "S25", name: "Sammel-PDF wird zerlegt", sizes: "ZBD", path: "collection", at: 1, step: 3, headline: "Wird ausgelesen", level: "info", holder: HOLDER.processing, running: { since: "seit 12 s", live: true }, next: "Die Teilbelege gehen jeden ihren eigenen Weg.", explanation: "Ludwig zerlegt das Sammel-PDF in einzelne Belege.", title: "Sammel-PDF Tankbelege August (23 Seiten)", technical: T("extracting", { job: "split · running" }) }),
  build({ id: "S26", name: "Sammel-PDF nicht zerlegt", sizes: "ZBD", path: "collection", at: 1, status: "held", note: "nicht zerlegt", step: 3, headline: "Sammel-PDF nicht zerlegt", level: "warning", holder: HOLDER.agent, next: "Nach der Korrektur geht der Beleg weiter.", reason: "Sammel-PDF nicht zerlegt", explanation: "Die Seitengrenzen der Belege waren nicht zu erkennen.", title: "Sammel-PDF Tankbelege August (23 Seiten)", technical: T("agent_review", { review_reason: "unsplit_collection" }) }),
  build({ id: "S27", name: "Sammel-PDF: 7 von 10 erledigt", sizes: "ZBD", path: "collection", at: 2, step: 4, headline: "7 von 10 erledigt", holder: HOLDER.agent, next: "Sind alle Teilbelege erledigt, ist es auch das Sammel-PDF.", explanation: "Das PDF ist in 10 Belege zerlegt; jeder geht seinen eigenen Weg.", title: "Sammel-PDF Tankbelege August (23 Seiten)", links: [{ label: "Zu den 10 Teilbelegen", href: "#children" }], technical: T("done", { children: "7/10" }) }),
  build({ id: "S28", name: "Teilbeleg, bereit zur Buchung", sizes: "D", path: "invoice", at: 2, step: 5, headline: "Bereit zur Buchung", holder: HOLDER.agent, next: "Die Kanzlei prüft die Buchung in der Abnahme des Stapels.", explanation: "Teilbeleg 4 aus dem Sammel-PDF. Ludwig ordnet ihn zu.", title: "Tankbeleg 4 · Aral Station Hauptstraße", links: [{ label: "Zum Sammeldokument", href: "#doc=collection" }], technical: T("bookable", { parent: "collection" }) }),
  build({ id: "S29", name: "Belegart unbekannt", sizes: "ZBD", path: "unknown", at: 1, status: "held", note: "Belegart unbekannt", step: 2, headline: "Belegart unbekannt", level: "warning", holder: HOLDER.agent, next: "Nach der Korrektur geht der Beleg weiter.", reason: "Belegart unbekannt", explanation: "Das Formular passt zu keiner bekannten Belegart.", title: "Scan_20260912_0931.pdf", technical: T("agent_review", { review_reason: "unknown_form" }) }),
  build({ id: "S30", name: "Datei unlesbar", sizes: "ZD", path: "unknown", at: 1, status: "failed", note: "Einordnung gescheitert", step: 2, headline: "Einordnung gescheitert", level: "error", holder: HOLDER.agent, next: "Nach der Korrektur geht der Beleg weiter.", reason: "Einordnung gescheitert", explanation: "Die Datei ließ sich nicht öffnen.", title: "Scan_20260912_0932.pdf", technical: T("agent_review", { review_reason: "classification_error" }) }),
  build({ id: "S31", name: "Verarbeitung gescheitert", sizes: "ZD", path: "invoice", at: 1, status: "failed", note: "Verarbeitung gescheitert", step: 3, headline: "Verarbeitung gescheitert", level: "error", holder: HOLDER.agent, next: "Nach der Korrektur geht der Beleg weiter.", reason: "Verarbeitung gescheitert", explanation: "Der Job ist mit einem Fehler beendet worden.", technical: T("agent_review", { review_reason: "job_failed", job: "extract · failed" }) }),
  build({ id: "S32", name: "Verarbeitung hing", sizes: "ZD", path: "invoice", at: 1, status: "held", note: "Verarbeitung hing", step: 3, headline: "Verarbeitung hing", level: "warning", holder: HOLDER.agent, next: "Nach der Korrektur geht der Beleg weiter.", reason: "Verarbeitung hing", explanation: "Die Verarbeitung wurde nach langer Stille beendet.", technical: T("agent_review", { review_reason: "processing_stuck" }) }),
  build({ id: "S33a", name: "Lieferschein: zuordnen", sizes: "ZBD", path: "attachment", at: 2, step: 4, headline: "Bereit zur Zuordnung", holder: HOLDER.agent, next: "Ludwig hängt den Beleg an seinen Sachverhalt.", explanation: "Der Lieferschein wird dem Sachverhalt der Rechnung zugeordnet.", title: "Lieferschein LS-88213 · Holzhandel Weber", technical: T("bookable") }),
  build({ id: "S33b", name: "Lieferschein: von Hand erledigt", sizes: "ZBD", path: "attachment", at: 3, step: 6, headline: "Von Hand erledigt", holder: HOLDER.nobody, end: "Von Hand erledigt", explanation: "Der Lieferschein ist der Rechnung zugeordnet.", links: [CASE_LINK], title: "Lieferschein LS-88213 · Holzhandel Weber", technical: T("done", { done_via: "manual" }) }),
  build({ id: "S34", name: "Vertrag wird ausgelesen", sizes: "BD", path: "foundation", at: 1, step: 3, headline: "Wird ausgelesen", level: "info", holder: HOLDER.processing, running: { since: "seit 8 s", live: true }, next: "Ludwig hängt den Beleg an seinen Sachverhalt.", explanation: "Ludwig liest Laufzeit und Beträge des Vertrags aus.", title: "Mietvertrag Lagerhalle Industriestraße 12", technical: T("extracting", { job: "extract · running" }) }),
  build({ id: "S35", name: "Auswertung quittieren", sizes: "ZD", path: "report", at: 2, step: 4, headline: "Wartet auf Quittung", holder: HOLDER.agent, next: "Ludwig quittiert die Auswertung.", explanation: "Die Summen- und Saldenliste ist ausgelesen; Ludwig quittiert sie.", title: "SuSa 08/2026", technical: T("bookable") }),
  build({ id: "S36", name: "DATEV-Lieferung", sizes: "ZD", path: "delivery", at: 1, step: 2, headline: "Über Import erledigt", holder: HOLDER.nobody, end: "Über Import erledigt", explanation: "Die Lieferung aus DATEV ist beim Eingang erledigt.", title: "EXTF_Buchungsstapel_2026_08.csv", technical: T("done", { done_via: "import" }) }),
];

export const byId = (id: string) => SCENARIOS.find((s) => s.id === id)!;
