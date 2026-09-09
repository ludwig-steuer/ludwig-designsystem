# 0137 · `EntityHeader`: Platz für das Prozessbild

| | |
|---|---|
| Status | fertig — abgenommen 2026-09-09, am selben Tag nachgearbeitet |
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
drei gebauten Rahmen helfen auch nicht: ihr dritter Slot (seit **0138** in
beiden, die einen haben, `signal` — bis dahin `nextAction` und `banner`)
gehört der **Meldung**, und `LedgerAccountView` hat gar keinen: dort stehen
`summary` und `chart` für Saldo und Einordnung. Keiner davon ist für ein
Prozessbild gedacht.

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

Fremde Abnahme am 2026-09-09 (zweiter Agent, hat nicht gebaut). Gemessen im
eigenen Lauf mit `scripts/cdp.mjs` gegen den Dev-Server auf 6107, 1000 und
1280 px, Stories `WithProcess` und `Filled`. **Kein Mangel im Verhalten**; die
zwei ✗ sind zwei deutsche Bezeichner und ein Satz, den 0138 überholt hat.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| **Fest** | | |
| `pnpm typecheck` und `pnpm build` grün | beide am 2026-09-09 gelaufen, `exit 0` (`tsc --noEmit`; Storybook-Build nach `storybook-static`) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `patterns/EntityHeader.tsx` + `.stories.tsx`; Titel `v3/Patterns/Rahmen/EntityHeader` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `@when`/`@instead` an `EntityHeader` (`:20–24`), die neue JSDoc englisch (`:59–72`). **Aber zwei deutsche Bezeichner in der angefassten Story**: `kopf` und `mitBild` (`EntityHeader.stories.tsx:283`). Die übrige Datei ist englisch (`FACTS`, `phases`, `next`, `status`), und CLAUDE.md sagt: eine Datei, die ohnehin angefasst wird, bekommt englische Namen. `pnpm check:language` sieht das nicht — er prüft Kommentare und nimmt Story-Dateien aus | ✗ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `v3.css:2390` `.v2ehead__process { margin-top: var(--space-4); }` — ein Abstands-Token, kein px; die Komponente setzt nur die Klasse (`:100`). Gemessen: `margin-top: 16px` = `--space-4`, derselbe Wert wie `.v2ehead__summary` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `WithProcess` (`EntityHeader.stories.tsx:275`); **lädt**, **Fehler** und **leer nach Filter** mit Grund ausgeschlossen (der Kopf hat keine eigenen Datenzustände) | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | durchgegangen; die zwei App-Punkte übersprungen (backlog/README). Kein Hex, kein px, keine Versalien, kein Emoji; der Slot trägt fremdes Markup und bringt keine eigene Farbe mit | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | eigener `cdp.mjs`-Lauf des Abnehmenden, 1000 und 1280 px, beide Köpfe der Story | ✓ |
| **Schnittstelle Zeichen für Zeichen** | | |
| Eine Prop: `process`, Typ `ReactNode`, nicht Pflicht | `EntityHeader.tsx:73` `process?: ReactNode;`, in der Signatur an `:33` — Name, Typ und Pflichtigkeit wie die Tabelle | ✓ |
| Das Markup-Schnipsel der Spec gegen den Code | Spec: `{process ? <div className="v2ehead__process">{process}</div> : null}` · Code `:100`: dieselbe Zeile, zeichengleich | ✓ |
| Nur diese eine Prop kam dazu | `git show 261fb0d -- EntityHeader.tsx`: eine Zeile in der Signatur, ein JSDoc-Block, eine Zeile im Rumpf. Nichts sonst | ✓ |
| **Variabel** | | |
| Ohne `process` ist das Markup **zeichengleich** mit der Fassung davor | Story `Filled`, gerendertes DOM abgezogen: die Kinder von `.v2ehead` sind `__top`, `__summary`, `__facts` — **kein** `__process`, kein leeres `div`, kein zusätzlicher Abstand. In `WithProcess` misst derselbe Kopf mit der Prop **269 px** und ohne sie **124 px**: 145 px weniger, nicht 145 px Leerraum | ✓ |
| `process` steht zwischen Titelblock und `summary`, nicht in der Titelzeile | gemessen, Story `WithProcess`: Kinderfolge `["v2ehead__top", "v2ehead__process", "v2ehead__summary"]`; `top.compareDocumentPosition(process) === 4` (folgt) und `process.compareDocumentPosition(summary) === 4`. Der Badge sitzt im `.v2ehead__title` (`<span>Buchungsstapel August 2026</span>` + `bdg bdg-warning`), nicht im Slot | ✓ |
| Mit `process` **und** `status` zugleich keine zwei Statusanzeigen (D7) | gemessen: im `.v2ehead__process` steht **kein** Badge (`querySelector` auf `bdg`/`v2st` leer), im `.v2ehead__title` steht genau einer. Zwei Zeilen, zwei Fragen — der Verstoß wäre ein `StatusBadge` im Slot, und der ist nicht da | ✓ |
| `ProcessStepper` im Kopf bricht bei 1280 px nicht um (L1) | gemessen bei 1000 **und** 1280 px: der Stepper ist 898 px breit, `scrollWidth === clientWidth`, Höhe 129 px — kein Umbruch, kein Überlauf. **Einschränkung:** die Story deckelt den Kopf auf `maxWidth: 940`, breiter wird er in keiner der beiden Messungen; die 1280-px-Aussage ist damit auf der **schmaleren** Fassung belegt, also mit Reserve. Nicht auf 0119 vertagt, weil gemessen | ✓ |
| Der Kopf rechnet nichts | **Der Nachweis ist der Typ, nicht die Textsuche.** `process?: ReactNode` (`:73`), und keine Zeile im Rumpf liest daraus etwas aus — `:100` reicht den Knoten durch. Das Kriterium, wie es dasteht (`grep -n "phases\|ProcessPhase"`), **schlägt fehl**: es findet `:63` und `:64`, beide im Satz, der erklärt, warum der Typ **nicht** `ProcessPhase[]` ist. Ein Kriterium, das seinen eigenen Erklärsatz bestraft, treibt ihn aus dem Code; die Wortwahl gehört in die Nacharbeit, die Sache steht | ✓ |
| **Ränder der Tabelle** (Nachtrag 2026-09-08) | | |
| „`CaseDetailView` hat `nextAction`, `SourceDocumentView` hat `banner`" | beide Slots heißen seit **0138** `signal` (`CaseDetailView.tsx:44`, `SourceDocumentView.tsx:54`, Commit `6aaa3a5`, 2026-09-09 22:24). Der Satz war beim Bau (21:28) richtig und ist eine Stunde später veraltet — die Spec sagt drei Absätze weiter selbst „Signal-Slot". Nachzuziehen im Kielwasser von 0138, nicht vom Bauenden verschuldet | ✗ |
| „`EntityHeader` hat neun Slots: …" | neun Namen, und sie stimmen für den Stand **vor** dieser Aufgabe — das ist die Rolle des Ziel-Absatzes. Der Abschnitt „Gebaut" nennt die zehn. Keine Abweichung | ✓ |

Abgenommen von / am: zweiter Agent (nicht der Bauende), 2026-09-09 · Offene
Punkte: **zwei** — zwei deutsche Bezeichner in der angefassten Story
(`:283`) und ein Satz, den 0138 eine Stunde nach dem Bau überholt hat. Kein
Punkt im Verhalten; die Schnittstelle steht Zeichen für Zeichen.

## Gebaut 2026-09-09

Eine Prop, eine CSS-Zeile, eine Story. Der `EntityHeader` hat jetzt zehn Slots.

**Gemessen** (`scripts/cdp.mjs`, 1000 px, Story `WithProcess` — zwei Köpfe,
mit und ohne die Prop):

| Was | Mit `process` | Ohne |
|---|---|---|
| `.v2ehead__process` im DOM | ja | **nein** |
| steht **nach** dem Titelblock | ja (`compareDocumentPosition` = 4) | — |
| ein Badge **im** Prozess-Slot | **nein** — das wäre der D7-Verstoß | — |
| Kopfhöhe | 269 px | **124 px** |

Die letzte Zeile ist der Beweis für „leer heißt weg": ohne die Prop ist der
Kopf nicht nur ohne Bild, sondern ohne dessen Platz — 145 px weniger, nicht
145 px Leerraum.

**Was der Bau bestätigt hat:** die Prop ist `ReactNode`, und der Kopf weiß
nicht, dass ein Stepper darin steht. Damit trägt derselbe Platz auch
`ProcessMini` auf einer schmalen Seite, ohne dass der Kopf davon erfährt.

Der Nachweis dafür ist **kein** `grep` auf `ProcessPhase` — der Begriff steht
zweimal in der Datei, beide Male im Kommentar, der genau das erklärt. Das ist
derselbe Fehler wie in 0145 heute Vormittag: ein Kriterium, das den
erklärenden Satz mitbestraft, treibt ihn aus dem Code. Der Nachweis ist der
**Typ** — `process?: ReactNode`, und keine Zeile im Rumpf liest daraus etwas
aus.

## Nacharbeit zur Abnahme, 2026-09-09

Zwei Mängel.

**Deutsche Bezeichner in der Story** (`kopf`, `mitBild`) in einer Datei, deren
Rest englisch ist. `pnpm check:language` sieht das nicht: er prüft Kommentare
und nimmt Story-Dateien aus — die Regel gilt trotzdem. Umbenannt.

**Der Text nannte `nextAction` und `banner`**, die seit **0138** beide `signal`
heißen. 0138 landete eine knappe Stunde nach diesem Bau; nicht rückwirkend
verschuldet, aber jetzt falsch. Dabei ist die Beschreibung auch gleich
richtiggestellt worden: `LedgerAccountView` hat gar keinen dritten Slot — der
Irrtum, den 0138 selbst korrigiert hat.
