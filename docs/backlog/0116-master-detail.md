# 0116 · `MasterDetail` — die zwei Hälften und ihre Untergrenze

| | |
|---|---|
| Status | Abnahme |
| Stufe | `patterns/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: Liste und Detail, kein Fachwort |
| Quelle | Bestand (0001, aus der App geholt) · Abnahmen 0063 und 0050 vom 2026-09-07, die beide an derselben Stelle hingen |
| Ersetzt | — (der Baustein steht seit der Erstbestückung) |
| Spec von / am | Claude, 2026-09-07 — **nachgeschrieben**, nicht vorausgeschrieben |

## Warum es diese Datei gibt

`MasterDetail` trägt zwei Ansichten des Sets (`CaseDetailView` 0050,
`LedgerAccountView` 0063) und hatte **keine Spec**. Beide Abnahmen sind am
selben Tag über dieselbe Stelle gestolpert — die Randspalte hält ihre 440 px
bis zu jeder Breite —, und beide Male gab es keinen Ort, an dem das Verhalten
festgeschrieben stand. Diese Datei hält den heutigen Stand fest und die zwei
Entscheidungen, die aus den Abnahmen kamen. Sie schreibt nichts Neues vor.

## Was der Baustein tut

Zwei Hälften nebeneinander, Auswahl links, Arbeit rechts (`@when Picking from
a list, working on the selected item on the right`). `detailBreit` dreht das
Gewicht um: schmale Randspalte links (440 px), breite Arbeitsfläche rechts —
für Schritte, in denen rechts gearbeitet und links nur ausgewählt wird.

## Die zwei Entscheidungen vom 2026-09-07

**1. Die Untergrenze gehört dem Aufrufer.** Ohne eine fiel die Randspalte nie
zurück, und eine breite Tabelle daneben verlor ihre rechten Spalten in den
Querlauf (0063: die Haben-Spalte stand bei keiner Breite im Bild). Eine feste
Schwelle war aber genauso falsch — mit 1.080 px kippte 0050 bei 1280 px
Fensterbreite in die Einspaltigkeit, obwohl seine Fakten bei 484 px lesbar
sind. Deshalb `minDetail` (Vorgabe **620**, die kleinste Tabelle des Sets);
0050 gibt **484**.

Der Umbruch läuft über den Flex-Sockel, nicht über eine Container-Abfrage:
eine Abfrage bräuchte die Schwelle als Literal, und genau das war der Fehler.

**2. Beim Umbruch steht die Arbeitsfläche oben.** Vorher stand die Randspalte
über der Arbeitsfläche: wer in der Kontoansicht die Buchungen suchte,
scrollte erst an den Fakten vorbei. `flex-wrap: wrap-reverse` dreht die
Zeilenfolge — nebeneinander ändert es nichts, im Umbruch kommt die
Arbeitsfläche nach oben.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `list` | `ReactNode` | ja | die Auswahl-Hälfte | `Filled` |
| `detail` | `ReactNode` | ja | die Arbeits-Hälfte | `Filled` |
| `detailBreit` | `boolean` | nein | dreht das Gewicht um: 440 px links, der Rest rechts | `DetailBreit` |
| `minDetail` | `number` | nein | wie viel die Arbeitsfläche braucht, bevor die beiden umbrechen (nur mit `detailBreit`; Vorgabe 620) | `DetailBreit` |
| `style` | `CSSProperties` | nein | für den Aufrufer, der die Höhe setzt | — |

**Was er bewusst nicht tut:** die Auswahl führen (das tut `ListPane`), etwas
laden, oder die Reihenfolge der Hälften umkehren — wer links arbeiten will,
tauscht die Inhalte, nicht den Baustein.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in der Komponente
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen

Variabel (aus dieser Spec):

- [ ] Mit `detailBreit` und ohne `minDetail` brechen die Hälften unter **1.080 px** um (440 + 620 + Rinne), mit `minDetail={484}` unter **944** (Story `DetailBreit`, bei mehreren Breiten gemessen)
- [ ] **Im Umbruch steht die Arbeitsfläche oben**, die Randspalte darunter (gemessen: `top` des `detail` kleiner als `top` des `list`)
- [ ] Nebeneinander stehen beide **oben bündig** (gemessen: gleiche `top`)
- [ ] Ohne `detailBreit` bleibt das alte Verhalten (Raster, Liste links breit, Detail rechts 420 px, `position: sticky`)
- [ ] Die Untergrenze wirkt in beiden Aufrufern des Sets, ohne dass einer den anderen kippt (0050 und 0063, je in der `AppShell` bei 1280 und 1440 gemessen)

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
