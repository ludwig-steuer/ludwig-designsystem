import { batchOwner, type BatchOwnerMeta } from "./batch-process";

/**
 * Die Staffel-Leiste (F114 §4.1, F119 §6): wo ist die Zeit hingegangen?
 *
 * Aus den Zustandswechseln eines Stapels wird eine Zeitachse, je Abschnitt
 * eingefärbt nach Besitzer. Das ist der eine Blick, der „warum hat der August
 * drei Wochen gedauert?" beantwortet — zwei Tage Agent, neun Tage Warten auf
 * den Mandanten, ein Tag Kanzlei.
 *
 * Rein und ohne IO: die Funktion bekommt die Wechsel und sagt, wie sich die
 * Zeit verteilt. Es gibt **keinen** Speicher dafür; die Wechsel stehen im
 * Audit, und ein zweiter Ort würde nur abweichen.
 */

export interface ZustandsWechsel {
  /** ISO-Zeitstempel des Wechsels. */
  at: string;
  /** Der Zustand, in den der Stapel gewechselt ist. */
  state: string;
}

export interface StaffelSegment {
  owner: BatchOwnerMeta;
  state: string;
  from: string;
  to: string;
  /** Dauer in Millisekunden. */
  durationMs: number;
  /** Anteil an der Gesamtdauer (0…1). */
  share: number;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Dauer in der Sprache, in der ein Mensch sie sagen würde. */
export function humanDuration(ms: number): string {
  if (ms < MINUTE) return "unter einer Minute";
  if (ms < HOUR) return `${Math.round(ms / MINUTE)} Min.`;
  if (ms < DAY) {
    const h = Math.round(ms / HOUR);
    return `${h} Std.`;
  }
  const d = Math.round(ms / DAY);
  return d === 1 ? "1 Tag" : `${d} Tage`;
}

/**
 * Zustandswechsel → Abschnitte.
 *
 * `openDocumentRequests` entscheidet, ob ein `prepared`-Abschnitt „bereit"
 * heißt oder „wartet auf Mandant" — dieselbe Regel wie in der Liste. Sie gilt
 * für den **ganzen** Stapel, nicht je Abschnitt: wann genau eine Nachforderung
 * offen war, steht nirgends, und es zu rekonstruieren hieße raten.
 *
 * `until` ist der rechte Rand: bei einem laufenden Stapel „jetzt", bei einem
 * abgeschlossenen sein letzter Wechsel.
 */
export function staffelSegmente(
  wechsel: readonly ZustandsWechsel[],
  until: string,
  openDocumentRequests = 0,
): StaffelSegment[] {
  if (wechsel.length === 0) return [];
  const sorted = [...wechsel].sort((a, b) => a.at.localeCompare(b.at));
  const end = new Date(until).getTime();

  const raw: Array<Omit<StaffelSegment, "share">> = [];
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const next = sorted[i + 1];
    const from = new Date(cur.at).getTime();
    const to = next ? new Date(next.at).getTime() : end;
    const durationMs = Math.max(to - from, 0);
    // Zwei Wechsel in derselben Sekunde sind kein Abschnitt, sondern ein
    // Sprung — sie würden die Leiste mit Haarlinien zumüllen.
    if (durationMs === 0 && next) continue;
    raw.push({
      owner: batchOwner(cur.state, cur.state === "prepared" ? openDocumentRequests : 0),
      state: cur.state,
      from: cur.at,
      to: next?.at ?? until,
      durationMs,
    });
  }

  const total = raw.reduce((s, r) => s + r.durationMs, 0);
  return raw.map((r) => ({ ...r, share: total > 0 ? r.durationMs / total : 1 / raw.length }));
}
