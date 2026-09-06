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
