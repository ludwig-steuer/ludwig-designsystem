/**
 * DATEV Belegfeld 1 (EXTF-Feld 11): max. 36 Zeichen, erlaubt sind nur
 * Ziffern, ASCII-Buchstaben und `$ & % * + - /` (offizielle
 * Formatbeschreibung, Regex `^["][\w$&%*+\-/]{0,36}["]$`); unzulässig sind
 * insbesondere Leerzeichen, Punkt, Komma und Umlaute. Belegfeld 1 ist
 * zugleich der OPOS-Ausgleichsschlüssel — DATEV matcht Rechnung und Zahlung
 * nur bei EXAKT gleichem Wert. Deshalb normalisieren ALLE Schreibpfade
 * (Agent-Submit, manuelle Buchung, Judge-Korrektur) mit dieser einen
 * Funktion beim Schreiben; der EXTF-Export normalisiert nur noch als Guard
 * für Bestandsdaten und warnt bei Drift.
 */

const UMLAUT_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/ä/g, "ae"],
  [/ö/g, "oe"],
  [/ü/g, "ue"],
  [/Ä/g, "AE"],
  [/Ö/g, "OE"],
  [/Ü/g, "UE"],
  [/ß/g, "ss"],
];

/**
 * Auf den DATEV-Zeichensatz reduzieren und auf 36 Zeichen kappen; leer → null.
 *
 * **Führende Nullen bleiben stehen** (Owner-Entscheid 2026-08-25). Die frühere
 * Regel „DATEV schneidet sie beim Import selbst ab" ist am Bestand widerlegt:
 * im DATEV-Spiegel von 61015 trägt Konto 81250 in 101 Buchungen das Format
 * `MMJJJJ` MIT führender Null (`012026`, `042026`, `072026`). Das Abschneiden
 * hat genau diese Konvention gebrochen — aus `082026` wurde `82026`, und die
 * Zahlung zifferte nicht mehr aus. Belegfeld 1 ist der OPOS-Ausgleichs-
 * schlüssel und muss zeichengleich zum DATEV-Bestand sein; darum wird der
 * Wert hier nur noch auf den erlaubten Zeichensatz reduziert.
 *
 * Altbestand, der vor dem 2026-08-25 ohne führende Null geschrieben wurde,
 * gleicht `acceptanceEqual` NICHT aus (anderes Ziffern-Skelett) — solche Werte
 * brauchen eine Datenkorrektur, keine Normalisierungs-Rückfalltür.
 */
export function normalizeBelegfeld1(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  let value = raw.trim();
  for (const [pattern, replacement] of UMLAUT_REPLACEMENTS) {
    value = value.replace(pattern, replacement);
  }
  value = value.replace(/[^A-Za-z0-9_$&%*+\-/]/g, "").slice(0, 36);
  return value.length > 0 ? value : null;
}

/* ── F85-T85.9a: Akzeptanzregel — meinen zwei Belegnummern denselben Beleg? ──
 *
 * Regel 3 des Owner-Entscheids 2026-08-20: DATEV ziffert nur bei
 * ZEICHENGLEICHHEIT aus, also muss der Server abweichende Schreibweisen
 * angleichen. Begründungsfrei darf er das nur, wenn beide Werte
 * nachweisbar denselben Beleg meinen — genau das prüft `acceptanceEqual`.
 *
 * Verhältnis zum Bestand: `refersToSameDocument` (Containment + exakter
 * Betrag, `accounting-cases/application/open-items.ts`) bleibt die
 * KANDIDATEN-Suche; die Akzeptanzregel ist der strengere Maßstab fürs
 * begründungsfreie Überschreiben.
 */

/** Präfixe/Suffixe, die kein Beleg-Merkmal sind, sondern nur „Rechnung" sagen. */
const AFFIX_WHITELIST = new Set([
  "RE", "RG", "RECH", "RECHNUNG", "RNR", "INV", "INVOICE",
  "NR", "NO", "BELEG", "AR", "ER",
]);

/** Mindestlänge des Ziffern-Skeletts — kurze Zahlen sind kein Beleg-Beweis. */
const MIN_DIGIT_SKELETON = 5;

/** Großschreibung; Leer- und Trennzeichen `.,-_/` entfernen. */
function normalizeForAcceptance(value: string): string {
  return value.toUpperCase().replace(/[\s.,\-_/]/g, "");
}

/**
 * Alpha-Kern: die Buchstabenläufe ohne die Whitelist-Tokens. Was übrig
 * bleibt, gehört zur Beleg-Identität und muss exakt übereinstimmen
 * (`4711A` ≠ `4711B`).
 */
function alphaCore(normalized: string): string {
  return (normalized.match(/[A-Z]+/g) ?? [])
    .filter((token) => !AFFIX_WHITELIST.has(token))
    .join("");
}

const digitSkeleton = (normalized: string) => (normalized.match(/\d/g) ?? []).join("");

/**
 * Akzeptanz-gleich = derselbe Beleg, ohne dass jemand es begründen muss:
 * exakt gleich nach Normalisierung ODER gleiches Ziffern-Skelett (≥ 5
 * Ziffern) bei gleichem Alpha-Kern.
 *
 * `RE 2026-003` ≡ `Rechnung2026-003` ≡ `re. 2026-003`;
 * `RNR 20260023-7` ≠ `20260023` (anderes Skelett).
 */
export function acceptanceEqual(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (a == null || b == null) return false;
  const x = normalizeForAcceptance(a);
  const y = normalizeForAcceptance(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const skeleton = digitSkeleton(x);
  if (skeleton.length < MIN_DIGIT_SKELETON || skeleton !== digitSkeleton(y)) return false;
  return alphaCore(x) === alphaCore(y);
}

/* ── F85: Betreff als TEMPORÄRE Belegnummern-Quelle ─────────────────────────
 * Verwendungszwecke sind Freitext; die hier extrahierten Kandidaten sind
 * bewusst schwach (Quelle `bank_purpose`, Rang ganz unten im Dominanz-
 * Ranking, nie automatisch dominant, solange eine andere Quelle existiert).
 */

/**
 * Datums-Schreibweisen (`15.03.2026`, `2026-03-15`) sind keine Belegnummern.
 * Geprüft wird am ROHEN Token — erst die Trennzeichen machen ein Datum
 * erkennbar; ziffernrein ist `20260025` eine ganz normale Belegnummer.
 */
const DATE_LIKE = /^(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}|\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})$/;

/**
 * Ein Zeitraum ist auch kein Beleg. `01.07.26-31.07.26` fiel durch, weil der
 * Token-Regex den ganzen Range in einem Stück frisst und `DATE_LIKE` ihn als
 * Ganzes testet — er landete als Belegnummern-Kandidat im Register (P11).
 * Am `-` splitten und prüfen, ob ALLE Teile datumsartig sind.
 */
function isDateRange(token: string): boolean {
  const parts = token.split("-");
  return parts.length > 1 && parts.every((p) => DATE_LIKE.test(p));
}
/** IBAN: Ländercode + Prüfziffer + Kontoteil. */
const IBAN_LIKE = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;
/**
 * Betrag mit Währungskürzel (`47600Eur`, `1.500,00 EUR` → `1500,00EUR`).
 * Geprüft am normalisierten Token, weil erst dort Tausenderpunkt und Komma weg
 * sind. Solche Tokens landeten als „Belegnummern" im Register und wurden vom
 * Belegfeld-Guard zum Ausziffern vorgeschlagen.
 */
const AMOUNT_WITH_CURRENCY = /^(?:\d+(?:EUR|EURO|USD|CHF|GBP)|(?:EUR|EURO|USD|CHF|GBP)\d+)$/;

/**
 * Nummern-artige Kandidaten aus einem Freitext (Verwendungszweck).
 * Mindestens 5 Ziffern — dieselbe Schranke wie beim Matching; Datums- und
 * IBAN-Muster fliegen raus. Reihenfolge = Vorkommen, ohne Duplikate.
 *
 * ponytail: rein syntaktisch, kein Muster je Bank. Rauschen (Beträge mit
 * Tausenderpunkt, Kundennummern) ist eingepreist — die Kandidaten sind nie
 * dominant, solange eine echte Quelle existiert. Wenn das real stört:
 * Negativliste je Mandant, nicht Parser je Format.
 */
export function extractDocumentNumberCandidates(text: string | null | undefined): string[] {
  if (!text) return [];
  const out: string[] = [];
  for (const token of text.match(/[A-Za-z0-9][A-Za-z0-9\-_/.]*[A-Za-z0-9]/g) ?? []) {
    if (DATE_LIKE.test(token) || isDateRange(token)) continue;
    const normalized = normalizeForAcceptance(token);
    if ((normalized.match(/\d/g) ?? []).length < MIN_DIGIT_SKELETON) continue;
    if (IBAN_LIKE.test(normalized) || AMOUNT_WITH_CURRENCY.test(normalized)) continue;
    // Dedup nach derselben Regel, die auch den Abgleich entscheidet:
    // `RE-20260025` und `20260025` im selben Betreff sind EIN Kandidat.
    if (out.some((seen) => acceptanceEqual(seen, token))) continue;
    out.push(token);
  }
  return out;
}

/* ── W4b: die Konvention des Kontos ────────────────────────────────────────
 * Befund (61015, 74 Vorschläge gegen 19 Monate Historie): 24 Sätze trugen eine
 * Ludwig-interne `L-nnnnnn`-Nummer, die im Mandantenbestand KEIN EINZIGES MAL
 * vorkommt — während die echte Nummer im Bankverwendungszweck stand und das
 * Konto ein eindeutiges Format führt (Domainfactory: 52 von 54 Buchungen
 * 8-stellig). Ludwig kannte die Konvention nicht, obwohl sie im DATEV-Spiegel
 * steht.
 *
 * Gemessen über alle Mandanten (2026-08-27): 1548 von 1808 Personenkonten
 * führen ein dominantes Format, 1228 davon mit mindestens drei Belegen.
 */

/** Wie viele Belege ein Konto haben muss, damit „Konvention" mehr ist als Zufall. */
const MIN_CONVENTION_SAMPLES = 3;
/** Anteil, ab dem ein Format als Konvention des Kontos gilt. */
const CONVENTION_DOMINANCE = 0.8;

export interface BelegfeldConvention {
  /** Ziffern zu `d` verallgemeinert: `42685037` → `dddddddd`, `2963-062026` → `dddd-dddddd`. */
  skeleton: string;
  /** Belege mit diesem Skelett / Belege gesamt. */
  share: number;
  samples: number;
  /**
   * Das Konto führt gar keine Belegnummer: der dominante Wert ist konstant `0`
   * (DATEVs „kein Beleg"). Eine synthetische Nummer wäre hier ein Fremdkörper.
   */
  empty: boolean;
}

function skeletonOf(value: string): string {
  return value.replace(/\d/g, "d");
}

/**
 * Das dominante Belegnummern-Format eines Kontos — oder null, wenn keins
 * dominiert. Eingabe sind die in DATEV auf diesem Konto beobachteten Nummern.
 */
export function deriveBelegfeldConvention(seen: readonly string[]): BelegfeldConvention | null {
  const values = seen.map((v) => v.trim()).filter((v) => v.length > 0);
  if (values.length < MIN_CONVENTION_SAMPLES) return null;
  const counts = new Map<string, number>();
  for (const v of values) counts.set(skeletonOf(v), (counts.get(skeletonOf(v)) ?? 0) + 1);
  let best = "";
  let bestN = 0;
  for (const [skeleton, n] of counts) {
    if (n > bestN) [best, bestN] = [skeleton, n];
  }
  const share = bestN / values.length;
  if (share < CONVENTION_DOMINANCE) return null;
  // „Leer" ist eine eigene Konvention, kein fehlender Wert: das Skelett `d`
  // allein reicht nicht, die Werte müssen tatsächlich `0` sein.
  const empty = values.filter((v) => skeletonOf(v) === best).every((v) => v === "0");
  return { skeleton: best, share, samples: values.length, empty };
}

/**
 * Wählt aus Freitext-Kandidaten den einen, der zur Konvention des Kontos passt.
 * Genau einer oder keiner — bei mehreren Treffern wird nicht geraten.
 *
 * Das ist die Stufe, die den Realfall löst: aus `Rg. 42685037 v. 17.08.26` wird
 * auf einem Konto mit 8-stelliger Konvention `42685037`, und das Datum am Ende
 * fällt raus, weil es das Format nicht trifft.
 */
export function pickCandidateByConvention(
  candidates: readonly string[],
  convention: BelegfeldConvention | null,
): string | null {
  if (!convention || convention.empty) return null;
  const hits = new Set<string>();
  for (const raw of candidates) {
    const normalized = normalizeBelegfeld1(raw);
    if (normalized == null) continue;
    // Zwei Formen prüfen, weil der Verwendungszweck die Nummer oft mit einem
    // Präfix trägt, das der Beleg selbst nicht führt: M-net schreibt
    // `/INV/202607033900`, in DATEV steht `202607033900`. Dieselbe Nachsicht,
    // die `acceptanceEqual` über das Ziffern-Skelett schon kennt.
    for (const form of [normalized, normalized.replace(/\D/g, "")]) {
      if (form.length > 0 && skeletonOf(form) === convention.skeleton) hits.add(form);
    }
  }
  return hits.size === 1 ? [...hits][0]! : null;
}
