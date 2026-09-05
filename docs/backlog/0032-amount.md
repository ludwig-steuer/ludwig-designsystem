# 0032 · Amount — ein Betrag, drei Größen, eine Regel

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, ein Geldbetrag ist fachfrei |
| Quelle | `ludwig/app` `docs/topics/web-ui-offen.md` **P24**, Ziel des Owners vom 2026-09-03 |
| Ersetzt | 7 Betrags-Formatierer (`fmtMoney` ×2, `fmtEuro`, `fmtEUR`, `fmtAmount`, `parseEuro`, `formatMoney`) und **47 Dateien** mit eigenem `Intl.NumberFormat(…currency)` |
| Blockiert | P3 (Zeitzone) geht mit 0033 auf; Kachel, Summenzeile und Fließtext bauen bis dahin jeden Betrag selbst |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Ein Betrag sieht in Ludwig an sieben Stellen verschieden aus, weil ihn sieben
Funktionen und 47 Dateien je einzeln formatieren. In der Tabelle gibt es
`AmountCell` — in **einer** Größe; die Kennzahl-Kachel, die Summenzeile und
jeder Fließtext bauen ihn selbst. Wer prüft, vergleicht Zahlen: dann müssen
sie gleich aussehen und untereinander fluchten.

## Einordnung

- **Wiederverwenden:** `AmountCell` ist die **Zelle** — rechtsbündig, mit
  `tone`, für die Tabelle. Sie bleibt und setzt künftig auf diesen Baustein
  auf; ihre Geometrie ist Zellen-Geometrie, nicht die eines Betrags im Satz.
- **Neu, weil:** Regel 3 — kein `@when` passt (der Betrag außerhalb einer
  Zelle hat keinen), kein Fachwort, 47 belegte Dateien.
- **Zuschnitt:** eine Datei, ein Export. Die reinen Funktionen leben daneben
  in `src/ui/v3/format.ts` — sie werden auch ohne React gebraucht (Mailtext,
  CSV, Dateiname).
- **Setzt auf:** `Money`/`Currency` aus `src/ludwig/shared/money.ts`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `value` | `Money \| null` **oder** `number \| null` mit `currency` | ja | Der Betrag; `null` heißt „nicht bekannt", nicht 0 | `Sizes`, `Empty` |
| `currency` | `Currency` | nur bei blanker Zahl | Die Währung kommt aus dem Wert; wer eine nackte Zahl gibt, muss sie nennen | `Currencies` |
| `size` | `"sm" \| "md" \| "lg"` | nein | `sm` Zelle und Inline · `md` Zeile und Detail (Default) · `lg` Kachel und Summe | `Sizes` |
| `tone` | `CellTone` | nein | Kritikalität, wenn die **Zahl** ein Alarm ist — nie das Vorzeichen | `Tones` |
| `signed` | `boolean` | nein | Zeigt auch bei positiven Werten ein `+` (Abweichungen) | `Signs` |
| `title` | `string` | nein | Die Rechnung dahinter, als Tooltip | `InUse` |

`format.ts` liefert dazu `formatAmount(value, currency)` — dieselbe Regel
ohne React.

**Der Typ erzwingt die Währung:** `value: Money` bringt sie mit; `value:
number` verlangt `currency`. Einen stillen EUR-Default gibt es nicht — genau
der hat die 47 Kopien entstehen lassen.

**Kann bewusst nicht:** rechnen, umrechnen, runden (der Wert kommt gerundet),
parsen (das ist `parseAmount` in `AmountInput`, 0019).

## Verhalten

- Server-Component, keine Zustände.
- `de-DE`, immer zwei Nachkommastellen, `tnum` — Ziffern fluchten
  untereinander (T7, V3).
- **Vorzeichen ohne Farbe** (A7): ein Minus ist ein Zeichen, kein Alarm. Farbe
  bekommt der Betrag nur über `tone`, und die ist eine Aussage über die Zahl,
  nicht über ihr Vorzeichen.
- `null` rendert den Gedankenstrich, nie `0,00 €` — „nicht bekannt" und „null
  Euro" sind zwei Aussagen (dieselbe Regel wie in `AmountCell`).
- Größen: `sm` 12.5 px · `md` 13.5 px · `lg` 20 px, halbfett. Kein eigener
  Zeilenabstand — der Betrag fügt sich ein.

## Stories

Titel `v3/Primitives/Werte/Amount` — **neue Gruppe „Werte"** im Barrel, für
die Bausteine, die einen einzelnen Wert darstellen. Abgeleitet nach §6:
2 Zustände (gefüllt, leer) + 2 Enums (`size`, `tone`) + 0 Callbacks
+ 1 „im Einsatz" + 1 Rand = 6.

| Story | Beweist |
|---|---|
| `Sizes` | `sm`, `md`, `lg` untereinander — dieselbe Zahl, drei Rollen |
| `Signs` | negativ, positiv, `signed` — kein Vorzeichen trägt Farbe |
| `Tones` | `tone` färbt die Zahl, wenn sie ein Alarm ist |
| `Currencies` | `Money` in EUR und CHF, dazu die nackte Zahl mit `currency` |
| `Empty` | `null` ist ein Gedankenstrich, kein `0,00 €` |
| `InUse` | in `KpiTile`, in einer Summenzeile und im Fließtext |

Nicht anwendbar: `LeerNachFilter`, `Laedt`, `Fehler` — ein Betrag ist da oder
nicht.

## Abnahme

Abgenommen am 2026-09-05 von einem zweiten Agenten (nicht dem bauenden).
Geprüfter Stand: `e3c38e7`; `Amount.tsx`, `Amount.stories.tsx` und `format.ts`
sind im Arbeitsbaum unverändert. Gebaut in `a0636f7` („P24 umgesetzt: ein
Formatter-Modul, zwei Werte-Bausteine"). Storybook-Nachweise vom laufenden
Server auf Port 6107, gemessen in einer eigenen Chromium-Instanz
(1280 × 900) über `getComputedStyle` und DOM-Proben — die MCP-Sitzung war von
einer parallelen Abnahme belegt.

### Story-Deckung

`index.json` listet genau sechs Einträge unter `v3/Primitives/Werte/Amount`:
`--sizes`, `--signs`, `--tones`, `--currencies`, `--empty`, `--in-use` — die
Zahl der Ableitung (2 Zustände + 2 Enums + 1 „im Einsatz" + 1 Rand = 6).
Jede Prop hat ihren Nachweis: `value` (`Sizes`, `Empty`), `currency`
(`Currencies`, inklusive `currency={null}` für die Zahl ohne Währung), `size`
(`Sizes`), `tone` (`Tones`), `signed` (`Signs`), `title` — der steht in
`Tones` (`Amount.stories.tsx:65`, im DOM als `title="Differenz zum Beleg:
1.249,90 €"` geprüft), nicht in `InUse`, wie die Schnittstellen-Tabelle sagt.
Der Nachweis ist da, nur an anderer Stelle. `LeerNachFilter`, `Laedt`,
`Fehler` sind oben begründet ausgeschlossen.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, Exit 0, zu Beginn und am Ende der Abnahme. `pnpm build` bewusst **nicht** gelaufen (parallele Abnahmen schreiben nach `storybook-static`); der Lauf für diesen Stand war grün — „Storybook build completed successfully". | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/Amount.tsx` und `Amount.stories.tsx` liegen nebeneinander; `Amount.stories.tsx:9` setzt `title: "v3/Primitives/Werte/Amount"`. Barrel: Gruppenkommentar „Werte" in `src/ui/v3/index.ts:132`, Export `:133`. Die Gruppe ist neu, wie die Spec sie fordert. | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Ein Export in der Datei: `Amount` (`Amount.tsx:43`), `@when` Z. 38, `@instead` Z. 39–41. Props, Typen und Kommentare englisch; deutsch nur in Story-Doks und im Nutzertext. Siehe Anmerkung 1 zu `format.ts`. | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\b\|[0-9]+px" src/ui/v3/primitives/Amount.tsx src/ui/v3/format.ts` → keine Treffer. Maße in `src/styles/v3.css:2017–2024`, Farbe über `v2num--<tone>`. Kein Status, keine Label-Map — `tone` ist eine Kritikalitätsstufe, kein Zustandsname. | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Siehe „Story-Deckung": sechs von sechs, Ausschlüsse begründet. | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Punkt für Punkt unter dieser Tabelle. | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle sechs Stories geöffnet, gemessen und als Screenshot gesehen. Konsole in fünf Stories leer; `--in-use` meldet vier React-Fehler „`<th>` cannot be a child of `<div>`" — Anmerkung 2. | ✓ |
| Eine nackte Zahl ohne `currency` ist ein **Typfehler** | Probe `src/__amount_typeprobe.tsx` mit `<Amount value={1249.9} />`, `npx tsc --noEmit` → `error TS2322: Type '{ value: number; }' is not assignable to type 'IntrinsicAttributes & AmountProps'`. Probe danach gelöscht. Der Union-Typ steht in `Amount.tsx:30–35`; `formatAmount` wirft zusätzlich zur Laufzeit (`format.ts:58`). | ✓ |
| Minus und Plus tragen dieselbe Farbe wie der Rest (A7) | Story `--signs`, `getComputedStyle().color` über alle fünf Beträge (`1.249,90 €`, `-1.249,90 €`, `+312,40 €`, `-312,40 €`, `0,00 €`): **fünfmal `rgb(45, 45, 45)`**. Kein Zweig in `Amount.tsx` liest das Vorzeichen. | ✓ |
| `null` rendert „—", nie `0,00 €` | Story `--empty`: erstes Element `v2amount v2amount--md v2muted` mit Text „—" in `rgb(92, 92, 92)`, daneben `0,00 €` in `rgb(45, 45, 45)` — zwei verschiedene Aussagen, zwei verschiedene Darstellungen. `format.ts:54` gibt bei `null` „—" zurück. | ✓ |
| Drei Größen, gleiche Ziffernbreite — untereinander fluchtend (V3) | Story `--sizes`, gemessen: `--sm` 12.5 px / 400, `--md` 13.5 px / 400, `--lg` 20 px / 600; `font-variant-numeric: lining-nums tabular-nums` in allen sechs Elementen. Die drei untereinander stehenden Beträge (1.249,90 € · 84,50 € · 42.108,55 €) enden **alle bei `right = 176 px`**. | ✓ |
| `AmountCell` setzt auf `Amount` auf, statt ein zweites Mal zu formatieren | `Cells.tsx:2` importiert `formatAmount`, `:49` ruft ihn („One formatter for the whole house (P24): the cell only adds its geometry"). Die Zelle rendert ihre eigene Zellen-Geometrie (`v2num`), nicht `<Amount>` — genau der Zuschnitt, den die Einordnung dieser Spec beschreibt. Anmerkung 3. | ✓ |
| `formatAmount` ist ohne React aufrufbar | `format.ts` hat genau einen Import, und der ist ein Typ: `import type { Currency, Money }` (`:1`). Headless ausgeführt: `npx tsx -e "…formatAmount(…)…"` → `1.249,90 € \| — \| +312,40 € \| 142,00`, dazu `react loaded? false`. | ✓ |

### Prüfliste §9, Punkt für Punkt

- **Stufe und Importe** — ✓ `primitives/`; importiert `../format` und den Typ
  `CellTone` aus `./Cells`, kein Pattern, keine Entität, kein Fachmodul.
- **Ersetzt ihr v1-Gegenstück (`@deprecated`)** — offen (App).
- **Kein Hex, kein px, keine Label-Map, kein Status-Text** — ✓ siehe Tabelle.
- **Text links, Zahlen rechts mit `tnum`, nichts zentriert (V3)** — ✓ für den
  Baustein: `tnum` gesetzt, `white-space: nowrap`, keine eigene Ausrichtung
  (die kommt vom Aufrufer, in `AmountCell` rechts). **Befund in der Story
  `--in-use`:** vier der fünf Spaltenköpfe messen `text-align: center`, siehe
  Anmerkung 2 — kein Fehler der Komponente.
- **Zeilenhöhe ≤ `.v2tbl__row`** — ✓ `--sm`/`--md` bringen keine eigene
  Zeilenhöhe mit; nur `--lg` setzt `line-height: 1.2`, und das ist die Kachel.
- **Farbe nur als Kritikalitätsstufe, Vorzeichen ohne Farbe** — ✓ gemessen:
  `tone` kennt die vier Stufen plus `muted`, das Vorzeichen färbt nie.
- **Jeder farbige Zustand hat Wort oder Icon (V7)** — ✓ mit Anmerkung: die
  Komponente färbt nur die Zahl; das Wort steht beim Aufrufer (Spaltenkopf,
  Kachel-Label). In `--tones` trägt der `danger`-Betrag zusätzlich den `title`
  mit der Rechnung dahinter.
- **Fünf Zustände** — ✓ gefüllt und leer gebaut, die drei übrigen begründet
  ausgeschlossen (ein Betrag ist da oder nicht).
- **Kontrast** — ✓ Text `#2D2D2D` auf Weiß; die Tone-Farben kommen aus
  `tokens.css` und tragen dort ihren Kontrastwert als Kommentar.
- **Tastatur / Hover** — nicht anwendbar: nichts ist bedienbar.
- **Icons** — nicht anwendbar: keine.
- **Karte** — nicht anwendbar: Primitive ohne eigene Fläche.
- **Texte T1–T5** — ✓ `de-DE`, zwei Nachkommastellen, keine Anrede, keine
  Versalien, kein Ausrufezeichen.
- **Story unter `v3/Primitives/Werte/Amount`** — ✓.
- **In §11 auf v2 gesetzt** — ✓ `docs/design-guidelines.md:420` führt
  `format.ts` + `Amount`/`Time` als „v2 (0032, 0033)"; die App-Seite steht
  dort ausdrücklich als offen.

### Anmerkungen des Abnehmenden

1. **`format.ts` trägt kein `@when`/`@instead`.** Die vier Funktions-Exporte
   (`formatAmount`, `formatTime`, `formatTimeFull`, `formatDuration`) sind
   über das Barrel öffentlich (`index.ts:136–143`) und haben JSDoc, aber
   nicht die zwei Zeilen. Das Nachbar-Primitive macht es anders:
   `parseAmount` in `AmountInput.tsx:25` ist ebenfalls eine reine Funktion
   und trägt sie. Nicht als Mangel gewertet, weil der Zuschnitt dieser Spec
   ausdrücklich „eine Datei, ein Export" für `Amount.tsx` sagt und `format.ts`
   daneben stellt — aber die Frage „nehme ich `Amount`, `AmountCell`,
   `AmountInput` oder `formatAmount`?" ist real und wäre genau dort greppbar
   zu beantworten. Nachzuholen, wenn `format.ts` ohnehin angefasst wird.
2. **`<th>`/`<td>` im `div`-Tisch — ein Befund für das Set, nicht für 0032.**
   `Table`/`HeadRow`/`Row` sind CSS-Grid-`div`s (`Table.tsx:102`, `:118`).
   `Amount.stories.tsx:126–139` füllt sie mit `<th>`/`<td>`. Folge: vier
   React-Fehler in der Konsole („cannot be a child of `<div>`", Hydrations-
   warnung) und — sichtbar — `text-align: center` auf den Spaltenköpfen
   „Beleg", „Kreditor", „Eingang", „Verarbeitung" aus dem UA-Stylesheet, ein
   V3-Verstoß. Betroffen sind **15 Story-Dateien** unter `src/ui/v3`, darunter
   bereits abgenommene (`AppShell`, `Toast`, `FilterBar`); 15 weitere Dateien
   machen es richtig mit `<div>` (so auch `DataTable`, `Log`,
   `ComparisonTable` im Produktivcode). Weil das eine Hauskonvention ist, die
   frühere Abnahmen passieren ließen, geht es als Befund an das Set und nicht
   als Mangel gegen diese Aufgabe.
3. **`AmountCell` behält den stillen `"EUR"`-Default.** `Cells.tsx:37` setzt
   `currency = "EUR"` und reicht ihn als `currency as never` an `formatAmount`
   (`:49`) — genau der Default, den diese Spec für `Amount` verbietet („Einen
   stillen EUR-Default gibt es nicht — genau der hat die 47 Kopien entstehen
   lassen"). `Amount` selbst ist sauber; die Typdisziplin endet an der Zelle.
   Eigene Aufgabe wert, wenn `AmountCell` das nächste Mal angefasst wird.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: keine
(die drei Anmerkungen sind Befunde, keine Mängel dieser Aufgabe)
