# 0046 · Progress inline — Zahl neben dem Balken

| | |
|---|---|
| Status | fertig |
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

## Abnahme

Geprüfter Stand: `bd1eb6a` („0046 gebaut") plus `fd84283` (Nachbesserung, ein
Kommentar — siehe die Zeile „Code englisch"). Die vier Dateien sind seit `bd1eb6a`
nur an dieser einen Kommentarzeile geändert: `git diff bd1eb6a HEAD` auf
`Progress.tsx`, `Progress.stories.tsx`, `StepRail.tsx` und `v3.css` zeigt `-1/+1`
in der Story und sonst allein einen fremden Block `.v2raw*` am Ende von `v3.css`
(`a23c004`, Aufgabe 0051, keine `.v2bar`/`.v2prog`-Selektoren — die Messwerte
unten stehen also unverändert); `git status --short` auf dieselben Pfade → leer.
Browser-Nachweise aus dem laufenden Storybook-Dev-Server auf Port 6107.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, Exit 0. `pnpm build` → „Storybook build completed successfully", Exit 0. Beide selbst gelaufen, im Arbeitsbaum mit den Fremdänderungen anderer Sitzungen. | ✓ |
| Code englisch; `@when`/`@instead` am Export gepflegt | `@when`/`@instead` stehen englisch am Export (`Progress.tsx:14–16`), das neue Prop ist englisch dokumentiert (`Progress.tsx:37–39`), Bezeichner/Typen englisch, der Codekommentar in der Komponente englisch (`Progress.tsx:57`), Story-Exportname `Inline`. Der in der ersten Abnahme beanstandete deutsche JSX-Kommentar ist mit `fd84283` übersetzt: `Progress.stories.tsx:148` trägt jetzt `{/* A list's all-caps group header: the label keeps its own style. */}` — nachgeprüft am 2026-09-03, `git show fd84283` ändert im TSX genau diese eine Zeile (−1/+1). Deutsch bleibt nur im Storybook-Dokblock (`:130–135`) und in den ausgegebenen Labels — beides Nutzertext. | ✓ |
| Kein Hex, kein px im TSX | Einziges Inline-Maß der Komponente: die Prozentbreite aus `pct * 100` (`Progress.tsx:52`). `StepRail.tsx` hat sein `style={{ width: 120 }}` verloren (Diff `bd1eb6a`), die 120 px stehen jetzt in `v3.css:893`. Kein Hex in beiden Dateien. px in der neuen Story nur als Gerüst (`maxWidth: 460`, `gap`, `padding`, `Progress.stories.tsx:138–155`) — Konvention der v3-Stories: 21 px-`gap` und 7 px-`padding` in `primitives/*.stories.tsx`. | ✓ |
| Story vorhanden | `curl localhost:6107/index.json` listet `v3-primitives-daten-fortschritt--inline` neben den vier Stories aus 0045; Quelle `Progress.stories.tsx:136`. Im Browser gerendert und gemessen. | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Vier Stories per Iframe geöffnet, gemessen und als Screenshot gesehen: `--inline`, `--labels`, `v3-patterns-frame-steprail--screen-header`, dazu `seiten-stapelabnahme--bookings` (zweiter `ProgressBar`-Aufrufer im Schienenfuß). Konsole auf `--inline`: 0 Fehler, 0 Warnungen. | ✓ |
| `StepRail.ProgressBar` ohne eigenes Flex-Layout und eigene Breitenangabe, dafür `<Progress inline />` | `StepRail.tsx:226–227`: übrig ist `<div title={…}>` — nur noch der Tooltip — plus `<Progress done total label inline />`. Kein `display: flex`, kein `width`, keine eigene Textklasse mehr. | ✓ |
| `.abn__progress` und `.abn__progress__text` gelöscht und nirgends referenziert | `grep -rn "abn__progress" src` → keine Treffer (nur `docs/backlog/0045-progress.md:179` und diese Datei). Im Diff `bd1eb6a` in `v3.css` mit `-7` Zeilen entfernt. | ✓ |
| Schritt-Kopf sieht aus wie vorher, bis auf die dokumentierte Typo-Änderung | `v3-patterns-frame-steprail--screen-header`, im DOM gemessen: Reihenfolge Text→Balken, `gap: 10px`, `align-items: center`, Balken **120 px**, Füllung `width: 34.7458%`, Höhe 6 px — alles identisch zu den in der Abnahme von 0045 gemessenen Werten. Einziger Unterschied: das Label steht auf 11 px / `rgb(113,113,113)` (`--color-text-subtle`) statt 12 px / `rgb(92,92,92)` (`--color-text-muted`). Gegenprobe im Browser mit den alten Werten: Labelbreite 108,61 px statt 99,56 px, der ganze Block also 9,05 px breiter als heute. Kein weiterer Versatz. | ✓ |
| `inline` ohne Breitenangabe am Aufrufer ergibt einen brauchbaren Balken | Gruppenkopf-Fall der Story `--inline` (ohne jede Breitenangabe): Balken 120,00 px. Schritt-Kopf im `ActionBar`: 120,00 px, auch bei Fenstern von 760 px und 520 px — `flex-basis` fällt nicht auf `min-width: 48px` zurück, kein waagerechter Überlauf (`scrollWidth == clientWidth`). Wo der Aufrufer Breite gibt, wächst er: 316,44 px in der Karte der Story, 160,41 px im Schienenfuß von `seiten-stapelabnahme--bookings`. | ✓ |
| Der gestapelte Standard ist unverändert (Story `Labels`) | `--labels` im DOM: Elternknoten `<span>` ohne Klasse, `display: block`, Reihenfolge Balken→Label, `margin-top: 3px`, Label 11 px, Füllungen `72%`, `34.7458%`, `0%`, `50%`. Zeichengleich mit den Werten aus der Abnahme von 0045. Der `inline`-Zweig (`Progress.tsx:58–68`) lässt den gestapelten Zweig unberührt, `inline` ist `false` per Vorgabe (`:25`). | ✓ |
| Kehrtwende gegenüber 0045 („kein `inline`-Prop") sauber begründet | 0046 nennt die Umkehr offen (Ziel, Z. 14–29) und 0045 vermerkt sie in seiner Abnahme (`0045-progress.md:187–194`). Der Grund trägt: `bd1eb6a` löscht netto mehr als es anlegt (zwei CSS-Klassen und das Handlayout in `StepRail` weg, ein `boolean` dazu), und `docs/design-guidelines.md:449` führt die Erweiterung nach. Einschränkung: der zweite Aufrufer, der die Umkehr begründet (Gruppenkopf von `TodoList`), steht nicht im Repo — `grep -rn "<Progress" src` findet als `inline`-Aufrufer allein `StepRail.tsx:227` und die Story. Die Spec bezeichnet ihn selbst als „Probe"; der Fall ist in `Progress.stories.tsx:147–153` nachgestellt. | ✓ |

**Abgenommen von / am:** zweiter Agent (nicht der bauende), 2026-09-03; Nachprüfung der einen nachgebesserten Zeile (`fd84283`) am selben Tag, durch denselben Abnehmenden.

### Offene Punkte

1. ~~Deutscher Codekommentar in `Progress.stories.tsx:148`.~~ **Erledigt** mit
   `fd84283`, am 2026-09-03 nachgeprüft: Kommentar englisch, `pnpm typecheck`
   erneut Exit 0, Story `--inline` im Browser unverändert (vier Inline-Blöcke,
   Label je vorn, Balken 316/316/316/120 px, kein Kommentartext im DOM). Damit
   steht jede Zeile der Tabelle auf ✓.
2. **Zweiter Aufrufer fehlt noch.** `inline` hat im Repo genau einen
   produktiven Aufrufer (`StepRail.tsx:227`). Der `TodoList`-Gruppenkopf, mit
   dem 0046 die Umkehr von 0045 begründet, ist bisher Probe und Story; er wird
   laut Nachbesserung unten mit 0050 echt. Kein Mangel dieser Aufgabe, aber
   der Grund steht erst, wenn er gebaut ist.
3. **Kein `role="progressbar"`.** Unverändert wie in 0045 (dort Anmerkung 1):
   solange das Label steht — und in der Inline-Form steht es immer direkt
   davor — liest ein Screenreader den Stand als Text.

## Nachbesserung (2026-09-03)

Das einzige ✗ der ersten Abnahme ist behoben: der deutsche JSX-Kommentar in
`Progress.stories.tsx:148` steht jetzt englisch. Sonst nichts geändert —
Status zurück auf `Abnahme` zur Nachprüfung dieser einen Zeile.

Der offene Punkt des Abnehmenden bleibt stehen und ist richtig: `inline` hat
im Repo produktiv genau einen Aufrufer (`StepRail.tsx:227`); der zweite Fall,
der die Kehrtwende begründet, ist der Gruppenkopf von `TodoList` und lebt
bisher nur als Probe und Story. Er wird echt, sobald 0050 die
Sachverhaltsansicht baut.
