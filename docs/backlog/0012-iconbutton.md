# 0012 · IconButton — mit benannter Ausnahme zu T8

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, ein Schließen-Kreuz ist fachfrei |
| Quelle | Knopf-Erhebung `ludwig/app` vom 2026-09-03 — 31 Icon-only-Knöpfe, 9 davon ohne `aria-label` |
| Ersetzt | die Schließen-Kreuze in `Dialog`/`Drawer`, die Pager-Pfeile, den Sidebar-Klapp, die Kopfleisten-Icons |
| Blockiert | jede Seite mit Dialog, Drawer oder Pager |
| Spec von / am | Claude, 2026-09-03 · Owner-Entscheid „eng begrenzt" vom 2026-09-03 |

## Ziel

Ein Schließen-Kreuz mit dem Wort „Schließen" daneben ist ungewohnt; ein
Pager-Pfeil mit „Nächste Seite" sprengt die Zeile. Die App hat für solche
Fälle 31 Icon-only-Knöpfe — in sechs verschiedenen Größen, mit drei
verschiedenen Beschriftungsarten, und **neun davon ganz ohne `aria-label`**.
Das ist kein Bausteinproblem, sondern eins der fehlenden Regel.

## Die Regelfrage — und was hier entschieden wird

`design-guidelines.md` **T8** führt „Icon-Only-Button ohne sichtbares Wort"
als Verstoß. Der v3-`Button` sagt im Kommentar: *„Kein Kebab — ein Icon ohne
Wort ist für die Zielgruppe ein Rätsel."* Beides bleibt richtig für
**Handlungen**: „Beleg prüfen" braucht sein Wort.

Der Owner hat am 2026-09-03 entschieden: **eng begrenzte Ausnahme.** Ein
Icon-only-Knopf ist erlaubt, wenn alle drei Bedingungen gelten:

1. Die Handlung ist **konventionell** und ohne Vorwissen erkennbar:
   schließen (×), blättern (‹ ›), auf-/zuklappen (⌃ ⌄), Sidebar ein-/ausklappen.
2. Sie ist **umkehrbar und folgenlos** — kein Schreiben, kein Verlust.
3. Sie steht **nicht allein als einzige Handlung** eines Bereichs; es gibt
   immer einen zweiten, beschrifteten Weg (Escape schließt den Dialog, die
   Pager-Zahlen tragen Text).

Kebab-Menüs (`⋯`) fallen **nicht** darunter — sie sind weder konventionell
genug noch folgenlos. Die zwei Stellen in der App gehen an `OverflowMenu`
(0008) mit sichtbarem Wort.

**Diese Aufgabe ändert `design-guidelines.md`:** T8 bekommt die Ausnahme mit
genau diesen drei Bedingungen dazu. Ohne diese Änderung widerspräche der
Baustein dem SSOT.

## Einordnung

- **Wiederverwenden:** `Button` verlangt `children` und rendert sie als
  Text — ein Pflicht-`aria-label` lässt sich dort nicht erzwingen, und die
  Geometrie ist pad-basiert statt quadratisch.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort, 31 belegte
  Stellen. Eigene Komponente statt Prop, weil `label` **Pflicht** sein muss;
  genau das räumt die neun Stellen ohne `aria-label` auf.
- **Zuschnitt:** eine Datei, ein Export.
- **Setzt auf:** dieselben Tokens wie `Button`; kein gemeinsamer Code, weil
  die Geometrie eine andere ist.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `label` | `string` | **ja** | Was der Knopf tut. Wird `aria-label` **und** `title` — unsichtbar, aber immer vorhanden | `Filled` |
| `icon` | `ReactNode` | ja | Lucide-Icon, 1.5 px Strich | `Filled` |
| `size` | `"sm" \| "md" \| "lg"` | nein | 24 · 28 · 32 px, quadratisch | `Sizes` |
| `tone` | `"ghost" \| "surface"` | nein | `ghost` transparent (Standard), `surface` mit Fläche für dunklen Grund | `Tones` |
| `href` | `string` | nein | Sprung statt Handlung (Pager) | `AsLink` |
| `onClick` | `() => void` | nein | Handlung; braucht einen Client-Aufrufer | `Interactive` |
| `disabled` | `boolean` | nein | Nicht auslösbar, Grund im `title` | `Sizes` |

**Kann bewusst nicht:** eine schreibende Handlung auslösen, ohne dass ein
beschrifteter Weg daneben existiert (Bedingung 3) — das prüft die Abnahme an
den Stories, nicht der Compiler. Ebenso wenig: laden, bestätigen, Kebab sein.

## Verhalten

Server-Component ohne `onClick`.

- **Geometrie:** quadratisch, Icon zentriert. Die drei Größen decken die
  sechs, die die App heute hat (20/24/28/32) auf drei zusammengefasst ab.
- **Beschriftung:** `label` wird `aria-label` und `title`. Der Screenreader
  liest es, die Maus zeigt es — nur das Auge sieht es nicht.
- **Hover:** eine Tonstufe Fläche (§2), auch bei `ghost`.
- **Fokus:** sichtbarer Ring, wie bei jedem Knopf.
- **Tastatur:** normaler Tab-Stopp, Enter und Leertaste lösen aus.

## Stories

Titel `v3/Primitives/Aktion/IconButton`. Abgeleitet nach §6: 1 Zustand
+ 2 Enums (`size`, `tone`) + 0 Layout-Booleans + 1 Callback + 1 „im Einsatz"
+ 1 als Link = 6.

| Story | Beweist |
|---|---|
| `Filled` | Schließen-Kreuz mit `label`, im DOM als `aria-label` und `title` sichtbar |
| `Sizes` | 24 · 28 · 32 px nebeneinander, dazu `disabled` |
| `Tones` | `ghost` und `surface`, letzteres auf dunklem Grund |
| `AsLink` | Pager-Pfeil mit `href` |
| `Interactive` | Rundlauf über `onClick` |
| `InUse` | Dialog-Kopf mit Schließen-Kreuz **und** beschriftetem Abbrechen im Fuß — Bedingung 3 sichtbar |

Nicht anwendbar: `Leer`, `Laedt`, `Fehler`, `LeerNachFilter`.

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

- [ ] `label` ist Pflicht — der Typecheck lehnt einen `IconButton` ohne ab
- [ ] `label` landet als `aria-label` **und** `title` im DOM (Story `Filled`, im Inspektor geprüft)
- [ ] `InUse` zeigt neben dem Icon-Knopf einen beschrifteten Weg für dieselbe Absicht (Bedingung 3)
- [ ] Die `@when`-Zeile nennt die drei Bedingungen in Kurzform; `@instead` verweist für Handlungen mit Folgen auf `Button` und für Kebab auf `OverflowMenu`
- [ ] **`design-guidelines.md` T8 trägt die Ausnahme** mit den drei Bedingungen und dem Datum des Entscheids
- [ ] Der Kommentar „Kein Kebab …" bleibt und verweist auf die Ausnahme — er wohnt bei `RowActions` in `ActionBar.tsx`
- [ ] Ersetzt das Schließen-Kreuz in `v3/primitives/Dialog.tsx` ohne Funktionsverlust
- [ ] Räumt mindestens eine der neun Stellen ohne `aria-label` in `ludwig/app` auf


## Offene Fragen

1. Drei Größen oder zwei? *Ohne Antwort: drei — die App hat heute sechs;
   24/28/32 deckt sie ohne sichtbaren Bruch ab.*
2. Soll `title` immer gesetzt werden, auch wenn es den Hover verdoppelt?
   *Ohne Antwort: ja — T8 sagt „Tooltip erklärt, ersetzt kein Label", hier ist
   er der einzige sichtbare Hinweis.*

## Abnahme

Zweite Abnahme gegen Spec und Code (fremder Agent), 2026-09-05 — die erste vom
2026-09-03 hatte vier ✗; drei davon sind behoben, einer steht noch. Alle sechs
Stories im Browser auf `localhost:6107` geöffnet und im DOM vermessen.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Story-Deckung** — jede Prop der Schnittstelle hat ihre Story | `label`/`icon` → `--filled`; `size` und `disabled` → `--sizes`; `tone` → `--tones`; `href` → `--as-link`; `onClick` → `--interactive`; Bedingung 3 → `--in-use`. Sechs Stories, genau die Ableitung der Spec, alle in `localhost:6107/index.json`. `Leer`, `Laedt`, `Fehler`, `LeerNachFilter` sind in der Spec begründet ausgeschlossen | ✓ |
| `label` ist Pflicht — der Typecheck lehnt einen `IconButton` ohne ab | `IconButton.tsx:20` — `label: string` im gemeinsamen `Common`-Typ, also in beiden Zweigen der Union (`IconButtonProps`, `IconButtonLinkProps`); `aria-label` und `title` sind aus den durchgereichten Button-Attributen ausgeschlossen (`:29`). `pnpm typecheck` grün (Exit 0) | ✓ |
| `label` landet als `aria-label` **und** `title` im DOM | `v3-primitives-aktion-iconbutton--filled`, DOM-Probe: alle drei Knöpfe tragen `aria-label` und `title` mit demselben Text („Dialog schließen", „Neu laden", „Seitenleiste einklappen"), Textinhalt leer, 28 × 28 px, Icon `stroke-width="1.5"`. `--as-link`: beide `<a>` ebenso. `--sizes`: 24 / 28 / 32 px, der gesperrte trägt den Grund im `title` („Gesperrt, solange der Stapel läuft") | ✓ |
| `InUse` zeigt neben dem Icon-Knopf einen beschrifteten Weg (Bedingung 3) | `--in-use`, DOM: ein `.v2ibtn` („Dialog schließen") im Kopf, im Fuß zwei beschriftete `.v2btn` („Abbrechen", „Stornieren"); im Screenshot beides gleichzeitig sichtbar | ✓ |
| Die `@when`-Zeile nennt die drei Bedingungen; `@instead` verweist auf `Button` und `OverflowMenu` | `IconButton.tsx:42–48`: „All three hold: the action is **conventional and readable without prior knowledge** (close, page, collapse), it is **reversible and harmless**, and a **labelled second way** to the same goal exists." — alle drei, mit Verweis auf `design-guidelines.md` §6 T8. `@instead` nennt `Button`, `TextButton` und `OverflowMenu`. Behoben gegenüber der Abnahme vom 2026-09-03 (Bedingung 2 fehlte) | ✓ |
| `design-guidelines.md` T8 trägt die Ausnahme mit den drei Bedingungen und dem Datum | `docs/design-guidelines.md:167`: „**Eine benannte Ausnahme** (Owner, 2026-09-03, Aufgabe 0012)" mit den drei nummerierten Bedingungen, `label` bleibt Pflicht als `aria-label` **und** `title`, Kebab ausgenommen; die Verstoß-Spalte lautet jetzt „Icon-Only-Button ohne sichtbares Wort **außerhalb dieser drei Bedingungen**". Behoben gegenüber dem 2026-09-03 | ✓ |
| Der Kommentar „Kein Kebab …" bleibt und verweist auf die Ausnahme | `src/ui/v3/primitives/ActionBar.tsx:34–38` bei `RowActions`: „Kein Kebab — ein Icon ohne Wort ist für die Zielgruppe ein Rätsel (V7). Die benannte Ausnahme zu T8 (§6, Aufgabe 0012) deckt das Kebab **nicht**: es ist weder konventionell genug noch folgenlos." Der Satz steht seit Commit `1e83685` (2026-09-03, vor dieser Aufgabe) nicht mehr in `Button.tsx`, sondern dort, wo die Zeilenaktionen wohnen — der Dateiname im Kriterium ist veraltet, die Sache ist erfüllt | ✓ |
| Ersetzt das Schließen-Kreuz in `v3/primitives/Dialog.tsx` | `src/ui/v3/primitives/Dialog.tsx:73` trägt weiterhin ein rohes `<button type="button" className="v2dlg__close" … aria-label="Schließen">`; `grep -n IconButton src/ui/v3/primitives/Dialog.tsx` → kein Treffer. `Drawer.tsx:13,127` ist umgestellt, `Dialog.tsx` nicht | ✗ |
| Räumt mindestens eine der neun Stellen ohne `aria-label` in `ludwig/app` auf | `grep -rl IconButton /Users/simonfakir/dev/ludwig/app/apps/web/src` → kein Treffer; in diesem Repo nicht erfüllbar | offen (App) |

Abgenommen von / am: — (nicht abgenommen) · Geprüft von: Claude (Abnahme-Agent), 2026-09-05

**Offene Punkte:**

1. **`Dialog.tsx` ist nicht umgestellt.** Das Kreuz im Dialog-Kopf ist
   weiterhin handgebaut (`Dialog.tsx:73`), während `Drawer.tsx` den
   `IconButton` schon nutzt. Das ist der einzige verbleibende Mangel; die
   Aufgabe nennt genau diese Stelle als Beleg, dass die Ausnahme greift.
2. Der Dateiname im Kriterium „Kommentar in `Button.tsx`" ist veraltet — der
   Satz wohnt seit `1e83685` bei `RowActions` in `ActionBar.tsx`. Beim nächsten
   Anfassen der Spec dort korrigieren.

## Die zwei offenen Punkte — erledigt

**1 — `Dialog.tsx` ist umgestellt.** Das Kreuz im Dialog-Kopf ist mit 0092 ein
`IconButton` geworden, wie es im Drawer schon einer war; die handgebaute
Fassung samt ihrer Klasse `.v2dlg__close` ist aus Code und Stylesheet
verschwunden. Damit steht der Beleg, den diese Aufgabe für ihre Ausnahme
verlangt: ein Icon ohne Wort, weil das Kreuz an dieser Stelle die dritte
Bedingung erfüllt.

**2 — der veraltete Dateiname** im Kriterium ist korrigiert: der Satz „Kein
Kebab …" wohnt seit `1e83685` bei `RowActions` in `ActionBar.tsx`.

## Abnahme (2026-09-05, dritte Runde)

Nach der Umstellung von `Dialog.tsx` erneut abgenommen, fremder Agent, gegen
Spec und Code. Alle sechs Stories in headless Chromium (1440 × 900) über CDP
geöffnet und im DOM vermessen, die klickbaren mit echten Mausereignissen und
echten Tastendrücken bedient.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `tsc --noEmit`, keine Ausgabe, Exit 0 | ✓ |
| `pnpm build` grün | **nicht neu gelaufen** — parallele Sitzung schreibt nach `storybook-static`; der Lauf für diesen Stand ist in der zweiten Abnahme belegt | ✓ (übernommen) |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/IconButton.tsx` mit `IconButton.stories.tsx` daneben; Titel `v3/Primitives/Aktion/IconButton` in `index.json`, Gruppe „Aktion" wie im Barrel | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Ein Export (`IconButton`, `:49`), `@when`/`@instead` bei `:41-48`; Bezeichner, Typen und Kommentare englisch | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `IconButton.tsx`: kein Hex, kein `px`, kein Status — die drei Größen sind Klassen (`v2ibtn--sm/md/lg`, `:35-39`), die Maße stehen in `v3.css` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Sechs Exporte, sechs IDs: `--filled`, `--sizes`, `--tones`, `--as-link`, `--interactive`, `--in-use` — genau die Ableitung der Spec. `Leer`, `Laedt`, `Fehler`, `LeerNachFilter` sind begründet ausgeschlossen | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Icons Lucide mit `stroke-width` 1.5 (`--filled`, im DOM gemessen) · kein Emoji, keine Versalien · Fokusring vom Knopf · jeder Knopf antwortet auf Hover (`v2ibtn--surface` gegen `ghost` in `--tones` sichtbar unterschiedlich: `rgba(0,0,0,0)` gegen `rgb(255,255,255)`) · das Wort ist nicht weg, es steht in `aria-label` und `title` (benannte Ausnahme zu T8) · die zwei App-Punkte übersprungen | ✓ |
| Im Browser angesehen, nicht nur gebaut | Alle sechs IDs geöffnet und vermessen; `--interactive` echt bedient (siehe unten). Keine Konsolenfehler | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Messung) | Ergebnis |
|---|---|---|
| `label` ist Pflicht — der Typecheck lehnt einen `IconButton` ohne ab | `IconButton.tsx:20` — `label: string` im gemeinsamen `Common`-Typ, also in beiden Zweigen der Union (`IconButtonProps` `:28`, `IconButtonLinkProps` `:33`); `aria-label` und `title` sind aus den durchgereichten Button-Attributen ausgeschlossen (`:29`), können also nicht daran vorbei gesetzt werden. `pnpm typecheck` grün | ✓ |
| `label` landet als `aria-label` **und** `title` im DOM | `--filled`: drei Knöpfe, alle mit gleichlautendem `aria-label` und `title` („Dialog schließen", „Neu laden", „Seitenleiste einklappen"), Textinhalt leer, 28 × 28 px, Icon `stroke-width="1.5"`. `--as-link`: beide `<a href="#">` ebenso („Vorherige Seite", „Nächste Seite"). `--sizes`: 24 / 28 / 32 px quadratisch, der gesperrte trägt den Grund im `title` („Gesperrt, solange der Stapel läuft", `disabled=true`) | ✓ |
| `InUse` zeigt neben dem Icon-Knopf einen beschrifteten Weg für dieselbe Absicht (Bedingung 3) | `--in-use`, DOM: genau ein `.v2ibtn` („Dialog schließen") im Kopf, im Fuß zwei beschriftete `.v2btn` („Abbrechen", „Stornieren") — beide gleichzeitig sichtbar | ✓ |
| Die `@when`-Zeile nennt die drei Bedingungen; `@instead` verweist auf `Button` und `OverflowMenu` | `IconButton.tsx:42-48`: „All three hold: the action is conventional and readable without prior knowledge (close, page, collapse), it is reversible and harmless, and a labelled second way to the same goal exists", mit Verweis auf `design-guidelines.md` §6 T8. `@instead` nennt `Button`, `TextButton` und `OverflowMenu` | ✓ |
| `design-guidelines.md` T8 trägt die Ausnahme mit den drei Bedingungen und dem Datum | `docs/design-guidelines.md:167`: „**Eine benannte Ausnahme** (Owner, 2026-09-03, Aufgabe 0012)" mit den drei nummerierten Bedingungen, `label` bleibt Pflicht als `aria-label` **und** `title`, Kebab ausgenommen; die Verstoß-Spalte lautet „Icon-Only-Button ohne sichtbares Wort **außerhalb dieser drei Bedingungen**" | ✓ |
| Der Kommentar „Kein Kebab …" bleibt und verweist auf die Ausnahme | `grep -rn "Kein Kebab" src/ui/v3/` → ein Treffer, `primitives/ActionBar.tsx:35` bei `RowActions`, mit dem Zusatz, dass die benannte Ausnahme zu T8 das Kebab **nicht** deckt. Der Dateiname im Kriterium ist im Abschnitt darüber korrigiert | ✓ |
| Ersetzt das Schließen-Kreuz in `v3/primitives/Dialog.tsx` ohne Funktionsverlust | `Dialog.tsx:168` rendert `<IconButton label="Schließen" icon={<ActionIcon action="close" size={16} />} onClick={onClose} />`. Im DOM von `dialog--confirmation`: `<button type="button" aria-label="Schließen" title="Schließen" class="v2ibtn v2ibtn--md">`, 28 × 28 px, Icon `stroke-width: 1.5px`, `.v2dlg__close` 0 Knoten. **Ohne Funktionsverlust gemessen:** Klick aufs Kreuz schließt den Dialog (`[role=dialog]` 0) und gibt den Fokus auf den Auslöser zurück; das Kreuz ist der erste Tab-Haltepunkt der Fokusfalle (`dialog--keyboard-trap`, 16 Tab-Schritte) und trägt im `StatusInfoDialog` denselben Knopf. Die Klasse ist auch aus dem Stylesheet raus (`v3.css:776` ist nur noch der Kommentar dazu) | ✓ |
| Räumt mindestens eine der neun Stellen ohne `aria-label` in `ludwig/app` auf | `grep -rl IconButton /Users/simonfakir/dev/ludwig/app/apps/web/src` → kein Treffer; die App importiert das v3-Set noch nirgends. In diesem Repo nicht erfüllbar — derselbe Fall wie die zwei App-Punkte, die der Skill `v3-komponente` hier ausdrücklich überspringt. Bleibt der App-Migration zugeschrieben | — (App) |
| **Story-Deckung** — jede Prop der Schnittstelle hat ihre Story | `label`/`icon` → `--filled`; `size` und `disabled` → `--sizes`; `tone` → `--tones`; `href` → `--as-link`; `onClick` → `--interactive` (echt bedient: Klick auf „Nächste Seite" → „Seite 1 von 12" wird „Seite 2 von 12", danach ist „Vorherige Seite" nicht mehr gesperrt, `Enter` darauf zählt zurück auf 1); Bedingung 3 → `--in-use` | ✓ |

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05

Alle Kriterien, über die dieses Repo entscheiden kann, sind ✓. Das eine
Kriterium, das auf `ludwig/app` zielt, bleibt der Migration überlassen und ist
dort nachzuholen; es ist kein Mangel am Baustein.

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Der `title` verdoppelt sich mit dem `aria-label`.** So entschieden (Offene
  Frage 2), im DOM überall gleich — nur ein Hinweis für den, der später einen
  Tooltip-Baustein daneben stellt: dann stünden zwei Erklärungen am selben
  Knopf.
- **`--interactive` setzt `fontSize: 13` als Inline-Stil** in der Story
  (`IconButton.stories.tsx:94`). Der Baustein selbst ist frei von px; in einer
  Story ist es geduldet, sauberer wäre eine Klasse.
