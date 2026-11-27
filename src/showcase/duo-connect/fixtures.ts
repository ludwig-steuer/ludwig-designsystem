/**
 * Invented data for the DUO-Connect drafts (docs/seiten/duo-connect.md).
 * No real clients, people or numbers.
 */
import type { BadgeTone } from "@/ui/v3";
import type { LogEntry } from "@/ui/v3";

/** The six words of the `duo_sync` axis (owner 2026-11-27), until the app registry carries it. */
export type SyncState = "queued" | "running" | "succeeded" | "succeeded_with_issues" | "cancelled" | "skipped";

export const SYNC_STATE: Record<SyncState, { label: string; tone: BadgeTone }> = {
  queued: { label: "Wartet", tone: "neutral" },
  running: { label: "Läuft", tone: "info" },
  succeeded: { label: "Fertig", tone: "success" },
  succeeded_with_issues: { label: "Fertig mit Problemen", tone: "warning" },
  cancelled: { label: "Abgebrochen", tone: "warning" },
  skipped: { label: "Übersprungen", tone: "neutral" },
};

export interface Client {
  id: string;
  name: string;
  /** DATEV client number; null → skipped. */
  datevNumber: string | null;
  /** ISO date-time of the last successful sync, null → never. */
  lastSync: string | null;
  /** Fetch window as ISO dates; null when it cannot be determined. */
  from: string | null;
  to: string | null;
  /** Why the client is left out of a batch; null → it runs. */
  skipReason: string | null;
}

export const TODAY = "2026-11-27";
export const NOW = "2026-11-27T09:14:00+01:00";

export const SKIP_NO_NUMBER = "Keine DATEV-Mandantennummer in Ludwig";
export const SKIP_NOT_READY = "Einrichtung in Ludwig noch nicht abgeschlossen";

export const CLIENTS: Client[] = [
  { id: "c01", name: "Musterfirma GmbH", datevNumber: "10001", lastSync: "2026-11-27T09:14:00+01:00", from: "2026-11-13", to: TODAY, skipReason: null },
  { id: "c02", name: "Bäckerei Schneider e.K.", datevNumber: "10002", lastSync: "2026-11-20T16:02:00+01:00", from: "2026-11-06", to: TODAY, skipReason: null },
  { id: "c03", name: "Elektro Wagner GmbH & Co. KG", datevNumber: "10003", lastSync: "2026-11-20T16:09:00+01:00", from: "2026-11-06", to: TODAY, skipReason: null },
  { id: "c04", name: "Praxis Dr. Hoffmann", datevNumber: "10004", lastSync: "2026-11-13T10:31:00+01:00", from: "2026-10-30", to: TODAY, skipReason: null },
  { id: "c05", name: "Autohaus Becker GmbH", datevNumber: "10005", lastSync: "2026-11-20T16:15:00+01:00", from: "2026-11-06", to: TODAY, skipReason: null },
  { id: "c06", name: "Gartenbau Krüger", datevNumber: "10006", lastSync: "2026-11-20T16:21:00+01:00", from: "2026-11-06", to: TODAY, skipReason: null },
  { id: "c07", name: "Weinhandlung Lehmann OHG", datevNumber: "10007", lastSync: "2026-10-30T11:48:00+01:00", from: "2026-10-16", to: TODAY, skipReason: null },
  { id: "c08", name: "Zahnarztpraxis Dr. Yilmaz", datevNumber: "10008", lastSync: "2026-11-20T16:30:00+01:00", from: "2026-11-06", to: TODAY, skipReason: null },
  { id: "c09", name: "Schreinerei Fuchs GmbH", datevNumber: "10009", lastSync: "2026-11-20T16:37:00+01:00", from: "2026-11-06", to: TODAY, skipReason: null },
  { id: "c10", name: "Hotel Seeblick Betriebs-GmbH", datevNumber: "10010", lastSync: null, from: "2026-07-01", to: TODAY, skipReason: null },
  { id: "c11", name: "Ingenieurbüro Brandt", datevNumber: null, lastSync: null, from: null, to: null, skipReason: SKIP_NO_NUMBER },
  { id: "c12", name: "Kita Sonnenschein gGmbH", datevNumber: "10012", lastSync: null, from: null, to: null, skipReason: SKIP_NOT_READY },
];

export const RUNNING_CLIENTS = CLIENTS.filter((c) => c.skipReason === null);
export const SKIPPED_CLIENTS = CLIENTS.filter((c) => c.skipReason !== null);

/* ── Many clients: 140, for the case „more than a hundred" ───────────── */

const SURNAMES = ["Albrecht", "Bauer", "Dietrich", "Engel", "Franke", "Graf", "Haas", "Jansen", "Kaiser", "Lorenz", "Möller", "Nowak", "Otto", "Peters", "Richter", "Sommer", "Thiel", "Vogel", "Winter", "Ziegler"];
const TRADES = ["Bäckerei", "Elektro", "Malerbetrieb", "Physiotherapie", "Autohaus", "Gartenbau", "Steinmetz"];
const FORMS = ["GmbH", "e.K.", "GmbH & Co. KG", "", "OHG", "GbR", "UG (haftungsbeschränkt)"];

export const MANY_CLIENTS: Client[] = Array.from({ length: 140 }, (_, i) => {
  const name = `${TRADES[i % TRADES.length]} ${SURNAMES[Math.floor(i / TRADES.length) % SURNAMES.length]}${FORMS[i % FORMS.length] ? ` ${FORMS[i % FORMS.length]}` : ""}`;
  const skip = i % 20 === 7 ? SKIP_NO_NUMBER : i % 20 === 13 ? SKIP_NOT_READY : null;
  return {
    id: `m${String(i + 1).padStart(3, "0")}`,
    name,
    datevNumber: skip === SKIP_NO_NUMBER ? null : String(20001 + i),
    lastSync: skip ? null : `2026-11-${String(13 + (i % 8)).padStart(2, "0")}T${String(9 + (i % 8)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00+01:00`,
    from: skip ? null : `2026-10-${String(16 + (i % 14)).padStart(2, "0")}`,
    to: skip ? null : TODAY,
    skipReason: skip,
  };
});

/* ── The four steps (docs/begriffe.md, ludwig-plugin) ─────────────────── */

export type StepKey = "filing" | "fetch" | "handover" | "accounts";

/** The user-facing text of each step — the long form, as begriffe.md requires. */
export const STEP_TEXT: Record<StepKey, string> = {
  filing: "Gebuchte Belege in DATEV einsortieren",
  fetch: "Neue Belege aus DATEV holen",
  handover: "Belege aus Ludwig an DATEV übergeben",
  accounts: "Kontoumsätze aus DATEV holen",
};

/** Default: the handover is switched off (owner 2026-11-27). */
export const ACTIVE_STEPS: StepKey[] = ["filing", "fetch", "accounts"];

/* ── Batch in progress (A8): client 3 of 10 is running ──────────────── */

export interface BatchRow {
  client: Client;
  state: SyncState;
  /** Short result or what is happening, one phrase. */
  summary: string;
}

export const BATCH_RUNNING: BatchRow[] = CLIENTS.map((client, i): BatchRow => {
  if (client.skipReason) return { client, state: "skipped", summary: client.skipReason };
  if (i === 0) return { client, state: "succeeded", summary: "12 Belege übertragen, Kontoumsätze von 2 Konten" };
  if (i === 1) return { client, state: "succeeded_with_issues", summary: "3 Belege nicht übertragen" };
  if (i === 2) return { client, state: "running", summary: "Neue Belege aus DATEV holen · Beleg 37 von 120" };
  return { client, state: "queued", summary: "" };
});

export const BATCH_DONE: BatchRow[] = CLIENTS.map((client, i): BatchRow => {
  if (client.skipReason) return { client, state: "skipped", summary: client.skipReason };
  if (i === 1) return { client, state: "succeeded_with_issues", summary: "3 Belege nicht übertragen" };
  const n = [12, 0, 41, 7, 19, 3, 0, 15, 8, 176][i] ?? 0;
  return { client, state: "succeeded", summary: n === 0 ? "Nichts Neues in DATEV" : `${n} Belege übertragen` };
});

/** A batch over 140 clients, at client 37 of 133. */
export const MANY_BATCH: BatchRow[] = MANY_CLIENTS.map((client, i): BatchRow => {
  if (client.skipReason) return { client, state: "skipped", summary: client.skipReason };
  if (i < 38) {
    if (i === 11 || i === 29) return { client, state: "succeeded_with_issues", summary: "2 Belege nicht übertragen" };
    const n = (i * 5) % 23;
    return { client, state: "succeeded", summary: n === 0 ? "Nichts Neues in DATEV" : n === 1 ? "1 Beleg übertragen" : `${n} Belege übertragen` };
  }
  if (i === 38) return { client, state: "running", summary: "Neue Belege aus DATEV holen · Beleg 37 von 120" };
  return { client, state: "queued", summary: "" };
});

/* ── Result of one sync (A10–A12) ─────────────────────────────────────── */

export interface ResultRow {
  kind: string;
  title: string;
  status: string;
  tone: BadgeTone;
  detail: string;
}

export const RESULT_ROWS: ResultRow[] = [
  { kind: "Ablageort", title: "Belege 2026 / Eingangsrechnungen / November", status: "einsortiert", tone: "success", detail: "5 Belege" },
  { kind: "Ablageort", title: "Belege 2026 / Ausgangsrechnungen / November", status: "einsortiert", tone: "success", detail: "2 Belege" },
  { kind: "Beleg", title: "Büromarkt Weber · Rechnung 2026-1187", status: "übertragen", tone: "success", detail: "Eingang 24.11.2026" },
  { kind: "Beleg", title: "Stadtwerke Neustadt · Abschlag Dezember", status: "übertragen", tone: "success", detail: "Eingang 25.11.2026" },
  { kind: "Beleg", title: "Kanzleibedarf Schulz · Rechnung 88412", status: "schon in Ludwig", tone: "neutral", detail: "Eingang 18.11.2026" },
  { kind: "Beleg", title: "Druckerei Hansen · Rechnung 2026-0419", status: "nicht übertragen", tone: "warning", detail: "DATEV hat keine PDF-Datei geliefert" },
  { kind: "Konto", title: "Girokonto Sparkasse Neustadt", status: "geholt", tone: "success", detail: "48 Umsätze" },
  { kind: "Konto", title: "Tagesgeld Volksbank Mittelland", status: "geholt", tone: "success", detail: "2 Umsätze" },
];

/* ── Run log (B4) ────────────────────────────────────────────────────── */

export const LOG: LogEntry[] = [
  { id: "l01", at: "2026-11-27T09:11:02+01:00", level: "info", source: "lauf", message: "Abgleich gestartet für Musterfirma GmbH (10001)" },
  { id: "l02", at: "2026-11-27T09:11:03+01:00", level: "info", source: "lauf", message: "Abrufzeitraum 13.11.2026 bis 27.11.2026, Quelle: Ludwig (neuester Eingang minus 14 Tage)" },
  { id: "l03", at: "2026-11-27T09:11:41+01:00", level: "info", source: "ablage", message: "Belegablage: 4 Ablageorte, 7 Belege einsortiert" },
  { id: "l04", at: "2026-11-27T09:12:20+01:00", level: "info", source: "belege", message: "Belegabruf: Liste mit 120 Belegen gelesen, 47 schon in Ludwig" },
  { id: "l05", at: "2026-11-27T09:13:05+01:00", level: "warning", source: "belege", message: "Beleg 2026-0419: kein PDF geliefert (beleg_kein_pdf), Content-Type text/html" },
  { id: "l06", at: "2026-11-27T09:13:52+01:00", level: "info", source: "belege", message: "Belegabruf: 12 Belege übertragen" },
  { id: "l07", at: "2026-11-27T09:14:00+01:00", level: "info", source: "kontoauszuege", message: "Kontoabruf: 2 Konten, 50 Umsätze übertragen" },
];

/** The same log as text, for „Kopieren" — what the support gets. */
export const LOG_TEXT = LOG.map((l) => `${l.at}  ${(l.level ?? "info").padEnd(7)}  ${l.source ?? ""}  ${l.message}`).join("\n");

/* ── Readiness check C6: ten points ───────────────────────────────────── */

export interface ReadinessPoint {
  code: string;
  question: string;
}

export const READINESS: ReadinessPoint[] = [
  { code: "1", question: "Plugin ist aktuell" },
  { code: "2", question: "Ludwig ist erreichbar" },
  { code: "3", question: "Mit Ludwig verbunden" },
  { code: "4", question: "Mandanten vorhanden und vollständig" },
  { code: "5", question: "DATEV ist erreichbar" },
  { code: "6", question: "Bei DATEV angemeldet" },
  { code: "7", question: "Mandant in DATEV zugänglich" },
  { code: "8", question: "Browser-Freigaben" },
  { code: "9", question: "Einstellungen von Ludwig geladen" },
  { code: "10", question: "Kein anderer Abgleich läuft" },
];

/** Support report of the readiness check — no client names, numbers or token (C6). */
export const READINESS_REPORT = [
  "Ludwig DUO-Connect 0.11.0 · Chrome 131 · Umgebung Produktion",
  "1 in Ordnung · 2 in Ordnung · 3 in Ordnung · 4 Hinweis · 5 nicht prüfbar",
  "6 nicht prüfbar · 7 nicht geprüft · 8 in Ordnung · 9 in Ordnung · 10 in Ordnung",
].join("\n");

export const USER = { name: "Anna Berger", device: "Laptop Büro", validUntil: "2027-11-26" };
export const VERSION = "0.11.0";
