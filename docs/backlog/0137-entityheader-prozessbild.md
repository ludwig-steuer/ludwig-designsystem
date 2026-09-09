# 0137 · `EntityHeader`: Platz für das Prozessbild

| | |
|---|---|
| Status | spec — geschrieben 2026-09-09 |
| Stufe | `patterns/` (`EntityHeader`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: ein Vorgang mit Phasen, dessen Kopf zeigt, wo er steht |
| Quelle | `docs/detailseiten-standard.md` D6 · Designsprache Z7 |
| Ersetzt | die Notlösung, das Prozessbild in den Signal-Slot zu setzen |
| Blockiert | jede Detailseite einer Entität mit Kette: Beleg, Sachverhalt, Stapel, Onboarding |
| Spec von / am | Claude, 2026-09-09 |

## Ziel

Z7 verlangt für **jede mehrstufige Kette** dieselbe Familie, und
`ProcessStepper` trägt dafür ausdrücklich die Zusage `@when Process state in
the detail header with raw states and loops` — den **Kopf der Detailseite**.
Genau dort gibt es für ihn keinen Platz.

`EntityHeader` hat neun Slots: `icon`, `overline`, `title`, `status`, `meta`,
`metric`, `summary`, `facts`, `actions`. `meta` verlangt Inline-Elemente (die
Karte trennt die Kinder mit einem Punkt), `summary` ist „one line, only when
there is text". Ein Stepper ist ein Block und passt in keinen von beiden. Die
drei gebauten Rahmen helfen auch nicht: `CaseDetailView` hat `nextAction`,
`SourceDocumentView` hat `banner`, `LedgerAccountView` hat `summary`/`chart` —
keiner davon ist für ein Prozessbild gedacht.

Solange das so ist, sagt der Standard: das Prozessbild steht im Signal-Slot.
Das ist eine Notlösung — der Slot gehört der **Meldung**, und ein Prozessbild
neben einem `StatusCallout` beantwortet zwei Fragen an einer Stelle.

## Einordnung

- **Wiederverwenden:** `EntityHeader` (0048) und `ProcessStepper` stehen beide;
  es fehlt die Fuge zwischen ihnen.
- **Erweitert, weil:** `spec-schreiben` §3.2 — die Platzierung des Prozessbilds
  ist eine Designentscheidung, die auf jeder Ketten-Entität wiederkommt.
- **Setzt auf:** `EntityHeader`, `Process` (`ProcessMini`/`ProcessStepper`).

## Entscheidung 1 — eine Prop am Kopf, kein Slot im Rahmen

Der Auftrag ließ beides offen. Es wird die **Prop am `EntityHeader`**, aus
einem Grund, der den zweiten überwiegt:

Das Prozessbild gehört dem **Datensatz**, nicht der Seite. Es beantwortet „wo
steht *dieser* Vorgang", genau wie `status` und `metric` — und `status` steht
aus demselben Grund im Kopf und nicht im Rahmen. Ein Slot im Rahmen hieße
außerdem, ihn **dreimal** zu bauen: `CaseDetailView`, `SourceDocumentView`,
`LedgerAccountView` sind heute drei Rahmen (ob sie einer werden, entscheidet
**0138** — und diese Spec darf darauf nicht warten, weil sie nichts davon
braucht). Ein Kopf, drei Rahmen: die Prop ist die Stelle, die es einmal gibt.

Der Einwand aus dem Auftrag — „der Kopf hat damit zehn Slots" — wiegt weniger,
als er klingt. §4 setzt die Grenze bei „mehr als ~10 Props", und der Kopf
bleibt genau darunter. Vor allem aber sind es keine zehn *Entscheidungen*: es
sind zehn optionale Plätze in **einem** Bild, die einander nicht bedingen.
Trennen würde hier Durchreich-Props erzeugen, nicht entkoppeln — der Fall, für
den §4 „zusammenlassen" sagt.

## Entscheidung 2 — Badge und Stepper stehen nicht nebeneinander

D6 erlaubt beide, und D7 verbietet zwei Anzeigen derselben Frage. Beides
gleichzeitig geht nur, wenn sie **verschiedene** Fragen beantworten, und das
tun sie nur bei genügend Abstand:

| | `status` | `process` |
|---|---|---|
| Frage | „In welchem Zustand ist er?" | „Wo in der Kette steht er?" |
| Ort | **in der Titelzeile**, direkt hinter dem Namen | **eigene Zeile darunter**, über `summary` |
| Form | ein Wort mit Farbe (`StatusBadge`) | eine Folge von Phasen (`ProcessStepper`) |

Der Abstand macht die Regel: solange der Badge in der Titelzeile steht und das
Prozessbild eine eigene Zeile bekommt, liest niemand sie als zwei
Statusanzeigen — sie stehen nicht nebeneinander, sondern untereinander, und
die zweite ist erkennbar breiter und mehrteilig. **Ein `StatusBadge` im
`process`-Slot wäre der Verstoß gegen D7**, nicht die Kombination selbst.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `process` | `ReactNode` | nein | Das Prozessbild der Kette — eine eigene Zeile zwischen Titelblock und `summary`. Ohne die Prop ist das Markup unverändert, samt Abstand | `WithProcess` |

Der Typ ist `ReactNode`, nicht `ProcessPhase[]`: `patterns/` kennt keine
Entität, und welche Phasen eine Kette hat, weiß nur der Aufrufer. Der Kopf
rechnet nichts und weiß nicht, dass dort ein Stepper steht — er hält eine
Zeile frei. Damit funktioniert derselbe Platz auch für `ProcessMini` auf einer
schmalen Seite.

**Kann bewusst nicht:**

- **Die Phasen kennen.** Kein `phases`-Prop, keine Ableitung. Der Aufrufer
  reicht das fertige Bild.
- **Das Prozessbild aus `status` ableiten.** Die Achse sagt den Zustand, nicht
  die Kette; die Zuordnung gehört der Entität.
- **Zwei Prozessbilder.** Eine Kette je Datensatz. Wer zwei hat, hat zwei
  Datensätze.

## Verhalten

Zwischen `.v2ehead__top` und `.v2ehead__summary`, als eigene Zeile:

```
{process ? <div className="v2ehead__process">{process}</div> : null}
```

Die Regel des Kopfs gilt unverändert (0048): **leer heißt weg** — ohne
`process` gibt es das Element nicht, und damit auch seinen Abstand nicht. Das
ist derselbe Umgang wie bei `metric`, `summary` und `facts`, und es ist der
Grund, warum der Kopf mit zehn Slots nicht auseinanderfällt.

Der Abstand kommt aus `--space-*`, kein px. Auf schmalen Breiten läuft das
Prozessbild über — das ist die Sache des Bildes, nicht des Kopfs
(`ProcessStepper` bringt sein eigenes Verhalten mit; L1 wird bei 1280 px
gemessen).

## Stories

Nach §6: ein Layout-Slot → eine Story. Die bestehenden `EntityHeader`-Stories
decken die Fälle ohne Prozessbild.

| Story | Beweist |
|---|---|
| `WithProcess` | Derselbe Kopf zweimal: einmal mit `ProcessStepper` in `process` **und** `status` in der Titelzeile — die zwei Fragen, sichtbar getrennt (D7) —, einmal ohne die Prop, damit der fehlende Abstand danebensteht |

Ausgelassen mit Grund: **lädt** und **Fehler** — der Kopf hat keine eigenen
Datenzustände, er zeigt, was er bekommt (schon bei 0048 so begründet). **Leer
nach Filter** gibt es für einen Kopf nicht.

## Ausbau

Wenn **0138** entscheidet, dass es einen Detailrahmen gibt, wandert nichts:
der Rahmen reicht `process` an den Kopf durch wie `status` heute. Umgekehrt
gilt: sollte sich zeigen, dass das Prozessbild auf breiten Seiten neben die
Kennzahl gehört statt darunter, wäre das eine Änderung am CSS des Kopfs, keine
an der Schnittstelle — die Prop bleibt dieselbe.

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

- [ ] Ohne `process` ist das Markup **zeichengleich** mit der Fassung davor —
      kein Element, kein Abstand, keine leere Zeile (`git diff` am gerenderten
      DOM der Story `Filled`)
- [ ] `process` steht zwischen Titelblock und `summary`, nicht in der
      Titelzeile (Story `WithProcess`, Reihenfolge im DOM)
- [ ] Mit `process` **und** `status` zugleich liest sich das nicht als zwei
      Statusanzeigen: der Badge in der Titelzeile, das Bild eine Zeile
      darunter (Story `WithProcess`, D7)
- [ ] `ProcessStepper` im Kopf bricht bei 1280 px nicht um (L1, gemessen —
      vertagt auf 0119, wenn die Welle dort sammelt)
- [ ] Der Kopf rechnet nichts: `grep -n "phases\|ProcessPhase" EntityHeader.tsx`
      findet nichts

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |
