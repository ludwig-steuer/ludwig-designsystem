/**
 * Statischer Katalog der häufigen DATEV-Steuerschlüssel (BU-Schlüssel), damit
 * der Agent an Buchungszeilen nur gültige `tax_key`s setzt (F06-T6.5). Kein
 * Umbau der booking-module-Tax-Regeln — nur ein abfragbarer Referenz-Katalog.
 *
 * Die BU-Schlüssel sind bei DATEV framework-übergreifend gleich (SKR03 == SKR04);
 * die verifizierten Werte 2/3/8/9 stammen aus dem DATEV-Import der Testmandanten,
 * `1` (steuerfrei) ist Standard. §13b (Reverse-Charge, 91/92/94/95) und
 * innergemeinschaftlicher Erwerb (18/19) sind seit F14-T14.7 mit aufgeführt,
 * **hängen aber am konkreten Sachverhalt** (Mandanten-Gate § 15, Belegangaben,
 * mit/ohne VSt-Abzug). Für die Entscheidung `get_guideline(name='input_tax')` abrufen
 * (Prüfschema + Buchungssätze); im Zweifel `raise_clarification` an die Kanzlei
 * statt raten. Der Assistenz-Modus des Submit rechnet nur 2/3/8/9 automatisch —
 * §13b/igE bucht der Agent explizit nach Guideline.
 */
// Der Katalog selbst liegt in `core/datev/tax-keys` — dieselbe Quelle nutzt die
// geteilte Buchungs-UI für die Klartext-Erklärung am Buchungssatz. Hier bleibt
// nur der fachliche Überbau (Konten-Mappings, Assist-Mengen).
export { DATEV_TAX_KEYS, taxKeyEntry, type TaxKeyEntry } from "@/ludwig/core/datev/tax-keys";
import { DATEV_TAX_KEYS, type TaxKeyEntry } from "@/ludwig/core/datev/tax-keys";

/**
 * Menge gültiger Keys — seit F81-T81.2 die **echte Allowlist** des Submit
 * (`TaxKeySchema` in `agent-booking-core`), nicht mehr nur eine behauptete.
 * Vorher war `tax_key` reines Pass-Through vom LLM: jeder Tippfehler landete
 * in der DB und fiel erst beim Export auf — oder gar nicht.
 */
export const DATEV_TAX_KEY_SET: ReadonlySet<string> = new Set(DATEV_TAX_KEYS.map((k) => k.key));

/**
 * BU-Schlüssel, die der Submit-Assistenzmodus deterministisch rechnet und
 * deren explizite Netto+Steuerzeile-Paarung validiert wird (Standard-VSt/USt
 * auf den Konten aus `taxAccountFor`). §13b (91/92/94/95) und igE (18/19)
 * gehören NICHT dazu — die bucht der Agent explizit auf Sonderkonten nach
 * `get_guideline(name='input_tax')` (F14-T14.7), ohne harte Submit-Validierung (T14.2-Ziel).
 */
export const STANDARD_ASSIST_TAX_KEYS: ReadonlySet<string> = new Set(["2", "3", "8", "9"]);

/** USt-Satz (%) zu einem BU-Schlüssel, `null` wenn steuerfrei/unbekannt. */
export function vatRateForTaxKey(taxKey: string): number | null {
  return DATEV_TAX_KEYS.find((k) => k.key === taxKey)?.vatRate ?? null;
}

/** VSt/USt-Konto, auf das die explizite Steuerzeile bucht. */
export interface TaxAccount {
  accountNumber: string;
  accountName: string;
}

/**
 * BU-Schlüssel → VSt/USt-Konto je Kontenrahmen. Grundlage der Steuer-Assistenz
 * im Submit-Kern (F14-T14.2): brutto + tax_key rein, der Kern erzeugt die
 * explizite Steuerzeile auf dem hier hinterlegten Konto. Verifiziert gegen die
 * realen Buchungen der Testmandanten (SKR03 1571/1576 VSt, SKR04 1401/1406 VSt).
 * Deckungsgleich mit den Steuerkonten, die der EXTF-Writer wieder kollabiert
 * (F14-T14.1). Steuerfrei (`1`) hat keine Steuerzeile → kein Eintrag.
 */
const TAX_ACCOUNTS_BY_FRAMEWORK: Record<"skr03" | "skr04", Record<string, TaxAccount>> = {
  skr03: {
    "8": { accountNumber: "1571", accountName: "Abziehbare Vorsteuer 7 %" },
    "9": { accountNumber: "1576", accountName: "Abziehbare Vorsteuer 19 %" },
    "2": { accountNumber: "1771", accountName: "Umsatzsteuer 7 %" },
    "3": { accountNumber: "1776", accountName: "Umsatzsteuer 19 %" },
  },
  skr04: {
    "8": { accountNumber: "1401", accountName: "Abziehbare Vorsteuer 7 %" },
    "9": { accountNumber: "1406", accountName: "Abziehbare Vorsteuer 19 %" },
    "2": { accountNumber: "3801", accountName: "Umsatzsteuer 7 %" },
    "3": { accountNumber: "3806", accountName: "Umsatzsteuer 19 %" },
  },
};

/**
 * Steuersatz je BU-Schlüssel in Prozent — nur die vier Standardschlüssel.
 *
 * §13b und igE (91/92/94/95, 18/19) stehen bewusst nicht drin: dort ist der
 * Zahlbetrag netto, und ein „Satz auf den Bruttobetrag" wäre die falsche
 * Rechnung. Die Kontennamen oben tragen denselben Satz im Klartext — diese
 * Tabelle macht ihn rechenbar.
 */
export const TAX_KEY_RATE_PERCENT: Readonly<Record<string, number>> = {
  "2": 7,
  "3": 19,
  "8": 7,
  "9": 19,
};

function normalizeSkr(framework: string | null): "skr03" | "skr04" | null {
  const c = framework?.toLowerCase();
  return c === "skr03" || c === "skr04" ? c : null;
}

/** Steuerkonto für (Framework, BU-Schlüssel), `null` wenn steuerfrei/unbekannt. */
export function taxAccountFor(framework: string | null, taxKey: string): TaxAccount | null {
  const skr = normalizeSkr(framework);
  return skr ? (TAX_ACCOUNTS_BY_FRAMEWORK[skr][taxKey] ?? null) : null;
}

/**
 * §13b-/igE-Konten je Kontenrahmen (T14.2-Erweiterung, 2026-07-11): der
 * Assistenz-Modus rechnet Reverse-Charge-Schlüssel jetzt selbst. Anders als
 * bei 2/3/8/9 ist der Zahlbetrag hier NETTO und es entstehen ZWEI Steuerzeilen
 * (VSt auf der Sachseite, USt auf der Gegenseite — Nullsumme für die
 * Zahllast). `input` fehlt bei 95 (ohne VSt-Abzug: die Steuer wird Aufwand).
 * Konten laut Vorsteuer-Guideline Abschnitt 4 (input-tax-booking.md);
 * 7 %-Varianten (91/92/18) bewusst NICHT hinterlegt — keine verifizierten
 * Konten, fail-fast statt raten.
 */
export interface ReverseChargeAccounts {
  input: TaxAccount | null;
  output: TaxAccount;
}

const REVERSE_CHARGE_ACCOUNTS_BY_FRAMEWORK: Record<
  "skr03" | "skr04",
  Record<string, ReverseChargeAccounts>
> = {
  skr03: {
    "94": {
      input: { accountNumber: "1577", accountName: "Abziehbare Vorsteuer § 13b UStG 19 %" },
      output: { accountNumber: "1787", accountName: "Umsatzsteuer § 13b UStG 19 %" },
    },
    "95": {
      input: null,
      output: { accountNumber: "1787", accountName: "Umsatzsteuer § 13b UStG 19 %" },
    },
    "19": {
      input: { accountNumber: "1574", accountName: "Abziehbare Vorsteuer aus igE 19 %" },
      output: { accountNumber: "1774", accountName: "Umsatzsteuer aus igE 19 %" },
    },
  },
  skr04: {
    "94": {
      input: { accountNumber: "1407", accountName: "Abziehbare Vorsteuer § 13b UStG 19 %" },
      output: { accountNumber: "3837", accountName: "Umsatzsteuer § 13b UStG 19 %" },
    },
    "95": {
      input: null,
      output: { accountNumber: "3837", accountName: "Umsatzsteuer § 13b UStG 19 %" },
    },
    "19": {
      input: { accountNumber: "1404", accountName: "Abziehbare Vorsteuer aus igE 19 %" },
      output: { accountNumber: "3804", accountName: "Umsatzsteuer aus igE 19 %" },
    },
  },
};

/** BU-Schlüssel, die der Assistenz-Modus als Reverse-Charge/igE rechnet. */
export const REVERSE_CHARGE_ASSIST_TAX_KEYS: ReadonlySet<string> = new Set(["94", "95", "19"]);

/** §13b-/igE-Konten für (Framework, BU-Schlüssel), `null` wenn nicht assistiert. */
export function reverseChargeAccountsFor(
  framework: string | null,
  taxKey: string,
): ReverseChargeAccounts | null {
  const skr = normalizeSkr(framework);
  return skr ? (REVERSE_CHARGE_ACCOUNTS_BY_FRAMEWORK[skr][taxKey] ?? null) : null;
}

/**
 * Standard-VSt/USt-Konten (2/3/8/9, ohne §13b/igE) — die Konten, die die
 * GUI-Steuerassistenz (BL-121) als abgeleitete Steuerzeile erzeugt bzw. beim
 * Editieren wieder in die Brutto-Sachzeile einklappt.
 */
export const STANDARD_TAX_ACCOUNT_NUMBERS: ReadonlySet<string> = new Set(
  Object.values(TAX_ACCOUNTS_BY_FRAMEWORK).flatMap((byKey) =>
    Object.values(byKey).map((a) => a.accountNumber),
  ),
);

/**
 * Alle VORSTEUER-Konten (Eingangsseite: Schlüssel 8/9 + §13b-/igE-input).
 * Eine Zeile auf einem dieser Konten heißt „der Satz zieht Vorsteuer" — das
 * ist der Auslöser für die Begründungspflicht bei Buchungen ohne Beleg
 * (BL-121: VST-DOC-1-Override).
 */
export const INPUT_TAX_ACCOUNT_NUMBERS: ReadonlySet<string> = new Set([
  ...Object.values(TAX_ACCOUNTS_BY_FRAMEWORK).flatMap((byKey) =>
    ["8", "9"].flatMap((k) => (byKey[k] ? [byKey[k].accountNumber] : [])),
  ),
  ...Object.values(REVERSE_CHARGE_ACCOUNTS_BY_FRAMEWORK).flatMap((byKey) =>
    Object.values(byKey).flatMap((rc) => (rc.input ? [rc.input.accountNumber] : [])),
  ),
]);

/**
 * Stabiler Erkennungstext im domainError, wenn eine Buchung mit Vorsteuer-
 * Zeile ohne Beleg am Ereignis eine Begründung braucht (BL-121). Der Drawer
 * erkennt daran den Fall und blendet das Begründungsfeld ein — der Text bleibt
 * trotzdem menschenlesbar, falls er woanders angezeigt wird.
 */
export const VAT_OVERRIDE_REQUIRED_MARKER = "Vorsteuer ohne Beleg erfordert eine Begründung";

/** Alle bekannten VSt/USt-Kontonummern (framework-übergreifend, inkl. §13b/igE)
 *  — zur Erkennung von Steuerzeilen bei der Explizit-Validierung. */
export const TAX_ACCOUNT_NUMBERS: ReadonlySet<string> = new Set([
  ...Object.values(TAX_ACCOUNTS_BY_FRAMEWORK).flatMap((byKey) =>
    Object.values(byKey).map((a) => a.accountNumber),
  ),
  ...Object.values(REVERSE_CHARGE_ACCOUNTS_BY_FRAMEWORK).flatMap((byKey) =>
    Object.values(byKey).flatMap((rc) => [
      ...(rc.input ? [rc.input.accountNumber] : []),
      rc.output.accountNumber,
    ]),
  ),
]);

/**
 * Katalog fürs Framework des Mandanten. Da die BU-Schlüssel framework-neutral
 * sind, ist die Rückgabe (heute) für alle Frameworks identisch — der Parameter
 * bleibt für spätere framework-spezifische Erweiterungen erhalten.
 */
export function taxKeysForFramework(_framework: string | null): readonly TaxKeyEntry[] {
  return DATEV_TAX_KEYS;
}

/**
 * VSt-/USt-Kontonummern des EINEN Frameworks als logische Nummern zur
 * Zeilen-Klassifikation (F91: Steuerzeilen-Erkennung der DSV-Ableitung).
 * Framework-spezifisch, weil sich die Nummernkreise überlagern (SKR04 3801 =
 * USt 7 %, SKR03 3801 = Wareneingangs-Bereich). Bei SKL > 4 werden die
 * Katalog-Nummern rechts auf die Sachkontenlänge aufgefüllt (DATEV-Semantik:
 * `1576` wird bei SKL 5 zu `15760`). Unbekanntes Framework → Union beider
 * (besser zu viel Steuerzeile erkannt als Brutto verfälscht).
 */
export function taxAccountNumbersForFramework(
  framework: string | null,
  accountNumberLength = 4,
): ReadonlySet<string> {
  const skr = normalizeSkr(framework);
  const numbers = skr
    ? [
        ...Object.values(TAX_ACCOUNTS_BY_FRAMEWORK[skr]).map((a) => a.accountNumber),
        ...Object.values(REVERSE_CHARGE_ACCOUNTS_BY_FRAMEWORK[skr]).flatMap((rc) => [
          ...(rc.input ? [rc.input.accountNumber] : []),
          rc.output.accountNumber,
        ]),
      ]
    : [...TAX_ACCOUNT_NUMBERS];
  return new Set(numbers.map((n) => n.padEnd(accountNumberLength, "0")));
}
