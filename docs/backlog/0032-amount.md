# 0032 · Amount — ein Betrag, drei Größen, eine Regel

| | |
|---|---|
| Status | Abnahme |
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

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Eine nackte Zahl ohne `currency` ist ein **Typfehler** (Blick in den Code, `pnpm typecheck`)
- [ ] Minus und Plus tragen dieselbe Farbe wie der Rest (Story `Signs`, Regel A7)
- [ ] `null` rendert „—", nie `0,00 €` (Story `Empty`)
- [ ] Drei Größen, gleiche Ziffernbreite — untereinander fluchtend (Story `Sizes`, Regel V3)
- [ ] `AmountCell` setzt auf `Amount` auf, statt ein zweites Mal zu formatieren (Blick in den Code)
- [ ] `formatAmount` ist ohne React aufrufbar (Blick in `format.ts`)

## Offene Fragen

1. Soll `lg` fett oder halbfett sein? *Ohne Antwort: halbfett — eine Kachel
   ist eine Zahl, keine Überschrift.*
2. Gehört ein Tausenderpunkt in `sm`? *Ohne Antwort: ja, überall gleich; eine
   Zahl, die je nach Größe anders aussieht, ist zwei Zahlen.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
