# 0055 · Grundlagen — Farbe, Raum und Fläche, Icons

| | |
|---|---|
| Status | Abnahme |
| Stufe | keine Komponente — drei Stories zu `src/styles/tokens.css` in der Gruppe `v3/Grundlagen` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, Tokens und Icon-Regeln sind fachfrei |
| Quelle | Anfrage Owner vom 2026-09-03 („Farben, Shades, Bedeutung der Farben festlegen, damit wir eine Übersicht haben") · `design-guidelines.md` §11.7 Stufe 0 · Fortsetzung von 0037 · Review 2026-09-03 mit Owner-Entscheiden A8 (Icon-Leiter) und A9 (`warning-strong`) |
| Ersetzt | nichts — die Tokens stehen seit dem ersten Tag, nur ohne Nachweis |
| Blockiert | jede Seitenmigration, die „welchen Ton nehme ich?" beantworten muss; die Icon-Hebung aus §11.7 Stufe 0 („12 Dateien mit Unicode-Icons"); den Rückbau von `warning-strong` (A9) |
| Spec von / am | Claude, 2026-09-03 · Review und Ergänzung Claude, 2026-09-03 |
| Gebaut von / am | Claude, 2026-09-04 — `Color.stories.tsx`, `Surface.stories.tsx`, `Icons.stories.tsx` |

## Ziel

Wer heute eine v3-Komponente baut, hat für Schrift eine Probe (0037) und für
alles andere nichts. Farbe, Abstand, Radius, Schatten und Icon-Größe stehen
vollständig in `tokens.css` — 40 Farb-Token, 12 Space-Stufen, 6 Radien,
8 Schatten, 3 Dauern, 7 Breiten —, aber sie sind nirgends nebeneinander zu
sehen. Die Folge steht in `design-guidelines.md` §11.5: 18 Hex-Literale für
`--color-warning`, Unicode-Icons in 12 Dateien, Icon-Größen zwischen 12 und
16 px in einem Set, dessen Regel 16/20/24 sagte. Wer die Leiter nicht sieht,
rät — und rät jedes Mal anders.

Dazu kommt, was **nicht** in `tokens.css` steht, sondern als ungeschriebene
Konvention in `v3.css` lebt: welche Tonstufe Hover nimmt, wie ein
ausgewählter oder gesperrter Zustand aussieht, welche Ebene über welcher
liegt. Das ist genau die Frage „welchen Ton nehme ich?", nur ohne Token.

Die Aufgabe liefert den fehlenden Nachweis: drei Storybook-Seiten, auf denen
jedes Token einmal steht, **mit seiner Bedeutung** („wofür ist das da, wann
nehme ich es nicht") und, wo es Text trägt, mit seinem gemessenen Kontrast;
dazu die ungeschriebenen Konventionen, einmal aufgeschrieben und gezeigt.
Kein neues Token, keine neue Klasse, kein Zeilenwechsel in `tokens.css`.

## Einordnung

- **Wiederverwenden:** die Token selbst. §3 Regel 1 in Reinform, wie schon bei
  0037 — der Fall ist gedeckt, es fehlt der Nachweis. Kein `@when` in
  `src/ui/v3` beschreibt eine Farbübersicht; `StatusBadge` zeigt die
  Kritikalitätsskala nur im Ausschnitt einer Achse, nicht als Skala.
- **Neu, weil:** nichts wird neu gebaut. Neu sind drei Stories in der
  bestehenden Gruppe `v3/Grundlagen`, die 0037 für genau diesen Zweck
  eröffnet hat.
- **Zuschnitt: drei Dateien, eine Aufgabe.** Die Story-Ableitung (§6) ergibt
  zusammen 13 Stories, also über der Obergrenze 10 — nach §4 wird getrennt.
  Getrennt wird nach Frage, nicht nach Token-Art: „welche Farbe?" · „wie viel
  Platz, welche Kante, welche Ebene, welcher Zustand?" · „welches Zeichen?".
  Eine Aufgabe bleibt es, weil alle drei denselben Auftrag erfüllen (Tokens
  und Konventionen sichtbar machen), dasselbe Muster benutzen und zusammen
  abgenommen werden.
  - `src/ui/v3/Color.stories.tsx` → `v3/Grundlagen/Farbe`
  - `src/ui/v3/Surface.stories.tsx` → `v3/Grundlagen/Raum und Fläche`
  - `src/ui/v3/Icons.stories.tsx` → `v3/Grundlagen/Icons`

  Alle drei auf Barrel-Ebene neben `Typography.stories.tsx`, weil sie zu
  keiner Stufe gehören. **Nicht hier:** die Marke (Wordmark, Mark,
  Light-Variante) — das ist 0056, eine eigene kleine Aufgabe in derselben
  Gruppe.
- **Setzt auf:** `tokens.css`, `v3.css` (für die gemessenen Konventionen),
  `lucide-react`, `patterns/entity-icons.ts`. Für die Einsatz-Stories
  zusätzlich `ProseCard`, `StatusBadge`, `Button`, `IconButton`, `Row` —
  jeweils als Beispiel, nicht als Gegenstand.

## Schnittstelle

Keine — die Aufgabe liefert keine Komponente und damit keine Props. An ihre
Stelle tritt der **festgelegte Inhalt** unten; er ist die Messlatte der
Abnahme.

Ein Helfer ist erlaubt und nicht exportiert: eine Funktion, die einen
CSS-Custom-Property-Wert vom `:root` liest und, für Farben, den
WCAG-Kontrast gegen zwei Gründe (`--color-bg`, `--color-bg-soft`) rechnet.
Sie steht in `Color.stories.tsx`, hat keinen eigenen Export außerhalb der
Datei und keine Story.

## Verhalten

Reine Anzeige, kein Zustand, keine Tastaturwege.

**Laufzeitwerte statt Abschrift:** die Farbkacheln lesen ihre Werte über
`getComputedStyle(document.documentElement)`, nicht aus einer abgeschriebenen
Liste. Damit steht **kein einziges Hex in TSX** (V13), und die Kontrastzahlen
können nicht veralten, wenn jemand einen Token ändert — der Fehler, den K2
schon einmal gekostet hat (18 Literale neben einem Token). Storybook rendert
im Browser; die Server/Client-Unterscheidung von Next spielt für Stories
keine Rolle und wird hier nicht getroffen.

### Inhalt — `Color.stories.tsx`

1. **Die Rampen**, je Familie eine Reihe, jede Kachel mit Token-Name, gelesenem
   Wert und Kontrast gegen Weiß und `bg-soft`:
   `primary` 500–900 · `accent` 50–700 · Text (4 Stufen + beide `on-dark`) ·
   Grund (`bg`, `-soft`, `-sunken`) · Fläche (`surface`, `-raised`, `-head`) ·
   Rand (`subtle`, `border`, `strong`, `control`) · Semantik
   (`success`/`warning`/`danger`/`info`, je mit `-bg`) · Scrim und Fokus.
   `--color-warning-strong` steht in seiner Reihe mit dem Vermerk
   „entfällt (A7, A9) — Rückbau offen", nicht stillschweigend und nicht
   gelöscht.
2. **Die Rollen** als Tabelle, wörtlich aus `design-guidelines.md` §3: welche
   Rolle welchen Token nimmt und ob er als **Text**, als **Fläche** oder als
   **Rand/Icon** zugelassen ist. Die drei Häkchen sind der eigentliche Inhalt:
   `--color-accent` darf keinen Text tragen (3.55:1), `--color-accent-700`
   schon (4.81:1) — das ist die Regel, an der man sonst vorbeigreift.
   Zwei weitere Spalten machen die Tabelle zur Entscheidungsvorlage, die der
   Owner bestellt hat: **„ohne Rolle"** für jeden Token, dem §3 keine Rolle
   gibt (heute `primary-500`, `primary-900`, `accent-500`, `surface-raised`),
   und **„unbenutzt"** für jeden Token, den kein Stylesheet und keine
   Komponente per `var()` liest (gemessen 2026-09-03: `primary-900`,
   `primary-500`, `accent-500`, `text-on-dark-muted`, `success-bg`, `info-bg`,
   `focus-ring`). Beide Spalten werden gerechnet, nicht abgeschrieben — die
   Liste hier ist der Stand beim Schreiben. Dazu ein Satz: es gibt keinen
   Dark Mode (`ton-und-sprache.md` Hard Rule 8), die Palette ist eine.
3. **Die Kritikalitätsskala** (§3, A7): vier Stufen Fehler · Warnung · Hinweis
   · Debug, je mit Registry-`kind`, Bedeutung in einem Satz und einem echten
   Beispiel („L7 > ±100 %", „Klärung offen"). Daneben `success` als das, was
   es ist: kein Skalenwert, sondern der Ausgang „erledigt". Und der Satz, der
   die häufigste Verwechslung abräumt: Vorzeichen, Kategorie, Belegart,
   Mandant tragen **keine** Farbe.
4. **Kontrast**, alle textfähigen Token als eine Liste, gerechnet statt
   zitiert, mit der Schwelle daneben (4.5:1 Text, 3:1 Rand/Icon/Fokus, V10).
   Wer unter der Schwelle liegt, steht sichtbar markiert da — heute
   `--color-success` auf `success-bg` (4.46:1, §12 „offen") und der
   Kontroll-Rand, den `.v2in` nicht benutzt (Befund 9).

### Inhalt — `Surface.stories.tsx`

1. **Raum**: die Leiter `--space-1` … `--space-24` als Balken mit Pixelwert,
   dazu das 4-px-Grundraster / 8-px-Rhythmus (§2) und die zwei Sätze, die man
   wirklich braucht: Kartenpadding ≥ `--space-5`, Inhaltskarte `--space-6`.
2. **Kante**: die sechs Radien an derselben Fläche nebeneinander, jeder mit
   seinem Einsatzort (sm Input/Tag · md Button/Karte · lg große Karte/Dialog ·
   xl nur Hero · pill nur Status-Badge), dazu die drei **Rand-Töne bei 1 px**
   (`--border-1`, `-strong`, `-subtle`) und die Regel aus §2: 1 px, nie
   dicker, einzige Ausnahme der aktive Tab mit 2 px. Die aktive Zeile mit
   3 px (Befund 4) steht daneben als Abweichler.
3. **Tiefe und Ebenen**: `--shadow-xs/sm/md/lg`, `-inset`, `-drawer` und die
   beiden Glows, je an einer Karte, mit dem Satz „Karte bevorzugt Rand — Rand
   **oder** Schatten, nie beides" (§2) und der Ebenen-Zuordnung (Menü,
   Popover, Dialog, Drawer). Die Gradienten stehen hier mit dem Vermerk „nur
   lesendes Register". Darunter die **Ebenen-Leiter**, wie sie in `v3.css`
   gemessen ist, als Stapel gezeichnet: sticky 5 · Liste unter einem Feld 20
   · Menü und Popover 40 · Scrim, Dialog, Drawer, Toast 60/61 — mit dem
   Befund, dass die Alt-Stylesheets eigene Leitern fahren (Befund 6) und ein
   Alt-Drawer deshalb über jedem v3-Dialog liegt. Kein Token dafür; die Story
   schreibt die Leiter auf, damit die nächste Ebene sie liest.
4. **Breite**: `--container-narrow/base/wide/app`, `--content-measure`, die
   drei Drawer-Breiten — als Linien mit Maß, nicht als Text. Dazu der Grund
   für `--container-app: 1440px` (Tabellen auf 27") und die eine Schwelle,
   die es gibt: **1280 px Innenbreite** (L1), darunter die Sperre. Der zweite
   Breakpoint 1160 px in `v3.css` steht als Befund daneben (Befund 10).
5. **Zustände**: dasselbe Element viermal — Ruhe · Hover · ausgewählt ·
   gesperrt — an einer Zeile, einem Knopf und einem Chip; beim Primärknopf
   zusätzlich gedrückt. Je Zustand die Tonstufe, die `v3.css` heute nimmt und
   die damit Regel wird: Hover hebt den Grund **eine** Stufe (`bg` →
   `bg-soft`, `bg-soft` → `bg-sunken`, Primär `-700` → `-600`; Link:
   Unterstreichung), gedrückt Primär `-800`, ausgewählt `accent-50` mit
   Akzentkante, gesperrt `opacity .5` und `cursor: not-allowed`. Cursor
   `pointer` nur, was klickt. Dazu die beiden Sätze aus §2: ohne Hover ist
   ein Element nicht klickbar; nichts bekommt Hover, was nicht klickt.
6. **Bewegung und Fokus**: die drei Dauern × drei Kurven an einem Element, das
   auf Klick einmal einblendet; daneben der Fokusring an drei Elementen
   (Knopf, Eingabe, Zeile) und die Regel „nie abgeschaltet" (V10). Dazu die
   Regel, die bis heute nirgends stand: **jede Transition und Animation
   respektiert `prefers-reduced-motion: reduce`** — aus oder auf Fade
   reduziert (§2 Bewegung). Die Story nennt den Stand (Befund 7); umschalten
   kann sie die Media-Query nicht, das prüft der Abnehmende im Browser.

### Inhalt — `Icons.stories.tsx`

1. **Maß und Strich**: die **Icon-Leiter je Register** (A8, Owner
   2026-09-03) — produktiv 12/14/16 px, lesend 16/20/24 px, beide bei Stroke
   1.5 in `currentColor`, je Stufe der Schriftschritt, dem sie folgt
   (`--fs-ui-sm`/`-xs` → 12, `--fs-ui`/`-md` → 14, `--fs-ui-lg`/`-xl` → 16;
   `.lw-body` → 16, Knopf/Liste lesend → 20, Kopf/Leerzustand → 24). Darunter,
   als Befund, die **gemessene** Wirklichkeit von `src/ui/v3`: Größen 12 ·
   12.5 · 13 · 14 · 15 · 16, Strokes 1.5 · 1.75 · 2. Was auf der Leiter steht,
   ist grün; was daneben liegt (12.5, 13, 15; 1.75, 2), ist markiert und wird
   beim nächsten Anfassen der Komponente auf die Leiter gezogen (Befund 1).
2. **Das Vokabular**: die 41 heute in `src/ui/v3` (ohne Stories) benutzten
   Lucide-Icons, gruppiert nach Bedeutung (navigieren · öffnen/schließen ·
   bestätigen · verwerfen · informieren · Entität · Fachwelt), je mit dem Namen
   und der Stelle, an der sie stehen. Zweck: wer „schließen" braucht, nimmt
   `X` und erfindet kein zweites Zeichen. Der Typ-Import `LucideIcon` zählt
   nicht; die 20 weiteren Icons, die nur Stories importieren, stehen als
   eigener, schmaler Block „nur in Stories". Die drei Entitäts-Icons aus
   `entity-icons.ts` (Receipt=Beleg, Layers=Sachverhalt, BookOpen=Buchung)
   stehen als eigener Block, mit dem Grund, warum die übrigen 50 Achsen keins
   haben.
3. **Nie ohne Wort** (T8, V7, V14): dasselbe Icon dreimal — richtig (Icon +
   Wort), erlaubte Ausnahme (`IconButton` unter allen drei Bedingungen:
   konventionell, umkehrbar, nicht der einzige Weg), falsch (Icon-only für
   eine schreibende Handlung, Kebab ohne Wort). Dazu T9: keine Emoji, keine
   Unicode-Zeichen ✓ ✗ ⚠ ● als Bedeutungsträger.

## Stories

Abgeleitet nach §6. Eine Anzeige ohne Props hat keine Zustände, keine Enums
und keine Callbacks; es bleibt je Themenblock eine Übersicht, dazu je Datei
ein Einsatz- oder Regelfall. Titel deutsch (Owner-Konvention wie 0037),
Exportnamen englisch.

**`v3/Grundlagen/Farbe`**

| Story | Beweist |
|---|---|
| `Ramps` | jede Farbfamilie einmal, mit Token-Name, gelesenem Wert, Kontrast; `warning-strong` als „entfällt" |
| `Roles` | welcher Token als Text / Fläche / Rand zugelassen ist (§3); wer ohne Rolle oder unbenutzt ist |
| `Criticality` | die vier Stufen + `success`, je mit Bedeutung und Beispiel (A7) |
| `Contrast` | alle textfähigen Token gegen ihre Schwelle, gerechnet (V10) |

**`v3/Grundlagen/Raum und Fläche`**

| Story | Beweist |
|---|---|
| `Space` | `--space-1…24` als Balken, mit Grundraster und Kartenpadding |
| `Radius` | sechs Radien mit Einsatzort, drei Rand-Töne, 1-px-Regel |
| `Elevation` | Schatten und Glows je an einer Karte, Ebenen-Zuordnung, gemessene z-index-Leiter |
| `Widths` | Container, `content-measure`, Drawer-Breiten als Maßlinien; die 1280-px-Schwelle |
| `States` | Ruhe · Hover · ausgewählt · gesperrt (· gedrückt) an Zeile, Knopf, Chip, mit Tonstufe |
| `Motion` | Dauern × Kurven auslösbar, Fokusring an drei Elementen, Reduced-Motion-Regel |

**`v3/Grundlagen/Icons`**

| Story | Beweist |
|---|---|
| `Sizes` | die Leiter je Register (A8) — und die gemessene Praxis daneben, Abweichler markiert |
| `Vocabulary` | die 41 benutzten Icons nach Bedeutung, Entitäts-Icons separat, Story-only-Icons separat |
| `WithWord` | richtig · erlaubte Ausnahme · falsch (T8, T9, V7) |

Nicht anwendbar: `Empty`, `EmptyAfterFilter`, `Loading`, `Error` — eine
Token-Probe hat keine Daten und lädt nicht. `ImEinsatz` entfällt als eigene
Story: `Roles`, `Elevation`, `States` und `WithWord` zeigen den Einsatz
bereits am Beispiel; eine weitere Karte mit denselben Tokens bewiese nichts
Neues.

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

- [ ] `grep -c '#[0-9A-Fa-f]\{6\}' src/ui/v3/{Color,Surface,Icons}.stories.tsx`
      ist überall `0` — alle Werte kommen aus `getComputedStyle` oder `var(…)`
- [ ] Kein neues CSS: `git diff --stat src/styles/` zeigt für dieses Paket
      keine Änderung
- [ ] Jeder Farb-Token aus `tokens.css` steht genau einmal in `Ramps`;
      Gegenprobe: die Zahl der Kacheln entspricht der Zahl der `--color-*`-
      Deklarationen (`grep -c '^  --color-' src/styles/tokens.css`, heute 40)
- [ ] `Ramps` zeigt `--color-warning-strong` mit dem Vermerk „entfällt (A7, A9)"
- [ ] `Roles` markiert `--color-accent` als **nicht** textfähig und
      `--color-accent-700` als textfähig (§3)
- [ ] `Roles` markiert jeden Token ohne Rolle in §3 als „ohne Rolle" und jeden
      Token ohne `var()`-Leser als „unbenutzt"; Gegenprobe für Letzteres:
      ```
      for t in $(grep -oE '^  --color-[a-z0-9-]+' src/styles/tokens.css | tr -d ' '); do
        rg -q "var\($t\)" src/styles src/ui -g '!*.stories.tsx' || echo "$t"
      done
      ```
      **Korrigiert beim Bauen:** ohne `-g '!*.stories.tsx'` meldet die
      Farbseite selbst jeden Token als benutzt und die Spalte wäre immer leer.
      Die Story misst dieselbe Menge. Heute **acht** Treffer, nicht sieben:
      `--color-surface-raised` ist dazugekommen (siehe „Beim Bauen").
- [ ] `Criticality` nennt für jede der vier Stufen den Registry-`kind`
      (`danger`/`warning`/`info`/`neutral`) und führt `success` außerhalb der
      Skala (A7)
- [ ] `Contrast` rechnet, statt zu zitieren: Ändert man `--color-text-subtle`
      in `tokens.css` versuchsweise auf `#999999`, ändert sich die angezeigte
      Zahl (Nachweis genügt als Beobachtung, die Änderung wird zurückgenommen)
- [ ] `Space` zeigt alle 12 Stufen; keine Zwischengröße wird erfunden
- [ ] `Radius` nennt zu jedem Radius seinen Einsatzort aus §2 und die
      1-px-Regel mit ihrer einen Ausnahme
- [ ] `Elevation` sagt „Rand **oder** Schatten, nie beides", zeigt beide
      Karten nebeneinander und zeichnet die z-index-Leiter aus `v3.css`
      (5 · 20 · 40 · 60/61) mit dem Hinweis auf die Alt-Leitern
- [ ] `Widths` zeigt die 1280-px-Schwelle (L1) als Linie
- [ ] `States` zeigt vier Zustände an drei Elementen und nennt je Zustand die
      Tonstufe; kein Zustand ist nur durch Farbe unterschieden (V7)
- [ ] `Motion` lässt den Übergang auslösen, zeigt den Fokusring an drei
      Elementen sichtbar (V10) und nennt `prefers-reduced-motion`; im Browser
      mit aktivierter Einstellung geprüft: Skeleton pulsiert nicht, Toast
      erscheint ohne Weg
- [ ] `Sizes` zeigt beide Leitern (produktiv 12/14/16, lesend 16/20/24) und
      die gemessene Praxis; die Abweichler 12.5, 13, 15 und Stroke 1.75, 2
      sind markiert
- [ ] `Vocabulary` enthält jedes Icon, das `src/ui/v3` außerhalb der Stories
      importiert; Gegenprobe (heute 41, ohne den Typ `LucideIcon`):
      ```
      rg -oU 'import \{[^}]*\} from "lucide-react"' src/ui/v3 -g '!*.stories.tsx' \
        | rg -o '[A-Z][A-Za-z0-9]*' | rg -v '^LucideIcon$' | sort -u
      ```
- [ ] `WithWord` zeigt die drei Bedingungen der `IconButton`-Ausnahme (T8)
      wörtlich, nicht sinngemäß
- [ ] Alle drei Stories stehen unter `v3/Grundlagen/…`, keine unter
      `Primitives`

## Befunde beim Schreiben der Spec (2026-09-03)

Widersprüche zwischen Regel und Code, beim Bestandslesen aufgefallen. Die
Aufgabe **behebt sie nicht** — sie macht sie sichtbar; das ist der Zweck
einer Übersicht. Jeder ist ein Kandidat für eine eigene Aufgabe; zwei sind
inzwischen entschieden (A8, A9), der Rückbau steht noch aus.

1. **Icon-Maße — entschieden (A8).** Die alte Regel 16/20/24 stammte aus dem
   Marken-Brief und galt dem lesenden Register (16-px-Text). Im produktiven
   Register (13,5 px) folgt das Icon der Schriftstufe, deshalb 12–14 in der
   Praxis. Seit A8 gilt eine Leiter je Register. Gemessen in `src/ui/v3`
   (ohne Stories): Größen 12, 12.5, 13, 14, 15, 16 — Strokes 1.5, 1.75
   (`StatusInfoButton`, `StatusBadge`, `Process`) und 2 (`Combobox`). Auf der
   Leiter liegen 12, 14, 16; die übrigen werden beim nächsten Anfassen der
   Komponente gezogen, nicht in Masse.
2. **`--color-warning-strong` — entschieden (A9): entfällt.** A7 hatte ihn
   gestrichen; §11.5 meldete ihn zugleich als „zurückgeführt" mit neuem Wert —
   der Widerspruch, der die Frage offen hielt. A9 bestätigt A7. Der Rückbau ist
   eine eigene Aufgabe und größer als ein Token: `tokens.css:63`,
   `.v2num--warning-strong` (`v3.css:871`), `CellTone` in `primitives/Cells.tsx`,
   `AbweichungsTon`/`deviationTone()` in
   `src/ludwig/modules/stapelabnahme/domain/vergleich.ts` (vier Stufen
   neutral/warning/warning-strong/danger statt Debug/Hinweis/Warnung/Fehler)
   und zwei Stories. Bis dahin zeigt `Ramps` den Token als „entfällt".
3. **Kontrastzahlen stehen doppelt** — als Kommentar in `tokens.css` und als
   Tabelle in `design-guidelines.md` §12. Das ist genau die Konstellation, die
   K2 erzeugt hat. Die Story rechnet deshalb selbst; die beiden Textstellen
   bleiben, werden aber durch die Story überprüfbar.
4. **Aktive Zeile mit 3-px-Kante.** `.v2tbl__row.is-active` (`v3.css:80`)
   setzt `border-left: 3px`; §2 erlaubt 1 px, einzige Ausnahme der aktive Tab
   mit 2 px. Entweder wird die Ausnahme erweitert oder die Kante auf 2 px
   gezogen.
5. **Scrim als Literal.** `.v2scrim` (`v3.css:690`) schreibt
   `rgba(20, 36, 56, 0.30)` aus, obwohl `--color-scrim` genau diesen Wert
   trägt — der V13-Fall, den diese Spec anprangert, im eigenen Set.
6. **Vier z-index-Leitern.** `v3.css`: 5 · 20 · 40 · 60/61. `components.css`:
   Drawer 90/91, Toast 100. `booking.css`: `.lwdrawer` 1080/1081.
   `app-chrome.css`: 50, Sperre 200. Ein Alt-Drawer liegt über jedem
   v3-Dialog, ein Alt-Toast über jedem v3-Drawer. Kein Token; beim Ablösen der
   Alt-Stylesheets (0043) auf die v3-Leiter ziehen.
7. **Reduced Motion lückenhaft.** `v3.css` hat 9 Transitions und 6 Animations,
   aber nur 3 `prefers-reduced-motion`-Blöcke (Skeleton, Spinner, Toast). Die
   Regel stand bis 2026-09-03 in keinem Dokument; jetzt in §2 Bewegung.
8. **Sieben Token ohne Leser, vier ohne Rolle.** Unbenutzt: `primary-900`,
   `primary-500`, `accent-500`, `text-on-dark-muted`, `success-bg`, `info-bg`,
   `focus-ring`. Ohne Rolle in §3: `primary-500`, `primary-900`, `accent-500`,
   `surface-raised`. Dass `success-bg` und `info-bg` niemand liest, heißt: die
   Badges holen ihre Flächen woanders her — prüfen, ob dort ein Literal steht.
9. **Kontroll-Rand definiert, nicht benutzt.** `.v2in` nimmt
   `--color-border-strong` (1.62:1) statt `--color-border-control` (3.45:1,
   WCAG 1.4.11) — steht schon in §11.5, die `Contrast`-Story macht es sichtbar.
10. **Zweiter Breakpoint.** L1 kennt 1280 px; `v3.css` hat dreimal
    `max-width: 1160px` (Stapelabnahme-Raster). Entweder Ausnahme benennen oder
    auf 1279 ziehen.

## Offene Fragen

Entschieden (Owner, 2026-09-03):

- ~~Icon-Maße: welche Zahl gilt?~~ → **A8**, Leiter je Register (Befund 1).
- ~~`warning-strong` behalten oder streichen?~~ → **A9**, entfällt; Rückbau
  eigene Aufgabe (Befund 2).

Offen:

1. **Gehören die Gradienten (`--grad-*`) in die Übersicht?** *Ohne Antwort:
   ja, aber im `Elevation`-Block und sichtbar mit „nur lesendes Register"
   markiert — wie 0037 es mit `.lw-display`/`.lw-lede` gehalten hat.*
2. **Eine Story oder drei Dateien?** *Beantwortet in der Einordnung: drei
   Dateien, eine Aufgabe, weil 13 Stories über der Obergrenze von 10 liegen.
   Ohne Widerspruch bleibt es dabei.*
3. **Gehört `States` zu „Raum und Fläche" oder zu „Farbe"?** *Ohne Antwort:
   zu Raum und Fläche — der Zustand ist eine Eigenschaft der Fläche, die Farbe
   ist nur sein Mittel. Wer es anders sieht, verschiebt eine Story, keine
   Datei.*

## Beim Bauen aufgefallen (2026-09-04)

Die Spec hat sich an sechs Stellen bewegt. Kein Kriterium ist gefallen; die
Abweichungen stehen hier, damit der Abnehmende sie nicht selbst suchen muss.

1. **Acht Token ohne Leser, nicht sieben.** Zusätzlich zur Liste aus Befund 8
   liest niemand `--color-surface-raised` — er hat weder Rolle in §3 noch
   einen `var()`-Leser. Er ist derselbe Wert wie `--color-surface`.
2. **`--color-accent-500` hat sehr wohl eine Rolle.** §3 nennt ihn wörtlich in
   der Akzent-Reihe („`--color-accent` (`-600`), `-500`, `-100`, `-50`"). Die
   Spec hatte ihn unter „ohne Rolle" geführt; das war ein Lesefehler. Ohne
   Rolle sind stattdessen: `primary-500`, `primary-900`, `surface-raised`,
   `scrim`, `focus-ring-soft` und `warning-strong` (der ohnehin entfällt).
   `scrim` und `focus-ring-soft` nennt §2 („Ebenen", „Fokus"), nicht §3 — die
   Story schreibt das an die Zeile.
3. **Befund 8 bestätigt, mit Fundort.** Dass `success-bg` und `info-bg`
   niemand liest, hat den vermuteten Grund: `.bdg-info`, `.bdg-success` und
   `.bdg-danger` in `app-chrome.css` schreiben Fläche, Text und Rand als
   Hex-Literale aus. Das ist der V13-Fall im eigenen Set — eigene Aufgabe.
4. **Neuer Befund 11: `accent-700` reißt auf der Arbeitsfläche.** §12 nennt
   4,81:1 gegen Weiß; gegen `bg-soft` sind es gemessen **4,44:1** — unter der
   Schwelle. Es ist die *einzige* Akzentstufe, die Text tragen darf, und die
   Arbeitsfläche ist `bg-soft`. Entweder eine Stufe dunkler oder Links auf
   `bg-soft` ausschließen.
5. **Neuer Befund 12: §3 widerspricht sich bei `--color-info`.** Die Tabelle
   gibt ihm „Text: ja", er ist aber ein Alias auf `--color-accent`, dem
   dieselbe Tabelle Text ausdrücklich verbietet (3,55:1). Gerendert wird er
   als Text heute nirgends — die Plaketten nehmen `accent-700`. Entweder die
   Textrolle streichen oder `--color-info` auf `accent-700` legen.
6. **Messgrenzen der Stories.** Zwei Dinge, die der Abnehmende wissen muss,
   damit er die Zahlen richtig liest: Die „unbenutzt"-Messung schließt
   `*.stories.tsx` aus (sonst zählte die Farbseite sich selbst als Leser), und
   `import.meta.glob` liefert die eigene Datei nicht mit — ein Icon, das nur
   `Icons.stories.tsx` importiert, taucht darum nicht unter „nur in Stories"
   auf. Deshalb importiert die Datei ausschließlich Icons, die auch im
   Produktcode stehen; der Kebab im Falsch-Beispiel steht als Satz, nicht als
   Zeichen.

Nicht behoben, weil nicht Auftrag: die zehn Befunde der Spec und die zwei
neuen. Sie stehen jetzt sichtbar in den Stories — das war der Zweck.

## Abnahme

Fremde Abnahme, 2026-09-07. Gemessen am laufenden Dev-Server
(`localhost:6107`) über CDP, nicht an der Quelle: jede Zahl unten ist aus dem
gerenderten Baum gelesen (`getComputedStyle`, `innerText`), die Kontraste sind
unabhängig in Python nachgerechnet und mit der Anzeige verglichen.

**Story-Deckung.** 15 Stories statt der 13 der Spec: `Farbe` 4/4 · `Raum und
Fläche` 6/6 · `Icons` 5 (statt 3). Die Abweichung ist die aus M6: `Vocabulary`
ist mit 0087 in `Entities` · `Actions` · `InUse` zerfallen, das Vokabular kommt
seither aus der Registry. Alle 15 liegen unter `v3/Grundlagen/…`
(`index.json`), keine unter `Primitives`.

### Fest

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build` grün | beide Exit 0; Storybook-Build „completed successfully" | erfüllt |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `Color`/`Surface`/`Icons.stories.tsx` auf Barrel-Ebene neben `Typography.stories.tsx`; Titel `v3/Grundlagen/Farbe` · `…/Raum und Fläche` · `…/Icons` | erfüllt |
| Code englisch (`@when`/`@instead` entfällt) | alle Bezeichner und alle 15 Exportnamen englisch (`Ramps`…`InUse`); Deutsch nur in Nutzertexten und den Story-JSDocs | erfüllt |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Hex 0/0/0 (unten); Status über `StatusBadge axis/status`, keine `{label,kind}`-Map. **px:** vier Reste, siehe M13/M17 | erfüllt mit Mängeln |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | 15 von 15 geladen und gerendert; `Empty`/`Loading`/`Error` in der Spec begründet ausgeschlossen | erfüllt |
| Prüfliste `design-guidelines.md` §9 | durchgegangen; Treffer: „kein px" (M13/M17), sonst sauber — Kontraste, Fokusring, Reduced Motion, Icon-Leiter, Rand-oder-Schatten je unten einzeln gemessen | erfüllt mit Mängeln |
| Im Browser angesehen | alle 15 Stories über `iframe.html?viewMode=story&id=…` geladen; Fokus per echtem `Input.dispatchKeyEvent` (Tab), Reduced Motion per `Emulation.setEmulatedMedia` | erfüllt |

### Variabel

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `grep -c '#[0-9A-Fa-f]\{6\}'` ist überall `0` | Color 0 · Surface 0 · Icons 0 | erfüllt |
| Kein neues CSS | `git diff --stat src/styles/` und `git diff --cached --stat src/styles/` beide leer | erfüllt |
| Jeder Farb-Token genau einmal in `Ramps`; Kachelzahl = Zahl der Deklarationen | gerendert **40** Kacheln, acht Familienreihen, Reihe „Ohne Familie" leer; `grep -c '^  --color-' src/styles/tokens.css` = **40** | erfüllt |
| `Ramps` zeigt `warning-strong` mit „entfällt (A7, A9)" | gerendert: `warning-strong · #9C5021 · 5,86:1 · 5,41:1 · entfällt (A7, A9) — Rückbau offen` | erfüllt |
| `Roles`: `accent` **nicht** textfähig, `accent-700` textfähig | `accent` Text **nein** (rot), Anmerkung „trägt keinen Text — unter 4,5:1"; `accent-700` Text **ja**, „die einzige Akzentstufe für Text". Gemessen: 3,55:1 gegen 5,45:1 | erfüllt |
| `Roles`: „ohne Rolle" und „unbenutzt" gerechnet, nicht abgeschrieben | gerendert „Ohne Rolle: 6 — primary-900, primary-500, surface-raised, warning-strong, scrim, focus-ring-soft"; „Unbenutzt: 5 — primary-900, accent-500, text-on-dark-muted, surface-raised, focus-ring". Gegenprobe der Spec (`rg` über `src/styles src/ui` ohne Stories) liefert **dieselben fünf**. Die acht aus „Beim Bauen" sind seither auf fünf gefallen — die Story zieht mit, weil sie rechnet | erfüllt |
| `Criticality`: vier Stufen mit Registry-`kind`, `success` außerhalb | `danger` · `warning` · `info` · `neutral`, `success` als eigene Zeile „Ausgang ‚erledigt'". Die Plaketten daneben tragen gemessen `#A8403C` · `#8C601E` · `#2B6F9C` · `rgb(45,45,45)` · `#3F7A5A` — die Debug-Zeile nennt beides (M8 hält) | erfüllt |
| `Contrast` rechnet, statt zu zitieren | Nachweis ohne Eingriff in `tokens.css`: `--color-text-subtle` per `Page.addScriptToEvaluateOnNewDocument` auf `#999999` gesetzt, dann geladen. Vorher 4,88:1 / 4,51:1 → nachher **2,85:1 / 2,63:1**, beide neu als „unter der Schwelle" markiert. Alle 39 Zeilen unabhängig nachgerechnet: kein Abweicher | erfüllt |
| `Space` zeigt alle 12 Stufen, keine Zwischengröße | 12 Balken, `space-1`…`-24`; jeder Balken gemessen exakt so breit wie sein Token (4…96 px) | erfüllt |
| `Radius`: Einsatzort je Radius, 1-px-Regel mit ihrer Ausnahme | sechs Radien mit Einsatzort; „Rand: 1 px, nie dicker — die einzige Ausnahme ist der aktive Tab mit 2 px", daneben die 3-px-Zeile als Abweichler (Befund 4). §2 deckt sm/md/lg/xl/pill; `--radius-none` siehe M17 | erfüllt mit Mangel |
| `Elevation`: „Rand **oder** Schatten", beide Karten nebeneinander, z-index-Leiter | drei Karten (richtig · auch richtig · falsch); Leiter 5 · 20 · 40 · 60/61 — gegen `v3.css` geprüft (386, 1346, 1912/1968, 813/858/865/1880): stimmt. Alt-Leitern geprüft: `components.css` 90/91 und 100, `booking.css` 1080/1081, `app-chrome.css` 50 und 200 — alle vier korrekt | erfüllt |
| `Widths` zeigt die 1280-px-Schwelle als Linie | `container-wide` gemessen 1280 px, als einzige Linie in `--color-accent` (`rgb(59,143,196)`), Text nennt L1. Befund 10 (dreimal `1160px` in `v3.css`) daneben — verifiziert | erfüllt |
| `States`: vier Zustände an drei Elementen, Tonstufe je Zustand, V7 | 4 Spalten × 3 Zeilen. Jede Tonstufe gegen `v3.css` geprüft: Zeile-Hover `bg-soft` (153/154), Chip-Hover `bg-soft` (703), Chip aktiv `primary-700` + `text-on-dark` (704–708), Primärknopf Hover `primary-600` + `shadow-md` (580), gedrückt `primary-800` + `shadow-sm` (584) — alle fünf stimmen. V7-Satz vorhanden | erfüllt |
| `Motion`: Übergang auslösbar, Fokusring an drei Elementen, `prefers-reduced-motion` | 9 Auslöser (3 Dauern × 3 Kurven). Fokus per Tab gemessen: Knopf `2px solid rgb(59,143,196)` Offset 2px · Zeile dito · Feld `outline: none` mit Rand `rgb(26,58,92)` und `0 0 0 3px rgba(59,143,196,.14)` — die benannte Ausnahme aus M4, im Text genannt, 11,64:1 unabhängig bestätigt. Zählung 9/5/4 gegen `v3.css` nachgezählt: stimmt. **Reduced Motion live gemessen:** Skeleton `v2pulse 1.4s` → `none`; Toast `v2toastin 0.18s` → `none`; Fade `0.12s` → `0.00001s`; Spinner `0.7s` → `2.4s` (bewusst verlangsamt, nicht aus) | erfüllt |
| `Sizes`: beide Leitern, gemessene Praxis, Abweichler markiert | Leitern 12/14/16 und 16/20/24, beide bei Stroke 1,5. Praxis gerendert: 12 (10×) · 13 (2×) · 14 (15×) · 15 (1×) · 16 (11×) · 20 (3×); Strich nur 1,5 (10×). Gegen die Quelle nachgezählt: identisch. 13 und 15 als „daneben" markiert. Die Abweichler 12,5 · 1,75 · 2 aus der Spec existieren nicht mehr — die Story misst, also fallen sie weg. Benennung der Marken siehe M14 | erfüllt mit Mangel |
| `Vocabulary` enthält jedes produktiv importierte Icon | **überholt durch 0087** (M6). An seine Stelle treten `Entities` (22 Einträge) und `Actions` (33 Einträge) direkt aus `ENTITY_ICON`/`ACTION_ICON` sowie `pnpm check:icons` — grün: 53 Zeichen in der Registry, 2 Dateien noch offen (beide fremde Aufgaben, siehe Befunde). „Nur in Stories" rechnet 12 | erfüllt (Ersatz) |
| `WithWord` zeigt die drei `IconButton`-Bedingungen wörtlich | gerendert Wort für Wort wie §6 T8, dazu „`label` bleibt Pflicht und wird `aria-label` **und** `title`". Kebab als Satz, nicht als Zeichen. Die drei `IconButton` tragen gemessen `aria-label` **und** `title` | erfüllt |
| Alle drei Dateien unter `v3/Grundlagen/…` | ja, keine unter `Primitives` | erfüllt |

### Mängel dieser Abnahme

**M10 — blockierend. Der Plaketten-Satz in `Roles` widerspricht sich und ist
falsch.** Er sagt: „`.bdg-warning` und `.bdg-success` tragen ihre Fläche weiter
als Hex-Literal, Text und Rand teilweise ebenso — `.bdg-info`, `.bdg-success`
und `.bdg-danger` holen ihren Text inzwischen aus Token (0112)." Gemessen in
`app-chrome.css:451–459` und am gerenderten Knoten: **alle fünf** Plaketten
holen ihren Text aus einem Token (`accent-700` · `success` · `warning` ·
`text` · `danger`, gerendert `#2B6F9C` · `#3F7A5A` · `#8C601E` ·
`rgb(45,45,45)` · `#A8403C`). Hex geblieben sind die **Flächen** von info,
success und warning und **vier Ränder**. Der Satz behauptet also für
`.bdg-success` im ersten Halbsatz Hex-Text und dementiert es im zweiten, und
für `.bdg-warning` behauptet er Hex-Text, den es nicht gibt. Das ist derselbe
Fehler wie M1: eine handgeschriebene Behauptung neben einer gerechneten Zahl.
*Vorschlag:* auf das reduzieren, was gilt — der Text kommt überall aus Token,
Hex stehen noch in drei Flächen und vier Rändern —, oder den Satz genauso aus
der Quelle ableiten wie den davor.

**M11 — zwei gerenderte `**`.** `Roles` zeigt im Fließtext `**Text**`,
`Motion` zeigt `**Übergänge**` (beides gemessen im `innerText`, nicht in der
Quelle). Das ist M7 in neuer Gestalt: Markdown-Syntax, die im Browser als
Zeichen ankommt. *Vorschlag:* `<strong>` statt Sternchen, wie an den anderen
Stellen derselben Absätze.

**M12 — „über\*" ohne Leerzeichen.** In `Motion` steht gerendert „eine Regel
über\* statt einer Selektorliste": JSX schluckt den Zeilenumbruch zwischen
Text und `<code>`-Knoten. *Vorschlag:* `{" "}` vor den Knoten, wie in
denselben Dateien sonst gehandhabt.

**M13 — ein rohes px.** `Icons.stories.tsx:248` setzt `width: 32` an der
Icon-Spalte; `--space-8` ist genau dieser Wert. Dazu `Surface.stories.tsx:368`
mit `"1px solid var(--color-border-strong)"` statt `var(--border-1-strong)` —
dasselbe Ergebnis, aber am Token vorbei. *Vorschlag:* beide auf das Token
ziehen.

**M14 — `Sizes` führt zwei Namen für dieselben zwei Leitern.** Die Abschnitte
heißen „Produktiv" und „Lesend" (so nennt A8 sie), die Marken darunter
„Handlungs-Leiter" und „nur Entitäts-Leiter". Wer 20 px sieht, muss selbst
übersetzen. Dazu passt der Vorspann nicht mehr: „Was auf einer Leiter steht,
ist grün" — 20 px steht auf einer Leiter und ist neutral. Die drei gemessenen
`size={20}`-Stellen sind überdies keine Entitäts-Zeichen, sondern
Leerzustands-Zeichen (`FileWarning`, zweimal `ActionIcon action="alert"` in
`SourceDocumentDrawer`, `BankTransactionDrawer`, `CaseDrawer`). *Vorschlag:*
die Marken nach den Registern benennen („produktive Leiter" / „lesende
Leiter") und den Vorspann-Satz auf „auf **der** Leiter seines Registers"
umstellen. Das Urteil selbst bleibt richtig — M3 ist behoben.

**M15 — eine feste Zahl neben einer gerechneten.** `Icons.stories.tsx:293`
rechnet „die übrigen `AXIS_LABEL.length - 3` Achsen": die 3 ist verdrahtet,
obwohl `AXIS_ENTITY` sie hergibt (`Object.keys(AXIS_ENTITY).length`, heute
tatsächlich 3). Kommt eine vierte Abbildung dazu, zählt die Seite falsch.

**M16 — `readToken` hält nicht, was sein JSDoc verspricht.** Der Kommentar
sagt „The declared value, verbatim — `--color-info` stays `var(--color-accent)`";
gerendert steht in der Kachel `#3B8FC4`, weil `getComputedStyle` am `:root`
substituiert. Nur ein Kommentar, keine Anzeige — aber falsch.

**M17 — M9 der letzten Runde steht unverändert.** `--radius-none` bekommt in
`Surface.stories.tsx:110` den Einsatzort „Kante an Kante — Tabellenzelle,
angesetzte Fläche", den §2 nicht vergibt (§2 nennt nur sm · md · lg · xl ·
pill); und `Motion` fährt `translateY(8px)` statt `--space-2`.

### Befunde am Set (nicht 0055)

1. **`tokens.css:83` nennt einen Kontrast, der nicht stimmt.** Der Kommentar
   an `--color-focus-ring-soft` sagt, den Kontrast trage der Rahmen selbst,
   „`--color-primary-700`, 9.4:1". Gemessen sind es **11,64:1** — `.v2in`
   steht auf `--color-surface` (`#FFFFFF`). 9,4 ergibt sich gegen keinen
   Grund des Satzes (bg 11,64 · bg-soft 10,75 · bg-sunken 10,09). Die
   `Motion`-Story rechnet richtig (11,64:1); der Token-Kommentar ist die
   falsche Stelle. Alle übrigen Kontrastangaben in `tokens.css` stimmen exakt
   nach (accent-700 5,45/5,03/5,04 · text-subtle 4,88/4,51 · border-control
   3,45 · warning 5,52/4,78); einzig `--color-warning-strong` steht mit
   5.85/5.40 statt 5,86/5,41 — abgerundet statt gerundet.
2. **`Icons.tsx` (0087) trägt Markdown in Nutzertext.** 41 Backticks in den
   `meaning`/`instead`-Strings der Registry rendern überall als Zeichen — auf
   `Entities` und `Actions` gemessen (`\`ledger-account\``, `\`client\``,
   `\`peek\`` und 22 weitere). Gehört zur Registry, nicht zu 0055, ist aber
   auf den Grundlagen-Seiten sichtbar.
3. **`pnpm check:icons` hält zwei Dateien offen:**
   `entities/source-document/SourceDocumentDrawer.tsx` (0075/0076) und
   `entities/journal-entry/JournalEntryEditor.tsx` — beide fremde Sitzungen,
   beide mit Grund in `PENDING`. Kein Befund gegen 0055.
4. **Messgrenze der Spalte „unbenutzt".** `--color-accent-500` steht als
   „unbenutzt", wird aber von
   `src/ludwig/modules/datev-export/domain/batch-process.ts` per `var()`
   gelesen. Die Story misst genau die Menge, die die Gegenprobe der Spec
   vorgibt (`src/styles` + `src/ui`, ohne Stories), und schreibt ihren Umfang
   an — insofern korrekt. Wer die Spalte ernst nimmt, sollte `src/ludwig`
   aufnehmen.
5. **Befund 11 der Spec ist erledigt, Befund 12 nicht.** `accent-700` steht
   seit 0090 bei gemessen 5,45:1 / 5,03:1 — die Arbeitsfläche reißt nicht
   mehr. `--color-info` als Text liegt weiter bei 3,55:1 / 3,28:1 / 3,29:1;
   die `Contrast`-Story markiert alle drei Zeilen und nennt den Grund.

Abgenommen von / am: Claude (fremde Abnahme), 2026-09-07 — **zurück** ·
Offene Punkte: M10 blockiert; M11–M17 nicht blockierend, aber M11, M12 und
M10 liegen in zwei Absätzen und sind mit einem Griff erledigt. Alle
Abnahmekriterien der Spec sind erfüllt und gemessen; der Rückgabegrund ist
allein die falsche Behauptung in M10.

## Die Mängel der Abnahme vom 2026-09-06 — behoben

Alle drei blockierenden hatten dieselbe Form: **handgeschriebene Prosa neben
einer gerechneten Zahl.** Genau der Fehler, gegen den diese Seite gebaut ist.

**M1 — `Roles` widersprach sich in derselben Zeile.** Der Satz behauptete,
`success-bg` und `info-bg` lese niemand; beide **werden** gelesen (die
Zustands-Kacheln der `StateMachine`), und die gerechnete Liste sagte das auch.
Der Satz wird jetzt **abgeleitet**, nicht behauptet. Dazu die zu scharfe
Aussage über die Plaketten berichtigt: seit 0112 holen drei von ihnen ihren
**Text** aus Token, der V13-Fall ist kleiner geworden, aber nicht weg.

**M2 — `Motion` nannte drei Blöcke, gerechnet waren es vier.** Die Namen
stehen nicht mehr da: eine Liste neben einer Zahl veraltet mit dem nächsten
Commit. Stattdessen der Stand nach 0093 (b) — Übergänge fallen sämtlich weg,
Animationen bleiben.

**M3 — `Icons/Sizes` gab 20 px einen falschen Freispruch.** `ON_LADDER` legte
beide A8-Leitern übereinander, und die drei echten `size={20}`-Stellen standen
grün da, während die Seite darüber zwei getrennte Leitern lehrt. Jetzt vier
Marken: „auf beiden Leitern", „Handlungs-Leiter", „nur Entitäts-Leiter"
(neutral, kein Urteil) und „daneben".

**M4 — der Fokusring, den ein Beispiel nicht hat.** Das Feld setzt
`outline: none` und ersetzt den Ring durch einen kräftigeren Rand plus weichen
Schein — eine **zweite** Fokus-Grammatik. Sie steht jetzt als benannte
Ausnahme im Abschnittstext; das ist der Zweck dieser Seite.

**M5 — `Roles` hinkte §3 hinterher.** Die Zeile „Diagrammreihe" aus 0110 ist
nachgezogen: `text-subtle` und `border-control` tragen Fläche „ja".

**M7 — zwei gerenderte Backticks** sind `<code>`-Knoten.

**M8 — `Criticality` nannte für „Debug" ein Token, das die Plakette daneben
nicht benutzt.** Die Spalte sagt jetzt beides: das Token der **Stufe** und
das, was `app-chrome.css` daraus macht.

**M6** (die Story `Vocabulary` gibt es seit 0087 nicht mehr) ist Buchführung:
das Kriterium der Spec ist durch 0087 überholt, `Entities`/`Actions`/`InUse`
sind an seine Stelle getreten. **M9** (`--radius-none` mit einem Einsatzort,
den §2 nicht vergibt; ein `translateY(8px)`) bleibt als Kleinkram stehen.

## Nach der Abnahme (2026-09-07): der blockierende Mangel war ein Satz über die eigene Arbeit

Die Abnahme hat **alle** Kriterien der Spec als erfüllt gemessen — 15 Stories
über CDP geladen, Kontraste unabhängig in Python nachgerechnet, kein Abweicher
in 39 Zeilen. Hervorzuheben, weil ohne Codeänderung erbracht: der Nachweis,
dass die Kontrast-Seite **rechnet** statt abzuschreiben. Der Prüfer hat
`--color-text-subtle` zur Laufzeit auf `#999999` gesetzt; aus 4,88/4,51 wurde
**2,85/2,63**, und beide Zeilen markierten sich neu als „unter der Schwelle".
`tokens.css` blieb dabei unberührt.

Zurückgekommen ist sie an einem Absatz, der sich selbst widerspricht.

**M10 erledigt.** Der Plaketten-Satz behauptete, `.bdg-warning` und
`.bdg-success` trügen „Text und Rand teilweise ebenso" als Hex — und im
nächsten Halbsatz, `.bdg-success` hole ihren Text aus Token. Gemessen am CSS
und am Knoten: **alle fünf** holen den Text aus Token; Hex sind nur **drei
Flächen** und **vier Ränder**. Der Absatz sagt jetzt genau das. Es ist
derselbe Fehlertyp, den die Seite selbst anprangert: eine Zahl behauptet
statt gerechnet.

**M11 erledigt** — zwei Markdown-Sterne rendern in JSX als Zeichen. Gemessen:
**null** Doppelsterne in `Roles` und in `Motion`. (Zwei weitere `**` stehen in
einem Kommentar; die rendern nicht und bleiben.)

**M12 erledigt** — „über" klebte am folgenden `<code>`, weil JSX den Umbruch
schluckt. Gemessen: kein Wort mehr ohne Leerzeichen vor einem Code-Knoten.

**M13 erledigt** — ein rohes `width: 32` steht jetzt als `var(--space-8)`, und
`"1px solid var(--color-border-strong)"` als `var(--border-1-strong)`.

**M15 erledigt** — `AXIS_LABEL.length - 3` verdrahtete eine Zahl, die
`AXIS_ENTITY` selbst hergibt; beim nächsten Eintrag wäre sie falsch geworden.
Gemessen: die Seite nennt 68 Achsen, gerechnet aus beiden Mengen.

**M16 erledigt** — der JSDoc von `readToken` behauptete „verbatim", aber
`getComputedStyle` substituiert: `--color-info` kommt als `#3B8FC4` zurück,
nicht als `var(--color-accent)`. Der Satz sagt jetzt, was passiert.

**Der Befund am Set ist erledigt und war der wichtigste:** `tokens.css` nannte
für den Fokus-Rahmen **9,4:1**. Nachgerechnet sind es **11,64:1** — 9,4 ergibt
sich gegen keinen Grund des Satzes. Das ist bereits der **zweite** falsch
gerechnete Kontrast in einem Token-Kommentar (0090 hatte 4,85 statt 5,04). Die
Zahlen im Kommentar sind die einzige Stelle, an der eine Kontrastangabe steht,
die niemand nachrechnet, weil sie schon dasteht.

**Offen, mit Grund:**

- **M14** — `Sizes` führt zwei Namen für dieselben zwei Leitern
  („Produktiv/Lesend" oben, „Handlungs-/Entitäts-Leiter" in den Marken), und
  der Vorspann trifft die 20-px-Stelle nicht mehr. Das ist eine Textrunde an
  einer Seite, die gerade in einer anderen Aufgabe (0087) umgebaut wurde —
  **eigene Runde**, sonst schreibe ich gegen einen bewegten Text an.
- **M17** — der Nachtrag der letzten Runde (M9: `--radius-none` mit erfundenem
  Einsatzort, `translateY(8px)`) steht unverändert. Er gehört in dieselbe
  Textrunde wie M14.
