# 0092 · Dialog: Fokusfalle und Enter

| | |
|---|---|
| Status | offen |
| Stufe | `primitives/` |
| Quelle | Abnahme 0004 ActionButton (2026-09-05, Mangel M2) · Abnahme 0034 shadcn-Abgleich, die die Aufgabe „Dialog auf natives `<dialog>`" nennt, ohne dass es sie gibt · Abnahme Paket 0010/0011/0012/0035/0036 (Dialog baut sein Kreuz von Hand, während Drawer den `IconButton` nutzt) |
| Auftrag | Drei Dinge am selben Baustein, die drei Abnahmen unabhängig gefunden haben. **(a) Enter bestätigt nicht.** `Dialog.tsx` kennt in seinem Tastatur-Effekt nur `Escape`; Regel I2 verlangt Enter für die Bestätigung. Nachgeprüft in der Abnahme von 0004: Dialog offen, Fokus auf dem Panel, echtes Enter → `keydown` kommt an, der Dialog bleibt offen, die Handlung läuft nicht. **(b) Keine Fokusfalle.** Der Fokus kann aus dem offenen Dialog heraus wandern. **(c) Das Kreuz ist ein rohes `<button className="v2dlg__close">`, während `Drawer` denselben Knopf über `IconButton` baut — zwei Mechaniken für dieselbe Handlung. |
| Zu entscheiden | Trägt der Umbau auf das native `<dialog>`-Element? Es bringt Fokusfalle, Inertierung des Hintergrunds und Escape mit, ohne dass wir sie bauen — und es ändert das Markup jeder Bestätigung im Set. 0034 hat den Vorschlag gemacht; entschieden ist er nicht. Und: gilt Enter auch, wenn der Fokus in einem Textfeld im Dialog steht? |
| Warum eine eigene Aufgabe | (a) und (b) betreffen **jede** Bestätigung im Set, nicht `ActionButton`; die Abnahme von 0004 hat sie deshalb ausdrücklich hierher verwiesen. Der Umbau auf `<dialog>` ist ein Markup-Wechsel mit eigener Abnahme. |
| Betroffen | `Dialog`, `ReasonDialog`, `StatusInfoDialog`, `ActionButton confirm` — alles, was eine Bestätigung zeigt |
| Angelegt von / am | Claude, 2026-09-05 (aus drei Abnahmen) |
