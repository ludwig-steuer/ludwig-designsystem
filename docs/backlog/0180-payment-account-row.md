# 0180 · PaymentAccountRow — das Zahlungskonto als Zeile und als Spaltensatz

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/payment-account/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: IBAN, SKR-Konto, Auszugserwartung, DATEV-Anbindung |
| Quelle | Entitätsprofil `docs/entitaeten/payment-account.md` (geprüft), Abschnitte „Datenpunkte" (Rang 1–9, 12), „Listen", „Formen", „Zuschnitt" (jetzt, Bau-Reihenfolge 2) |
| Ersetzt | in `ludwig/app` die Spalten in `[year]/banks/page.tsx` (180 Z., zehn Spalten) und die Handtabelle in `configuration/payment-accounts/page.tsx` (372 Z., acht Spalten) |
| Blockiert | `PaymentAccountList` (0181), `PaymentAccountSettingsList` (0182), „Konten des Stapels" (0168) |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Zwei Seiten zeigen dieselben Konten mit fast demselben Satz Spalten: das Jahr
(„welches Konto hat Bewegung?") und die Konfiguration („welches Konto liefert
Auszüge, welche Zahlungsart landet wo?"). Heute baut jede ihre eigenen Zellen —
und die Konfigurationsseite ihre eigene `<table>`.

## Einordnung

- **Wiederverwenden:** `PaymentAccountCell` (0174) nennt das Konto mit Zeichen,
  Namen und IBAN im `title` — sie ist die erste Zelle dieser Zeile.
  `AccountCell` trägt das Sachkonto, `StatusBadge` die drei Achsen.
- **Neu, weil:** Regel 5 aus `spec-schreiben` §3 — das Profil führt die Form.
- **Zuschnitt:** wie beim Buchungssatz (0175) und bei der Bankposition (0101)
  **ein Zellensatz, zwei Rahmen**: `payment-account-columns.tsx` für
  `DataTable`, `PaymentAccountRow.tsx` für die kurze Liste.
- **Setzt auf:** `PaymentAccountCell` (0174), `AccountCell`, `StatusBadge`
  (`statement_expectation`, `integration`, `payment_method`), `AmountCell`,
  `MonoCell`, `Time`, `DataTable`.

## Schnittstelle

**Daten.** `PaymentAccountRowData` in `entities/payment-account/payment-account.ts`:

```ts
export type PaymentAccountRowData = PaymentAccountFacts & {
  /** Art des Kontos — Wortliste `PAYMENT_ACCOUNT_KIND_LABEL` (gespiegelt). */
  kind?: PaymentAccountKind | null;
  ledgerAccountNumber?: string | null;
  ledgerAccountName?: string | null;
  /** Kartenkennung, wo es keine IBAN gibt (`external_account_id`). */
  externalAccountId?: string | null;
  /** Bewegung im Jahr — alles aus `PaymentAccountWithStats` (L-314). */
  inflow?: number | null;
  outflow?: number | null;
  net?: number | null;
  firstMovement?: string | null;
  lastMovement?: string | null;
  /** Von Hand gesetzte Auszugserwartung (`expects_statements_manual`). */
  expectsStatementsManual?: boolean | null;
  /** Zustand der Bank-Anbindung (`client_external_integrations.status`). */
  integrationStatus?: string | null;
  /** Abschaltung (`valid_until`) — gesetzt heißt abgeschaltet. */
  validUntil?: string | null;
  currency?: Currency;
};
```

`PaymentAccountFacts` kommt aus
`bank-transactions/domain/payment-account-options.ts` und wird nicht neu
definiert; die übrigen Felder sind der Befund **L-314** (`PaymentAccountWithStats`
liegt in der Infrastruktur), nicht eine eigene Wahrheit.

**Spaltensatz** `paymentAccountColumns(options)` → `ColumnDef<PaymentAccountRowData>[]`:

| Spalte | Rang | Zelle |
|---|---|---|
| `account` | 1 | `PaymentAccountCell` (Zeichen, Name, IBAN im `title`), mit `href` der Weg zum Auszug |
| `kind` | 2 | das Wort aus `PAYMENT_ACCOUNT_KIND_LABEL` |
| `identifier` | 3 | IBAN, sonst Kartenkennung, sonst „—" (`MonoCell`) |
| `ledgerAccount` | 4 | `AccountCell` mit Nummer und Name |
| `statementExpectation` | 6 | `StatusBadge statement_expectation` mit der Stufe (`required`, `expected`, `none`), dahinter der Zusatz „von Hand“, wo ein Mensch sie gesetzt hat — Nachtrag F235 |
| `txCount` | 7 | Zahl der Bankzeilen im Jahr |
| `inflow`, `outflow`, `net` | 7 | `AmountCell`, rechtsbündig |
| `period` | 7 | erste bis letzte Bewegung (`Time`) |
| `autoAssign` | 8 | die Zahlungsart, die hier automatisch landet |
| `integration` | 9 | `StatusBadge integration`, nur wo es eine gibt |
| `channelState` | 12 | `StatusBadge payment_method` — aktiv oder abgeschaltet (`valid_until`) |

Zwei Vorgaben statt einer: `MOVEMENT_COLUMNS` (die Seite des Jahres) und
`SETTINGS_COLUMNS` (die Konfiguration). Ohne `columns` gilt die erste.

| Option | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `columns` | `readonly PaymentAccountColumn[]` | nein | Auswahl und Reihenfolge | `Settings` |
| `statementHref` | `(accountId: string) => string` | nein | Weg zum Kontoauszug, an die Zelle durchgereicht | `Filled` |
| `accountHref` | `(accountNumber: string) => string` | nein | Weg zum Sachkonto-Drawer (0155) | `Filled` |

**Zeile** `PaymentAccountRow({ account, columns?, … })` — dieselben Zellen in
einem `Row`, für die kurze Liste in einer Karte.

**Kann bewusst nicht:** „in Gebrauch" als Spalte zeigen — das ist keine Achse,
sondern die **Gliederung** der Konfigurationsliste (Abschnitte „geführt" /
„weitere", 0182); die Gates eines Stapels (0168); bearbeiten (Editor).

## Verhalten

Server-Component. Die Zellen rechnen nichts: die Auszugserwartung, „in
Gebrauch" und der Zustand des Zahlungswegs kommen als Werte herein — die Regeln
dafür stehen in der Domäne (`isPaymentAccountInUse()`) und in der App.
Zahlen rechtsbündig mit Tabellenziffern (V3), der Zeitraum als zwei Daten mit
Gedankenstrich, leere Zellen als „—" (nie leer).

## Stories

Titel `v3/Entitäten/Zahlungskonto/PaymentAccountRow`.

| Story | Beweist |
|---|---|
| `Filled` | die Vorgabe „Bewegung": Konto, Art, IBAN, Sachkonto, Auszugserwartung, Zeilen, Ein- und Ausgänge, Saldo, Zeitraum |
| `Settings` | die Vorgabe „Konfiguration": Auto-Zuordnung, Anbindung, Zustand des Zahlungswegs |
| `Kinds` | die sechs Arten untereinander — Bank, Kasse, Kreditkarte, PayPal, Mitarbeiter-Auslagen, Sonstiges |
| `Edges` | Konto ohne IBAN und ohne Bewegung, ein abgeschaltetes Konto, ein Name an der 40-Zeichen-Grenze |
| `Columns` | `paymentAccountColumns()` in `DataTable` mit Sortierung |
| `InUse` | die kurze Liste in einer Karte: drei Konten mit Weg zum Auszug |

Nicht anwendbar: leer, lädt, Fehler — sie gehören dem Rahmen.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Die erste Zelle ist `PaymentAccountCell`, nicht eine zweite Fassung von Zeichen und Name (Grep)
- [ ] Die Art kommt aus `PAYMENT_ACCOUNT_KIND_LABEL`, nicht aus einer lokalen Map (Grep)
- [ ] Ohne IBAN steht die Kartenkennung, ohne beides „—" (Story `Edges`)
- [ ] Beträge rechtsbündig mit Tabellenziffern, der Zeitraum als zwei Daten (Story `Filled`, gemessen)
- [ ] Ein abgeschaltetes Konto zeigt den Zustand des Zahlungswegs, kein durchgestrichener Name (Story `Edges`)
- [ ] Zeile und Spaltensatz benutzen dieselben Zellen (Grep)
- [ ] Ersetzt die zehn Spalten von `banks/page.tsx` und die acht der Konfigurationsseite ohne Funktionsverlust (Begründung in der Abnahme)

## Offene Fragen

1. Trägt die Zeile den Saldo als **eine** Zahl oder Ein- und Ausgänge getrennt? —
   ohne Antwort: **beides wie heute**; die Vorgabe „Bewegung" zeigt Eingänge,
   Ausgänge und Saldo, weil die Seite des Jahres genau daran liest.
2. Wohin führt der Name? — ohne Antwort: **zum Kontoauszug** des Kontos
   (`banks/[accountId]`), nicht in die Konfiguration; wer konfigurieren will,
   ist schon dort.

## Gebaut (2026-09-15)

`payment-account-columns.tsx` (dreizehn Spalten, zwei Vorgaben,
`paymentAccountTracks()`), `PaymentAccountRow.tsx` und der Zeilen-Typ samt
`statementExpectationOf()` in `payment-account.ts`. Alles im Barrel.

Die Ableitung der Auszugserwartung steht **einmal**, in `payment-account.ts`:
beide Listen lesen sie gleich, und das Konto selbst trägt den Wert nicht (die
Achse ist berechnet).

Gemessen (CDP, Storybook 6107, 1400 px):

| Story | Beobachtung |
|---|---|
| `Filled` | Konto · Art · Kennung · Sachkonto · Kontoauszug · Zeilen · Eingänge · Ausgänge · Saldo · Zeitraum; Beträge rechtsbündig, der Zeitraum als zwei Daten |
| `Settings` | Auto-Zuordnung, Anbindung und Zahlungsweg statt der Bewegung |
| `Kinds` | die sechs Arten mit den Wörtern der gespiegelten Liste |
| `Edges` | ohne IBAN und ohne Kartenkennung steht „—"; das abgeschaltete Konto zeigt „abgeschaltet", der Name bleibt ungestrichen |
| `Columns` | derselbe Satz in `DataTable` mit Sortierpfeil an „Saldo" |
| `InUse` | drei Konten in einer Karte, jeder Name führt zum Auszug |

**Ein Fund aus dem ersten Blick:** die Spalte „Zeilen" zeigte „145,00" — ein
Zähler, gerendert wie ein Betrag. Jetzt `formatCount()`; die Zahl steht ohne
Nachkommastellen.

Kein Überlauf: die breite Tabelle scrollt in ihrem Rahmen, die Seite nicht.
`pnpm typecheck`, `check:classes`, `check:language`, `check:when` und
`pnpm build` grün; Screenshots angesehen. Abnahme durch einen anderen Agenten
steht aus.

## Nachtrag 2026-09-18 — Auszugserwartung dreistufig (F235)

**Anlass.** Die App hat mit F235 (`b7201625`) die Achse
`statement_expectation` umgebaut: drei Stufen `required` („Pflicht“),
`expected` („Sollte kommen“) und `none` („Keine“) statt `erwartet`,
`erwartet_hand`, `keine`, `keine_hand`. Die Herkunft „von Hand“ steckt nicht
mehr im Schlüssel, sie steht in einer eigenen Spalte
(`statement_expectation_manual`). Auftrag von `a1`, Namen aus der App.

**Einordnung.** Regel 2 aus §3: die Zeile deckt den Fall, es ändern sich
ein Feld und eine Zelle. Keine neue Datei, keine neue Story.

**Schnittstelle.** In `PaymentAccountRowData`:

| Feld | Typ | Was | Nachweis |
|---|---|---|---|
| ~~`expectsStatementsManual`~~ | ~~`boolean \| null`~~ | entfällt | Grep |
| `statementExpectation` | `StatementExpectationLevel \| null`, optional | die wirksame Stufe (`statement_expectation`) | Story `Filled` |
| `statementExpectationManual` | `StatementExpectationLevel \| null`, optional | die Hand-Entscheidung (`statement_expectation_manual`); `null` = abgeleitet | Story `Filled` |

`StatementExpectationLevel` kommt aus dem Spiegel
(`core/accounting/statement-expectation.ts`), nicht als lokaler Typ. Beide
Felder bleiben Teil von **L-314**: die App liest sie in der Infrastruktur.

`statementExpectationOf(account)` liefert `StatementExpectationLevel`, nicht
mehr `string`: die wirksame Stufe, sonst die Hand-Entscheidung, sonst
`expectsStatements ? "required" : "none"`. Die letzte Stufe ist exakt, keine
Näherung: die Ableitung setzt nur Pflicht oder Keine („Sollte kommen“ setzt
nur ein Mensch, Registry), und `expects_statements` ist drüben der Spiegel von
„≠ none“.

**Zelle.** `StatusBadge` mit der Stufe; ist `statementExpectationManual`
gesetzt, steht dahinter leise „von Hand“ (das Wort der App). Die Herkunft ist
ein Zusatz, kein eigener Status.

**Kann bewusst nicht:** die Stufe ableiten. Die Regel (IBAN in den
DATEV-Bankverbindungen, Konto bebucht) gehört der App.

**Abnahmekriterien** — fest wie oben, dazu:

- [ ] `expectsStatementsManual` und die Schlüssel `erwartet*`/`keine*` kommen im Set nicht mehr vor (Grep)
- [ ] `statementExpectationOf` gibt `StatementExpectationLevel` zurück; ohne `statementExpectation` gilt Hand vor Ableitung (Typcheck, Lesen)
- [ ] „von Hand“ steht nur an Konten mit `statementExpectationManual` (Story `Filled`)
- [ ] Die Stufe trägt das Wort der Registry — „Pflicht“, „Sollte kommen“, „Keine“ (Story `Filled`)

### Gebaut (Nachtrag, 2026-09-18)

Mit dem Spiegel-Lauf auf App `1276540f`. Gemessen (CDP, Storybook 6107,
1400 px): `Filled` zeigt „Pflicht“ ohne Zusatz, „Keine“ und „Sollte kommen“
je mit „von Hand“ in einer eigenen Zeile unter dem Badge; `Settings`,
`Edges`, `Columns`, `InUse`, `PaymentAccountList` und
`PaymentAccountSettingsList` zeigen „von Hand“ nur an Konten mit
`statementExpectationManual`. Die Grep nach `expectsStatementsManual`,
`erwartet_hand`, `keine_hand` im Set ist leer. `pnpm typecheck`,
`check:language`, `check:when`, `check:classes`, `check:mirror` grün. Abnahme
durch einen anderen Agenten steht aus.
