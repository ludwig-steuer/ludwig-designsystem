# 0104 · Das Feld-Label ist nicht an sein Feld gebunden

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/Form.tsx` |
| Quelle | Abnahme 0019 AmountInput, zweiter Durchgang (2026-09-05), Befund B4 |
| Auftrag | `Field` rendert `<label htmlFor>` als **Geschwister** des Feldes (`Form.tsx:35`). Ohne ein `name` oder eine `id` am Feld zeigt `htmlFor` ins Leere: gemessen in der Story `AmountInput --filled` ist `input.labels` **leer**. Damit hat das Feld für eine Vorlesehilfe keine Beschriftung, und ein Klick auf das Wort setzt den Fokus nicht ins Feld. |
| Warum das zählt | Es trifft **jedes** Feld des Sets, nicht `AmountInput` — `Field` ist die geteilte Hülle für `Input`, `Textarea`, `Select`, `Checkbox`, `AmountInput`, `DateField`, `Combobox`. Die Regel T8 („jedes Icon hat ein Wort, Placeholder ist kein Label") setzt voraus, dass das Wort ankommt. |
| Zu entscheiden | (a) `useId()` in `Field`, die id nach unten reichen und am Kind setzen — dann muss `Field` sein Kind kennen oder klonen. (b) Das Label das Feld **umschließen** lassen (`<label>…<input></label>`) — dann entfällt `htmlFor` ganz, aber das Markup ändert sich für jeden Aufrufer. (c) `htmlFor` zur Pflicht machen und den Aufrufer die id setzen lassen — ehrlich, aber 40 Aufrufstellen. |
| Betroffen | `Field` und alles, was darin steht; die Stories aller Formular-Bausteine sind der Nachweis |
| Verwandt | 0089 (Versalien an denselben Labels) — beide betreffen `.v2field__label`, und wer eines anfasst, sollte das andere mitnehmen |
| Angelegt von / am | Claude, 2026-09-05 (aus der Abnahme von 0019) |

## Entschieden (2026-09-06): keiner der drei Wege allein, sondern zwei nach Zuständigkeit

Die drei angebotenen Wege scheitern je an einem Teil des Bestands:

- **(b) Das Label umschließt das Feld.** Fällt aus, sobald mehr als ein
  Bedienelement darin steht: `DateRangeField` hat **zwei** Eingaben, und ein
  `<label>` um beide bindet an die erste und macht die zweite namenlos.
  Dasselbe bei `AccountField` (Eingabe plus Kontenblatt-Knopf).
- **(a) `useId()` in `Field` und die id ans Kind klonen.** `Field` kennt sein
  Kind nicht: bei `AccountField`, `FileDrop` und `DateRangeField` ist das
  äußere Element ein `div`, die id landete auf dem Träger statt auf der
  Eingabe — `htmlFor` zeigte dann auf einen Kasten. Über einen Context ginge
  es, aber der macht `Form.tsx` zur Client-Komponente, und damit jede Eingabe
  des Sets; der Skill sagt „Server-Component, wenn irgend möglich".
- **(c) `htmlFor` zur Pflicht.** Trägt — aber nur dort, wo der Aufrufer die
  Hülle setzt. Wo ein Baustein seine Hülle **selbst** mitbringt
  (`AmountInput`, `Combobox`), hat der Aufrufer nichts zu binden, und genau
  dort ist der Mangel gemessen worden.

Also nach Zuständigkeit geteilt:

**1. Wer sein Label selbst mitbringt, bindet es auch selbst.** `AmountInput`
und `Combobox` rendern ihr eigenes `Field` und haben die id bisher aus `name`
gezogen — einer **optionalen** Prop. Ohne `name` war beides leer, und das ist
der gemessene Fall (`AmountInput --filled`). Sie fallen jetzt auf `useId()`
zurück. Kein Aufrufer ändert sich, und die Bindung kann nicht mehr fehlen.

Nebenbei entkoppelt: `id` ist die Bindung, `name` der Feldname im Formular.
Beides in eine Prop zu legen hieß, dass ein Feld ohne Formular auch kein Label
haben durfte.

**2. Wo der Aufrufer die Hülle setzt, muss er die Bindung nennen.**
`Field.htmlFor` ist **Pflicht**. Ein `<Field>` ohne Bindung übersetzt nicht
mehr — die Regel steht damit im Typ und nicht in einer Prüfliste, und der
nächste Baustein kann sie nicht vergessen.

Damit das geht, nehmen die drei zusammengesetzten Felder eine `id`
entgegen und geben sie an **ihre** Eingabe weiter: `DateField`,
`DateRangeField` (an das „von"-Feld — der Klick aufs Wort setzt den Fokus an
den Anfang des Zeitraums) und `AccountField`.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (ein Kriterium je Befundzeile der Aufgabe):

- [ ] **`input.labels` ist in keiner Formular-Story mehr leer** — gemessen über alle Stories, die ein `input`, `textarea` oder `select` in einem `.v2field` zeigen
- [ ] Ein Klick auf das Wort setzt den Fokus ins Feld (`AmountInput --filled`, `Field --filled`, im Browser)
- [ ] `AmountInput` und `Combobox` binden **ohne** `name` (Story ohne `name`, `labels.length === 1`)
- [ ] `Field` ohne `htmlFor` übersetzt nicht (`tsc` gegen eine Probezeile)
- [ ] `DateField`, `DateRangeField` und `AccountField` reichen eine `id` an ihre Eingabe durch; beim Zeitraum an das „von"-Feld
- [ ] `id` und `name` sind getrennt: ein Feld ohne `name` hat trotzdem eine Bindung
- [ ] Kein Aufrufer verliert seinen `name` (Server-Action-Formulare, `grep`)

## Gebaut (2026-09-06)

**Die beiden Bausteine, die ihr Label selbst mitbringen**, binden es jetzt
selbst: `AmountInput` und `Combobox` zogen die id aus `name` — einer
optionalen Prop. `const fieldId = name ?? useId()`; `name` gewinnt weiter,
damit bestehende Formulare ihre ids behalten.

**`Field.htmlFor` ist Pflicht.** 41 Aufrufstellen in elf Dateien übersetzten
danach nicht mehr; alle tragen jetzt eine Bindung, und das erste
Bedienendement im Block trägt dieselbe id. Der Slug kommt aus dem Label
(„Belegdatum" → `belegdatum`), je Datei eindeutig.

**Die drei zusammengesetzten Felder** nehmen eine `id` entgegen und geben sie
an ihre Eingabe: `DateField`, `DateRangeField` (an das „von"-Feld) und
`AccountField`.

## Messung des Bauenden (2026-09-06)

Ein Skript ist über **106 Stories** gelaufen, die zusammen **212**
Bedienelemente in einem `.v2field` zeigen, und hat je Element gefragt, ob es
eine Beschriftung hat (`labels`, `aria-label` oder `aria-labelledby`):
**keins ohne**. Vorher war `input.labels` bei jedem Feld leer, dessen Hülle
kein `htmlFor` trug.

| Gemessen | Ergebnis |
|---|---|
| `AmountInput --filled` (ohne `name`) | `id="_r_0_"` aus `useId`, `labels` 1, Klick aufs Wort setzt den Fokus ins Feld |
| `Combobox --filled` (mit `name`) | `id="konto"` — der Name gewinnt, `labels` 1, Klick trägt |
| `DateField --filled`, Feld „Zeitraum" | zwei Eingaben, das Wort bindet an „von", „bis" behält sein `ariaLabel` |

## Was bewusst offen bleibt

Das „bis"-Feld eines Zeitraums hat kein `<label>`, sondern ein `aria-label`.
Ein `<label>` kann nur auf **ein** Bedienelement zeigen; die saubere Form wäre
eine Gruppe (`role="group"` mit `aria-labelledby`), und die gehört zu 0106,
wo die Frage nach Gruppen und Rollen ohnehin ansteht.

## Abnahme (fremd, 2026-09-06)

Abgenommen gegen Spec und Code, nicht gegen den Chat. Stand `f564fb5` („0104:
das Wort ist wieder an sein Feld gebunden"); im Baum lagen dabei fremde,
nicht zu dieser Aufgabe gehörende Änderungen an `JournalEntryEditor` und
`v3.css` — sie berühren `Field` nicht. Storybook lief für die Messung auf
`localhost:6107`; alle Zahlen sind selbst gemessen, keine übernommen.

**Der Durchlauf des Bauenden nachgestellt.** `labels-check.mjs` **ohne**
Filter über **alle 523 Stories** (nicht 106): **76** Stories zeigen zusammen
**242** Bedienelemente in einem `.v2field` — 30 mehr, als der Bauende gemessen
hat. Sein Filter hat also etwas ausgelassen; an seinem Ergebnis ändert es
nichts: nach seiner Lesart („Beschriftung" = `labels` **oder** `aria-label`
oder `aria-labelledby`) ist **keins** ohne. Nach der Lesart des Kriteriums
(`input.labels`) sind **21 von 242** leer — neun davon sind ein Mangel (M1),
zwölf sind das bewusst offene „bis" (siehe unten).

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0 (2026-09-06, mit dem fremden Stand im Baum) | ✓ |
| **Fest** — `pnpm build` grün | In dieser Abnahme untersagt, deshalb nicht gelaufen. Ersatzweise: der Storybook-Dev-Server übersetzt und liefert alle 523 Stories, und `console-check.mjs` über sechs betroffene Stories meldet **0 Konsolenmeldungen** | offen (nicht geprüft) |
| **Fest** — Code englisch, `@when`/`@instead` an jedem Export | Kein neuer Export; die drei neuen Props (`Form.tsx:30–40`, `DateField.tsx:49–53` und `:94–100`, `AccountField.tsx:91–95`) tragen englische JSDoc, ebenso die neuen Kommentare in `AmountInput.tsx:111–114` und `Combobox.tsx:64–65`. Deutsch nur in sichtbaren Strings | ✓ |
| **Fest** — im Browser angesehen | 523 Stories in Chromium geöffnet (`ab104-final.mjs`), dazu sieben Stories einzeln mit echten Maus- und Tastenanschlägen über CDP (`ab104-click.mjs`, `ab104-tab.mjs`, `ab104-open.mjs`) | ✓ |
| **Variabel** — `input.labels` ist in keiner Formular-Story mehr leer | `ab104-final.mjs`, 523 Stories, 242 Bedienelemente in `.v2field`: **21 mit `labels.length === 0`** — neun Eingaben von `AccountField` in sechs Stories (M1) und zwölf „bis"-Felder eines Zeitraums in elf Stories (bewusst offen, siehe unten). Die übrigen 221 haben genau ein Label | ✗ |
| **Variabel** — Klick auf das Wort setzt den Fokus ins Feld | Echte Mausklicks auf jedes `.v2field__label`, danach `document.activeElement`: `amountinput--filled` „Bruttobetrag" → `input#_r_0_`, „Skonto" → `input#_r_1_`; `field--filled` alle vier → `input#b1`, `input#t`, `select#bu`, `textarea#n`; `combobox--filled` → `input#konto`; `datefield--filled` alle drei → `input#belegdatum`, `#belegdatum-beanstandet`, `#zeitraum`; `filterbar--many-fields` alle sieben; `sachverhalt-crud--full-cycle` alle drei; `clarificationeditor--gefuellt` beide Felder (die drei übrigen Wörter dort sind `<legend>` einer `RadioGroup`, korrekt ohne `for`). **20 von 20** getroffen. Einzige Ausnahme: `accountfield--with-candidates`, Klick auf „Konto" → Fokus bleibt auf `body` (M1) | ✓ (Ausnahme in M1) |
| **Variabel** — `AmountInput` und `Combobox` binden **ohne** `name` | `AmountInput`: alle elf Story-Aufrufe sind ohne `name`; gemessen in `amountinput--filled` → `id="_r_0_"`, `name` = `null`, `labels.length` = 1, Labeltext „Bruttobetrag". `Combobox`: **keine** Story ohne `name` — alle 13 Aufrufe (12 in `Combobox.stories.tsx`, einer in `CaseCrud.stories.tsx:364`) setzen einen. Der Fallweg ist damit nicht vorgeführt (M2) | ✗ |
| **Variabel** — mit `name` bleibt die id der Name | `combobox--filled` (`name="konto"`): `id="konto"`, `name="konto"`, `aria-controls="konto-list"`, `labels.length` = 1. Für `AmountInput` gilt dieselbe Zeile (`AmountInput.tsx:115`), im Bestand aber ohne Story | ✓ |
| **Variabel** — `Field` ohne `htmlFor` übersetzt nicht | Wegwerf-Datei außerhalb `src/` mit zwei Zeilen (einmal ohne, einmal mit `htmlFor`), eigene `tsconfig`, `npx tsc --noEmit`: genau ein Fehler, `TS2741: Property 'htmlFor' is missing in type '{ children: Element; label: string; }' but required in type '{ label: string; …; htmlFor: string; …}'` — die Zeile **mit** `htmlFor` übersetzt. Datei danach gelöscht (`git status` sauber) | ✓ |
| **Variabel** — `DateField`, `DateRangeField`, `AccountField` reichen eine `id` durch, beim Zeitraum an „von" | `DateField` (`DateField.tsx:59`): `datefield--filled` „Belegdatum" → `input#belegdatum`, `labels` 1. `DateRangeField` (`:116`): Feld „Zeitraum" hat zwei Eingaben, die erste trägt `id="zeitraum"` und `labels` 1, die zweite keine id — das Wort bindet an „von". `AccountField` (`AccountField.tsx:186`): die Prop ist da, **kein Aufrufer setzt sie** — weder die neun `<Field>` der eigenen Story noch `JournalEntryEditor.tsx:603` (dort ohne `Field`, mit `ariaLabel`) | ✗ (zwei von drei) |
| **Variabel** — `id` und `name` sind getrennt | `amountinput--filled`: `id="_r_0_"` aus `useId`, `name` = `null`, `labels` 1 — ein Feld ohne Formular hat eine Bindung. Umgekehrt `datefield--filled`: `id="belegdatum"`, `name` = `null` | ✓ |
| **Variabel** — kein Aufrufer verliert seinen `name` | `git show f564fb5 -- src \| grep '^-' \| grep 'name='` → keine entfernte Zeile. Je Datei die `name="…"`-Menge vor und nach dem Stand verglichen (14 Dateien): identisch, darunter `partner` (CaseCrud), `clarification-audience/-severity/-type`, `basis`, `scope`…`scope5` | ✓ |
| **Rückschritt** — sind die ids eindeutig? | `ab104-final.mjs` zählt in jeder der 523 Stories die ids des ganzen Dokuments: **keine doppelte**. Zwei Instanzen desselben Bausteins bleiben getrennt (`amountinput--filled`: `_r_0_`/`_r_1_`), zwei Felder mit gleichem Wort in einer Datei tragen Suffixe (`suche`/`suche-2`/`suche-3`, `zeitraum`…`zeitraum-5`). Gegenprobe im offenen Dialog: `sachverhalt-crud--full-cycle` nach „Sachverhalt anlegen" zeigt acht gebundene Felder, Filterleiste und Dialog gleichzeitig, keine Kollision. Kein Baustein unter `src/ui/v3/` schreibt eine feste id — die vier mit eigener Hülle nehmen `useId` | ✓ |
| **Rückschritt** — Tastaturweg | Echte Tab-Anschläge über CDP: `filterbar--many-fields` läuft `select#kreditor` → `input#belegdatum` (vier Segmente) → „bis" (vier Segmente) → `input#falligkeit`; `amountinput--filled` läuft `_r_0_` → `_r_1_` → heraus → zurück. Reihenfolge unverändert, kein `tabindex` angefasst | ✓ |
| **Rückschritt** — Autofill / Server-Action-Formular | Die ids wurden nur **ergänzt**, nie ersetzt: wo ein `name` steht, ist die id weiterhin der Name (`combobox--filled` gemessen), sonst war vorher gar keine id da. `autoComplete` ist unberührt. Im Set gibt es nur eine Formular-Story: `filterbar--server-form` — sie trug vorher wie nachher **kein** `name` an ihren Feldern, ist als Nachweis also stumm. Die echten Server-Action-Formulare stehen in `ludwig/app` | ✓ (Set) · offen (App) |
| **Rückschritt** — Konsole | `console-check.mjs` über `amountinput--filled`, `combobox--filled`, `datefield--filled`, `clarificationeditor--gefuellt`, `choiceprompt--with-free-text`, `sachverhalt-crud--full-cycle`: **0 Meldungen** je Story | ✓ |

### Mängel

**M1 — neun Feldwörter zeigen ins Leere, weil die Story die `id` nicht
weiterreicht.** `src/ui/v3/entities/account/AccountField.stories.tsx`, Zeilen
36, 57, 78, 92, 114, 123, 166, 169, 172: jedes `<Field htmlFor="k…">` steht um
ein `<AccountField>` **ohne** `id`. Die Prop, die diese Aufgabe eingeführt hat
(`AccountField.tsx:186`), wird von keinem einzigen Aufrufer gesetzt. Gemessen
in `v3-entitäten-konto-accountfield--with-candidates`: `label[for="k"]`, aber
`document.getElementById("k")` ist `null`, die Eingabe hat keine id,
`input.labels.length` = **0**, und ein echter Mausklick auf „Konto" lässt den
Fokus auf `body`. Dasselbe in `--full-text-only` (`k2`), `--no-match` (`k3`),
`--invalid` (`k4`), `--with-ledger` (`k5`, `k6`) und `--number-and-name`
(`k7`, `k8`, `k9`). Der Mangel ist von der Messung des Bauenden nicht
gefunden worden, weil sein Prüfsatz `aria-label` als Ersatz gelten lässt — und
`AccountField` setzt `ariaLabel = "Konto"` als Vorgabe (`AccountField.tsx:60`).
Damit ist genau der Zustand stehen geblieben, gegen den die Aufgabe angetreten
ist, nur eine Etage tiefer. `tsc` fängt ihn nicht: `id` ist an `AccountField`
optional — und muss es bleiben, weil `JournalEntryEditor.tsx:603` den Baustein
ohne `Field` benutzt.

**M2 — der Fallweg von `Combobox` hat keine Story.** Das Kriterium verlangt
„Story ohne `name`, `labels.length === 1`". Alle 13 `<Combobox>` im Repo
setzen ein `name` (`Combobox.stories.tsx:29–201`, `CaseCrud.stories.tsx:364`),
also läuft `const fieldId = name ?? autoId` (`Combobox.tsx:67`) in keiner
Story über den `useId`-Zweig. Für `AmountInput` ist derselbe Zweig gemessen
(`id="_r_0_"`), für `Combobox` ist er nur gelesen. Eine Story ohne `name`
schließt die Lücke.

### Befunde (keine Mängel dieser Aufgabe)

1. **Das Wort des Zeitraums erreicht keine Vorlesehilfe** — auch nicht das
   „von"-Feld. Aus dem Barrierefreiheits-Baum (`Accessibility.getPartialAXTree`,
   `datefield--filled`): die „von"-Eingabe hat `labels` 1 mit dem Text
   „Zeitraum", ihr zugänglicher Name ist aber **„Von"**, weil `aria-label` die
   Label-Beziehung **überschreibt** (`superseded: true` an der Quelle
   `relatedElement` mit dem Wert „Zeitraum"). Der Klick trägt also, der Name
   nicht: die Vorlesehilfe sagt „Von" und „Bis", nie „Zeitraum". Das ist kein
   Rückschritt — vor der Aufgabe war es ebenso —, aber 0106 muss den **Namen**
   der Gruppe lösen, nicht nur die Rolle.
2. **Zwei Bausteine setzen das Feldwort als `div`, nicht als `label`.**
   `InlineEdit.tsx:106` und `:127` sowie `FileDrop.tsx:117` rendern
   `<div className="v2field__label">`. Gemessen in
   `v3-primitives-formular-inlineedit--filled` nach Klick auf „Bearbeiten":
   die Eingabe hat keine id, kein `aria-label` und `labels.length` = 0,
   während „Zusammenfassung" daneben steht. Dieselbe Krankheit wie B4 aus
   0019, nur außerhalb von `Field` — der Prüfsatz `.v2field input` findet sie
   nicht (die Hülle heißt `.v2iedit`, und die Eingabe entsteht erst nach einem
   Klick). Gehört in eine eigene Aufgabe oder als Nachtrag in diese.
3. **Ein Suchfeld lebt vom Platzhalter.** `AppShell.stories.tsx:51` gibt der
   Kopfzeile `<Input type="search" placeholder="Belege, Mandanten, Konten
   suchen …" />` ohne jedes Wort — vier Stories, gemessen ohne Beschriftung.
   T8 sagt: Placeholder ist kein Label.
4. **Die App hat ihre eigene Kopie von `Field`.** `ludwig/app`
   `apps/web/src/ui/v2/primitives/Form.tsx` ist nicht dieses `Field`; dort
   stehen über 40 `<Field label="…">` ohne `htmlFor` (u. a.
   `configuration/logs/page.tsx:105–138`, `admin/audit-log/page.tsx`,
   `RuleEditorForm.tsx`). Die Pflicht-Prop bricht die App heute **nicht** —
   sie wird bei der Migration fällig, und dann in einem Zug mit denselben
   Slugs.
5. **`Input` und `Textarea` in `Form.tsx` tragen kein `@when`/`@instead`**
   (`Form.tsx:61` und `:65`), `Field` und `Select` schon. Bestand, von dieser
   Aufgabe weder verursacht noch verschlimmert.

### Zum „bis"-Feld: trägt die Begründung?

Ja, für den Teil, den sie behauptet — und sie ist unvollständig. Ein `<label>`
kann wirklich nur auf ein Bedienelement zeigen; ein zweites Wort gibt es
nicht, und `role="group"` mit `aria-labelledby` ist die saubere Form. Dass
diese Gruppe zu 0106 gehört, ist richtig geschnitten.

Unvollständig ist die Zeile „das Wort bindet an ‚von', ‚bis' behält sein
`ariaLabel`": gemessen bindet das Wort an „von", **wird dort aber vom
`aria-label` überschrieben** (Befund 1). Der Zeitraum hat nach dieser Aufgabe
also weiterhin keinen Namen — „Zeitraum" steht im Blatt und nirgends sonst.
Lösbar wäre das hier gewesen, ohne auf die Gruppe zu warten: ein
`aria-labelledby` an beiden Eingaben, das auf das vorhandene Label und das
Wörtchen „bis" zeigt, ergibt „Zeitraum Von" und „Zeitraum bis" — zwei Zeilen,
kein neues Muster. Nötig ist es nicht, solange 0106 zügig folgt; die Spec
sollte den Satz aber richtigstellen, damit 0106 die Aufgabe nicht für halb
erledigt hält.

Abgenommen von / am: **nicht abgenommen**, Claude (Abnahme-Agent), 2026-09-06
· Status zurück auf `in Arbeit`, zwei Mängel: neun tote Bindungen in den
`AccountField`-Stories (M1) und die fehlende Story ohne `name` für `Combobox`
(M2). Der Kern der Aufgabe trägt: `Field.htmlFor` ist Pflicht und im Typ
belegt, `AmountInput` und `Combobox` binden sich selbst, kein Aufrufer hat
seinen `name` verloren, keine doppelte id im ganzen Set.

## Die zwei Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — neun Kontofelder blieben ungebunden.** `AccountField.stories.tsx`
trug an neun Stellen ein `<Field htmlFor="k…">`, das ins Leere zeigte: die
Bindung war **vorher schon da**, deshalb hat sie der Durchgang übersprungen,
der die 41 fehlenden gesetzt hat. Ein `htmlFor` ohne Gegenstück ist aber kein
kleinerer Fehler als gar keins — `input.labels` war leer, und der Klick aufs
Wort landete auf `body`. Jetzt trägt jedes der neun `AccountField` die id
seiner Hülle; gemessen: `for="k"`, `id="k"`, `labels` 1, Klick setzt den
Fokus.

Die Lehre steht im Verfahren, nicht im Code: **wer eine Prop zur Pflicht
macht, prüft auch die Stellen, die sie schon hatten.** Der Typ sagt nur, dass
etwas dasteht, nicht dass es trifft.

**M2 — der `useId`-Weg der `Combobox` war in keiner Story zu sehen.** Alle 13
Aufrufe setzten ein `name`. `Empty` steht jetzt ohne — die Story, in der
ohnehin nichts gewählt und nichts abgeschickt wird. Gemessen: `id="_r_0_"`,
kein `name`, `labels` 1.

## Korrigiert: das „bis"-Feld, und was der Zeitraum wirklich heißt

Die Spec sagte, das Wort binde an das „von"-Feld. Der Prüfer hat im
Barrierefreiheits-Baum nachgesehen: das `aria-label="Von"` **überschrieb** die
Label-Beziehung (`superseded: true`), und der Zeitraum hatte damit gar keinen
Namen — nur „Von" und „Bis".

`DateRangeField` gibt sein `ariaLabel="Von"` jetzt nur noch, wenn es **ohne**
`id` steht, also allein. Mit Hülle gewinnt das Wort: gemessen heißt das erste
Feld „Zeitraum", das zweite „Bis". Die saubere Form — eine Gruppe mit
`aria-labelledby` — bleibt 0106, aber sie beginnt nicht mehr bei null.

## Mitgenommen: dieselbe Krankheit außerhalb von `Field`

Der Prüfer hat zwei Stellen gefunden, die das Feldwort als `div` setzen:

- **`InlineEdit`** — im Bearbeiten-Modus hatte die Eingabe weder id noch
  `aria-label` noch Label. Das Wort ist dort jetzt ein `<label htmlFor>`, die
  Eingabe bekommt die id, und `renderInput` reicht sie durch (neue Pflicht in
  `InlineEditInputProps`, damit ein eigenes Feld sie nicht vergisst). Im
  Ruhezustand bleibt es ein `div` — dort gibt es kein Feld. Gemessen in
  `InlineEdit --interactive`: „Belegart", `for` und `id` gleich, `labels` 1.
- **`FileDrop`** — hier ist es richtig so: das `<input type="file">` ist
  verborgen, bedient wird die Zone, und die trägt ihr Wort selbst. Damit eine
  Vorlesehilfe hört, **wofür** die Zone da ist, hängt die Überschrift jetzt
  als `aria-describedby` am Knopf, neben dem Hinweis.

## Abnahmekriterien (Nachtrag)

- [ ] Kein `<Field htmlFor="x">` ohne ein Bedienelement mit `id="x"` (`AccountField --*`, im DOM gemessen)
- [ ] Eine `Combobox` **ohne** `name` ist in einer Story zu sehen und gebunden (`Combobox --empty`)
- [ ] Der Zeitraum heißt „Zeitraum", nicht „Von" (Barrierefreiheits-Baum, `DateField --filled`)
- [ ] `InlineEdit` bindet sein Wort im Bearbeiten-Modus (`--interactive`)
- [ ] `renderInput` bekommt die id und kann sie nicht vergessen (Typ)
