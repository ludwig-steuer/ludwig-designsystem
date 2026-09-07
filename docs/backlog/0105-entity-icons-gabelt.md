# 0105 · `entity-icons.ts` ist die nächste Gabelung

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/entity-icons.ts` |
| Quelle | Abnahme 0080 (2026-09-05), Befund 1 — gefunden **in dem Commit, der die erste Gabelung beendet hat** |
| Auftrag | Die App führt dieselbe Datei mit denselben 62 Schlüsseln: `apps/web/src/ui/status/entity-icons.ts`. Für die 54 alten Achsen ist sie wortgleich; auseinander gingen zuletzt `beleg_erledigung` und die sieben neuen — vier Labels und acht Quelltexte. Beides ist am 2026-09-05 angeglichen worden, aber die Struktur bleibt: **zwei Dateien, ein Inhalt, keine Vorrangregel.** |
| Warum das jetzt zählt | 0080 hat die Status-Registry gespiegelt, weil zwei Kopien auseinanderlaufen. `entity-icons.ts` ist derselbe Fall, eine Ebene weiter — und die Abnahme von 0080 hat genau daran einen echten Fehler gefunden: sieben `AXIS_SOURCE`-Texte waren plausibel formuliert statt abgeschrieben, einer schickte den Leser an die falsche Stelle. Solange es zwei Dateien gibt, passiert das wieder. |
| Zu entscheiden | (a) `entity-icons.ts` mitspiegeln wie die Registry — dann muss sie drüben importfrei werden (heute importiert sie `lucide-react` für `ENTITY_ICON`, und seit 0087 kommt das Zeichen hier aus der Icon-Registry). (b) Nur `AXIS_LABEL` und `AXIS_SOURCE` spiegeln und die Icons hier lassen — dann teilt sich die Datei in zwei. (c) Es bei zwei Dateien belassen und einen Deckungsgleichheits-Test bauen, der beide vergleicht. |
| Sofort umsetzbar, unabhängig vom Entscheid | Ein Wächter wie `scripts/check-icons.mjs`: er liest beide Dateien und meldet jeden Schlüssel, dessen Label oder Quelle auseinandergeht. Dreißig Zeilen, und der Fehler aus der 0080-Abnahme wäre nicht durchgekommen. |
| Angelegt von / am | Claude, 2026-09-05 (aus der Abnahme von 0080) |

## Erledigt (2026-09-06) — nicht durch eine bessere Kopie, sondern durch keine

Der Anlass war Rolle A: `ludwig/app` 700dbcb8 brachte sechs Achsen
(`kontoauszug_erwartung`, `opos_ausgleich`, `opos_zeilenart`,
`datev_verknuepfung`, `plausibilitaet`, `belegnummer_quelle`), und der
Typecheck hier wurde rot — an genau der Stelle, die diese Aufgabe beschreibt.

Die App hat im selben Zug den sauberen Schnitt gemacht: `AXIS_LABEL` und
`AXIS_SOURCE` liegen jetzt in `status-registry.ts` (reine Daten), ihre eigene
`ui/status/entity-icons.ts` re-exportiert sie nur noch. Damit **spiegeln sie
sich mit** — und dieses Repo re-exportiert sie ebenso, statt sie zu führen.

Von 177 Zeilen bleiben 42. Was hier bleibt, ist das, was der App fehlt:
`AXIS_ENTITY` — welche Achse welche Entität meint. *(Bis zur Wiederabnahme
2026-09-07 stand hier „bleiben 48" und „`AXIS_ENTITY` … und `ENTITY_LABEL`";
beides beschrieb einen Stand, den die Nacharbeit selbst überholt hatte —
`ENTITY_LABEL` ist mit M1 gefallen, die Datei ist seither 42 Zeilen lang, M5.)*

Damit fällt auch der Grund weg, aus dem diese Aufgabe entstand: dass **jede
neue Achse der App das Set rot macht**. Sie tut es nicht mehr — eine Achse ist
ab jetzt eine Zeile in der App und ein `pnpm sync:ludwig` hier.

## Abnahmekriterien

- [ ] `entity-icons.ts` führt keine eigene `AXIS_LABEL`/`AXIS_SOURCE` mehr (`grep`)
- [ ] Beide kommen aus `@/ludwig/ui/status/status-registry`
- [ ] Die Achsen-Namen stehen unverändert im Tooltip (`StatusBadge --all-axes`, gemessen)
- [ ] `pnpm typecheck`, `pnpm build` und `pnpm check:icons` grün
- [ ] Eine neue Achse der App macht das Set nicht mehr rot — belegt an den sechs von 700dbcb8

## Abnahme (2026-09-07)

Fremde Abnahme, erste Runde. Gemessen am gerenderten Baum über CDP
(Storybook-Dev-Server 6107), nicht an der Quelle; jede Messung mit Gegenprobe.
`pnpm build` **nicht** gelaufen (Aufgabe 0117, mehrere Prüfer im selben Baum) —
ersetzt durch `typecheck`, `check:icons`, `check:mirror`, `check:contrast`,
`check:when`, `check:language`, alle über den Exit-Code.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `entity-icons.ts` führt keine eigene `AXIS_LABEL`/`AXIS_SOURCE` mehr | Datei 48 Zeilen (vorher 177). `grep` findet beide Namen nur in Zeile 41 als `export { … } from`; keine Objektliteral-Zuweisung | ✓ |
| Beide kommen aus `@/ludwig/ui/status/status-registry` | `entity-icons.ts:41`. Der Spiegel ist **zeichengleich** mit der App: `diff src/ludwig/ui/status/status-registry.ts apps/web/src/ui/status/status-registry.ts` → 0 Zeilen | ✓ |
| Die Achsen-Namen stehen unverändert im Tooltip | `…statusbadge--all-axes` gemessen: **72 Achsen-Blöcke, 326 Plaketten**. Für jede Plakette ist der Teil des `title` vor dem ersten `:` gleich dem `AXIS_LABEL`-Wert des Spiegels — **0 Abweichungen bei 326**. Auch die Blocküberschrift stimmt 72/72. **Gegenprobe:** ein `title` zur Laufzeit auf „KAPUTT: xx" gesetzt → dieselbe Messung meldet 1 Abweichung. Die sechs Achsen aus `700dbcb8` tragen echte Namen (Kontoauszug, Ausgleich, Zeilenart, Verknüpfung, Ergebnis, Quelle), keinen Rückfall | ✓ |
| `pnpm typecheck` / `check:icons` grün (`build` ersetzt) | `typecheck` 0 · `check:icons` 0 · `check:mirror` 0 (8 Fälle) · `check:contrast` 0 · `check:when` 0 (Konstanten sind ausgenommen, also verlangt er hier zu Recht kein `@when`) · `check:language` 0 (er prüft nur geänderte Dateien — siehe M3) | ✓ |
| Eine neue Achse der App macht das Set nicht mehr rot | **Gemessen, nicht behauptet.** In einer isolierten Kopie des Baums (Scratchpad, Repo unberührt) eine Achse `probe_neue_achse` genau so eingesetzt, wie die App sie brächte: Union + `AXIS_LABEL` + `AXIS_SOURCE` + `STATUS_REGISTRY`. `tsc --noEmit` → **Exit 0, 0 Fehler**. **Gegenprobe:** dieselbe Probe mit der `entity-icons.ts` von vor dem Umbau (`994fda2^`) → **Exit 2, 2 Fehler** („missing … beleg_charakter, beleg_haenger, ereignis_art, kontoauszug_erwartung, and 7 more"). Die Gabelung war der Fehler, und sie ist weg | ✓ |

Prüfliste `design-guidelines.md` §9 (ohne die zwei App-Punkte „ersetzt ihr
v1-Gegenstück" und „in §11 auf v2 gesetzt"): Stufe `patterns/`, Importe nur auf
die Icon-Registry und den Spiegel, kein Fachmodul · kein Hex, kein px in der
Datei · Zeichen und Wort: alle 16 Plaketten der Story `CoreAxes` tragen das Wort
im Zugänglichkeitsbaum, **0 von 16** SVGs ohne `aria-hidden="true"`, **0**
Bild-Knoten im AX-Baum, dazu 16 `description`-Knoten mit Achse + Zustand +
Erklärsatz · Icons **12 × 12 px, `stroke-width: 1.5px`**, kürzester Pfad
`getTotalLength() = 10` (also kein leerer Pfad) · Farbe über `currentColor`:
Farbe der Plakette zur Laufzeit auf `rgb(1,2,3)` gesetzt → `color` **und**
`stroke` des SVG ziehen mit · Kontrast in allen fünf Tönen ≥ **4.63 : 1**
(Text ≥ 4.5, Icon ≥ 3) · genau **3 von 72** Achsen tragen ein Zeichen
(Receipt / Layers / BookOpen), wie in der App.

**Story-Deckung.** Die Datei hat keine Prop und rendert nichts; nach
`spec-schreiben` §6 fällt daraus **keine eigene Story** — die fünf Zustände
(gefüllt · leer · leer nach Filter · lädt · Fehler) gelten für eine Konstanten-
Map nicht. Ihre Wirkung zeigen zwei bestehende Stories, beide zur Laufzeit aus
den Daten gerechnet statt abgeschrieben: `…statusbadge--all-axes` (72/72 Achsen
der heutigen Registry) und `…icons--entities` (22 Zeichen; „69 Achsen haben
bewusst keins" = 72 − 3, gerendert gemessen). Die Zahlen sind also **nicht**
veraltet. Was fehlt, ist der Satz in der Spec, der das festhält (M4).

### Mängel

**M1 — `src/ui/v3/patterns/entity-icons.ts:44`: `ENTITY_LABEL` ist die letzte
Kopie, und ihre Begründung stimmt nicht.** Die Spec (Zeile 27) behält sie mit
„Was hier bleibt, ist das, was der App fehlt: `AXIS_ENTITY` … und
`ENTITY_LABEL`". Der App fehlt sie nicht: `apps/web/src/ui/status/entity-icons.ts:31–35`
trägt dieselbe Map, **3 von 3 Schlüsseln zeichengleich**. Und hier benutzt sie
niemand: `grep -rn "ENTITY_LABEL"` über den ganzen Baum liefert **einen**
Treffer — die Definition selbst; der Barrel `src/ui/v3/index.ts` führt sie
nicht (0 Treffer), sie ist für die App also gar nicht erreichbar. Damit steht
genau die Struktur, die diese Aufgabe benennt („zwei Dateien, ein Inhalt, keine
Vorrangregel"), unverändert weiter — nur von 62 Schlüsseln auf 3 geschrumpft.
Kleinster Weg: die drei Zeilen löschen und `EntityType` aus dem Typ-Import
nehmen. **Gemessen:** in einer Kopie genau so entfernt → `tsc --noEmit`
Exit 0, 0 Fehler. Dazu den Halbsatz in der Spec richtigstellen.

**M2 — der Wächter aus der Zeile „Sofort umsetzbar, unabhängig vom Entscheid"
fehlt, und für sechs Schlüssel wäre er noch zu haben.** `ls scripts/` zeigt 8
Dateien, keine vergleicht die beiden `entity-icons.ts`. Für `AXIS_LABEL`/
`AXIS_SOURCE` ist er gegenstandslos geworden — dort kann nichts mehr
auseinanderlaufen. Nicht gegenstandslos ist er für den Rest: `AXIS_ENTITY`
(3 Schlüssel) hat drüben seinen Zwilling `ENTITY_ICON` (dieselben 3 Achsen,
nur mit dem Lucide-Zeichen statt dem `EntityKey`), und `ENTITY_LABEL` ist der
zweite Fall. Nach M1 bleiben **3 Schlüssel** ungesichert. Kleinster Weg: mit M1
zusammen entscheiden — entweder dreißig Zeilen Wächter für die drei Achsen,
oder in der Spec ein Satz, warum drei Schlüssel keinen Wächter rechtfertigen.

**M3 — deutsche JSDoc in der Datei, die diese Aufgabe neu geschrieben hat.**
`node scripts/check-language.mjs --all` nennt `entity-icons.ts` mit **19
Zeilen** (4, 5, 6, 9, 10, 13, 14, 15, 16, 21, 31–34, 36–39, 43). Neun davon
(31–39) sind in `994fda2` **neu geschrieben** worden. CLAUDE.md: „eine Datei,
die ohnehin angefasst wird, bekommt englische Namen". Der Wächter greift hier
nicht (er prüft nur, was `git` als geändert meldet, und er kam einen Tag nach
dem Commit); der Bestand ist mit 404 Zeilen in 132 Dateien ein Repo-Thema, aber
diese Datei ist die, die diese Aufgabe angefasst hat. Kleinster Weg: die 19
Zeilen übersetzen.

**M4 — die Spec hat keinen festen Kriterienblock und keine Stories-Sektion.**
`TEMPLATE.md` verlangt „jede Sektion gefüllt oder mit einem Satz gestrichen".
0105 hat weder Ziel/Einordnung/Schnittstelle/Verhalten/Stories/Ausbau noch die
sieben festen Häkchen; die Datei ist als Befund-Notiz aus der 0080-Abnahme
entstanden. Der variable Block ist prüfbar und wurde geprüft, es fehlt also
nichts Messbares — aber der Satz, warum keine Story abfällt und welche
Zustände nicht gelten, steht nirgends. Kleinster Weg: eine Sektion „Stories:
keine — Konstanten-Map ohne Prop; die Wirkung zeigen `…all-axes` und
`…icons--entities`" plus der feste Block.

### Nebenbefund (nicht 0105)

`src/ui/v3/patterns/StateMachine.stories.tsx:101` schreibt „der Normalfall bei
fast allen **70** Achsen" — gemessen sind es **72**. Der Satz steht im JSDoc
und erscheint damit als Story-Beschreibung in den Docs. Gehört zu 0069; hier
nur notiert, weil es dieselbe Sorte still alternder Zahl ist, die 0055 schon
einmal aus `Icons.stories.tsx` entfernt hat.

**Urteil: zurück.** Die fünf Kriterien der Spec halten alle, jedes gemessen und
gegengeprobt — der Umbau selbst ist richtig und der Nachweis für „eine neue
Achse macht das Set nicht mehr rot" ist hart. Zurück geht sie wegen M1: die
Aufgabe heißt „die Gabelung beenden", und sie lässt eine Kopie stehen, die mit
einem Satz begründet wird, der nachweislich nicht stimmt. Der Weg dorthin sind
fünf gelöschte Zeilen und ein berichtigter Halbsatz; M2–M4 gehören in denselben
Zug.

Abgenommen von / am: Claude (fremde Abnahme), 2026-09-07 · Offene Punkte:
M1 (Blocker), M2, M3, M4.

## Nach der Abnahme (2026-09-07)

**M1 (blockierend) — `ENTITY_LABEL` ist weg.** Die Spec behielt sie mit „das,
was der App fehlt". Der App fehlt sie nicht: `ui/status/entity-icons.ts:31–35`
führt dieselben drei Einträge, zeichengleich. Und hier las sie niemand — ein
einziger Treffer im ganzen Baum, die Definition selbst. Genau die Struktur,
die diese Aufgabe beenden soll, stand weiter da, nur von 62 Schlüsseln auf
drei geschrumpft. Eine geschrumpfte Kopie ist immer noch eine Kopie.

**M3 — die Datei ist Englisch.** Neunzehn deutsche JSDoc-Zeilen standen in
der Datei, die diese Aufgabe neu geschrieben hat, neun davon frisch. CLAUDE.md
sagt: eine Datei, die ohnehin angefasst wird, wird englisch — sie wurde gerade
angefasst.

**M2 und M4 bleiben offen, mit Grund.** Der versprochene Wächter (beide Seiten
vergleichen) ist für `AXIS_LABEL`/`AXIS_SOURCE` gegenstandslos geworden — sie
kommen aus dem Spiegel, und `pnpm check:mirror` sichert den Weg dorthin. Für
`AXIS_ENTITY` gegen die App-Registry (drei Schlüssel) wäre er noch sinnvoll;
er hängt aber daran, dass `ui/status/entity-icons.ts` gespiegelt wird, und das
tut sie nicht. Und der fehlende feste Kriterienblock ist sachlich leer: null
Props heißen null eigene Stories.

**Nebenbefund, nicht 0105:** `StateMachine.stories.tsx` schrieb „fast allen 70
Achsen", gemessen sind es 72 — die Zahl stand in einer Story-Beschreibung.
Berichtigt.

## Wiederabnahme 2026-09-07 (fremde Abnahme)

Zweite Runde, anderer Prüfer als der Bauende. Gemessen am gerenderten Baum
über CDP gegen den **Dev-Server 6107**, nicht gegen `storybook-static`; jede
Behauptung mit Gegenprobe. Diese Runde prüft **auch den Bau** — als Prüfer
dieser Welle in einem eigenen `git worktree` auf HEAD `f1913b6`, damit der
Ausgabeordner des Arbeitsbaums unberührt bleibt (0117).

Während der Messung hat eine **fremde Sitzung** den Spiegel gezogen
(`src/ludwig/ui/status/status-registry.ts` und `StateMachine.stories.tsx`
geändert, Baum vorübergehend rot). Alle Befehls-Ergebnisse unten sind deshalb
am sauberen HEAD im Worktree gemessen, nicht im laufenden Arbeitsbaum; die
Browser-Messungen laufen gegen den Dev-Server, wie beauftragt.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `entity-icons.ts` führt keine eigene `AXIS_LABEL`/`AXIS_SOURCE` mehr | Datei **42 Zeilen** (177 vor dem Umbau, 48 nach Runde 1). `grep` über `src/` findet beide Namen in der Datei nur in Zeile 42 als `export { … } from` — keine Objektliteral-Zuweisung | ✓ |
| Beide kommen aus `@/ludwig/ui/status/status-registry` | `entity-icons.ts:42`. Und die Werte stimmen mit der App: `AXIS_LABEL` **72/72 Schlüssel, 0 Abweichungen**, `AXIS_SOURCE` **72/72, 0 Abweichungen**, `StatusAxis` **72/72** — Schlüssel für Schlüssel gegen `apps/web/src/ui/status/status-registry.ts` verglichen, nicht nur die Zeilenzahl | ✓ |
| Die Achsen-Namen stehen unverändert im Tooltip | `…statusbadge--all-axes` gemessen: **72 Achsen-Blöcke, 326 Plaketten**. Für jede Plakette ist der Teil des `title` vor dem ersten `:` ein Wert aus `AXIS_LABEL` des Spiegels — **0 Abweichungen bei 326**. Die 72 Blocküberschriften tragen alle den `AXIS_LABEL`-Text (`beleg — Beleg`), **0 von 72** ohne. **Gegenprobe:** ein `title` zur Laufzeit auf „KAPUTT: xx" gesetzt (eigener `Runtime.evaluate`, getrennt von der Messung) → dieselbe Messung meldet **1** Abweichung | ✓ |
| `pnpm typecheck`, **`pnpm build`** und `pnpm check:icons` grün | Am HEAD im Worktree je über den Exit-Code: `typecheck` **0** · `check:icons` **0** · `check:contrast` **0** · `check:mirror` **0** · `check:when` **0** · `check:language` **0**. **`pnpm build` = 0** — erstmals seit zehn Abnahmen wirklich gelaufen, im eigenen Worktree, 613 Zeilen Log, „Storybook build completed successfully"; **0 Treffer für `ENOENT`**, beide `staticDirs` kopiert. Der Ausgabeordner des Arbeitsbaums blieb bei 12:47 stehen, der des Worktrees trägt 13:56 — nichts geteilt. Einzelheiten in 0117 | ✓ |
| Eine neue Achse der App macht das Set nicht mehr rot | **Neu gemessen, nicht aus Runde 1 übernommen.** Isolierte Kopie des HEAD-Standes (Scratchpad, Repo unberührt); Basis `tsc --noEmit` → **Exit 0**. Dann eine Achse `probe_neue_achse` genau so eingesetzt, wie die App sie brächte: `StatusAxis`-Union + `AXIS_LABEL` + `AXIS_SOURCE` + `STATUS_REGISTRY` → **Exit 0**. **Gegenprobe:** dieselbe Probe mit der `entity-icons.ts` von vor dem Umbau (`994fda2^`, 177 Zeilen) → **Exit 2, 2 Fehler**, beide in ihren eigenen Map-Literalen („missing … `beleg_charakter`, `beleg_haenger`, `ereignis_art`, `kontoauszug_erwartung`, and 7 more"). Die Gabelung war der Fehler, und sie ist weg | ✓ |

### Mängel der vorigen Runde — steht der behauptete Fix wirklich da?

| Punkt aus Runde 1 | Gemessen | Ergebnis |
|---|---|---|
| **M1 (Blocker)** — `ENTITY_LABEL` ist die letzte Kopie | `grep -rn "ENTITY_LABEL"` über `src/` liefert **einen** Treffer, und der ist eine JSDoc-Zeile, die den Wegfall festhält — **keine Deklaration mehr**. Die Datei schrumpft von 48 auf 42 Zeilen, `EntityType` ist aus dem Typ-Import raus, `typecheck` 0 | ✓ (bis auf M5) |
| **M3** — neunzehn deutsche JSDoc-Zeilen | `node scripts/check-language.mjs --all` am HEAD: **0 Treffer** für `entity-icons.ts` (vorher 19 Zeilen). **Gegenprobe, weil „nicht gemeldet" nicht „geprüft" heißt:** in einer Kopie eine deutsche Kommentarzeile eingesetzt → derselbe Wächter meldet sie sofort (`entity-icons.ts:20`). Er deckt die Datei also wirklich ab | ✓ |
| **M2** — Wächter für `AXIS_ENTITY` | Bewusst offen gelassen, mit Grund im Abschnitt „Nach der Abnahme". Der Grund trägt: `AXIS_LABEL`/`AXIS_SOURCE` können nicht mehr auseinanderlaufen, und `ui/status/entity-icons.ts` lässt sich nicht spiegeln (sie importiert Lucide). Der Rest ist heute deckungsgleich, gemessen: `AXIS_ENTITY` = `{beleg, sachverhalt, buchung}`, App-`ENTITY_ICON` = dieselben drei Achsen, und die Zeichen dahinter stimmen überein (`Icons.tsx`: `source-document`→`Receipt`, `accounting-case`→`Layers`, `journal-entry`→`BookOpen`; App: `Receipt`, `Layers`, `BookOpen`) | ✓ offen mit Grund |
| **M4** — kein fester Kriterienblock, keine Stories-Sektion | Weiter keine Sektion, aber der fehlende **Satz** steht jetzt in der Datei („null Props heißen null eigene Stories"). Damit ist das Prüfbare da; die Form der Spec bleibt eine Altlast dieser Befund-Notiz | ✓ offen mit Grund |
| **Nebenbefund** — „fast allen 70 Achsen" in `StateMachine.stories.tsx` | Am HEAD steht dort **72** | ✓ |

### Story-Deckung

Die Datei hat **keine Prop** und rendert nichts; nach `spec-schreiben` §6 fällt
daraus **keine eigene Story** — die fünf Zustände (gefüllt · leer · leer nach
Filter · lädt · Fehler) und der Summand „im Einsatz" gelten für eine
Konstanten-Map nicht. Ihre Wirkung zeigen zwei bestehende Stories, beide zur
Laufzeit aus den Daten gerechnet statt abgeschrieben, beide nachgemessen:

- `…statusbadge--all-axes` — **72 Blöcke** für 72 Achsen des Spiegels,
  326 Plaketten.
- `…icons--entities` — **22 SVG** im DOM neben dem Text „22 Dinge, je ein
  Zeichen", und „**69** Achsen haben bewusst keins" = 72 − 3, aus
  `Object.keys(AXIS_LABEL).length - Object.keys(AXIS_ENTITY).length`
  gerechnet. Beide Zahlen sind also nicht veraltet und können es nicht werden.

### Prüfliste `design-guidelines.md` §9

Ohne die zwei App-Punkte („ersetzt ihr v1-Gegenstück", „in §11 auf v2 gesetzt").
Stufe `patterns/`, Importe nur auf die Icon-Registry und den Spiegel, kein
Fachmodul · kein Hex, kein px in der Datei · **Zeichen und Wort**: alle 16
Plaketten mit Zeichen in `--all-axes` tragen das Wort, **0 von 16** ohne;
**0 von 16** SVG ohne `aria-hidden="true"` · **Maß und Strich**: alle 16
Zeichen **12 × 12 px** bei `stroke-width: 1.5px` — auf der produktiven Leiter
(12/14/16), kürzester Pfad `getTotalLength() = 10`, also kein leerer Pfad, der
`0,0,0,0` vortäuscht · **Ton nur aus der Registry**: die 16 verteilen sich auf
`neutral` 6 · `info` 3 · `success` 4 · `warning` 2 · `danger` 1 = 16, und die
Glyphe bringt keinen eigenen Ton mit — `stroke` des SVG **gleich** `color` der
Plakette in **16 von 16**, `fill: none`. **Gegenprobe:** Plakettenfarbe zur
Laufzeit auf `rgb(1,2,3)` gesetzt → `color` **und** `stroke` des SVG ziehen mit
· **Icon-Knopf**: das (i) trägt `aria-label` **und** `title`, beide
„Buchung: Zustände erklären", sein SVG ist `aria-hidden="true"` · genau
**3 von 72** Achsen-Blöcken tragen ein Zeichen (`beleg`, `sachverhalt`,
`buchung`), wie in der App · keine Emoji, keine Versalien in der Datei.

### Mängel

**M5 — die Spec beschreibt in Zeile 26–27 einen Stand, den es nicht mehr gibt.
Nicht blockierend.** Dort steht „Von 177 Zeilen bleiben **48**. Was hier
bleibt, ist das, was der App fehlt: `AXIS_ENTITY` … und `ENTITY_LABEL`."
Gemessen sind es **42** Zeilen, und `ENTITY_LABEL` ist genau das, was Runde 1
als Blocker herausgenommen hat. Der kleinste Weg von M1 hatte zwei Teile — die
Zeilen löschen **und** den Halbsatz richtigstellen; der zweite ist liegen
geblieben. Entschärft ist es dadurch, dass der Abschnitt „Erledigt
(2026-09-06)" heißt und der spätere Abschnitt den Stand korrekt nachträgt: als
Datumsstand ist der Satz nicht falsch, als Beschreibung von heute schon.
Kleinster Weg: „48" → „42", und den Halbsatz auf `AXIS_ENTITY` kürzen.

Kein weiterer Mangel. Kein blockierender Mangel.

### Befunde am Set (nicht 0105)

**B1 — das (i) hat eine Trefferfläche von 12 × 12, das Hausmaß ist 24 × 24.**
`…statusbadge--with-info-dialog` gemessen: der `<button>` des
`StatusInfoButton` misst **12,00 × 12,00 px** (`getBoundingClientRect`), sein
SVG ebenfalls 12 × 12 — die Quelle setzt `padding: 0` und kein
`min-width`/`min-height`. 0113 hat **24 × 24** als Hausmaß gesetzt, und 0099
war gestern an genau dieser Größe blockiert (Commit `dd0491c`: „seine
Trefferfläche … maß 22 × 22 … jetzt steht das Hausmaß aus 0113 als
`min-width`/`min-height`"). Beschriftung und `title` sind korrekt, es ist
allein die Fläche. `StatusBadge` rendert das (i) per Default an **jedem**
Chip. Gehört nicht zu 0105 — die Datei wurde hier nicht angefasst —, aber es
ist derselbe Fehler, der einen Tag zuvor eine andere Aufgabe blockiert hat.

**B2 — §9 kennt die Regel nicht, an der B1 hängt.** Die Prüfliste, die jede
Abnahme durchgeht, führt Kontrast, Leiter, Strich und Fokusring, aber keine
Zeile zur Trefferfläche; `grep` über `docs/design-guidelines.md` findet
„24 × 24" nirgends. Das Hausmaß steht nur in 0113 und 0099. Solange es nicht
in §9 steht, findet es nur, wer die beiden Aufgaben kennt.

**B3 — der Spiegel ist bei `STATE_MACHINES` von der App abgewandert.**
`diff` gegen `apps/web/src/ui/status/status-registry.ts`: **339 Zeilen**,
alle Hunks in Zeile 34–36 (ein Blockkommentar) und 2364–2448
(`StateTransition`, `STATE_MACHINES` — die App hat `label` eingeführt und die
Maschinen umbenannt, F150/F151). **`AXIS_LABEL`, `AXIS_SOURCE` und
`StatusAxis` sind davon nicht berührt** (72/72 zeichengleich, siehe Kriterium
2), 0105 ist also nicht betroffen. Während dieser Abnahme hat eine fremde
Sitzung angefangen, genau das zu ziehen. Hier nur notiert, damit niemand mein
grünes `typecheck` als Aussage über diesen Bereich liest.

**B4 — kein Fehler, nur damit es nicht als einer gemeldet wird:**
`…icons--sizes` rendert zwei SVG **neben** der Leiter (13 × 13 und 15 × 15).
Das ist Absicht — der Abschnitt „Was der Code heute tut" zählt die Größen zur
Laufzeit aus der Quelle aus und markiert beide mit „daneben".

**Urteil: abgenommen.** Alle fünf Kriterien halten, jedes gemessen und
gegengeprobt — darunter erstmals der Bau selbst, der in Runde 1 noch ersetzt
werden musste. Der Blocker M1 ist in der Sache erledigt: die Kopie ist weg,
nicht kleiner geworden. M3 ist erledigt und der Wächter, der es meldet, ist
gegengeprobt. M2 und M4 bleiben offen, aber mit einem Grund, der trägt und der
in der Datei steht. Was bleibt, ist ein Halbsatz und eine Zahl in der
Beschreibung eines vergangenen Standes (M5) — das hält eine Aufgabe nicht auf.

Abgenommen von / am: Claude (fremde Abnahme, Bau-Prüfer dieser Welle),
2026-09-07 · Offene Punkte: M5 (nicht blockierend), M2 und M4 (offen mit
Grund) · Befunde für andere Aufgaben: B1, B2, B3.

## Nach der Wiederabnahme (2026-09-07): M5

Urteil war **abgenommen**, und der Bau dieser Welle lief hier: `pnpm build`
Exit 0 im eigenen Worktree, kein ENOENT, beide `staticDirs` kopiert. Der
Arbeitsbaum blieb unberührt.

**M5 — die Spec beschreibt jetzt den Stand, den sie hat.** Sie sagte „von 177
Zeilen bleiben **48**" und „was der App fehlt: `AXIS_ENTITY` … und
`ENTITY_LABEL`". Beides war von der eigenen Nacharbeit überholt:
`ENTITY_LABEL` ist mit M1 gefallen, und die Datei ist seither **42** Zeilen
lang (nachgezählt). Der kleinste Weg von M1 hatte zwei Teile; der zweite lag
liegen.

**Status: fertig.**
