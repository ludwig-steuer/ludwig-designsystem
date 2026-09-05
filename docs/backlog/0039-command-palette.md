# 0039 · CommandPalette — Befehl oder Seite, in einem Feld

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/` — Gruppe Rahmen |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, jede Anwendung hat Seiten und Handlungen |
| Quelle | `docs/backlog/0034-shadcn-abgleich.md` §C1 (shadcn-Abgleich, Registry-Eintrag `command` = `cmdk` mit Klassen) |
| Ersetzt | nichts — die Top-Bar-Suche ist heute ein leerer Slot (`AppShell`, 0030) |
| Blockiert | die Füllung der Top-Bar; den schnellen Weg zwischen Schritten ohne Maus |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Die Sachbearbeiterin arbeitet in einem Stapel und braucht die Kontenliste —
heute heißt das: Maus zur Seitenleiste, Abschnitt suchen, klicken. Ein Feld,
das mit `⌘K` von überall aufgeht, jede Seite und jede Handlung des Screens
listet und mit Enter dorthin springt, spart diesen Weg. Es ist ein
**Zusatzweg**: jede Seite steht weiter in der Navigation, jede Handlung
weiter auf ihrem Knopf (V14).

## Einordnung

- **Wiederverwenden:** `Combobox` (0009) wählt **einen Wert für ein Feld** und
  gehört ins Formular; `OverflowMenu` sind die Handlungen **eines Objekts**;
  `NavList` ist die stehende Navigation. Keiner deckt „alles, was diese
  Anwendung kann, in einem Feld".
- **Neu, weil:** §3 Regel 4 — die Komposition trägt **eigenen Zustand und
  eigenen Tastaturweg** (Suchtext, Auswahl, ⌘K) und kommt auf jedem Screen
  vor. Pattern statt Primitive, weil sie `useHotkeys` und die Ordnung von
  `NavSection` kennt; eine Primitive dürfte das nicht.
- **Zuschnitt:** eine Datei, ein Export.
- **Setzt auf:** `Dialog` (die Hülle), `Kbd` (0035), `InputGroup` (0036) an
  der Aufrufstelle, `useHotkeys` — und **`cmdk`**, die einzige neue
  Abhängigkeit dieser Sammelaufgabe (0034, Offene Frage 1: „ohne Antwort:
  ja"). Treffer-Sortierung, ARIA und Tastaturweg sind dort ~300 Zeilen, die
  niemand ein zweites Mal schreiben sollte; das transitive
  `@radix-ui/react-dialog` bleibt ungenutzt, die Hülle ist unser `Dialog`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `open` | `boolean` | ja | Der Aufrufer hält den Zustand | `Interactive` |
| `onOpenChange` | `(open: boolean) => void` | ja | Gegenstück zu `open`; `⌘K` und Escape melden hierüber | `Interactive` |
| `groups` | `CommandGroup[]` | ja | `{ title, items: CommandItem[] }` | `Filled` |
| `placeholder` | `string` | nein | Standard „Befehl oder Seite …" | `Filled` |
| `emptyText` | `string` | nein | Standard „Kein Treffer — kürzer suchen." | `NoMatch` |

```ts
type CommandItem = {
  id: string;
  label: string;
  hint?: string;      // die Zeile darunter: wohin es führt, was es tut
  icon?: ReactNode;
  key?: string;       // die Taste, wie sie auf dem Knopf steht — rechts als Kbd
  href?: string;      // ein Sprung: rendert einen Link
  onSelect?: () => void;  // eine Handlung
  keywords?: string[];    // unsichtbare Suchwörter („Kreditor" für Geschäftspartner)
};
```

Keine Typen aus `src/ludwig/`: das Pattern kennt keine Route und keine
Entität. Der Aufrufer bildet `NavSection[]` aus `NavList` auf Gruppen ab.

**Kann bewusst nicht:** serverseitig suchen (die Liste kommt vollständig),
sich zuletzt Gewähltes merken, verschachtelte Seiten („zurück" innerhalb der
Palette), Einträge selbst ausführen, die eine Bestätigung brauchen (das ist
`ActionButton` mit `ConfirmSpec`).

## Verhalten

`"use client"`.

- **Öffnen:** `Ctrl+K`/`⌘K` von überall — **auch aus einem Feld heraus**,
  weil eine Meta-Kombination kein Tippen ist. Das ist eine Änderung an
  `useHotkeys` (Befund in 0034): `meta`-Bindungen feuern trotz `isTyping`;
  Buchstaben ohne Meta bleiben im Feld stumm.
- **Sichtbarer Weg (V14):** die Top-Bar-Suche als `InputGroup` mit
  `<Kbd>⌘K</Kbd>`, die beim Klick öffnet (0034 sagte „beim Fokus" — siehe
  Befund unten) — Markup an der Aufrufstelle, Story `InUse` zeigt es.
- **Tippen** filtert und sortiert (cmdk), ↑↓ wandern, Enter springt oder
  führt aus und schließt, Escape schließt und gibt den Fokus zurück.
- **Sprung:** ein Eintrag mit `href` rendert ein `<a>`; Enter löst dessen
  Navigation aus (kein `location.href`, kein Router im Set) — damit
  funktionieren auch Mittelklick und „in neuem Tab öffnen".
- **Zustände:** gefüllt · kein Treffer. Leer, lädt und Fehler entfallen: die
  Liste kommt fertig vom Aufrufer.

## Stories

Titel `v3/Patterns/Frame/CommandPalette` (Gruppe „Rahmen", englischer
Storybook-Ordner wie `StepRail`). Abgeleitet nach §6: 2 Zustände + 0 Enum
+ 0 Layout-Boolean + 1 Callback + 1 „im Einsatz" + 1 Rand = 5.

| Story | Beweist |
|---|---|
| `Filled` | offen, mit Gruppen, Tasten und Hinweiszeilen |
| `NoMatch` | kein Treffer, mit Ausweg im Text |
| `Interactive` | `⌘K` öffnet, Enter wählt, das Ergebnis steht darunter |
| `InUse` | in `AppShell` mit `TopBar`-Suche, Gruppen aus `NavList` |
| `Edge` | 60 Einträge, lange Labels, Einträge mit und ohne `key` |

Nicht anwendbar: `Empty` (ohne Einträge öffnet der Aufrufer sie nicht),
`EmptyAfterFilter` (das ist `NoMatch`), `Loading`, `Error` (die Liste kommt
vollständig).

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

- [ ] `⌘K` öffnet die Palette, **auch mit dem Fokus in einem `Input`**
      (Story `InUse`)
- [ ] Ein Buchstabe ohne Meta löst im Feld weiterhin nichts aus
      (`useHotkeys` unverändert für „A", Story `v3/Patterns/Frame/HotkeyLegend`)
- [ ] Enter auf einem `href`-Eintrag ist eine echte Navigation (`<a>`), nicht
      `onClick` (DOM-Probe in `Filled`)
- [ ] Escape schließt und gibt den Fokus an den Trigger zurück (Story `InUse`)
- [ ] Kein Fachwort im Pattern
      (`grep -i "konto\|mandant\|beleg" src/ui/v3/patterns/CommandPalette.tsx` leer)
- [ ] `package.json` wächst um genau `cmdk`
      (`git diff package.json` zeigt eine Zeile mehr)
- [ ] `keywords` finden einen Eintrag, dessen Label das Wort nicht enthält
      (Story `Filled`: „Kreditor" findet „Geschäftspartner")

## Befund beim Bauen (2026-09-03)

**Der Fokus kam nach Escape nicht zurück** — `Dialog` setzt den Erstfokus,
gibt ihn aber nicht zurück (der Befund aus 0034 „Dialog ohne Fokusfalle").
Die Palette merkt sich den Trigger jetzt selbst, und zwar **während des
Renders** des öffnenden Frames: der Effect von `Dialog` ist ein Kind-Effect
und läuft vor dem der Palette — danach steht der Fokus schon im Panel.

**Die Top-Bar-Suche öffnet beim Klick statt beim Fokus** (Abweichung von
0034 §C1, „die beim Fokus öffnet"): mit Fokusrückgabe würde ein
Öffnen-beim-Fokus die Palette sofort wieder aufziehen, sobald Escape den
Fokus ins Feld zurückgibt. Der sichtbare Weg bleibt derselbe — Feld,
Lupe und `⌘K` stehen am Ort (V14). Das Feld ist `readOnly`; getippt wird in
der Palette.

**Grenze der Automatisierung, nicht der Komponente:** Tastendrücke mit
Modifier erreichen die ferngesteuerte Seite nicht (kein `keydown` im
Ereignis-Log). `⌘K` ist deshalb mit einem echten `KeyboardEvent` aus der
Seite heraus geprüft, mit dem Fokus im Suchfeld — mit demselben Aufbau ist
auch belegt, dass ein „k" **ohne** Meta im Feld nichts auslöst.

## Offene Fragen

1. Zeigt die Palette Gruppen-Überschriften auch beim Filtern? *Ohne Antwort:
   ja — cmdk blendet leere Gruppen selbst aus, und die Überschrift ist die
   Einordnung, die den Treffer erklärt.*
2. Bekommt jeder Eintrag ein Icon? *Ohne Antwort: nein, `icon` ist optional —
   ein halb gefülltes Icon-Raster ist unruhiger als keins.*

## Abnahme

Abnahme am 2026-09-05 (zweiter Agent, gegen Spec und Code). Alle fünf Stories
auf `localhost:6107` geöffnet und bedient: geöffnet, getippt, mit Pfeiltasten
gewählt, Enter, Escape.

**Story-Deckung.** Fünf Stories in der Spec, fünf Exporte in
`CommandPalette.stories.tsx`, fünf IDs in `index.json` (`--filled`,
`--no-match`, `--interactive`, `--in-use`, `--edge`) — die Ableitung
(2 Zustände + 1 Callback + 1 „im Einsatz" + 1 Rand = 5) geht auf. Jede Prop
hat ihre Story: `open`/`onOpenChange` (`Interactive`, `InUse`) · `groups`
(`Filled`) · `placeholder` (`NoMatch` setzt ihn, `Filled` zeigt den Default) ·
`emptyText` (Default in `NoMatch`). `Empty`, `EmptyAfterFilter`, `Loading` und
`Error` sind in der Spec begründet ausgeschlossen — die Liste kommt fertig vom
Aufrufer.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` ohne Ausgabe, Exit 0 (Anfang und Ende der Abnahme). `pnpm build` **nicht** neu gelaufen — parallele Abnahmen schreiben nach `storybook-static`; der Lauf für diesen Stand war grün: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/CommandPalette.tsx`, `CommandPalette.stories.tsx` daneben; Titel `v3/Patterns/Frame/CommandPalette`. Der Barrel führt den Export unter `/* Rahmen */` (`src/ui/v3/index.ts:208` … `:224–228`), und „Frame" ist dort der eingeführte englische Ordner — `StepRail`, `Wizard` und `HotkeyLegend` derselben Gruppe stehen im Baum ebenfalls unter `v3/Patterns/Frame` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Ein Export (`CommandPalette`, `:53`), `@when`/`@instead` bei `:47–52`; die Abgrenzung schickt an `Combobox`, `OverflowMenu`, `NavList` weiter. Bezeichner, Kommentare und JSDoc englisch, auch im internen `Entry` (`:114–118`) | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}' CommandPalette.tsx` = 0, `grep -cE '[0-9]+px'` = 0. Keine Map, kein Status im Pattern — die Wörter kommen als `CommandItem.label` vom Aufrufer | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Text links, nichts zentriert · kein Icon ohne Wort (das Icon steht **vor** dem Label, `:124`) · die Taste steht sichtbar am Feld (`InUse`: genau ein `kbd` „⌘K" in `span.v2ing__suf` der Top-Bar) · Escape schließt und gibt den Fokus zurück · die zwei App-Punkte übersprungen. **Reißt beim Punkt „Hauptweg per Tastatur" (V11/V14)** — siehe die erste Zeile der variablen Tabelle | ✗ |
| Im Browser angesehen, nicht nur gebaut | Alle fünf IDs am 2026-09-05 geöffnet und bedient: `--filled` getippt und mit ↑↓ gewandert, `--no-match` gefiltert, `--interactive` mit echtem `Meta+K` geöffnet, `--in-use` per Klick geöffnet und mit Escape geschlossen, `--edge` gemessen. Keine Konsolenfehler | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `⌘K` öffnet die Palette, auch mit dem Fokus in einem `Input` | `--interactive`: Fokus in das Feld „Hier tippen, dann ⌘K drücken" geklickt, `Meta+K` gedrückt → `[role="dialog"]` ist da. `--in-use`: dasselbe aus dem `readOnly`-Suchfeld der Top-Bar heraus. Grund im Code: `useHotkeys` prüft `if (!meta && isTyping(e.target)) return` (`Hotkeys.tsx:56–57`), die Bindung steht mit `meta: true` (`CommandPalette.tsx:68–70`) | ✓ |
| Ein Buchstabe ohne Meta löst im Feld weiterhin nichts aus | `--interactive`: „abc" ins Feld getippt → kein `[role="dialog"]`, der Wert steht im Feld. `HotkeyLegend --on-button` bestätigt die Gegenrichtung: außerhalb eines Feldes schaltet „A" den Zähler | ✓ |
| Enter auf einem `href`-Eintrag ist eine echte Navigation (`<a>`), nicht `onClick` | `--filled`, DOM-Probe: alle vier Einträge der Gruppe „Seiten" enthalten ein `<a>` mit `href` (`#cases`, `#documents`, `#accounts`, `#partners`), die drei Handlungen keins. `--in-use`: Auswahl des ersten Eintrags ändert die Adresse der Seite auf `…/cases` — der Browser folgt dem Link, `CommandPalette.tsx:137` klickt ihn nur an | ✓ |
| Escape schließt und gibt den Fokus an den Trigger zurück | `--in-use`: Klick ins Suchfeld öffnet, Escape schließt, `document.activeElement` ist wieder `input.v2in.v2search` („Suchen oder Befehl wählen"). Dasselbe in `--interactive` (zurück auf `input[aria-label="Suche"]`). Der Weg dahin steht in `CommandPalette.tsx:77–87` — der Auslöser wird **während des Renders** gemerkt, weil der Effect von `Dialog` als Kind-Effect vorher läuft | ✓ |
| Kein Fachwort im Pattern | `grep -ic "konto\|mandant\|beleg" src/ui/v3/patterns/CommandPalette.tsx` = 0. Die Fachwörter stehen ausschließlich in der Story, wo sie hingehören | ✓ |
| `package.json` wächst um genau `cmdk` | `git show ade8573 --stat -- package.json`: „1 file changed, 1 insertion(+)", die Zeile ist `"cmdk": "^1.1.1",`. `dependencies` zählt heute sieben Einträge, kein Radix darunter | ✓ |
| `keywords` finden einen Eintrag, dessen Label das Wort nicht enthält | `--filled`: „Kreditor" in das Feld getippt → es bleibt **ein** Eintrag stehen, `Geschäftspartner`, und die Gruppe „Handlungen" verschwindet (`[cmdk-group][data-value=Handlungen]` auf `hidden`). Das Wort steht in `keywords: ["Kreditor","Debitor","Lieferant"]` (`CommandPalette.stories.tsx:70`) | ✓ |

**Der Mangel, der die Abnahme trägt**

**Nach `⌘K` steht der Fokus nicht im Suchfeld der Palette, sondern auf der
Dialog-Fläche — die Palette ist damit nur mit der Maus zu bedienen.**
Gemessen in `--interactive`: Fokus ins Feld, `Meta+K`, dann
`document.activeElement` nach 20 / 100 / 300 / 1000 / 2500 ms — jedes Mal
`div.v2dlg.v2dlg--md`, nie das `input[cmdk-input]`. Folgen, alle in derselben
Sitzung beobachtet:

- Getipptes landet nirgends: nach „Stapel" ist `input[cmdk-input].value` leer
  und die Liste ungefiltert.
- `Tab` führt nicht ins Feld, sondern auf `button.v2dlg__close`; das darauf
  folgende `Enter` **schließt** die Palette, statt einen Eintrag zu wählen
  („Noch nichts gewählt" steht danach unverändert da).
- Erst ein Mausklick ins Feld macht alles Weitere richtig: dann filtert
  „Kreditor" auf einen Treffer, ↑↓ wandern (Sachverhalte → Belege → Konten →
  zurück auf Belege) und Enter wählt.

Ursache ist dieselbe Effect-Reihenfolge, die schon im Abschnitt „Befund beim
Bauen" steht, nur an der anderen Stelle: `Dialog` ruft in seinem Effect
`panel.current?.focus()` (`primitives/Dialog.tsx:47`) und überschreibt damit
das `autoFocus` des `Command.Input` (`CommandPalette.tsx:98`) — der
Eltern-Effect läuft zuletzt. Das Ziel der Spec („`⌘K` von überall … Tippen
filtert … Enter springt", §Verhalten) und der versprochene Nachweis der Story
`Interactive` („`⌘K` öffnet, Enter wählt, das Ergebnis steht darunter") sind
damit ohne Maus nicht erreichbar; §9 „Hauptweg per Tastatur" (V11, V14) ist
verletzt. Ein Weg wäre, den Erstfokus wie den Auslöser selbst zu führen —
nach dem Öffnen das Feld fokussieren, statt sich auf `autoFocus` zu verlassen.

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Der Rand hält.** `--edge`: 60 Einträge, die Liste scrollt in sich
  (`overflow-y: auto`, 320 px sichtbar bei 2397 px Inhalt), der Dialog bleibt
  im Fenster (`top 163`, `bottom 637` bei 800 px Höhe), der 74-Zeichen-Titel
  bricht innerhalb der Zeile, drei von 60 Einträgen tragen eine Taste.
- **`NoMatch` beweist seinen Namen erst nach dem Tippen.** Die Story steht
  offen mit einem Eintrag; erst „xyz" im Feld zeigt „Kein Treffer — kürzer
  suchen." Das ist so gedacht (der Platzhalter sagt es), heißt aber: der
  Leertext ist im statischen Bild der Story nicht zu sehen.
- **Die Story-Beschreibung von `InUse` widerspricht dem Code.** Sie sagt „die
  Suche der Top-Bar … öffnet beim Fokus" (`CommandPalette.stories.tsx:154`),
  gebaut und im Abschnitt „Befund beim Bauen" begründet ist **Klick**
  (`:193`). Ein Satz, der nachzuziehen ist.

Abgenommen von / am: **nicht abgenommen**, Claude (Abnahme-Agent), 2026-09-05
· Status zurück auf `in Arbeit`.

**Offene Punkte**

1. **Der Erstfokus gehört ins Suchfeld der Palette.** Solange `Dialog` ihn auf
   die Fläche zieht, ist die Palette ein Mausweg — und damit das Gegenteil
   dessen, wofür sie gebaut ist. (Betrifft `Dialog` allgemein: jeder Dialog
   mit `autoFocus` im Inhalt hat dasselbe Problem — ein Befund für das Set.)
2. **`InUse`-Beschreibung auf „öffnet beim Klick" korrigieren.**

Kein Kriterium dieser Spec zielt auf `ludwig/app`; die Spec führt unter
„Ersetzt" ausdrücklich „nichts".

## Die zwei offenen Punkte — behoben

**1 — der Erstfokus steht im Suchfeld.** Der Mangel saß nicht in der Palette,
sondern in `Dialog`: sein Effekt zog den Fokus auf die Fläche, nachdem das
`autoFocus` des `Command.Input` ihn schon hatte. Behoben mit 0092 — `Dialog`
holt den Fokus nur noch, wenn er nicht ohnehin schon **im** Panel steht.

Mit demselben Zug ist die Krücke aus `CommandPalette.tsx` verschwunden: der
eigene Auslöser-Merker, den die Palette sich seit 0034 hielt, weil `Dialog` den
Fokus nicht zurückgab. `Dialog` kann das jetzt selbst.

Nachgemessen (Chromium headless, Story `Interactive`): Fokus ins Feld der
Seite, `⌘K` → `input.v2cmd__in`; Escape → zurück auf das Feld davor.

**2 — die Beschreibung von `InUse`** sagt jetzt „öffnet beim **Klick**", mit
dem Grund dazu: beim Fokus käme man mit der Tastatur nicht mehr an der Suche
vorbei.

## Abnahmekriterien (Nachtrag)

- [ ] Nach `⌘K` steht der Fokus im Suchfeld, nicht auf der Dialogfläche (Story `Interactive`, gemessen)
- [ ] Escape gibt den Fokus an das Feld zurück, aus dem heraus geöffnet wurde
- [ ] Die Palette hält keinen eigenen Auslöser-Merker mehr (`grep`)
- [ ] Die Beschreibung von `InUse` und der Code sagen dasselbe

## Abnahme (2026-09-05, zweite Runde)

Nach der Behebung der zwei offenen Punkte erneut abgenommen, dritter Agent,
gegen Spec und Code. Gemessen in headless Chromium (1440 × 900) über CDP mit
**echten** Tastendrücken — `⌘K` kam diesmal als `Input.dispatchKeyEvent` mit
gesetztem Meta-Modifier an, die „Grenze der Automatisierung" aus dem Abschnitt
„Befund beim Bauen" gilt für dieses Werkzeug nicht mehr. Alle fünf Stories
geöffnet und bedient.

**Story-Deckung.** Unverändert fünf Stories, fünf Exporte, fünf IDs in
`index.json` (`--filled`, `--no-match`, `--interactive`, `--in-use`,
`--edge`); die Ableitung (2 Zustände + 1 Callback + 1 „im Einsatz" + 1 Rand)
geht auf. `Empty`, `EmptyAfterFilter`, `Loading`, `Error` sind in der Spec
begründet ausgeschlossen.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `tsc --noEmit`, keine Ausgabe, Exit 0 | ✓ |
| `pnpm build` grün | **nicht neu gelaufen** — parallele Sitzung schreibt nach `storybook-static`; der Lauf für diesen Stand ist in der ersten Abnahme belegt | ✓ (übernommen) |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/CommandPalette.tsx` mit `CommandPalette.stories.tsx` daneben; Titel `v3/Patterns/Frame/CommandPalette` in `index.json`, dieselbe Gruppe wie `StepRail` und `HotkeyLegend` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Ein Export (`CommandPalette`, `:53`), `@when`/`@instead` bei `:47-52` mit Verweis auf `Combobox`, `OverflowMenu`, `NavList`. Bezeichner, Kommentare und JSDoc englisch, auch im internen `Entry` (`:97-102`) | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}'` = 0, `grep -cE '[0-9]+px'` = 0; keine Map, kein Status im Pattern | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Text links, nichts zentriert · kein Icon ohne Wort (Icon steht vor dem Label, `:106`) · Taste sichtbar am Feld (`--in-use`: `.v2ing__suf` trägt „⌘K") · Escape schließt und gibt den Fokus zurück · die zwei App-Punkte übersprungen. **Der Punkt „Hauptweg per Tastatur" (V11/V14) trägt jetzt** — die Palette ist von `⌘K` bis Enter ohne Maus bedienbar, siehe erste Zeile der variablen Tabelle | ✓ |
| Im Browser angesehen, nicht nur gebaut | Alle fünf IDs am 2026-09-05 geöffnet: `--interactive` mit echtem `Meta+K` geöffnet, getippt, mit Enter gewählt; `--filled` gefiltert; `--no-match` (Platzhalter „Tippen Sie xyz — dann steht hier der Leertext"); `--in-use` per Klick und per `⌘K` geöffnet; `--edge` 60 Einträge, Liste 320 px hoch und in sich scrollend. Keine Konsolenfehler | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Messung) | Ergebnis |
|---|---|---|
| `⌘K` öffnet die Palette, auch mit dem Fokus in einem `Input` | `--interactive`: Fokus in `input[aria-label="Suche"]`, echtes `Meta+K` → `[role=dialog]` = 1. `--in-use`: dasselbe aus dem `readOnly`-Suchfeld der Top-Bar heraus → `input.v2cmd__in` hat den Fokus. Grund im Code: `Hotkeys.tsx:45` (`if (!meta && isTyping(e.target)) return`) und die Bindung mit `meta: true` (`CommandPalette.tsx:68-70`) | ✓ |
| Ein Buchstabe ohne Meta löst im Feld weiterhin nichts aus | `--interactive`: „kab" ins Seitenfeld getippt (das „k" ist genau die Taste der Bindung) → `[role=dialog]` = 0, der Wert steht im Feld | ✓ |
| Enter auf einem `href`-Eintrag ist eine echte Navigation (`<a>`), nicht `onClick` | `--filled`, DOM-Probe: die vier Einträge der Gruppe „Seiten" enthalten je ein `<a href>` (`#cases`, `#documents`, `#accounts`, `#partners`), die drei Handlungen keins. `CommandPalette.tsx:120` klickt den Link nur an | ✓ |
| Escape schließt und gibt den Fokus an den Trigger zurück | `--in-use`: Klick ins Suchfeld öffnet → `input.v2cmd__in`; Escape → `input.v2in.v2search[aria-label="Suche"]`, `[role=dialog]` = 0. `--interactive`: `⌘K` aus dem Seitenfeld → Escape → zurück auf dasselbe Feld. Der Weg dahin liegt jetzt in `Dialog` (`Dialog.tsx:94-99` und `:116-122`), nicht mehr in der Palette | ✓ |
| Kein Fachwort im Pattern | `grep -ic "konto\|mandant\|beleg" src/ui/v3/patterns/CommandPalette.tsx` = 0 | ✓ |
| `package.json` wächst um genau `cmdk` | `dependencies` zählt sieben Einträge — `clsx`, `cmdk`, `date-fns`, `decimal.js`, `lucide-react`, `tailwind-merge`, `zod`; kein Radix darunter | ✓ |
| `keywords` finden einen Eintrag, dessen Label das Wort nicht enthält | `--filled`: „kredit" echt getippt → von sieben sichtbaren Einträgen bleibt **einer**, „Geschäftspartner · Kreditoren und Debitoren". Das Wort steht in `keywords` der Story, nicht im Label | ✓ |

**Die zwei offenen Punkte der ersten Abnahme**

| Punkt | Nachweis (Story-ID · Messung) | Ergebnis |
|---|---|---|
| 1 — Nach `⌘K` steht der Fokus im Suchfeld, nicht auf der Dialogfläche | `--interactive`: Fokus ins Seitenfeld, echtes `Meta+K` → `activeElement` ist sofort und nach 1,5 s `input.v2in.v2cmd__in`, nie `div.v2dlg`. Ohne einen Mausklick „CSV" getippt → steht im Feld, die Liste geht von drei Einträgen auf einen („Als CSV laden"), `Enter` wählt ihn, die Ergebniszeile lautet „Gewählt: Als CSV laden", `[role=dialog]` = 0 und der Fokus steht wieder im Feld davor. **Der Mangel, der die erste Abnahme trug, ist behoben** — die Ursache saß in `Dialog` und ist mit 0092 weg (`Dialog.tsx:115`) | ✓ |
| 1b — die Palette hält keinen eigenen Auslöser-Merker mehr | `grep -n "opener\|activeElement\|wasOpen\|trigger" src/ui/v3/patterns/CommandPalette.tsx` → kein Treffer; der einzige verbliebene `useRef` (`:103`) ist der Link einer Zeile. Die Fokusrückgabe misst sich trotzdem grün (Zeile darüber) — es gibt jetzt eine Mechanik statt zwei | ✓ |
| 2 — Die Beschreibung von `InUse` und der Code sagen dasselbe | `CommandPalette.stories.tsx:154-155`: „die Suche der Top-Bar zeigt ihre Taste und öffnet **beim Klick** — nicht beim Fokus, sonst käme man mit der Tastatur nicht mehr an ihr vorbei"; der Code daneben (`:195`) trägt `onClick={() => setOpen(true)}` und denselben Grund im Kommentar | ✓ |

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Der Rand hält weiter.** `--edge`: 60 `.v2cmd__item`, die Liste ist 320 px
  hoch und scrollt in sich, der Fokus steht auch hier im Suchfeld.
- **`NoMatch` beweist seinen Namen weiter erst nach dem Tippen** — der
  Platzhalter sagt es inzwischen ausdrücklich („Tippen Sie xyz — dann steht
  hier der Leertext"). Damit ist der Punkt aus der ersten Abnahme erledigt,
  auch wenn kein Kriterium ihn verlangt hat.
- **Der Erstfokus hängt an `autoFocus` des `Command.Input`** (`:81`) und damit
  daran, dass `Dialog` ihn stehen lässt. Das ist jetzt richtig gebaut, aber es
  ist eine Absprache zwischen zwei Dateien: wer `Dialog.tsx:115` je wieder
  anfasst, nimmt der Palette die Tastatur. Die Story `AutoFocusChild` in 0092
  ist der Wächter dafür.
