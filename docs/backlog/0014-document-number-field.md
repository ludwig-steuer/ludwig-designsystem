# 0014 · DocumentNumberField — Belegfeld 1 mit Belegnummern-Register

| | |
|---|---|
| Status | in Arbeit |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/document-number/` |
| Klassen-Test | nein — Belegfeld 1 ist eine DATEV-Ausnahme, die Rangordnung der Quellen ist Buchhaltungslogik |
| Quelle | Anfrage Owner 2026-09-03 („Belegfeld 1 sollte ein Lupenicon haben, wodurch ich einen Drawer öffnen kann — sogenannter OPOS-Browser — aus dem als Ergebnis ein Belegfeld übernommen werden kann") |
| Ersetzt | die nackten `<input>` für `beleg1` in `JournalEntryEditor` (Zeile + Gegenkonto) |
| Blockiert | 0015 (Editor) |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Die Buchhalterin tippt heute die Belegnummer ab. Das ist die eine Stelle, an
der Abtippen teuer ist: **DATEV ziffert offene Posten über Zeichengleichheit
aus** (GLOSSARY „Belegnummern-Äquivalenz"). Eine nur anders geschriebene
Nummer lässt den Posten trotz richtiger Buchung offen — der Realfall, an dem
F59 hängt.

Die richtigen Nummern sind längst bekannt: das **Belegnummern-Register**
(GLOSSARY, `document-number.ts`) führt alle bekannten Belegfeld-1-Werte eines
Mandanten mit Quelle, Personenkonto, Sachverhalt und Zustand — und mit einer
Rangordnung, welche gilt. Statt zu tippen, wählt sie daraus.

Der Owner nennt es „OPOS-Browser". Im Code heißt es nach GLOSSARY
`DocumentNumberRegister`; „offene Posten" ist nur eine der neun Quellen
(`opos_anchor`).

## Einordnung

- **Wiederverwenden:** kein `@when` in `src/ui/v3` trifft. `AccountField`
  ist formal verwandt (Feld + Kandidaten + Auswahl), aber seine Kandidaten
  sind Vorschläge ohne Dominanz; hier gibt es eine **Rangordnung mit
  DATEV-Vorrang und Unveränderlichkeit**. Das ist keine Variante, das ist eine
  andere Entität.
- **Neu, weil:** §3.5 — neue Entitäts-Form. `ui-repraesentationen.md` führt
  unter „Entschiedene Belegnummer" bisher nur Editoren, die laden
  (`CaseDocumentNumberModeEditor`, `DecideDocumentNumberButton`); eine reine
  Feld- und Listenform fehlt.
- **Zuschnitt:** **getrennt**, zwei Dateien. Nach §4 trennt: das Register wird
  auch allein gebraucht (Screen 5 des Reviews, die OPOS-Seite), und es hat
  eine andere Datenquelle (Register-Abfrage) als das Feld (die Buchungszeile).
- **Setzt auf:** `Table`/`Cells` (Registerliste), `Badge` (Quelle, Zustand).

## Schnittstelle

### `DocumentNumberField` (Form: Feld)

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `value` | `string` | ja | Belegfeld 1, verbatim in der Schreibweise der Quelle | `Gefuellt` |
| `onChange` | `(value: string) => void` | ja | Freie Eingabe bleibt möglich — das Register ist ein Angebot, kein Zwang | `Interaktiv` |
| `onOpenRegister` | `() => void` | nein | Gesetzt → Lupe erscheint; weggelassen → kein Icon (wie 0002) | `WithRegister` |
| `dominant` | `KnownDocumentNumber \| null` | nein | Die Nummer, die für diesen Vorgang **gilt**. Weicht `value` ab, steht der Hinweis unter dem Feld | `Abweichend` |
| `maxLength` | `number` | nein | Default 36 — die EXTF-Feldgrenze für Belegfeld 1 | `Rand` |
| `invalid` | `boolean` | nein | Rahmen rot, ohne eigenen Text | `Gefuellt` |
| `ariaLabel` | `string` | nein | Default „Belegfeld 1" | — |

### `DocumentNumberRegister` (Form: Liste, im Drawer des Aufrufers)

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `entries` | `KnownDocumentNumber[]` | ja | Das Register. **Ungesortiert übergeben** — die Komponente sortiert mit `sortByDominance` | `Gefuellt` |
| `onPick` | `(entry: KnownDocumentNumber) => void` | ja | Übernahme ins Feld | `Interaktiv` |
| `query` | `string` | nein | Filtert über Nummer, Konto und Sachverhaltsnummer | `LeerNachFilter` |
| `onQueryChange` | `(q: string) => void` | nein | — | `Interaktiv` |
| `loading` | `boolean` | nein | — | `Laedt` |

Typen aus `src/ludwig/modules/accounting-cases/domain/document-number.ts`:
`KnownDocumentNumber`, `DocumentNumberSource`, `DocumentNumberState`, dazu
`sortByDominance` und `isDatevSource`. **Nichts davon wird hier neu
definiert** — die Rangordnung ist Serverwahrheit (`SOURCE_RANK`), keine
Darstellungsentscheidung.

GLOSSARY: `document number register` im Code, **Belegnummern-Register** im
UI. Quellen-Labels (`opos_anchor` → „Offener Posten aus DATEV") kommen als
Registry, nicht als lokale Map.

**Was die Komponenten nicht können (bewusst):**

- Das Register **laden**. Der Aufrufer holt es und öffnet den Drawer.
- Eine Nummer **entscheiden**. Die entschiedene Belegnummer braucht eine
  Pflicht-Begründung und einen Urheber (F100, `case_decision`) — das ist ein
  Schreibweg der App, kein Klick in einer Liste.
- Nummern **normalisieren oder vergleichen**. `acceptanceEqual` steht in
  `core/datev/belegfeld.ts`; das Feld zeigt, was ihm gesagt wird.

## Verhalten

**Feld:**

- Lupe rechts im Feld, gleiche Position und gleicher Tastaturweg wie 0002.
- Ist `dominant` gesetzt und `dominant.documentNumber !== value`, steht unter
  dem Feld eine Zeile: die dominante Nummer, ihre Quelle, und — nur wenn
  `dominant.immutable` — der Satz, dass DATEV gewinnt. Diese Zeile ist ein
  **Hinweis**, kein Fehler: eine Abweichung kann begründet sein.
- `maxLength` schneidet nicht still ab, sondern hält an der Grenze.

**Register:**

- Sortiert nach `sortByDominance`, dominanteste zuerst. Die Reihenfolge ist
  die Antwort auf „warum steht die oben?" — deshalb trägt **jede Zeile ihre
  Quelle sichtbar**, wie `AccountField` seine Gruppen.
- DATEV-Quellen (`isDatevSource`) tragen ein Merkmal, das sie von Kandidaten
  unterscheidet; `orphaned` und `state === "fixed_on_export"` stehen an der
  Zeile, nicht in einem Tooltip.
- Zustände: gefüllt · leer („Für diesen Mandanten ist noch keine Belegnummer
  bekannt") · leer nach Filter · lädt.
- Tastatur: ↑/↓ durch die Liste, `Enter` übernimmt, `Esc` gibt an den Aufrufer
  zurück (Drawer schließt der).
- Beide Client-Components (Eingabe, Auswahl).

## Stories

Nach §6. Zwei Komponenten, je unter `v3/Entitäten/Belegnummer/`.

`DocumentNumberField` — 5:

| Story | Beweist |
|---|---|
| `Gefuellt` | Normalfall, `RE-2026-0140`, plus `invalid` daneben |
| `WithRegister` | Lupe vorhanden/weggelassen, Rundlauf über `onOpenRegister` |
| `Abweichend` | `dominant` weicht ab — einmal `immutable`, einmal nicht |
| `Interaktiv` | freie Eingabe über `onChange` mit `useState` |
| `Rand` | 36 Zeichen erreicht; sehr lange dominante Nummer bricht das Layout nicht |

`DocumentNumberRegister` — 5:

| Story | Beweist |
|---|---|
| `Gefuellt` | alle neun Quellen nebeneinander, in Dominanz-Reihenfolge |
| `Leer` | kein Eintrag, mit Grund |
| `LeerNachFilter` | `query` ohne Treffer, mit Ausweg |
| `Laedt` | `loading` |
| `Interaktiv` | ↑/↓/`Enter`, Rundlauf über `onPick` |

Nicht anwendbar: Fehlerzustand am Register — es lädt nicht selbst, ein
Ladefehler gehört an den Drawer des Aufrufers.

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

- [ ] Typen kommen aus `document-number.ts`, keiner ist lokal nachgebaut (`grep`)
- [ ] Reihenfolge im Register stammt aus `sortByDominance`, nicht aus einer eigenen Sortierung (`Gefuellt`: unsortiert übergeben, dominant zuerst gezeigt)
- [ ] Jede Zeile nennt ihre Quelle sichtbar (`Gefuellt`)
- [ ] `immutable` ist an der Zeile erkennbar und die Übernahme davon unbeeinflusst (`Gefuellt`, `Interaktiv`)
- [ ] Abweichung von `dominant` erscheint als Hinweis, nicht als Fehler (`Abweichend`)
- [ ] `maxLength` hält bei 36, ohne stilles Abschneiden (`Rand`)
- [ ] Tastatur ↑/↓/`Enter`/`Esc` (`Interaktiv`)
- [ ] Ersetzt die `beleg1`-Inputs in `JournalEntryEditor` ohne Funktionsverlust (0015)

## Offene Fragen

1. **Zeigt das Register auch Nummern anderer Sachverhalte?** Ohne Antwort:
   ja, mit `caseNumber` an der Zeile — die Regel-2-Begründungspflicht
   (`documentNumberMismatchRationale`) greift erst beim Schreiben, und die
   Buchhalterin muss sehen, dass die Nummer woanders hängt.
2. **Was zeigt die Zeile bei `accountNumber === null`?** Ohne Antwort: die
   Spalte bleibt leer, kein „—"; das Konto ist quellenseitig unbekannt, nicht
   null-wertig.
3. **Braucht das Feld eine Schnellübernahme der dominanten Nummer?** Ohne
   Antwort: ja, die Hinweiszeile aus `Abweichend` ist klickbar — derselbe
   Mechanismus wie „Rest einsetzen" im Editor.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Kein eigenes Entitätsprofil — die Belegnummer ist laut `accounting-case.md` ein Kind des Sachverhalts, und die Spec stammt aus der Zeit vor der Profil-Pflicht (Ausnahme, gilt für alle Specs bis 0069).

Entscheide zu den offenen Fragen: 1 ja, Nummern anderer Sachverhalte mit `caseNumber` · 2 **„—" statt leerer Zelle** (wie überall im Set) · 3 ja, Schnellübernahme als `TextButton` (T8), ruft `onChange(dominant.documentNumber)`, Rundlauf in `Diverging` mit `useState`.

Vor dem Bau in die Spec: (a) Quellen-Labels: keine Registry vorhanden → Labels kommen als Prop `sourceLabel: Record<DocumentNumberSource, string>`, bis die App sie in die Domäne hebt (Befund L-71); (b) Verhalten „Feld": „wie 0002" → „wie 0013 (`AccountField`, `onOpenLedger`)", Lupe über `ActionIcon action="search"`; (c) Story-Exportnamen englisch (`Filled`, `WithRegister`, `Diverging`, `Interactive`, `Edge`, `Empty`, `EmptyAfterFilter`, `Loading`), plus ein Satz, warum das Feld kein `Empty`/`Error` hat; (d) Kopf „Ersetzt": nur die Zeile (`JournalEntryEditor.tsx:610`), das Gegenkonto hat kein Belegfeld; prüfen, ob `DocumentNumberRegister` die Liste in `CasePlausibilityTab.tsx` ersetzt; (e) `maxLength` 36 mit Quelle `core/datev/belegfeld.ts`.

Befunde ins Register: **L-71** — `DOCUMENT_NUMBER_SOURCE_LABEL`/`_STATE_LABEL` ins Domain-Modul (heute lokale Map `CasePlausibilityTab.tsx:40`) und `DATEV_MAX_BELEGFELD1 = 36` in `core/datev/field-limits.ts`.
