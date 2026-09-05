# 0092 · Dialog: Fokusfalle und Enter

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` |
| Quelle | Abnahme Paket 0023/0039/0040/0042/0044 (2026-09-05) — dort ist es der schwerste Einzelbefund · Abnahme 0004 ActionButton (2026-09-05, Mangel M2) · Abnahme 0034 shadcn-Abgleich, die die Aufgabe „Dialog auf natives `<dialog>`" nennt, ohne dass es sie gibt · Abnahme Paket 0010/0011/0012/0035/0036 (Dialog baut sein Kreuz von Hand, während Drawer den `IconButton` nutzt) |
| Auftrag | Drei Dinge am selben Baustein, die drei Abnahmen unabhängig gefunden haben. **(a) Enter bestätigt nicht.** `Dialog.tsx` kennt in seinem Tastatur-Effekt nur `Escape`; Regel I2 verlangt Enter für die Bestätigung. Nachgeprüft in der Abnahme von 0004: Dialog offen, Fokus auf dem Panel, echtes Enter → `keydown` kommt an, der Dialog bleibt offen, die Handlung läuft nicht. **(b) Keine Fokusfalle.** Der Fokus kann aus dem offenen Dialog heraus wandern. **(c) Das Kreuz ist ein rohes `<button className="v2dlg__close">`, während `Drawer` denselben Knopf über `IconButton` baut — zwei Mechaniken für dieselbe Handlung. |
| Zu entscheiden | Trägt der Umbau auf das native `<dialog>`-Element? Es bringt Fokusfalle, Inertierung des Hintergrunds und Escape mit, ohne dass wir sie bauen — und es ändert das Markup jeder Bestätigung im Set. 0034 hat den Vorschlag gemacht; entschieden ist er nicht. Und: gilt Enter auch, wenn der Fokus in einem Textfeld im Dialog steht? |
| Warum eine eigene Aufgabe | (a) und (b) betreffen **jede** Bestätigung im Set, nicht `ActionButton`; die Abnahme von 0004 hat sie deshalb ausdrücklich hierher verwiesen. Der Umbau auf `<dialog>` ist ein Markup-Wechsel mit eigener Abnahme. |
| **(d) Nachtrag 2026-09-05, Abnahme Paket F** | Der Fehler ist schlimmer als „keine Fokusfalle": **`Dialog` reißt jedem Kind den Erstfokus weg.** `Dialog.tsx:47` fokussiert die Fläche, **nachdem** `autoFocus` des Kindes gegriffen hat. Gemessen an der `CommandPalette`: nach `⌘K` steht der Fokus auf `div.v2dlg` statt im Suchfeld (bei 20, 100, 300, 1000 und 2500 ms nachgesehen), Getipptes landet nirgends, `Tab` führt aufs Schließen-Kreuz und `Enter` schließt die Palette. Der Hauptweg per Tastatur ist damit ohne Maus nicht erreichbar (V11/V14) — und das trifft jeden künftigen Dialog mit einem Feld darin, nicht nur die Palette. |
| **(e) Dieselbe Klasse im `Drawer`** | `Drawer.tsx:83–86` holt den Fokus beim Öffnen **nicht** in den Drawer: `panel.current` ist im `requestAnimationFrame` noch `null`, `activeElement` bleibt der Auslöser. Andere Ursache, gleiche Wirkung — und es ist genau der Zugewinn, mit dem Spec 0042 den Umzug begründet. Gehört in dieselbe Aufgabe, weil beide Bausteine dieselbe Frage beantworten müssen: wer bekommt den Fokus, wann, und wer gibt ihn zurück. |
| Betroffen | `Dialog`, `Drawer`, `CommandPalette`, `ReasonDialog`, `StatusInfoDialog`, `ActionButton confirm` — alles, was etwas über die Seite legt |
| Angelegt von / am | Claude, 2026-09-05 (aus drei Abnahmen) |

## Gebaut am 2026-09-05

Alle fünf Punkte behoben, jeder im Browser nachgemessen statt behauptet.

| # | Mangel | Behoben durch | Nachweis |
|---|---|---|---|
| a | Enter bestätigt nicht (I2) | Neue Prop `onConfirm`. Ohne sie tut Enter nichts — der Dialog kann seine Hauptaktion nicht raten, und `footer` ist ein beliebiger Knoten. Enter greift **nicht** in einem `<textarea>` (dort ist es der Zeilenumbruch) und nicht auf einem Knopf oder Link (dort ist es deren eigener Klick) | Story `EnterConfirms`: Zähler 0 → 1 nach einem `keydown Enter`, Dialog schließt |
| b | `Dialog` reißt jedem Kind den Erstfokus weg | Der Dialog fokussiert die Fläche nur noch, **wenn der Fokus nicht schon in ihm liegt**. Vorher lief die Zeile nach `autoFocus` des Kindes und zog ihn zurück | `CommandPalette --filled` im Browser: nach dem Öffnen ist `activeElement` das Suchfeld (`input.v2in.v2cmd__in`), Getipptes landet dort („kredit" → ein Treffer), der Fokus bleibt |
| c | Keine Fokusfalle | `trapTab()`: Tab am letzten Haltepunkt springt auf den ersten, Shift-Tab am ersten auf den letzten. Unsichtbare Elemente zählen nicht mit | Story `KeyboardTrap` |
| d | Das Kreuz ist ein rohes `<button>` | `IconButton` mit `ActionIcon action="close"` — dieselbe Mechanik wie im `Drawer` | `Dialog.tsx`, `grep`: kein `v2dlg__close` mehr |
| e | Der `Drawer` holt den Fokus beim Öffnen nicht herein | Der Fokus wird jetzt in einem eigenen Effekt gesetzt, der auf `render` hört statt im `requestAnimationFrame` zu stehen. Dort war `panel.current` noch `null`: React hatte den Render nicht committet, der Aufruf lief ins Leere | `Drawer --in-use` im Browser: nach dem Öffnen ist `activeElement` das `<aside class="v2drawer v2drawer--lg">`, nach Esc wieder der Auslöser |

**Nebenbei behoben:** der Dialog gab den Fokus beim Schließen gar nicht
zurück — er merkt sich jetzt den Auslöser wie der Drawer und setzt ihn beim
Schließen zurück.

**Nicht gebaut:** der Umbau auf das native `<dialog>`-Element. Er stand als
Frage in dieser Aufgabe und wäre der größere Wurf — Fokusfalle, Inertierung
und Escape kämen vom Browser. Er ändert aber das Markup jeder Bestätigung im
Set und gehört deshalb entschieden, nicht nebenbei gemacht. Die drei Mängel
sind ohne ihn behoben; wer ihn später will, wirft `trapTab()` und die zwei
Effekte weg, nicht mehr.

## Abnahmekriterien

- [x] `pnpm typecheck` und `pnpm build` grün
- [x] Enter bestätigt, wenn `onConfirm` gesetzt ist — und **nicht** im `textarea`, nicht auf einem Knopf (Story `EnterConfirms`)
- [x] Ein Kind mit `autoFocus` behält den Fokus; die `CommandPalette` ist im Browser bedienbar, ohne die Maus (Story `AutoFocusChild`, dazu `CommandPalette --filled`)
- [x] Tab bleibt im Dialog, in beide Richtungen (Story `KeyboardTrap`)
- [ ] Beim Schließen kehrt der Fokus auf den Auslöser zurück (Dialog **und** Drawer) — **offen, siehe M1/M2**
- [x] Der Fokus kommt beim Öffnen des Drawers **in** den Drawer (`Drawer --in-use`)
- [x] Das Kreuz des Dialogs ist ein `IconButton`; `grep` findet kein `v2dlg__close`
- [x] Die drei neuen Stories stehen unter `v3/Primitives/Dialog/Dialog`

## Abnahme (2026-09-05)

Zweiter Agent, gelesen wurden Spec und Code. Storybook auf
`http://localhost:6107`; jeder der fünf Punkte in einer eigenen
Chromium-Sitzung nachgemessen — echte Tastendrücke, ausgelesen wurden
`document.activeElement`, die Zahl der `[role=dialog]` und die Feldinhalte.

| Kriterium | Nachweis (Story-ID · Datei:Zeile · Messung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` nicht erneut gelaufen (parallele Sitzung baut); der Lauf für diesen Stand war grün | ✓ |
| Enter bestätigt, wenn `onConfirm` gesetzt ist | `--enter-confirms`: nach dem Öffnen steht der Fokus auf `div.v2dlg v2dlg--sm`, echtes `Enter` → Zähler „0× bestätigt" → „1× bestätigt", Dialog und Scrim beide weg (`Dialog.tsx:104-107`) | ✓ |
| … und **nicht** im `textarea` | `--enter-confirms` mit einem zur Laufzeit in `.v2dlg__body` gesetzten und fokussierten `<textarea>`: `Enter` → Zähler bleibt „1×", Dialog bleibt offen, das Feld bekommt den Zeilenumbruch (`"x\n"`). Gegenprobe `--keyboard-trap`: `Enter` im Grund-Feld → Dialog steht, Feld `"Grund\n"`. Dass beides zur Laufzeit gebaut werden musste, ist ein Befund, siehe B1 | ✓ |
| … und nicht auf einem Knopf | `--enter-confirms`, Fokus auf „Abbrechen", echtes `Enter` → Dialog zu, Zähler **unverändert** „1×" (nur der Klick des Knopfes lief, `onConfirm` nicht). Fokus auf dem Primärknopf „Freigeben" → Zähler „1×" → „2×", also **genau ein** Zuwachs, nicht zwei (`confirmsOnEnter`, `Dialog.tsx:52-56`) | ✓ |
| Ein Kind mit `autoFocus` behält den Fokus | `--auto-focus-child`: `activeElement` ist bei 30, 200 und 800 ms `input.v2in`, Getipptes landet dort („Konto 1210"). **Harter Nachweis** `v3-patterns-frame-commandpalette--filled`: `activeElement === document.querySelector('.v2cmd__in')` bei 20, 100, 300, 1000 und 2500 ms; ohne vorherigen Klick „kredit" getippt → steht im Feld, die Liste geht von 7 Einträgen auf 1 („Geschäftspartner · Kreditoren und Debitoren"), der Fokus bleibt im Feld, `Tab` führt in die Liste (`a.v2cmd__jump`), nicht aufs Kreuz. Der schwerste Einzelbefund der Abnahme von Paket F ist behoben (`Dialog.tsx:116-117`) | ✓ |
| Tab bleibt im Dialog, in beide Richtungen | `--keyboard-trap`, vier Haltepunkte (Schließen · Grund-Feld · Abbrechen · Weiter). 8× `Tab` läuft zweimal sauber im Kreis, 8× `Shift+Tab` ebenso rückwärts; in **keinem** der 16 Schritte liegt `activeElement` außerhalb von `.v2dlg`. `Shift+Tab` direkt von der Fläche springt auf „Weiter", also den letzten Haltepunkt (`trapTab`, `Dialog.tsx:30-46`) | ✓ |
| Beim Schließen kehrt der Fokus auf den Auslöser zurück — **Drawer** | `--in-use`: Escape → `activeElement === document.querySelector('#storybook-root button')`, der Drawer ist aus dem DOM. Über den Fußzeilen-Knopf „Schließen" dasselbe (`Drawer.tsx:87-88`) | ✓ |
| Beim Schließen kehrt der Fokus auf den Auslöser zurück — **Dialog** | Nur, solange kein Kind den Erstfokus nimmt. `--confirmation` (kein `autoFocus`-Kind): Escape → Fokus zurück auf den Auslöser ✓. `--auto-focus-child`: per Tastatur geöffnet, Escape → `activeElement` ist `body`, der Auslöser steht unverändert im DOM — in zwei Runden gleich. Dasselbe im Einsatz: `ReasonDialog` aus `v3-entitäten-klärung-clarificationcard--antworten` → Escape → `body`. Siehe **M1** | ✗ |
| Der Fokus kommt beim Öffnen **in** den Drawer | `--in-use`: nach dem Klick ist `activeElement === document.querySelector('aside.v2drawer')` bei 50, 200 und 500 ms — die Klasse lautet `v2drawer v2drawer--lg is-open`. Auch im Einsatz: `AccountDrawer --im-kontext` und `--geoeffnet` fokussieren das `<aside>` (`Drawer.tsx:102-106`) | ✓ |
| Das Kreuz des Dialogs ist ein `IconButton` | `Dialog.tsx:144` rendert `<IconButton label="Schließen" icon={<ActionIcon action="close" size={16} />} …>`; im DOM `button.v2ibtn.v2ibtn--md` mit `aria-label="Schließen"`, dieselbe Mechanik wie `Drawer.tsx:139-143`. `grep -rn "v2dlg__close" src/` → nur noch die verwaiste Regel in `src/styles/v3.css:776-781`, siehe B2 | ✓ |
| Die drei neuen Stories stehen unter `v3/Primitives/Dialog/Dialog` | `/index.json`: `--enter-confirms`, `--auto-focus-child`, `--keyboard-trap`, alle mit `title: "v3/Primitives/Dialog/Dialog"` (`Dialog.stories.tsx:7`) | ✓ |
| Nichts kaputt gemacht: `StatusInfoDialog` | `--entry`: Fläche fokussiert, Titel „Buchung", 4× `Tab` bleibt im Dialog, Escape gibt an den (in der Story leeren) `onClose` weiter | ✓ |
| Nichts kaputt gemacht: `ReasonDialog` | `--open`: der Fokus steht im Grund-Feld (`textarea.v2in`), Getipptes kommt an, `Enter` bleibt der Zeilenumbruch, 7× `Tab` bleibt im Dialog. **Aber:** im Einsatz (`ClarificationCard --antworten`) fällt der Fokus beim Schließen auf `body`, siehe M1. Nebenbefund B3: `ReasonDialog` reicht kein `onConfirm` an `Dialog` durch — Enter bestätigt dort also nie | ✓ / ✗ (M1) |
| Nichts kaputt gemacht: `AccountDrawer` | `--im-kontext` und `--geoeffnet`: öffnen fokussiert das `<aside>`, Escape schließt. **Aber:** der Fokus kehrt nicht auf den Auslöser zurück, weil die Aufrufstelle den Drawer aushängt statt `open` umzulegen, siehe **M2** | ✗ |

Abgenommen von / am: — · Zurück auf **in Arbeit** mit zwei Mängeln:

**M1 — Der Dialog gibt den Fokus nicht zurück, sobald ein Kind ihn beim
Öffnen bekommt.** `Dialog.tsx:93` merkt sich den Auslöser **im Effekt** —
also erst, nachdem React beim Commit das `autoFocus` des Kindes gesetzt hat.
`opener.current` ist dann das Feld *im* Dialog, nicht der Knopf davor. Beim
Schließen fokussiert `Dialog.tsx:89` einen Knoten, den React gerade entfernt,
und der Fokus fällt auf `<body>`.

Gemessen: `--auto-focus-child`, per Tastatur geöffnet, Escape → `activeElement`
ist `body`, der Auslöser steht unverändert im DOM; zwei Runden, zweimal
gleich. Gegenprobe `--confirmation` ohne `autoFocus`-Kind: Fokus zurück auf
dem Auslöser. Im Einsatz trifft es den `ReasonDialog`
(`ClarificationCard --antworten` → „Ohne Antwort auflösen" → Escape → `body`)
und damit jede Rückgabe, jedes Storno mit Begründung: nach dem Abbrechen
beginnt die Tastatur wieder oben auf der Seite (V10/V11).

Der `Drawer` hat den Fehler nicht, weil er in zwei Schritten rendert: sein
Effekt liest den Auslöser, **bevor** `render` das Panel überhaupt einhängt
(`Drawer.tsx:81-83`). Die `CommandPalette` hat ihn nicht, weil sie sich seit
0034 einen eigenen Auslöser-Merker hält und ihn ausdrücklich **während des
Renderns** setzt (`CommandPalette.tsx:71-84`, Kommentar: „`Dialog` sets the
first focus but does not return it") — genau die Krücke, die diese Aufgabe
überflüssig machen wollte. Der Weg ist dort schon aufgeschrieben: den
Auslöser während des Renderns lesen, nicht im Effekt. Danach kann der Merker
in `CommandPalette` weg, und das gehört zur Behebung dazu — sonst bleiben
zwei Mechaniken für dieselbe Sache stehen, was Punkt (c) dieser Aufgabe
gerade beseitigt hat.

**M2 — Wer das Overlay aushängt, statt `open` umzulegen, verliert den Fokus
still.** Beide Bausteine geben den Fokus nur im `!open`-Zweig ihres Effekts
zurück (`Dialog.tsx:86-91`, `Drawer.tsx:86-88`); beim Unmount läuft nur das
Aufräumen des Listeners. Zwei Aufrufstellen im Set machen genau das:
`AccountDrawer.stories.tsx:263` (`{account ? <AccountDrawer open … /> : null}`)
und `ClarificationCard.tsx:307` (`{onResolve ? <ReasonDialog … /> : null}`).
Gemessen an `AccountDrawer --im-kontext`: „ansehen" → Fokus im `<aside>` ✓,
Escape → `body`, obwohl der Auslöser noch dasteht.

Zu entscheiden ist, wo die Regel hingehört: den Fokus auch beim Aufräumen
zurückgeben (dann ist die Aufrufstelle frei) oder das Muster
„immer montiert lassen, nur `open` schalten" in das JSDoc von `Dialog` und
`Drawer` schreiben und die zwei Aufrufstellen nachziehen. Der Entscheid
gehört in diese Aufgabe — sie ist die, die beantwortet, „wer bekommt den
Fokus, wann, und wer gibt ihn zurück".

### Befunde (kein Mangel)

- **B1 — Keine Story stellt `onConfirm` und ein `textarea` zusammen.**
  `--enter-confirms` hat kein Feld, `--keyboard-trap` kein `onConfirm`; der
  interessante Fall — Enter im Feld eines Dialogs, der bestätigen *könnte* —
  musste zur Laufzeit gebaut werden. Das Kriterium nennt `EnterConfirms` als
  Nachweis; ein Feld in dieser Story würde ihn tragen.
- **B2 — `.v2dlg__close` steht noch in `src/styles/v3.css:776-781`,** ohne
  dass es jemand rendert. Beim nächsten Anfassen des Stylesheets weg.
- **B3 — `ReasonDialog` reicht kein `onConfirm` durch** (`ReasonDialog.tsx:60-66`).
  Der Baustein, der die neue Prop am ehesten braucht — I2: „Enter bestätigt" —
  ist der einzige Dialog-Aufrufer, der sie nicht setzt. Ob Enter bei einem
  Pflichtgrund überhaupt bestätigen soll (Fokus steht dort im `textarea`,
  Enter bleibt also ohnehin der Umbruch), ist eine echte Frage; sie gehört
  beantwortet, nicht übergangen.

## Die zwei Mängel — behoben, und der Entscheid dazu

**Entschieden:** der Fokus wird **beim Aufräumen** zurückgegeben. Die
Alternative — „immer montiert lassen, nur `open` schalten" ins JSDoc schreiben
und die Aufrufstellen nachziehen — verlagert eine Regel, die niemand sieht, in
jede Aufrufstelle und wartet darauf, dass die nächste sie nicht kennt.
`{x ? <Drawer open … /> : null}` ist die naheliegende Schreibweise; sie darf
nicht die falsche sein.

**M1 — der Auslöser wurde zu spät gelesen.** `document.activeElement` im
Effekt heißt: nach dem Commit, also nachdem React das `autoFocus` eines Kindes
schon gesetzt hat. Gemerkt wurde damit das Feld **im** Dialog, und der Weg
zurück führte in den gerade geschlossenen Dialog.

Jetzt steht die Frage dort, wo die Antwort noch stimmt: **beim Rendern** des
öffnenden Bildes, über einen `wasOpen`-Merker. Dasselbe Muster hatte
`CommandPalette` sich seit 0034 selbst gebaut — diese Krücke ist mit entfallen,
die Palette hält keinen eigenen Auslöser mehr.

Der Merker startet auf `false`, nicht auf `open`: ein Dialog, der schon im
ersten Bild offen ist, sähe sonst nie einen Wechsel — und genau so sind die
beiden Aufrufstellen aus M2 gebaut.

**M2 — beim Aushängen ging der Fokus still verloren.** Die Rückgabe stand im
`!open`-Zweig, den eine ausgehängte Komponente nie rendert. Sie steht jetzt im
Cleanup des Effekts, der beim Öffnen läuft — er greift in beiden Fällen.

Bewusst nur an `open` gebunden: `onClose` und `onConfirm` kommen meist als
frische Lambdas, und ein Cleanup bei jedem Render der Eltern risse den Fokus
aus einem Feld, in das gerade jemand tippt. Der Tastatur-Listener behält seinen
eigenen Effekt mit den Callbacks.

**Nachgemessen** (Chromium headless, 1440 × 900, je zwei Runden):

| Story | offen | nach Escape |
|---|---|---|
| `Dialog --auto-focus-child` | `input.v2in` — das Feld behält den Fokus | `button` „Mit Suchfeld öffnen" |
| `AccountDrawer --im-kontext` (hängt aus) | `aside.v2drawer` | `button.v2link` „ansehen" |
| `ClarificationCard --antworten` (hängt aus) | `textarea.v2in` | `button.v2link` „Ohne Antwort auflösen" |
| `CommandPalette --interactive` | `input.v2cmd__in` nach ⌘K | das Feld davor |

### Die drei Befunde

- **B1** — bleibt offen: eine Story, die `onConfirm` und ein `textarea`
  zusammenstellt, fehlt weiter. Sie gehört in `EnterConfirms`, und das ist
  Arbeit an der Story, nicht am Baustein.
- **B2** — erledigt: `.v2dlg__close` ist aus `v3.css` raus, an seiner Stelle
  steht ein Satz, warum.
- **B3** — beantwortet und gebaut: `ReasonDialog` reicht jetzt ein `onConfirm`
  durch, das dieselbe Sperre trägt wie sein Primärknopf (Pflichtgrund leer →
  Enter tut nichts). Die Frage, ob Enter im Pflichtfeld überhaupt bestätigen
  soll, beantwortet `Dialog` selbst: im `textarea` bleibt Enter der Umbruch.
  Der Weg ist also für den, der den Grund über die Vorschlags-Chips füllt und
  dann Enter drückt.

## Abnahmekriterien (Nachtrag)

- [ ] Ein Dialog mit `autoFocus`-Kind gibt den Fokus beim Schließen an den Auslöser zurück (Story `AutoFocusChild`, gemessen)
- [ ] Ein ausgehängter Dialog und ein ausgehängter Drawer tun dasselbe (`ClarificationCard --antworten`, `AccountDrawer --im-kontext`)
- [ ] `CommandPalette` hält keinen eigenen Auslöser-Merker mehr (`grep`)
- [ ] `ReasonDialog` bestätigt auf Enter, aber nicht bei leerem Pflichtgrund und nicht im `textarea`
- [ ] `.v2dlg__close` steht nicht mehr in `v3.css`
