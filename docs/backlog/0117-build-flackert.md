# 0117 · `pnpm build` bricht sporadisch beim Kopieren der statischen Verzeichnisse ab

| | |
|---|---|
| Status | fertig |
| Stufe | Werkzeug (`.storybook/main.ts`, `package.json`) |
| Klassen-Test | — keine Komponente |
| Quelle | **Fünf** Meldungen am 2026-09-07, unabhängig voneinander: 0027 (einer von vier Läufen), 0056 (einer von drei), 0050 (mit der richtigen Spur) und drei Prüfer, denen der Ordner unter den Füßen wegkam — der letzte Fall mit bekanntem Auslöser, siehe unten |
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

## Vierte Meldung — und diesmal mit bekannter Ursache (2026-09-07)

Die Spur aus der 0050-Meldung stimmt: **es ist der zweite Bau im selben
Ausgabeordner**, und heute ist er nachweisbar, weil ich ihn selbst ausgelöst
habe. Während drei Prüf-Subagenten gegen `storybook-static/` maßen, lief
hier `pnpm build` — zweimal, im Rahmen einer anderen Aufgabe. Alle drei
meldeten im selben Zeitraum einen Ausfall, jeder an einer anderen Stelle:

| Prüfer | Was er sah |
|---|---|
| 0085 | 404 aus Vite beim Laden einer Story |
| 0086 | `chrome-headless-shell` hängt, Messlauf ohne Antwort |
| 0088/0089/0093 | `storybook-static/index.json` fehlt |

Drei verschiedene Fehlerbilder, ein Auslöser: der Bau **löscht** den Ordner
und schreibt ihn neu. Wer in diesem Fenster liest, sieht je nach Zeitpunkt
eine fehlende Datei, eine halbe Datei oder gar keinen Ordner. Dass es wie drei
verschiedene Fehler aussieht, ist der Grund, warum es viermal einzeln gemeldet
wurde.

**Der Ausweg ist nicht, den Kopierer zu reparieren, sondern den Ordner nicht
zu teilen.** Zwei Regeln, die ab sofort in jedem Prüfauftrag stehen:

1. **Gemessen wird gegen den Dev-Server auf Port 6107**, nicht gegen
   `storybook-static/`. Er serviert die Quelle, kennt keinen Ausgabeordner und
   überlebt jeden Bau: Katalog unter `/index.json`, eine Story unter
   `/iframe.html?id=<story-id>&viewMode=story`.
2. **Ein Prüfer baut nicht.** `pnpm build` ist der Grün/Rot-Test dessen, der
   gebaut hat — für eine Messung ist er nie nötig.

Damit bleibt für die Aufgabe selbst nur noch die Frage, ob zwei Sitzungen je
einen eigenen `--output-dir` bekommen sollen. Solange Prüfer den Dev-Server
nehmen, ist der geteilte Ordner unkritisch; er wird es wieder, sobald zwei
Sitzungen gleichzeitig bauen.

## Bauprüfung dieser Welle (im Worktree) — 2026-09-07

Nach der Owner-Regel prüft je Welle **genau ein** Prüfer den Bau, und zwar
nicht im Arbeitsbaum. Für diese Welle war das der Abnehmende von
`0105-entity-icons-gabelt.md`.

```
git worktree add <scratchpad>/build-check HEAD   # f1913b6, sauber
pnpm install --frozen-lockfile                   # Exit 0, 4,2 s
pnpm build                                       # Exit 0
```

**Ergebnis: `build=0`.** 613 Zeilen Log, letzte Zeile „Storybook build
completed successfully", Exit-Code gelesen — nicht `| tail`.

### Flackert das `staticDirs`-Kopieren noch?

**Nein — in diesem Lauf nicht, und der Grund dafür ist bekannt.**

| Frage | Messung |
|---|---|
| `ENOENT` im Log? | `grep -c ENOENT` → **0** |
| Wurden beide `staticDirs` kopiert? | ja, beide Zeilen im Log: „Copying static files: **public** at storybook-static" und „Copying static files: **reference** at storybook-static/reference" |
| Andere Fehler? | keine. Die einzigen Treffer für `error/failed/warn` sind zwei Zeilen über `build.chunkSizeWarningLimit` |
| Wohin ging die Ausgabe? | `…/scratchpad/build-check/storybook-static` — der Worktree hat **seinen eigenen** Ausgabeordner |
| Blieb der Arbeitsbaum unberührt? | ja: `storybook-static/` dort trägt weiter **12:47**, die Worktree-Ausgabe **13:56**. Kein geteilter Ordner, kein gelöschter Ordner unter fremden Füßen |

Das bestätigt die vierte Meldung dieser Aufgabe von der anderen Seite: nicht
der Kopierer ist unzuverlässig, sondern **der geteilte Ausgabeordner**. Nimmt
man ihn weg — und genau das tut ein eigener Worktree, ohne dass irgendein
Schalter gesetzt werden müsste —, läuft der Bau durch, kopiert beide
statischen Verzeichnisse und fasst nichts an, woran gerade jemand misst.

### Empfehlung: 0117 kann geschlossen werden

Die Aufgabe fragt zuletzt nur noch, „ob zwei Sitzungen je einen eigenen
`--output-dir` bekommen sollen". Die Antwort steht damit fest, und sie braucht
keine Änderung an `package.json`:

1. **Ein Prüfer misst gegen den Dev-Server 6107** — steht schon in jedem
   Prüfauftrag und hat in dieser Welle gehalten.
2. **Wer baut, baut im eigenen `git worktree`.** Der Worktree bringt den
   eigenen Ausgabeordner mit; ein `--output-dir` je Sitzung wäre dieselbe
   Trennung mit mehr Schrauben.

Ehrlich dazugesagt: das ist **ein** grüner Lauf, und ein Lauf widerlegt keine
Fehlerrate von eins zu drei. Was ihn trotzdem trägt, ist die Ursache — sie ist
seit der vierten Meldung benannt und in diesem Lauf durch Abwesenheit belegt:
kein zweiter Bau im selben Ordner, kein `ENOENT`, beide `staticDirs` kopiert.
Sollte der Abbruch in einem **isolierten** Worktree je wieder auftauchen, wäre
das ein neuer Befund und diese Aufgabe die falsche Stelle dafür.

Eingetragen von / am: Claude (Abnahme 0105, Bau-Prüfer dieser Welle),
2026-09-07.

## Geschlossen (2026-09-07)

Der Owner hat über den Coordinator entschieden: **je Welle prüft genau ein
Prüfer den Bau in einem eigenen `git worktree`** — nicht im Arbeitsbaum, in
dem gemessen wird. Damit ist der Befund kein Hindernis mehr, sondern eine
Arbeitsregel, und sie steht in den Abnahme-Aufträgen.

Der erste Lauf nach dieser Regel steht oben: **Exit 0**, kein `ENOENT`, beide
`staticDirs` kopiert, der Arbeitsbaum unberührt. Die Ursache war nie der
Kopierer, sondern der geteilte Ausgabeordner — ein Worktree nimmt ihn weg,
ohne dass ein `--output-dir` gesetzt werden muss.

Was dabei bleibt und in den Prüf-Auftrag gehört, nicht hierher: **wer im
Arbeitsbaum misst, baut nicht.** Zehn Abnahmen in Folge haben `pnpm build` als
ungeprüft vermerkt, weil die Regel fehlte — das war der eigentliche Schaden.

**Status: fertig.**
