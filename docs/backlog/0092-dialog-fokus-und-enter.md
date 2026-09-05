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

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Enter bestätigt, wenn `onConfirm` gesetzt ist — und **nicht** im `textarea`, nicht auf einem Knopf (Story `EnterConfirms`)
- [ ] Ein Kind mit `autoFocus` behält den Fokus; die `CommandPalette` ist im Browser bedienbar, ohne die Maus (Story `AutoFocusChild`, dazu `CommandPalette --filled`)
- [ ] Tab bleibt im Dialog, in beide Richtungen (Story `KeyboardTrap`)
- [ ] Beim Schließen kehrt der Fokus auf den Auslöser zurück (Dialog **und** Drawer)
- [ ] Der Fokus kommt beim Öffnen des Drawers **in** den Drawer (`Drawer --in-use`)
- [ ] Das Kreuz des Dialogs ist ein `IconButton`; `grep` findet kein `v2dlg__close`
- [ ] Die drei neuen Stories stehen unter `v3/Primitives/Dialog/Dialog`
