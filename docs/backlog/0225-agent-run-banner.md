# 0225 · AgentRunBanner und AgentRunCell: „Ludwig arbeitet"

| | |
|---|---|
| Status | fertig (Abnahme Variante B 2026-10-29: B1–B5 ✓, keine Mängel, Hinweise H7–H13) · vorher: Abnahme (Nachtrag 2026-10-29: Variante B über die Registry-Achse `agent_run_banner`, M7 entschieden) · davor: Abnahme (Nachbesserung 2026-10-27: M1–M6 behoben, M7 mit Default, Frage an llcto) · davor: in Arbeit (Abnahme 2026-10-27: M1–M7 offen) |
| Stufe | `entities/agent-run/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein, der Text nennt Ludwig und seinen Durchgang. |
| Quelle | Owner 2026-10-26 über llcto (Zuruf 2026-10-27): Lauf-Leiste in der Buchhalter-Abnahme |
| Ersetzt | nichts; heute sagt nur der gedimmte Schritt im StepRail „Ludwig bucht" (`disabledReason`) |
| Blockiert | Abnahme-Seiten (`batches/[id]/close`) und die Liste „Zu tun" der Mandanten-Übersicht |
| Spec von / am | Designer-Sitzung, 2026-10-27 |

## Ziel

Während Ludwig einen Durchgang fährt, soll die Steuerfachangestellte auf jeder
Seite der Abnahme sehen, dass er läuft, seit wann, wer ihn gestartet hat und
wann er meist fertig ist. Bisher sieht sie das nur an einem gedimmten Schritt.
Ist der Durchgang fertig, sagt dieselbe Leiste in einem Satz, was er hinterlassen
hat, und bietet genau einen nächsten Schritt an. Ist er gescheitert, steht dort
ein Satz mit Verweis. In einer Listenzeile, etwa „Zu tun" der Mandanten-Übersicht,
reicht die kurze Form ohne Knopf.

## Einordnung

- **Wiederverwenden:** `Banner` (seitenweite, bleibende Meldung): Er hat keine
  Handlung, keine Bewegung und keine laufende Uhr, und seine Töne sind Hex-Werte
  in `components.css`. `StatusCallout` ist der Kopf einer Sache und keine schmale
  Leiste. `Duration` zeigt eine feste Dauer, die nicht mitläuft. `Progress` zeigt
  einen Anteil, eine laufende Arbeit ohne Anteil ist keiner. `.v2spin` steht für
  eine kurze Handlung im Knopf; zwölf Minuten Drehen sind nicht ruhig.
- **Neu, weil:** §3 Regel 5. Der Durchgang (GLOSSARY „Agent run / Durchgang",
  `client_agent_runs`) hat bisher keine Form, und zwei Seiten brauchen eine.
- **Zuschnitt:** eine Familie, eine Datei `AgentRun.tsx` mit zwei Exporten.
  Beide teilen die laufende Uhr und die Lauf-Marke. Getrennt wären es nur
  durchgereichte Props.
- **Setzt auf:** `Button`, `TextButton` (der Verweis, rendert `Link`), `StateIcon` (Zeichen für erledigt und Fehler,
  `patterns/Review.tsx`), `formatDuration`, `formatTimeFull`.

## Schnittstelle

`AgentRunBanner` (Client-Komponente, weil die Uhr im Browser zählt):

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `state` | `"running" \| "done" \| "stopped" \| "taken_over" \| "failed"` | ja | Ton und Wort jedes Zustands aus der Registry-Achse `agent_run_banner` (Variante B, Owner 2026-10-28): läuft (info, „läuft“) · fertig (neutral, „fertig“) · abgebrochen (warning, „abgebrochen“) · übernommen (neutral, „übernommen“) · Fehler (danger, „Fehler“, nur ein Lauf, der an einem roten Gate steckt). Die Zuordnung aus den Ausläufen macht die App (`agentRunBannerState`) | `States`, `Stopped` |
| `startedAt` | `string \| Date`; nach dem Ende `string \| Date \| null` | bei `running` ja | Start des Durchgangs. Die Leiste zählt ab hier minutengenau mit; als `title` steht der volle Zeitpunkt daneben (T7) | `Running`, `Ticking` |
| `startedBy` | `string \| null` | nein | „gestartet von Anna Berger"; ohne den Namen entfällt der Teil | `Running`, `RunningMinimal` |
| `expectedMinutes` | `number \| null` | nein | „meist fertig nach etwa 12 Min"; den Wert liefert die App aus den bisherigen Läufen | `Running`, `Edge` |
| `pass` | `number \| null` | nein | Nummer des Durchgangs im Stapel, „2. Durchgang" | `Running` |
| `message` | `string` | nach dem Ende ja | der Satz, im Wortlaut der App („Ludwig ist fertig: 2 neue Rückfragen") | `Done`, `Failed` |
| `action` | `AgentRunAction \| null`, `AgentRunAction` = `{ label: string; href: string } \| { label: string; onClick: () => void }`; bei `running` nur `null` | nein | `done`: genau ein Hauptknopf rechts, Label und Ziel von der App. Jedes andere Ende (`stopped`, `taken_over`, `failed`): derselbe Weg als Verweis hinter dem Satz. Bei `running` gibt es keinen | `Done`, `Stopped`, `Failed`, `InUse` |

`AgentRunCell` (Client-Komponente):

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `startedAt` | `string \| Date` | ja | wie oben; zeigt „Ludwig arbeitet seit 6 Min" mit derselben Marke | `Cell` |

Typen aus `src/ludwig/`: `Step0View.run` (`batch-review/domain/step0-view.ts`)
trägt `state` (`running`/`done`), `startedAt` und `number` (= `pass`). Starter,
Erwartung und den Zustand „gescheitert" führt er nicht → Befund **L-369**. Bis
dahin rechnet die App sie selbst und reicht sie als einfache Werte durch.

Die Dauer kommt aus `formatDuration`, also „6 Min" ohne Punkt wie überall im Set
(Abweichung vom Zuruf „6 Min.", gewollt: ein Format). Unter einer Minute steht
„seit weniger als 1 Min".

**Kann bewusst nicht:**

- Die Leiste fragt nichts ab. Den Stand holt die App und wechselt `state`.
- Sie zeigt keinen Anteil: Ein Durchgang hat keinen bekannten Rest.
- Sie hat keine Glocke und keine Benachrichtigung, das wird zentral gelöst (Owner).
- Sie bietet keinen zweiten Knopf an.
- `AgentRunCell` kennt nur „läuft". Ein beendeter Durchgang in einer Zeile ist
  ein Status und kein Lauf.

## Verhalten

- **Marke:** Ein kurzes Stück gleitet ruhig in einer schmalen Spur hin und her
  (1,8 s je Richtung, `ease-in-out`). Leiste und Zelle zeigen dieselbe Marke.
  Bei `prefers-reduced-motion: reduce` steht sie still, mittig in der Spur,
  damit sie nicht als Anteil gelesen wird (Hausregel §2).
- **Uhr:** Sie tickt alle 15 s und rundet die Minuten ab. Der Server rendert
  seine Minute; sobald der Browser eingehängt ist, zeichnet die Dauer sich mit
  der Uhr des Browsers neu (Schlüsselwechsel an der Zahl, gemessen: Server 3 Min
  oder 2 Std zurück → sofort die richtige Minute). Ohne den Wechsel ließe React
  den unterdrückten Servertext stehen (H1).
- **Ansage:** Die Leiste als Ganzes ist keine Live-Region, sonst würde jede
  Minute angesagt. Nur der Anfang des Satzes ist eine (`role="status"`, sichtbar,
  kein zweiter Text daneben): „Ludwig arbeitet", sonst `message`. Der Knoten
  steht in allen Zuständen an derselben Stelle, so wird nur der Wechsel
  angesagt; die Minute steht außerhalb. Der **Start** wird nicht verlässlich
  angesagt: Die App rendert die Leiste erst, wenn ein Durchgang läuft, und eine
  Region, die schon mit Inhalt ins DOM kommt, lesen die meisten Screenreader
  nicht vor (H3). Wer den Lauf startet, bekommt die Rückmeldung von seiner
  Handlung; angesagt werden verlässlich fertig und gescheitert.
- **Höhe:** Sie ist in allen fünf Zuständen gleich, 42 px (Mindesthöhe über
  dem `sm`-Knopf: 30,2 + 2 × 4 + 2 × 1 = 40,2), damit beim Wechsel auf „fertig"
  nichts springt.
- **Farbe nie allein:** Läuft hat Wort und Marke. Abgebrochen und Fehler haben
  das Zeichen aus `StateIcon` (Name = Wort der Registry) und den Satz. Fertig
  und übernommen sind neutral und haben **kein** Zeichen: Das Zeichen gehört
  zur Stufe, und der leere Kreis hieße im Set „offen“. Das Wort trägt der Satz.
- **Tastatur:** Knopf und Verweis sind gewöhnliche Fokusziele. Die Leiste
  selbst ist keins.

Zustände: gefüllt = `running`. „Leer" heißt, es läuft kein Durchgang; dann
rendert die App die Leiste nicht (kein Leertext, denn eine Leiste, die „läuft
nicht" sagt, wäre Lärm auf jeder Seite). Laden entfällt, die Leiste lädt nichts.
Der Fehler ist `failed`. Einen Filter gibt es nicht.

## Stories

Titel `v3/Entitäten/Durchgang/AgentRun`.

| Story | Beweist |
|---|---|
| `Running` | alle Angaben: Dauer, Erwartung, Starter, Durchgang |
| `RunningMinimal` | nur `startedAt`, unter einer Minute |
| `Ticking` | die Uhr springt im Browser von „weniger als 1 Min" auf „1 Min" |
| `States` | alle fünf Zustände untereinander, gleiche Höhe, Ton und Wort aus der Achse |
| `Stopped` | Warnung mit Verweis, einmal „zwei Stunden still“ ohne Verweis |
| `Done` | Satz und ein Hauptknopf, einmal mit `href`, einmal mit `onClick` |
| `Failed` | roter Satz mit Verweis, einmal ohne Verweis (nur „steckt fest“) |
| `Edge` | 2 Std 5 Min, über der Erwartung, langer Name, langer Satz bei 1280 px |
| `Cell` | `AgentRunCell` in der Liste „Zu tun" einer Mandanten-Übersicht |
| `InUse` | StepRail `bar`, darunter die Leiste, Schalter über alle fünf Zustände |

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Dauer des beendeten Durchgangs („fertig nach 11 Min") | `finishedAt?` | die App will die Dauer am Ende zeigen |
| Hinweis, wenn der Lauf länger dauert als meist | Ableitung aus `expectedMinutes`, neues Wort | Owner wünscht es; das Wort entscheidet er |
| Starter, Erwartung und Scheitern aus dem Modell | Felder an `Step0View.run` | L-369 ist erledigt |

## Offene Fragen

1. **WCAG 2.2.2 (Stufe A):** Bewegung, die länger als 5 s neben anderem Inhalt
   läuft, braucht einen Weg zum Anhalten. Die minütliche Uhr ist eine
   automatische Aktualisierung derselben Art. `prefers-reduced-motion` hält die
   Marke an, zählt aber nach WCAG nicht als Mechanismus der Seite. Ohne Antwort
   gilt: Die Marke läuft, reduced-motion hält sie an, und die Lücke steht hier
   benannt. In die Guideline kommt sie erst mit Owner-Go als Ausnahme.
   **Entschieden (llcto, 2026-10-27):** Es gilt der Default, die Guideline
   bekommt keine Ausnahme. Die Abwägung liegt beim Owner unter App-P60
   („Bewegung", Backlog), dort steht der Hinweis auf 2.2.2.

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

- [ ] `running` zeigt „Ludwig arbeitet seit n Min", dazu Erwartung, Starter und Durchgang nur, wenn gesetzt (`Running`, `RunningMinimal`)
- [ ] Die Uhr zählt im Browser ohne neue Props weiter (`Ticking`)
- [ ] Unter einer Minute: „seit weniger als 1 Min", über einer Stunde: „2 Std 5 Min" (`RunningMinimal`, `Edge`)
- [ ] `title` an der Dauer trägt den vollen Startzeitpunkt (`Running`)
- [ ] ~~`done`: grünes Zeichen mit Wort~~ → ersetzt durch B1 (Owner 2026-10-28); Satz, genau ein Hauptknopf rechts (`Done`)
- [ ] `failed`: rotes Zeichen mit Wort, Satz, Verweis als Link (`Failed`)
- [ ] Gleiche Höhe in allen fünf Zuständen, gemessen (`States`)
- [ ] Marke steht bei `prefers-reduced-motion: reduce` still (`Running` mit Emulation)
- [ ] Nur der Zustandswechsel wird angesagt, nicht die Minute (`role="status"` nur am Zustandssatz; `InUse`)
- [ ] `AgentRunCell` mit derselben Marke, ohne Knopf, hält die Zeilenhöhe (`Cell`)
- [ ] Kontrast Text ≥ 4,5:1 auf allen Flächen, Marke ≥ 3:1 zur Spur, gemessen
- [ ] Bei 1280 px bricht ein langer Satz um, der Knopf bleibt rechts und ganz (`Edge`)

Variante B (Nachtrag 2026-10-29, Owner 2026-10-28 über llcto):

- [ ] B1 Ton (Klasse `v3run--<kind>`) und Wort (Name des Zeichens) jedes Zustands kommen aus `resolveStatus("agent_run_banner", state)`; keine Zuordnung von Ton oder Wort im Set (`States`)
- [ ] B2 `stopped`: Warnfläche, Zeichen „abgebrochen“, Satz, Weg als Verweis wie bei `failed` (`Stopped`)
- [ ] B3 `taken_over` und `done`: neutrale Fläche, kein Zeichen, Satz; `taken_over` mit Verweis, `done` mit Hauptknopf (`States`)
- [ ] B4 `failed` rot mit Zeichen „Fehler“, in den Stories nur für einen Lauf, der fest steckt (`Failed`)
- [ ] B5 Verweis ≥ 4,5:1 auf Warn- und neutraler Fläche, gemessen (`Stopped`, `States`)

## Abnahme

Gemessene Abnahme: CDP gegen den Dev-Server :6107 (`scripts/cdp.mjs`), Stand Commit `e1d60df`. Story-IDs ohne Präfix `v3-entitäten-durchgang-agentrun`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` hier nicht wiederholt (Messbaum), laut Auftrag vorher grün gelaufen | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/entities/agent-run/AgentRun.tsx` mit `AgentRun.stories.tsx`; Titel `v3/Entitäten/Durchgang/AgentRun`; Export über `src/ui/v3/index.ts` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` und `pnpm check:when` Exit 0, beide `--test` Exit 0; `@when`/`@instead` an `AgentRunBanner` und `AgentRunCell`, Rückverweis an `Baton`. `"mandant"` in der Story ist ein `BatonKey` aus dem Datenmodell. Siehe H4 | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | TSX ohne Hex und px, Maße in `v3.css`; `check:icons`, `check:type`, `check:contrast` Exit 0 (je `--test` Exit 0); `check:classes` Exit 1 nur mit den vier Altklassen `v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`, 0225 fügt keine hinzu. Status: M7 | ✗ (M7) |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | 9 von 9; jede Prop hat ihre Story; leer, lädt und Filter unter „Zustände" begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | durchgegangen; offen sind Höhe (M3), Zeilenhöhe (M4), Fokus-Kontrast (M5), Hover-Kontrast (M6), Kritikalität (M7), Trefferfläche des Verweises (H2) | ✗ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle 9 Stories bei 1280 px: Baustein vorhanden, kein Fehlerbild, 0 Einträge in Konsole und Log | ✓ |
| `running` zeigt „Ludwig arbeitet seit n Min", dazu Erwartung, Starter und Durchgang nur, wenn gesetzt | `--running`: „Ludwig arbeitet seit 6 Min · meist fertig nach etwa 12 Min · gestartet von … · 2. Durchgang", 3 Teile `.v3run__part`; `--running-minimal`: „Ludwig arbeitet seit weniger als 1 Min", 0 Teile | ✓ |
| Die Uhr zählt im Browser ohne neue Props weiter | `--ticking`: „seit weniger als 1 Min" → „seit 1 Min" nach 13 s (MutationObserver bei 14,1 s), ohne neue Props | ✓ |
| Unter einer Minute „seit weniger als 1 Min", über einer Stunde „2 Std 5 Min" | `--running-minimal` „seit weniger als 1 Min"; `--edge` „seit 2 Std 5 Min" | ✓ |
| `title` an der Dauer trägt den vollen Startzeitpunkt | `--running`: Span „seit 6 Min" trägt `title` „Gestartet am ‹Wochentag›, ‹T›. ‹Monat› ‹JJJJ› um ‹HH:MM›" (`formatTimeFull`, Europe/Berlin) | ✓ |
| `done`: grünes Zeichen mit Wort, Satz, genau ein Hauptknopf rechts | `--done`: Zeichen `role="img"` mit Namen „erledigt", Strich `--color-success` 4,63:1; je Leiste 1 Knopf `v2btn--primary v2btn--sm`, einmal `<a href>`, einmal `<button>` (Klick zählt hoch), 13 px vom rechten Rand (12 Polster + 1 Rand); Leiste ohne `action` ohne Knopf | ✓ |
| `failed`: rotes Zeichen mit Wort, Satz, Verweis als Link | `--failed`: Zeichen mit Namen „Fehler", Satz `--color-danger` 4,99:1, Verweis `<a href>` (`TextButton` → `Link`), zweite Leiste ohne Verweis. Ob Rot hier stimmt: M7 | ✓ |
| Gleiche Höhe in allen drei Zuständen, gemessen | `--states` bei 1100, 1280, 1400 und 1920 px: 40,0 · **40,2** · 40,0 px; `--in-use` bei 976, 1248 und 1368 px Leistenbreite im Rundlauf 40,0 → **40,2** → 40,0 → 40,0 px. Siehe M3 | ✗ (M3) |
| Marke steht bei `prefers-reduced-motion: reduce` still | `--running` mit `Emulation.setEmulatedMedia`: `animation-name: none`, `document.getAnimations()` leer, Stück 12,8 px bei `translateX(9,6 px)`, Mitte 16,0 in 32 px Spur, nach 500 ms unverändert; ohne Emulation 1 Animation `v3runmark` am `::after`, 9,3 → 16,5 px in 450 ms; `--cell` ebenso | ✓ |
| Nur der Zustandswechsel wird angesagt, nicht die Minute | genau eine Region, Span `role="status"` um den Zustandssatz (AX: `live=polite`, `atomic=true`), die Dauer liegt in keiner Live-Region; `--ticking`: beim Minutenwechsel 0 Mutationen in der Region; `--in-use`: derselbe DOM-Knoten über läuft → fertig → gescheitert → läuft, 3 Mutationen bei 3 Wechseln. Start eines Laufs: H3 | ✓ |
| `AgentRunCell` mit derselben Marke, ohne Knopf, hält die Zeilenhöhe | `--cell`: dieselbe Marke (`v3runmark`, 1,8 s, gleiche Farben), 0 Knöpfe und Links; Zeile **71,6 px**, Nachbarzeile mit `Baton` 70,2 px. Siehe M4 | ✗ (M4) |
| Kontrast Text ≥ 4,5:1 auf allen drei Flächen, Marke ≥ 3:1 zur Spur, gemessen | `--states` bei 1280 px, berechnete Farben. Läuft: Satz `--color-accent-700` 5,04, Angaben und „·" `--color-text-muted` 6,19. Fertig: Satz 4,63, Knopfschrift 11,64. Gescheitert: Satz 4,99, muted 5,51, Verweis `--color-primary` 9,59. Zeichen 4,63 und 4,99; Marke 4,69 zur Spur; Zelle 6,69 auf Weiß. Hover und Fokus: M5, M6 | ✓ |
| Bei 1280 px bricht ein langer Satz um, der Knopf bleibt rechts und ganz | `--edge` bei 1216 px Leiste (1280er Fenster) und 976 px Leiste (Seitenbreite bei 1280): Satz zweizeilig (41,8 px), Knopf 186,3 × 30,2 px, einzeilig, `nowrap`, 13 px vom rechten Rand, kein Querlauf; laufende Leiste einzeilig | ✓ |
| **M1** Prop-Tabelle ≠ Typen | In `done`/`failed` ist `startedAt?: string \| Date \| null` (über `RunFacts`), die Tabelle schreibt `string \| Date`. `action` ist `AgentRunAction \| null` (bei `running` `action?: null`), der Tabelle fehlt `\| null`, das die übrigen Zeilen ausschreiben | ✗ |
| **M2** Spec-Sätze ≠ Code | „Verhalten → Marke" nennt `--ease-standard`, CSS und Messung zeigen `animation-timing-function: ease-in-out`. „Setzt auf" nennt `Link`, der Code nimmt `TextButton`, das `Link` rendert | ✗ |
| **M3** Höhe springt um 0,2 px | `min-height: 40px` reicht nicht für den `sm`-Knopf: 30,2 (Knopf) + 2 × 4 (Polster) + 2 × 1 (Rand) = 40,2 px. Beim Wechsel auf „fertig" wächst die Leiste, alles darunter rückt nach (gemessen in `--in-use`). Unter dem Desktop-Maß, bei 700 px, bricht `running` zweizeilig um (51,8 px), `done` bleibt bei 40,2; das liegt außerhalb von L1 und steht nur hier | ✗ |
| **M4** Zelle drückt die Zeile auf | `.v3runcell` ist `inline-flex` auf der Grundlinie, und die Grundlinie liefert das erste Kind, die leere Marke, mit ihrer Unterkante. Der Text sitzt dadurch 2,3 px tiefer (Oberkante 150,3 statt 148,0), die Unterzeile misst 21,7 px statt der Zeilenhöhe 19,4, die Zeile 71,6 statt 70,2 px wie die `Baton`-Zeile daneben (V1) | ✗ |
| **M5** Fokusring auf Rot unter 3:1 | Tab auf den Verweis in `failed`: `outline: 2px solid var(--color-focus)` mit 2 px Abstand auf `--color-danger-bg` = 2,93:1 (V10 verlangt ≥ 3:1). Auf „fertig" 3,24:1, auf „läuft" 3,29:1 | ✗ |
| **M6** Knopfschrift beim Zeigen unlesbar | Hover auf den `done`-Knopf mit `href`: die Schrift wird `--color-primary` auf `--color-primary-600`, 1,27:1. Ursache im Set: `a:hover { color: var(--color-primary) }` (`tokens.css:431`, Spezifität 0,1,1) schlägt `.v2btn--primary { color }` (0,1,0). Dasselbe in `v3-primitives-aktion-button--as-link`, also bei jedem `Button variant="primary" href`. Die Behebung gehört an `.v2btn--primary:hover` und nicht in 0225, aber der Hauptweg von `done` hängt daran | ✗ |
| **M7** „gescheitert" ist fest Rot, die Registry sagt meist Warnung | `.v3run--failed` und `StateIcon state="error"` („Fehler") sind fest verdrahtet. L-369 (c) leitet `failed` aus `incomplete` und `blocked` ab. In der Registry sind `agent_run_outcome.incomplete` und `run_outcome.incomplete` `warning`, nur `run_outcome.blocked` ist `danger`. Die zweite Leiste in `--failed` gibt fast wörtlich die Beschreibung von `agent_run_outcome.incomplete` wieder („seit zwei Stunden still … zur Prüfung bei Ihnen") und steht rot mit „Fehler". Damit bekäme dieselbe Sache zwei Kritikalitäten (§3, Z2). Der Ton muss aus der Registry kommen, oder der Zustand wird geteilt; beides ist ein Entscheid (neuer Zustand oder neues Wort, also Owner) | ✗ |
| **H1** Hydration: die Serverminute bleibt stehen | Probe mit React 19.2.8 (`renderToString` mit verschobener Uhr, dann `hydrateRoot`): keine Warnung, kein Recoverable Error. Der Text des Servers bleibt aber stehen, unabhängig vom Abstand. Liegt der Server 3 Min zurück, steht „seit 3 Min" statt „seit 6 Min", bei 2 Std „seit weniger als 1 Min". `setNow(Date.now())` beim Einhängen korrigiert nicht, weil React unterdrückten Text erst anfasst, wenn sich der Wert im Browser ändert. Richtig wird es erst beim nächsten Minutenwechsel im Browser (Probe: nach 16 s, höchstens etwa 75 s). Der Satz „dürfen um eine Minute auseinanderliegen" verspricht also weniger, als der Code zulässt. Bei einer dynamischen Seite ist das gering, bei zwischengespeichertem HTML sichtbar | H |
| **H2** Trefferfläche des Verweises 16 px | „Protokoll des Durchgangs öffnen" misst 213,7 × 16 px, unter dem Hausmaß §9. WCAG 2.5.8 hält über die Inline- und die Abstandsausnahme (einziges Ziel der Leiste). Set-weit offen in `0213-text-link-hit-area.md`; `.v2ask__links .v2link { min-height: 24px }` zeigt den Weg | H |
| **H3** Der Start eines Laufs wird kaum angesagt | „Leer" heißt, die App rendert die Leiste nicht. Beim Start kommt die Region also schon mit Inhalt ins DOM, und eingefügte Live-Regionen lesen die meisten Screenreader nicht vor. Verlässlich angesagt wird nur läuft → fertig oder gescheitert. Entweder sagt die Spec das so, oder die App hält die Region bereit | H |
| **H4** `Banner` verweist nicht auf die Leiste | Die Spec prüft `Banner` als ersten Kandidaten, sein `@instead` (`primitives/Banner.tsx`) nennt `AgentRunBanner` aber nicht. Einen Rückverweis hat nur `Baton`, und der gilt für die Zelle | H |
| **H5** Trenner nur im CSS | „·" steht als `::before`. Im Accessibility-Baum ist es vorhanden, aber beim Kopieren entsteht „seit 6 Minmeist fertig nach etwa 12 Mingestartet von …2. Durchgang" | H |
| **H6** Story `Cell` mit eigener Träger-Tabelle | `HOLDER` (`key: "mandant"`, `label: "Mandant"`) steht genauso in `src/ludwig/modules/source-docs/domain/document-process.ts:49`, die Fixture hat also eine zweite Quelle | H |

Abgenommen von / am: fremde Abnahme (Prüfsitzung, nicht die bauende), gemessen, 2026-10-27 · Offene Punkte: M1–M7 (M6 mit Ursache im Set, M7 braucht einen Entscheid zur Kritikalität von „gescheitert"); Hinweise H1–H6. WCAG 2.2.2 ist kein offener Punkt der Abnahme, sondern nach dem Entscheid von llcto (2026-10-27) Sache von App-P60.

### Nachbesserung 2026-10-27

| Punkt | Behoben | Nachweis |
|---|---|---|
| M1 Prop-Tabelle ≠ Typen | `startedAt` in `done`/`failed` mit `\| null`, `action` als `AgentRunAction \| null` | Schnittstelle |
| M2 Spec-Sätze ≠ Code | Marke `ease-in-out`; „Setzt auf" nennt `TextButton` | Einordnung, Verhalten |
| M3 Höhe springt | `min-height: 42px` | `--states` 42 · 42 · 42 px, `--in-use` Rundlauf 42 → 42 → 42 → 42 |
| M4 Zelle drückt die Zeile | `.v3runcell { vertical-align: top }` | `--cell`: Unterzeile 19,4 px = Zeilenhöhe, Zeile 69,3 px. Die Nachbarzeile mit `Baton` misst 70,2, weil `Baton` (`inline-grid` auf der Grundlinie) seine Unterzeile selbst auf 21,3 px drückt — derselbe Fehler am Nachbarn, nicht an 0225; eigene kleine Aufgabe |
| M5 Fokusring auf Rot | `.v3run--failed .v2link:focus-visible { outline-color: var(--color-primary) }` | Tab auf den Verweis: 2 px `--color-primary`, 9,59:1 auf `--color-danger-bg` |
| M6 Knopfschrift beim Zeigen | set-weit: `.v2btn--primary:hover` und `.v2btn--danger:hover` sagen die Schriftfarbe noch einmal (`a:hover` in `tokens.css` schlug sie) | Hover `--done` mit `href` 9,15:1; `v3-primitives-aktion-button--as-link` ebenso 9,15:1 |
| M7 „gescheitert" fest rot | **Default bis zur Antwort:** `failed` gilt nur für das, was die Registry `danger` nennt (`run_outcome.blocked`, „Steckengeblieben"); die zweite Story in `Failed` zeigt jetzt diesen Fall. `incomplete`, `abandoned` und `taken_over` sind Warnung und **keine** Fälle für `failed`. Ob sie einen eigenen Zustand bekommen (Vorschlag `stopped`: gelb, Zeichen Warnung, Satz und Verweis wie `failed`), ist ein neuer Zustand → Frage an llcto/Owner | Story `Failed`, L-369 (c) |
| H1 Hydration | Schlüsselwechsel an der Dauer nach dem Einhängen | Probe `renderToString` + `hydrateRoot`: Server 1 Min, 3 Min, 2 Std zurück und 2 Min vor → sofort die Minute des Browsers, keine Warnung |
| H3 Start nicht angesagt | als Grenze unter „Verhalten" benannt | — |
| H4 `Banner` ohne Verweis | `@instead` an `Banner` nennt `AgentRunBanner` | `pnpm check:when` |
| H5 Trenner nur im CSS | „ · " als Text (`aria-hidden`) | Kopiert: „Ludwig arbeitet seit 6 Min · meist fertig nach etwa 12 Min · gestartet von … · 2. Durchgang" |
| H6 eigene Träger-Tabelle | Story `Cell` nimmt `HOLDER` aus `source-docs/domain/document-process.ts` | — |
| H2 Trefferfläche des Verweises | bleibt offen, set-weit in 0213 | — |

`pnpm typecheck`, `check:contrast`, `check:when`, `check:language` grün; `check:classes` nur mit den vier Altklassen.

### Nachtrag 2026-10-29: Variante B

Owner-Entscheid 2026-10-28 über llcto: Die Leiste bekommt fünf Zustände, und
Ton und Wort kommen aus einer eigenen Registry-Achse. Die Achse
`agent_run_banner` hat ll-abnahme in der App gebaut (`d0d0023d4`, E14). Sie
kommt mit dem Spiegellauf vom 2026-10-29 ins Set (App `4fc2a63d`,
`docs/spiegel-vormerkungen.md`). Damit ist **M7 entschieden**: „abgebrochen“
(`incomplete`, `abandoned`) ist eine Warnung und kein Fehler.

| Punkt | Umsetzung | Nachweis |
|---|---|---|
| Zustände | `state` um `stopped` und `taken_over` erweitert. Die lokale Zuordnung auf `agent_run_outcome`/`run_outcome` ist gestrichen; `resolveStatus("agent_run_banner", state)` gilt für alle fünf, auch für `running` | `AgentRun.tsx` |
| Ton | eine Klasse je Stufe (`v3run--info`, `--neutral`, `--warning`, `--danger`), nicht je Zustand; `info` ist die Grundfläche | `--states`, 1280 px: info · neutral · warning · neutral · danger, alle 42 px |
| Zeichen | Stufe → `StateIcon`: warning → Warnung, danger → Fehler, info → Hinweis, success → erledigt. **Neutral ohne Zeichen**: Der leere Kreis heißt im Set „offen“ (`STATE_SIGNS`) und hätte einem beendeten Lauf widersprochen. Der Satz trägt das Wort | Zeichen-Namen gemessen: „fertig“ (entfällt), „abgebrochen“, „übernommen“ (entfällt), „Fehler“ |
| Kontrast | Satz `--color-text` 12,71:1 auf `bg-soft`, `--color-warning` 4,78:1 auf `warning-bg`; Verweis `--color-primary` 10,08:1 auf `warning-bg`, 10,75:1 auf `bg-soft` | `pnpm check:contrast` |
| Wertemenge | `AGENT_RUN_BANNER_STATES` liegt in `close-run-banner.ts`. Die Datei importiert einen Typ aus `accounting-cases/server` und fällt deshalb aus dem Spiegel. Bis dahin steht im Set eine lokale Vereinigung `EndedState` mit `ponytail:`-Vermerk → Befund **L-375** | `docs/befunde-app.md` |

Die Leiste zeigt `done` damit nicht mehr grün: „fertig“ heißt, dass Ludwig
durch ist. Erledigt ist der Stapel damit nicht, und die Kanzlei ist dran.

### Abnahme Variante B (2026-10-29)

Gemessene Abnahme: CDP über `scripts/cdp.mjs` (chrome-headless-shell 1247, ein Browser für alles) gegen den Dev-Server :6107, uncommitteter Stand auf `88946e0`, Spiegel App `4fc2a63d`. Story-IDs ohne Präfix `v3-entitäten-durchgang-agentrun`. Die Kontraste sind aus den berechneten Farben nach der WCAG-Formel selbst nachgerechnet und nicht aus den Kommentaren übernommen.

| Kriterium | Nachweis (Story-ID · Befehl · Messung) | Ergebnis |
|---|---|---|
| B1 Ton und Wort aus `resolveStatus("agent_run_banner", state)`, keine Zuordnung im Set | `AgentRun.tsx`: Klasse `v3run--${status.kind}`, Zeichen `StateIcon title={status.label}`. Weder Komponente noch CSS ordnen einem Zustand Ton oder Wort zu (`.v3run--<kind>` je Stufe); `SIGN` ordnet nur der Stufe die Form des Zeichens zu. `--states` bei 1280 px: Klassen `info · neutral · warning · neutral · danger` = Registry für `running · done · stopped · taken_over · failed`; Zeichen (`role="img"`, `aria-label`) — · — · „abgebrochen“ · — · „Fehler“ = Registry-Labels. Story-Schalter in `--in-use`: H9 | ✓ |
| B2 `stopped`: Warnfläche, Zeichen „abgebrochen“, Satz, Verweis wie bei `failed` | `--stopped` bei 1280 px: beide Leisten `v3run--warning`, Fläche `rgb(245, 238, 224)` = `--color-warning-bg`. Zeichen `TriangleAlert` mit Namen „abgebrochen“, Strich `--color-warning` 4,78:1, Satz `--color-warning` 600 4,78:1. Erste Leiste: Verweis `<a href="#log">` (`TextButton` → `.v2link`) hinter dem Satz, dieselbe Form wie bei `failed`. Zweite Leiste („zwei Stunden still“) ohne Verweis. Kein Knopf | ✓ |
| B3 `taken_over` und `done`: neutral, kein Zeichen, Satz; `taken_over` mit Verweis, `done` mit Hauptknopf | `--states`, `--done`, `--in-use`: `v3run--neutral`, Fläche `--color-bg-soft`, 0 Zeichen, Satz `--color-text` 12,71:1. `taken_over` in `--states` mit Verweis `<a href="#log">`, in `--in-use` ohne. `done`: je Leiste genau ein `v2btn--primary v2btn--sm`, 13 px vom rechten Rand, einmal `<a href>`, einmal `<button>`; die Leiste ohne `action` hat keinen Knopf | ✓ |
| B4 `failed` rot mit Zeichen „Fehler“, in den Stories nur ein Lauf, der fest steckt | `--failed`: beide `v3run--danger`, Zeichen „Fehler“ 4,99:1, Satz `--color-danger` 4,99:1, Verweis `<a href="#accounts">`, zweite Leiste ohne Verweis. Jeder `failed`-Satz in `States`, `Failed` und `InUse` beginnt mit „Ludwig steckt fest“; „abgebrochen“ und „still“ stehen nur bei `stopped`. Wortwahl „Gate“: H8 | ✓ |
| B5 Verweis ≥ 4,5:1 auf Warn- und neutraler Fläche | `--stopped`, `--states`: `--color-primary` `rgb(26, 58, 92)` auf `rgb(245, 238, 224)` 10,08:1, auf `rgb(244, 246, 248)` 10,75:1 (auf `danger-bg` 9,59:1). Beim Zeigen kommt ein Unterstrich dazu, die Farbe bleibt. Fokus per Tab: Ring 2 px `--color-primary`, 10,08 · 10,75 · 9,59:1 | ✓ |
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` nach Auftrag nicht gelaufen, siehe H13 | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | unverändert `AgentRun.tsx` mit `AgentRun.stories.tsx`, Titel `v3/Entitäten/Durchgang/AgentRun`. Zum Wort „Durchgang“: H7 | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` und `check:when` Exit 0, beide `--test` Exit 0. Neue Kommentare und JSDoc englisch, deutsche Wörter nur zitiert | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | TSX ohne Hex und px. Ton und Wort aus der Achse (B1), damit ist M7 erledigt. `check:contrast` Exit 0 (80 Angaben, darunter die neuen 4,78 · 12,71 · 10,08 · 10,75, alle oben nachgerechnet), `check:type` und `check:icons` Exit 0, alle `--test` Exit 0. `check:classes` Exit 1 mit genau `v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`. Die lokale Vereinigung `EndedState` statt `AgentRunBannerState` ist benannt (`ponytail:`-Vermerk, L-375, Nachtrag) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | 10 von 10, neu `Stopped`. Die Prop `state` belegen `States` und `Stopped`, die Prop `action` belegen `Done`, `Stopped`, `Failed` und `InUse`. Leer, lädt und Filter bleiben unter „Zustände“ begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Farbe nur als Stufe, Rot nur bei `failed`; jeder farbige Zustand hat Wort und Zeichen oder Marke; Kontrast und Fokus gemessen, der Knopf in `done` hat seinen Ring auf `bg-soft` mit 3,28:1; Verweis und Knopf antworten auf Zeigen (Unterstrich bzw. Fläche, Schrift 9,15:1); Zeichen Lucide 15 px, Strich 1,5; Schrift über `check:type`. Wie bisher offen: Trefferfläche des Verweises 16 px (H2, jetzt in drei Zuständen). Wörter: H7, H8 | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle 10 Stories bei 1280 px: Baustein vorhanden, kein Fehlerbild, kein Querlauf, 0 Einträge in Konsole und Log, auch in `--in-use` über alle Wechsel. Ebenfalls ohne Eintrag (Spiegel-Folgen): `seiten-geschäftspartner-detail--typical`, `v3-entitäten-geschäftspartner-businesspartnerfacts--filled`, `…-businesspartnerdrawer--filled`, `v3-entitäten-buchungssatz-journalentryreviewlist--grouped` | ✓ |
| `done`: Satz, genau ein Hauptknopf rechts | siehe B3 | ✓ |
| `failed`: rotes Zeichen mit Wort, Satz, Verweis als Link | siehe B4 | ✓ |
| Gleiche Höhe in allen fünf Zuständen, gemessen | `--states` bei 1280 und 1920 px: fünfmal 42,0 px. `--in-use`, Rundlauf läuft → fertig → abgebrochen → übernommen → Fehler → läuft bei 1280 und 1920 px: durchweg 42,0 px, die Karte darunter bleibt bei 214,97 px. Bei 700 px: H10 | ✓ |
| Kontrast Text ≥ 4,5:1 auf allen Flächen, Marke ≥ 3:1 zur Spur | Satz: läuft 5,04 · fertig und übernommen 12,71 · abgebrochen 4,78 · Fehler 4,99. Grundfarbe des Absatzes `--color-text-muted` 6,19 · 6,17 · 5,79 · 5,51. Zeichen 4,78 und 4,99. Verweis siehe B5. Die Marke ist unverändert | ✓ |
| Nur der Zustandswechsel wird angesagt, nicht die Minute | `--in-use` bei 700, 1280 und 1920 px: eine Live-Region im Dokument, über alle sechs Wechsel derselbe DOM-Knoten, eine Mutation je Wechsel; Inhalt ist der Satz bzw. „Ludwig arbeitet“ | ✓ |
| Marke steht bei `prefers-reduced-motion: reduce` still | `--running` und `--cell` mit `Emulation.setEmulatedMedia`: 0 Animationen, `animation-name: none`, Stück bei `translateX(9,6 px)` | ✓ |
| Bei 1280 px bricht ein langer Satz um, der Knopf bleibt rechts und ganz | `--edge`: Satz 41,8 px (zwei Zeilen zu 20,9), Knopf 186,3 × 30,2 px, `nowrap`, 13 px vom rechten Rand; `scrollWidth` 1280 = `clientWidth` | ✓ |
| Begründung in `docs/spiegel-vormerkungen.md` (2026-10-29) passt zum Diff | `sync-ludwig.sh` nimmt genau die vier Dateien aus `core/accounting/`. Importiert werden sie von `accounting-cases/domain/overview-vm.ts` (`reversal-note`), `review-score.ts` (`pruefpunkte`, `clarification-handling`) und `invoices/domain/vat-by-rate.ts`. Daran hängen sechs Bausteine: `SourceDocumentAside`, `ReviewReasonCell`, `JournalEntryReviewList`, `CaseFacts`, `CaseTimeline` und `CaseAmount`. In `mirror-barrels.mjs` gibt ein `@/…`-Pfad außerhalb von `@/ludwig/` jetzt `false`, vorher fiel er auf `return true` („external packages“). `close-run-banner.ts` fehlt im Spiegel, wie L-375 sagt. `agent_run_outcome` kommt im Set nicht mehr vor. Die Partner-Fixtures tragen `region` und `countrySource`. Nicht genannt ist H12 | ✓ |
| **H7** „Durchgang“ ist im gespiegelten GLOSSARY nicht mehr das Wort für den Lauf | Seit dem Spiegel vom 2026-10-29 heißt der Eintrag „Agent run / Lauf“ (Anzeige `L-<n>`). „Durchgang“ steht dort als früheres Wort für den Agent-Schritt. Die Spec (Einordnung: „GLOSSARY ‚Agent run / Durchgang‘“), das JSDoc in `AgentRun.tsx`, die Storybook-Gruppe `Durchgang` und die sichtbaren Texte „2. Durchgang“, „Protokoll des Durchgangs öffnen“ und „Ludwigs Durchgang ist beendet“ verweisen auf einen Eintrag, den es so nicht mehr gibt. Die App sagt selbst noch „Durchgang“ (Registry `export_batch_state`, `batch-review/domain/gating.ts`, `step0-view.ts`). Welches Wort gilt, entscheidet der Owner. Es liegt außerhalb von Variante B | H |
| **H8** „Gate“ in einem Satz für die Kanzlei | In `--failed` sagt die zweite Leiste: „Das Gate Bank ist rot, ein Auszug fehlt.“ Das GLOSSARY übersetzt `gate` mit „Prüfschritt“ (T3). Dasselbe Wort steht in der Registry-Beschreibung `agent_run_banner.failed` („an einem roten Gate“), die im (i) sichtbar wird. Das ist ein Kandidat für einen Befund an die App | H |
| **H9** Story-Schalter mit eigenen Wörtern | `InUse` schreibt die fünf Registry-Wörter von Hand in die Optionen des `Segmented` („läuft“, „fertig“, „abgebrochen“, „übernommen“, „Fehler“). Heute stimmen sie überein, sind aber eine zweite Quelle im Set (B1, wie H6). `axisLegend("agent_run_banner")` liefert Schlüssel und Wort | H |
| **H10** Unter 1280 px bricht die Leiste um | Bei 700 px (Leiste 668 px) stehen `running` und `taken_over` mit Verweis auf zwei Zeilen (51,84 px), die übrigen messen 42,0. In `--in-use` rückt die Karte beim Wechsel von läuft auf fertig um 9,84 px. Das liegt außerhalb von L1 (Desktop ab 1280 px) und war schon unter M3 vermerkt | H |
| **H11** Kommentare hinter dem Code | Das JSDoc von `AgentRunAction` sagt „a reference when it failed“, gilt aber jetzt für jedes Ende außer `done`. Der Kopf des `.v3run`-Blocks nennt noch `--color-success` auf `success-bg`, nicht die neuen Paare; die stehen einzeln darunter. `.v3run--success` und `.v3run--success .v3run__lead` greifen mit dieser Achse nie, weil sie kein `success` kennt. Sie bleiben nur als Rückfall für `SIGN` | H |
| **H12** `ReviewReasonCell.tsx` ist im Diff, steht aber in keiner Liste | Der Schlüssel der Zeilen wechselt von `r.code` auf `` `${r.kind}:${r.checkCode ?? ""}` ``. Laut Kommentar ist das eine Folge des gespiegelten `review-score.ts`, wo `code` bei Grundlast und Präzedenz `null` ist. Weder der Auftrag noch die Spiegel-Vormerkung nennen die Änderung. Beim Stagen bewusst zuordnen und in der Vormerkung unter „Folgen im Set“ nennen | H |
| **H13** `pnpm build` nicht gelaufen | Nach Auftrag nicht gelaufen, weil der Dev-Server läuft. Vor dem Commit nachholen | H |

Abgenommen von / am: fremde Abnahme (Prüfsitzung, nicht die bauende), gemessen, 2026-10-29 · Mängel: keine · Hinweise H7–H13. H2 (Trefferfläche des Verweises) bleibt set-weit in `0213-text-link-hit-area.md`.

**Nach der Abnahme (bauende Sitzung, 2026-10-29):**

- H8: Der Story-Satz sagt jetzt „Prüfschritt“. Die Registry-Beschreibung geht als **L-376** an die App.
- H9: Die Wörter des `InUse`-Schalters kommen jetzt aus `resolveStatus("agent_run_banner", …)`.
- H11: Das JSDoc von `AgentRunAction` und der CSS-Kopf sind nachgezogen. `.v3run--success` bleibt mit Begründung im Kopf stehen.
- H12: Die Änderung ist in `docs/spiegel-vormerkungen.md` unter „Folgen im Set“ eingetragen.
- H13: `storybook build` lief in ein eigenes Verzeichnis, Exit 0. `pnpm build` ist derselbe Befehl. `storybook-static/` bleibt unberührt.
- H7 („Durchgang“ oder „Lauf“) ist eine Frage an llcto bzw. den Owner. H10 liegt außerhalb von L1.

