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

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
