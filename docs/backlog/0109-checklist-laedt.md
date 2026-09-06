# 0109 · `Checklist` sagt nicht, dass sie lädt

| | |
|---|---|
| Status | Abnahme |
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

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Gemessen (2026-09-06)

| Story | Flächen | Kopf | Ansage | Raster |
|---|---|---|---|---|
| `Loading` (sechs bekannte Zeilen) | 30 = 6 × 5 | steht | „Wird geladen …" | `20px 984px 76px 100px 150px` — identisch zum Kopf |
| `LoadingEmpty` (keine Zeilen) | 20 = 4 × 5 | steht | „Wird geladen …" | dasselbe |

Kein Sprung im Raster: die Ladefläche liegt in denselben fünf Spalten wie die
Zeilen, weil sie dieselbe `.v2tbl__row` benutzt.
