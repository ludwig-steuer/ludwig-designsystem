# 0012 · IconButton — mit benannter Ausnahme zu T8

| | |
|---|---|
| Status | spec |
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
- [ ] Der Kommentar in `Button.tsx` („Kein Kebab …") bleibt und verweist auf die Ausnahme
- [ ] Ersetzt das Schließen-Kreuz in `v3/primitives/Dialog.tsx` ohne Funktionsverlust
- [ ] Räumt mindestens eine der neun Stellen ohne `aria-label` in `ludwig/app` auf

## Offene Fragen

1. Drei Größen oder zwei? *Ohne Antwort: drei — die App hat heute sechs;
   24/28/32 deckt sie ohne sichtbaren Bruch ab.*
2. Soll `title` immer gesetzt werden, auch wenn es den Hover verdoppelt?
   *Ohne Antwort: ja — T8 sagt „Tooltip erklärt, ersetzt kein Label", hier ist
   er der einzige sichtbare Hinweis.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
