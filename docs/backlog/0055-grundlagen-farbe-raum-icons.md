# 0055 · Grundlagen — Farbe, Raum und Fläche, Icons

| | |
|---|---|
| Status | fertig |
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

## Wiederabnahme (2026-09-07): sechs Mängel behoben — und die Behebung hat ein Kriterium gerissen

Fremde Abnahme, ohne Chatverlauf, nur gegen Spec und Code. Gemessen am
laufenden Dev-Server (`localhost:6107`) über CDP: alle 15 Stories geladen,
jede Zahl aus dem gerenderten Baum (`getComputedStyle`, `innerText`), jeder
Kontrast unabhängig in Python aus den **gerenderten** Farben nachgerechnet.
`pnpm typecheck` Exit 0 · `pnpm build` Exit 0 („Storybook build completed
successfully", keine Fehlerzeile) · `pnpm check:icons` Exit 0 ·
`pnpm check:contrast` Exit 0.

### Die sechs Nacharbeiten aus `d62fbb3` — nachgemessen

| Mangel | Nachweis | Ergebnis |
|---|---|---|
| M10 (war blockierend) | Der Plaketten-Absatz in `Roles` steht gerendert: „den Text holen alle fünf aus Token (0112). Als Hex-Literale stehen nur noch drei Flächen (`.bdg-info`, `.bdg-success`, `.bdg-warning`) und vier Ränder (dieselben drei plus `.bdg-danger`)." Gegen `app-chrome.css:447–459` gezählt: fünf `color:`-Deklarationen, alle aus Token (`accent-700` · `success` · `warning` · `text` · `danger`); drei `background:` als Hex (`#E3F0F8` · `#F0F6F2` · `#F5EEE0`), zwei aus Token; vier `border-color:` als Hex (`#C7DFEC` · `#D5E3DB` · `#E8DCBE` · `#E7CFCE`), eine aus Token. Der Absatz sagt jetzt genau, was das CSS tut | behoben |
| M11 | Alle 15 Stories über den gerenderten `innerText` gezählt: **0** Doppelsterne. Der einzige verbliebene `*` ist der Glob `src/styles/*.css` in `Roles` und das `*` als `<code>`-Knoten in `Motion` — beide gewollt | behoben |
| M12 | DOM-Lauf über jeden `<code>`-, `<strong>`- und `.lw-numeric`-Knoten aller 15 Stories: **kein** Textknoten endet oder beginnt ohne Leerzeichen am Nachbarknoten. Gerendert steht „eine Regel über `*` statt einer Selektorliste" | behoben |
| M13 | Icons-Tabelle: Inline-Stil gemessen `width: var(--space-8)`, und `--space-8` ist `32px` — derselbe Wert wie vorher, jetzt am Token. Der Chip in `States` trägt gemessen `1px solid rgb(196, 204, 213)` = `#C4CCD5` = `--color-border-strong`, gesetzt über `var(--border-1-strong)` | behoben |
| M15 | `Entities` nennt gerendert **68** Achsen. Nachgezählt: `AXIS_LABEL` (aus `status-registry.ts`) hat 71 Schlüssel, `AXIS_ENTITY` hat 3 — 71 − 3 = 68. Beide Mengen werden gerechnet, keine Zahl steht mehr fest | behoben |
| M16 | Der JSDoc von `readToken` sagt jetzt, dass `getComputedStyle` substituiert, statt „verbatim" zu behaupten. Inhaltlich richtig — aber siehe M18 | behoben, mit Folgeschaden |

Nichts davon hat etwas beschädigt: alle 15 Stories rendern ohne eine einzige
Konsolenmeldung (Sweep über `Runtime.consoleAPICalled` und
`Runtime.exceptionThrown`), `Ramps` zeigt weiter genau **40** Kacheln zu 40
`--color-`-Deklarationen (37 davon mit Hex, drei mit `rgba` — `scrim`,
`focus-ring`, `focus-ring-soft`), `Contrast` rechnet weiter richtig (39 Zeilen,
alle unabhängig aus den gerenderten Farben nachgerechnet, **kein Abweicher**),
der Fokusring steht per echtem Tab an 13 Stationen (Knopf und Zeile
`2px solid rgb(59,143,196)` mit Offset 2 px; das Feld als benannte Ausnahme mit
Rand `rgb(26,58,92)` und weichem Schein, 11,64:1 unabhängig bestätigt), und
unter `prefers-reduced-motion: reduce` fallen die Übergänge von 0,12/0,18 s auf
1e-05 s. Die Zählung in `Motion` (9 Transitions · 5 Animations · 4 Blöcke)
stimmt gegen `v3.css` auf den Treffer.

### `pnpm check:contrast` — geprüft, wie verlangt

**Rechnet es richtig?** Ja. Alle 11 Angaben aus `tokens.css` unabhängig in
Python nachgerechnet: `accent-700` 5,4453 / 5,0263 / 5,0401 · `text-subtle`
4,8807 / 4,5052 · `border-control` 3,4522 · `warning` 5,5162 / 4,7777 ·
`warning-strong` 5,8610 / 5,4101 · `primary-700` 11,6428. Jede stimmt auf zwei
Stellen mit dem Kommentar und mit dem Skript überein. Die
`warning-strong`-Abrundung der letzten Runde (5.85/5.40) ist mit korrigiert.

**Findet es eine verfälschte Zahl?** Ja, in beide Richtungen. Auf einer Kopie
in einem Scratchpad-Baum geprüft, `tokens.css` im Repo blieb unberührt:

- Zahl verfälscht (`5.45:1` → `5.55:1`): `✗ Zeile 32: --color-accent-700 auf Weiss steht mit 5.55:1 da, gemessen 5.45:1`, Exit 1.
- Token-Wert verfälscht (`--color-text-subtle` `#717171` → `#999999`): **beide** Angaben derselben Zeile fallen (4,88 → 2,85 und 4,51 → 2,63), Exit 1.
- Neue Angabe eingesetzt (`4.99:1 auf danger-bg` an `--color-danger`): erkannt und nachgerechnet, 12 statt 11 — der gemessene Wert ist tatsächlich 4,9939.

**Deckt es alle Angaben ab?** Für `tokens.css` ja: 11 geltende Angaben, 11
geprüft, keine übersehen. Die vier weiteren Zahlen in derselben Datei sind
ausdrücklich Historie (`#2E78A8` mit 4.81 / 4.44 / 4.45 und das falsche 9,4)
und tragen darum kein `:1`. Ich habe die drei prüfbaren davon nachgerechnet —
4,8075 · 4,4376 · 4,4498, alle richtig zitiert. Zwei Grenzen des Wächters
stehen unten als Befunde am Set, keine davon gegen 0055.

### Mangel dieser Runde

**M18 — blockierend. Die M16-Nacharbeit hat ein Abnahmekriterium gerissen.**
Das variable Kriterium lautet wörtlich:

> `grep -c '#[0-9A-Fa-f]\{6\}' src/ui/v3/{Color,Surface,Icons}.stories.tsx` ist überall `0`

Gemessen ist es heute **Color 1** · Surface 0 · Icons 0. Vor `d62fbb3` war es
0 (`git show d62fbb3^:src/ui/v3/Color.stories.tsx | grep -c …` → 0). Die eine
Fundstelle ist `Color.stories.tsx:49`, der neue JSDoc von `readToken`:

> `(--color-info returns #3B8FC4, not var(--color-accent))`

Der Satz ist inhaltlich richtig, und der Hex rendert nicht. Er ist trotzdem
genau das, was diese Seite anprangert: **ein von Hand geschriebener Wert neben
einem gerechneten.** `--color-info` ist ein Alias auf `--color-accent`; zieht
jemand den Akzent um — 0090 hat das mit `accent-700` getan —, behauptet der
Kommentar eine Zahl, die keiner nachrechnet, weil sie schon dasteht. Das ist
derselbe Mechanismus wie 9,4:1 in `tokens.css`, nur eine Datei weiter.
*Vorschlag:* den Hex weglassen — „kommt substituiert zurück, nicht als
`var(--color-accent)`" sagt dasselbe und veraltet nicht.

Bewusst offen gelassen und **kein** Rückgabegrund, wie angekündigt — beide
nachgemessen und unverändert:

- **M14** — `Sizes` führt oben „Produktiv" / „Lesend" und in den Marken
  „Handlungs-Leiter" / „nur Entitäts-Leiter"; der Vorspann sagt weiter „Was auf
  einer Leiter steht, ist grün", während 20 px als „nur Entitäts-Leiter"
  neutral dasteht. Gemessene Praxis heute: 12 px (10×) · 13 px (2×) ·
  14 px (16×) · 15 px (1×) · 16 px (11×) · 20 px (3×), Strich nur 1,5 (10×).
- **M17** — `--radius-none` trägt weiter den Einsatzort „Kante an Kante —
  Tabellenzelle, angesetzte Fläche", den §2 nicht vergibt;
  `Surface.stories.tsx:497` fährt weiter `translateY(8px)`.

### Befunde am Set (nicht 0055)

1. **Der Wächter endet an `tokens.css` — und außerhalb steht schon eine
   verrechnete Zahl.** In `v3.css` (9) und `app-chrome.css` (4) stehen 13
   weitere Kontrastangaben. Zwölf davon habe ich nachgerechnet und für richtig
   befunden. Die dreizehnte nicht: `v3.css:637` begründet die Deckkraft 0.85
   der Taste mit „gemessen 2.67:1 gegen `--color-bg-soft`" — 2,67 ergibt sich
   gegen das **alte** `--color-accent-700` (`#2E78A8`, gemessen 2,6728). Seit
   0090 ist der tertiäre Knopf `#2B6F9C`, und der Rand bei 0.7 steht bei
   **2,87:1**. Der Schluss hält (weiter unter 3:1), die Zahl nicht. Das ist der
   **dritte** Fall derselben Art nach 0090 (4,85 statt 5,04) und 0055 (9,4
   statt 11,64) — und der erste, den `check:contrast` von Bauart nicht sehen
   kann.
2. **Zwei Lücken im Wächter selbst.** Beide auf einer Kopie belegt: (a) Eine
   **geltende** Angabe, die ohne `:1` geschrieben ist, wird nie geprüft — ich
   habe „9.99 auf success-bg" eingesetzt, der Lauf blieb grün. Die Form ist
   Konvention, aber nichts erzwingt, dass nur Historie sie ablegt. (b) Eine
   Angabe mit unauflösbarem Grund wird mit `?` gemeldet und der Lauf endet
   trotzdem mit **Exit 0** — „9.99:1 auf Papier" ging als „1 nicht auflösbar"
   durch. Eine unprüfbare Angabe sollte kein grüner Lauf sein.
3. **Backticks rendern weiter als Zeichen.** `Entities` zeigt gemessen 22
   Backticks aus den `meaning`/`instead`-Strings der Icon-Registry
   (`` `ledger-account` ``, `` `client` ``, `` `tenant` ``, `` `help` `` …),
   `Actions` ebenso. Gehört zu `Icons.tsx` (0087), unverändert seit der letzten
   Runde.
4. **`pnpm check:icons` hält weiter zwei Dateien offen:**
   `entities/source-document/SourceDocumentDrawer.tsx` (0075/0076) und
   `entities/journal-entry/JournalEntryEditor.tsx` — beide mit Grund in
   `PENDING`, beide fremde Sitzungen. Kein Befund gegen 0055.
5. **Fremde Änderung im Arbeitsbaum.** `src/styles/v3.css` trägt 13
   uncommittete Zeilen (`.bse__*`, Lese-Raster des Buchungssatzes, 0113) aus
   einer anderen Sitzung. Für 0055 hält „kein neues CSS": `d62fbb3` hat an
   `tokens.css` ausschließlich einen **Kommentar** geändert, keine Deklaration
   und keinen Wert.

Abgenommen von / am: Claude (fremde Abnahme), 2026-09-07 — **zurück** ·
Offener Punkt: M18 blockiert, und nur M18. Alle sechs Nacharbeiten aus
`d62fbb3` sind gemessen erledigt, `check:contrast` rechnet richtig und fängt
die Verfälschung, und kein anderes Kriterium der Spec ist gefallen. Der
Rückgabegrund ist ein Hex, den die Behebung selbst in die Datei geschrieben
hat, deren Kriterium null Hex verlangt — ein Halbsatz Arbeit, und derselbe
Fehlertyp, den diese Seite bekämpft.

## Nach der Wiederabnahme (2026-09-07): mein eigener Kommentar riss ein Kriterium

**M18 erledigt.** Die Behebung von M16 hat ein festes Kriterium gerissen:
`grep -c '#[0-9A-Fa-f]\{6\}'` muss in `Color`, `Surface` und `Icons` **null**
sein, und mein neuer `readToken`-JSDoc nannte `#3B8FC4` als Beispiel. Inhaltlich
richtig, gerendert wird er nicht — und trotzdem genau das, was die Seite
anprangert: ein handgeschriebener Wert neben einem gerechneten. Zieht jemand
den Akzent um (0090 hat das getan), lügt der Kommentar, wie es die 9,4:1 taten.
Der Hex ist weg; gemessen 0 · 0 · 0.

**Der Befund am Set war der wichtigere, und er ist der vierte seiner Art.**
`v3.css:637` nannte „2.67:1 gegen `--color-bg-soft`" — gerechnet gegen das
**alte** `accent-700` `#2E78A8`. Seit 0090 sind es **2,87:1**. Der Schluss
hält (unter 3:1), die Zahl nicht. Nach 0090 (4,85 statt 5,04), 0055 (9,4 statt
11,64) und der Abrundung bei `warning-strong` ist das die vierte falsch
gerechnete Kontrastangabe in einer Woche.

**Deshalb reicht der Wächter jetzt weiter als `tokens.css`:** er liest auch
`v3.css` und `app-chrome.css`. Von den 13 Angaben dort beziehen sich alle auf
**Klassen** statt auf Token — die kann er nicht nachrechnen, und er sagt das,
statt Grün zu melden. Wer eine solche Angabe prüfbar machen will, nennt beide
Token im Kommentar. In `tokens.css` dagegen ist eine unauflösbare Angabe ein
Mangel und führt zu Exit 1: dort steht der Wert direkt daneben.

Gegenprobe im Repo gemacht und zurückgenommen: `5.45` auf `5.55` verfälscht →
gefangen, Exit 1, mit Datei und Zeile; zurück → Exit 0.

**Die zweite Lücke, die die Abnahme benennt, bleibt offen und ist benannt:**
eine **geltende** Angabe, die versehentlich ohne `:1` geschrieben wird, prüft
niemand. Das ist der Preis der Konvention „nur Geltendes trägt `:1`" — die
Alternative wäre, jede Zahl in jedem Kommentar zu prüfen, und dann fällt der
Wächter über jede Jahreszahl.

## Wiederabnahme (2026-09-07): die Nacharbeiten halten — der Wächter behauptet über sich etwas Falsches

Fremde Abnahme, ohne Chatverlauf, nur gegen Spec und Code. Gemessen am
laufenden Dev-Server (`localhost:6107`) über CDP: alle 15 Stories geladen,
jede Zahl aus dem **gerenderten** Baum (`getComputedStyle`, `innerText`),
jeder Kontrast unabhängig in Python aus den gerenderten Farben nachgerechnet.
Jede Messung mit Gegenprobe: Token zur Laufzeit verstellt, neu gemessen.
`pnpm typecheck` Exit 0 · `pnpm check:icons` Exit 0 · `pnpm check:contrast`
Exit 0. Nicht gebaut (0117, mehrere Prüfer im selben Baum).

### Die Nacharbeiten aus `db68dad` — nachgemessen

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M18 (war blockierend): kein Hex in den drei Stories | `grep -c '#[0-9A-Fa-f]\{6\}'` → Color **0** · Surface **0** · Icons **0**. Der `readToken`-JSDoc nennt keinen Hex mehr, sondern „comes back as the accent's own value" | behoben |
| Der vierte falsch gerechnete Kontrast (`v3.css`) | `v3.css:641` steht jetzt mit **2.87:1**; unabhängig gerechnet: `accent-700` `#2B6F9C` bei `opacity .7` über `bg-soft` = **2,8675**. Die alte 2.67 ist gegen `#2E78A8` gerechnet (**2,6728**) und steht korrekt als Historie **ohne** `:1` | behoben |
| `warning-strong`-Abrundung | 5.86/5.41 gegen gerechnet **5,8610 / 5,4101** | behoben |
| Alle übrigen Angaben in `tokens.css` | 11 geltende Angaben, alle 11 unabhängig nachgerechnet: `accent-700` 5,4453 / 5,0263 / 5,0401 · `text-subtle` 4,8807 / 4,5052 · `border-control` 3,4522 · `warning` 5,5162 / 4,7777 · `warning-strong` 5,8610 / 5,4101 · `primary-700` 11,6428. Kein Abweicher. Die vier historischen Zahlen (4.81 / 4.44 / 4.45 zu `#2E78A8`) stimmen ebenfalls und tragen richtig kein `:1` | erfüllt |
| M13 · M15 · M16 aus der Vorrunde | `Icons.stories.tsx:248` = `width: var(--space-8)` · `Surface.stories.tsx:368` = `var(--border-1-strong)` · `Object.keys(AXIS_LABEL).length - Object.keys(AXIS_ENTITY).length`, gerendert **69** (72 − 3; die Registry ist seit der Vorrunde um eine Achse gewachsen, die Seite zieht mit) · der `readToken`-JSDoc sagt, was `getComputedStyle` tut | behoben |

### `pnpm check:contrast` — nicht gelesen, sondern verfälscht

Alle Proben auf einer **Kopie außerhalb des Repos**
(`scratchpad/wa0055/copy`, gleiche Pfadstruktur); `scripts/` und `src/styles/`
im Repo blieben unberührt (`git diff --stat scripts/ src/styles/tokens.css` leer).

| Probe | Ergebnis |
|---|---|
| korrekte Datei | Exit **0**, „11 Angaben nachgerechnet" |
| Zahl verfälscht (`5.45:1` → `5.55:1`) | Exit **1**: `✗ src/styles/tokens.css:32 — --color-accent-700 auf Weiss steht mit 5.55:1 da, gemessen 5.45:1` |
| Token-Wert verfälscht (`text-subtle` `#717171` → `#999999`) | Exit **1**, **beide** Angaben der Zeile fallen (4,88 → 2,85 · 4,51 → 2,63) |
| neue geltende Angabe, richtig (`4.99:1 auf danger-bg`) | erkannt, 12 statt 11 geprüft, Exit 0 — gerechnet 4,9939 |
| dieselbe Angabe, falsch (`4.11:1`) | Exit **1**, mit Datei, Zeile und gemessenem Wert |
| unauflösbarer Grund in `tokens.css` (`4.99:1 auf Papier`) | Exit **1** — die Lücke (b) der Vorrunde ist zu |
| geltende Angabe **ohne** `:1` (`4.11 auf danger-bg`, falsch) | Exit **0**, ungeprüft — die Lücke (a) der Vorrunde, bewusst offen und benannt |
| Zahl in `v3.css` verfälscht (`2.87:1` → `9.99:1`) | Exit **0**, ungeprüft |
| Zahl in `app-chrome.css` verfälscht (`4.69:1` → `9.99:1`) | Exit **0**, ungeprüft |

Der Kern — `tokens.css` — rechnet richtig und fängt die Verfälschung in beide
Richtungen. Die **13 Angaben in `v3.css` und `app-chrome.css` habe ich alle
selbst nachgerechnet**, jede stimmt: 2,1121 · 6,6869 · 4,8807 · 3,4522 ·
2,8675 · 4,8807 · 4,0200 · 1,6222 · 3,4522 · 4,6896 · 4,1403 · 4,6272 ·
4,4578.

### Mängel dieser Runde

**M19 — blockierend. Der Wächter sagt über seine eigenen 13 Fundstellen etwas
Falsches, und die Abhilfe, die er nennt, wirkt nicht.** Zwei Stellen behaupten
dasselbe: `scripts/check-contrast.mjs:145–152` und der Abschnitt „Nach der
Wiederabnahme" oben — „Von den 13 Angaben dort beziehen sich **alle** auf
Klassen statt auf Token"; dieselbe Behauptung steht in jedem grünen Lauf:
„13 beziehen sich auf Klassen statt auf Token und bleiben ungeprüft."

Gemessen ist das für mindestens **sieben** der 13 falsch — sie nennen ihr
Token im Kommentar oder sind vollständig in Token ausdrückbar:
`v3.css:281` (`--color-text-subtle`), `:621` (`--color-border-control`),
`:1274` (`text-subtle`), `:2959` (`--color-danger-bg`), `:3027`
(`--color-border-strong`), `:3029` (`--color-border-control`),
`app-chrome.css:449` (`--color-accent-700` auf `#E3F0F8` = `--color-accent-100`)
und `:453` (`#3F7A5A`/`#EBF2EE` = `success`/`success-bg`). Nicht auflösbar sind
tatsächlich nur die Alpha-Fälle (`:274`, `:641` — Deckkraft auf einer
Textfarbe) und die Angaben zu Farben, die keine Token mehr sind
(`app-chrome.css:450`, `:452`).

Sie bleiben ungeprüft, weil die Token-Erkennung nur `--color-x,` oder
`--color-x:` liest — der Backtick, in dem jeder dieser Kommentare sein Token
schreibt, fällt durch. Und die Abhilfe, die der Wächter selbst vorschreibt,
ist **wörtlich eingesetzt wirkungslos**: „gemessen 2.87:1
(`--color-text-subtle` auf `--color-bg-soft`)" in `v3.css` eingetragen →
weiterhin `? … Token unbekannt nicht auflösbar`, Exit 0. Wer der Anleitung
folgt, hält eine Angabe für geprüft, die niemand prüft.

*Vorschlag (kleinster Weg, auf der Kopie belegt):* die zwei Regexe den
Backtick zulassen — Token `` /(--color-[a-z0-9-]+)`?\s*[,)`]/ ``, Grund
`` auf\s+`?([A-Za-zäöü0-9-]+)`?  ``. Damit fallen drei der 13 sofort in die
Prüfung (14 statt 11 nachgerechnet, Lauf bleibt grün, weil die Zahlen
stimmen). Wer nicht am Skript rührt, formuliert die Behauptung und die
Anleitung auf das um, was gilt: prüfbar wird eine Angabe heute nur in der
Form `(--color-x, N.NN:1 auf grund)` — ohne Backticks, mit Komma; das ist die
Form, die `tokens.css:83` beim Fokusrahmen benutzt, und sie funktioniert
(gegengeprüft: mit `4.51:1` grün, mit `2.87:1` Exit 1).

**M20 — ein historisches Zitat trägt `:1`.** `app-chrome.css:450`: „vorher
waren es mit dem festen `#2E78A8` nur **4.14:1**". Nach der Konvention lässt
ein historisches Zitat das `:1` weg — `tokens.css:33`, `:84` und `v3.css:642`
halten sich daran. *Vorschlag:* `4.14` ohne `:1`.

**M21 — ein rohes px, das M13 übersehen hat.** `Color.stories.tsx:340` setzt
`verticalAlign: "-2px"` an der Farbkachel der `Roles`-Tabelle (seit dem
Baucommit `d5ff95a` unverändert). Dieselbe Klasse wie M13/M17. *Vorschlag:* in
dieselbe Textrunde wie M14/M17.

**M14 und M17 stehen unverändert** und sind, wie angekündigt, **kein**
Rückgabegrund: `Sizes` führt oben „Produktiv"/„Lesend" und in den Marken
„Handlungs-Leiter"/„nur Entitäts-Leiter", der Vorspann sagt weiter „Was auf
einer Leiter steht, ist grün"; `--radius-none` trägt weiter einen Einsatzort,
den §2 nicht vergibt; `Surface.stories.tsx:497` fährt weiter `translateY(8px)`.

### Die Kriterien der Spec — gemessen

**Fest.** `pnpm typecheck` Exit 0 · Dateien auf Barrel-Ebene, Titel
`v3/Grundlagen/Farbe` · `…/Raum und Fläche` · `…/Icons`, keine unter
`Primitives` (`index.json`) · alle 15 Stories laden und rendern, **null**
Konsolenmeldung (`Runtime.consoleAPICalled` / `exceptionThrown`) · **null**
gerenderte `**` über alle 15 · Status nur über Registry · „kein px" mit den
Resten M17/M21 (die drei `3px`/`2px` in `Surface` sind die *gezeigten*
Abweichler, kein Mangel). `pnpm build` nicht gefahren (0117).

**Variabel.**

| Kriterium | Messung | Ergebnis |
|---|---|---|
| Hex 0 in den drei Stories | 0 · 0 · 0 | erfüllt |
| kein neues CSS | `git diff --stat src/styles/` zeigt nur fremde Arbeit (0025-Zeile in `v3.css`); `db68dad` hat an `src/styles` ausschließlich **Kommentare** geändert | erfüllt |
| jeder Farb-Token genau einmal in `Ramps` | **40** gerenderte Kacheln zu `grep -c '^  --color-'` = **40**. Jede Kachel unabhängig nachgerechnet: gerenderte Kachelfarbe (`getComputedStyle`) gegen gerendertes `bg`/`bg-soft`, inkl. der drei `rgba`-Token (scrim 1,8841/1,8665 · focus-ring 1,4373/1,4110 · focus-ring-soft 1,1661/1,1575) — **kein Abweicher** | erfüllt |
| `warning-strong` mit „entfällt (A7, A9)" | gerendert `warning-strong · #9C5021 · 5,86:1 · 5,41:1 · entfällt (A7, A9) — Rückbau offen` | erfüllt |
| `accent` nicht textfähig, `accent-700` textfähig | `accent` Text **nein** („trägt keinen Text — unter 4,5:1"), gemessen 3,5521; `accent-700` Text **ja** („die einzige Akzentstufe für Text"), gemessen 5,4453 | erfüllt |
| „ohne Rolle" und „unbenutzt" gerechnet | gerendert „Ohne Rolle: 6 — primary-900, primary-500, surface-raised, warning-strong, scrim, focus-ring-soft"; „Unbenutzt: 5 — primary-900, accent-500, text-on-dark-muted, surface-raised, focus-ring". Gegenprobe der Spec (`rg` über `src/styles src/ui -g '!*.stories.tsx'`) liefert **dieselben fünf**; gegen §3 durchgezählt stimmen die sechs | erfüllt |
| `Criticality` mit Registry-`kind`, `success` außerhalb | `danger` · `warning` · `info` · `neutral`; `success` als eigene Zeile „Ausgang ‚erledigt'"; Debug nennt Stufen-Token **und** was `app-chrome.css` daraus macht | erfüllt |
| `Contrast` rechnet, statt zu zitieren | **39 Zeilen**, jede aus den *gerenderten* Farben der Probe-Spalte unabhängig nachgerechnet — kein Abweicher, und jede „unter der Schwelle"-Marke sitzt richtig. Gegenprobe ohne Eingriff in `tokens.css`: `--color-text-subtle` per `addScriptToEvaluateOnNewDocument` auf `#999999` → 4,88/4,51 wird **2,85/2,63**, beide Zeilen markieren sich neu; `Ramps` zieht mit (`#999999`, 2,85 · 2,63) | erfüllt |
| `Space` zeigt alle 12 Stufen | 12 Balken, gemessene Breiten 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 px — jede exakt ihr Token. Gegenprobe: `--space-6` zur Laufzeit auf 99 px → nur dieser Balken misst 99 px | erfüllt |
| `Radius`: Einsatzort je Radius, 1-px-Regel | sechs Radien, gemessen 0 · 2 · 4 · 6 · 10 · 999 px = ihre Token; „1 px, nie dicker — die einzige Ausnahme ist der aktive Tab mit 2 px", daneben die 3-px-Zeile als Abweichler. `--radius-none` siehe M17 | erfüllt mit Mangel |
| `Elevation`: Rand **oder** Schatten, z-index-Leiter | drei Karten gemessen: „Richtig" Rand 1 px / Schatten `none` · „Auch richtig" Rand 0 / Schatten gesetzt · „Falsch" **beides**. Leiter 5 · 20 · 40 · 60/61 gegen `v3.css` nachgezählt (390, 1672 · 1378 · 1944, 2000 · 819, 864, 871, 1912): stimmt. Alt-Leitern verifiziert: `components.css` 90/91 und 100, `booking.css` 1080/1081, `app-chrome.css` 50 und 200 | erfüllt |
| `Widths`: 1280-px-Schwelle als Linie | gemessene Linienbreiten 720 · 1080 · **1280** · 1440 · 560 · 880 · 1100 · 686 px, jede = ihr Token; `container-wide` als einzige in `rgb(59,143,196)` = `--color-accent` | erfüllt |
| `States`: vier Zustände an drei Elementen, V7 | 4 × 3 gemessen: Zeile `transparent → #F4F6F8` (bg-soft) → `#F1F7FB` + `3px rgb(59,143,196)` → `opacity .5` + `not-allowed`; Knopf `#1A3A5C` → `#224A73` + shadow → `#14304B` + shadow → `opacity .5`; Chip `#FFF` → `#F4F6F8` → `#1A3A5C` mit `#FFF`-Text. Gegenprobe: echter `mouseMoved` auf die Ruhe-Zeile → `transparent` wird `rgb(244,246,248)`. V7-Satz vorhanden | erfüllt |
| `Motion`: auslösbar, Fokusring, Reduced Motion | 9 Auslöser (3 Dauern × 3 Kurven). Fokus per echtem Tab an 12 Stationen: Knopf und Zeile `2px solid rgb(59,143,196)`, Offset 2 px; das Feld als benannte Ausnahme `outline: none` mit Rand `rgb(26,58,92)` und `rgba(59,143,196,.14) 0 0 0 3px` — die genannten 11,64:1 unabhängig bestätigt (11,6428). Zählung 9 Transitions · 5 Animations · 4 Blöcke gegen `v3.css` nachgezählt: stimmt. Reduced Motion per `Emulation.setEmulatedMedia`: alle Übergangsdauern fallen von 0,12/0,18/0,28 s auf **1e-05 s** | erfüllt |
| `Sizes`: beide Leitern, gemessene Praxis | Leitern 12/14/16 und 16/20/24, beide Strich 1,5. Praxis gerendert 12 (10×) · 13 (2×) · 14 (17×) · 15 (1×) · 16 (11×) · 20 (3×), Strich nur 1,5 (10×) — unabhängig gegen die Quelle gezählt (`rg -o 'size=\{…\}' src/ui/v3 -g '!*.stories.tsx'`): **identisch**. 13 und 15 als „daneben" markiert. Benennung siehe M14 | erfüllt mit Mangel |
| Vokabular (überholt durch 0087) | `Entities` 22 Zeilen / 22 Zeichen, `Actions` 33 Zeilen, „nur in Stories" 12; `pnpm check:icons` Exit 0 — 53 Zeichen in der Registry, 2 Dateien offen (fremde Aufgaben) | erfüllt (Ersatz) |
| `WithWord`: die drei Bedingungen wörtlich | Wort für Wort wie §6 T8, dazu „`label` bleibt Pflicht und wird `aria-label` **und** `title`". Gemessen: alle drei `IconButton` tragen `aria-label` **und** `title` (Schließen · Vorheriger Beleg · Nächster Beleg), das Falsch-Beispiel ebenso; Kebab als Satz, nicht als Zeichen | erfüllt |
| alle Stories unter `v3/Grundlagen/…` | 15 von 15, keine unter `Primitives` | erfüllt |

### Befunde am Set (nicht 0055)

1. **§12 der `design-guidelines.md` trägt die fünfte veraltete Kontrastzahl.**
   Die Tabelle nennt `--color-accent-700` mit **4.81** — das ist der Wert des
   alten `#2E78A8` (gemessen 4,8075). Seit 0090 sind es **5,45**. Alle übrigen
   elf Zahlen der Tabelle stimmen (13.77 · 6.69 · 4.88/4.51 · 3.55 · 11.64 ·
   5.07/4.68/4.46 · 5.52/4.78 · 6.06 · 1.30/1.62 · 3.45/3.19). Nach 0090
   (4,85), 0055 (9,4), `warning-strong` (Abrundung) und `v3.css` (2,67) ist
   das der fünfte Fall derselben Art — und er liegt in Markdown, wohin der
   Wächter von Bauart nicht reicht.
2. **Backticks rendern weiter als Zeichen.** `Entities` **22**, `Actions`
   **28** — aus den `meaning`/`instead`-Strings der Icon-Registry. Gehört zu
   `Icons.tsx` (0087), unverändert.
3. **`pnpm check:icons` hält weiter zwei Dateien offen** (`SourceDocumentDrawer.tsx`,
   `JournalEntryEditor.tsx`) — beide fremde Sitzungen, mit Grund in `PENDING`.
4. **Fremde Arbeit im Baum.** `src/styles/v3.css`, `package.json` und fünf
   Dateien unter `src/ui/v3/entities` tragen uncommittete Änderungen anderer
   Sitzungen. Keine davon berührt 0055.

Abgenommen von / am: Claude (fremde Abnahme), 2026-09-07 — **zurück** ·
Offener Punkt: **M19 blockiert, und nur M19.** Alle Abnahmekriterien der Spec
sind gemessen erfüllt, alle Nacharbeiten aus `db68dad` halten, und der
Wächter rechnet für `tokens.css` nachweislich richtig. Der Rückgabegrund ist
wieder derselbe Fehlertyp, gegen den diese Seite gebaut ist: eine
handgeschriebene Behauptung — „alle 13 beziehen sich auf Klassen" — neben
einer gerechneten Zahl, dazu eine Anleitung, die wörtlich befolgt nichts
bewirkt. Sieben der 13 sind auflösbar; drei davon werden es mit zwei
Zeichen mehr im Regex.

## Nach der Wiederabnahme (2026-09-07)

**M19 (blockierend) — der Wächter las sein eigenes Format nicht.** Er meldete
sieben auflösbare Angaben als „bezieht sich auf eine Klasse", weil die
Token-Erkennung nur `--color-x,` und `--color-x:` kannte — Kommentare schreiben
ihr Token aber in Backticks. Die Abhilfe, die er selbst vorschreibt, war damit
wörtlich eingesetzt wirkungslos. Der Backtick zählt jetzt mit: **17 statt 11**
Angaben werden nachgerechnet, ungeprüft bleiben zwei. *(Berichtigt nach der
zweiten Runde, M23: von den zweien war nur **einer** ein Alpha-Fall; der andere
war `--color-text-muted` auf Weiß und nannte sein Token nur zwei Zeilen tiefer.
Heute nennt jede Angabe ihr Token auf der eigenen Zeile — 20 nachgerechnet,
keine ungeprüft.)*

**Und er fand sofort eine sechste falsche Zahl.** `--color-text-subtle` auf
`danger-bg` stand mit 4,0 da, gemessen 4,02.

**Eine Grenze, die er nicht kennt: Deckkraft.** Die 2.87 am Tastenrand gilt für
`accent-700` bei `opacity: .7` — der Wert, der verworfen wurde; bei den
gebauten 0.85 sind es 3,79. Beide Zahlen tragen jetzt **kein** `:1`, und der
Kopf des Skripts sagt, warum: er rechnet volle Token, eine Deckkraft-Angabe
würde er gegen den vollen Ton prüfen und stillschweigend durchwinken.

**M20/M21** — das historische Zitat in `app-chrome.css` trägt kein `:1` mehr,
die Gründe der beiden Marken sind als Token benannt (`accent-100`,
`success-bg`), und `verticalAlign: "-2px"` ist `"sub"`.

**Der Befund am Set ist der wichtigste und ist behoben:**
`docs/design-guidelines.md` §12 nannte `--color-accent-700` mit **4.81** — dem
Wert des alten `#2E78A8`. Seit 0090 sind es **5.45**. Fünfter Fall derselben
Art, und der erste in Markdown, wohin der Wächter von Bauart nicht reicht.
Die ganze Tabelle ist gegen die Token nachgerechnet; die übrigen elf Zeilen
stimmen.

## Wiederabnahme (2026-09-07, zweite Runde): der Wächter reicht weiter — seine Anleitung noch nicht

Fremde Abnahme, ohne Chatverlauf, nur gegen Spec und Code. Gemessen am
laufenden Dev-Server (`localhost:6107`) über CDP: alle 15 Stories geladen, jede
Zahl aus dem **gerenderten** Baum (`getComputedStyle`, `innerText`), jeder
Kontrast unabhängig in Python aus den gerenderten Farben nachgerechnet, jede
Messung mit Gegenprobe (Token zur Laufzeit verstellt, neu gemessen). Der
Wächter wurde **nicht gelesen, sondern verfälscht** — auf einer Kopie außerhalb
des Repos (`scratchpad/wa2/copy`, gleiche Pfadstruktur); `scripts/` und
`src/styles/` im Repo blieben unberührt. `pnpm typecheck` · `check:icons` ·
`check:contrast` · `check:when` · `check:language` · `check:mirror` je
**Exit 0**. Nicht gebaut (0117). Zeilennummern in `v3.css` sind der Stand der
Messung — eine fremde Sitzung (0063) hat die Datei währenddessen angefasst und
alles unterhalb Zeile 1106 um eins verschoben.

### Die Nacharbeiten aus der letzten Runde — nachgemessen

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M19 (war blockierend): der Backtick zählt mit | Der Wächter rechnet heute **18** Angaben nach, 3 bleiben ungeprüft. Am Stand des Nacharbeits-Commits (`d4803ff`, auf einer Kopie gefahren) waren es **17 / 2**; die Differenz ist fremde Arbeit (die 1,03:1 der Bezugslinie kam mit 0110 dazu). Von den acht Stellen, die M19 als auflösbar benannt hat, werden **sieben** nachgerechnet und stimmen; die achte (`border-strong`, „1,62 gegen die Karte", `v3.css:3029`) trägt kein `:1` und fällt damit nicht unter die Konvention — gerechnet stimmt sie (1,6222), ungeprüft bleibt sie trotzdem: das ist die bekannte Lücke (a) | behoben, aber siehe M22/M23 |
| die sechste falsche Zahl | `v3.css:2961` steht mit `4,02:1` — unabhängig gerechnet `--color-text-subtle` auf `--color-danger-bg` = **4,0200** | behoben |
| Deckkraft als benannte Grenze | `v3.css:630–637`: 2.87 (bei `opacity: .7`) und 3.79 (bei den gebauten 0.85) tragen kein `:1`; gerechnet **2,8675** und **3,7932**, gebaut ist `opacity: 0.85` (`.v2btn .v2kbd`). Der Skriptkopf nennt die Grenze | behoben — mit zwei Rissen, siehe M24/M25 |
| M20 · M21 | `app-chrome.css:450` zitiert `4.14` ohne `:1` (gerechnet `#2E78A8` auf `accent-100` = **4,1403**); die Gründe beider Marken stehen als Token (`accent-100`, `success-bg`) und werden dadurch geprüft; `Color.stories.tsx:340` = `verticalAlign: "sub"` | behoben |
| §12 der `design-guidelines.md` | `--color-accent-700` steht mit **5.45** (gerechnet 5,4453) | behoben — aber die Tabelle trägt eine andere alte Zahl, siehe M27 |
| M13 · M15 · M16 · M18 | `width: var(--space-8)` · `Object.keys(AXIS_LABEL).length - Object.keys(AXIS_ENTITY).length`, gerendert **69** (72 − 3, gegen die Quelle nachgezählt) · `readToken`-JSDoc ohne Hex · `grep -c '#[0-9A-Fa-f]\{6\}'` = **0 · 0 · 0** | behoben |

### `check:contrast` — auf der Kopie verfälscht

| Probe | Ergebnis |
|---|---|
| unveränderte Datei | Exit **0**, „18 Angaben nachgerechnet, 3 … bleiben ungeprüft" |
| Zahl in `tokens.css` verfälscht (5.45:1 → 5.55:1) | Exit **1**, mit Datei, Zeile und gemessenem Wert |
| Zahl in `v3.css` verfälscht (4,02:1 → 9,99:1) | Exit **1** — die neue Reichweite trägt (in der Vorrunde noch Exit 0) |
| Zahl in `app-chrome.css` verfälscht (4.69:1 → 9.99:1) | Exit **1** |
| Tokenwert verfälscht (`text-subtle` `#717171` → `#999999`) | Exit **1**, **fünf** Angaben in zwei Dateien fallen zugleich (4,88 → 2,85 · 4,51 → 2,63 · 4,02 → 2,35) |
| `v3.css:266` mit seinem Token benannt | wird geprüft, **19 statt 18**, Lauf grün; dieselbe Angabe falsch (6,99) → Exit **1** |
| `v3.css:1294` mit seinen Token benannt | wird geprüft, 19 statt 18, Lauf grün |
| Alpha-Fall `v3.css:264` mit Token benannt | Exit **1** mit falscher Anklage („gemessen 5.45:1") — siehe M25 |
| **die Anleitung des Skripts wörtlich**, mit der richtigen Zahl für `bg-soft` | Exit **1**, falsche Anklage („auf weiss … gemessen 4.88:1") — siehe M22 |
| dieselbe Form mit der **falschen** Zahl (der Weiß-Zahl auf einem `bg-soft`-Grund) | Exit **0** — der Wächter bestätigt eine falsche Angabe |

Alle 21 Angaben der drei Blätter habe ich unabhängig nachgerechnet, dazu die
Zuordnung Token/Grund, die der Wächter intern trifft (Debug-Lauf auf der
Kopie): 5,4453 · 5,0263 · 5,0401 · 4,8807 · 4,5052 · 3,4522 · 5,5162 · 4,7777 ·
5,8610 · 5,4101 · 11,6428 · 2,1121 · 6,6869 · 4,8807 · 3,4522 · 4,8807 ·
1,0289 · 4,0200 · 3,4522 · 4,6896 · 4,6272. **Kein Abweicher**, auch nicht bei
den Zahlen ohne `:1` (4.81 / 4.44 / 4.45 / 9,4 / 4.14 / 4.46 / 1,62 / 2.87 /
3.79 und `components.css:35` mit 4.14).

### Mängel dieser Runde

**M22 — blockierend. Die Abhilfe, die der Wächter vorschreibt, ist weiter
wörtlich wirkungslos — und im schlimmeren Fall winkt er eine falsche Angabe
durch.** `scripts/check-contrast.mjs:157–161` verlangt: „name both tokens in
the comment: gemessen 2.87:1 (`--color-text-subtle` auf `--color-bg-soft`)" —
mit Backticks um **beide** Token. M19 hatte zwei Regexe vorgeschlagen; eingebaut
ist nur der für das Token (`:105`). Der Regex für den Grund (`:95`,
`auf\s+([A-Za-zäöü0-9-]+)`) lässt den Backtick weiterhin nicht zu: der Grund
fällt durch, und die Angabe wird still gegen **Weiß** gerechnet. Auf der Kopie
gemessen: die Anleitung mit der **richtigen** Zahl für `bg-soft` (4.51) →
Exit 1 mit der falschen Meldung „auf weiss … gemessen 4.88:1"; dieselbe Form
mit der **falschen** Zahl (4.88 dort, wo 4,51 gilt) → Exit **0**, grün. Wer der
Anleitung folgt, bekommt entweder eine falsche Anklage oder ein falsches
Testat. *Vorschlag (kleinster Weg, auf der Kopie belegt):* den Backtick auch im
Grund-Regex zulassen — die zweite Hälfte des schon angenommenen Vorschlags —,
oder die Anleitung auf die Form umschreiben, die funktioniert: `4.51:1 auf
bg-soft`, ohne Backticks um den Grund.

**M23 — blockierend. Zwei der drei ungeprüften Angaben sind sehr wohl
auflösbar; unauflösbar ist genau eine.** Der Lauf meldet `v3.css:264 · :266 ·
:1294`. Gemessen:

- `:266` „6,69:1" ist `--color-text-muted` auf Weiß = **6,6869** — voll in
  Token ausdrückbar. Der Kommentar nennt sein Token zwei Zeilen tiefer in
  Backticks, nur nicht auf der Zeile der Zahl. Gegenprobe: Token auf die Zeile
  geschrieben → 19 statt 18 geprüft, grün; Zahl verfälscht → Exit 1.
- `:1294` „1,03:1" ist `--color-accent` über `--color-border-control` =
  **1,0289** — beide Seiten sind Token. Gegenprobe: benannt → geprüft, grün.
- `:264` „2,11:1" ist der einzige echte Fall: `accent-700` bei `opacity: .5`
  über Weiß = **2,1121** — Deckkraft, die der Wächter nicht rechnet.

Damit stimmt die Behauptung aus „Nach der Wiederabnahme" nicht: dort steht
„ungeprüft bleiben **zwei** (echte Alpha-Fälle)" — von den zweien war schon
damals nur einer ein Alpha-Fall, der andere ist `text-muted` auf Weiß. Ebenso
`scripts/check-contrast.mjs:157–158`: „many claims name a class instead of a
token" — heute nennt **keine** der drei ungeprüften Angaben eine Klasse. Das
ist wieder eine handgeschriebene Behauptung neben einer gerechneten Zahl,
diesmal über den Wächter selbst. *Vorschlag:* die beiden Angaben mit ihren
Token schreiben (dann prüft er 20) und den Kommentar auf das reduzieren, was
gilt: ungeprüft bleibt, was Deckkraft trägt.

**M24 — eine Deckkraft-Angabe trägt `:1`, dreihundert Zeilen neben der Regel,
die es verbietet.** `v3.css:264`: „`opacity: .5` auf der Linkfarbe ergab
gemessen **2,11:1**". Die Zahl stimmt (2,1121), aber sie verletzt beide Hälften
der Konvention, die derselbe Commit aufgestellt hat: sie gilt für Deckkraft
(Skriptkopf `:21–24`) **und** für die verworfene Variante, nicht für den
gebauten Zustand (`v3.css:641`, `tokens.css:33`, `:84` halten sich daran).
*Vorschlag:* `2,11` ohne `:1`, wie 2.87 und 3.79 vierhundert Zeilen weiter —
dann bleibt keine Angabe ungeprüft, die es nicht sein muss.

**M25 — der Skriptkopf beschreibt das Gegenteil dessen, was das Skript tut.**
`scripts/check-contrast.mjs:23–24`: eine Deckkraft-Angabe würde er „gegen den
vollen Ton prüfen und **stillschweigend durchwinken**". Gemessen: nennt man am
Alpha-Fall das Token, rechnet er den vollen Ton und **schlägt an** — Exit 1,
„`--color-accent-700` auf weiss steht mit 2.11:1 da, gemessen 5.45:1". Er winkt
nicht durch, er klagt falsch an. Still bleibt er nur ohne Token, und das meldet
er. *Vorschlag:* den Satz auf die gemessene Wirkung umschreiben.

**M26 — blockierend. Der Plaketten-Satz in `Roles` ist zum dritten Mal falsch.**
`Color.stories.tsx:376–386` sagt: „Als Hex-Literale stehen nur noch **drei
Flächen** (`.bdg-info`, `.bdg-success`, `.bdg-warning`) und **vier Ränder**".
Gemessen in `app-chrome.css:455–463`: eine Hex-Fläche ist übrig
(`.bdg-warning`, `#F5EEE0`); `.bdg-info` liest `var(--color-accent-100)`,
`.bdg-success` `var(--color-success-bg)`, `.bdg-neutral` und `.bdg-danger`
ebenso Token. Die vier Hex-Ränder stimmen, „den Text holen alle fünf aus Token"
stimmt. Ursache: `01502ef` (0112) hat die zwei Flächen **39 Minuten nach** dem
Nacharbeits-Commit auf Token gezogen. Genau das ist der Punkt: M1 war dieser
Satz, M10 war dieser Satz, und er hängt weiter als handgeschriebener Anhang an
zwei gerechneten Spalten. *Vorschlag:* ableiten statt schreiben — `READERS`
enthält `app-chrome.css` bereits, die Zahl der Hex-Flächen und -Ränder ist
daraus zählbar; oder der Satz nennt keine Namen mehr.

**M27 — §12 trägt die sechste veraltete Kontrastzahl, und der Nachweis der
Vorrunde hat sie freigesprochen.** `docs/design-guidelines.md:586` nennt
`--color-success` „auf `success-bg` **4.46**", Rolle „Text — offen". Gemessen:
`#3F7A5A` auf `--color-success-bg` `#F0F6F2` = **4,6272**; 4,46 ist der Wert
gegen die **alte** Fläche `#EBF2EE` (4,4578), die 0112 ersetzt hat — womit der
Fall auch nicht mehr „offen" ist. Dieselbe Zahl steht in §11.5 (`:394`) noch
als offene Sofort-Aufgabe. Die Vorrunde hat „die übrigen elf Zahlen der Tabelle
stimmen" geschrieben und 4.46 dabei ausdrücklich mitgezählt. Die
`Contrast`-Story rechnet richtig und zeigt **4,63:1** ohne Marke. Die zehn
anderen Zeilen der Tabelle stimmen, ebenso die zwei ersten Zahlen der
`success`-Zeile (13,7721 · 6,6869 · 4,8807/4,5052 · 5,4453 · 3,5521 · 11,6428 ·
5,0690/4,6791 · 5,5162/4,7777 · 6,0631 · 1,3029/1,6222 · 3,4522/3,1866).

**M28 (klein) — `Motion` zählt Animationen mit, die keine sind.**
`Surface.stories.tsx:551` zählt `/\banimation:/g` und kommt auf **5**; zwei
davon sind die `animation: none` **in** den Reduced-Motion-Blöcken selbst
(`v3.css:1075`, `:1932`). Echte Animationen sind **drei** (`v2pulse`, `v2spin`,
`v2toastin`), und jede wird von einem Block bedient. Die Zahl neben „4 Blöcken"
liest sich als Lücke, wo keine ist. *Vorschlag:* `none` ausschließen.

**M29 (klein) — `Roles` wendet seine eigene Regel auf einen Token nicht an.**
Der Vorspann sagt: „Ohne Rolle heißt: §3 nennt den Token nicht." §3 nennt in
der Primär-Zeile `--color-primary` (+`-600`, `-800`) — `-700` steht dort nicht,
bekommt in `Color.stories.tsx:254` aber die volle Rolle mit der Anmerkung
„Grundwert von --color-primary". Bei `accent-600` ist das gedeckt (§3 nennt ihn
wörtlich), bei `primary-700` nicht; nach der eigenen Regel wären es **7** ohne
Rolle, nicht 6.

**M14 und M17 stehen unverändert** und sind wie angekündigt **kein**
Rückgabegrund: `Sizes` führt oben „Produktiv"/„Lesend" und in den Marken
„Handlungs-Leiter"/„nur Entitäts-Leiter", der Vorspann sagt weiter „Was auf
einer Leiter steht, ist grün"; `--radius-none` trägt einen Einsatzort, den §2
nicht vergibt; `Surface.stories.tsx:497` fährt weiter `translateY(8px)`.

### Die Kriterien der Spec — gemessen

**Fest.** `pnpm typecheck` Exit 0 · die drei Dateien auf Barrel-Ebene, Titel
`v3/Grundlagen/Farbe` · `…/Raum und Fläche` · `…/Icons`, keine unter
`Primitives` (`index.json`) · alle 15 Stories laden und rendern, **null**
Konsolenmeldung (`Runtime.consoleAPICalled`/`exceptionThrown` über alle 15) ·
**null** gerenderte `**` · Exportnamen englisch (`Ramps` … `InUse`) · Status nur
über die Registry · „kein px" mit den Resten aus M17 (die 2 px/3 px in
`Surface` sind die *gezeigten* Abweichler). `pnpm build` nicht gefahren (0117).

**Variabel.**

| Kriterium | Messung | Ergebnis |
|---|---|---|
| Hex 0 in den drei Stories | 0 · 0 · 0 | erfüllt |
| kein neues CSS | `git diff --stat src/styles/` zeigt nur fremde Arbeit (`v3.css`, 0063, `.v2md--detail-breit`); an 0055 keine Zeile | erfüllt |
| jeder Farb-Token genau einmal in `Ramps` | **40** gerenderte Kacheln zu `grep -c '^  --color-'` = **40**; jede Kachel aus ihrer *gerenderten* Farbe unabhängig nachgerechnet, inklusive der drei `rgba`-Token (scrim 1,8841/1,8665 · focus-ring 1,4373/1,4110 · focus-ring-soft 1,1661/1,1575) — **kein Abweicher** | erfüllt |
| `warning-strong` mit „entfällt (A7, A9)" | gerendert `warning-strong · #9C5021 · 5,86:1 · 5,41:1 · entfällt (A7, A9) — Rückbau offen` | erfüllt |
| `accent` nicht textfähig, `accent-700` textfähig | `accent` Text **nein** („trägt keinen Text — unter 4,5:1"), gemessen 3,5521; `accent-700` Text **ja**, 5,4453 | erfüllt |
| „ohne Rolle" und „unbenutzt" gerechnet | „Unbenutzt: 5 — primary-900, accent-500, text-on-dark-muted, surface-raised, focus-ring"; die Gegenprobe der Spec (`rg` über `src/styles src/ui -g '!*.stories.tsx'`) liefert **dieselben fünf**. „Ohne Rolle: 6" gegen §3 durchgezählt, mit dem Vorbehalt aus M29 | erfüllt (M29) |
| `Criticality` mit Registry-`kind`, `success` außerhalb | `danger` · `warning` · `info` · `neutral`; `success` als eigene Zeile „Ausgang ‚erledigt'"; Debug nennt Stufen-Token **und** was `app-chrome.css` daraus macht | erfüllt |
| `Contrast` rechnet, statt zu zitieren | **39 Zeilen**, jede aus den gerenderten Farben der Probe-Spalte nachgerechnet — kein Abweicher, jede „unter der Schwelle"-Marke sitzt richtig (nur die drei `info`-Zeilen: 3,5521 · 3,2788 · 3,2878). Gegenprobe ohne Eingriff in `tokens.css`: `--color-text-subtle` per `addScriptToEvaluateOnNewDocument` auf `#999999` → 4,88/4,51 wird **2,85/2,63**, beide Zeilen markieren sich neu, `Ramps` zieht mit | erfüllt |
| `Space` zeigt alle 12 Stufen | 12 Balken, gemessene Breiten 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 px = ihre Token. Gegenprobe: `--space-6` zur Laufzeit auf 99 px → **nur** dieser Balken misst 99 px | erfüllt |
| `Radius`: Einsatzort je Radius, 1-px-Regel | sechs Radien gerendert 0 · 2 · 4 · 6 · 10 · 999 px = ihre Token; „1 px, nie dicker — die einzige Ausnahme ist der aktive Tab mit 2 px", daneben die 3-px-Zeile als Abweichler. `--radius-none` siehe M17 | erfüllt mit Mangel |
| `Elevation`: Rand **oder** Schatten, z-index-Leiter | gemessen: „Richtig" Rand 1 px / Schatten `none` · „Auch richtig" Rand 0 / Schatten gesetzt · „Falsch" **beides**. Leiter 5 · 20 · 40 · 60/61 gegen `v3.css` nachgezählt (380, 1673 · 1374 · 1945, 2001 · 812, 857, 864, 1913): stimmt. Alt-Leitern verifiziert: `components.css` 90/91 und 100, `booking.css` 1080/1081, `app-chrome.css` 50 und 200 | erfüllt |
| `Widths`: 1280-px-Schwelle als Linie | gemessen 720 · 1080 · **1280** · 1440 px, `container-wide` als einzige in `rgb(59,143,196)` = `--color-accent`; die Drawer-Linien folgen ihren `clamp()`/`min()`-Werten, `content-measure` 686 px = 68 ch | erfüllt |
| `States`: vier Zustände an drei Elementen, V7 | 4 × 3 gemessen: Zeile `transparent → rgb(244,246,248)` (bg-soft) → `rgb(241,247,251)` + `3px rgb(59,143,196)` → `opacity .5` + `not-allowed`; Knopf `rgb(26,58,92)` → `rgb(34,74,115)` (primary-600) → `rgb(20,48,75)` (primary-800) → `opacity .5`; Chip weiß → bg-soft → `rgb(26,58,92)` mit weißem Text. Jede Tonstufe gegen `v3.css` geprüft (147–150, 570–579, 692–707). Gegenprobe: echter `mouseMoved` auf die Ruhe-Zeile → `transparent` wird `rgb(244,246,248)` | erfüllt |
| `Motion`: auslösbar, Fokusring, Reduced Motion | 9 Auslöser, gemessene Dauern 0,12 / 0,18 / 0,28 s. Fokus per **echtem** Tab: Knopf und Zeile `2px solid rgb(59,143,196)`, Offset 2 px; das Feld als benannte Ausnahme `outline: none`, Rand `rgb(26,58,92)` und `rgba(59,143,196,0.14) 0 0 0 3px` — die genannten 11,64:1 unabhängig bestätigt (11,6428). Reduced Motion per `Emulation.setEmulatedMedia`: **alle** Übergangsdauern fallen auf 1e-05 s. Zählung 9 Transitions / 4 Blöcke stimmt, „5 Animations" siehe M28 | erfüllt (M28) |
| `Sizes`: beide Leitern, gemessene Praxis | Leitern 12/14/16 und 16/20/24, Strich 1,5. Praxis gerendert 12 (10×) · 13 (2×) · 14 (17×) · 15 (1×) · 16 (11×) · 20 (3×), Strich nur 1,5 (10×) — unabhängig gegen die Quelle gezählt (`size={…}` in `src/ui/v3` ohne Stories): **identisch**. Benennung siehe M14 | erfüllt mit Mangel |
| Vokabular (überholt durch 0087) | `Entities` 22 Zeilen zu 22 Einträgen in `ENTITY_ICON`, `Actions` 33 zu 33 in `ACTION_ICON`, „nur in Stories" 12; die 69 Achsen ohne Zeichen = 72 − 3, gegen `AXIS_LABEL`/`AXIS_ENTITY` nachgezählt. `pnpm check:icons` Exit 0 | erfüllt (Ersatz) |
| `WithWord`: die drei Bedingungen wörtlich | Wort für Wort wie §6 T8, dazu „`label` bleibt Pflicht und wird `aria-label` **und** `title`"; gemessen tragen alle vier `IconButton` beides. Kebab als Satz, nicht als Zeichen | erfüllt |
| alle Stories unter `v3/Grundlagen/…` | 15 von 15, keine unter `Primitives` | erfüllt |

### Befunde am Set (nicht 0055)

1. **§12 und §11.5 tragen die veraltete `success`-Zahl** — 4.46 statt gemessen
   **4,63** (M27). Wieder in Markdown, wohin der Wächter von Bauart nicht
   reicht.
2. **Der Wächter liest drei der fünf Blätter.** `components.css:35` trägt eine
   Kontrastangabe (`#2E78A8` auf `#E3F0F8` „misst 4.14", nachgerechnet 4,1403 —
   richtig, und ohne `:1`), `booking.css` keine. Wer dort eine geltende Angabe
   schreibt, bekommt sie nicht geprüft.
3. **Backticks rendern weiter als Zeichen** — `Entities` **22**, `Actions`
   **28**, aus den `meaning`/`instead`-Strings der Icon-Registry. Gehört zu
   `Icons.tsx` (0087), unverändert.
4. **`pnpm check:icons` hält weiter zwei Dateien offen**
   (`SourceDocumentDrawer.tsx`, `JournalEntryEditor.tsx`) — beide fremde
   Sitzungen, mit Grund in `PENDING`.

Abgenommen von / am: Claude (fremde Abnahme), 2026-09-07 — **zurück** ·
Offene Punkte: **M22, M23 und M26 blockieren**; M24, M25, M27–M29 nicht. Alle
Abnahmekriterien der Spec sind gemessen erfüllt, alle 21 Kontrastangaben der
drei Blätter stimmen auf vier Stellen, und der Wächter fängt die Verfälschung
jetzt in allen drei Dateien und in beide Richtungen — Zahl wie Tokenwert. Der
Rückgabegrund ist zum vierten Mal derselbe Fehlertyp: eine handgeschriebene
Behauptung neben einer gerechneten Zahl. Diesmal die Anleitung des Wächters,
die wörtlich befolgt eine falsche Angabe grün meldet; seine Aussage über die
eigenen ungeprüften Angaben, von denen nur eine wirklich unauflösbar ist; und
der Plaketten-Satz, der 39 Minuten nach dem Commit wieder unwahr wurde, weil er
geschrieben und nicht gerechnet ist.

## Nach der zweiten Wiederabnahme (2026-09-07): der Wächter prüft jetzt sich selbst

Drei Blocker, fünf kleine Punkte, dazu M14 und M17 aus den Vorrunden — alle
erledigt. Gemessen gegen den Dev-Server `http://localhost:6107` (CDP,
`document.body.innerText` der gerenderten Story), gerechnet mit demselben
WCAG-Verfahren wie der Wächter.

### M22 — die Anleitung wirkt jetzt, und zwar in beide Richtungen

Der Grund fiel durch, weil der Regex von der Zahl aus nach rechts las: in der
Form, die der Wächter selbst vorschreibt („2.87:1 (`--color-text-subtle` auf
`--color-bg-soft`)"), steht zwischen Zahl und „auf" noch das Token. Ein
Backtick mehr hätte das nicht geheilt. Jetzt wird die Zeile **vor jeder Zahl
geteilt** und der Grund nur im eigenen Abschnitt gesucht — damit gilt die
Regel „jede Angabe trägt ihren eigenen Grund" auch dann, wenn zwischen beiden
etwas steht. Gegenprobe an derselben Datei, angehängt und wieder entfernt:

| Probe | vorher | jetzt |
|---|---|---|
| Anleitungsform mit **richtiger** Zahl (4.51 auf `bg-soft`) | Exit 1, „auf weiss … gemessen 4.88" | Exit 0, mitgezählt (21) |
| Anleitungsform mit **falscher** Zahl (4.88 statt 4,51) | Exit 0, grün | Exit 1 |
| bestehende Zahl verfälscht (6,69 → 6,99) | Exit 1 | Exit 1 |

**Und er hat jetzt eine Selbstprüfung** — `node scripts/check-contrast.mjs
--test`, 12 Fälle, wie die vier anderen Wächter. Sie fand beim ersten Lauf
genau den Fall aus M22 (die Anleitungsform kam ohne Grund an) und beim zweiten
einen, den niemand gemeldet hatte: der Schnitt vor jeder Zahl trennte
**innerhalb** von „11.64:1" und der Wächter las 1,64 — `tokens.css:83` wäre ab
sofort falsch angeklagt worden. Ein Wächter, dessen Abhilfe zweimal
wirkungslos war, prüft ab jetzt zuerst sich selbst.

### M23 — es bleibt nichts ungeprüft

`v3.css:266` nennt `--color-text-muted` jetzt auf der Zeile der Zahl (6,69:1
auf Weiß = 6,6869), `v3.css:1300` nennt `--color-accent` **und** den Grund
`border-control` auf einer Zeile (1,03:1 = 1,0289). Damit rechnet der Lauf
**20 von 20** Angaben nach, ungeprüft bleibt keine. Der Skriptkommentar sagt
nicht mehr „many claims name a class instead of a token" — keine tut das —,
sondern was gilt: ungeprüft bleibt, was Deckkraft trägt, und das Token gehört
auf die Zeile der Zahl. Die falsche Zahl in „Nach der Wiederabnahme" („zwei
echte Alpha-Fälle") ist dort berichtigt.

### M26 — der Plaketten-Satz wird gezählt, nicht geschrieben

`Color.stories.tsx` leitet ihn aus `app-chrome.css` ab (`READERS` enthält die
Datei schon): Selektor, Fläche, Rand und Text je Plakette per Regex, die
Namen aus dem Treffer. Gerendert steht dort jetzt „von 5 Plaketten … stehen
als Hex-Literal noch **1 Fläche** (bdg-warning) und **4 Ränder** (bdg-info,
bdg-success, bdg-warning, bdg-danger); den Text holen alle aus Token" — genau
die Messung der Abnahme. Dreimal war dieser Satz falsch, weil er von Hand
zählte und eine fremde Aufgabe ihn überholte; ein vierter Anlauf mit
richtigen Zahlen hätte beim nächsten Commit wieder danebengelegen.

### Die kleineren

- **M24.** `v3.css:264` trägt „2,11" ohne `:1` — die Zahl gilt für eine
  Deckkraft und für die **verworfene** Variante, und die Form `X:1` ist nach
  der Konvention desselben Commits nur für geltende Angaben da.
- **M25.** Der Skriptkopf sagt jetzt, was gemessen passiert: bei einem
  Alpha-Fall mit Token rechnet er den vollen Ton und **klagt falsch an**
  (2,11 gegen 5,45), er winkt nicht durch; still bleibt er nur ohne Token,
  und das meldet er.
- **M27.** `design-guidelines.md:586` nennt 4,63 statt 4,46 (`#3F7A5A` auf
  `#F0F6F2` = 4,6272; 4,46 galt gegen die alte Fläche `#EBF2EE`), die Rolle
  ist „Text" statt „Text — offen", und die Zeile in §11.5 steht als
  **erledigt** da — 0112 hat die Fläche ersetzt, damit ist der Fall zu. Die
  `Contrast`-Story zeigt dieselben 4,63:1.
- **M28.** `Motion` zählt `animation:` ohne `none`. Gerendert: **3**
  Animationen (`v2pulse`, `v2spin`, `v2toastin`) gegen 4 Blöcke statt 5 gegen
  4. Der erste Anlauf des Regex zählte 4 — `\s*` vor dem Lookahead lässt sich
  wegbacktracken; die Grenze gehört direkt hinter den Doppelpunkt.
- **M29.** `--color-primary-700` hat keine Zeile mehr in `ROLES`: §3 nennt in
  der Primär-Zeile `--color-primary` mit `-600` und `-800`, den `-700` nicht.
  Gerendert stehen jetzt **7** Token ohne Rolle (primary-900, primary-700,
  primary-500, surface-raised, warning-strong, scrim, focus-ring-soft) — nach
  der Regel, die die Seite selbst aufstellt. Dass der Grundwert der Marke in
  §3 fehlt, ist ein Befund für §3, keine hier erfundene Zeile.

### M14 und M17 — die zwei aus den Vorrunden

- **M14.** Die Marken heißen wie die Register darüber: „produktive Leiter"
  und „nur lesende Leiter" statt „Handlungs-" und „Entitäts-Leiter"; die
  Konstanten dazu `PRODUCTIVE_LADDER`/`READING_LADDER`. Der Vorspann sagt
  „Was auf der Leiter **seines Registers** steht, ist grün" — das war der
  Satz, den 20 px widerlegt hat. Gemessen sind in der Story nur noch die vier
  neuen Marken, die alten Namen kommen nicht mehr vor.
- **M17.** `--radius-none` hat keinen Einsatzort mehr in `RADIUS_USE`;
  gerendert steht dort der Fallback „kein Einsatzort in §2" — §2 vergibt
  Einsatzorte für sm · md · lg · xl · pill. Und `Motion` fährt
  `translateY(var(--space-2))` statt `8px`.

`pnpm typecheck` Exit 0; `check:contrast`, `check:language`, `check:icons`,
`check:mirror`, `check:when` je Exit 0; beide Selbstprüfungen Exit 0
(12 und 8 Fälle). Nicht gebaut (0117).

**Status: Abnahme** — das Urteil der zweiten Runde war „zurück", also
entscheidet die dritte Runde, nicht ich. Zu prüfen sind die drei Blocker, die
fünf kleinen Punkte und M14/M17; die Gegenproben oben stehen zum Nachfahren
da, und `--test` ist der kürzeste Weg, dem Wächter selbst zu misstrauen.

## Wiederabnahme 2026-09-07 (dritte Runde, fremde Abnahme)

**Urteil: abgenommen.** Kein blockierender Mangel, kein neuer Mangel. Die drei
Blocker (M22, M23, M26), die fünf kleinen (M24, M25, M27–M29) und M14/M17 sind
behoben — jeder an seiner **Wirkung** gemessen, keiner am Text gelesen. Gemessen
gegen `http://localhost:6107` mit `scripts/cdp.mjs` aus dem Repo (ein Messlauf
über alle Stories, kein eigener Helfer); jede Kontrastzahl unabhängig aus den
**gerenderten** Farben nachgerechnet (WCAG 2.x, Alpha über den Grund
komponiert). Nichts gebaut, nichts geändert, nichts gestaget (`pnpm build`
weiter nicht gefahren, 0117).

### Der Wächter — erst geprüft, dann verfälscht

`node scripts/check-contrast.mjs --test` → Exit **0**, „Selbstprüfung in
Ordnung, 12 Fälle". `pnpm check:contrast` → Exit **0**, „**20** Angaben
nachgerechnet" — **ohne** den Zusatz „… bleiben ungeprüft", keine `?`-Zeile im
Lauf. Unabhängig gezählt: die drei Blätter tragen zusammen genau 20 Angaben der
Form `X,XX:1` (drei auf `tokens.css:32`, je zwei auf `:48`, `:68`, `:70`, je
eine auf `:63`, `:83`, `app-chrome.css:449`, `:456`, `v3.css:268`, `:273`,
`:613`, `:1276`, `:1303`, `:2995`, `:3065`) — 20 von 20, ungeprüft bleibt
keine.

Dann misstraut: die drei Blätter in ein Scratchpad kopiert (`src/styles/`
darunter), das Skript **aus dem Repo** von dort aus darauf laufen lassen.

| # | Probe auf der Kopie | Ergebnis |
|---|---|---|
| — | unverfälscht | Exit **0**, 20 |
| A | Zahl verfälscht: `tokens.css:48` 4.88 → 4.99 | Exit **1** — „steht mit 4.99:1 da, gemessen 4.88:1" |
| B | **Tokenwert** verfälscht: `--color-text-subtle` `#717171` → `#818181` | Exit **1** — **fünf** Angaben in **zwei** Dateien fallen (tokens 2, v3 3) |
| C | Zahl in `v3.css:268` 6,69 → 6,99 | Exit **1** |
| D | **Tokenwert** `--color-success` `#3F7A5A` → `#4F8A6A` | Exit **1** — `app-chrome.css:456` |
| E | **Anleitungsform wörtlich**, richtige Zahl — `` /* gemessen 4.51:1 (`--color-text-subtle` auf `--color-bg-soft`) */ `` an `v3.css` | Exit **0**, **21** nachgerechnet |
| F | dieselbe Form, falsche Zahl (4.88 statt 4,51) | Exit **1** |
| G | Anleitungsform an `app-chrome.css`, richtig (5.45, `--color-accent-700` auf Weiss) | Exit **0**, 21 |
| H | dieselbe, falsch (5.55) | Exit **1** |

Zahl **und** Tokenwert, in **allen drei** Blättern, in **beide** Richtungen —
und die Form, die sein Schlusstext (`:250–253`) vorschreibt, trägt jetzt in
beiden Dateien, in denen sie vorher durchfiel.

### Die drei Blocker

**M22 — behoben, an der Wirkung belegt (E–H oben).** Die Mechanik hält, was der
Kommentar `:98–111` behauptet: die Zeile wird **vor jeder Zahl** geteilt
(`(?<![\d.,])(?=\d+[.,]\d+\s*:\s*1)`), der Grund nur im eigenen Abschnitt
gesucht, und der Backtick zählt auf **beiden** Hälften — im Grund-Regex
(`:114`) wie im Token-Regex (`:126`). Der
Rückblick verhindert den Schnitt **innerhalb** von „11.64:1" — der Selbsttest
prüft genau das („zweistellige Zahl bleibt ganz"), und der Fall steht heute
zweimal echt in den Blättern (`tokens.css:83`, `Motion`). Die zwölf Fälle
decken die Anleitungsform, den Grund ohne Backtick, „ohne Grund ist Weiß", die
Zahl ohne `:1`, Komma wie Punkt, das Token zwei Zeilen tiefer, zwei Angaben in
einer Zeile mit je eigenem Grund — und vier gerechnete Verhältnisse.

**M23 — behoben.** `v3.css:268` nennt `--color-text-muted` auf der Zeile der
Zahl (6,69:1; unabhängig 6,6869), `v3.css:1303` nennt `--color-accent` **und**
den Grund `border-control` auf einer Zeile (1,03:1; unabhängig 1,0289). Der
dritte, echte Alpha-Fall trägt kein `:1` mehr und ist damit keine Angabe (M24).
Ergebnis: 20 von 20 gerechnet, nichts ungeprüft. Der Skriptkopf sagt nicht mehr
„many claims name a class instead of a token" — keine tut das.

**M26 — behoben, und zwar gerechnet.** Gerendert in `Roles`: „von **5**
Plaketten in `app-chrome.css` stehen als Hex-Literal noch **1 Fläche**
(bdg-warning) und **4 Ränder** (bdg-info, bdg-success, bdg-warning,
bdg-danger); den Text holen alle aus Token." Unabhängig aus
`app-chrome.css:455–463` nachgezählt: fünf `.bdg-*`-Regeln; Hex-`background`
nur `.bdg-warning` (`#F5EEE0`); Hex-`border-color` bei info (`#C7DFEC`),
success (`#D5E3DB`), warning (`#E8DCBE`), danger (`#E7CFCE`); `.bdg-neutral`
ganz aus Token; **kein** Hex-`color`. Der Satz kommt aus `READERS` per Regex,
die Namen aus dem Treffer — er kann jetzt nicht mehr veralten, ohne dass die
Zahl mitgeht. Gegenprobe auf die Trennung `color` / `border-color`: der
Rückblick `(?<!-)color:\s*#` liefert leer, und genau das steht da.

### Die fünf kleinen, M14 und M17

- **M24 — behoben.** `v3.css:263–265` trägt „`opacity: .5` auf der Linkfarbe
  ergab gemessen **2,11**" ohne `:1`, mit dem Satz, warum. Der Wächter sieht
  dort keine Angabe mehr (Selbsttestfall „Zahl ohne `:1` ist keine Angabe").
- **M25 — behoben, gegen die Wirkung geprüft.** Der Kopf (`:21–27`) behauptet
  drei Dinge; alle drei auf der Kopie nachgemessen: Alpha-Angabe **mit** Token
  → Exit 1, „`--color-accent-700` auf Weiss steht mit 2.11:1 da, gemessen
  5.45:1" (klagt falsch an, winkt nicht durch); Alpha-Angabe **ohne** Token in
  `v3.css` → Exit 0 mit „1 … bleiben ungeprüft"; dieselbe in `tokens.css` →
  Exit **1**. Der Kopf beschreibt jetzt, was passiert.
- **M27 — behoben.** `design-guidelines.md:587` nennt „5.07 (4.68); auf
  `success-bg` **4.63**", Rolle **„Text"** (nicht mehr „Text — offen"); §11.5
  (`:395`) steht durchgestrichen als **Erledigt** mit beiden Zahlen und dem
  Grund. Unabhängig: `#3F7A5A` auf `#F0F6F2` = **4,6272**, auf dem alten
  `#EBF2EE` 4,4578. **Alle zwölf Zeilen** der §12-Tabelle nachgerechnet, kein
  Abweicher: 13,7721 · 6,6869 · 4,8807/4,5052 · 5,4453 · 3,5521 · 11,6428 ·
  5,0690/4,6791/4,6272 · 5,5162/4,7777 · 6,0631 · 1,3029/1,6222 ·
  3,4522/3,1866. Die `Contrast`-Story zeigt dieselben 4,63:1.
- **M28 — behoben.** `Surface.stories.tsx:557` zählt
  `/\banimation:(?!\s*none)/g`; gerendert: „**9** Transitions und **3**
  Animations stehen **4** Blöcken gegenüber". Unabhängig in `v3.css` gezählt:
  fünf `animation:`, davon zwei `none` (`:1077`, `:1942`) → drei echte
  (`:1074` `v2pulse`, `:1790` `v2spin`, `:1934` `v2toastin`), passend zu drei
  `@keyframes`; `transition:` 9; `prefers-reduced-motion` 4.
- **M29 — behoben.** `--color-primary-700` hat keine `ROLES`-Zeile mehr
  (`Color.stories.tsx:254` sagt warum). Gerendert: „Ohne Rolle: **7** —
  primary-900, primary-700, primary-500, surface-raised, warning-strong,
  scrim, focus-ring-soft". Gegen §3 durchgezählt: §3 nennt in der Primär-Zeile
  `--color-primary` (+`-600`, `-800`), in der Akzent-Zeile `-600`, `-500`,
  `-100`, `-50`, bei Fläche nur `--color-surface` · `-head`, beim Fokus
  `--color-focus` / `-ring` — die sieben stimmen. Folgefehler geprüft:
  `Contrast` hat dadurch **37** statt 39 Zeilen, weil primary-700 zwei
  Textzeilen stellte.
- **M14 — behoben.** Gerendert stehen nur noch „produktive Leiter", „nur
  lesende Leiter", „auf beiden Leitern", „daneben"; „Handlungs-Leiter" und
  „Entitäts-Leiter" kommen im gerenderten Text nicht mehr vor. Der Vorspann
  sagt „Was auf der Leiter **seines Registers** steht, ist grün".
- **M17 — behoben.** `Radius` zeigt bei `none` den Fallback „kein Einsatzort in
  §2" (`RADIUS_USE` hat keinen Eintrag mehr); `Motion` fährt
  `translateY(var(--space-2))`, gerendert gemessen `matrix(1, 0, 0, 1, 0, 8)`.

### Die Kriterien der Spec — gemessen

**Fest.** `pnpm typecheck` Exit **0** · `check:language` **0** ·
`check:icons` **0** („53 Zeichen in der Registry, 2 Datei(en) noch offen") ·
`check:contrast` **0** · `check:mirror` **0** (8 Fälle) · `check:when` **0** ·
`check-contrast.mjs --test` **0** (12 Fälle) — je über den **Exit-Code**, nicht
über `| tail`. Die drei Dateien liegen auf Barrel-Ebene; `index.json` führt
`v3/Grundlagen/Farbe` (4), `… /Raum und Fläche` (6), `… /Icons` (5) — 15
Stories, **null** unter `Primitives`. Alle 15 laden und rendern, **null**
`Runtime.exceptionThrown` und keine Konsolenmeldung außer dem
`favicon.ico`-404 des Storybook-Rahmens; **null** gerendertes `**`;
Exportnamen englisch (`Ramps` … `InUse`). `pnpm build` nicht gefahren (0117).

**Variabel.**

| Kriterium | Messung | Ergebnis |
|---|---|---|
| Hex 0 in den drei Stories | `grep -c '#[0-9A-Fa-f]\{6\}'` = 0 · 0 · 0 | erfüllt |
| kein neues CSS | `git diff --stat src/styles/` war beim Messen **leer**; während der Abnahme landete dort fremde Arbeit (`v3.css` +18, `.v2oil__*` aus 0026) — an 0055 keine Zeile, und die 20 Kontrastangaben bleiben unberührt (`check:contrast` danach erneut Exit 0) | erfüllt |
| jeder Farb-Token genau einmal in `Ramps` | **40** gerenderte Kacheln gegen `grep -c '^  --color-'` = **40**; jede Kachel aus ihrer *gerenderten* Farbe unabhängig nachgerechnet, `rgba`-Token über den Grund komponiert — **0 Abweicher** unter 40 × 2 Zahlen | erfüllt |
| `warning-strong` mit „entfällt (A7, A9)" | gerendert `warning-strong · #9C5021 · 5,86:1 · 5,41:1 · entfällt (A7, A9) — Rückbau offen` | erfüllt |
| `accent` nicht textfähig, `accent-700` textfähig | `accent` Text **nein**, Anmerkung „trägt keinen Text — unter 4,5:1" (3,5521); `accent-700` Text **ja**, „die einzige Akzentstufe für Text" (5,4453) | erfüllt |
| „ohne Rolle" und „unbenutzt" gerechnet | „Ohne Rolle: **7**" gegen §3 durchgezählt (M29); „Unbenutzt: **5** — primary-900, accent-500, text-on-dark-muted, surface-raised, focus-ring"; die `rg`-Gegenprobe der Spec liefert **dieselben fünf** | erfüllt |
| `Criticality` mit Registry-`kind`, `success` außerhalb | `danger` · `warning` · `info` · `neutral`, dazu die Zeile „Ausgang ‚erledigt'" mit `success`; Debug nennt `text-subtle` **und** was `app-chrome.css` daraus macht (`--color-text`) | erfüllt |
| `Contrast` rechnet, statt zu zitieren | **37** Zeilen, jede aus den gerenderten Farben der Probe-Spalte nachgerechnet: **0** falsche Zahlen, **0** falsch gesetzte Marken; markiert sind genau die drei `info`-Zeilen (3,55 · 3,28 · 3,29). Gegenprobe **ohne** Eingriff in `tokens.css`: `--color-text-subtle` per `addScriptToEvaluateOnNewDocument` auf `#999999` → 4,88/4,51 wird **2,85/2,63** (unabhängig 2,8490 / 2,6298), beide Zeilen setzen die Marke „unter der Schwelle", `Ramps` zieht mit | erfüllt |
| `Space` zeigt alle 12 Stufen | 12 Balken, gemessene Breiten 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 px = ihre Token; keine Zwischengröße | erfüllt |
| `Radius`: Einsatzort je Radius, 1-px-Regel | sechs Radien gemessen 0 · 2 · 4 · 6 · 10 · 999 px; „Rand: 1 px, nie dicker — die einzige Ausnahme ist der aktive Tab mit 2 px" (`v3.css:657` `.v2tab` `border-bottom: 2px`), daneben die 3-px-Zeile als benannter Abweichler (`v3.css:150` `.v2tbl__row.is-active` `border-left: 3px`); `none` → „kein Einsatzort in §2" | erfüllt |
| `Elevation`: Rand **oder** Schatten, z-index-Leiter | gemessen „Richtig" Rand 1 px / Schatten `none` · „Auch richtig" Rand 0 / Schatten gesetzt · „Falsch" **beides**. Leiter 5 · 20 · 40 · 60/61 gegen `v3.css` nachgezählt (382, 1683 · 1384 · 1955, 2011 · 814, 859, 866, 1923). Alt-Leitern nachgeprüft: `components.css` 90/91 und 100, `booking.css` 1080/1081, `app-chrome.css` 50 und 200 | erfüllt |
| `Widths`: 1280-px-Schwelle als Linie | gemessen 720 · 1080 · **1280** · 1440 px; `container-wide` als einzige in `rgb(59, 143, 196)` = `--color-accent`, alle anderen in `rgb(196, 204, 213)`; `content-measure` 686,375 px = 68 ch. Befund 10 nachgezählt: `max-width: 1160px` steht **dreimal** in `v3.css` (1646, 1648, 1721) | erfüllt |
| `States`: vier Zustände an drei Elementen, V7 | 4 × 3 gerendert, je Zustand die Tonstufe benannt; V7-Satz steht („ausgewählt" trägt die Kante bzw. die Umkehr, „gesperrt" den Zeiger, „gedrückt" den flacheren Schatten). Gegenprobe mit **echtem** `mouseMoved` auf die Ruhe-Zeile: `rgba(0, 0, 0, 0)` → `rgb(244, 246, 248)` (= `--color-bg-soft`), Regel `.v2tbl__row.is-clickable:hover`; `CSS.forcePseudoState` liefert denselben Wert | erfüllt |
| `Motion`: auslösbar, Fokusring, Reduced Motion | 9 Auslöser (3 Dauern × 3 Kurven), gemessene Dauern 0,12 / 0,18 / 0,28 s. Fokusring an **drei** Elementen über `CSS.forcePseudoState`: `.v2btn` `rgb(59, 143, 196) solid 2px`, Offset 2 px · `.v2tbl__row` ebenso · `.v2in` als benannte Ausnahme `outline: none`, Rand `rgb(26, 58, 92)` (= `--color-primary-700`, 11,6428) plus `rgba(59, 143, 196, 0.14) 0 0 0 3px`. Reduced Motion per `Emulation.setEmulatedMedia`: **alle** 181 Transition-Dauern fallen auf `1e-05s` (ohne Emulation 23 Elemente mit 0,12 / 0,18 / 0,2 / 0,28 / 0,3 s). Zählung 9 / 3 / 4 unabhängig bestätigt | erfüllt |
| `Sizes`: beide Leitern, gemessene Praxis | Leitern 12/14/16 und 16/20/24, Strich 1,5. Praxis gerendert 12 (10×) · 13 (2×) · 14 (17×) · 15 (1×) · 16 (11×) · 20 (3×), Strich nur 1,5 (10×) — unabhängig gegen `size={…}` / `strokeWidth={…}` in `src/ui/v3` ohne Stories gezählt: **identisch** | erfüllt |
| Vokabular (überholt durch 0087) | `pnpm check:icons` Exit 0; `Entities` und `Actions` führen die Registry-Einträge, „nur in Stories" separat | erfüllt (Ersatz) |
| `WithWord`: die drei Bedingungen wörtlich | Wort für Wort wie §6 T8 (`design-guidelines.md:168`), dazu „`label` bleibt Pflicht und wird `aria-label` **und** `title`"; gemessen tragen **alle vier** `v2ibtn` beides (Schließen, Vorheriger Beleg, Nächster Beleg, Löschen). Kebab als Satz, nicht als Zeichen | erfüllt |
| alle Stories unter `v3/Grundlagen/…` | 15 von 15, keine unter `Primitives` | erfüllt |

### Mängel dieser Runde

Keine. Weder blockierend noch klein — die Reihe M1 · M10 · M26 („eine
handgeschriebene Behauptung neben einer gerechneten Zahl") reißt hier zum
ersten Mal ab, weil der Satz jetzt gezählt wird und der Wächter zuerst sich
selbst prüft.

### Befunde am Set (nicht 0055)

1. **Der Wächter liest drei von fünf Blättern.** `components.css:35` trägt eine
   geltende Kontrastangabe (`#2E78A8` auf `#E3F0F8` „misst 4.14", unabhängig
   4,1403 — richtig, und ohne `:1`), `booking.css` keine. Wer dort eine
   geltende Angabe schreibt, bekommt sie nicht geprüft. Unverändert aus der
   Vorrunde.
2. **Markdown bleibt ungeschützt.** §12 und §3 der `design-guidelines.md`
   tragen Kontrastzahlen (heute alle nachgerechnet und richtig, auch die
   „4,88:1" in der Diagrammreihe von §3), aber `check:contrast` reicht von
   Bauart nicht dorthin — genau die Lücke, aus der M27 entstanden ist. Ein
   Lauf, der `docs/*.md` mitliest, fängt die siebte veraltete Zahl vor der
   Abnahme.
3. **Backticks rendern weiter als Zeichen** — `Entities` **22**, `Actions`
   **28**, aus den `meaning`/`instead`-Strings der Icon-Registry. Gehört zu
   `Icons.tsx` (0087), unverändert.
4. **`pnpm check:icons` hält weiter zwei Dateien offen**
   (`SourceDocumentDrawer.tsx`, `JournalEntryEditor.tsx`) — beide fremde
   Sitzungen, mit Grund in `PENDING`.
5. **§3 kennt `--color-primary-700` nicht**, obwohl er den Grundwert der Marke
   stellt (`#1A3A5C`, derselbe Wert wie `--color-primary`). Die Seite steht
   nach M29 richtig da; der Befund gehört §3 der `design-guidelines.md`, nicht
   dieser Aufgabe.
6. **`Elevation` gibt `--glow-accent` und `--glow-primary` denselben
   Einsatzort-Satz** („aktiv, fokussiert, von Ludwig angefasst — sparsam"). Die
   Zeile sagt damit nicht, wann welcher gilt — klein, und keine Zahl.
7. **Kein Befund:** die drei gerenderten `**` in
   `v3-grundlagen-typografie--registers` sind Pfad-Globs (`/clients/**`,
   `/admin/**`, `/hilfe/**`), kein durchgereichtes Markdown. Hier notiert,
   damit die nächste Runde sie nicht jagt.

Abgenommen von / am: Claude (fremde Abnahme), 2026-09-07 — **abgenommen** ·
Offene Punkte: keine an 0055. Alle Abnahmekriterien der Spec sind gemessen
erfüllt; die 20 Kontrastangaben der drei Blätter und die zwölf Zeilen der
§12-Tabelle stimmen auf vier Stellen; der Wächter fängt Zahl **und** Tokenwert
in allen drei Blättern und in beide Richtungen, und seine eigene Anleitung
trägt jetzt — wörtlich eingesetzt, mit richtiger Zahl grün und mit falscher
rot. Die drei Zahlen, die dreimal von Hand geschrieben waren (Plaketten,
ungeprüfte Angaben, Animationen), werden jetzt gerechnet.

## Nach der dritten Wiederabnahme (2026-09-08)

**Urteil: abgenommen**, ohne blockierenden und ohne neuen Mangel — die erste
Aufgabe dieser Reihe, die eine Runde ohne Befund übersteht. Die drei Blocker
und die sieben kleinen Punkte hielten alle der Gegenprobe stand; besonders
zählt, dass der Kontrast-Wächter auf einer Kopie **in beide Richtungen**
anschlägt: die vom Schlusstext vorgeschriebene Form mit richtiger Zahl grün,
mit falscher rot, in `v3.css` wie in `app-chrome.css`.

**Status: fertig.**

### Was der Prüfer daneben gefunden hat — und was daraus folgt

Vier Befunde am Set, zwei davon sind Lücken derselben Klasse, an der dieses
Repo heute schon zweimal hing:

1. **Der Kontrast-Wächter liest drei von fünf Blättern.** `components.css:35`
   trägt eine geltende, korrekte Angabe (4,1403) außerhalb seiner Reichweite.
2. **Markdown ist ganz ungeschützt.** Genau daraus entstand M27 — die sechste
   veraltete Kontrastzahl stand in `design-guidelines.md`, nicht im CSS, und
   fiel deshalb keinem Lauf auf.
3. **Backticks rendern als Zeichen** in `Entities` (22 Stellen) und `Actions`
   (28) — die Seite zeigt das Zeichen statt der Auszeichnung.
4. **§3 kennt `--color-primary-700` nicht**, obwohl er der Grundwert der Marke
   ist. Das ist der Befund, den M29 hinterlassen hat: die Seite zählt ihn
   seither richtig als „ohne Rolle", die Richtlinie schweigt weiter.

Die ersten beiden sind eigene Arbeit an `scripts/check-contrast.mjs` und
werden dort erledigt; 3 und 4 stehen als Befunde.
