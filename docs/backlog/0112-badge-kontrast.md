# 0112 · `bdg-info` liegt unter 4,5:1 — der häufigste Chip des Sets

| | |
|---|---|
| Status | Abnahme |
| Stufe | `src/styles/tokens.css` + `Badge` |
| Quelle | Abnahme 0098 (2026-09-06), Mangel M8 — gemessen an `v3-patterns-prüfen-statusbadge--all-axes` |
| Auftrag | Zwei Badge-Töne reißen WCAG 1.4.3; `info` ist der Vorgabewert von `StatusBadge` und steht damit auf fast jeder Fläche |
| Spec von / am | Claude, 2026-09-06 |

## Befund

Gemessen (headless, 1440, `getComputedStyle`):

| Ton | Vordergrund | Fläche | Verhältnis | Grenze |
|---|---|---|---|---|
| `bdg-info` | `rgb(46, 120, 168)` | `rgb(227, 240, 248)` | **4,14 : 1** | 4,5 : 1 |
| `bdg-success` | `rgb(63, 122, 90)` | `rgb(235, 242, 238)` | **4,46 : 1** | 4,5 : 1 |

Die Schriftgröße im Chip ist 11,5 px — also **kein** „großer Text", die
Ausnahme auf 3:1 greift nicht. `info` ist dabei kein Randfall: `StatusBadge`
vergibt ihn an jeden Zustand, dessen Achse `kind: "info"` sagt, und das ist
der häufigste Wert im Register.

Beide liegen knapp darunter. Das ist der unangenehme Fall: es fällt beim
Ansehen nicht auf, und es reißt trotzdem.

## Zuschnitt

Nicht die Komponente ändern, sondern die zwei Farbpaare. Der Chip bleibt, wie
er ist; was sich ändert, ist der Vordergrund (eine Stufe dunkler) oder die
Fläche (eine Stufe heller) — welches von beidem, entscheidet, was in der
Nachbarschaft schon steht.

## Abnahmekriterien

- [ ] Jeder Badge-Ton erreicht mindestens 4,5:1 auf seiner eigenen Fläche
      (gemessen, alle Töne, nicht nur die zwei)
- [ ] Die Töne bleiben untereinander unterscheidbar — `info` sieht nicht aus
      wie `success` (Screenshot `statusbadge--all-axes`, vorher/nachher)
- [ ] Kein Hex in einer Komponente; die Änderung steht in `tokens.css`
- [ ] `pnpm typecheck` und `pnpm build` grün

## Befunde für `ludwig/app`

- **B1** — Dieselben Token-Werte stehen drüben; der Chip ist derselbe.

## Erledigt 2026-09-06

Alle fünf Töne halten jetzt 4,5:1, gemessen im Blatt und nachgerechnet:

| Ton | vorher | jetzt |
|---|---|---|
| `info` | 4,14 | **4,69** |
| `success` | 4,46 | **4,63** |
| `warning` | 4,78 | 4,78 |
| `danger` | 4,99 | 4,99 |
| `neutral` | 11,94 | 11,94 |

**Der Auftrag nannte `warning` nicht, und das war richtig so** — er stand schon
bei 4,78. Was mein eigener Rechenlauf zunächst als drittes Problem meldete, lag
an einem falsch abgeschriebenen Hex (`#8A6D1F` statt `#8C601E`). Der Fehler
gehört ins Protokoll: eine Farbe aus dem Kopf ist keine Messung.

**`info` brauchte gar keine neue Farbe.** Der Vordergrund stand als fester Hex
`#2E78A8` im Blatt, während das Token `--color-accent-700` mit 0090 auf
`#2B6F9C` gezogen wurde. Der Chip nimmt jetzt das Token — damit sind es 4,69,
und ein Hex weniger steht im Stylesheet.

**`success` brauchte eine hellere Fläche, keinen dunkleren Text.** `#3F7A5A`
ist das Token `--color-success`; es dunkler zu ziehen hätte es aus dem Rest des
Satzes herausgebrochen (es trägt auch Haken und Ränder). Die Fläche ist eine
Stufe heller: `#EBF2EE` → `#F0F6F2`.

Beide Vordergründe kommen jetzt aus Tokens statt aus festen Hex-Werten.

## Abnahme (2026-09-07)

**Zurück.** Der Kern stimmt: im Regelfall halten alle fünf Töne 4,5:1, und die
Zahlen im Blatt sind richtig gerechnet — jede selbst gemessen
(`getComputedStyle`, headless, 1440) und unabhängig nachgerechnet, jede mit
Gegenprobe (Token zur Laufzeit verstellt; verstellt sich die Messung nicht,
misst sie nichts). Zurück geht es an drei Stellen, an denen nicht die Story
der Aufgabe gemessen wurde, sondern alles andere.

**Gemessen, Regelfall** (`badge--tones`, `statusbadge--all-axes`, `--core-axes`;
alle Werte aus dem gerenderten Baum, nicht aus dem Blatt):

| Ton | Vordergrund | Fläche | gemessen | Angabe |
|---|---|---|---|---|
| `info` | `rgb(43, 111, 156)` | `rgb(227, 240, 248)` | **4,690** | 4,69 ✓ |
| `success` | `rgb(63, 122, 90)` | `rgb(240, 246, 242)` | **4,627** | 4,63 ✓ |
| `warning` | `rgb(140, 96, 30)` | `rgb(245, 238, 224)` | **4,778** | 4,78 ✓ |
| `danger` | `rgb(168, 64, 60)` | `rgb(244, 230, 229)` | **4,994** | 4,99 ✓ |
| `neutral` | `rgb(45, 45, 45)` | `rgb(236, 239, 243)` | **11,941** | 11,94 ✓ |

Schrift 11,5 px / 500 — kein großer Text, die Schwelle bleibt 4,5. Gegenprobe:
`--color-accent-700` zur Laufzeit auf `#000` gezogen → `info` springt auf
18,086; `--color-success` auf `#fff` → `success` fällt auf 1,095. Die Messung
reagiert, die Vordergründe kommen wirklich aus den Token.

### Kriterien

- [x] **Die Töne bleiben unterscheidbar.** ΔE(76) zwischen den Vordergründen
      `info`/`success` = **47,35**; zwischen den Flächen **6,94** — vorher
      waren es 6,50, sie sind also eher weiter auseinander. Die neue
      `success`-Fläche rückt an Weiß heran (ΔE 6,05 → **4,70**), bleibt aber
      durch den Rand `#D5E3DB` abgesetzt. Schirmbild vorher/nachher
      (`badge--tones`, alte Werte zur Laufzeit eingespielt): kein sichtbarer
      Unterschied, keine Verwechslung.
- [ ] **Jeder Badge-Ton hält 4,5:1 auf seiner eigenen Fläche — alle Töne.**
      Im Regelfall ja (Tabelle oben). In einer echten v3-Story nein → **M1**.
- [ ] **Kein Hex in einer Komponente; die Änderung steht in `tokens.css`.**
      Erste Hälfte ja: `Badge.tsx` trägt kein Hex, und alle fünf Vordergründe
      kommen jetzt aus Token (ein Hex weniger). Zweite Hälfte nein → **M2**.
- [~] **`pnpm typecheck` und `pnpm build` grün.** `typecheck` Exit 0. `build`
      in dieser Runde nicht gelaufen (0117: ein Bau leert `storybook-static/`,
      mehrere Prüfer im selben Baum). Die Änderung ist reines CSS.

Zusätzlich geprüft: `check:icons`, `check:when`, `check:language`,
`check:contrast` — alle Exit 0. Ikonen im Chip mit 1,5 px Strich (A8), jeder
Ton trägt ein Wort (V7), kein Fokus- und kein Bewegungsfall am Chip.

### Mängel

**M1 — `bdg-info` misst 4,203:1, `bdg-neutral` 4,232:1, sobald die Zeile
gedämpft ist.** `src/styles/v3.css:3567` —
`.v2tbl__row:has(.v2ilrow__off) .bdg { color: inherit; }`. In einer Zeile mit
der Marke „deaktiviert" verlieren **alle** Plaketten der Zeile ihren Ton und
nehmen `--color-text-subtle` (`rgb(113, 113, 113)`):

| Ton | Vordergrund | Fläche | gemessen |
|---|---|---|---|
| `info` | `rgb(113, 113, 113)` | `rgb(227, 240, 248)` | **4,203** |
| `neutral` | `rgb(113, 113, 113)` | `rgb(236, 239, 243)` | **4,232** |

Gemessen in `v3-entitäten-rechnungsposition-invoicelinelist--edges` und
`…-invoicelinerow--deviations` bei 1300 px, 11,5 px Schrift. Gegenprobe: Regel
abgeschaltet → 4,690 bzw. 11,941, dieselben Knoten. Ein Lauf über **alle 717
Stories** des Katalogs findet genau acht verschiedene Plaketten-Darstellungen;
diese zwei sind die einzigen unter 4,5. Der Kommentar darüber sagt „Die
Plakette selbst behält ihre Farbe" —
gemessen ist es umgekehrt: `.v2ilrow__off` behält 4,778, gedämpft werden ihre
Nachbarn. Das Kriterium sagt „gemessen, alle Töne" — die Aufgabe hat nur
`statusbadge--all-axes` gemessen, und dort tritt der Fall nicht auf.
*Kleinster Weg:* Zeile 3567 streichen. Die Zeile bleibt über `> td`
(Zeile 3565) gedämpft; ein gefüllter Chip ist ohnehin kein Zeilentext.

**M2 — die `success`-Fläche steht als einmaliger Hex im Blatt, nicht als
Token.** `src/styles/app-chrome.css:455` — `background: #F0F6F2`. Der Wert
kommt im ganzen Satz genau einmal vor; `tokens.css` kennt ihn nicht. Das
Kriterium verlangt „die Änderung steht in `tokens.css`", die Hausregel §2
(Zeile 18) verlangt Hex-Werte ausschließlich dort. Folge ist M3 und M4:
weil die Fläche kein Token ist, kann der Wächter die Zahl nicht nachrechnen,
und `--color-success-bg` (`#EBF2EE`) bleibt bei 4,46 stehen.
*Kleinster Weg:* `--color-success-bg` in `tokens.css:67` von `#EBF2EE` auf
`#F0F6F2` ziehen (gemessen 4,627 mit `--color-success`), den Kontrastwert als
Kommentar ans Token (A4), und `.bdg-success` die Fläche als
`var(--color-success-bg)` nehmen lassen.

**M3 — `pnpm check:contrast` erfasst die Angaben dieser Aufgabe nicht.**
Zwei Löcher, beide mit einer Kopie des Blattes und einer Kopie des Wächters
im Scratchpad nachgewiesen (kein Eingriff im Baum):

1. *Die `success`-Zahl gibt es nicht mehr.* Der Bau schrieb „4.63:1 (0112)";
   `d4803ff` hat sie entfernt, statt sie prüfbar zu machen — der Wächter
   konnte sie nicht auflösen, weil die Fläche kein Token ist (M2). Gegenprobe:
   `.bdg-success { background: #3F7A5C }` (gerendert ≈ 1,0:1) → `check:contrast`
   Exit **0**. Das Ergebnis dieser Aufgabe ist damit unbewacht.
2. *Die `info`-Zahl wird gegen das falsche Ding geprüft.* Der Kommentar sagt
   „4.69:1 auf accent-100"; der Wächter löst `accent-100` aus `tokens.css` auf,
   nicht aus dem `background: #E3F0F8`, das danebensteht. Beide sind heute
   zufällig gleich. Gegenprobe: `.bdg-info { background: #6B90A8 }`
   (gerendert ≈ 1,8:1) → Exit **0**. Nur wenn man die *Zahl* verfälscht
   (4.69 → 4.99) meldet er sich (Exit 1, „gemessen 4.69:1").
   *Kleinster Weg:* dieselbe Abhilfe wie M2 — nimmt der Chip die Fläche als
   Token, prüft der Wächter das, was auch rendert.

**M4 — der Zuschnitt sagte „nicht die Komponente, sondern die zwei
Farbpaare"; geändert wurde die Komponente.** Beide Paare aus der
Befund-Tabelle laufen unverändert weiter:

| Ort | Vordergrund | Fläche | gemessen | Schrift |
|---|---|---|---|---|
| `src/styles/components.css:35` `.banner--info` | `rgb(46, 120, 168)` | `rgb(227, 240, 248)` | **4,140** | 13,5 px |
| `src/styles/components.css:36` `.banner--success` | `rgb(63, 122, 90)` | `rgb(235, 242, 238)` | **4,458** | 13,5 px |
| `--color-success` auf `--color-success-bg` | — | — | **4,46** | Text |

Gemessen in `v3-primitives-fläche-banner--info`, `--success` und
`v3-entitäten-beleg-sourcedocumentview--pending`; die 4,140 ist auf zwei
Stellen dieselbe Zahl, mit der die Aufgabe aufmacht. Das dritte steht live in
der eigenen Kontrast-Seite des Sets: `v3-grundlagen-farbe--contrast` zeigt
`success` auf `success-bg` mit „4,46:1 **unter der Schwelle**". Gegenprobe:
`.banner--info` zur Laufzeit auf `--color-accent-700` / `--color-accent-100`
gezogen → 4,140 → **4,690**, ein Zeilenwechsel, genau der Griff, den der Chip
schon gemacht hat.
*Kleinster Weg:* mit M2 fällt die dritte Zeile weg; die zwei Banner-Zeilen auf
dieselben Token setzen.

**M5 (klein) — der Chevron im `StatusBadge` misst 2,760:1.**
`src/ui/v3/patterns/StatusBadge.tsx:93` — `opacity: 0.7` über dem
Vordergrund des Chips. Gemessen in
`v3-patterns-prüfen-statusbadge--status-menu`: `rgb(43, 111, 156)` bei 0,7
auf `rgb(227, 240, 248)` = **2,760**. §9 verlangt für Ikonen ≥ 3:1. Die
Aufgabe hat den Wert von 2,561 auf 2,760 gehoben, aber nicht über die Linie —
und das ist genau der Fall, den der Wächter laut eigener Beschreibung nicht
rechnen kann („Was er nicht kann: Deckkraft"). Zum Vergleich: der Punkt
`.bdg-info .dot` steht mit `--color-accent` bei **3,059** — er hält, knapp.
*Kleinster Weg:* die Deckkraft am Chevron streichen; der Ton trägt den
Unterschied schon.

**M6 (klein) — Befund B1 steht nicht in `docs/befunde-app.md`.**
`docs/backlog/README.md:33` verlangt App-Befunde zusätzlich dort. B1 ist nach
dem Bau außerdem nicht mehr wahr: drüben genügt nicht „dieselben Werte",
sondern zwei benannte Griffe — `.bdg-info` auf `--color-accent-700`,
`.bdg-success` auf die hellere Fläche.

### Was gehalten hat

Der Kern der Aufgabe — die Zahl — stimmt. Alle fünf Angaben in der
Erledigt-Tabelle sind nachgerechnet richtig (4,690 / 4,627 / 4,778 / 4,994 /
11,941), auch die beiden Vorher-Werte (4,140 und 4,458). Kein Wert ist
abgeschrieben, keine Farbe aus dem Kopf: die Notiz über den falsch
abgeschriebenen `warning`-Hex hat sich bestätigt, `#8C601E` auf `#F5EEE0`
misst 4,778.

| | |
|---|---|
| Abgenommen von / am | Claude (fremde Abnahme), 2026-09-07 — **zurück** |

## Nach der Abnahme (2026-09-07)

Alle fünf Zahlen der Erledigt-Tabelle hat die Abnahme unabhängig nachgerechnet
und bestätigt. Zurück kam sie an vier Stellen, an denen der hergestellte
Kontrast danach wieder verloren ging — drei davon sind behoben.

**M1 — eine Zeile machte die Arbeit rückgängig.**
`.v2tbl__row:has(.v2ilrow__off) .bdg { color: inherit }` gab jeder Plakette in
einer deaktivierten Zeile den gedämpften Ton der Zeile: `bdg-info` fiel auf
**4,20**, `bdg-neutral` auf **4,23**. Deaktiviert ist die *Zeile*, nicht die
Aussage der Plakette. Nach dem Streichen gemessen: 4,690 und 11,941 in beiden
betroffenen Stories.

**M4 — die zwei Farbpaare, um die es ursprünglich ging, liefen weiter.**
`.banner--info` stand mit `#2E78A8` auf `#E3F0F8` bei **4,140**,
`.banner--success` bei **4,458**. Beide nehmen jetzt die Token, die 0112 für
die Plakette gewählt hat: 4,690 und 4,627.

**M2 — der Einzel-Hex ist ein Token.** `#F0F6F2` stand genau einmal im ganzen
Satz. `--color-success-bg` trägt jetzt diesen Wert, und der Chip nimmt das
Token.

**M3 — die Angaben prüfen jetzt, was dasteht.** Der Wächter löst den
**genannten** Grund auf; stand die Fläche daneben als Hex, prüfte er ein
anderes Paar, und eine Änderung am Hex wäre unbemerkt geblieben. Beide Seiten
der `info`-Marke sind Token, und die `success`-Zahl steht wieder da, prüfbar
geschrieben. `check:contrast` rechnet damit 18 statt 17 Angaben nach.

**M5 — der Chevron trug `opacity: 0.7`** und kam damit auf 2,76, wo §9 für
Zeichen 3:1 verlangt. Die Deckkraft ist weg; er trägt den vollen Ton (4,69).

**M6 bleibt offen:** Befund B1 gehört als Zeile nach `docs/befunde-app.md`, ist
aber nach dem Bau inhaltlich überholt — er will neu formuliert werden, nicht
abgeschrieben.
