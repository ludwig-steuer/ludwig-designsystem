# 0046 · Progress inline — Zahl neben dem Balken

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` — Prop an `Progress` (0045), keine neue Datei |
| Klassen-Test | entfällt: kein neuer Baustein, eine Form des vorhandenen |
| Quelle | Sitzung 2026-09-03, Probe mit `Progress` im Gruppenkopf von `TodoList` |
| Ersetzt | das Hand-Flex-Layout in `patterns/StepRail.tsx` (`ProgressBar`) samt `.abn__progress*` im CSS |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

0045 hat `label={null}` gebaut für den Fall „die Zahl steht schon daneben" —
und die Verantwortung für das Nebeneinander beim Aufrufer gelassen, mit der
Begründung: ein Vorkommen (`StepRail`), also YAGNI. Die Probe im Gruppenkopf
von `TodoList` ist das zweite Vorkommen, und beide schreiben dasselbe
Flex-Layout mit derselben festen Balkenbreite selbst:

```tsx
<span style={{ display: "flex", alignItems: "center", gap: 8 }}>
  1 von 3
  <span style={{ width: 70 }}><Progress done={1} total={3} label={null} /></span>
</span>
```

Bei zwei belegten Stellen gehört das in die Komponente. Der gestapelte Fall
(Balken oben, Label darunter) bleibt der Standard — er passt in eine
Tabellenzelle, wo waagerecht kein Platz ist.

## Einordnung

- **Erweitern, nicht neu:** ein `boolean` an `Progress`. Eine zweite
  Komponente `ProgressInline` wäre dieselbe Arithmetik zweimal.
- **Zuschnitt:** kein Breiten-Prop. Der Balken trägt in der Inline-Form
  `width: 120px` — die Breite, die `StepRail` bisher von Hand gesetzt hat —
  und wächst darüber hinaus nur, wo der Aufrufer wirklich Breite gibt
  (`flex: 1 1 auto`). Erster Versuch mit `flex: 1 1 120px` war falsch: in
  einer schrumpfenden Leiste greift die Basis nicht, der Balken fiel auf
  `min-width` zurück.
- **Setzt auf:** 0045.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `inline` | `boolean` | nein | Label **vor** dem Balken in einer Zeile statt darüber; Standard `false` | `Inline` |

Alles andere unverändert aus 0045. `inline` mit `label={null}` ergibt einen
Balken ohne Zahl in einer Zeile — erlaubt, aber sinnlos; die Regel „der
Balken steht nie allein" gilt weiter.

## Verhalten

- **Reihenfolge:** in der Inline-Form steht das Label links, der Balken
  rechts. So haben es beide Aufrufer gebaut, und so liest man „1 von 3 →
  soweit ist es".
- **Typografie:** das Label behält seine Größe und Farbe (11 px, `subtle`),
  verliert den `margin-top`, bricht nicht um und setzt Ziffern tabellarisch —
  eine Zahl, die hochzählt, soll nicht zappeln.
- **`.abn__progress` und `.abn__progress__text` entfallen:** `StepRail`
  braucht kein eigenes Layout und keine eigene Textklasse mehr. Damit wird
  der Schritt-Kopf-Text 11 px/`subtle` statt 12 px/`muted` — eine bewusste
  Vereinheitlichung, nachgewiesen im Browser.

## Stories

Ergänzt `v3/Primitives/Daten/Fortschritt` um eine Story.

| Story | Beweist |
|---|---|
| `Inline` | Label vor dem Balken, in drei Größen und in einem Versalienkopf |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` am Export gepflegt
- [ ] Kein Hex, kein px im TSX
- [ ] Story vorhanden
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `StepRail.ProgressBar` enthält kein eigenes Flex-Layout und keine
      eigene Breitenangabe mehr, sondern `<Progress inline />`
- [ ] `.abn__progress` und `.abn__progress__text` sind aus `v3.css`
      gelöscht und werden nirgends mehr referenziert
- [ ] Der Schritt-Kopf (`v3-patterns-frame-steprail--screen-header`) sieht
      im Browser aus wie vorher, bis auf die dokumentierte Typo-Änderung
- [ ] `inline` ohne Breitenangabe am Aufrufer ergibt einen brauchbaren
      Balken (Story `Inline`, Gruppenkopf-Fall)
- [ ] Der gestapelte Standard ist unverändert (Story `Labels` aus 0045)
