# 0225 · AgentRunBanner und AgentRunCell: „Ludwig arbeitet"

| | |
|---|---|
| Status | Abnahme |
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
- **Setzt auf:** `Button`, `Link`, `StateIcon` (Zeichen für erledigt und Fehler,
  `patterns/Review.tsx`), `formatDuration`, `formatTimeFull`.

## Schnittstelle

`AgentRunBanner` (Client-Komponente, weil die Uhr im Browser zählt):

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `state` | `"running" \| "done" \| "failed"` | ja | läuft (blau, Hinweis-Stufe wie `run_outcome.running`) · erledigt (grün) · gescheitert (rot) | `States` |
| `startedAt` | `string \| Date` | bei `running` ja | Start des Durchgangs. Die Leiste zählt ab hier minutengenau mit; als `title` steht der volle Zeitpunkt daneben (T7) | `Running`, `Ticking` |
| `startedBy` | `string \| null` | nein | „gestartet von Anna Berger"; ohne den Namen entfällt der Teil | `Running`, `RunningMinimal` |
| `expectedMinutes` | `number \| null` | nein | „meist fertig nach etwa 12 Min"; den Wert liefert die App aus den bisherigen Läufen | `Running`, `Edge` |
| `pass` | `number \| null` | nein | Nummer des Durchgangs im Stapel, „2. Durchgang" | `Running` |
| `message` | `string` | bei `done`/`failed` ja | der Satz, im Wortlaut der App („Ludwig ist fertig: 2 neue Rückfragen") | `Done`, `Failed` |
| `action` | `{ label: string; href: string } \| { label: string; onClick: () => void }` | nein | `done`: genau ein Hauptknopf rechts, Label und Ziel von der App. `failed`: derselbe Weg als Verweis hinter dem Satz. Bei `running` gibt es keinen | `Done`, `Failed`, `InUse` |

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
  (1,8 s je Richtung, `--ease-standard`). Leiste und Zelle zeigen dieselbe Marke.
  Bei `prefers-reduced-motion: reduce` steht sie still, mittig in der Spur,
  damit sie nicht als Anteil gelesen wird (Hausregel §2).
- **Uhr:** Sie tickt alle 15 s und rundet die Minuten ab. Server und Browser
  dürfen um eine Minute auseinanderliegen (`suppressHydrationWarning` an der Zahl).
- **Ansage:** Die Leiste als Ganzes ist keine Live-Region, sonst würde jede
  Minute angesagt. Nur der Anfang des Satzes ist eine (`role="status"`, sichtbar,
  kein zweiter Text daneben): „Ludwig arbeitet", sonst `message`. Der Knoten
  steht in allen Zuständen an derselben Stelle, so wird nur der Wechsel
  angesagt; die Minute steht außerhalb.
- **Höhe:** Sie ist in allen drei Zuständen gleich (Mindesthöhe für den
  `sm`-Knopf), damit beim Wechsel auf „fertig" nichts springt.
- **Farbe nie allein:** Läuft hat Wort und Marke, erledigt und gescheitert haben
  das Zeichen aus `StateIcon` und den Satz.
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
| `States` | `running` · `done` · `failed` untereinander, gleiche Höhe |
| `Done` | Satz und ein Hauptknopf, einmal mit `href`, einmal mit `onClick` |
| `Failed` | roter Satz mit Verweis, einmal ohne Verweis |
| `Edge` | 2 Std 5 Min, über der Erwartung, langer Name, langer Satz bei 1280 px |
| `Cell` | `AgentRunCell` in der Liste „Zu tun" einer Mandanten-Übersicht |
| `InUse` | StepRail `bar`, darunter die Leiste, Rundlauf `running` → `done` → `failed` |

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
- [ ] `done`: grünes Zeichen mit Wort, Satz, genau ein Hauptknopf rechts (`Done`)
- [ ] `failed`: rotes Zeichen mit Wort, Satz, Verweis als Link (`Failed`)
- [ ] Gleiche Höhe in allen drei Zuständen, gemessen (`States`)
- [ ] Marke steht bei `prefers-reduced-motion: reduce` still (`Running` mit Emulation)
- [ ] Nur der Zustandswechsel wird angesagt, nicht die Minute (`role="status"` nur am Zustandssatz; `InUse`)
- [ ] `AgentRunCell` mit derselben Marke, ohne Knopf, hält die Zeilenhöhe (`Cell`)
- [ ] Kontrast Text ≥ 4,5:1 auf allen drei Flächen, Marke ≥ 3:1 zur Spur, gemessen
- [ ] Bei 1280 px bricht ein langer Satz um, der Knopf bleibt rechts und ganz (`Edge`)

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: … · Offene Punkte: …
