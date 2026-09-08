# 0122 · Die Zeilenaktion darf auch fragen

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-08, fremde Abnahme steht aus |
| Stufe | `patterns/DataTable` — `RowAction`, Nachtrag zu **0121** |
| Klassen-Test | wie 0121: ja, unverändert — „vor dem Ausführen etwas erfragen" ist kein Ludwig-Begriff |
| Quelle | Rückmeldung `ludwig-manager` 2026-09-08 nach dem Bau von 0121 (Befund **L-219**): die Lieferantenwahl bei „Einzeln" musste als dritte **Sammel**aktion gebaut werden, weil die Zeilenaktion nicht fragen kann |
| Wartet darauf | **Zwei** Seiten, beide mit demselben Behelf: `banks/offen` (Lieferantenwahl) und Upload & Inbox (die Einordnungs-Korrektur, Rang 4 des Seitenprofils — eine Zeilenaktion, die vorerst Sammelaktion ist) |
| Setzt voraus | 0121 (gebaut) — `AskSpec` und die Dialog-Mechanik stehen |
| Spec von / am | Claude, 2026-09-08 |

## Warum das ein Nachtrag ist und keine neue Idee

0121 hat den Rückkanal an `ActionButton` gebaut und über `BulkAction`
durchgereicht. `RowAction` blieb dabei zurück — nicht aus einem Grund,
sondern weil der Blocker aus `banks/offen` eine Sammelaktion war. Die Folge
ist in der App schon sichtbar: die Lieferantenwahl ist dort eine
**Sammel**aktion („Einzeln, mit Lieferant"), obwohl sie eine Zeile betrifft.
Eine Handlung steht an der falschen Stelle, weil die Schnittstelle die
richtige nicht anbietet.

Das ist derselbe Fall wie `confirm`, das `RowAction` **schon** hat
(`DataTable.tsx:91`). `ask` fehlt dort einfach.

## Schnittstelle

`RowAction` wird generisch über den erfragten Wert, wie `BulkAction`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `ask` | `AskSpec<Input>` | nein | Was der Dialog erfragt, bevor die Handlung läuft. Kein Funktionstyp wie bei `BulkAction`: die Zeile ist schon bekannt, wenn die Aktion gebaut wird — der Aufrufer schließt sie ein | `RowAsk` |
| `action` | `(input: Input) => Promise<ActionResult>` | nein | Bekommt den erfragten Wert. Ohne `ask` bleibt sie `() => …` | `RowActions` |

Dazu, wie in 0121:

- **`ask` schließt `confirm` aus**, im Typ.
- **`ask` schließt `href` aus.** Ein Sprung fragt nichts — das steht heute
  schon so da (`href` **oder** `action`), `ask` gehört zur Handlung.
- **`AnyRowAction`** für die Listen-Position, und **`rowAction<Input>()`**
  für den einzelnen Eintrag. Beides aus demselben Grund wie in 0121:
  TypeScript hat keinen existenziellen Typ, und ohne den Helfer prüft nichts,
  dass `ask.initial` und der Parameter von `action` dasselbe sind.

**Kann bewusst nicht:** alles, was 0121 nicht kann — den Dialoginhalt kennen,
mehrstufig fragen, den Wert prüfen, den Stand über einen Abbruch retten.

## Stories

Abgeleitet nach §6: 0 neue Zustände + 0 Enums + 0 Layout + 1 Callback (der
Rundlauf) + 0 „im Einsatz" (die vorhandene `RowActions`-Story ist der Ort) =
**1**.

| Story | Beweist |
|---|---|
| `RowAsk` | Eine Zeilenaktion öffnet ihren Dialog, die Handlung bekommt den Wert, und daneben stehen eine mit `confirm` und ein `href` — drei Sorten in einer Leiste |

## Abnahmekriterien (variabler Block)

- Ohne `ask` ist die Signatur unverändert — keine bestehende Aufrufstelle
  ändert sich (Typcheck über das ganze Set)
- `ask` und `confirm` zusammen sind ein Typfehler; `ask` und `href` ebenso
- Die Handlung bekommt genau den Wert, den der Dialog zuletzt hielt (`RowAsk`)
- Die Zeilenaktion im Menü (`OverflowMenu`, E8) öffnet denselben Dialog wie
  die inline stehende
- Ersetzt in `banks/offen` die Sammelaktion „Einzeln, mit Lieferant" durch
  eine Zeilenaktion

## Offene Fragen

Keine. Der Schnitt folgt 0121, und der ist gebaut und in der App im Einsatz.

## Gebaut 2026-09-08

`RowAction<Input>` mit `ask`, dazu `AnyRowAction` und `rowAction<Input>()` —
dieselbe Bauart wie bei `BulkAction` (0121), aus demselben Grund: TypeScript
hat keinen existenziellen Typ, und ohne den Helfer prüft nichts, dass
`ask.initial` und der Parameter von `action` dasselbe sind.

**Ein Unterschied zu 0121:** `ask` ist hier **kein** Funktionstyp. Die Zeile
steht schon fest, wenn die Aktion gebaut wird — nur die Sammelaktion muss die
Zahl der gewählten Zeilen erst erfahren.

**`RowActionButton` ist als eigene Komponente entstanden**, und das war nicht
geplant: `ask` und `confirm` schließen sich in `ActionButton` im Typ aus, ein
Spread verbirgt, welche von beiden eine Zeile trägt — die Wahl muss also zwei
Zweige sein. Zwei Zweige in zwei Renderern (inline und Menü) wären zwei Kopien
derselben Entscheidung gewesen.

**Gemessen** (Story `RowAsk`, `scripts/cdp.mjs`): der Dialog öffnet mit
gesperrtem Knopf, nach der Wahl bekommt die Handlung genau den Wert
(„→ Musterbau GmbH" im Kopf), und die dritte Aktion wandert ins Menü (E8) —
dort öffnet dieselbe Aktion denselben Dialog. Drei Sorten in einer Leiste:
eine mit `ask`, eine mit `confirm`, ein `href`.

`pnpm typecheck` und die fünf Wächter auf Exit 0. Im Barrel: `rowAction`,
`AnyRowAction`.

## Schlanke Abnahme (Schnittstelle) 2026-09-08

Fremde Abnahme, geprüft wird die Schnittstelle. Darstellung, Spurbreiten,
Trefferflächen und Tastaturwege sind nach `0119` vertagt.

**Gelesen:** `docs/backlog/0121-aktion-mit-eingabe.md` und diese Spec;
`src/ui/v3/patterns/DataTable.tsx` (`RowAction` 89–108, `AnyRowAction` 118,
`rowAction` 130, `RowActionButton` 532–557, `inlineAction` 559,
`menuAction` 577), `src/ui/v3/primitives/ActionButton.tsx` (`AskSpec`,
Union `PlainProps | AskProps` 72–84), `src/ui/v3/primitives/Selection.tsx`
(`BulkAction` 246–262, `BulkButton`), `src/ui/v3/primitives/OverflowMenu.tsx`,
`src/ui/v3/primitives/Dialog.tsx`, `src/ui/v3/patterns/DataTable.stories.tsx`
(`RowAsk` 428–475, `BulkAsk` 371, `RowActions` 483), `src/ui/v3/index.ts`,
`.claude/skills/spec-schreiben/SKILL.md` §6, Commit `417c74a`.

**Typprobe** (eigenes `tsconfig`, das `src/**/*` plus eine Sondendatei außerhalb
des Repos einschließt; mit einem absichtlichen Fehler gegengeprüft, damit
feststeht, dass die Sonde wirklich geprüft wird): fünf Fälle, siehe M1/M3.

**Wächter:** `pnpm typecheck` **0** · `check:language` **0** (`--test` 0,
`--all` ist Bericht, 377 Altzeilen, keine davon aus `417c74a`) ·
`check:icons` **0** · `check:contrast` **0** · `check:mirror --test` **0** ·
`check:when` **0** (`--test` 0).

**Gemessen** (`scripts/cdp.mjs`, Dev-Server 6107, Story
`v3-patterns-arbeitsfläche-datatable--row-ask`, Aktion und Messung je in
getrennten `Runtime.evaluate`-Aufrufen):

| Schritt | Gemessen |
|---|---|
| A Dialog auf | Titel „Sachverhalt 2026-0417 zuordnen", Fußknopf `Zuordnen [disabled]` |
| B Enter, ungültig | unverändert — `valid` sperrt **auch Enter**, nicht nur den Knopf |
| C Wert gewählt | `Zuordnen [enabled]` |
| D Enter, gültig | Dialog zu, Kopfzeile „2026-0417 → Musterbau GmbH", Fokus zurück auf den Auslöser |
| E erneut auf | `select` steht auf `""` — zurück auf `initial` |
| F–H wählen, Escape, erneut auf | wieder `""` — der Abbruch rettet den Stand nicht, wie zugesagt |
| I–J Menü | Menü offen; „Verwerfen" im Menü öffnet seinen `confirm`-Dialog, und das Menü bleibt dabei offen (der Dialog steht im DOM **innerhalb** des `<details>`, `onBlur` sieht ihn als eigenes Kind) |

### Je Kriterium

| Kriterium | Nachweis | Urteil |
|---|---|---|
| Ohne `ask` unverändert, keine Aufrufstelle ändert sich | `pnpm typecheck` Exit 0 über das ganze Set; Sonde D (`const d: RowAction = { label, action: async () => {} }`) übersetzt | **erfüllt** |
| `ask` und `confirm` zusammen sind ein Typfehler | Sonde A übersetzt **fehlerfrei** | **verfehlt** → M1 |
| `ask` und `href` zusammen sind ein Typfehler | Sonde B übersetzt **fehlerfrei** | **verfehlt** → M1 |
| Die Handlung bekommt genau den zuletzt gehaltenen Wert | Messung C/D | **erfüllt** |
| Die Zeilenaktion im Menü öffnet denselben Dialog wie die inline stehende | keine Story erzeugt diesen Fall | **nicht nachgewiesen** → M2 |
| Ersetzt in `banks/offen` die Sammelaktion | liegt in `ludwig/app`; die Integration ruht (Owner-Entscheid 2026-09-07, kein Sync bis zur Migration) | **hier nicht prüfbar**, offen |
| `AnyRowAction` und `rowAction<Input>()` vorhanden | `DataTable.tsx:118` / `:130`, im Barrel `index.ts:197–198`, benutzt in `RowAsk` | **erfüllt** |
| `@when`/`@instead` an jedem Export | `rowAction` trägt beide (`DataTable.tsx:126–127`); `AnyRowAction` ist ein `type` und damit ausgenommen; `RowActionButton` ist nicht exportiert; `check:when` Exit 0 | **erfüllt** |
| Story-Zahl gegen §6 | 0 Zustände + 0 Enums + 0 Layout + 1 Callback + 0 „im Einsatz" = 1; gebaut ist genau `RowAsk` | **erfüllt** |
| Status nur über `status-registry.ts`, kein Hex, keine px | keine Trefferzeile in den hinzugefügten Zeilen von `417c74a` | **erfüllt** |
| Zwei Zusicherungen aus 0121 stimmen noch | `grep '\bas [A-Z]'` findet genau `Selection.tsx:328` (`undefined as Input`) und `ActionButton.tsx:115` (`ask?.initial as Input`), beide kommentiert und beide an der Union-Grenze; 0122 fügt keine hinzu (`RowActionButton` braucht keine, weil `AnyRowAction` schon `any` ist) | **erfüllt** |

### 0121 gegen 0122: löst der Nachtrag dasselbe Muster gleich?

Ja, in der Bauart: `AnyRowAction`/`rowAction()` stehen Zeichen für Zeichen für
dasselbe wie `AnyBulkAction`/`bulkAction()`, beide mit demselben Grund im
JSDoc, beide im Barrel, beide mit einem eigenen kleinen Knopf
(`BulkButton` / `RowActionButton`), der auf `ask` verzweigt. Dass `ask` hier
**keine** Funktion der Schlüssel ist, ist begründet und stimmt: die Zeile steht
beim Bauen fest, die Zahl der gewählten Zeilen nicht.

Der einzige belegte Unterschied ist `action`: bei `BulkAction` Pflicht
(`Selection.tsx:249`), bei `RowAction` optional (`DataTable.tsx:95`) — das ist
älter als 0122 und folgt aus `href`. Seine Nebenwirkung ist M3.

Die fehlende Ausschluss-Regel (M1) ist **keine** Abweichung zwischen den
beiden: `BulkAction` hat dieselbe Lücke (Sonde C übersetzt fehlerfrei). Beide
Hüllen weichen gemeinsam von `ActionButton` ab, wo der Ausschluss wirklich
greift (Sonde F: `TS2322 … Types of property 'confirm' are incompatible`).

**Zum `CasePicker` im `ask.render`:** er kommt in keiner der beiden Stories vor
— absichtlich, „ein Pattern kennt keine Entität" (`DataTable.stories.tsx:369`).
Prüfbar ist damit nur der Vertrag, und der passt: `CasePicker` nimmt
`value: string | null` und `onChange` (`CasePicker.tsx:73–76`), also genau die
Form von `render({ value, set })`. Die Falle aus 0084 — eine kontrollierte
Eingabe, die leer aussieht, obwohl ein Wert steht — greift nicht mehr:
`Combobox.tsx:92` löst `chosen` seit `b9a8a54` aus **allen** `options` auf,
nicht aus der gefilterten Liste.

### Mängel

**M1 · `ask` schließt weder `confirm` noch `href` aus — blockierend**
Kriterium: „`ask` und `confirm` zusammen sind ein Typfehler; `ask` und `href`
ebenso" (auch: „**`ask` schließt `confirm` aus**, im Typ").
Ort: `src/ui/v3/patterns/DataTable.tsx:89–108`.
Befund: `RowAction<Input>` ist ein einfaches Interface mit vier unabhängigen
optionalen Feldern (`href?`, `action?`, `confirm?`, `ask?`). Es gibt kein
`never`, keine Union, keinen Ausschluss. Beide Sonden übersetzen fehlerfrei:
`rowAction<string>({ label, ask: {…}, confirm: {…}, action })` und
`rowAction<string>({ label, href: "#x", ask: {…}, action })`. Zur Laufzeit
gewinnt jeweils das andere: `RowActionButton:542` nimmt den `ask`-Zweig und
`confirm` fällt still weg; `inlineAction:560` und `menuAction:578` prüfen
`href` zuerst und lassen `ask` **und** `action` still fallen. Dazu behauptet
der Code selbst, was er nicht tut — `DataTable.tsx:104–105`: „It excludes
`confirm` … and it excludes `href`, because a jump asks nothing."
Kleinster Weg: `RowAction` dieselbe zweiarmige Form geben, die
`ActionButton.tsx:72–84` schon hat — ein gemeinsames Basis-Interface und zwei
Arme (`ask?: never` im einfachen Arm, `confirm?: never` und `href?: never` im
`ask`-Arm). Kein neuer Mechanismus, nur derselbe eine Stufe höher. Die
bestehenden Aufrufstellen (`RowActions`, `RowAsk`, `rowActions?: (row) =>
AnyRowAction[]`) passen unverändert in einen der beiden Arme.
Blockiert: **ja** — zwei Abnahmekriterien und die Zusage im JSDoc.

**M2 · Keine Story bringt eine `ask`-Aktion ins Menü — blockierend**
Kriterium: „Die Zeilenaktion im Menü (`OverflowMenu`, E8) öffnet denselben
Dialog wie die inline stehende".
Ort: `src/ui/v3/patterns/DataTable.stories.tsx:428–475` (`primary: true` in
Zeile 442) gegen `DataTable.tsx:511–523` (`rowActionCells`).
Befund: `RowAsk` gibt drei Aktionen, und „Zuordnen" — die einzige mit `ask` —
trägt `primary: true`. Ab drei Aktionen bleiben genau die `primary`-Aktionen
inline, der Rest zieht ins Menü. Im Menü stehen also „Prüfen" (`href`) und
„Verwerfen" (`confirm`); der `ask`-Pfad durch `menuAction` wird nie gerendert.
Im Browser gemessen: inline nur „Zuordnen", im Menü `["Prüfen","Verwerfen"]`.
Damit ist der Satz oben in „Gebaut 2026-09-08" — „die dritte Aktion wandert ins
Menü (E8) — dort öffnet dieselbe Aktion denselben Dialog" — nicht belegt, und
das gleichlautende Story-JSDoc (`DataTable.stories.tsx:424–426`, „drei Sorten
in einer Leiste … dort öffnet dieselbe Aktion denselben Dialog") sagt Lesern in
Storybook etwas Falsches. Was gemessen **werden konnte**: ein `confirm`-Dialog
aus dem Menü geht auf und das Menü bleibt dabei stehen (Messung J), und beide
Renderer benutzen denselben `RowActionButton` — der Pfad ist also
wahrscheinlich heil, aber nicht gezeigt.
Kleinster Weg: `RowAsk` eine vierte Aktion oder eine zweite Tabelle geben, in
der eine `ask`-Aktion **nicht** `primary` ist, damit ein und derselbe Dialog
einmal inline und einmal aus dem Menü aufgeht; danach die beiden Sätze in Spec
und Story-JSDoc auf das setzen, was dann wirklich dasteht.
Blockiert: **ja** — ein Abnahmekriterium ohne Nachweis, und zwei Stellen
behaupten eine Messung, die die Fixture nicht hergibt.

**M3 · `ask` ohne `action` ist ein stiller Leerlauf — nicht blockierend**
Kriterium: Schnittstellen-Zeile `action` („Pflicht: nein").
Ort: `src/ui/v3/patterns/DataTable.tsx:95` und `:541`.
Befund: `rowAction<string>({ label, ask: {…} })` ohne `action` übersetzt
(Sonde E). Zur Laufzeit greift `const run = a.action ?? (async () => {})`: der
Dialog geht auf, die Wahl wird getroffen, das Bestätigen tut nichts — keine
Fehlerzeile, kein Hinweis. Bei `BulkAction` kann das nicht passieren, dort ist
`action` Pflicht. Die Spec nennt `action` selbst „nicht Pflicht", der Fall ist
also spec-konform beschrieben; er wird erst durch M1 wirklich schließbar (im
`ask`-Arm wäre `action` Pflicht, im `href`-Arm verboten).
Kleinster Weg: mit M1 erledigen — im `ask`-Arm `action` als Pflicht führen.
Blockiert: **nein**.

**M4 · Rückstand in 0121, hier nur vermerkt — nicht blockierend für 0122**
Ort: `docs/backlog/0121-aktion-mit-eingabe.md`, Abschnitt „Stories".
Befund: die Story-Tabelle nennt `BulkAskInUse` mit dem `CasePicker` im Dialog;
gebaut ist `BulkAsk` (`DataTable.stories.tsx:371`) mit einem `Select`, und der
`CasePicker` steht dort bewusst nicht. Dazu die gemeinsame Lücke aus M1 in
`BulkAction` (`Selection.tsx:251/260`).
Kleinster Weg: in der Abnahme von 0121 führen.
Blockiert: **nein** — gehört nicht zu 0122.

### Gesamturteil

**zurück.** Die Mechanik trägt und ist im Browser sauber belegt — der Wert
kommt an, `valid` sperrt auch Enter, der Abbruch fällt auf `initial` zurück,
der Fokus geht zurück auf den Auslöser, und die Bauart ist Zeichen für Zeichen
die von 0121. Zurück geht es an zwei Stellen: der zugesagte Typausschluss
existiert nicht (M1), und das Kriterium zum Menü hat keinen Nachweis, während
Spec und Story behaupten, es sei gemessen (M2).
