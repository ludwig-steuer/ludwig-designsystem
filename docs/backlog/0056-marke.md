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
