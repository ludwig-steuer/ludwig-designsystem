/**
 * # Die drei Sichten auf ein Protokoll
 *
 * Verlauf, Protokoll, Technik — dieselbe Liste, drei Tiefen. Sie stammen aus
 * Z6 der Design-Guidelines und gelten für **jedes** Protokoll, nicht nur für
 * den Stapel: der Beleg hat dieselben drei Sichten, die Prüfung auch.
 *
 * Lagen bis 2026-09-07 als `BATCH_LOG_VIEWS` in `datev-export/domain/` und
 * hingen damit am Stapel (L-17). Die Zuordnung Aktion → Tiefe bleibt dort,
 * wo sie hingehört: sie ist stapelspezifisch, die Wörter sind es nicht.
 *
 * Der Befund schlug `audit-log/domain/` vor; dort liegen sie falsch. Das
 * Modul ist server-lastig und wird in 52 Testdateien gemockt — ein Import
 * von dort zwingt jeden dieser Mocks, drei Konstanten mitzuführen, die mit
 * dem Audit-Log nichts zu tun haben. Die Sichten sind gemeinsames
 * Anzeige-Vokabular ohne Modulbezug und gehören deshalb hierher.
 */

export type LogView = "timeline" | "protocol" | "technical";

export const LOG_VIEWS: ReadonlyArray<{ key: LogView; label: string; hint: string }> = [
  { key: "timeline", label: "Verlauf", hint: "Die Geschichte — was ein Mensch erzählen würde." },
  { key: "protocol", label: "Protokoll", hint: "Dazu jede fachliche Entscheidung: Klärungen, Buchungen, Konventionen." },
  { key: "technical", label: "Technik", hint: "Dazu die Innereien: Schritt-Kanten, rohe Action-Codes." },
];

/** Tiefe je Sicht — 1 zeigt am wenigsten, 3 alles. */
export const LOG_VIEW_DEPTH: Record<LogView, 1 | 2 | 3> = {
  timeline: 1,
  protocol: 2,
  technical: 3,
};
