# 0125 · TaxKeyField — der Steuerschlüssel als Feld

| | |
|---|---|
| Status | spec |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein.** Der DATEV-Steuerschlüssel (BU) ist ein Fachbegriff mit eigenem Vokabular; ein Primitive darf ihn nicht kennen |
| Quelle | `docs/v3-backlog.md` Z. 62 (`TaxKeySelect`, Teil des `Auswahlfeld`-Bedarfs); Vorlage `apps/web/src/ui/booking/TaxKeySelect.tsx` |
| Ersetzt | `TaxKeySelect` in `ManualBookingDrawer` und `BookingProposalCompact` |
| Setzt voraus | `DATEV_TAX_KEYS` und `TaxKeyEntry` aus `src/ludwig/core/datev/tax-keys.ts` (gespiegelt) · `Field`/`Select` (0104) |
| Spec von / am | Claude, 2026-09-08 |

## Warum eine eigene Komponente

`Select` (Primitive) trägt die Mechanik, aber **nicht** die Liste: die kommt
aus `DATEV_TAX_KEYS`, und ein Primitive kennt keine Fachdaten
(`spec-schreiben` §2). Ein Aufrufer, der die Optionen selbst baut, baut
zugleich das Format „51 · Vorsteuer 19 %" nach — heute an zwei Stellen, und
zwei Formate für einen Schlüssel sind zwei Wahrheiten.

Nach §3 Regel 5: eine Form dieser Familie, die es noch nicht gibt. Sie heißt
**Field** und nicht **Select**, weil sie mehr trägt als eine Liste — den
Erklärtext des gewählten Schlüssels.

## Was die Vorlage nicht kann

`TaxKeyEntry` führt fünf Felder, die App-Fassung liest zwei (`key`, `label`):

- **`description`** — „Ein Satz Klartext für die Anzeige (Tooltip am
  Buchungssatz)", laut Kommentar genau dafür gedacht, und nirgends gezeigt.
  Wer „51" wählt, sieht nicht, was er gewählt hat.
- **`vatRate` und `direction`** — Vorsteuer oder Umsatzsteuer, und mit welchem
  Satz. Das ist die Frage, die jemand beim Wählen wirklich hat.
- **`passThrough`** — ein Schlüssel, den Ludwig **nur durchreicht**: keine
  Satz-Expansion, keine Assistenz, und nur setzbar, wenn die Historie desselben
  Kontos ihn trägt. Die Vorlage bietet ihn wie jeden anderen an.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `value` | `string \| null` | ja | Der gewählte Schlüssel. `null` heißt „keiner" und ist ein gültiger Wert — nicht jede Zeile hat einen | `Filled`, `Empty` |
| `onChange` | `(key: string \| null) => void` | ja | Der Aufrufer schreibt, das Feld hält nichts | `Roundtrip` |
| `label` | `string` | nein, Vorgabe „Steuerschlüssel (BU)" | Die Beschriftung | `Filled` |
| `allowPassThrough` | `boolean` | nein, Vorgabe `false` | Ob die Durchreich-Schlüssel in der Liste stehen. Nur der Aufrufer weiß, ob die Historie des Kontos sie trägt — das Feld darf es nicht raten | `PassThrough` |
| `disabled` | `boolean` | nein | Gesperrt, etwa in einer festgeschriebenen Zeile | `Filled` |
| `error` | `string` | nein | Der Satz am Feld | `Invalid` |

**Kann bewusst nicht:**

- **Prüfen, ob der Schlüssel zum Konto passt.** Das ist Fachlogik der App
  (`modules/accounting-cases/domain/tax-keys`), und sie braucht die
  Kontohistorie, die dieses Feld nicht hat.
- **Die Steuerzeile ausrechnen.** Das ist die Buchungsassistenz.
- **`passThrough` selbst entscheiden.** Ohne die Historie wäre jede Antwort
  geraten — deshalb eine Prop und keine Ableitung.

## Verhalten

- Der Schlüssel steht `mono` (er wird Zeichen für Zeichen gelesen), das Label
  daneben in der Textschrift: „**51** · Vorsteuer 19 %".
- Unter der Liste steht die **`description`** des gewählten Schlüssels — ein
  Satz, kein Tooltip. Ohne Auswahl steht dort nichts.
- `vatRate` und `direction` stehen in der Option, nicht in einer zweiten Zeile:
  „51 · Vorsteuer 19 %" ist bereits beides.

## Stories

Abgeleitet nach §6: 3 anwendbare Zustände (gefüllt · leer · ungültig — „lädt"
gibt es nicht, die Liste ist eine Konstante) + 1 Layout-Boolean
(`allowPassThrough`) + 1 Callback + 1 „im Einsatz" = **6**.

| Story | Beweist |
|---|---|
| `Filled` | Ein gewählter Schlüssel mit `description` darunter; daneben ein gesperrtes Feld |
| `Empty` | `null`: kein Schlüssel, kein Erklärtext, kein Gedankenstrich |
| `Invalid` | Der Satz am Feld |
| `PassThrough` | Mit und ohne `allowPassThrough` nebeneinander — die Liste ist länger, der Rest gleich |
| `Roundtrip` | Wählen und abwählen, der Wert geht an den Aufrufer und kommt zurück |
| `InUse` | In der Buchungszeile neben Konto und Betrag — der Fall aus `ManualBookingDrawer` |

## Abnahmekriterien (variabler Block)

- Die Optionen kommen aus `DATEV_TAX_KEYS`, nicht aus einer lokalen Liste
  (`grep`: kein Schlüssel-Literal in der Datei)
- Der Schlüssel steht `mono`, das Label daneben nicht (`Filled`)
- Die `description` des gewählten Schlüssels steht unter dem Feld, und nur dann
  (`Filled` gegen `Empty`)
- Ohne `allowPassThrough` fehlt jeder Schlüssel mit `passThrough` in der Liste
  (`PassThrough`, gezählt)
- `null` ist wählbar und kommt als `null` zurück, nicht als leerer String
  (`Roundtrip`)
- Ersetzt `TaxKeySelect` an beiden Stellen ohne Funktionsverlust
