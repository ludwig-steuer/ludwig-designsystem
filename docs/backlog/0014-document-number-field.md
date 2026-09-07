# 0014 · DocumentNumberField — Belegfeld 1 mit Belegnummern-Register

| | |
|---|---|
| Status | fertig |
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

**Ergebnis: zurück.** Gemessen am 2026-09-07 gegen den Dev-Server
(`localhost:6107`) mit CDP (echte Tasten, je Schritt ein eigener
`Runtime.evaluate`). Story-IDs verkürzt: `…field--<name>` =
`v3-entitäten-belegnummer-documentnumberfield--<name>`, `…register--<name>`
entsprechend.

### Story-Deckung (§6 `spec-schreiben`)

Feld **5**, Register **5** — genau die Namen der Freigabe. Ableitung: Feld =
1 anwendbarer Zustand (gefüllt, `invalid` daneben) + 2 Rundläufe (`onChange`
→ `Interactive`, `onOpenRegister` → `WithRegister`) + 1 `dominant`-Rundlauf
(`Diverging`) + 1 Rand (`Edge`). Register = 4 Zustände + Rundläufe `onPick`
/ `onQueryChange` in `Interactive`. Ausgeschlossen mit Grund: Feld ohne
`Empty`/`Error` (Nachtrag), Register ohne `Error` (Spec). Prop ohne Story:
nur `ariaLabel`, in der Schnittstelle als „—" vorgesehen. Alle zehn IDs in
`storybook-static/index.json` vorhanden.

### Fester Block

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` / `pnpm build` grün | `pnpm typecheck` → exit 0; `pnpm build` → exit 0, „Storybook build completed successfully"; dazu `pnpm check:icons` → exit 0, 53 Zeichen, 2 offene Dateien (beide aus anderen Aufgaben) | ✓ |
| Datei nach der Familie, Story daneben, Titel in der richtigen Gruppe | `entities/document-number/{DocumentNumberField,DocumentNumberRegister}.{tsx,stories.tsx}` + `document-number-labels.ts`, `fixtures.ts`; Titel `v3/Entitäten/Belegnummer/…` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Beide Komponenten tragen `@when` **und** `@instead`; `DATEV_MAX_BELEGFELD1` trägt Fließtext-JSDoc wie andere Konstanten im Set (`SNAPSHOT_COUNT_LABEL`). **Aber:** `DocumentNumberRegister.tsx:30–36` ist ein deutscher Kommentarblock | ✗ **M4** |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep '#[0-9a-f]{3,6}'` → 0 Treffer; `COLS`/`MIN_WIDTH` in px folgen dem Muster von `ComparisonTable.tsx:78`; `sourceLabel`/`stateLabel` sind Props (L-71), keine Map in der Komponente | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | s. Story-Deckung | ✓ |
| Prüfliste `design-guidelines.md` §9 | Kontrast gemessen (`…register--filled`): Zustandsspalte 6,19:1 · Kopfzeile 4,88:1 · „—" 6,69:1 · Badge DATEV 4,69:1 · Badge verwaist 4,78:1; Fokusring `2px solid rgb(59,143,196)`; Hover über `.v2tbl__row:has(.v2rowbtn):hover`; Limit-Zeile 4,88:1 bei 11,5 px | ✓ (Nebenbefunde B3, B4) |
| Im Browser angesehen | Alle zehn Stories über `iframe.html` gemessen, nicht nur gebaut | ✓ |

### Variabler Block

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Typen aus `document-number.ts`, keiner lokal nachgebaut | `grep '^export type\|^interface'` in `entities/document-number/` → nur `DocumentNumberSourceLabels`/`DocumentNumberStateLabels`, beide `Record<…>` über die Domänen-Unions (Nachtrag). `KnownDocumentNumber`, `sortByDominance` importiert. **Aber:** das in der Schnittstelle genannte `isDatevSource` wird nirgends importiert — die DATEV-Marke hängt an `e.immutable` | ✗ **M6** (klein) |
| Reihenfolge aus `sortByDominance` | `…register--filled`, DOM-Reihenfolge der neun Zeilen: opos_anchor · mirror_ref · datev_correction · case_decision · link · invoice_number · journal_line · bank_purpose · case_summary — identisch mit `documentNumberRank` (−9, −8, 0, 2.5, 4, 4.5, 5, 6, 7) über die unsortierte `REGISTER`-Fixture. `grep '\.sort('` in beiden Dateien → 0 eigene Sortierung | ✓ |
| Jede Zeile nennt ihre Quelle sichtbar | `…register--filled`, Spalte 2 je Zeile: „Offener Posten aus DATEV", „Gespiegelte DATEV-Buchung", „Korrektur in DATEV", „Entschieden am Sachverhalt", „Ausgleichs-Klammer", „Rechnungsnummer des Belegs", „Eigene Buchungszeile", „Im Verwendungszweck erkannt", „In der Beschreibung erkannt" | ✓ |
| `immutable` an der Zeile erkennbar, Übernahme davon unbeeinflusst | `…register--filled`: Badge „DATEV" an Zeile 1–3, „verwaist" an der `link`-Zeile. `…register--interactive`: ↓↓↑ auf `data-row=1` (unveränderlich, `mirror_ref`), `Enter` → „Übernommen: RE-2026-0140 (Gespiegelte DATEV-Buchung)" | ✓ |
| Abweichung von `dominant` als Hinweis, nicht als Fehler | `…field--diverging`: zwei `.v2dnf__hint` in `rgb(92,92,92)` (6,69:1), `role=null`, `aria-invalid` 0×, `.v2in--invalid` 0×, `[role=alert]` 0×. Klick auf die Nummer (`button.v2link`) setzt `b5` von „RE 2026 140" auf „RE-2026-0140", der Hinweis verschwindet; zweiter Klick ebenso für `b6` | ✓ (Layout s. M2) |
| `maxLength` hält bei 36, ohne stilles Abschneiden | `…field--interactive`: Feld auf 8 Zeichen, `Input.insertText` mit 44 Zeichen → Wert 36 Zeichen **und** die Zeile „36 Zeichen — mehr trägt Belegfeld 1 in DATEV nicht." erscheint (vorher 0×). `…field--edge`: 36 Zeichen, Zeile steht. `maxLength=36` am Element | ✓ (Befund B7: keine Live-Region) |
| Tastatur ↑/↓/`Enter`/`Esc` | `…register--interactive`, echte Tasten: Fokus in der Suche → ↓ → `document.activeElement` = `BUTTON.v2rowbtn[data-row=1]`, ↓ → `data-row=2`, ↑ → `data-row=1`, `Enter` → „Übernommen: …". `Esc` erreicht `document` mit `defaultPrevented=false` (Drawer gehört dem Aufrufer, M8). **Aber:** das erste ↓ überspringt die dominanteste Zeile (`data-row=0`) | ✗ **M5** (klein) |
| Ersetzt die `beleg1`-Inputs in `JournalEntryEditor` ohne Funktionsverlust (0015) | `v3-entitäten-buchungssatz-journalentryeditor--document-number-across-rows`: `.v2dnf` ist **96 px** breit, der `dominant`-Hinweis bricht auf **10 Zeilen / 194 px**, die Buchungszeile wächst auf **265 px** (bei 1440 und bei 1280 gleich) | ✗ **M2** (blockiert) |

### Die Mängel vom 2026-09-06 — nachgemessen

| | Nachweis | Ergebnis |
|---|---|---|
| M1 Ladezustand als Tabelle | `…register--loading`: **eine** `.v2tbl`, fünf `tr.v2tbl__row` mit je **5** `td`, Spuren `182px 220px 120px 130px 130px`, 25 Skelette, `sr-only` „Wird geladen …" | ✓ behoben |
| M2 `id` am Feld | `…field--{filled,with-register,diverging,interactive}`: alle acht `label[for]` lösen auf `INPUT` auf. **`…field--edge`: `label[for="b8"]` löst auf nichts auf — das Feld trägt `id="b7"`** (`DocumentNumberField.stories.tsx:134`) | ✗ **M3** — 8 von 9 verdrahtet |
| M3 stilles Abschneiden | s. `maxLength` oben | ✓ behoben |
| M4 erste Spalte kollabiert | Spur 1 = 182 px bei 1440 / 1024, 160 px ab 760 — kein Kollaps, 0 Zellenüberläufe. **Aber** der Rahmen scrollt nicht mehr (s. M1 unten) | teils |
| M5 Tabelle statt Listbox | `…register--filled`: `TABLE`, 5 `th`, 45 `td`, `role=option` 0×, `role=listbox` 0×, `aria-activedescendant` 0×; ↑/↓ bewegen echten Fokus | ✓ behoben |
| M6 Zeilenhöhe, doppelte Aussage | Quellenspalte 220 px; Zeilen 45–47 px; kein zweites „· DATEV" im DOM | ✓ behoben (Befund B2: `.v2dnr__datev` in `v3.css:3300` ist tot) |
| M7 / M8 | M7 mit 0090 erledigt; M8 (kein `Esc`-Story) bleibt bewusst offen | ✓ |

### Mängel dieser Abnahme

**M1 — das Register wird beschnitten, sobald es schmaler als ~840 px steht (blockiert).**
`…register--filled`, Viewport 700: `.v2dnr` (grid) 626 px, ihr Grid-Item
`<div ref={list}>` **836 px**, `.v2tbl__scroll` `clientWidth 836 = scrollWidth 836`
— es gibt nichts zu scrollen. `.v2card` hat `overflow-x: hidden`, also stehen
**20 Zellen** rechts außerhalb der Karte; bei 500 px sind es **30** und die
Spalten Konto, Sachverhalt und Zustand sind weg und unerreichbar. Der
`ref`-Wrapper aus der M5-Nacharbeit ist kein Scroll-Container, also greift
`min-width: auto` und das Item schrumpft nicht — die `minWidth`-Nacharbeit aus
M4 läuft dadurch ins Leere. Gegenprobe im selben Lauf bei 500 px:
`AccountEntries` (`.v2ae`, Scroll-Container **ist** das Grid-Item) 468/620 →
scrollt; `ComparisonTable` 466/860 → scrollt. Es liegt also am Wrapper, nicht
an `Table`. Und es trifft genau den Einsatz: `--drawer-sm` = `clamp(340px, 34vw, 560px)`,
`--drawer-md` bei 1440 px = 720 px, abzüglich `--space-5` beidseitig.
*Vorschlag:* den `ref` auf `.v2dnr` legen (der `onKeyDown` sitzt schon dort)
oder dem Wrapper `min-width: 0` geben.

**M2 — das Feld ist auf der Seite 96 px breit, der Hinweis rechnet mit 420 (blockiert).**
`…journalentryeditor--document-number-across-rows`: `.v2dnf` 96 px,
`.v2dnf__hint` 194 px hoch (10 Zeilen à 19,375 px), `.bse__row` 265 px statt
~30. Die Story `Edge` beweist das Gegenteil nur, weil sie in 420–460 px misst.
Dazu: `.v2dnf__hint` und `.v2dnf__limit` stehen auf `overflow-wrap: normal` —
eine 36-stellige Nummer ohne Trennzeichen läuft in dieser Breite waagerecht
über (die Edge-Fixture ist bindestrichhaltig, deshalb fällt es nicht auf).
*Vorschlag:* schmale Form des Hinweises (Nummer + Marke, der Satz als
`title`), oder 0015 gibt Belegfeld 1 eine breitere Spur — zu entscheiden mit
0015, gemessen wird es dort.

**M3 — die M2-Nacharbeit ist bei 8 von 9 Feldern angekommen (blockiert, ein Zeichen).**
`…field--edge`: `document.getElementById('b8') === null`, das Feld darüber
trägt `id="b7"` (`DocumentNumberField.stories.tsx:134`, `Field` daneben mit
`htmlFor="b8"`). Genau der Befund, wegen dem `Field.htmlFor` seit 0104 Pflicht
ist. *Vorschlag:* `id="b8"`.

**M4 — deutscher Kommentar im Code (nicht blockierend).**
`DocumentNumberRegister.tsx:30–36` („sonst fällt die erste Spur …") ist der
einzige deutsche Kommentar in beiden Dateien; `CLAUDE.md` verlangt englische
Kommentare, Deutsch nur in Nutzertexten. *Vorschlag:* übersetzen, der Inhalt
bleibt.

**M5 — das erste ↓ überspringt die dominanteste Zeile (nicht blockierend).**
`…register--interactive`: `active` startet auf 0, aus der Suche heraus setzt ↓
auf 1 — der Fokus landet auf `mirror_ref`, während `opos_anchor` (die Nummer,
die gilt) schon `is-active` gefärbt ist und übersprungen wird; nur ↑ führt
dorthin. *Vorschlag:* solange kein Zeilenknopf den Fokus hat, führt das erste
↓ auf Zeile 0.

**M6 — `isDatevSource` steht in der Schnittstelle, wird aber nicht benutzt (nicht blockierend).**
Die DATEV-Marke hängt an `e.immutable`. In der Fixture fallen beide zusammen;
ein Eintrag mit `source: "opos_anchor"` und `immutable: false` verlöre die
Marke. *Vorschlag:* entweder `isDatevSource` verwenden oder es aus dem
Abschnitt „Schnittstelle" streichen.

Abgenommen von / am: fremde Abnahme-Sitzung (kein Bau, kein Chat-Verlauf), 2026-09-07 · Offene Punkte: M1, M2, M3 blockieren; M4–M6 nachziehen.

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Kein eigenes Entitätsprofil — die Belegnummer ist laut `accounting-case.md` ein Kind des Sachverhalts, und die Spec stammt aus der Zeit vor der Profil-Pflicht (Ausnahme, gilt für alle Specs bis 0069).

Entscheide zu den offenen Fragen: 1 ja, Nummern anderer Sachverhalte mit `caseNumber` · 2 **„—" statt leerer Zelle** (wie überall im Set) · 3 ja, Schnellübernahme als `TextButton` (T8), ruft `onChange(dominant.documentNumber)`, Rundlauf in `Diverging` mit `useState`.

Vor dem Bau in die Spec: (a) Quellen-Labels: keine Registry vorhanden → Labels kommen als Prop `sourceLabel: Record<DocumentNumberSource, string>`, bis die App sie in die Domäne hebt (Befund L-71); (b) Verhalten „Feld": „wie 0002" → „wie 0013 (`AccountField`, `onOpenLedger`)", Lupe über `ActionIcon action="search"`; (c) Story-Exportnamen englisch (`Filled`, `WithRegister`, `Diverging`, `Interactive`, `Edge`, `Empty`, `EmptyAfterFilter`, `Loading`), plus ein Satz, warum das Feld kein `Empty`/`Error` hat; (d) Kopf „Ersetzt": nur die Zeile (`JournalEntryEditor.tsx:610`), das Gegenkonto hat kein Belegfeld; prüfen, ob `DocumentNumberRegister` die Liste in `CasePlausibilityTab.tsx` ersetzt; (e) `maxLength` 36 mit Quelle `core/datev/belegfeld.ts`.

Befunde ins Register: **L-71** — `DOCUMENT_NUMBER_SOURCE_LABEL`/`_STATE_LABEL` ins Domain-Modul (heute lokale Map `CasePlausibilityTab.tsx:40`) und `DATEV_MAX_BELEGFELD1 = 36` in `core/datev/field-limits.ts`.

## Nachtrag 2026-09-06, vor dem Bau

**Quellen-Labels als Prop.** Es gibt keine Registry-Achse für die neun Quellen
und keine Label-Map in der Domäne — die App hält sie lokal in
`CasePlausibilityTab.tsx`. Das ist Befund **L-71**. Bis sie gehoben sind,
nehmen beide Komponenten `sourceLabel` (und das Register `stateLabel`) als
**Prop** entgegen; `document-number-labels.ts` definiert nur die Typen, keine
Wörter. Eine Map hier wäre die zweite Wahrheit.

**Das Feld folgt 0013, nicht 0002.** Lupe rechts im Feld über
`ActionIcon action="search"` in einem `IconButton`, `onMouseDown`
unterdrückt — genau wie `AccountField` mit `onOpenLedger`.

**Story-Namen englisch:** `Filled`, `WithRegister`, `Diverging`,
`Interactive`, `Edge` (Feld) · `Filled`, `Empty`, `EmptyAfterFilter`,
`Loading`, `Interactive` (Register). Das **Feld** hat kein `Empty` und kein
`Error`: ein leeres Belegfeld ist ein gültiger Wert und kein Zustand, und ein
Fehler ist der rote Rahmen plus der Satz des Aufrufers — die Komponente
formuliert ihn nicht.

**Ersetzt** nur die Zeile (`JournalEntryEditor.tsx:610`); das Gegenkonto hat
kein Belegfeld. Ob `DocumentNumberRegister` zusätzlich die Liste in
`CasePlausibilityTab.tsx` ablöst, entscheidet die App beim Umzug — die Liste
dort zeigt dieselben Einträge mit derselben Rangordnung.

**`maxLength` 36** kommt aus `core/datev/belegfeld.ts`; die Konstante steht
hier als `DATEV_MAX_BELEGFELD1`, bis die App sie in
`core/datev/field-limits.ts` hebt (**L-71**).

**Entscheide der Freigabe umgesetzt:** Nummern anderer Sachverhalte stehen mit
ihrer `caseNumber` im Register; eine fehlende Kontonummer zeigt „—" wie
überall im Set; die Hinweiszeile trägt die dominante Nummer als `TextButton`,
der sie einsetzt (Rundlauf in `Diverging`).

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — der Ladezustand war keine Tabelle.** `TableLoading` stand **außerhalb**
von `<Table>`: fünf `<tr>` in einem `<div>`, gemessen als **eine** Spur von
822 px statt fünf. Jetzt in der Tabelle; gemessen fünf Spuren, fünf Zellen.

**M2 — das Feld nahm kein `id`, das Label zeigte ins Leere.** `<label for="b1">`
und `document.getElementById('b1') === null` — genau der Befund, wegen dem
`Field.htmlFor` Pflicht ist (0104). Jetzt `id?: string`, `useId()` nur als
Rückfall; alle neun Story-Felder verdrahtet.

**M3 — `maxLength` schnitt beim Einfügen still ab.** 44 eingefügte Zeichen
wurden lautlos 36. Jetzt sagt das Feld an der Grenze, dass sie erreicht ist —
eine verlorene Endung fällt sonst erst beim DATEV-Ausziffern auf.

**M4 — die erste Spalte kollabierte.** `1fr` fiel bei 700 px auf 20 px, und
Nummer und Marke überschrieben die Nachbarspalte (13 Überläufe). Jetzt
`minmax(12ch, 1fr)` und `minWidth`, das die festen Spuren plus Lücken und
Polster deckt.

**M5 — Tabelle **oder** Listbox, nicht beides.** `role="option"` unter
`tbody`/`table` brach die Eigentümerschaft, `aria-activedescendant` fehlte,
und der Fokus blieb am Container: die aktive Zeile war nur eine Farbe. Jetzt
Tabellensemantik, und ↑/↓ bewegen den **Fokus** auf den Zeilenknopf — das sagt
jede Vorlesehilfe an.

**M6 — Zeilenhöhe und doppelte Aussage.** Die Quellenspalte steht auf 220 px
statt 150, und das zweite „· DATEV" ist weg: die Marke in Spalte 1 sagt es
schon.

**M7** ist mit **0090** erledigt (`--color-accent-700` hält jetzt 5,03:1 auf
weichem Grund). **M8** (`Esc` in keiner Story) bleibt: der Drawer gehört dem
Aufrufer, und eine Story mit Drawer wäre eine Story über den Drawer.

## Nach der Abnahme (2026-09-07): drei Blocker, alle an Stellen, die niemand gemessen hatte

**M1 erledigt — das Register wurde beschnitten, statt zu scrollen.** Der
`ref`-Wrapper aus der letzten Nacharbeit ist ein Rasterkind, und ein Rasterkind
hat `min-width: auto`: es wächst mit seinem Inhalt, statt den Scroll-Container
darin scrollen zu lassen. Die Karte (`overflow-x: hidden`) schnitt dann ab.
Gemessen bei 700 px Fenster: Wrapper **836 px** in einer 626-px-Karte, zwanzig
Zellen weg; bei 500 px waren es dreißig, Konto, Sachverhalt und Zustand
unerreichbar. Genau die Breiten, in denen das Register steht — der `sm`-Drawer
hat rund 450 px Inhalt.

`min-width: 0` am Wrapper. Gemessen bei 700 px: Wrapper **626 px**,
Scroll-Container `clientWidth 626` gegen `scrollWidth 818` — er scrollt. Bei
1440: 858 gegen 858, also kein Scrollbalken, wo keiner nötig ist.

**M2 erledigt — der Hinweis rechnete mit 420 px, das Feld hat 96.** In der
Buchungszeile des Editors wuchs er auf zehn Zeilen (194 px), und die Zeile auf
265 statt 30. Die Story `Edge` bewies nichts dagegen, weil sie in 420–460 px
misst: **gegen die Fixture gemessen, nicht gegen den Wertebereich** — dieselbe
Falle wie in 0025, 0027, 0029 und 0071.

Das Feld misst jetzt sich selbst (Container-Query). Unter 240 px bleibt die
**Nummer** stehen, der erklärende Satz geht in den `title`. Gemessen im
Editor bei 1280 und 1440: Feld 96 px, Hinweis **19 px** (eine Zeile), Zeile 91
statt 265. Dazu `overflow-wrap: anywhere` an Hinweis und Grenzzeile — eine
36-stellige Nummer ohne Trennzeichen hat keine Umbruchstelle und lief sonst
waagerecht aus der Spalte.

**M3 erledigt** — ein Zeichen: das Feld der Story `Edge` trug `id="b7"`,
während sein `Field` auf `b8` zeigte. Genau der Befund, wegen dem `htmlFor`
seit 0104 Pflicht ist.

**Auch erledigt:**

- **M4** — der deutsche Kommentar über der Spurenliste ist Englisch.
- **M5** — der erste ↓ sprang auf Zeile **zwei**, weil `active` auf 0 stand
  und der Tastenweg von dort weiterzählt, während Zeile eins schon gefärbt
  war. Jetzt beginnt nichts fokussiert (`-1`), und die Farbe sagt dasselbe.
  Gemessen: **null** aktive Zeilen vor dem ersten Druck.
- **M6** — die DATEV-Marke hing an `immutable`. In der Fixture fallen die
  beiden zusammen, aber ein Eintrag aus DATEV, der noch offen ist, verlöre
  seine Marke. Sie liest jetzt `isDatevSource(e.source)` — die Funktion, die
  dafür in der Domäne steht und bisher nur in der Schnittstelle erwähnt war.
  Gemessen: vier Marken, unverändert.

**Befunde am Set, ohne Nacharbeit:**

- `.bse__row .v2in { padding: 4px 7px }` (Spezifität 0,2,0) schlägt die
  feldeigenen `--search`/`--ledger`-Polster (0,1,0): im Editor liegt das Icon
  über dem Eingabetext — 21 px bei `DocumentNumberField`, 20 px bei
  `AccountField`. **Vorbestehend und nicht 0014-eigen**: es trifft 0013
  genauso. Gehört in eine eigene Aufgabe.
- `.v2dnr__datev` ist seit M6 tot.
- Der Ladezustand des Registers rendert keinen `HeadRow` — eine
  Skelett-Tabelle ohne Spaltenkopf (§9/V5).
- Die Grenzzeile hat keine Live-Region: beim Einfügen erfährt eine
  Vorlesehilfe nichts vom Abschnitt.
- `index.ts` exportiert die Label-Typen unter `/* DATEV-Snapshot */` statt
  unter `/* Belegnummer */`.

## Wiederabnahme (2026-09-07, zweite Runde)

**Ergebnis: zurück.** Gemessen gegen den Dev-Server (`localhost:6107`, Stand
`ec424a9`, HEAD `d62fbb3` — die Commits dazwischen fassen 0014 nicht an) mit
CDP, echte Tasten und echte Klicks, je Schritt ein eigener `Runtime.evaluate`.
Kein Bau, kein Chat-Verlauf: nur Spec und Code. Story-IDs verkürzt wie oben.

### Die drei Blocker der letzten Runde — nachgemessen

| | Nachweis | Ergebnis |
|---|---|---|
| **M1** Register beschnitten statt gescrollt | `…register--filled`, fünf Breiten: Wrapper hat jetzt `min-width: 0px` und ist genau so breit wie `.v2dnr` (1440: 858 · 1024: 858 · 700: 626 · 500: 426 · 450: 376). Der Scroll-Container scrollt, wo er muss: `clientWidth/scrollWidth` 858/858 (kein Balken, wo keiner nötig ist) · 626/818 · 426/818 · 376/818. **Gegenprobe mit echtem Scrollen:** `scrollLeft` auf das Maximum (192 · 392 · 442 px) bringt die letzte Datenzelle („errechnet", Spalte Zustand) vollständig in die Karte — bei 700, 500 **und** 450 px, vorher bei keiner. Sichtbare Zellen in der Karte 30 → 40 (700), 20 → 30 (500), 10 → 20 (450); die Werte hängen am Layout | ✓ behoben |
| **M2** Hinweis rechnet mit 420 px | `…journalentryeditor--document-number-across-rows`, 1440/1280/1024: Feld 96 px, `container-type: inline-size` greift, alle sechs `.v2dnf__wide` auf `display: none`, `.v2dnf__hint` **19 px** (eine Zeile), Buchungszeile **91** statt 265. Der genannte Teil hält. **Aber** die Zeile wächst weiter aus zwei Quellen, die dieselbe Rechnung machen — s. M1 dieser Runde | ✗ **teils** |
| **M3** `id="b7"` bei `htmlFor="b8"` | alle fünf Feld-Stories: **9 von 9** `label[for]` lösen auf ein `INPUT` auf (b1–b9), `…field--edge` trägt `id="b8"` | ✓ behoben |

### Die kleinen drei

| | Nachweis | Ergebnis |
|---|---|---|
| **M4** deutscher Kommentar | `DocumentNumberRegister.tsx:31–37` ist englisch; kein deutscher Kommentar mehr in beiden Bausteinen (die deutschen Story-JSDocs sind Storybook-Prosa und damit Nutzertext) | ✓ |
| **M5** erstes ↓ überspringt Zeile 1 | ohne Suche behoben, **mit Suche nicht** — s. M3 dieser Runde | ✗ **teils** |
| **M6** `isDatevSource` ungenutzt | importiert und an der Zeile ausgewertet (`DocumentNumberRegister.tsx:165`); `…register--filled`: vier Marken (DATEV an den Zeilen 0–2, verwaist an der `link`-Zeile), unverändert | ✓ behoben |

### Was in der letzten Runde hielt — hält es noch?

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` / `pnpm build` / `pnpm check:icons` | exit 0 / exit 0 („Storybook build completed successfully") / exit 0, 53 Zeichen, 2 offene Dateien (aus anderen Aufgaben) | ✓ |
| Kein Hex, kein px im Baustein | `grep` in beiden Dateien: 0 Hex-Treffer; px nur in `COLS`/`MIN_WIDTH` wie zuvor. `style={{ minWidth: 0 }}` folgt dem Muster von `Review.tsx:253`, `StepRail.tsx:72`, `TodoList.tsx:137` | ✓ |
| Ladezustand ist eine Tabelle | `…register--loading`: eine `.v2tbl`, fünf Zeilen mit je 5 `td`, Spuren `182px 220px 120px 130px 130px` (1440) bzw. `160px …` (500), 25 Skelette, `sr-only` „Wird geladen …". Bei 500 px scrollt auch der Ladezustand (426/818) — er hängt direkt unter `.v2dnr`, und ein Scroll-Container bekommt `min-width: auto` = 0 von selbst | ✓ |
| Erste Spur kollabiert nicht, keine Überläufe | 1440/1024: `182px …`; 760/700/500: `160px …`; **0** Zellenüberläufe bei allen fünf Breiten | ✓ |
| Tabelle statt Listbox | `…register--filled`: 1 `table` im Story-Baum (die zweite im DOM ist Storybooks verstecktes `sb-argstableBlock`), 5 `th`, 45 `td`, 9 `.v2rowbtn`; `role=option`, `role=listbox`, `aria-activedescendant`, `aria-selected` je **0×** | ✓ |
| Reihenfolge aus `sortByDominance` | DOM-Reihenfolge der neun Zeilen unverändert: opos_anchor · mirror_ref · datev_correction · case_decision · link · invoice_number · journal_line · bank_purpose · case_summary | ✓ |
| Jede Zeile nennt ihre Quelle | alle neun Quellen-Wörter in Spalte 2 gemessen | ✓ |
| Abweichung als Hinweis, nicht als Fehler | `…field--diverging`: zwei Hinweise, `.v2in--invalid` 0×, `[role=alert]` 0×. Klick auf die Nummer setzt `b5` von „RE 2026 140" auf „RE-2026-0140", der Hinweis verschwindet; zweiter Klick ebenso für `b6` | ✓ |
| `maxLength` hält bei 36, ohne stilles Abschneiden | im Editor: 36 Zeichen eingefügt → Wert 36 Zeichen **und** die Grenzzeile erscheint | ✓ (Layout s. M1) |
| Tastatur ↑/↓/`Enter`/`Esc` | `…register--interactive`: ↓ → `data-row=0`, ↓ → 1, ↑ → 0, `Enter` → „Übernommen: RE-2026-0140 (Offener Posten aus DATEV)". `Esc` erreicht `document` mit `defaultPrevented=false` | ✓ (Einstieg s. M3) |
| Leer / leer nach Filter | beide ohne Tabelle, mit Grund und Ausweg, bei 1440 und 500 nichts außerhalb der Karte | ✓ |
| Übernahme im Editor | Klick auf die Hinweis-Nummer setzt das Feld auf „RE-2026-0140", der Hinweis der Zeile verschwindet, die Zeile fällt von 91 auf 65 px | ✓ |

Nichts von dem, was hielt, ist durch die Nacharbeit gefallen.

### Mängel dieser Runde

**M1 — die Grenzzeile rechnet weiter mit 420 px, und der Wertebereich der
Nummer auch (blockiert).**
Die Container-Query verbirgt nur `.v2dnf__wide`. Die Grenzzeile steht nicht
darin, und die Nummer soll ausdrücklich stehen bleiben — beide wachsen in
96 px weiter.

- *Grenzzeile.* `…journalentryeditor--document-number-across-rows`, echte
  Eingabe (Klick ins Feld, `Input.insertText` mit 36 Zeichen): Wert 36 Zeichen,
  `.v2dnf__limit` erscheint mit **71 px / vier Zeilen**, die Buchungszeile
  wächst von **91 auf 170 px**. Dieselbe Zeile misst in `…field--edge`
  (372 px) **18 px**, eine Zeile — 18 gegen 71, der Wert hängt am Layout.
  Ausgelöst wird das vom Normalfall: eine volle DATEV-Belegnummer.
- *Nummer.* Mit einer 36-stelligen dominanten Nummer ohne Trennzeichen wird
  `.v2dnf__hint` **78 px / vier Zeilen** und die Buchungszeile **149 px**
  (gegen 19 px / 91 px mit der zwölfstelligen Fixture). `overflow-wrap:
  anywhere` verhindert den waagerechten Auslauf (`scrollWidth − clientWidth
  = 0`), nicht das Wachstum. Belegfeld 1 trägt 36 Zeichen; gemessen wurde
  gegen die zwölfstellige Fixture — dieselbe Falle, die die Nacharbeit
  benennt.

*Vorschlag:* die Grenzzeile in dieselbe Container-Query (schmal etwa „36/36",
der Satz in den `title`); für die Nummer mit 0015 entscheiden — eine Zeile mit
`text-overflow: ellipsis` plus dem schon vorhandenen `title`, oder Belegfeld 1
bekommt im Editor eine breitere Spur.

**M2 — die schmale Form nimmt der Vorlesehilfe den Satz (nicht blockierend).**
Im Editor stehen alle sechs `.v2dnf__wide` auf `display: none`; das nimmt sie
auch aus dem Zugänglichkeitsbaum. Übrig bleibt ein Knopf „RE-2026-0140" ohne
ein Wort dazu, und die Erklärung lebt nur noch im `title` des `<p>` — der wird
an einem Absatz nicht verlässlich angesagt und braucht sonst die Maus (§9/T8:
„Tooltip erklärt, ersetzt kein Label"). Vor der Nacharbeit stand der Satz im
DOM. *Vorschlag:* statt `display: none` das `sr-only`-Muster des Sets — die
Zeile bleibt 19 px, der Satz bleibt im Baum.

**M3 — M5 der letzten Runde hält nur auf dem Weg ohne Suche (nicht
blockierend).**
`…register--interactive`, echte Tasten: beim Laden **null** gefärbte Zeilen,
und aus der Suche heraus führt das erste ↓ auf `data-row=0` — behoben. Wird
aber erst gesucht („RE-2026-0140" getippt, 7 Treffer), ist **Zeile 0 gefärbt,
während der Fokus in der Suche steht** (`onQueryChange` setzt `setActive(0)`,
`DocumentNumberRegister.tsx:106`), und das erste ↓ führt auf `data-row=1`: die
dominanteste Zeile wird übersprungen, und die Farbe sagt wieder etwas anderes
als der Fokus. Das ist wörtlich M5, nur hinter dem Filter. *Vorschlag:* beim
Filtern `setActive(-1)` wie beim Laden.

### Befunde am Set, ohne Nacharbeit

- **Unverändert offen und nicht 0014-eigen:** `.bse__row .v2in { padding: 4px
  7px }` schlägt die feldeigenen Polster. Gemessen im Editor:
  `padding-right` **7 px**, die Lupe beginnt **21 px innerhalb** des
  Textbereichs; in der eigenen Story des Feldes 34 px Polster und 6 px Luft.
  Trifft 0013 genauso, gehört in eine eigene Aufgabe.
- **Das Register im `sm`-Drawer** (rund 426–450 px Inhalt): Nummer und Quelle
  stehen in der Karte, Konto, Sachverhalt und Zustand brauchen den waagerechten
  Lauf. Unter rund 380 px Inhalt bleibt nur die Nummernspalte — und dort stehen
  neun gleich lautende Nummern ohne ihren Grund. Folgt aus `MIN_WIDTH = 780`
  und der Entscheidung aus M4 der ersten Runde; erreichbar ist alles.
- **Neu als Nebenwirkung, ohne Schaden:** unterhalb rund 1000 px hält jetzt
  `MIN_WIDTH` die erste Spur bei 160 px (statt dass sie mit dem Fenster
  wächst); zwei Zeilen brechen dort auf 65 px statt 45–47. Keine Überläufe,
  keine Beschneidung.
- Ladezustand ohne `HeadRow`, Grenzzeile ohne Live-Region, `.v2dnr__datev`
  weiterhin tot, Label-Typen in `index.ts` weiterhin unter
  `/* DATEV-Snapshot */` — alle vier unverändert aus der letzten Runde.

Abgenommen von / am: fremde Abnahme-Sitzung (kein Bau, kein Chat-Verlauf),
2026-09-07 (zweite Runde) · Offene Punkte: M1 blockiert; M2 und M3 nachziehen.

## Nach der Wiederabnahme (2026-09-07): die Grenzzeile rechnete weiter mit 420 px

**M1 erledigt.** Der Hinweis war schmal geworden, die **Grenzzeile** nicht:
mit 36 Zeichen im Editor maß sie 71 px (vier Zeilen) und die Buchungszeile
wuchs von 91 auf 170. Gemessen war sie gegen die zwölfstellige Fixture —
dieselbe Falle, die die Nacharbeit selbst benannt hatte, eine Zeile tiefer.
Sie läuft jetzt durch dieselbe Container-Abfrage: schmal steht **„36/36"**, der
Satz im `title` und im Zugänglichkeitsbaum. Gemessen mit 36 echten Zeichen im
Editor: Grenzzeile **18 px**, Hinweis 19 px, Buchungszeile 116 statt 170.

Dazu kürzt die dominante Nummer im schmalen Fall (`.v2dnf__num`): eine
36-stellige Nummer ohne Trennzeichen hat keine Umbruchstelle und machte den
Hinweis vierzeilig.

**M2 erledigt — und das war ein Fehler in meiner eigenen Nacharbeit.** Die
schmale Form hatte den erklärenden Satz mit `display: none` ausgeblendet, und
damit war er auch aus dem Zugänglichkeitsbaum verschwunden: übrig blieb ein
Knopf „RE-2026-0140" ohne Wort. **Der Satz wandert jetzt aus dem Bild, nicht
aus dem Baum** (`sr-only`-Muster), und die Kurzform steht daneben statt an
seiner Stelle. Wer die Seite hört, bekommt weiterhin den ganzen Satz.

**M3 erledigt** — beim Tippen in die Suche stand `active` auf 0, also war
Zeile eins gefärbt, während der Fokus in der Suche war; das erste ↓ sprang
dann auf Zeile zwei und übersprang die dominanteste. Jetzt `-1`: keine Farbe
ohne Fokus, und das erste ↓ landet oben.

**Offen, mit Adresse:** das Register braucht unter rund 380 px Inhaltsbreite
den waagerechten Lauf, und dann steht nur noch die Nummernspalte — neun gleich
lautende Nummern ohne ihren Grund. Das folgt aus `MIN_WIDTH = 780` und ist
eine Frage an den Drawer, in dem es steht (0052), nicht an dieses Feld.

## Dritte Abnahme (2026-09-07)

**Ergebnis: zurück.** Gemessen gegen den Dev-Server (`localhost:6107`, Stand
`04ae1ad`, Arbeitsbaum sauber — die beiden Commits nach `2487bde` fassen 0014
nicht an) mit CDP: echte Tasten (`Input.dispatchKeyEvent`), echte Klicks, echte
Eingabe (`Input.insertText`), je Schritt ein eigener `Runtime.evaluate`. Kein
Bau, kein Chat-Verlauf: nur Spec und Code. Story-IDs verkürzt wie oben.

### Die drei Punkte der Nacharbeit — nachgemessen

| | Nachweis | Ergebnis |
|---|---|---|
| **M1** Grenzzeile rechnete mit 420 px | `…journalentryeditor--document-number-across-rows`, **36 echte Zeichen** im Feld (nativer Wert-Setter plus `input`-Event, Messung im eigenen `Runtime.evaluate`), 1440 **und** 1280 gleich: Feld 96 px, `.v2dnf__limit` **17,8 px / eine Zeile** (Zeilenhöhe 17,825), sichtbar „36/36", `title` = „36 Zeichen — mehr trägt Belegfeld 1 in DATEV nicht.", Hinweis 19,4 px, Buchungszeile **90,6 → 116,4** statt 170. Gegenprobe mit echter Eingabe: `Input.insertText` mit 44 Zeichen ins Editorfeld → Wert 36 Zeichen, Grenzzeile 17,8 px, Zeile 116,4. In `…field--edge` (372 px) steht dieselbe Zeile mit dem ganzen Satz, ebenfalls 17,8 px | ✓ behoben |
| **M2** schmale Form nahm den Satz aus dem Baum | Gemessen am **Zugänglichkeitsbaum** (`Accessibility.getFullAXTree`), nicht am Markup. Im Editor bei 96 px: alle sieben `.v2dnf__wide` stehen auf `position: absolute`, 1×1 px, `clip-path: inset(50%)` — `display` bleibt `block`, kein `display: none`. Im Baum stehen `StaticText` „Für diesen Vorgang gilt", `button` „RE-2026-0140", `StaticText` „Offener Posten aus DATEV", `StaticText` „— die Nummer kommt aus DATEV und ist nicht verhandelbar." und für die Grenzzeile „36 Zeichen — mehr trägt Belegfeld 1 in DATEV nicht."; der `<p>` trägt denselben Satz als `description`. Die Kurzform „36/36" ist `aria-hidden` und **fehlt** im Baum — keine doppelte Ansage | ✓ behoben |
| **M3** `active` stand beim Tippen auf 0 | `…register--interactive`, echte Tasten: Klick in die Suche, „RE-2026-0140" Zeichen für Zeichen getippt (9 → **7** Treffer) → `.v2tbl__row.is-active` **0×**, Fokus in der Suche. Erstes ↓ → `data-row=0`, ↓ → 1, ↑ → 0, `Enter` → „Übernommen: RE-2026-0140 (Offener Posten aus DATEV)". Ohne Suche derselbe Weg, ebenfalls ab Zeile 0; ein zweites `Enter` auf Zeile 1 → „Gespiegelte DATEV-Buchung" | ✓ behoben |

### Was in der letzten Runde hielt — hält es noch?

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` / `pnpm build` / `pnpm check:icons` / `pnpm check:contrast` | **Exit-Code geprüft, nicht die letzte Zeile:** 0 / 0 („Storybook build completed successfully") / 0 (53 Zeichen, 2 offene Dateien — `SourceDocumentDrawer.tsx` und `JournalEntryEditor.tsx`, beide aus anderen Aufgaben) / 0 (11 Angaben nachgerechnet) | ✓ |
| Register scrollt, statt beschnitten zu werden | `…register--filled`, fünf Breiten: Wrapper `min-width: 0px`, Wrapper = `.v2dnr` (1440: 858 · 1024: 858 · 700: 626 · 500: 426 · 450: 376). Scroll-Container 858/858 · 626/818 · 426/818 · 376/818. Echtes Scrollen auf das Maximum (192 · 392 · 442 px) bringt die letzte Datenzelle bei 700, 500 **und** 450 vollständig in die Karte; sichtbare Zellen 27→36, 18→27, 9→18. Seite scrollt bei keiner Breite waagerecht | ✓ |
| Ladezustand ist eine Tabelle | `…register--loading`: eine `.v2tbl`, fünf `tr.v2tbl__row` mit je 5 `td`, 25 Skelette, `sr-only` „Wird geladen …"; bei 500 px scrollt er (426/818) | ✓ |
| Spuren, keine Überläufe | `…register--filled`: `182px 220px 120px 130px 130px` bei 1440/1024, `160px …` ab 760; im Ladezustand dieselben Spuren. **0** Zellenüberläufe bei allen fünf Breiten | ✓ |
| Tabelle statt Listbox | 1 `table` im Story-Baum, 5 `th`, 45 `td`, 9 `.v2rowbtn`; `role=option`, `role=listbox`, `aria-activedescendant`, `aria-selected` je **0×** | ✓ |
| Reihenfolge aus `sortByDominance`, Quelle je Zeile, `immutable` an der Zeile | DOM-Reihenfolge unverändert: opos_anchor · mirror_ref · datev_correction · case_decision · link · invoice_number · journal_line · bank_purpose · case_summary, alle neun Quellenwörter in Spalte 2, Marke „DATEV" an den Zeilen 0–2, „verwaist" an der `link`-Zeile | ✓ |
| Tastatur ↑/↓/`Enter`/`Esc` | s. M3; `Esc` erreicht `document` mit `defaultPrevented=false`, Ziel `BUTTON` | ✓ |
| `maxLength` hält bei 36, ohne stilles Abschneiden | `…field--interactive`: Feld auf 8 Zeichen, `Input.insertText` mit 44 → Wert 36, Grenzzeile erscheint, Echo „36 von 36 Zeichen". Im Editor dasselbe. `maxLength=36` am Element | ✓ |
| Abweichung als Hinweis, nicht als Fehler | `…field--diverging`: zwei `.v2dnf__hint`, `role=null`, `[role=alert]` 0×, `.v2in--invalid` 0×, `aria-invalid` 0×, Farbe `rgb(92,92,92)`. Klick auf die Nummer setzt `b5` von „RE 2026 140" auf „RE-2026-0140" (Hinweise 2 → 1), zweiter Klick ebenso für `b6` (1 → 0) | ✓ |
| Übernahme im Editor | Klick auf die Hinweis-Nummer setzt das Feld auf „RE-2026-0140", die Zeile fällt von 90,6 auf **65,2** px, Hinweise 2 → 1 | ✓ |
| Leer / leer nach Filter | beide ohne Tabelle, mit Grund und Ausweg; bei 1440 und 500 **0** Elemente außerhalb der Karte | ✓ |
| Lupe vorhanden/weggelassen | `…field--with-register`: zwei Felder, **eine** `.v2dnf__search`, `aria-label` „Belegnummern-Register öffnen", Klick → „Register 1× geöffnet." | ✓ |
| `id` an allen Feldern | fünf Feld-Stories: **9 von 9** `label[for]` (b1–b9) lösen auf ein `INPUT` auf | ✓ |
| `invalid` nur als Rahmen | `…field--filled`: 1× `.v2in--invalid`, 1× `aria-invalid`, `[role=alert]` 0×, kein eigener Text | ✓ |

Von dem, was hielt, ist nichts gefallen.

### Mängel dieser Runde

**M1 — die dominante Nummer kürzt nicht; der Hinweis verlässt in 96 px seine Spalte (blockiert).**
Die Nacharbeit nennt zwei Hälften: die Grenzzeile (hält, s. oben) und „dazu
kürzt die dominante Nummer im schmalen Fall (`.v2dnf__num`)". Die zweite Hälfte
greift nicht. `.v2dnf__num` bekommt `max-width: 100%`, steht aber im
`TextButton` — und der ist `display: inline-block` mit `max-width: none`, also
schrumpf-auf-Inhalt: die 100 % lösen sich gegen eine Breite auf, die der Inhalt
selbst bestimmt, und begrenzen nichts. Das dazu gesetzte `white-space: nowrap`
gibt dem `<p class="v2dnf__hint">` dann einen großen Mindestbeitrag, und als
Rasterkind mit `min-width: auto` dehnt es die Spur.

- *Im Editor*, 1440, dominante Nummer mit 36 Zeichen ohne Trennzeichen (nur der
  **Textknoten** von `.v2dnf__num` zur Laufzeit gesetzt — geprüft wird das CSS):
  Feld **96 px**, `.v2dnf__hint` **295,9 px**, Überstand über die rechte
  Feldkante **199,9 px**; `.v2dnf__num` `clientWidth 296 = scrollWidth 296`,
  also **kein** Kürzen. Alle Vorfahren bis `.v2card` stehen auf
  `overflow-x: visible`, der Text läuft also über die Zeile: er kreuzt das
  Buchungstext-Feld (`.v2in`, l 609–859, t 124,2–153,5) auf 5,7 px Höhe und
  steht darunter frei über der Nachbarspalte.
- *In der eigenen Story*, `…field--edge` (Feld b9, 36-stellige dominante
  Nummer), Behälter zur Laufzeit auf dieselben 96 px: Hinweis **275,2 px**,
  Überstand **179,2 px**, `client 275 = scroll 275`. Bei 372 px bricht dieselbe
  Zeile auf 4 Zeilen um und läuft **nicht** über (Überstand 0) — die Story
  beweist den Fall also weiterhin nicht.
- *Gegenprobe im selben Lauf:* `.v2dnf__hint { min-width: 0 }` allein bringt den
  Absatz auf 96 px zurück, die Nummer läuft aber weiter (`client 296 = scroll
  296`). Erst zusammen mit `max-width: 100%; overflow: hidden` am Knopf greift
  die Ellipse: Hinweis 96 px, `client 96 / scroll 296`, Überstand 0.

Vor der Nacharbeit war derselbe Fall eingefasst (4 Zeilen, 78 px, Zeile 149 px);
jetzt ist er eine Zeile, die 200 px weit aus der Spalte läuft. Das Kriterium
„sehr lange dominante Nummer bricht das Layout nicht" hält damit nur in der
Breite der Fixture-Story, nicht in der, in der der Baustein steht — dieselbe
Falle, die die Nacharbeit eine Zeile höher selbst benennt.
*Vorschlag:* `min-width: 0` am `.v2dnf__hint` **und** `max-width: 100%;
overflow: hidden` am Knopf der Hinweiszeile (gemessen wirksam, s. o.); der
ganze Satz steht ohnehin schon im `title` und im Zugänglichkeitsbaum.

**M2 — der deutsche Kommentar ist zurück (nicht blockierend).**
M4 der ersten Runde war in der zweiten als behoben vermerkt („kein deutscher
Kommentar mehr in beiden Bausteinen"). Die Nacharbeit hat drei neue deutsche
Blöcke eingetragen: `DocumentNumberField.tsx:112–115`,
`DocumentNumberField.tsx:135–136` und `DocumentNumberRegister.tsx:106–109`.
`CLAUDE.md` verlangt englische Kommentare, Deutsch nur in Nutzertexten. Der
Block bei `Field.tsx:135–136` behauptet dazu etwas Falsches („sie kürzt hier"
— s. M1). *Vorschlag:* übersetzen, und den Satz bei 135–136 an das anpassen,
was der Code dann tut.

### Befunde am Set, ohne Nacharbeit

- **Unverändert offen und nicht 0014-eigen:** `.bse__row .v2in { padding: 4px
  7px }` schlägt die feldeigenen `--search`-Polster; trifft 0013 genauso,
  gehört in eine eigene Aufgabe.
- Ladezustand ohne `HeadRow` (das einzige `thead` im Baum gehört Storybooks
  verstecktem `sb-argstableBlock`), Grenzzeile ohne Live-Region, `.v2dnr__datev`
  weiterhin tot, Label-Typen in `index.ts` weiterhin unter `/* DATEV-Snapshot */`
  — alle vier unverändert aus den letzten beiden Runden.
- Das `sr-only`-Muster der Nacharbeit ist in `v3.css` ausgeschrieben statt über
  die Klasse `sr-only`, die `Cells.tsx` und `Skeleton.tsx` benutzen. Hier
  richtig so — die Klasse gilt immer, das Muster hier nur in der
  Container-Abfrage —, aber im Set gibt es für `sr-only` keine eigene Regel;
  sie kommt aus Tailwind. Eigene Aufgabe, wenn Tailwind einmal fällt.
- **Kein Rückgabegrund:** das Register unter rund 380 px Inhaltsbreite (nur die
  Nummernspalte ohne ihren Grund) ist an **0052** verwiesen.

Abgenommen von / am: fremde Abnahme-Sitzung (kein Bau, kein Chat-Verlauf),
2026-09-07 (dritte Runde) · Offene Punkte: M1 blockiert; M2 nachziehen.

## Nach der dritten Abnahme (2026-09-07): eine Grenze allein ist keine

Die drei nachgearbeiteten Punkte halten alle — die Abnahme hat sie mit echten
36 Zeichen, am Zugänglichkeitsbaum und mit echten Tastendrücken geprüft.
Zurück kam sie an der **zweiten Hälfte** meiner eigenen Nacharbeit.

**M1 erledigt — und der Grund ist lehrreich.** Ich hatte der Nummer
`max-width: 100%` gegeben und gedacht, damit sei sie eingefasst. Sie stand
aber in einem `TextButton`, der als `inline-block` auf seinen Inhalt
schrumpft — 100 % von „so breit wie nötig" ist keine Grenze. Das zusätzliche
`nowrap` dehnte dann den Absatz, der als Rasterkind ohnehin `min-width: auto`
hat. Gemessen: Hinweis **295,9 px** in einem 96-px-Feld, **200 px Überstand**,
kein Vorfahre mit `overflow` — der Text kreuzte das Nachbarfeld. Vorher war
derselbe Fall wenigstens eingefasst (vier Zeilen, 78 px); meine „Verbesserung"
hat ihn schlimmer gemacht.

**Beide brauchen ihre Grenze, sonst hat keiner eine:** `min-width: 0` am
Absatz **und** `max-width: 100%; overflow: hidden` am Knopf. Gemessen mit
einer 32-stelligen Nummer ohne Trennzeichen im Editor: Feld 96, Hinweis 96
(`client` = `scroll` = 96), **Überstand 0**, die Nummer kürzt (Box 96, Inhalt
247), Zeile 91 px.

**M2 erledigt** — drei deutsche Kommentarblöcke waren mit meiner Nacharbeit
zurückgekommen, obwohl derselbe Mangel eine Runde zuvor behoben war; einer
behauptete zudem „sie kürzt hier", was zu dem Zeitpunkt nicht stimmte. Alle
drei sind Englisch, und der falsche Satz sagt jetzt, **wo** gekürzt wird und
dass es zwei Grenzen braucht.

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

**L-71 ist erledigt** (App-Commit `362325b2`), und damit fallen zwei Stellen
weg, vor denen der Nachtrag gewarnt hat:

- **`DATEV_MAX_BELEGFELD1` kommt aus `core/datev/field-limits.ts`.** Die 36
  stand hier als Literal, weil sie drüben nur als `.max(36)` an vier
  Zod-Schemata und als Zahl in einem Kommentar existierte. Der Export bleibt,
  damit die Aufrufer ihren Import behalten — die Zahl ist jetzt die der App.
- **`sourceLabel` und `stateLabel` sind Überschreibungen geworden.** Die Wörter
  der Quelle stehen in der Registry-Achse `belegnummer_quelle`, die des
  Zustands als `DOCUMENT_NUMBER_STATE_LABEL` in der Domäne; das Register liest
  beide selbst. Wären die Props Pflicht geblieben, hätte jeder Aufrufer eine
  zweite Wahrheit mitgebracht — genau davor warnte die Abnahme dieser Runde.

Dazu der eine Punkt zum Nachziehen aus der vierten Abnahme: **`Edge` zeigt den
engen Fall jetzt selbst.** Die Story maß 372 px, und der 96-px-Fall — die Spur,
die Belegfeld 1 im Buchungsraster hat — war nur in der Story einer anderen
Aufgabe zu sehen. Genau in dieser Lücke saß der Blocker in Runde 2, 3 und 4.
Die Story trägt ihn jetzt als dritten Fall, mit einer 36-stelligen Nummer ohne
Trennzeichen.

Der zweite Punkt der Abnahme (bei 36 Zeichen ist im Editor weder Nummer noch
Quelle lesbar) gehört zu **0015** — dort wird über die Breite der Spur
entschieden, nicht hier.

**Der Typtausch kam nach der letzten Abnahme.** Er ist typgeprüft
(`typecheck`, `build`, `check:icons`, `check:contrast` grün über den
Exit-Code) und ändert kein Kriterium — aber gebaut hat ihn, wer auch hier
schreibt. Eine kurze Bestätigung steht aus.
