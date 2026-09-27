/**
 * Der Stapel-Prozess als reine Ableitung aus dem Zustand (F118 §2, Design
 * `StapelSeite.dc.html`).
 *
 * Zwei Fragen beantwortet die Liste auf einen Blick: **wie weit** ist der
 * Stapel (vier Phasen) und **wer ist dran** (Besitzer). Beides steckt schon im
 * Zustand — es gibt kein zweites Feld dafür und soll auch keins geben.
 *
 * Die Zustände selbst sind die Achse `zyklus_stapel` der Status-Registry
 * (R1); hier steht nur die Gruppierung darüber, nie ein zweites Label für den
 * Zustand.
 */

export type BatchPhaseKey = "buchen" | "pruefen" | "uebertragen" | "angekommen";

export interface BatchPhase {
  key: BatchPhaseKey;
  label: string;
  /** Wer in dieser Phase arbeitet — die Unterzeile im Stepper. */
  sub: string;
  states: readonly string[];
}

export const BATCH_PHASES: readonly BatchPhase[] = [
  { key: "buchen", label: "Buchen", sub: "Ludwig", states: ["agent", "prepared"] },
  { key: "pruefen", label: "Prüfen", sub: "Kanzlei", states: ["review"] },
  {
    key: "uebertragen",
    label: "Übertragen",
    sub: "DATEV",
    states: ["ready", "exporting", "inspection", "failed"],
  },
  {
    key: "angekommen",
    label: "Angekommen",
    sub: "Spiegel und Nachlese",
    states: ["confirmed", "mirrored", "closed"],
  },
];

export type PhaseStatus = "done" | "active" | "pending" | "failed";

/**
 * Fortschritt über die vier Phasen. `failed` färbt die Phase, in der es
 * passiert ist — der Stapel steht dort, er ist nicht weiter.
 *
 * `cancelled` ist terminal ohne Phase: alles bleibt `pending`, weil der Stapel
 * den Weg nicht zu Ende gegangen ist.
 */
export function batchPhaseProgress(state: string): Array<BatchPhase & { status: PhaseStatus }> {
  const activeIndex = BATCH_PHASES.findIndex((p) => p.states.includes(state));
  return BATCH_PHASES.map((phase, i) => {
    if (activeIndex < 0) return { ...phase, status: "pending" as const };
    if (i < activeIndex) return { ...phase, status: "done" as const };
    if (i > activeIndex) return { ...phase, status: "pending" as const };
    return { ...phase, status: state === "failed" ? ("failed" as const) : ("active" as const) };
  });
}

export type BatchOwner =
  | "agent"
  | "bereit"
  | "mandant"
  | "kanzlei"
  | "bridge"
  | "datev"
  | "spiegel"
  | "niemand";

export interface BatchOwnerMeta {
  key: BatchOwner;
  label: string;
  /** Token-Name für den Punkt vor dem Label — nie ein Hex-Literal in der UI. */
  color: string;
}

const OWNER_META: Record<BatchOwner, BatchOwnerMeta> = {
  agent: { key: "agent", label: "Ludwig", color: "var(--color-accent-500)" },
  bereit: { key: "bereit", label: "bereit — niemand", color: "var(--color-border-strong)" },
  mandant: { key: "mandant", label: "Mandant (wartet)", color: "var(--color-warning)" },
  kanzlei: { key: "kanzlei", label: "Kanzlei", color: "var(--color-primary)" },
  bridge: { key: "bridge", label: "Bridge", color: "var(--color-text-muted)" },
  datev: { key: "datev", label: "DATEV", color: "var(--color-text-muted)" },
  spiegel: { key: "spiegel", label: "Spiegel", color: "var(--color-success)" },
  niemand: { key: "niemand", label: "—", color: "var(--color-border-strong)" },
};

/** Übergabeweg des Mandanten (`platform_clients.datev_export_method`). */
export type BatchExportMethod = "csv" | "bridge" | null;

/**
 * Wer ist dran — nach der Zustandstabelle in `docs/topics/datev.md` (Spalte
 * „Dran ist"). Sonderfälle: ein `prepared`-Stapel mit offenen Nachforderungen
 * wartet auf den Mandanten (F117); in `ready` lädt beim Übergabeweg CSV die
 * Kanzlei die Datei, sonst holt die Bridge (F304, L-349).
 *
 * `failed` liegt bei der Kanzlei: DATEV hat abgelehnt, der Claim bleibt, und
 * jemand muss entscheiden (erneut übertragen oder Freigabe zurücknehmen).
 * `confirmed` wartet auf den Spiegel, `mirrored` auf die Nachlese des Agenten
 * (F115) — in beiden ist die Kanzlei nicht dran.
 */
export function batchOwner(
  state: string,
  openDocumentRequests = 0,
  exportMethod: BatchExportMethod = null,
): BatchOwnerMeta {
  switch (state) {
    case "agent":
      return OWNER_META.agent;
    case "prepared":
      return openDocumentRequests > 0 ? OWNER_META.mandant : OWNER_META.bereit;
    case "review":
    case "failed":
      return OWNER_META.kanzlei;
    case "ready":
      return exportMethod === "csv" ? OWNER_META.kanzlei : OWNER_META.bridge;
    case "exporting":
      return OWNER_META.bridge;
    case "inspection":
      return OWNER_META.datev;
    case "confirmed":
      return OWNER_META.spiegel;
    case "mirrored":
      return OWNER_META.agent;
    default:
      // closed, cancelled und alles Unbekannte: niemand ist dran.
      return OWNER_META.niemand;
  }
}

/** Grobfilter der Stapel-Liste — dieselbe Gruppierung wie die Phasen. */
export type BatchListFilter = "all" | "open" | "in_transit" | "in_datev";

const FILTER_STATES: Record<Exclude<BatchListFilter, "all">, readonly string[]> = {
  open: ["agent", "prepared", "review"],
  in_transit: ["ready", "exporting", "inspection", "failed"],
  in_datev: ["confirmed", "mirrored", "closed"],
};

/**
 * Search-Param → Tab. Unbekanntes fällt auf „all" zurück, nie auf leer.
 *
 * `datev_only` ist kein Filter über die Ludwig-Stapel, sondern eine andere
 * Quelle (Spiegel-Stapel ohne Gegenstück) — er lebt trotzdem im selben
 * Tab-Set, weil die Nutzerin dort dieselbe Frage stellt: „welche Stapel gibt
 * es zu diesem Mandanten?"
 */
export function parseBatchListTab(
  raw: string | string[] | undefined,
): BatchListFilter | "datev_only" {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "open" ||
    value === "in_transit" ||
    value === "in_datev" ||
    value === "datev_only"
    ? value
    : "all";
}

/** Nur die Zustands-Filter — ohne den Fremdquellen-Tab. */
export function parseBatchListFilter(raw: string | string[] | undefined): BatchListFilter {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "open" || value === "in_transit" || value === "in_datev" ? value : "all";
}

export function matchesBatchFilter(state: string, filter: BatchListFilter): boolean {
  return filter === "all" ? true : FILTER_STATES[filter].includes(state);
}

/**
 * Was der Öffnen-Knopf verspricht. Der Server entscheidet, wohin es geht
 * (F118 §2.3) — das Label sagt es vorher.
 */
/** @deprecated seit F123 — der Label kommt aus `batchActions(state)`. */
export function batchOpenLabel(state: string): string {
  switch (state) {
    case "prepared":
      return "Prüfung übernehmen";
    case "review":
      return "Zur Abnahme";
    case "failed":
      return "Öffnen";
    default:
      return "Öffnen";
  }
}

/* ── Was am Stapel als Nächstes zu tun ist (F123 T123.9) ───────────────── */

export interface BatchAction {
  /** Was der Knopf tut. Der Aufrufer verdrahtet Ziel oder Handler. */
  key:
    | "zur_abnahme"
    | "uebernehmen"
    | "zur_uebergabe"
    | "erneut_uebertragen"
    | "abbrechen"
    | "protokoll"
    | "zur_nachlese";
  label: string;
  variant: "primary" | "secondary" | "tertiary";
}

export interface BatchActionSet {
  primary: BatchAction | null;
  secondary: BatchAction | null;
  tertiary: BatchAction | null;
  /** Warum gerade nichts zu tun ist — steht statt eines toten Knopfes da. */
  info: string | null;
}

/**
 * Die Aktionsleiste je Zustand.
 *
 * Bis F123 zeigte die Stapel-Seite in **jedem** Zustand „Zur Abnahme →" —
 * auch während der Agent noch arbeitete und nachdem DATEV bestätigt hatte.
 * Ein Knopf, der immer gleich aussieht, sagt nichts; die Zustandstabelle
 * steht deshalb hier und nicht als Ternär im Screen.
 */
export function batchActions(state: string, exportMethod: BatchExportMethod = null): BatchActionSet {
  const leer: BatchActionSet = { primary: null, secondary: null, tertiary: null, info: null };

  switch (state) {
    case "agent":
      return {
        ...leer,
        secondary: { key: "zur_abnahme", label: "Ansehen", variant: "secondary" },
        info: "Ludwig arbeitet — quittieren lässt sich erst nach dem Durchgang, ansehen jederzeit.",
      };
    case "prepared":
      return {
        primary: { key: "uebernehmen", label: "Prüfung übernehmen", variant: "primary" },
        secondary: { key: "zur_abnahme", label: "Ansehen", variant: "secondary" },
        tertiary: null,
        // F304 (L-351): der Nebensatz steht in der Registry-description von `prepared` (hinter dem (i)).
        info: null,
      };
    case "review":
      return {
        primary: { key: "zur_abnahme", label: "Zur Abnahme", variant: "primary" },
        secondary: null,
        tertiary: null,
        info: null,
      };
    case "ready":
      // F304 (L-349): nur beim Übergabeweg CSV lädt die Kanzlei die Datei;
      // sonst holt die Bridge, und die Kanzlei sieht nur zu.
      return exportMethod === "csv"
        ? {
            primary: { key: "zur_uebergabe", label: "Zur Übergabe", variant: "primary" },
            secondary: null,
            tertiary: { key: "abbrechen", label: "Freigabe zurücknehmen", variant: "tertiary" },
            info: null,
          }
        : {
            primary: null,
            secondary: { key: "zur_uebergabe", label: "Transport ansehen", variant: "secondary" },
            tertiary: { key: "abbrechen", label: "Freigabe zurücknehmen", variant: "tertiary" },
            info: "Freigegeben — die Bridge holt den Stapel beim nächsten Poll.",
          };
    case "exporting":
    case "inspection":
      return {
        ...leer,
        secondary: { key: "zur_uebergabe", label: "Transport ansehen", variant: "secondary" },
        info: "Der Stapel ist unterwegs — bis zur Antwort von DATEV gibt es nichts zu entscheiden.",
      };
    case "failed":
      return {
        primary: { key: "erneut_uebertragen", label: "Erneut übertragen", variant: "primary" },
        secondary: { key: "protokoll", label: "Protokoll ansehen", variant: "secondary" },
        tertiary: { key: "abbrechen", label: "Freigabe zurücknehmen", variant: "tertiary" },
        info: null,
      };
    case "confirmed":
      return {
        ...leer,
        secondary: { key: "zur_uebergabe", label: "Transport ansehen", variant: "secondary" },
        info: "Von DATEV bestätigt — wartet auf den Spiegel.",
      };
    case "mirrored":
      return {
        ...leer,
        secondary: { key: "zur_nachlese", label: "Nachlese ansehen", variant: "secondary" },
        info: "Im Spiegel angekommen — Ludwig macht die Nachlese.",
      };
    case "closed":
      return {
        ...leer,
        secondary: { key: "zur_nachlese", label: "Nachlese ansehen", variant: "secondary" },
        info: "Abgeschlossen — Änderungen gehen nur noch über Storno im Folgestapel.",
      };
    case "cancelled":
      return {
        ...leer,
        secondary: { key: "zur_abnahme", label: "Ansehen", variant: "secondary" },
        info: "Abgebrochen — dieser Stapel wird nicht weitergeführt.",
      };
    default:
      return leer;
  }
}

/**
 * F302 — wohin ein Aktions-Knopf führt. Vollständig über alle Keys: ein Key
 * ohne Ziel ließ den Knopf still verschwinden (L-345, „Erneut übertragen" und
 * „Freigabe zurücknehmen" fehlten). `uebernehmen` schreibt über
 * `TakeOverReviewButton`; sein Ziel ist die Abnahme, die danach offen steht.
 */
export function batchActionHref(base: string, batchId: string, key: BatchAction["key"]): string {
  const batch = `${base}/batches/${batchId}`;
  switch (key) {
    case "zur_abnahme":
    case "uebernehmen":
      return `${batch}/review`;
    case "zur_uebergabe":
    case "erneut_uebertragen":
    case "abbrechen":
      return `${batch}/review/9`;
    case "zur_nachlese":
      return `${batch}/review/10`;
    case "protokoll":
      return `${batch}?tab=timeline`;
    default:
      throw new Error(`batch action without target: ${String(key)}`);
  }
}

export type BatchMenuEntry = "return" | "reset" | "discard";

/** F302 — die Einträge unter „Weitere Aktionen" je Zustand, in fester Reihenfolge. */
export function batchMenuEntries(state: string): BatchMenuEntry[] {
  const open = state === "prepared" || state === "review";
  // F303: die Export-Historie steht in der Technik (Sendenachweis), nicht im Menü.
  return [
    ...(open ? (["return", "reset"] as const) : []),
    ...(open || state === "agent" ? (["discard"] as const) : []),
  ];
}

/**
 * F302-T302.6 — der Titel des Signals nennt den **Stand**, der Knopf die
 * Handlung (0049). `null`, wo der Zustand keine Hauptaktion hat — dort trägt
 * `batchActions(state).info` die Meldung.
 */
export function batchSignalTitle(state: string, exportMethod: BatchExportMethod = null): string | null {
  switch (state) {
    case "prepared":
      return "Ludwig ist fertig — die Prüfung wartet auf Übernahme";
    case "review":
      return "Der Stapel wartet auf Ihre Prüfung";
    case "ready":
      return exportMethod === "csv" ? "Freigegeben — die Datei wartet auf die Übergabe an DATEV" : null;
    case "failed":
      return "DATEV hat den Stapel abgelehnt";
    default:
      return null;
  }
}
