# 0183 · PaymentAccountEditor — ein Zahlungskonto einrichten

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/payment-account/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: IBAN, SKR-Konto, Kontoauszugs-Erwartung, DATEV-Zahlungsart |
| Quelle | Entitätsprofil `docs/entitaeten/payment-account.md`, „Formen" (`PaymentAccountEditor`, §7 Nr. 4), „Zuschnitt" |
| Ersetzt | in `ludwig/app` `PaymentAccountForm` (`clients/ui`, 313 Z.) und `PaymentAccountIbanForm` |
| Blockiert | nichts; er ist die letzte Form des Profils |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Beim Einrichten trägt die Kanzlei je Konto sieben Dinge ein — und zwei davon
entscheiden, ob der Buchungslauf später etwas anfordert: die
Auszugserwartung und die Zahlungsart, die hier automatisch landet.

## Einordnung

- **Wiederverwenden:** `Field`, `Input`, `Select`, `DateField` (Primitives),
  `AccountField` (0013) für das Sachkonto, `Button` für die Wege.
- **Neu, weil:** Regel 5 aus `spec-schreiben` §3 — die Entität hat Punkte mit
  änderbar = Nutzer, und keine vorhandene Form deckt sie.
- **Zuschnitt:** eine Datei, `"use client"` (Formularzustand).
- **Setzt auf:** die Primitives oben; keine Server-Action, kein Laden.

## Schnittstelle

```ts
export interface PaymentAccountDraft {
  displayName: string;
  kind: PaymentAccountKind;
  iban: string | null;
  bic: string | null;
  bankName: string | null;
  externalAccountId: string | null;
  ledgerAccountNumber: string | null;
  /** `null` = abgeleitet lassen; sonst entscheidet der Mensch (Nachtrag F235). */
  statementExpectationManual: StatementExpectationLevel | null;
  autoAssignPaymentMethod: string | null;
  /** Gesetzt heißt: ab diesem Tag abgeschaltet. */
  validUntil: string | null;
}
```

Der Entwurf steht **lokal** in `entities/payment-account/payment-account.ts`:
`src/ludwig/` führt keinen (Befund **L-337**) — anders als die Wiederkehr-Regel,
die ihren `RuleDraft` mitbringt.

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `defaultValue` | `PaymentAccountDraft` | nein | fehlt = **neues Konto**; gesetzt = ändern | `Edit`, `New` |
| `onSubmit` | `(draft: PaymentAccountDraft) => Promise<void>` | ja | speichern; der Editor lädt nichts und ruft nichts sonst | `Edit` |
| `onCancel` | `() => void` | nein | ohne sie kein Abbrechen-Knopf | `Edit` |
| `paymentMethods` | `readonly { value: string; label: string }[]` | nein | die Zahlungsarten der Auto-Zuordnung — **Wörter des Aufrufers**, weil die Domäne keine Liste führt (L-313) | `Edit` |
| `accounts` | wie `AccountField` (`candidates`, `onSearch`) | nein | das Sachkonto; ohne sie steht die Nummer als Text | `Edit` |
| `pending` | `boolean` | nein | speichert gerade — Knöpfe aus, Felder bleiben lesbar | `Pending` |
| `error` | `string` | nein | die Meldung des Aufrufers über dem Formular | `Error` |

**Kann bewusst nicht:** das Sachkonto anlegen, die IBAN prüfen (DATEV tut das
beim Abgleich), ein Konto löschen (es entsteht aus dem Kontenrahmen und wird
abgeschaltet, nicht entfernt), die Art nachträglich frei wählen, wenn schon
gebucht ist — das entscheidet der Aufrufer über `defaultValue` und seine
eigenen Regeln.

## Verhalten

Client-Component. Drei Gruppen, in dieser Reihenfolge:

1. **Das Konto** — Bezeichnung (Pflicht), Art, Sachkonto.
2. **Die Kennung** — hängt an der Art: bei `bank` IBAN, BIC und Bankname; bei
   `credit_card` und `paypal` die Kartenkennung; bei `cash`,
   `employee_clearing` und `other` **gar nichts** (dann steht ein Satz, warum).
3. **Was der Buchungslauf daraus macht** — Auszugserwartung (dreiwertig:
   „automatisch entscheiden" · „erwartet" · „keine"), Auto-Zuordnung,
   Befristung mit dem Satz „gesetzt heißt abgeschaltet".

Die Auszugserwartung ist **dreiwertig**, nicht ein Haken: abgeleitet und von
Hand gesetzt sind zwei verschiedene Aussagen, und die Registry hat für beide
eigene Wörter (`statement_expectation`). Wer den Haken nimmt, verliert die
Ableitung für immer.

Pflicht ist nur die Bezeichnung; sie ist der Rang 1. Speichern ist aus, solange
sie leer ist oder `pending` läuft.

## Stories

Titel `v3/Entitäten/Zahlungskonto/PaymentAccountEditor`.

| Story | Beweist |
|---|---|
| `Edit` | ein Bankkonto ändern: alle drei Gruppen gefüllt, Sachkonto über `AccountField` |
| `New` | ohne `defaultValue`: leeres Formular, Speichern aus, bis die Bezeichnung steht |
| `Kinds` | die Kennung wechselt mit der Art — Bank, Kreditkarte, Kasse (mit Satz) |
| `Pending` | speichert: Knöpfe aus, Felder lesbar |
| `Error` | die Meldung des Aufrufers über dem Formular |

Nicht anwendbar: leer, leer nach Filter (ein Formular hat keine Menge).

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

- [ ] Jedes Feld hat sein Wort über `Field htmlFor` (0104) — Klick auf das Wort setzt den Fokus (Story `Edit`, DOM)
- [ ] Die Kennung wechselt mit der Art; bei Kasse steht ein Satz statt leerer Felder (Story `Kinds`)
- [ ] Die Auszugserwartung hat drei Werte, keinen Haken (Story `Edit`, DOM)
- [ ] Speichern ist aus ohne Bezeichnung und während `pending` (Stories `New`, `Pending`)
- [ ] Die Wörter der Zahlungsart kommen vom Aufrufer, nicht aus einer Map in der Datei (Grep)
- [ ] Ersetzt `PaymentAccountForm` ohne Funktionsverlust

## Offene Fragen

1. Gehört die Befristung in dieses Formular oder in die Massenaktion der
   Konfigurationsliste (0182)? — ohne Antwort: **in beide**; hier als Datum,
   dort als bestätigter Vorschlag für mehrere Konten.
2. Darf die Art nachträglich geändert werden? — ohne Antwort: **ja**; sie ist
   „nur UI-Kategorisierung" (GLOSSARY), und der Aufrufer sperrt sie, wo er es
   besser weiß.

## Gebaut (2026-09-15)

`PaymentAccountEditor.tsx` (`"use client"`), dazu `PaymentAccountDraft` und
`emptyPaymentAccountDraft()` in `payment-account.ts`. Alles im Barrel.

Gemessen und angesehen (CDP, Storybook 6107):

| Story | Beobachtung |
|---|---|
| `Edit` | drei Gruppen in der Reihenfolge der Spec; jedes Feld mit seinem Wort über `Field htmlFor`; Speichern und Abbrechen unten rechts |
| `New` | leeres Formular, Speichern aus, bis die Bezeichnung steht |
| `Kinds` | Kasse ohne Kennung mit dem Satz dazu, Kreditkarte mit Kartenkennung |
| `Pending` | Knöpfe aus, Felder lesbar |
| `Error` | die Meldung steht über dem Formular, nicht an einem Feld |

Die Auszugserwartung steht als **dreiwertige** Auswahl, nicht als Haken:
„Automatisch entscheiden" hält die Ableitung offen, die beiden anderen Werte
sind die Hand-Entscheidung.

`pnpm typecheck`, `check:classes`, `check:language`, `check:when` und
`pnpm build` grün. Abnahme durch einen anderen Agenten steht aus.

## Nachtrag 2026-09-18 — Auszugserwartung dreistufig (F235)

**Anlass.** Wie 0180: F235 (`b7201625`) macht die Auszugserwartung
dreistufig. Das Formular der App (`PaymentAccountForm`) hat seitdem vier
Einträge: „Automatisch“ und die drei Stufen.

**Einordnung.** Regel 2 aus §3: ein Feld im Entwurf ändert Typ und Namen,
die Auswahl einen Eintrag. Keine neue Story.

**Schnittstelle.** In `PaymentAccountDraft`:

| Feld | Typ | Was | Nachweis |
|---|---|---|---|
| ~~`expectsStatements`~~ | ~~`boolean \| null`~~ | entfällt | Grep |
| `statementExpectationManual` | `StatementExpectationLevel \| null` | `null` = „Automatisch entscheiden“; sonst die Stufe, die der Mensch setzt | Story `Edit` |

Der Name ist der des App-Formulars; `emptyPaymentAccountDraft()` setzt `null`.

**Verhalten.** Die Auswahl hat vier Einträge: „Automatisch entscheiden“,
dann die drei Stufen in der Reihenfolge von `STATEMENT_EXPECTATION_LEVELS`.
Die Wörter der Stufen kommen aus der Registry, nicht aus einer Liste in
der Datei. Der Hinweis unter dem Feld sagt, was die drei Stufen im
Buchungslauf bewirken.

**Abnahmekriterien** — fest wie oben, dazu:

- [ ] Die Auszugserwartung hat vier Einträge: Automatisch und drei Stufen, keinen Haken (Story `Edit`, DOM)
- [ ] Die Wörter der Stufen kommen aus der Registry (Grep: keine Liste mit „Pflicht“ im Editor)
- [ ] `onSubmit` liefert `statementExpectationManual` mit `null` für Automatisch (Story `Edit`)

**Ausbau.** Die App zeigt hinter „Automatisch“ die heute wirksame Stufe
(„Automatisch — aktuell: Pflicht“). Tragen würde das eine Prop
`currentStatementExpectation?: StatementExpectationLevel`. Auslöser: die App
tauscht `PaymentAccountForm` gegen den Editor. Die Lücke bestand schon vor
F235.

### Gebaut (Nachtrag, 2026-09-18)

Gemessen (CDP, Storybook 6107): alle fünf Stories haben die Auswahl
`auto` · `required` · `expected` · `none` mit „Automatisch entscheiden“,
„Pflicht“, „Sollte kommen“, „Keine“; `Edit` steht auf `required`, `New` auf
Automatisch. Die Wörter kommen über `resolveStatus` aus der Registry, auch im
Hinweis. `onSubmit` liefert `statementExpectationManual`; Automatisch ist
`null` (Code gelesen: `isStatementExpectationLevel("auto")` ist falsch,
nicht gemessen). Abnahme durch einen anderen Agenten steht aus.
