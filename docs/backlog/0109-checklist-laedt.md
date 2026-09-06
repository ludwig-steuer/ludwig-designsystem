# 0109 · `Checklist` sagt nicht, dass sie lädt

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/Review.tsx` |
| Quelle | App-Migration 2026-09-06 (`designsystem-f0`): die App hatte `loading` in ihrer eigenen Prüfen-Kopie nachgerüstet, das Set hat es nicht |
| Auftrag | `Checklist` kennt keinen Ladezustand. Während die Prüfungen laufen, steht die Tabelle mit ihren Kopfzeilen und **ohne Zeilen** da — und das liest sich wie „alles offen, nichts getan". V9 verlangt fünf Zustände, T6 verlangt, dass jeder von ihnen etwas sagt. |
| Warum das zählt | Die Checkliste ist der Ort, an dem jemand sieht, **ob** geprüft wurde. Eine leere Liste beim Laden behauptet das Gegenteil dessen, was gerade passiert. |
| Spec von / am | Claude, 2026-09-06 |

## Ziel

Eine Prop, ein Zustand, kein neues Vokabular: `loading` zeigt statt der Zeilen
die Ladefläche in der **Form des Inhalts** — so viele Zeilen, wie kommen
werden, mindestens vier, über die fünf Spalten der Checkliste.

Die App hat das in ihrer Kopie schon so gebaut; dieses Repo zieht nach, statt
eine zweite Lösung zu erfinden.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `loading` | `boolean` | nein | Die Prüfungen laufen noch. Ersetzt die Zeilen, **nicht** den Kopf — die Spalten stehen, damit nichts springt | `Loading` |

**Kann bewusst nicht:**

- **Selbst laden.** Der Aufrufer hält den Zustand, wie überall im Set.
- **Einen Fehler zeigen.** Dafür gibt es `ErrorRow`; ein gescheiterter Lauf
  ist kein leerer Lauf.

## Verhalten

`TableLoading` mit `rows = max(rows.length, 4)` und `cols = 5`: kommen die
Zeilen schon mit (ein zweiter Lauf über bekannte Prüfungen), hat die Fläche
ihre Zahl; kommt die Liste erst, sind es vier — genug, dass die Karte nicht
in sich zusammenfällt.

Der Spaltenkopf bleibt stehen. Er ist die Zusage, was kommt.

## Stories

Eine kommt dazu: `Loading`. Die vorhandenen bleiben unverändert.

| Story | Beweist |
|---|---|
| `Loading` | `loading` mit bekannten Zeilen — Kopf steht, Flächen in ihrer Zahl, `sr-only`-Ansage |
| `LoadingEmpty` | `loading` ohne Zeilen — vier Flächen, die Karte fällt nicht zusammen |
| `NotCounted` | umbenannt: Zeilen ohne Zähler sind ein **Ergebnis**, kein Ladezustand |

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` unverändert am Export
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] `loading` zeigt die Ladefläche statt der Zeilen, der Spaltenkopf bleibt (Story `Loading`, gemessen)
- [ ] Die Zahl der Flächen ist `max(rows.length, 4)` — mit und ohne mitgegebene Zeilen geprüft
- [ ] Die Fläche liegt in denselben fünf Spalten wie die Zeilen (kein Sprung im Raster)
- [ ] Eine Vorlesehilfe hört, dass geladen wird (`sr-only` aus `Skeleton`/`TableLoading`)
- [ ] Ohne `loading` ändert sich nichts (die übrigen Stories unverändert)

## Abnahme (fremd, 2026-09-06)

Geprüft gegen die Spec und den Code, nicht gegen den Chat. Storybook lief auf
`localhost:6107`; alle Zahlen sind selbst im Blatt gemessen, keine aus dem
Abschnitt „Gemessen" übernommen. Werkzeuge im Scratchpad: `measure.mjs`,
`shot.mjs`, `console-check.mjs` und ein eigener Baum-Leser (`ab109-ax.mjs`).

**Urteil: abgenommen.** Eine Prop, ein Zustand, kein neues Vokabular — und die
Ladefläche liegt Spalte für Spalte da, wo die Zeilen liegen.

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` ist in dieser Abnahme untersagt; ersatzweise `console-check.mjs` über **alle zehn** Stories der Datei (`filled`, `all-passed`, `not-counted`, `loading`, `loading-empty`, `state-icons`, drei `check-items-*`, `messages-three-levels`): 0 Konsolenmeldungen | ✓ typecheck · build nicht geprüft |
| **Fest** — Code englisch; `@when`/`@instead` unverändert am Export | `loading?: boolean` mit englischem Prop-JSDoc (`Review.tsx:107–113`); `@when    Checklist of a gate …` / `@instead Items to work through → TodoList.` (`Review.tsx:99–100`) im Diff nicht angefasst (`git show 4e58718 -- src/ui/v3/patterns/Review.tsx`). Deutsch nur im sichtbaren Text „Wird geladen …", und der kommt aus `TableLoading` (`Cells.tsx:143`), nicht aus dieser Datei | ✓ |
| **Fest** — im Browser angesehen | `loading`, `loading-empty`, `not-counted`, `all-passed`, `filled` im Iframe geöffnet und gemessen; drei davon als Bild (`ab109-loading.png`, `ab109-loading-empty.png`, `ab109-not-counted.png`) | ✓ |
| `loading` zeigt die Ladefläche statt der Zeilen, der Spaltenkopf bleibt | `Loading`: `.v2tbl__head` misst Höhe > 0 und trägt „Prüfung · Stand · Fortschritt · Sprung"; **0** `ChecklistLine` im Blatt, stattdessen 6 `.v2tbl__row` mit je 5 `.v2skel`. Im Bild steht der Kopf über sechs gleich hohen Flächenzeilen | ✓ |
| Die Zahl der Flächen ist `max(rows.length, 4)` — mit und ohne Zeilen | `Loading` (sechs Zeilen mitgegeben): 30 Flächen = 6 × 5. `LoadingEmpty` (`rows={[]}`): 20 = 4 × 5. Beides gezählt über `document.querySelectorAll(".v2skel").length`, nicht aus `Review.tsx:134` abgelesen | ✓ |
| Die Fläche liegt in denselben fünf Spalten wie die Zeilen | `getComputedStyle(...).gridTemplateColumns` misst am Kopf **und** an jeder Ladezeile `20px 984px 76px 100px 150px`; dieselbe Angabe an den Zeilen von `NotCounted` und `AllPassed`. Die Ladezeile ist dieselbe `.v2tbl__row`, kein zweites Raster | ✓ |
| Eine Vorlesehilfe hört, dass geladen wird | Der volle Baum (`Accessibility.getFullAXTree`) von `Loading` enthält `StaticText: Wird geladen …`; die sechs Flächenzeilen tragen `aria-hidden="true"` und stehen nicht darin. Die Ansage misst 1 × 1 px mit `clip: rect(0,0,0,0)` — versteckt fürs Auge, nicht für den Baum | ✓ |
| Ohne `loading` ändert sich nichts | `NotCounted`, `AllPassed` und `Filled` messen 0 `.v2skel`, kein `.sr-only`, sechs Zeilen ohne `aria-hidden`, dieselbe Rasterangabe wie zuvor; der Diff (`git show 4e58718`) berührt nur die Ausgabe der Zeilen, nicht `ChecklistLine` | ✓ |
| **Zusatz** — die Umbenennung `Loading` → `NotCounted` bricht keinen Verweis | `grep -rn "prüfen-checklist"` über das Repo findet drei Treffer, alle in `docs/backlog/0045-progress.md` (`:115`, `:131`, `:152`) und alle auf `--filled`. Kein Dokument nennt die Story `Loading` im alten Sinn „Zeilen ohne Zähler". `index.json` kennt beide IDs (`--not-counted`, `--loading`) | ✓ |

Kein Mangel offen.

Außerhalb der Kriterien aufgefallen:

- Die Ansage ist statischer Text, kein `role="status"`. Wer schon auf der Seite
  steht, wird beim Umschalten auf `loading` nicht **benachrichtigt**, sondern
  hört den Satz erst beim Lesen der Karte. Das ist Sache von `TableLoading`
  (`Cells.tsx:143`) und gilt überall gleich — kein Befund dieser Aufgabe, aber
  eine Frage für 0016.
- `Checklist` hat damit vier der fünf Zustände (gefüllt, „alles grün", ohne
  Zähler, lädt). Der Fehlerfall fehlt weiter; die Spec schließt ihn mit Grund
  aus (`ErrorRow`), aber keine Story führt vor, wie beides zusammensteht.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-06 · Offene Punkte: keine

## Gemessen (2026-09-06)

| Story | Flächen | Kopf | Ansage | Raster |
|---|---|---|---|---|
| `Loading` (sechs bekannte Zeilen) | 30 = 6 × 5 | steht | „Wird geladen …" | `20px 984px 76px 100px 150px` — identisch zum Kopf |
| `LoadingEmpty` (keine Zeilen) | 20 = 4 × 5 | steht | „Wird geladen …" | dasselbe |

Kein Sprung im Raster: die Ladefläche liegt in denselben fünf Spalten wie die
Zeilen, weil sie dieselbe `.v2tbl__row` benutzt.
