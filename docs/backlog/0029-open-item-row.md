# 0029 · OpenItemRow — DATEV-Offene-Posten als Zeile und Altersgruppe

| | |
|---|---|
| Status | in Arbeit — freigegeben 2026-09-06, Entscheide und Pflichtänderungen im Abschnitt „Freigabe" |
| Stufe | `entities/open-item/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein, ein offener Posten ist Buchhaltung |
| Quelle | Soll-Katalog §11.7 Stufe 3 „DATEV-OPOS — fehlt (§3.2 Nr. 1)"; `ui-repraesentationen.md` §3.1/§3.2 |
| Ersetzt | die Tabelle inline in `app/(app)/clients/[clientSlug]/[year]/opos/page.tsx` (297 Zeilen, Zeile 175–215) |
| Blockiert | Abnahme-Schritt 5, die OPOS-Seite, den Dubletten-Blick der Kanzlei |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Die Kanzlei sieht, was am Stichtag offen ist — und **wie lange schon**. Heute
rendert die OPOS-Seite ihre Tabelle selbst, mit lokalen Formatierern und
lokaler Label-Map für die Art; die Alters-Gruppierung, die den Blick erst
nützlich macht, gibt es gar nicht. Wer wissen will, was über 90 Tage
überfällig ist, zählt selbst.

## Einordnung

- **Wiederverwenden:** `Row` und `AmountCell` sind die Bausteine, aber die
  Spaltenfolge, die Alters-Ableitung und die Ausgleichs-Aussage sind
  Entitätswissen und gehören nicht in jede Seite.
- **Neue Entitäts-Form, weil:** Regel 5 — `ui-repraesentationen.md` §3.1
  führt „DATEV-Offene-Posten" ohne jede Darstellung und §3.2 stellt sie an
  Platz 1.
- **Zuschnitt:** Familie in einer Datei — `OpenItemRow` (der Posten) und
  `OpenItemAgeGroup` (die Altersklasse als `GroupRow`). Sie ergeben nur
  miteinander Sinn.
- **Setzt auf:** `Row`, `GroupRow`, `AmountCell`, `Timestamp`, `StatusBadge`
  (Achse Ausgleich), Mono-Zelle für Konto und Belegnummer.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `item` | `OpenItem` | ja | Ein Posten (Felder unten) | `Filled` |
| `currency` | `Currency` | nein | Währung der Beträge, Default `"EUR"` | `Filled` |
| `asOf` | `string` | ja | Stichtag — „offen" ist immer eine Aussage zu einem Datum | `Filled` |
| `onOpen` | `(id: string) => void` | nein | Sprung in den Sachverhalt; ohne die Prop ist die Zeile nicht klickbar | `Interactive` |

`OpenItemAgeGroup`: `bucket` (`"notDue" \| "d1_30" \| "d31_60" \| "d61_90" \| "d90plus"`),
`count`, `sum`, `currency`.

Felder aus `ludwig.client_datev_open_items`: `kind`, `personalAccount`,
`externalDocumentNumber`, `invoiceDate`, `dueDate`, `grossAmount`,
`openAmount`, `description`, `isCleared`, `dunningLevel`.
**Befund für `ludwig/app`:** in `src/ludwig/` gibt es dafür **keinen Typ** und
**keine Alters-Ableitung**. Beides gehört dorthin — ein `OpenItem`-Interface
und eine Funktion `openItemAgeBucket({ dueDate, asOf })`, analog zu
`expectationMaturity` in `modules/accounting-cases/domain/case.ts`. Die
Komponente rechnet die Klasse **nicht** selbst; bis die Funktion existiert,
nimmt sie den Bucket als Prop entgegen.

Was die Familie **nicht** kann: gruppieren (der Aufrufer sortiert und
gruppiert, sie stellt dar), Dubletten erkennen, mahnen.

## Verhalten

Server-Component ohne `onOpen`. Zahlen rechts mit `tnum`, Konto und
Belegnummer in `--font-mono`, Text links (V3). Der Ausgleichs-Stand kommt aus
der Registry, nie als lokaler Text (R1); „nach Stichtag ausgeglichen" ist ein
eigener Wert, kein Grauton von „offen". Ein Näherungswert (`amountApprox`)
trägt „≈" vor der Zahl und den Grund im `title`. Mit `onOpen` wird die Zeile
zur `ClickRow` mit Hover (I11).

## Stories

Titel `v3/Entitäten/Offene Posten/OpenItemRow`. Abgeleitet nach §6: 3 Zustände
(gefüllt, leer, Fehler) + 1 Callback + 1 „im Einsatz" + 1 Rand (lange
Buchungstexte, fehlende Felder) = 6.

| Story | Beweist |
|---|---|
| `Filled` | fünf Posten, Kreditor und Debitor gemischt |
| `Grouped` | vier Altersklassen mit Summe und Anzahl je Gruppe |
| `Empty` | „Keine offenen Posten zum 31.08.2026." |
| `Error` | Laden fehlgeschlagen, Wiederholen daneben |
| `Interactive` | Klick auf die Zeile öffnet den Sachverhalt |
| `Edges` | ohne Belegnummer, ohne Fälligkeit, Näherungsbetrag, langer Text |

Nicht anwendbar: `LeerNachFilter` — den Filter trägt die Seite (`FilterBar`, 0003).

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

- [ ] Beträge rechts mit `tnum`, Konto und Belegnummer mono (Story `Filled`, Regel V3)
- [ ] Der Ausgleichs-Stand kommt aus der Registry, kein lokaler Text (Blick in den Code, Regel R1)
- [ ] Die Altersklasse wird nicht in der Komponente gerechnet (Blick in den Code)
- [ ] Fehlende Felder zeigen „—", nie 0,00 € (Story `Edges`)
- [ ] Jede Gruppe nennt Anzahl **und** Summe (Story `Grouped`)
- [ ] Ersetzt die Tabelle in `opos/page.tsx` ohne Funktionsverlust

## Offene Fragen

1. Vier oder fünf Altersklassen? *Ohne Antwort: fünf — nicht fällig, 1–30,
   31–60, 61–90, über 90; das ist die DATEV-übliche Staffel.*
2. Gehört die Mahnstufe in die Zeile? *Ohne Antwort: ja, aber nur wenn > 0 —
   als Wort, nicht als Farbe.*
3. Zeigt die Gruppe auch die Zahl der Sachverhalte? *Ohne Antwort: nein,
   Anzahl Posten und Summe reichen.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Ist-Zustand exakt bestätigt (`opos/page.tsx` Z. 175–215, lokale `KIND_LABEL` und `AUSGLEICH_LEGEND`). Die Achse „Ausgleich" liefert die App über L-66 (Punkt 2 ihres laufenden Plans); bis dahin baut die Zeile die Spalte über `StatusBadge` gegen den Achsennamen aus L-66 und wird erst abgenommen, wenn der Spiegel die Achse führt — keine lokale Achse (0080).

Entscheide: 1 fünf Klassen, Union zeichengleich in L-05: `notDue | d1_30 | d31_60 | d61_90 | d90plus` · 2 Mahnstufe als Wort nur > 0, bei `null` „—" · 3 keine Sachverhalts-Zahl in der Gruppe. Zuschnitt: Row + `OpenItemAgeGroup` bleiben (Gruppierung ist der Job, `DataTable` gruppiert nicht), `StatusHeader` auf der Ausgleich-Spalte; `openItemColumns` erst, wenn `opos/page` auf `DataTable` wandert.

Vor dem Bau in die Spec: L-66 zitieren mit Übergangsregel; `Blockiert` auf `[year]/opos` und den Dubletten-Blick kürzen, Schritt 5 raus (der steht auf Erwartungen, 0025); Feldliste berichtigen — `dunning_level` ist optional im VM `OpenItemLine`, `openAtStichtag`/`clearedAfterStichtag`/`amountApprox` sind Felder des Seiten-VMs `OposStichtagItem`; `Timestamp` → `Time`.

Befunde ins Register: **L-73** — L-05 gehört zu `datev-truth`, nicht `accounting-cases`, und das Modul braucht ein `domain/`; Bucket-Union wie oben festschreiben; L-66 um 0029 als Wartenden ergänzen.
