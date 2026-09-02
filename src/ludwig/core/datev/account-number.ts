/**
 * DATEV-Kontonummern: das EINE Konvertierungsmodul (F52-T52.9/T52.10, BL-109).
 *
 * ## Zwei Welten
 *
 * **Ludwig-Kanon (logische Nummer).** In jeder Ludwig-Tabelle steht die logische
 * DATEV-Nummer als String, links mit Nullen auf ihre Sollbreite gepaddet:
 * Sachkonten `SKL` Stellen, Personenkonten `SKL+1`. `SKL` ist die
 * Sachkontenlänge des Mandanten/Wirtschaftsjahres (4–8, DATEV
 * `fiscal-years.account_length`, SSOT `resolveAccountNumberLength`).
 * Speichern = Anzeigen: eine separate Anzeigeform gibt es nicht.
 *
 * **DATEV-Draht.** Die DATEVconnect-Endpunkte serialisieren auf feste Breite mit
 * rechts angehängten Nullen — Sachkonten 8, Personenkonten 9 Stellen. Rechts-
 * Null-Auffüllen ist DATEVs eigene Kontonummern-Semantik (beim Erhöhen der SKL
 * wird `1200` zu `12000`, Wissensplattform 1000104). Die Felder sind dabei
 * **numerisch**, also fehlen die führenden Nullen:
 *
 * | Konto  | Vollform   | auf dem Draht |
 * |--------|------------|---------------|
 * | `1780` | `17800000` | `17800000`    |
 * | `0178` | `01780000` | `1780000`     |
 * | `0001` | `00010000` | `10000`       |
 *
 * Deshalb gilt für JEDE Draht→logisch-Konvertierung: **erst links auf die
 * Vollbreite padden, dann rechts kürzen.** Wer nur rechts kürzt, macht aus
 * `0178` das Konto `1780` — genau der Fehler, der 61015 274 falsche Konten und
 * 159 verworfene echte Konten eingebracht hat (BL-109).
 *
 * ## Der Kontotyp ist Teil der Angabe
 *
 * Eine Kontonummer allein ist nicht konvertierbar — es braucht `SKL` **und** den
 * Kontotyp, weil die Zielbreite davon abhängt (8 vs. 9). Deshalb ist `kind` in
 * beiden Richtungen ein PFLICHT-Argument, kein optionales: ein vergessener
 * Parameter darf nicht stillschweigend zu einer Rate-Heuristik werden.
 *
 * Woher der Typ kommt:
 *  - gespeichert: `client_ledger_accounts.account_kind` (die Wahrheit, BL-109)
 *  - aus dem Endpunkt: Kontenstamm = Sachkonto, Kreditoren/Debitoren = Personenkonto
 *  - abgeleitet: nur wo er wirklich unbekannt ist (OPOS-Gegenkonto,
 *    `account-postings`) über `kindFromWireWidth()` — eigene Funktion, damit an
 *    der Aufrufstelle sichtbar ist, dass geraten wird. Sie trägt, weil DATEV
 *    Personenkonten ab `10000` vergibt: keine führende Null, also immer voll
 *    9-stellig auf dem Draht.
 *
 * ## Fail fast statt raten
 *
 * Jede Konvertierung, die eine echte Kontonummer zerstören würde, wirft:
 * signifikante Reststellen beim Kürzen, mehrdeutige Breiten, Personenkonten mit
 * führender Null. Ein still verschobenes Konto ist teurer als ein Abbruch.
 */

/** Draht-Vollbreite der DATEVconnect-Serialisierung. */
const GENERAL_WIRE_WIDTH = 8;
const PERSONAL_WIRE_WIDTH = 9;

/**
 * Kontotyp im DATEV-Sinn — bestimmt die Breite in beiden Richtungen.
 * NICHT zu verwechseln mit `client_ledger_accounts.accounting_role`: die ist
 * fachlich (revenue, creditor …) und sagt nichts über die Nummernbreite. Ein
 * Sammelkonto trägt Rolle `creditor`, ist aber ein Sachkonto.
 */
export type AccountKind = "general" | "personal";

/** Sollbreite der logischen Nummer. */
export function logicalWidth(kind: AccountKind, accountNumberLength: number): number {
  return kind === "personal" ? accountNumberLength + 1 : accountNumberLength;
}

/** Sollbreite auf dem Draht. */
function wireWidth(kind: AccountKind): number {
  return kind === "personal" ? PERSONAL_WIRE_WIDTH : GENERAL_WIRE_WIDTH;
}

function digitsOnly(raw: string, context: string): string {
  const n = raw.trim();
  if (!/^\d+$/.test(n)) {
    throw new Error(`${context}: '${raw}' ist keine reine Ziffernfolge.`);
  }
  return n;
}

/**
 * Kontotyp einer LOGISCHEN Nummer aus ihrer Breite (SKL → Sachkonto, SKL+1 →
 * Personenkonto). Wirft bei jeder anderen Breite: dann ist die Nummer nicht
 * kanonisch gespeichert und jede Folgekonvertierung wäre geraten.
 *
 * ⚠️ Das ist eine Ableitung, keine gespeicherte Wahrheit. Sie trägt nur, solange
 * die Nummer mit führenden Nullen auf Sollbreite steht (`0178`, nicht `178`).
 */
export function accountKindOf(logical: string, accountNumberLength: number): AccountKind {
  const n = digitsOnly(logical, "DATEV-Kontonummer");
  if (n.length === accountNumberLength) return "general";
  if (n.length === accountNumberLength + 1) return "personal";
  throw new Error(
    `DATEV-Kontonummer '${logical}' hat ${n.length} Stellen — bei Sachkontenlänge ` +
      `${accountNumberLength} sind Sachkonten ${accountNumberLength}-stellig und Personenkonten ` +
      `${accountNumberLength + 1}-stellig. Kein Kontotyp ableitbar.`,
  );
}

/**
 * Ist `num` (logisch) ein Personenkonto? Tolerante Variante von
 * `accountKindOf` für Stellen, die nur unterscheiden und nicht validieren wollen.
 */
export function isPersonalAccountNumber(num: string, accountNumberLength: number): boolean {
  return num.trim().length === accountNumberLength + 1;
}

/**
 * Invariante beim Schreiben: die Nummer steht kanonisch (Ziffern, Sollbreite des
 * Typs). Gibt die getrimmte Nummer zurück, damit man sie direkt weiterreichen kann.
 *
 * @throws Error mit sprechender Meldung
 */
export function assertLogicalAccount(
  num: string,
  accountNumberLength: number,
  kind?: AccountKind,
): string {
  const n = digitsOnly(num, "DATEV-Kontonummer");
  const actual = accountKindOf(n, accountNumberLength);
  if (kind != null && actual !== kind) {
    throw new Error(
      `DATEV-Kontonummer '${num}' ist ${n.length}-stellig — das ist bei Sachkontenlänge ` +
        `${accountNumberLength} ein ${actual === "personal" ? "Personen" : "Sach"}konto, ` +
        `erwartet war ein ${kind === "personal" ? "Personen" : "Sach"}konto.`,
    );
  }
  return n;
}

/**
 * **Draht → Ludwig-Kanon.** Links auf die Vollbreite padden, dann auf die
 * logische Breite kürzen.
 *
 * `('1780000', 4, 'general') → '0178'`, `('721500000', 4, 'personal') → '72150'`.
 *
 * `kind` ist Pflicht. Kennt die Aufrufstelle den Typ nicht (OPOS-Gegenkonto,
 * `account-postings`), leitet sie ihn sichtbar über `kindFromWireWidth()` ab.
 *
 * @throws Error wenn die abgeschnittenen Stellen nicht nur Nullen sind (dann
 * padet DATEV anders als angenommen) oder wenn ein Personenkonto mit führender
 * Null herauskäme (die vergibt DATEV nicht).
 */
export function fromDatevWire(
  raw: string,
  accountNumberLength: number,
  kind: AccountKind,
): string {
  const n = digitsOnly(raw, "DATEV-Kontonummer");
  const resolved = kind;
  const padded = n.padStart(wireWidth(resolved), "0");
  const width = logicalWidth(resolved, accountNumberLength);
  if (padded.length > wireWidth(resolved)) {
    throw new Error(
      `DATEV-${resolved === "personal" ? "Personen" : "Sach"}konto '${raw}' ist länger als die ` +
        `Draht-Vollbreite ${wireWidth(resolved)} — keine gültige Draht-Serialisierung.`,
    );
  }
  const head = padded.slice(0, width);
  const tail = padded.slice(width);
  if (!/^0*$/.test(tail)) {
    throw new Error(
      `DATEV-${resolved === "personal" ? "Personen" : "Sach"}konto '${raw}' lässt sich nicht auf ` +
        `${width} Stellen kürzen (Sachkontenlänge ${accountNumberLength}): Reststellen '${tail}' ` +
        "sind nicht null.",
    );
  }
  if (resolved === "personal" && head.startsWith("0")) {
    throw new Error(
      `DATEV-Personenkonto '${raw}' ergäbe die logische Nummer '${head}' — Personenkonten haben ` +
        "keine führende Null (DATEV vergibt sie ab 10000). Vermutlich ist es ein Sachkonto.",
    );
  }
  return head;
}

/**
 * Kontotyp aus der Draht-BREITE — der einzige erlaubte Weg, wenn die Aufrufstelle
 * ihn wirklich nicht kennt (`account-postings.contra_account_number`, OPOS-
 * Gegenkonto: dort steht mal ein Sach-, mal ein Personenkonto).
 *
 * Bewusst eine eigene Funktion mit eigenem Namen, statt ein optionales Argument:
 * an der Aufrufstelle muss sichtbar sein, dass der Typ ABGELEITET und nicht
 * gewusst wird. Personenkonten kommen immer voll 9-stellig an (DATEV vergibt sie
 * ab 10000, es gibt also keine führende Null zu strippen), Sachkonten mit 8 oder
 * weniger Stellen.
 *
 * @throws Error bei mehrdeutiger Breite — dann braucht die Aufrufstelle echten
 * Typ-Kontext (z.B. den gespeicherten `client_ledger_accounts.account_kind`).
 */
export function kindFromWireWidth(raw: string, accountNumberLength: number): AccountKind {
  const n = digitsOnly(raw, "DATEV-Kontonummer");
  return inferKindFromWire(n, accountNumberLength, raw);
}

function inferKindFromWire(n: string, accountNumberLength: number, raw: string): AccountKind {
  if (n.length === PERSONAL_WIRE_WIDTH) return "personal";
  if (n.length > GENERAL_WIRE_WIDTH) {
    throw new Error(
      `DATEV-Kontonummer '${raw}' hat ${n.length} Stellen — weder Sachkonto-Vollbreite ` +
        `(${GENERAL_WIRE_WIDTH}) noch Personenkonto-Vollbreite (${PERSONAL_WIRE_WIDTH}).`,
    );
  }
  // SKL 7: Personenkonto-Vollform wäre 8 = Sachkonto-Vollbreite. Nicht entscheidbar.
  if (accountNumberLength + 1 === GENERAL_WIRE_WIDTH && n.length === GENERAL_WIRE_WIDTH) {
    throw new Error(
      `DATEV-Kontonummer '${raw}' ist bei Sachkontenlänge ${accountNumberLength} mehrdeutig ` +
        "(Sachkonto-Vollform oder Personenkonto) — die Aufrufstelle muss den Kontotyp mitgeben.",
    );
  }
  return "general";
}

/**
 * **Ludwig-Kanon → Draht.** Rechts auf die Vollbreite auffüllen: Sachkonten 8,
 * Personenkonten 9 Stellen.
 *
 * Für den JSON-Push (`accounting_records`) zwingend — eine logische Nummer im
 * Push-Body quittiert DATEV mit „Das eingegebene Konto/Gegenkonto '72090' stimmt
 * nicht mit der geschlüsselten Sachkontenlänge überein" (REW00799).
 * Gilt NUR für den JSON-Push: die EXTF-CSV bleibt logisch, dort trägt Header-Feld
 * 13 die Sachkontenlänge und DATEV rechnet selbst um.
 *
 * `kind` ist Pflicht — beim Export ist er gespeichert (`account_kind`), es gibt
 * keinen Grund zu raten.
 */
export function toDatevWire(
  logical: string,
  accountNumberLength: number,
  kind: AccountKind,
): string {
  const n = digitsOnly(logical, "DATEV-Kontonummer");
  const resolved = kind;
  const width = logicalWidth(resolved, accountNumberLength);
  if (n.length !== width) {
    throw new Error(
      `DATEV-${resolved === "personal" ? "Personen" : "Sach"}konto '${logical}' hat ${n.length} ` +
        `Stellen — erwartet ${width} (Sachkontenlänge ${accountNumberLength}). Nicht kanonisch ` +
        "gespeichert, deshalb keine Draht-Serialisierung möglich.",
    );
  }
  return n.padEnd(wireWidth(resolved), "0");
}

/**
 * Start des Ludwig-Platzhalter-Ranges für Personenkonten: „89" rechts mit Nullen
 * auf Personenkonto-Breite (Sachkontenlänge + 1). Bei SKL 4 also 89000, bei
 * SKL 5 890000.
 *
 * Ein am Mandanten konfigurierter Startwert gilt nur, wenn er zu dieser Breite
 * passt. Der frühere feste Default 890000 hat bei SKL 4 sechsstellige Nummern
 * erzeugt (890000–890006 bei Mandant 10160), die keine gültige DATEV-Nummer sind
 * und beim Export nicht serialisierbar waren — Owner-Befund 2026-08-08.
 */
export function placeholderPersonalAccountStart(
  accountNumberLength: number,
  configured?: number | null,
): number {
  const width = accountNumberLength + 1;
  if (configured != null && String(configured).length === width) return configured;
  return Number("89".padEnd(width, "0"));
}

/**
 * Prüft, ob `num` als DATEV-Personenkonto überhaupt in Frage kommt (F57-T57.5).
 *
 * Owner-Leitsatz 2026-08-05: Ludwig hat kein Recht, Kontonummern zu wählen — sie
 * kommen aus DATEV-Vergabe, Kontenrahmen oder Import. Wo ein Mensch eine Nummer
 * von Hand übernimmt (Accept-Pfad), fängt diese Prüfung wenigstens ab, was DATEV
 * sicher nicht vergeben hat: falsche Länge (Personenkonten sind SKL+1-stellig)
 * oder eine Nummer aus Ludwigs eigenem Platzhalter-Range.
 *
 * @throws Error mit sprechender Meldung; gibt die getrimmte Nummer zurück.
 */
export function assertDatevPersonalAccountNumber(
  num: string,
  accountNumberLength: number,
  systemPrefixStart: number,
): string {
  const n = num.trim();
  if (!/^\d+$/.test(n)) {
    throw new Error(`DATEV-Personenkonto '${num}' ist keine reine Ziffernfolge.`);
  }
  if (!isPersonalAccountNumber(n, accountNumberLength)) {
    throw new Error(
      `DATEV-Personenkonto '${num}' hat ${n.length} Stellen — bei Sachkontenlänge ` +
        `${accountNumberLength} sind Personenkonten ${accountNumberLength + 1}-stellig.`,
    );
  }
  const asInt = Number(n);
  if (asInt >= systemPrefixStart && asInt < systemPrefixStart + SYSTEM_PREFIX_RANGE) {
    throw new Error(
      `'${num}' liegt in Ludwigs Platzhalter-Range (ab ${systemPrefixStart}) — das ist keine ` +
        "von DATEV vergebene Nummer. Personenkonten legt die DATEV-Bridge an.",
    );
  }
  return n;
}

/** Breite von Ludwigs interner Platzhalter-Range (89xxxx), gespiegelt aus create-creditor-core. */
export const SYSTEM_PREFIX_RANGE = 10000;
