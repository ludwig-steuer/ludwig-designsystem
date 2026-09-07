# 0117 · `pnpm build` bricht sporadisch beim Kopieren der statischen Verzeichnisse ab

| | |
|---|---|
| Status | offen |
| Stufe | Werkzeug (`.storybook/main.ts`, `package.json`) |
| Klassen-Test | — keine Komponente |
| Quelle | **Zwei** Abnahmen am 2026-09-07, unabhängig voneinander: 0027 (einer von vier Läufen) und 0056 (einer von drei) |
| Angelegt von / am | Claude, 2026-09-07 |

## Was passiert

`pnpm build` bricht in etwa jedem dritten bis vierten Lauf mit Exit 1 ab:

```
ENOENT … chmod './storybook-static/reference/design-system-v2/PROGRESS.md'
ENOENT … chmod './storybook-static/reference/f109-buchungsreview/_ds/…/ui_kits/marketing'
```

Beide Male beim Kopieren der `staticDirs` (`.storybook/main.ts:21`), beide Male
an einer anderen Datei. Die übrigen Läufe sind grün, ohne dass sich am Baum
etwas geändert hätte.

**Der Fehler steht nicht in der letzten Zeile.** Dort steht `ELIFECYCLE`, und
wer mit `| tail -1` prüft, sieht die Erfolgsmeldung eines früheren Laufs —
genau die Falle, die in dieser Runde schon einmal zwanzig Minuten gekostet hat.
Seitdem gilt: **Exit-Code lesen.**

## Warum das zählt

`reference/` ist groß (das ausgelieferte Design-System und zwei Artboard-Sets)
und wird bei jedem Bau vollständig kopiert. Ein Bau, der zufällig fehlschlägt,
macht jede Abnahme unsicher: wer „build grün" schreibt, hat vielleicht nur
Glück gehabt, und wer „build rot" liest, sucht den Fehler in seiner eigenen
Arbeit. Zwei Abnahmen desselben Tages haben genau das gemeldet.

## Was zu prüfen ist

**Dritte Meldung, andere Spur:** die Abnahme von 0050 sah denselben Abbruch an
`sb-common-assets/nunito-sans-bold.woff2` — einer Datei, die Storybook selbst
schreibt — und nennt als Ursache **einen zweiten Bau im selben
Ausgabeordner**. Das erklärt das Flackern besser als eine Eigenart des
Kopierers: in diesem Baum arbeiten mehrere Sitzungen, und `pnpm build`
schreibt immer nach `storybook-static/`. Der serielle Zweitlauf war grün.

| Frage | Woran man es sieht |
|---|---|
| Kopiert Storybook parallel und kollidiert mit sich selbst? | Der Fehler nennt `chmod` auf eine Datei, die es gerade schreibt |
| Braucht `reference/` überhaupt den Weg über `staticDirs`? | Es wird nur von den Artboard-Stories eingebettet |
| Reicht ein Symlink oder ein `serve`-Pfad statt einer Kopie? | Der Bau würde nichts mehr kopieren |
| Gibt es das auch in CI? | Dort wäre es ein roter Lauf ohne Ursache — und dort baut **niemand** parallel, was die Ursache eingrenzt |
| Bauen zwei Sitzungen in denselben Ordner? | `storybook-static/` ist nicht je Sitzung getrennt; ein `--output-dir` pro Sitzung wäre der kleinste Ausweg |

## Nicht Teil dieser Aufgabe

Die Ursache **im** Storybook-Kopierer zu beheben. Wenn sie dort liegt, ist der
Ausweg, weniger zu kopieren — nicht, das Werkzeug zu reparieren.
