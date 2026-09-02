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
  { key: "buchen", label: "Buchen", sub: "Agent ⇄ bereit", states: ["agent", "prepared"] },
  { key: "pruefen", label: "Prüfen", sub: "Kanzlei", states: ["review"] },
  {
    key: "uebertragen",
    label: "Übertragen",
    sub: "Bridge → DATEV",
    states: ["ready", "exporting", "inspection", "failed"],
  },
  {
    key: "angekommen",
    label: "Angekommen",
    sub: "Spiegel → Nachlese → zu",
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
  agent: { key: "agent", label: "Agent", color: "var(--color-accent-500)" },
  bereit: { key: "bereit", label: "bereit — niemand", color: "var(--color-border-strong)" },
  mandant: { key: "mandant", label: "Mandant (wartet)", color: "var(--color-warning)" },
  kanzlei: { key: "kanzlei", label: "Kanzlei", color: "var(--color-primary)" },
  bridge: { key: "bridge", label: "Bridge", color: "var(--color-text-muted)" },
  datev: { key: "datev", label: "DATEV", color: "var(--color-text-muted)" },
  spiegel: { key: "spiegel", label: "Spiegel", color: "var(--color-success)" },
  niemand: { key: "niemand", label: "—", color: "var(--color-border-strong)" },
};

/**
 * Wer ist dran. Einziger Sonderfall: ein `prepared`-Stapel mit offenen
 * Nachforderungen wartet nicht auf die Kanzlei, sondern auf den Mandanten
 * (F117) — deshalb der zweite Parameter.
 *
 * `failed` liegt bei der Kanzlei: DATEV hat abgelehnt, der Claim bleibt, und
 * jemand muss entscheiden (erneut übertragen oder Freigabe zurücknehmen).
 */
export function batchOwner(state: string, openDocumentRequests = 0): BatchOwnerMeta {
  switch (state) {
    case "agent":
      return OWNER_META.agent;
    case "prepared":
      return openDocumentRequests > 0 ? OWNER_META.mandant : OWNER_META.bereit;
    case "review":
    case "failed":
      return OWNER_META.kanzlei;
    case "ready":
    case "exporting":
      return OWNER_META.bridge;
    case "inspection":
    case "confirmed":
      return OWNER_META.datev;
    case "mirrored":
      return OWNER_META.spiegel;
    default:
      // closed, cancelled und alles Unbekannte: niemand ist dran.
      return OWNER_META.niemand;
  }
}

/** Grobfilter der Stapel-Liste — dieselbe Gruppierung wie die Phasen. */
export type BatchListFilter = "alle" | "offen" | "unterwegs" | "in_datev";

const FILTER_STATES: Record<Exclude<BatchListFilter, "alle">, readonly string[]> = {
  offen: ["agent", "prepared", "review"],
  unterwegs: ["ready", "exporting", "inspection", "failed"],
  in_datev: ["confirmed", "mirrored", "closed"],
};

/**
 * Search-Param → Tab. Unbekanntes fällt auf „alle" zurück, nie auf leer.
 *
 * `nur_datev` ist kein Filter über die Ludwig-Stapel, sondern eine andere
 * Quelle (Spiegel-Stapel ohne Gegenstück) — er lebt trotzdem im selben
 * Tab-Set, weil die Nutzerin dort dieselbe Frage stellt: „welche Stapel gibt
 * es zu diesem Mandanten?"
 */
export function parseStapelTabFilter(
  raw: string | string[] | undefined,
): BatchListFilter | "nur_datev" {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "offen" ||
    value === "unterwegs" ||
    value === "in_datev" ||
    value === "nur_datev"
    ? value
    : "alle";
}

/** Nur die Zustands-Filter — ohne den Fremdquellen-Tab. */
export function parseBatchListFilter(raw: string | string[] | undefined): BatchListFilter {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "offen" || value === "unterwegs" || value === "in_datev" ? value : "alle";
}

export function matchesBatchFilter(state: string, filter: BatchListFilter): boolean {
  return filter === "alle" ? true : FILTER_STATES[filter].includes(state);
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
export function batchActions(state: string): BatchActionSet {
  const leer: BatchActionSet = { primary: null, secondary: null, tertiary: null, info: null };

  switch (state) {
    case "agent":
      return {
        ...leer,
        info: "Der Agent arbeitet — die Abnahme beginnt, wenn der Durchgang fertig ist.",
      };
    case "prepared":
      return {
        primary: { key: "uebernehmen", label: "Prüfung übernehmen", variant: "primary" },
        secondary: { key: "zur_abnahme", label: "Ansehen", variant: "secondary" },
        tertiary: null,
        info: "Bis zur Übernahme landen nachgereichte Belege im selben Stapel — der nächste Agentenlauf nimmt sie mit.",
      };
    case "review":
      return {
        primary: { key: "zur_abnahme", label: "Zur Abnahme", variant: "primary" },
        secondary: null,
        tertiary: null,
        info: null,
      };
    case "ready":
      return {
        primary: { key: "zur_uebergabe", label: "Zur Übergabe", variant: "primary" },
        secondary: null,
        tertiary: { key: "abbrechen", label: "Freigabe zurücknehmen", variant: "tertiary" },
        info: null,
      };
    case "exporting":
    case "exported":
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
    case "mirrored":
      return {
        primary: { key: "zur_nachlese", label: "Zur Nachlese", variant: "primary" },
        secondary: null,
        tertiary: null,
        info: null,
      };
    case "closed":
      return {
        ...leer,
        secondary: { key: "zur_nachlese", label: "Nachlese ansehen", variant: "secondary" },
        info: "Abgeschlossen — Änderungen gehen nur noch über Storno im Folgestapel.",
      };
    case "cancelled":
      return { ...leer, info: "Abgebrochen — dieser Stapel wird nicht weitergeführt." };
    default:
      return leer;
  }
}
