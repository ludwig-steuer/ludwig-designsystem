# 0268 · Laufanzeige für kurze Wartezeiten (`Spinner`)

| | |
|---|---|
| Status | spec |
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
