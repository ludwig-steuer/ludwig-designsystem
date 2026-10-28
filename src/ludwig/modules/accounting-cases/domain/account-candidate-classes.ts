/**
 * Erlaubte `skr_class`-Pools der semantischen Kontensuche (F433 — wörtlicher
 * 1:1-Port aus `ludwig/workflows/application/services/
 * ledger_account_retrieval_service.py`, inklusive der Beleganker).
 */

/**
 * Account classes that are *plausible debit candidates* for an incoming
 * invoice. Personal accounts (`creditor` / `debtor`), revenue, equity,
 * liabilities and carryforward / other are ruled out at the SQL level so
 * pgvector never returns them as candidates — even when their `account_name`
 * is semantically close to the invoice text (e.g. a creditor named like the
 * vendor would otherwise edge out the actual expense account on the embedding
 * similarity).
 *
 * This is a *deterministic* constraint, not an LLM judgement: by domain rule,
 * an Eingangsrechnung never books its debit leg against a creditor or revenue
 * account. See `docs/topics/buchung.md` Abschnitt „Konto-Auswahl & Filter".
 *
 * Hinweis: `personnel_expense` (Klasse 6, Personalaufwand) ist hier bewusst
 * nicht drin. Lohnbuchungen kommen nicht über Lieferanten-Eingangsrechnungen,
 * sondern über separate Lohn-Schnittstellen.
 */
export const EXPENSE_ELIGIBLE_ACCOUNT_CLASSES = [
  "material_expense",
  "other_operating_expense",
  "fixed_assets",
  "current_assets",
] as const;

/**
 * F135: Pool für freien Text ohne `nature` (`case_context` Teil
 * `account_proposals`, z. B. ein Bank-Verwendungszweck): alle Sachkonten-Klassen. Die Eingangsrechnungs-
 * Whitelist oben ist dort zu eng — „Nachzahlungszinsen § 233a AO" gehört auf
 * `other_expense_income` (SKR03 Klasse 2), das der Proposer sonst nie
 * liefern kann (Befund #46). Personenkonten (`personal_debtor` /
 * `personal_creditor`) und `carryforward` bleiben draußen — sie sind nie
 * das Gegenkonto eines Geschäftsvorfalls, den man über Text sucht;
 * `revenue_self_consumption` aus dem bei
 * `REVENUE_ELIGIBLE_ACCOUNT_CLASSES` dokumentierten Grund.
 */
export const FREE_TEXT_ELIGIBLE_ACCOUNT_CLASSES = [
  "material_expense",
  "other_operating_expense",
  "fixed_assets",
  "current_assets",
  "personnel_expense",
  "other_expense_income",
  "revenue",
  "equity",
  "liabilities",
] as const;

/**
 * Erlös-Pool für Outgoing-Rechnungen. `revenue_self_consumption`
 * (SKR04 4600–4699 — Eigenverbrauch, unentgeltliche Wertabgaben,
 * Sachbezüge) ist BEWUSST nicht enthalten: diese Konten würden im
 * Embedding-Vergleich echte Erlöskonten wie 4400 verdrängen, weil
 * ihre Beschreibung semantisch zu B2B-Services passt (z.B. 4663
 * „Unentgeltl. Erbringung Leist. 19 % USt"). Anker: Beleg 49379b1e
 * (Muster Zweirad → Muster Dienstrad-Leasing, Fahrradservice).
 */
export const REVENUE_ELIGIBLE_ACCOUNT_CLASSES = ["revenue"] as const;

/**
 * Mapping `fund_usage_nature` → erlaubte `skr_class`-Liste.
 *
 * Die Nature kommt vom Interpreter pro Line und ist eine **harte
 * fachliche Aussage**: `goods` heißt Wareneinkauf zum Weiterverkauf
 * oder Bestand (SKR04 5xxx, `material_expense`), `expense` heißt
 * Verbrauch im Betrieb (SKR04 5xxx Fremdleistungen + 6xxx
 * Betriebsaufwendungen). Ohne diesen Filter wählt pgvector blind aus
 * allen 5 Booking-Klassen — und legt z. B. „Fahrradpflege" auf 6540
 * Fahrzeug-Reparaturen statt 5405 Wareneingang Zubehör, obwohl die
 * Line-Nature klar `goods` sagt.
 *
 * Bei `goods` lassen wir `fixed_assets` zu, weil größere
 * Investitionsgüter (Maschinen, Fahrzeuge) ebenfalls `goods`
 * klassifiziert werden können — der GwG-Constraint im Booking-Modul
 * kappt `fixed_assets` für kleine Beträge automatisch.
 *
 * Bei `expense` lassen wir `material_expense` mit zu, weil die
 * SKR04-Klasse 5 sowohl Wareneingänge (5400 ff.) als auch
 * Fremdleistungen (5900 Fremdleistungen 0 %, 5910 Fremdarbeiten
 * Personalgestellung etc.) enthält. Ein „Honorar Stadtführung"-Beleg
 * ist fachlich ein Aufwand (`expense`), das passende Konto liegt
 * aber in `material_expense` — der Filter darf ihn nicht
 * rauswerfen. Anker: Beleg 6976e3e2 (Hajek Eva, Wald-Baden, sollte
 * 59000 Fremdleistungen 0 % treffen, landete vor dem Fix auf 66000
 * Werbekosten weil 59000 vor dem Embedding-Vergleich gefiltert war).
 *
 * `mixed` und `unknown` öffnen den vollen Pool — sicherer als
 * falsch zu raten.
 */
export const NATURE_TO_ACCOUNT_CLASSES = {
  goods: ["material_expense", "fixed_assets"],
  expense: ["other_operating_expense", "material_expense"],
  revenue: REVENUE_ELIGIBLE_ACCOUNT_CLASSES,
  mixed: EXPENSE_ELIGIBLE_ACCOUNT_CLASSES,
  unknown: EXPENSE_ELIGIBLE_ACCOUNT_CLASSES,
} as const;
export type AccountCandidateNature = keyof typeof NATURE_TO_ACCOUNT_CLASSES;

/**
 * Resolve `line.nature` to a list of allowed `skr_class` values.
 * Unknown / NULL nature → full pool (we'd rather have noise than silently
 * drop legitimate candidates). `Object.hasOwn`, damit geerbte Schlüssel wie
 * `constructor` nicht als Nature durchgehen.
 */
export function eligibleClassesForNature(nature: string | null | undefined): readonly string[] {
  if (nature == null || !Object.hasOwn(NATURE_TO_ACCOUNT_CLASSES, nature)) return EXPENSE_ELIGIBLE_ACCOUNT_CLASSES;
  return NATURE_TO_ACCOUNT_CLASSES[nature as AccountCandidateNature];
}
