# 0112 · `bdg-info` liegt unter 4,5:1 — der häufigste Chip des Sets

| | |
|---|---|
| Status | offen |
| Stufe | `src/styles/tokens.css` + `Badge` |
| Quelle | Abnahme 0098 (2026-09-06), Mangel M8 — gemessen an `v3-patterns-prüfen-statusbadge--all-axes` |
| Auftrag | Zwei Badge-Töne reißen WCAG 1.4.3; `info` ist der Vorgabewert von `StatusBadge` und steht damit auf fast jeder Fläche |
| Spec von / am | Claude, 2026-09-06 |

## Befund

Gemessen (headless, 1440, `getComputedStyle`):

| Ton | Vordergrund | Fläche | Verhältnis | Grenze |
|---|---|---|---|---|
| `bdg-info` | `rgb(46, 120, 168)` | `rgb(227, 240, 248)` | **4,14 : 1** | 4,5 : 1 |
| `bdg-success` | — | — | **4,46 : 1** | 4,5 : 1 |

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
