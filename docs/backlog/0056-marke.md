# 0056 · Grundlagen — Marke

| | |
|---|---|
| Status | Abnahme |
| Stufe | keine Komponente — eine Story `src/ui/v3/Brand.stories.tsx` in der Gruppe `v3/Grundlagen` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, mit deren Zeichen: welche Variante auf welchen Grund, wie klein, was nicht — die Regel ist markenfrei |
| Quelle | `design-guidelines.md` §11.7 Stufe 0 („Marke: Wordmark, Mark, Light-Variante", Status v2 ohne Nachweis) · Review 0055 vom 2026-09-03 |
| Ersetzt | nichts — die drei SVGs liegen unter `reference/design-system-v2/assets/`, ohne Story und ohne Regel |
| Blockiert | den Sidebar-Kopf mit echtem Zeichen statt Text (heute `<div class="sb__logo">Ludwig</div>` in vier Stories); Favicon und App-Icon der App |
| Spec von / am | Claude, 2026-09-03 |
| Gebaut von / am | Claude, 2026-09-04 — `src/ui/v3/Brand.stories.tsx` |

## Ziel

Drei Dateien sind die Marke: das Wordmark (`ludwig-logo.svg`, 220×56), seine
helle Variante für dunkle Gründe (`ludwig-logo-light.svg`) und das quadratische
Mark (`ludwig-mark.svg`, 56×56) für Favicon, App-Icon und Avatar. Niemand sieht
sie: der Sidebar-Kopf in Storybook schreibt „Ludwig" als Text und „L", wenn er
eingeklappt ist; keine Regel sagt, welche Variante auf welchen Grund gehört,
wie klein das Mark werden darf und was man mit dem Zeichen nicht tut. Die
Aufgabe liefert den Nachweis und die Regel, sonst nichts — keine Datei wird
kopiert, verschoben oder verändert.

## Einordnung

- **Wiederverwenden:** die Dateien selbst. Storybook liefert `reference/` als
  statisches Verzeichnis unter `/reference/…` aus (`.storybook/main.ts`,
  `staticDirs`); die Story lädt die SVGs von dort als `<img>`.
- **Neu, weil:** nichts wird gebaut. Neu ist eine Story in der Gruppe
  `v3/Grundlagen`, neben 0037 und 0055.
- **Zuschnitt:** eine Datei `src/ui/v3/Brand.stories.tsx`, Barrel-Ebene wie
  die anderen Grundlagen. Drei Stories, weit unter der Obergrenze.
- **Setzt auf:** `tokens.css` für die Gründe (`--color-bg`, `--color-primary`),
  `app-chrome.css` für den Sidebar-Verlauf und die Kopfhöhe (`.sb__logo`,
  56 px).

## Schnittstelle

Keine — keine Komponente, keine Props. An ihre Stelle tritt der festgelegte
Inhalt unten.

## Verhalten

Reine Anzeige, kein Zustand.

Inhalt, festgelegt:

1. **Die drei Zeichen**: Wordmark auf `--color-bg`; helle Variante auf
   `--color-primary` und auf dem Sidebar-Verlauf aus `app-chrome.css`; Mark auf
   beiden Gründen. Je Zeichen Dateiname, Maß aus der `viewBox` und Einsatzort
   (Sidebar-Kopf · dunkle Fläche, Hero · Favicon, App-Icon, Avatar).
2. **Maß**: das Wordmark in der Höhe, in der es im Sidebar-Kopf steht
   (`.sb__logo`, 56 px Zeile, Zeichen mit Luft darin); das Mark bei 16, 24
   und 32 px — den Favicon- und App-Icon-Maßen — und der Satz, ab wann das Mark
   das Wordmark ersetzt: in der eingeklappten Sidebar (`is-collapsed`), wo
   heute „L" steht.
3. **Nicht so**, je ein Fall neben dem richtigen: umgefärbt (das Zeichen nimmt
   keine Semantikfarbe), gestreckt, auf farbigem Grund außer `bg`, `primary`
   und dem Sidebar-Verlauf, mit Schatten oder Glow, und „Ludwig" als Text
   anstelle des Zeichens.

## Stories

Titel `v3/Grundlagen/Marke`. Abgeleitet nach §6: eine Anzeige ohne Props hat
keine Zustände; es bleiben Übersicht, Maß und Regel.

| Story | Beweist |
|---|---|
| `Marks` | drei Dateien auf hellem und dunklem Grund, mit Datei, Maß, Einsatzort |
| `Sizes` | Wordmark in Sidebar-Höhe; Mark bei 16/24/32 px; wann das Mark das Wordmark ersetzt |
| `Misuse` | fünf verbotene Fälle, je neben dem richtigen |

Nicht anwendbar: `Empty`, `EmptyAfterFilter`, `Loading`, `Error` — eine
Marke hat keine Daten und lädt nicht.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export *(entfällt: keine
      Exporte außer Stories)*
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Die Story lädt die drei SVGs als Dateien
      (`/reference/design-system-v2/assets/ludwig-*.svg`), kein SVG-Markup in
      TSX; `grep -c '#[0-9A-Fa-f]\{6\}' src/ui/v3/Brand.stories.tsx` ist `0`
- [ ] `Marks` zeigt Wordmark, helle Variante und Mark je auf hellem und dunklem
      Grund; die helle Variante steht nie auf `--color-bg`, das Wordmark nie auf
      dunklem Grund
- [ ] `Sizes` zeigt das Mark bei 16, 24 und 32 px scharf und nennt, wann es das
      Wordmark ersetzt
- [ ] `Misuse` zeigt „Ludwig" als Text an Stelle des Zeichens als verbotenen
      Fall und nennt die vier Stories, die es heute so machen
      (`AppShell.stories.tsx` zweimal, `NavList.stories.tsx`,
      `CommandPalette.stories.tsx`)
- [ ] Keine Datei unter `reference/` geändert, kopiert oder verschoben:
      `git status --short reference/ public/` ist leer
- [ ] Die Story steht unter `v3/Grundlagen/…`, nicht unter `Primitives`

## Befunde beim Schreiben der Spec (2026-09-03)

1. **Text statt Zeichen.** Vier Stories setzen `<div className="sb__logo">`
   mit „Ludwig" bzw. „L". Der Sidebar-Kopf ist die eine Stelle, an der das
   Wordmark hingehört; er bekommt es beim Heben der Top-Bar-Füllung (§11.7
   Rahmen), nicht in dieser Aufgabe.
2. **Zwei Farben außerhalb der Palette.** Die SVGs tragen `#142B45` und
   `#C7DFEC`, die in `tokens.css` nicht stehen. Die Marke ist — wie
   `app-chrome.css` — bewusst außerhalb der Palette (A5-Ausnahme); die Story
   sagt das, statt es zu verstecken. Kein Token dafür erfinden.
3. **Ort der Dateien.** `reference/` ist die Vorlage, nicht das Produkt; die
   App kann von dort nichts importieren. Solange nur Storybook die Zeichen
   zeigt, reicht `staticDirs`.

## Offene Fragen

1. **Gehören die SVGs nach `public/brand/`?** *Ohne Antwort: nein, sie bleiben
   in `reference/`, die Story lädt über `/reference/…`. Umzug, sobald die App
   sie braucht (Sidebar-Kopf, Favicon) — dann als eigener Schritt mit der
   Aufgabe, die sie einbaut.*
2. **Wordmark im Sidebar-Kopf statt Text?** *Ohne Antwort: die Story empfiehlt
   es und zeigt es in `Sizes`; `AppShell` und seine Stories bleiben unangetastet,
   bis die Top-Bar-Füllung gehoben wird.*

## Beim Bauen aufgefallen (2026-09-04)

1. **Die Sidebar-Breite kommt aus dem Grid, nicht aus einem Token.**
   `.app__sidebar` allein hat keine Breite — die 240 px (eingeklappt 64 px)
   stehen in `.app` beziehungsweise `.app--collapsed`. `Sizes` und `Misuse`
   setzen deshalb den echten Rahmen `.app` um den Kopf und überschreiben nur
   `height`, `min-height` und `width` auf `auto`/`0`/`fit-content`, damit von
   der Shell genau die Kopfzeile stehen bleibt. So steht kein einziges Maß in
   der TSX-Datei; Spalte und Zeile bringt das Stylesheet mit.
2. **`Misuse` zeigt vier statt fünf Verstöße als Bild.** Der fünfte, „Text an
   Stelle des Zeichens", ist selbst ein Bild-Paar — insgesamt also fünf Paare
   wie bestellt. Die Zahl in der Spec („fünf verbotene Fälle") ist erfüllt.
3. **Die zwei Markenfarben stehen nicht in der TSX-Datei.** Befund 2 der Spec
   verlangt, dass die Story die A5-Ausnahme benennt — sie tut das in Worten
   und verweist auf die SVG-Dateien, statt die Werte abzuschreiben. Sonst
   stünde ausgerechnet auf der Marken-Seite ein Hex-Literal.

## Abnahme

Gemessen am 2026-09-07 gegen `ec424a9` (Story zuletzt in `7560236`), Dev-Server
`http://localhost:6107`, also gegen die Quelle und nicht gegen
`storybook-static`. Jede Zahl unten ist im Browser gelesen (CDP), keine aus dem
Quelltext abgeschrieben.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` ohne Ausgabe; `storybook build` endet mit „Storybook build completed successfully"; dazu `pnpm check:icons` „in Ordnung, 53 Zeichen in der Registry" | erfüllt |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/Brand.stories.tsx`, `title: "v3/Grundlagen/Marke"`; `index.json` führt `v3-grundlagen-marke--marks`, `--sizes`, `--misuse` | erfüllt |
| Code englisch; `@when`/`@instead` (entfällt) | Bezeichner, Props, Typen und Story-Exporte sind englisch; Kommentare und JSDoc sind deutsch. Dasselbe gilt für `Color`-, `Icons`-, `Surface`- und `Typography.stories.tsx` — Befund am Set, nicht an dieser Aufgabe | erfüllt, mit Set-Befund |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -c '#[0-9A-Fa-f]\{6\}' src/ui/v3/Brand.stories.tsx` = **0**; `grep -c '<svg'` = **0**; kein Status im Spiel, keine Registry berührt. Die px-Zahlen (16 · 24 · 32 · 40 · 56 · 100) sind Gegenstand der Seite und von M1/M2 ausdrücklich als Stil verlangt; `GROUND_LABEL` bildet Grund→Token-Name ab, keine Statuslabel | erfüllt |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | drei von drei; `Empty`, `EmptyAfterFilter`, `Loading`, `Error` in der Spec begründet | erfüllt |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Kontrast im Browser gerechnet: kleinster Textwert `--color-text-subtle` 4,51:1, Tabellentext 6,17:1, Badge „richtig" 4,68:1, „falsch" 5,60:1 — alle ≥ 4,5:1. Jeder farbige Zustand trägt sein Wort (V7). Keine Bewegung, kein Fokusziel, keine Ikone ohne Wort. §11.7 Stufe 0 führt die Marke als `v2 (0056)`. Offen bleibt allein die Vorlesbarkeit der Tafeln (M5) | erfüllt bis auf M5 |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle drei Stories über CDP geladen und vermessen; 6 · 5 · 9 Bilder, alle `complete` | erfüllt |
| Story lädt die drei SVGs als Dateien, kein SVG-Markup, kein Hex | im Browser `naturalWidth × naturalHeight` 300×76 (beide Wordmarks) und 150×150 (Mark), geladen von `/reference/design-system-v2/assets/…`; die `viewBox` der Dateien lautet 220 56, 220 56 und 56 56 — genau die Werte, die die Tabelle nennt | erfüllt |
| `Marks` zeigt die drei Zeichen auf hellem und dunklem Grund; helle Variante nie auf `--color-bg`, Wordmark nie auf dunkel | `--marks`: `ludwig-logo.svg` 157,14 × 40 auf `rgb(255,255,255)` (= `--color-bg`); `ludwig-logo-light.svg` 157,14 × 40 auf `rgb(26,58,92)` (= `--color-primary`) und auf `linear-gradient(rgb(31,70,112), rgb(20,48,75) …)` (Sidebar); `ludwig-mark.svg` 56 × 56 auf allen dreien. Kein dunkles Wordmark auf dunklem Grund, keine helle Variante auf Weiß | erfüllt |
| `Sizes` zeigt das Mark bei 16, 24 und 32 px scharf und nennt die Ablösung | `--sizes`: gemessen 16×16, 24×24, 32×32 — exakt, und als SVG verlustfrei. Der echte Rahmen misst 240 px Spalte ausgeklappt, 64 px eingeklappt, `.sb__logo` 56 px Zeile; das Wordmark steht mit 125,7 × 32 darin, also mit Luft. Der Satz „Das Mark ersetzt das Wordmark, sobald der Name nicht mehr passt … `.is-collapsed`" steht da | erfüllt |
| `Misuse` zeigt Text an Stelle des Zeichens und nennt die Stories, die es heute so machen | `--misuse` rendert „**6** Stories" und listet `AppShell.stories.tsx`, `CaseDetailView.stories.tsx`, `CaseList.stories.tsx`, `CommandPalette.stories.tsx`, `NavList.stories.tsx`, `SourceDocumentView.stories.tsx`. `grep -rl 'sb__logo' src/ui/v3` findet genau diese sechs Dateien (sieben Fundstellen, `AppShell` zweimal). Die „vier Stories" der Kriterienzeile sind durch M4 abgelöst: die Liste wird gerechnet, nicht gepflegt | erfüllt |
| Keine Datei unter `reference/` geändert, kopiert oder verschoben | `git status --short reference/ public/` leer; der ganze Baum ist sauber | erfüllt |
| Die Story steht unter `v3/Grundlagen/…` | ja, nicht unter `Primitives` | erfüllt |
| M1 / M3 — die Höhe steht als Stil, nicht als Attribut | nachgemessen: `Marks` 157,14 × 40 und 56 × 56, `Sizes` 16 · 24 · 32 exakt. Die Behauptung des Bauabschnitts trifft zu | behoben |
| M2 — die Tafel „Nicht verzerren" verzerrt | gemessen 100 × 40, Verhältnis 2,500 gegen 3,947 der Datei — sichtbar gestaucht | behoben |
| M4 — die Liste wird gerechnet | `import.meta.glob`; das gerenderte Ergebnis deckt sich mit `grep` (sechs Dateien) und ist gegenüber der handgeschriebenen Fassung um zwei gewachsen | behoben |
| M5 — die Missbrauchs-Tafeln sind für eine Vorlesehilfe stumm | `Accessibility.getFullAXTree` auf `--misuse`: **9 `<img>` im DOM, 8 `image`-Knoten im Baum**. Die fehlende ist ausgerechnet „Nicht verzerren / falsch" (`alt=""`, gemessen 100 × 40); sie gilt als präsentational und kommt im Baum nicht vor — gelesen wird dort „falsch", dann nichts. Die übrigen acht tragen ausnahmslos denselben Namen „Ludwig" (`nameFrom: attribute:Ludwig`), keiner eine `description`. Das Urteil steht ausschließlich im Nachbartext | **offen, blockiert** |
| M6 — ungenutzter `verdict: "falsch"`-Zweig in `Plate` | bleibt laut Spec-Entscheid. Anmerkung ohne Folge: `Pair` benutzt `Plate` gar nicht, der Zweig wartet also nicht auf die sechste Tafel, sondern auf einen Aufrufer, den es nicht gibt | übernommen |

### M5 — die Tafeln sagen nicht, was sie zeigen (blockiert)

**Kriterium:** der Abschnitt „Die Mängel der Abnahme vom 2026-09-06 — behoben",
Punkt M5. Er nennt den Mangel, aber anders als M1–M4 keinen Beheb-Satz und
anders als M6 kein „bleibt".

**Messung** (`Accessibility.getFullAXTree`, nicht das Markup): im Baum von
`v3-grundlagen-marke--misuse` stehen acht `image`-Knoten für neun Bilder. Die
Lesereihenfolge des zweiten Paars lautet

```
StaticText "Nicht verzerren"
  StaticText "richtig" → image "Ludwig"
  StaticText "falsch"  → (nichts)
```

Alle acht sichtbaren Knoten heißen gleich: `"Ludwig"`. Wer die Seite hört,
bekommt fünfmal „richtig, Ludwig" und viermal „falsch, Ludwig" — dieselben
Wörter für das Richtige und das Verbotene — und beim wichtigsten Fall der Seite
gar nichts. Das Bild trägt die ganze Aussage, und genau die fehlt ihm.

**Vorschlag:** den Namen aus dem Urteil bauen, statt ihn je Bild zu tippen —
`Plate` und `Pair` kennen Titel und Urteil bereits. Etwa
`alt="Ludwig-Wordmark, auf 100 × 40 px gestaucht"`,
`alt="Ludwig-Wordmark, umgefärbt"`, `alt="Ludwig-Wordmark auf Warnfläche"`,
`alt="Ludwig-Mark mit Glow"` und auf der guten Seite
`alt="Ludwig-Wordmark, unverändert"`. Kein `alt=""` auf einer Tafel, die etwas
zeigen soll: ein leeres `alt` heißt „hier steht nichts Wichtiges", und das ist
hier die Unwahrheit.

### Nicht blockierend

1. **`Misuse` hat keine Überschriften.** Der Baum enthält null `heading`-Knoten;
   die fünf Regeltitel sind `<div style={{ fontWeight: 600 }}>`. `Marks` und
   `Sizes` haben sie über `Section` (`h3.lw-h4`). Zwei Gliederungen in einer
   Datei; wer per Überschrift springt, findet in `Misuse` nichts.
2. **„6 Stories" zählt Dateien, nicht Stories.** Sieben Fundstellen in sechs
   Dateien, `AppShell` zweimal. „6 Dateien" wäre der richtige Satz auf einer
   Seite, deren Gegenstand Genauigkeit ist.
3. **Zwei doppelte Leerzeichen** in den Zeilen 399 und 441
   (`alt="Ludwig"  style=`, `"auto",  filter:`) — Rest einer Textersetzung. Das
   Repo hat kein Formatier- oder Lint-Skript, das so etwas fängt (Befund am Set).
4. **`SidebarHead` erzeugt eine `complementary`-Landmarke** je Vorführung
   (`<aside class="app__sidebar">`), zweimal in `Sizes` und zweimal in `Misuse`.
   Echtes Markup zu zeigen ist der Punkt der Tafel; die Landmarke ist der Preis.

### Befunde am Set (gehören nicht zu 0056)

- **Deutsche Kommentare und JSDoc in den v3-Stories** widersprechen `CLAUDE.md`
  („Code nur Englisch … Kommentare, JSDoc"). Es ist die gelebte Regel in
  `Brand`, `Color`, `Icons`, `Surface` und `Typography.stories.tsx`. Entweder
  zieht die Regel nach oder die Dateien — eine Abnahme entscheidet das nicht.
- **`pnpm check:icons`** meldet „2 Datei(en) noch offen". Das ist die
  Icon-Leiter aus einer anderen Aufgabe, kein Befund an 0056.
- **Kein Formatierer, kein Linter** in `package.json` (nur `typecheck`, `build`,
  `check:icons`); Befund 3 oben wäre sonst nie stehen geblieben.

Abgenommen von / am: Claude (fremde Abnahme), 2026-09-07 · Ergebnis: **zurück**
· Offene Punkte: M5 (blockiert); vier nicht blockierende Befunde und drei am Set.

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1–M3 hatten eine Ursache: Tailwinds `img { height: auto }` schlägt jedes
`height`-Attribut.** Eine Autorenregel gewinnt gegen ein
Präsentations-Attribut, und daran ändert auch die Umstellung der Ladeordnung
(0111) nichts. Folge war, dass **kein** Zeichen in seinem angegebenen Maß
stand: `height={56}` rendert 205 px, `height={40}` rendert 52 px.

Jetzt steht die Höhe als **Stil**. Gemessen: `Marks` 157×40 und 56×56,
`Sizes` 16×16 · 24×24 · 32×32 exakt.

**M2 im Besonderen — die Tafel „Nicht verzerren" verzerrte nicht.** Sie zeigte
gemessen 100 × 25 px, also das *richtige* Seitenverhältnis: das wichtigste
„so nicht" der Seite war unsichtbar. Jetzt beide Maße im Stil, gemessen
100 × 40 px.

**M4 — die Liste der Stories, die den Namen als Text schreiben, wird
gerechnet.** Sie nannte drei Dateien, es waren vier, und mit `CaseDetailView`
sind es fünf Fundstellen in vier Dateien. `import.meta.glob` zählt sie jetzt
selbst — eine handgepflegte Liste veraltet mit dem nächsten Commit, und das
ist derselbe Fehler, den die Seite an anderer Stelle anprangert.

**M5 — die Missbrauchs-Tafeln tragen `alt=""`**, wo das Urteil im Text daneben
steht. **M6** (ein `verdict: "falsch"`-Zweig, den `Marks` nie benutzt) bleibt:
er kostet nichts und `Pair` wird ihn brauchen, sobald eine sechste Tafel dazukommt.

## Nach der Abnahme (2026-09-07): die Tafel, die am lautesten sein sollte, war stumm

**M5 erledigt.** Die Abnahme hat nicht das Markup gelesen, sondern den
Zugänglichkeitsbaum gemessen: **9 `<img>` im DOM, 8 `image`-Knoten im Baum**.
Die fehlende war ausgerechnet „Nicht verzerren / falsch" — die Tafel, die die
Spec selbst als das wichtigste „so nicht" der Seite bezeichnet. Und die
übrigen acht hießen ausnahmslos „Ludwig": wer die Seite hört, bekam „richtig,
Ludwig" und „falsch, Ludwig" — **dieselben Wörter für das Richtige und das
Verbotene**.

Jede Tafel trägt jetzt ihr Urteil im Namen. Gemessen: 9 Bilder, **null ohne
Namen**, acht verschiedene Texte („Ludwig-Wortmarke, auf 100 × 40 px
gestaucht", „… rot umgefärbt", „… auf einer Warnfläche", „Ludwig-Bildmarke mit
Schein darunter" …). Das neunte heißt weiterhin „Ludwig" — es ist die gute
Seite der Tafel „Kein Text an Stelle des Zeichens", und dort ist genau das der
Punkt.

**Auch erledigt:**

- Die fünf Regeltitel der Missbrauchs-Seite waren fette `div`s, während
  `Marks` und `Sizes` über `Section` echte `h3` haben — zwei Gliederungen in
  einer Datei, und für eine Vorlesehilfe war die eine keine. Gemessen: **7**
  Überschriften statt 0.
- „6 Stories" zählte in Wahrheit Dateien (`AppShell` trägt den Fall zweimal).
  Der Satz sagt jetzt „Dateien".
- Die zwei doppelten Leerzeichen aus einer alten Textersetzung sind weg (die
  Datei ist einmal durch den Formatierer gelaufen).

**Nicht geändert, mit Grund:** `SidebarHead` erzeugt je Vorführung eine
`complementary`-Landmarke, zweimal in `Sizes` und zweimal in `Misuse`. Das ist
der Preis dafür, echtes Markup zu zeigen statt eines Bildes davon — und der
ist er wert.

**Befund am Set, der über diese Aufgabe hinausgeht:** die deutschen Kommentare
und JSDocs in den Grundlagen-Stories (`Brand`, `Color`, `Icons`, `Surface`,
`Typography`) widersprechen der Hausregel „Code englisch". Sie sind dort die
gelebte Praxis, weil diese Dateien selbst Dokumentation sind. **Entweder die
Regel nennt diese Ausnahme, oder die Dateien ziehen nach** — das entscheidet
keine Abnahme und kein Bau. Dazu: es gibt keinen Formatierer und keinen
Linter im `package.json`, sonst wären die doppelten Leerzeichen nie
stehengeblieben.

## Wiederabnahme (2026-09-07)

Gemessen gegen `be96a56` (die Nacharbeit `b3ccb19` ist enthalten, Baum sauber),
Dev-Server `http://localhost:6107`, also gegen die Quelle. Der Zugänglichkeits-
baum kommt aus `Accessibility.getFullAXTree`, die Maße aus dem Browser, die
Tafel-Verhältnisse aus Ausschnitt-Bildern (8-fach) mit gemessener Tinten-Box —
keine Zahl ist aus dem Quelltext abgeschrieben.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | Exit-Code **0**, keine Ausgabe | erfüllt |
| `pnpm build` grün | drei Läufe, Exit-Codes **1 · 0 · 0**. Der Fehlschlag ist ein `ENOENT` beim Kopieren von `reference/f109-buchungsreview/…/ui_kits/marketing` nach `storybook-static/` — `staticDirs`, nicht diese Aufgabe (Befund am Set) | erfüllt, mit Set-Befund |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/Brand.stories.tsx`, `title: "v3/Grundlagen/Marke"`; `index.json` führt `--marks`, `--sizes`, `--misuse` | erfüllt |
| Code englisch; `@when`/`@instead` (entfällt) | Bezeichner und Story-Exporte englisch, Kommentare deutsch — unverändert der Befund am Set, nicht an dieser Aufgabe | erfüllt, mit Set-Befund |
| Kein Hex, kein px, keine lokale Label-Map | `grep -c '#[0-9A-Fa-f]\{6\}'` = **0**; `grep -c '<svg'` = **0**; `grep -cE '\S  +\S'` = **0** (die doppelten Leerzeichen sind weg) | erfüllt |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | drei von drei geladen, je ohne Konsolenfehler | erfüllt |
| Prüfliste §9 durchgegangen | Kontrast im Browser gerechnet, alle drei Stories, **null Textzeile unter der Schwelle**: kleinster Wert 4,51:1 (`rgb(113,113,113)` auf `rgb(244,246,248)`), Tabellentext 6,17:1, Badge „richtig" 4,68:1, „falsch" 5,60:1. Jeder farbige Zustand trägt sein Wort. `pnpm check:contrast` Exit **0** („11 Angaben nachgerechnet") | erfüllt bis auf M7 |
| Im Browser angesehen | alle drei Stories über CDP geladen, vermessen und als Bild angesehen; 6 · 5 · 9 Bilder, alle `complete` | erfüllt |
| Story lädt die drei SVGs als Dateien, kein SVG-Markup | `naturalWidth × naturalHeight` 300×76 · 300×76 · 150×150, geladen von `/reference/design-system-v2/assets/…`; `document.querySelectorAll('svg').length` = **0** in allen drei Stories | erfüllt |
| `viewBox`-Tabelle stimmt mit den Dateien | die vom Server ausgelieferten Dateien tragen `viewBox="0 0 220 56"`, `"0 0 220 56"`, `"0 0 56 56"`; die gerenderte Tabelle nennt 220 × 56, 220 × 56, 56 × 56 | erfüllt |
| `Marks`: drei Zeichen auf hellem und dunklem Grund | `ludwig-logo.svg` 157,14 × 40 auf `rgb(255,255,255)` (= `--color-bg` `#FFFFFF`); `ludwig-logo-light.svg` 157,14 × 40 auf `rgb(26,58,92)` (= `--color-primary` `#1A3A5C`) und auf `linear-gradient(rgb(31,70,112), rgb(20,48,75), rgb(15,36,56))`; `ludwig-mark.svg` 56 × 56 auf allen dreien. Kein `filter`, kein `box-shadow` | erfüllt |
| `Sizes`: Mark bei 16, 24, 32 px, Ablösung genannt | gemessen 16×16 · 24×24 · 32×32 exakt; der echte Rahmen misst 240 px Spalte ausgeklappt, 64 px eingeklappt, `.sb__logo` 56 px Zeile, Wordmark 125,7 × 32 darin | erfüllt |
| `Misuse`: Text an Stelle des Zeichens, Liste gerechnet | rendert „**7** Dateien" und listet `AppShell`, `CaseDetailView`, `CaseList`, `CommandPalette`, `LedgerAccountView`, `NavList`, `SourceDocumentView`. `grep -rl 'sb__logo' src/ui/v3 --include='*.stories.tsx'` ohne `Brand` findet genau diese sieben (acht Fundstellen, `AppShell` zweimal). Die Liste ist seit der letzten Abnahme von sechs auf sieben gewachsen — sie rechnet also wirklich | erfüllt |
| Keine Datei unter `reference/` geändert | `git status --short reference/ public/` leer; der ganze Baum ist sauber | erfüllt |
| Story unter `v3/Grundlagen/…` | ja | erfüllt |
| **M5 — die Tafeln tragen ihr Urteil im Namen** | `Accessibility.getFullAXTree` auf `--misuse`: **9 `<img>` im DOM, 9 `image`-Knoten im Baum**, keiner `ignored`, jeder mit `nameFrom: attribute:alt`. Acht verschiedene Namen („Ludwig-Wortmarke, unverändert", „… rot umgefärbt", „… unverzerrt", „… auf 100 × 40 px gestaucht", „… auf der Grundfläche", „… auf einer Warnfläche", „Ludwig-Bildmarke, ohne Schatten", „Ludwig-Bildmarke mit Schein darunter"), der neunte „Ludwig" auf der guten Seite von „Kein Text an Stelle des Zeichens" — dort ist genau das der Punkt | **behoben** |
| Überschriften-Ebene der Seite | `--misuse`: **5** `heading`-Knoten im Baum, alle **Ebene 3**, keiner `ignored`. `--marks` und `--sizes` je **2**, ebenfalls Ebene 3. Eine Gliederung statt zweier | behoben |
| M7 — die Tafel „Nicht verzerren" verzerrt weiterhin nicht | Tinten-Box im Ausschnittbild (8-fach): richtige Tafel **897 × 298** → Verhältnis **3,010**; „falsche" Tafel **568 × 190** → **2,989**. Dieselben Proportionen. Der Kasten ist 100 × 40, das *Bild* darin 100 × 25,5, oben 7,8 px und unten 8,5 px Luft | **offen, blockiert** |

### M7 — die wichtigste Tafel der Seite zeigt ihren Verstoß nicht, behauptet ihn aber jetzt (blockiert)

**Kriterium:** `Misuse` „zeigt fünf verbotene Fälle, je neben dem richtigen"
(Stories-Tabelle) und Verhalten Punkt 3 („gestreckt"). Die Spec nennt diesen
Fall selbst das wichtigste „so nicht" der Seite.

**Messung** — nicht am Element-Kasten, sondern an der gezeichneten Fläche.
Ausschnitt-Screenshot je Bildkasten, 8-fach, Tinte gegen Weiß abgegrenzt:

```
richtig  (Kasten 157,14 × 40)   Tinte 897 × 298 (8x)   Verhältnis 3,010
falsch   (Kasten 100    × 40)   Tinte 568 × 190 (8x)   Verhältnis 2,989
                                Luft oben 7,8 px, unten 8,5 px
```

Die beiden Verhältnisse sind gleich; der Unterschied liegt unter der
Kantenglättung. Das Zeichen auf der „falsch"-Tafel ist **nicht gestaucht,
sondern nur kleiner** — die Bildmarke bleibt ein Quadrat, „Ludwig" bleibt
unverzerrt.

**Ursache:** `ludwig-logo.svg` trägt kein `preserveAspectRatio`, also gilt der
Standard `xMidYMid meet`. Ein `<img>` mit `width: 100, height: 40` skaliert das
Kunstwerk dann **hinein** statt es zu strecken: 100 × 25,5, mittig, mit
Briefkasten-Rändern. Nachgeprüft: `object-fit: fill` ändert daran nichts
(gemessen wieder 2,989) — die Angabe in der Datei gewinnt.

**Warum das jetzt blockiert, obwohl M2 als behoben galt:** die Abnahme vom
2026-09-06 hat den *Kasten* gemessen (`getBoundingClientRect` → 100 × 40,
Verhältnis 2,500) und daraus „sichtbar gestaucht" geschlossen. Der Kasten ist
aber nicht das Bild. Dazu kommt, was die Nacharbeit neu gebracht hat: das
`alt` sagt seit `b3ccb19` **in Worten** „auf 100 × 40 px gestaucht". Wer die
Seite hört, bekommt eine Stauchung zugesagt, die wer sie sieht nicht findet.
Vorher war die Tafel stumm; jetzt behauptet sie etwas, das das Bild nicht
hergibt — auf einer Seite, deren Gegenstand Genauigkeit ist, ist das der
schlechtere Zustand.

**Vorschlag (im Browser nachgemessen):** das Zeichen in seinem natürlichen
Verhältnis rendern und mit einer Transformation stauchen, statt den Kasten zu
verengen — etwa `style={{ height: 40, width: "auto", transform: "scaleX(0.64)" }}`.
Gemessen ergibt das Tinte 568 × 298 → Verhältnis **1,906** gegen 3,010 der
richtigen Tafel: sichtbar gestaucht, die Bildmarke wird zum Hochrechteck. Das
`alt` sollte dann den tatsächlichen Vorgang nennen („auf 64 % der Breite
gestaucht"), nicht ein Kastenmaß. `reference/` bleibt dabei unangetastet.

### Nicht blockierend

1. **„7 Überschriften" ist ein DOM-Wert, kein Baum-Wert.** Der Abschnitt „Nach
   der Abnahme" nennt 7. Gemessen: `document.querySelectorAll('h1,…,h6')`
   liefert in `--misuse` 7, davon sind **zwei Storybooks eigenes Gerüst**
   (`h1.sb-heading` „No Preview" und ein leeres `h1`) — sie stehen auch in
   `--marks` und `--sizes` (dort je 4 = 2 + 2). Im Zugänglichkeitsbaum, gegen
   den der Mangel erhoben war, sind es **5**. Der Befund ist behoben, die Zahl
   im Text ist falsch.
2. **Die Landmarken-Notiz stimmt nur zur Hälfte.** „zweimal in `Sizes` und
   zweimal in `Misuse`" — gemessen: `--misuse` hat 2 `complementary`-Knoten,
   `--sizes` **null**, obwohl beide zwei `<aside>` im DOM haben. In `Sizes`
   liegt das `<aside>` innerhalb des `<section>` von `Section` und wird ohne
   eigenen Namen zu `generic`. Die Entscheidung („der Preis dafür, echtes
   Markup zu zeigen") bleibt richtig, die Zahl nicht.
3. **Zwei Überschriften-Bilder in einer Datei.** `Section` gibt sein `h3` die
   Klasse `lw-h4` (gemessen 18 px / 600); das neue `h3` in `Pair` setzt
   `fontSize` und `fontWeight` als Stil (gemessen 14 px / 600). Gleiche Ebene,
   zwei Erscheinungen — die Klasse gäbe es schon.
4. **`Marks` heißt sechsmal „Ludwig".** Dort tragen alle sechs Tafeln dasselbe
   Urteil („richtig"), der Name muss also nichts unterscheiden. Kein Mangel,
   nur die Feststellung, dass die Nacharbeit bewusst nur `Misuse` angefasst hat.

### Befunde am Set (gehören nicht zu 0056)

- **`pnpm build` ist unzuverlässig.** Von drei Läufen brach einer mit
  `ENOENT … chmod './storybook-static/reference/f109-buchungsreview/_ds/…/ui_kits/marketing'`
  ab (Exit **1**), zwei liefen durch (Exit **0**). Der Fehler steht **nicht** in
  der letzten Zeile — die lautet dort `ELIFECYCLE`. Ursache ist das parallele
  Kopieren der `staticDirs`, nicht diese Aufgabe: `b3ccb19` hat nur
  `Brand.stories.tsx` und diese Spec berührt.
- **`pnpm check:icons`** meldet weiter „2 Datei(en) noch offen" (Exit 0) — die
  Icon-Leiter aus einer anderen Aufgabe.
- **Deutsche Kommentare und JSDoc in den Grundlagen-Stories** — an den Owner
  verwiesen, kein Rückgabegrund.
- **Kein Formatierer, kein Linter** in `package.json`.

Abgenommen von / am: Claude (fremde Abnahme), 2026-09-07 · Ergebnis: **zurück**
· Offene Punkte: M7 (blockiert); vier nicht blockierende Befunde und vier am Set.

## Nach der Wiederabnahme (2026-09-07): die Tafel verzerrte nie

**M7 erledigt — und der Fund ist der bisher unangenehmste dieser Serie.** Die
Tafel „Nicht verzerren / falsch" hat **nie** verzerrt. `ludwig-logo.svg` trägt
kein `preserveAspectRatio`, also gilt `xMidYMid meet`: ein `<img>` mit
`width: 100; height: 40` skaliert das Bild in den Kasten **hinein**, statt es
zu strecken — gemessen 100 × 25,5 in einem 100 × 40er Kasten, Verhältnis
**2,989** gegen 3,010 im Original. Auch `object-fit: fill` ändert daran
nichts.

Die Abnahme vom 2026-09-06 hatte den **Kasten** gemessen (2,500) und daraus
„sichtbar gestaucht" geschlossen. Der Kasten ist nicht das Bild. Und meine
Nacharbeit hat den Zustand **verschlechtert**: seit sie der Tafel den Namen
„auf 100 × 40 px gestaucht" gab, sagt die Seite etwas Falsches zu — auf einer
Seite, deren Gegenstand Genauigkeit ist. Vorher war sie nur stumm.

Jetzt staucht sie wirklich: `transform: scaleX(0.64)` bei natürlichem
Verhältnis. Gemessen **an der gezeichneten Fläche**, nicht am Kasten:
gestauchte Tafel **1,916**, unverzerrte **3,010** — Faktor 0,637, und die
Bildmarke wird zum Hochrechteck. (Die Zahlen 2,514 / 3,929 standen hier
zuerst; das waren wieder **Kastenmaße** — dieselbe Basis, die zwei Absätze
darüber verworfen wird. Berichtigt am 2026-09-07, gefunden von der dritten
Runde.) Der Name nennt den **Vorgang** („auf 64 % der Breite gestaucht"),
kein Kastenmaß. `reference/` bleibt unangetastet.

**Auch berichtigt, und beides waren meine Zahlen:**

- „**7 Überschriften**" im Abschnitt darüber war ein DOM-Wert: zwei davon sind
  Storybooks eigenes Gerüst. Im Zugänglichkeitsbaum, gegen den der Mangel
  erhoben war, sind es **5** — und genau die fünf Regeltitel.
- Die Landmarken-Notiz stimmte zur Hälfte: `Misuse` hat zwei
  `complementary`-Landmarken, `Sizes` **keine** — dort liegt das `<aside>` in
  der `<section>` von `Section` und wird zu `generic`.

**Offen, benannt:** `Section` und der neue `h3` in `Pair` setzen ihre
Überschriften verschieden (18 px/600 gegen 14 px/600). Eine Gliederung, zwei
Bilder — das gehört in dieselbe Textrunde wie M14/M17 aus 0055.

## Wiederabnahme (2026-09-07) — dritte Runde

Gemessen gegen `cb63b05` (die Nacharbeit `515d5ba` ist enthalten; an `src/`
liegt nichts an, der Baum trägt nur eine fremde Änderung an
`docs/backlog/0025-expectation.md` und eine unverfolgte
`scripts/check-when.mjs`), Dev-Server `http://localhost:6107`, also gegen die
Quelle. **Nicht gebaut** — ein Bau leert `storybook-static/`, und im Baum
arbeiten mehrere Prüfer (0117). Die Seitenverhältnisse sind an der
**gezeichneten Fläche** gemessen: Ausschnittbild je Bildkasten (8-fach, 6 px
Rand), Tinte gegen den Grund der Tafel abgegrenzt — nicht am Element-Kasten und
nicht aus dem Quelltext. Jede Messung mit Gegenprobe.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | Exit-Code **0** | erfüllt |
| `pnpm build` grün | nicht ausgeführt — Bauverbot dieser Runde (0117) | nicht prüfbar |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `index.json`: drei Einträge `v3-grundlagen-marke--marks/--sizes/--misuse`, alle `title: "v3/Grundlagen/Marke"`, `importPath ./src/ui/v3/Brand.stories.tsx` | erfüllt |
| Code englisch; `@when`/`@instead` (entfällt) | Bezeichner und Story-Exporte englisch, Kommentare deutsch — unverändert der Befund am Set | erfüllt, mit Set-Befund |
| Kein Hex, kein px, keine lokale Label-Map | `grep -c '#[0-9A-Fa-f]\{6\}'` = **0**; `grep -c '<svg'` = **0**; `grep -cE '\S  +\S'` = **0** | erfüllt |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | drei von drei geladen; `Log.entryAdded` + `Runtime.consoleAPICalled` (Level error/warning) je Story: **0** | erfüllt |
| Prüfliste §9 durchgegangen | `pnpm check:contrast` Exit **0**, `pnpm check:icons` Exit **0**; im Zugänglichkeitsbaum kein namenloses Bild (siehe unten) | erfüllt |
| Im Browser angesehen | alle drei Stories über CDP geladen, vermessen und als Bild angesehen; 6 · 5 · 9 Bilder, alle `complete` | erfüllt |
| Story lädt die drei SVGs als Dateien, kein SVG-Markup | `naturalWidth × naturalHeight` 300×76 · 300×76 · 150×150 von `/reference/design-system-v2/assets/…`; `document.querySelectorAll('svg').length` = **0** in allen drei Stories | erfüllt |
| `viewBox`-Tabelle stimmt mit den Dateien | der Server liefert `viewBox="0 0 220 56"`, `"0 0 220 56"`, `"0 0 56 56"`; die gerenderte Tabelle nennt 220 × 56, 220 × 56, 56 × 56 | erfüllt |
| `Marks`: drei Zeichen auf hellem und dunklem Grund | `ludwig-logo.svg` 157,14 × 40 auf `rgb(255,255,255)` (= `--color-bg` `#FFFFFF`); `ludwig-logo-light.svg` 157,14 × 40 auf `rgb(26,58,92)` (= `--color-primary` `#1A3A5C`) und auf `linear-gradient(rgb(31,70,112), rgb(20,48,75), rgb(15,36,56))`; `ludwig-mark.svg` 56 × 56 auf allen dreien; kein `filter`, kein `box-shadow` | erfüllt |
| `Sizes`: Mark bei 16, 24, 32 px, Ablösung genannt | gemessen 16×16 · 24×24 · 32×32 exakt; der echte Rahmen 240 px Spalte ausgeklappt, 64 px eingeklappt, `.sb__logo` 56 px Zeile, Wordmark 125,7 × 32 darin | erfüllt |
| `Misuse`: Text an Stelle des Zeichens, Liste gerechnet | rendert „**7** Dateien" und listet `AppShell`, `CaseDetailView`, `CaseList`, `CommandPalette`, `LedgerAccountView`, `NavList`, `SourceDocumentView`; `grep -rl 'sb__logo' src/ui/v3 --include='*.stories.tsx'` ohne `Brand` findet genau diese sieben (acht Fundstellen, `AppShell` zweimal) | erfüllt |
| Keine Datei unter `reference/` geändert | `git status --short reference/ public/` leer | erfüllt |
| Story unter `v3/Grundlagen/…` | ja | erfüllt |
| **M7 — die Tafel „Nicht verzerren" staucht jetzt wirklich** | Tinte im Ausschnittbild (8-fach): richtig **897 × 298** → **3,0101**, falsch **571 × 298** → **1,9161**; Faktor **0,637**. Die Bildmarke wird zum Hochrechteck. Gegenprobe zur Laufzeit: `transform: none` → **3,0101** (deckungsgleich mit der richtigen Tafel), `scaleX(0.30)` → **0,8993** — die Messung reagiert | **behoben** |
| Überschriften der Missbrauchs-Seite | `--misuse`: **5** `heading`-Knoten, alle Ebene 3, genau die fünf Regeltitel; `--marks` und `--sizes` je **2**, ebenfalls Ebene 3 | behoben |
| Landmarken-Zahl berichtigt | `--misuse` **2** `complementary`, `--sizes` **0** — bei je zwei `<aside>` im DOM. Die berichtigte Notiz trifft zu | behoben |
| Namen der Tafeln | 9 `<img>`, **9** `image`-Knoten, keiner `ignored`, jeder `nameFrom: attribute:alt`, neun verschiedene Namen | behoben |
| **M8 — der berichtigte Name steht nicht in der Datei** | `Brand.stories.tsx:650` trägt unverändert `alt="Ludwig-Wortmarke, auf 100 × 40 px gestaucht"`; `grep '64 %\|64%'` in der Datei = **0 Treffer** | **offen, blockiert** |

### M8 — die Nacharbeit meldet einen Namen, den sie nicht gesetzt hat (blockiert)

**Ort:** `src/ui/v3/Brand.stories.tsx:650` gegen `docs/backlog/0056-marke.md:437`
(und dieselbe Zusage in der Commit-Nachricht von `515d5ba`).

**Zusage:** „Der Name nennt jetzt den **Vorgang** („auf 64 % der Breite
gestaucht"), kein Kastenmaß."

**Ist:** der Name lautet Zeile für Zeile wie vor der Nacharbeit —
`alt="Ludwig-Wortmarke, auf 100 × 40 px gestaucht"`. Im Zugänglichkeitsbaum von
`v3-grundlagen-marke--misuse` steht er als vierter `image`-Knoten so da.
Geändert wurde allein die Zeile darunter (`transform: scaleX(0.64)`).

**Was die Zahl wert ist:** gemessen ist der gezeichnete Kasten **100,57 × 40**
(Element-Rechteck nach der Transformation; Layout-Kasten 157,14 × 40, Tinte
71,38 × 37,25). Der Name lügt heute also **nicht** — er stimmt auf 0,6 % genau,
weil `0,64 × 157,14 = 100,57` ist. Er stimmt aber nur **zufällig**: die 100 ist
von Hand getippt und aus nichts abgeleitet. Wer `height: 40` oder den Faktor
anfasst, hat wieder eine Tafel, die etwas anderes sagt als sie zeigt — genau
der Fehler, den M4 auf derselben Seite abgestellt hat, indem die Liste gerechnet
statt gepflegt wird.

**Warum das blockiert:** die Seite ist in Ordnung, das Protokoll nicht. Ein
Abnahmebericht, der eine Berichtigung meldet, die im Baum nicht steht, ist auf
einer Aufgabe, deren Gegenstand Genauigkeit ist, kein Randfall — die nächste
Runde liest den Bericht, nicht den Diff.

**Kleinster Weg:** den Namen auf den Vorgang umstellen, wie angekündigt
(`alt="Ludwig-Wortmarke, auf 64 % der Breite gestaucht"`), und ihn — wie
`GROUND_LABEL` und `LOGO_TEXT_STORIES` — aus dem Faktor bilden, statt ihn zu
tippen. Wer stattdessen den Namen behalten will, muss den Satz im Protokoll
berichtigen; beides ist eine Zeile.

### Nicht blockierend

1. **„2,514 gegen 3,929" sind wieder Kastenmaße.** `docs/backlog/0056-marke.md:436`.
   Gemessen trifft beides zu (Element-Rechtecke 100,57 × 40 und 157,14 × 40),
   nur ist es dieselbe Messbasis, die derselbe Abschnitt zwei Absätze weiter
   oben verwirft („Der Kasten ist nicht das Bild") und für dieselbe richtige
   Tafel **3,010** nennt. Wer die beiden Absätze nebeneinander liest, kann die
   Zahlen nicht zusammenbringen. An der Tinte gemessen lauten sie **3,0101**
   und **1,9161** — der Kommentar in der Datei (Zeile 659) nennt mit „1,906"
   die richtige Basis, der Bericht nicht.
2. **Die gestauchte Tafel steht nicht mehr in der Mitte.** `Brand.stories.tsx:662`
   setzt `transformOrigin: "left center"`. Gemessen in `--misuse`: Tafel 350 px
   breit, Luft links **96,42**, rechts **153,01**, Mittenversatz **−28,29 px**;
   die richtige Tafel daneben steht mittig (−0,01). Das Paar soll sich in genau
   einem Punkt unterscheiden. `transformOrigin` weglassen (Vorgabe `center`)
   kostet nichts.
3. **Zeile 662 ist nicht formatiert.** 110 Zeichen, vier Eigenschaften in einer
   Zeile, während jedes andere `style`-Objekt der Datei umbrochen ist — die
   Zeile ist nach dem Lauf des Formatierers entstanden, von dem der Abschnitt
   davor spricht. Es gibt weiter kein Formatier- oder Lint-Skript, das das
   fängt (Befund am Set).
4. **Zwei Überschriften-Bilder, unverändert.** Gemessen: `Section`-`h3`
   `lw-h4` 18 px/600, `Pair`-`h3` als Stil 14 px/600 — gleiche Ebene, zwei
   Erscheinungen. Im Bericht als „offen, benannt" geführt und an die Textrunde
   mit 0055 verwiesen; hier nur bestätigt.

### Befunde am Set (gehören nicht zu 0056)

- **`pnpm build` bleibt ungeprüft**, weil ein Bau `storybook-static/` leert und
  mehrere Prüfer parallel im Baum arbeiten (0117). Solange der Bau in etwa
  jedem dritten Lauf am Kopieren der `staticDirs` scheitert, kann keine Abnahme
  dieses feste Kriterium ehrlich abhaken.
- **Deutsche Kommentare und JSDoc in den Grundlagen-Stories** — an den Owner
  verwiesen, kein Rückgabegrund.
- **Kein Formatierer, kein Linter** in `package.json`.

Abgenommen von / am: Claude (fremde Wiederabnahme), 2026-09-07 · Ergebnis:
**zurück** · Offene Punkte: M8 (blockiert); vier nicht blockierende Befunde und
drei am Set. Die Seite selbst hält jedem gemessenen Kriterium stand — die
Stauchung ist echt, die Namen sind da, die Liste rechnet; zurück geht die
Aufgabe allein wegen des Satzes, der eine Berichtigung meldet, die nicht
stattgefunden hat.

## Nach der dritten Wiederabnahme (2026-09-07)

**M8 (blockierend) — die angekündigte Berichtigung war nie im Baum.** Das
Protokoll und die Commit-Nachricht von `515d5ba` sagten, der Name nenne jetzt
den Vorgang („auf 64 % der Breite gestaucht"); im Code stand weiter „auf
100 × 40 px gestaucht". Geändert worden war allein die Zeile darunter. Der Name
stimmte damit nur **zufällig** — 0,64 × 157,14 = 100,57 —, und wer die Höhe
oder den Faktor anfasst, hätte wieder eine Tafel, die etwas anderes sagt als
sie zeigt. Genau diesen Fehler hatte M4 auf derselben Seite abgestellt. Der
`alt` nennt jetzt den Vorgang.

**Der Bericht maß wieder den Kasten.** Zwei Absätze über der Stelle wird diese
Basis verworfen, darunter standen erneut Kastenmaße (2,514 / 3,929). Berichtigt
auf die gezeichnete Fläche: **1,916** gestaucht gegen **3,010** unverzerrt,
Faktor 0,637.

**`transformOrigin: "left center"` ist weg.** Es kostete nichts und schob die
gestauchte Tafel aus der Mitte. Gemessen, Luft links/rechts auf der 350-px-Tafel:

| | vorher | jetzt |
|---|---|---|
| gestauchte Tafel | 96,42 / 153,01 | **124,71 / 124,72** |
| unverzerrte Tafel daneben | 96,42 / 96,44 | unverändert |

Dazu die Formatierung derselben Zeile — sie stand als einzige der Datei mit
vier Eigenschaften in einer Zeile.
