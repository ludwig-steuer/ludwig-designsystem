# 0268 · Laufanzeige für kurze Wartezeiten (`Spinner`)

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-27 (21/21 ✓, Protokoll unten); H1 (Sprung im Block, `vertical-align: top`), H2 (Kommentare zu reduce), H4 („ …“ an laufenden Wörtern) behoben; offene Fragen nach Default gebaut |
| Stufe | `primitives/` — neue Primitive, gehoben aus dem `.v2spin`-Span in `Button.tsx` |
| Klassen-Test | ja: jede Oberfläche hat Wartezeiten von Sekunden, deren Ergebnis noch keine Form hat, die man vorzeichnen könnte |
| Quelle | Anfrage plugin-mananger 2026-11-27 (Simon): `ludwig-plugin/docs/spec-bausteine.md` (Branch `umbau`), Zeile „Laufanzeige — kurze Wartezeiten, „wird geprüft“ — klein in der Zeile, groß in der Fläche“; `docs/spec-oberflaeche-und-fehler.md` C1 („Nach dem Verbinden läuft die Prüfung von selbst“) und C6 (Bereitschaftsprüfung, Prüfpunkt „wird geprüft“) |
| Ersetzt | im Set den `<span className="v2spin" aria-hidden="true" />` in `Button.tsx` (`inner`, Z. 82). In `ludwig/app` gibt es keinen eigenen Drehkreis: 0 Treffer für `v2spin`, `animate-spin`, `Loader2` und `progress-indeterminate` in `apps/web/src` (411 TSX-Dateien, gezählt 2026-11-27) |
| Blockiert | 0270 (Prüfpunkt-Zeile „wird geprüft“), 0263 (Popup, Einrichtung), Plugin-Paket „Designsystem einbauen“ |
| Spec von / am | designsystem, 2026-11-27 |

## Ziel

Die Mitarbeiterin der Kanzlei verbindet die Erweiterung mit Ludwig. Danach
prüft das Plugin von selbst, ob alles bereit ist, und das dauert ein paar
Sekunden. In dieser Zeit soll sie sehen, dass etwas läuft und was gerade
läuft: „Verbindung wird geprüft …“ in der Fläche, „wird geprüft …“ in der
Zeile des einzelnen Prüfpunkts. Heute gibt es dafür im Set nur den Drehkreis
im Knopf, und den kann außerhalb des Knopfs niemand verwenden.

## Einordnung

- **Wiederverwenden — geprüft und verworfen:**
  - `Button` mit `loading` zeigt den Kreis nur in einem Knopf. Ein Prüfpunkt,
    der läuft, ist aber kein Knopf.
  - `Skeleton` (`@when` „A card, a detail pane or a form field is still
    loading“) zeichnet die Form des Inhalts vor. Eine Prüfung, deren Ergebnis
    ein Satz ist, hat keine Form, die man vorzeichnen könnte.
  - `RunMark` (privat in `entities/agent-run/AgentRun.tsx`, `.v3runmark`) ist
    das Zeichen für Arbeit, die Minuten dauert: ein Stück, das in einer Spur
    gleitet. 0225 hat das bewusst vom Kreis getrennt: „`.v2spin` steht für
    eine kurze Handlung im Knopf; zwölf Minuten Drehen sind nicht ruhig.“
    Daran hält sich diese Spec. **Der Kreis heißt „kurz“, das gleitende Stück
    heißt „dauert“.** Ein Zeichen hat eine Bedeutung.
  - `Progress` zeigt einen bekannten Anteil, und eine kurze Wartezeit hat
    keinen.
- **Neu, weil:** §3 Regel 3.
  - Kein `@when` deckt eine kurze Wartezeit außerhalb des Knopfs.
  - Es braucht kein Fachwort.
  - Es gibt heute zwei Verwendungen: den Knopf und die Prüfpunkt-Zeile (0270).
    Die Fläche (0263: Popup und Einrichtung) kommt als dritte dazu.
  - An der Aufrufstelle wäre es kein Einzeiler: Maß, Farbe, Bewegung,
    `prefers-reduced-motion` und die Ausrichtung zum Wort lägen dann an jeder
    Stelle neu.
- **Zuschnitt:** eine Datei `primitives/Spinner.tsx` mit einem Export.
  `Button` zieht darauf um und behält sein Bild.
- **Setzt auf:** die vorhandene Klasse `.v2spin` und das Schlüsselbild
  `v2spin` in `v3.css`. Neue Klassen werden vor dem Benennen gegrept
  (kurze `v2*`-Präfixe sind vergeben).
- **Abweichung vom Auftrag:** Der Auftrag sah vor, dass Button **und**
  `RunMark` auf die neue Primitive ziehen. `RunMark` zieht nicht um, aus dem
  Grund oben (0225). Was mit ihm später geschieht, steht unter Ausbau.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `label` | `string \| null` | ja | Das Wort neben dem Kreis, sichtbar: „wird geprüft …“, „Verbindung wird geprüft …“. `null` nur dort, wo das Wort schon daneben steht, also im Knopf. Dann rendert die Komponente nur den Kreis, `aria-hidden`, ohne Text | `Sizes`, `InButton` |
| `size` | `"sm" \| "lg"` | nein (`"sm"`) | `sm`: Kreis 14 px neben Zeilentext (`--fs-ui`), für die Zeile. `lg`: Kreis 20 px, Wort in `--fs-ui-md`, für eine Fläche, die auf einen Satz wartet. Die Maße stehen in `v3.css`, nicht im TSX | `Sizes`, `InArea` |

Typen aus `src/ludwig/`: keine. GLOSSARY: kein Fachbegriff, die Wörter
bringt der Aufrufer mit.

So viele Props, wie die Tabelle führt. Die Regel „nie ohne Wort“ (V7)
steckt im Typ: `label` ist Pflicht. Wer den Kreis allein will, muss `null`
hinschreiben und damit sagen, wo das Wort steht.

Was die Komponente **nicht** kann (bewusst):
- **Keine Live-Region, keine `role`.** Ansagen macht die eine Region des
  Aufrufers: `PhaseProgress` (0265), die Statuszeile der Seite, `Toast`. Zwei
  Gründe:
  - Eine Region, die mit ihrem Inhalt ins DOM kommt, lesen die meisten
    Screenreader nicht vor (0225, H3).
  - Fünf laufende Prüfpunkte würden sich gegenseitig übersprechen.
- **Kein Anteil, keine Zeit, kein Abbrechen.** Ein bekannter Anteil gehört
  zu `Progress`, Arbeit über Minuten zu `PhaseProgress` (0265) oder
  `AgentRunBanner`. Ein Abbrechen-Knopf steht beim Aufrufer.
- **Kein Ersatz für `Skeleton`.** Hat der Inhalt eine Form, wird die Form
  vorgezeichnet.
- **Nicht für „Abgleich läuft“.** Ein Abgleich dauert Minuten. Das zeigt
  `PhaseProgress` (0265), nicht ein drehender Kreis.

## Verhalten

- **Kein Ziel, kein Hover, kein Fokus.** Der Spinner ist nicht klickbar,
  also bekommt er keinen Hover, und Tab überspringt ihn.
- **Anordnung:** Kreis links, Wort rechts, beides linksbündig, auch in der
  Fläche („nichts zentriert“).
  - Der Kreis steht auf der Höhe der ersten Textzeile und schrumpft nie
    (`flex: 0 0 auto`).
  - Ein langes Wort bricht um. Der Kreis bleibt oben.
- **Farbe:**
  - Der Kreis allein steht in `--color-accent-700`, bei voller Deckkraft.
    Läuft ist im Set `info`, also Akzent und keine Kritikalitätsfarbe; vgl.
    `JOB_STATUS.running` „Läuft“ (info).
  - Das Wort steht in `--color-text-muted`.
  - Im Knopf bleibt es bei `currentColor` mit der heutigen Deckkraft 0,7, und
    der Knopf sieht aus wie vorher.
- **Bewegung:** Drehung 700 ms, linear, wie heute.
  - Bei `prefers-reduced-motion: reduce` **steht der Kreis still**: Der
    Bogen ist sichtbar, es läuft keine Animation. Was gerade passiert, sagt
    das Wort mit „ …“.
  - Das ändert den heutigen Wert, denn bisher dreht `.v2spin` dort langsamer
    (2,4 s). Die Begründung ist Gleichförmigkeit: `Skeleton` (`.v2skel`) und
    `RunMark` stehen bei Wunsch nach weniger Bewegung schon still. Damit
    gilt das auch für den Knopf, siehe offene Frage 1.
- **Zustände:** Der Spinner *ist* der Zustand „lädt“ eines anderen
  Bausteins. Gefüllt, leer, leer nach Filter und Fehler hat er nicht. Was
  nach dem Warten kommt, zeigt der Aufrufer.
- **Server-Component:** kein Zustand, keine Effekte.

## Stories

Titel `v3/Primitives/Fläche/Spinner`, Gruppe Fläche (neben `Skeleton`).
Untergrenze für eine Primitive: 3.

| Story | Beweist |
|---|---|
| `Sizes` | `sm` und `lg` nebeneinander, je mit Wort, auf drei Gründen: `--color-surface`, `--color-bg-soft`, `--color-accent-50` |
| `InRow` | `sm` in einer Liste von Prüfpunkten zwischen zwei Nachbarzeilen mit `StateIcon` und Wort: „Verbindung zu Ludwig · in Ordnung“, „Anmeldung in DATEV · wird geprüft …“, „Browser-Freigabe · offen“. Alle Zeilen gleich hoch |
| `InArea` | `lg` im Körper einer `Card` mit Kopf „Einrichtung“: „Verbindung wird geprüft …“, linksbündig zum Kartentext. Ein Schalter in der Story wechselt auf das Ergebnis „Alles bereit. Sie können den ersten Abgleich starten.“ und zurück |
| `InButton` | `Button` mit `loading` in `xs`, `sm` und `md`, primär und sekundär, mit und ohne `loadingLabel`. Gleiche Pixel wie die Story `Button/Loading` vor dem Umbau |
| `LongLabel` | Rand: „Verbindung zu Ludwig wird geprüft, das dauert einige Sekunden …“ in einem Rahmen von 280 px (Breite des Popups minus Rand). Das Wort bricht um, der Kreis bleibt 14 px und oben |

Nicht anwendbare Zustände und warum: Leer, leer nach Filter und Fehler gibt
es nicht, der Spinner ist selbst der Ladezustand (siehe Verhalten).
`prefers-reduced-motion` bekommt keine eigene Story, denn eine Story kann die
Mediaabfrage nicht setzen. Gemessen wird an `Sizes`, mit
`Emulation.setEmulatedMedia` wie in 0225.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Ansage des Wartebeginns, wenn eine Fläche ihren ganzen Inhalt durch den Spinner ersetzt | keine Prop am Spinner. Der Aufrufer hält eine Region bereit, oder später ein `aria-busy` am Container über eine Seitenhilfe | Eine Seite muss den Beginn einer Wartezeit ansagen. Heute sagen Seiten Ergebnisse an |
| `RunMark` als Primitive neben `Spinner` (das Zeichen für „dauert“) | eigener Export `RunMark` in `primitives/`, `AgentRun.tsx` importiert ihn | Ein zweiter Aufrufer außerhalb von `entities/agent-run` braucht das gleitende Stück als eigenes Zeichen, z. B. die Statuszeile „Abgleich läuft“ im Popup (0263). `PhaseProgress` (0265) braucht es nicht als Komponente, nur dieselbe Bewegung im Abschnitt |
| `IconButton` mit Ladezustand (Kopieren, Herunterladen) | `loading?: boolean` an `IconButton`, innen `Spinner label={null}` | Ein Symbolknopf löst etwas aus, das länger als 300 ms dauert |

## Offene Fragen

1. **Steht der Kreis bei `prefers-reduced-motion` still, auch im Knopf?**
   Heute dreht er dort langsamer (2,4 s). **Ohne Antwort:** Er steht still,
   wie `Skeleton` und `RunMark`, und das Wort trägt die Bedeutung. Das ist
   eine Entscheidung über Bewegung im ganzen Set und gehört deshalb dem
   Owner. Bis zur Antwort baut der Bau den Default.
2. **Ist `lg` 20 oder 24 px groß?** 20 und 24 sind Stufen der Leseleiter
   (A8: 16/20/24), die Zeile bleibt bei 14. **Ohne Antwort:** 20 px. Die
   Fläche gehört zum Arbeitsregister des Plugins, und 24 px wären neben einem
   14-px-Wort laut.
3. **Bleibt „Abgleich läuft“ ohne Kreis?** Das Beispiel im Auftrag war
   „lg: Abgleich läuft“. **Ohne Antwort:** ja. Ein Abgleich dauert Minuten,
   das zeigt `PhaseProgress` (0265) mit dem gleitenden Stück, und das Popup
   (0263) nimmt dasselbe Stück.

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

- [ ] `label` und `size` stehen im Typ wie in der Tabelle; `label` ist Pflicht und hat keinen Default (`Sizes`, Typcheck einer Aufrufstelle ohne `label` schlägt fehl)
- [ ] `size`, gemessen: `sm` Kreis 14 × 14 px, Wort `--fs-ui`; `lg` Kreis 20 × 20 px, Wort `--fs-ui-md` (`Sizes`)
- [ ] `label` als String: Das Wort steht sichtbar rechts vom Kreis. Im Barrierefreiheitsbaum fehlt der Kreis (`aria-hidden`), das Wort ist Text. Im DOM des Spinners gibt es kein `role`, kein `aria-live`, kein `aria-busy` (`Sizes`, `InRow`)
- [ ] `label={null}`: Gerendert wird nur der Kreis, `aria-hidden`, ohne Text. Der zugängliche Name des Knopfs bleibt „Speichere …“ bzw. „Stapel prüfen“ (`InButton`)
- [ ] Ersatz: `Button.inner` rendert `Spinner label={null}`. Die Story `Button/Loading` und `InButton` sind bei 1280 px pixelgleich zum Stand vor dem Umbau (Bildvergleich `scripts/png-diff.mjs` ≤ 0,5 %), auch der 12-px-Kreis im `xs`-Knopf
- [ ] Bewegung ohne Emulation: genau eine Animation am Kreis, `v2spin`, 700 ms, linear, endlos. Mit `prefers-reduced-motion: reduce` (`Emulation.setEmulatedMedia`): `document.getAnimations()` ist für den Kreis leer, der Bogen ist sichtbar, im Knopf ebenso (`Sizes`, `InButton`)
- [ ] Kontrast gemessen: Kreis ≥ 3:1 auf `--color-surface`, `--color-bg-soft` und `--color-accent-50`, Wort ≥ 4,5:1 auf denselben Gründen (`Sizes`)
- [ ] Zeile: In `InRow` ist die Zeile mit Spinner so hoch wie die Nachbarzeilen (± 0,5 px). Die Mitte des Kreises liegt höchstens 1 px neben der Mitte der ersten Textzeile
- [ ] Fläche: In `InArea` steht der Spinner linksbündig zum Kartentext, nicht mittig. Beim Wechsel auf das Ergebnis springt der Kartenkopf nicht (Lage des Kopfs vorher = nachher)
- [ ] Rand: In `LongLabel` bricht das Wort bei 280 px um, der Kreis bleibt 14 px breit und steht auf der ersten Zeile, kein waagrechtes Scrollen
- [ ] Nicht fokussierbar: Tab durch `InRow` erreicht den Spinner nicht, und er hat keinen Hover-Stil
- [ ] `@when`/`@instead` am Spinner nennen kurze Wartezeit gegen `Skeleton` (Form bekannt), `Progress` (Anteil bekannt) und `PhaseProgress`/`AgentRunBanner` (dauert Minuten). Das `@instead` von `Skeleton` und das JSDoc von `Button.loading` verweisen auf `Spinner`
- [ ] `RunMark` und `.v3runmark` bleiben unverändert (`git diff` von `AgentRun.tsx` und den `v3runmark`-Regeln leer)
- [ ] Export in `index.ts` in der Gruppe Fläche

## Abnahme

Gemessene Abnahme (nicht schlank), 2026-11-27, durch einen fremden Prüfer,
der nicht gebaut hat. Grundlage: diese Spec und der Arbeitsbaum, nicht der
Chat. Gemessen mit Playwright gegen das laufende Storybook (Port 6107), in
einer eigenen Seite, mit `getBoundingClientRect` und `offsetWidth`.
Drehende Kreise wurden vor jeder Maßnahme bei 0 ms angehalten, sonst misst
das Rechteck den gedrehten Kreis (18,2 statt 14 px). Story-IDs kurz:
`sp--*` = `v3-primitives-fläche-spinner--*`, `btn--loading` =
`v3-primitives-aktion-button--loading`. Bilder liegen im Scratchpad der
Prüfsitzung (`abnahme0268/`) und sind flüchtig.

| Kriterium | Nachweis (Story-ID · Befehl · Messung) | Ergebnis |
|---|---|---|
| Fest: `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0 · `pnpm build -o <Scratchpad>/sb-build` Exit 0 („Storybook build completed successfully“), bewusst nicht nach `storybook-static/`, damit die Messungen der anderen Sitzungen stehen bleiben · `pnpm check:type` Exit 0 („0 older findings“) · `check:when` Exit 0 · `check:icons` Exit 0 · Selbstprüfungen `--test` von when, type, icons, language, classes und contrast grün. Nicht Spinner, nur benannt: `check:language` Exit 1 allein wegen `v3.css` Z. 832 (0263), `check:classes` Exit 1 mit den vier Altfunden (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), `check:css` Exit 1 (`dist/ludwig.css` veraltet, 0271). Keine Meldung nennt `v3spinner` oder `v2spin` | ✓ |
| Fest: Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/Spinner.tsx` (eine Komponente `Spinner`, dazu die Typen), `Spinner.stories.tsx` daneben, Titel `v3/Primitives/Fläche/Spinner`; IDs `sp--sizes`, `sp--in-row`, `sp--in-area`, `sp--in-button`, `sp--long-label` aus `/index.json` | ✓ |
| Fest: Code englisch; `@when`/`@instead` an jedem Export | Bezeichner, Kommentare und JSDoc in `Spinner.tsx` und den Stories englisch. Deutsch steht nur in sichtbaren Strings und als zitiertes UI-Wort im JSDoc („wird geprüft …“). `check:language` meldet in den Spinner-Dateien nichts. `@when`/`@instead` an `Spinner`, `check:when` grün | ✓ |
| Fest: kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\b\|[0-9]px"` über `Spinner.tsx` und `Spinner.stories.tsx`: 0 Treffer. Die 280 px in `LongLabel` sind `calc(var(--space-20) * 3 + var(--space-10))`, gemessen 280. Die Maße 14 und 20 px stehen nur in `v3.css`. Keine Label-Map, kein Status-Text; die Nachbarzeilen in `InRow` zeigen ihr Zeichen über `StateIcon` | ✓ |
| Fest: alle Stories oben vorhanden; ausgeschlossene Zustände begründet | 5 von 5 Stories, Untergrenze 3. Jede Prop hat ihre Story: `label` als String in `Sizes`, `InRow`, `InArea` und `LongLabel`, `label={null}` in `InButton`, `size` sm/lg in `Sizes` und `InArea`. Leer, leer nach Filter und Fehler sind unter „Stories“ begründet (der Spinner ist selbst der Ladezustand), ebenso reduced-motion ohne Story (gemessen, siehe unten). In `Sizes` stehen sm und lg je Grund untereinander, die drei Gründe nebeneinander | ✓ |
| Fest: Prüfliste `design-guidelines.md` §9 durchgegangen | Stufe `primitives/`, `Spinner.tsx` importiert nichts. Die Story importiert `StateIcon` aus `patterns/`, wie sechs andere Primitive-Stories. v1-Gegenstück und §11 entfallen (App). Nichts zentriert (`text-align: start`, linke Kante gemessen, siehe `InArea`). Zeilenhöhe sm 20,9 px. Farbe: Akzent für „läuft“ (info), kein Rot, das Wort ist per Typ immer dabei. Kontrast und Bewegung siehe unten. Nicht klickbar, also kein Hover und keine Trefferfläche. Kein Icon, der Kreis ist ein CSS-Rand. Schrift 13,5 und 14 px aus `--fs-ui` und `--fs-ui-md`, Gewicht 400. `min-width: 0` und `overflow-wrap: anywhere` am Wort. Texte nach T1–T5 | ✓ |
| Fest: im Browser angesehen (Storybook) | Alle fünf `sp--*`, dazu `btn--loading`, `v3-primitives-aktion-button--sizes` und im Einsatz `seiten-duo-connect-abgleich--a-01-b-awaiting-confirmation`, `seiten-duo-connect-einstellungen--c-02-c-handover-saving`, `seiten-duo-connect-abgleich--a-08-running-batch`. Jede Story zeigt Inhalt, die Konsole bleibt ohne Fehler und Warnungen, auch ohne `pageerror` | ✓ |
| `label` und `size` im Typ wie in der Tabelle; `label` Pflicht ohne Default | `Spinner.tsx`: `label: string \| null` ohne Default, `size?: SpinnerSize` (`"sm" \| "lg"`), Default `"sm"`. Typcheck von Aufrufstellen (`tsc` mit der Repo-`tsconfig`, Prüfdatei im Scratchpad): `<Spinner />` und `<Spinner size="lg" />` → TS2741 „Property 'label' is missing“, `label={undefined}` → TS2322, `size="md"` → TS2322. `label={null}` und `label="wird geprüft …" size="lg"` gehen ohne Fehler durch | ✓ |
| `size` gemessen: sm 14 × 14, Wort `--fs-ui`; lg 20 × 20, Wort `--fs-ui-md` | `sp--sizes` bei 1280, auf allen drei Gründen: sm Kreis 14 × 14 (`offsetWidth` 14, Rechteck bei 0 ms 14), Wort 13,5 px = `--fs-ui`. lg Kreis 20 × 20, Wort 14 px = `--fs-ui-md` | ✓ |
| `label` als String: Wort sichtbar rechts, Kreis `aria-hidden`, kein `role`/`aria-live`/`aria-busy` | `sp--sizes`: Kreis links 33 bis 47, Wort ab 55 (8 px Abstand). `ariaSnapshot`: je Grund nur `text: wird geprüft … Verbindung wird geprüft …`, der Kreis fehlt. `sp--in-row`: `text: … Anmeldung in DATEV wird geprüft …`. Kreis `aria-hidden="true"`. Im ganzen DOM des Spinners kommen nur die Attribute `class` und `aria-hidden` vor, und kein Vorfahr in den Stories trägt `role` oder `aria-live` | ✓ |
| `label={null}`: nur der Kreis, `aria-hidden`, ohne Text; Name des Knopfs bleibt | `sp--in-button`: in jedem der sechs Knöpfe `SPAN.v2spin[aria-hidden]` ohne Text vor `SPAN` mit dem Wort, kein `.v3spinner`. `getByRole('button', { name: 'Speichere …', exact: true })` ergibt 3 Treffer, „Stapel prüfen“ ebenfalls 3; `aria-busy="true"`, `disabled` | ✓ |
| Ersatz: `Button.inner` rendert `Spinner label={null}`; `Button/Loading` und `InButton` pixelgleich (≤ 0,5 %), auch der 12-px-Kreis in `xs` | `Button.tsx` Z. 85: `{loading ? <Spinner label={null} /> : icon}`. Vorher-Stand ohne Worktree: (a) `git show HEAD:src/ui/v3/primitives/Button.tsx` mit esbuild gebündelt, das Story-JSX von `Button/Loading` und `InButton` per `renderToStaticMarkup` mit dem HEAD-Button und dem heutigen Button gerendert. Das Markup ist zeichengleich (529 bzw. 1313 Zeichen) und gleich dem Live-DOM (`isEqualNode` nach Stil-Normalisierung). (b) Im Storybook bei 1280 × 900: „nachher“ ist die Story wie gebaut, Animationen bei 0 ms angehalten. „Vorher“ ist dieselbe Seite mit dem CSSOM auf HEAD zurückgesetzt (die fünf `.v3spinner`-Regeln gelöscht, die Reduce-Regel wieder `animation-duration: 2.4s`) und der Story-Wurzel als HEAD-Markup, ebenfalls bei 0 ms. `node scripts/png-diff.mjs before after 0.5` → Exit 0: `loading.png` 0,000 %, `inButton.png` 0,000 %. xs-Kreis 12 × 12 mit 1,5 px Rand, sm/md 14 × 14 mit 2 px, Deckkraft 0,7, Farbe = Knopftext. Gegenprobe: alle sechs Kreise um 90° gedreht ergeben 0,030 % (siehe Spec-Mangel unten) | ✓ |
| Bewegung: genau eine Animation `v2spin`, 700 ms, linear, endlos; mit reduce keine, Bogen sichtbar, auch im Knopf | `sp--sizes` und `sp--in-button` ohne Emulation: je Kreis genau 1 Animation, `v2spin`, 700, `linear`, `Infinity` (je 6 Kreise). Mit `page.emulateMedia({ reducedMotion: 'reduce' })` (Playwright, intern `Emulation.setEmulatedMedia`) ist `matchMedia('(prefers-reduced-motion: reduce)')` wahr, `document.getAnimations()` für `.v2spin` 0 in beiden Stories, auch nach Neuladen unter reduce (0 Animationen insgesamt). Kreis `animation-name: none`, `transform: none`, sichtbar 14/20 px (xs 12), drei Ränder in Farbe, der rechte transparent. Bildausschnitte je Kreis: 56–124 farbige Pixel, die Lücke rechts | ✓ |
| Kontrast: Kreis ≥ 3:1, Wort ≥ 4,5:1 auf surface, bg-soft, accent-50 | `sp--sizes`, berechnet aus den gemessenen Farben: Kreis `rgb(43, 111, 156)` (= `--color-accent-700`, Deckkraft 1 über die ganze Kette) auf surface 5,45:1, auf bg-soft 5,03:1, auf accent-50 5,04:1. Wort `rgb(92, 92, 92)` (= `--color-text-muted`) 6,69 / 6,17 / 6,19:1 | ✓ |
| Zeile: gleich hoch (± 0,5 px); Kreismitte ≤ 1 px neben der Mitte der ersten Textzeile | `sp--in-row` bei 700, 1100, 1280, 1400 und 1920: drei Zeilen je 37,92 px (Δ 0). Kreismitte 144,45 = Mitte der Zeilenbox des Worts 144,45 = Mitte der Beschriftung links 144,45. Glyphenmitte 144,24 (0,21 px) | ✓ |
| Fläche: linksbündig zum Kartentext; Kartenkopf springt beim Wechsel nicht | `sp--in-area` bei 700, 1100, 1280, 1400 und 1920: Spinner links 35 = Inhaltskante des Kartenkörpers 35 = Kartentitel „Einrichtung“ 35, `text-align: start`. Wechsel mit „Ergebnis zeigen“ und zurück: Kartenkopf oben 31, Höhe 42,07, vorher = nachher = zurück. Der Ergebnis-Satz steht ebenfalls bei 35. Der Körper darunter springt allerdings (H1) | ✓ |
| Rand: `LongLabel` bricht bei 280 px um, Kreis 14 px auf der ersten Zeile, kein waagrechtes Scrollen | `sp--long-label` bei 700, 1280 und 1920: Rahmen 280 px, Wort in 2 Zeilen, Kreis 14 × 14 (`offsetWidth` 14). Kreismitte 40 = Mitte der ersten Zeile 40. Rahmen `scrollWidth` 278 = `clientWidth` 278, das Dokument hat keinen waagrechten Scroll | ✓ |
| Nicht fokussierbar, kein Hover-Stil | `sp--in-row` hat kein bedienbares Element, achtmal Tab bleibt auf `body`. Gegenprobe: je ein Knopf vor und hinter den Spinner gesetzt, Tab von A landet auf B. `tabIndex` −1 an allen drei Spans, kein `tabindex`-Attribut. In `sp--in-area` erreicht Tab nur „Ergebnis zeigen“. Hover: Im CSSOM tragen 8 Regeln `.v3spinner` oder `.v2spin`, keine mit `:hover`. Farbe, Grund, Cursor (`auto`), Unterstreichung und Umriss sind vor und nach `hover()` gleich | ✓ |
| `@when`/`@instead` gegen Skeleton, Progress, PhaseProgress/AgentRunBanner; Skeleton und `Button.loading` verweisen auf Spinner | `Spinner.tsx`: `@when` kurze Wartezeit ohne Form (Zeile, Fläche, Knopf mit `label={null}`). `@instead`: Form bekannt → Skeleton, Anteil bekannt → Progress, Minuten → PhaseProgress oder AgentRunBanner. `Skeleton.tsx` `@instead` „… → Spinner“. `Button.tsx`, JSDoc von `loading`: „The circle is `Spinner` with `label={null}` …“. `PhaseProgress` gibt es noch nicht (0265), wie die Spec es vorsieht | ✓ |
| `RunMark` und `.v3runmark` unverändert | `git diff HEAD -- src/ui/v3/entities/agent-run/` leer. Der `v3.css`-Diff berührt keine `v3runmark`-Regel, der einzige Treffer ist der Kommentar im Reduce-Block | ✓ |
| Export in `index.ts` in der Gruppe Fläche | `src/ui/v3/index.ts` Z. 121 `export { Spinner, type SpinnerProps, type SpinnerSize } from "./primitives/Spinner";` unter `/* Fläche */` (Z. 107), direkt nach `Skeleton` | ✓ |
| Spec-Mangel: Schwelle des Bildvergleichs | Bei „≤ 0,5 %“ über das ganze Bild von 1280 × 900 macht ein ganzer 14-px-Kreis nur 0,017 % des Bildes aus. Die Gegenprobe (sechs Kreise um 90° gedreht) ergibt 0,030 %, eine Änderung nur am Kreis bliebe also unter der Schwelle. Hier ohne Folge, weil das Ergebnis 0,000 % ist. Für künftige Kriterien an kleinen Zeichen: Ausschnitt um den Baustein oder Schwelle 0 | H |

**Hinweise**, keine Mängel gegen die Kriterien:

- **H1** `v3.css`, `.v3spinner`: `inline-flex` mit Ausrichtung an der
  Grundlinie. In einem Block-Elternteil (`CardSection` in `sp--in-area`) wird
  die Zeilenbox 26,07 px hoch, der Spinner selbst nur 20,3 px. Beim Wechsel
  auf das Ergebnis schrumpft der Kartenkörper von 50,07 auf 44,92 px, und der
  Knopf darunter springt um 5,15 px. Im Browser probiert:
  `vertical-align: top` am `.v3spinner` ergibt 44,92 px, gleich dem
  Ergebnis. Das Kriterium (Kopf) ist erfüllt, die Hausregel „Layout springt
  nicht“ nicht ganz. Vor 0263 beheben.
- **H2** Die Doku zu reduced-motion ist veraltet: `Surface.stories.tsx`
  Z. 561 („Animationen bleiben: Spinner und Skelett sagen etwas, solange sie
  laufen“) und der Kommentar zum Bewegungsblock in `v3.css` (0093 b,
  „`.v2spin` … stay“) widersprechen dem neuen Stillstand.
- **H3** `src/showcase/duo-connect/drafts.tsx` behält zwei rohe
  `<span className="v2spin" … style={{ color: "var(--color-accent-700)" }} />`
  (Z. 178 `stepSign` für busy und count, Z. 561 `ReadinessRows`). Beide
  standen schon in HEAD und sind Stellvertreter für 0270, aber eine zweite
  Quelle für „Kreis in Akzent“. `stepSign` zeigt den Kreis auch für `count`,
  einen Abgleichschritt, der dauert. Das widerspricht „der Kreis heißt kurz“.
- **H4** Zwei Wörter ohne „ …“ in den Entwürfen: „wird gespeichert“
  (`drafts.tsx` Z. 381) und „Warten auf Ihre Bestätigung in Ludwig“
  (`Sync.stories.tsx` Z. 205). Laut Spec sagt das Wort mit „ …“, was läuft;
  bei reduced motion trägt es die Bedeutung allein.
- **H5** `label=""` besteht den Typ und ergibt einen Kreis ohne Wort (V7).
  Die Spec verlangt es nicht.
- **H6** Offene Frage 1 (Stillstand auch im Knopf) bleibt eine
  Owner-Entscheidung. Gebaut ist der Default, und die Abnahme ersetzt die
  Antwort nicht.
- **H7** `Sync.stories.tsx`, `BatchRowView`: Die laufende Stapelzeile zeigt
  keinen Kreis mehr, nur `r.summary`. Das passt zu offener Frage 3
  („Abgleich läuft“ ohne Kreis) und steht hier, damit es nicht als
  verlorenes Feature gilt.

Abgenommen von / am: fremder Prüfer (designsystem), 2026-11-27 · Alle 21
Kriterien ✓, Spec-Mangel und H1–H7 als Hinweise · Die Status-Zeile ist
nicht angefasst (Auftrag: nur das Protokoll eintragen).
