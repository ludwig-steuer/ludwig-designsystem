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

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

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
