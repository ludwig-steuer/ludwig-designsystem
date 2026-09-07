# 0072 · `InvoiceLineRow`

| | |
|---|---|
| Status | spec |
| Stufe | `entities/invoice-line/` — eigene Entitäts-Familie, nicht Teil von `entities/source-document/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: USt-Sonderfall, Verwendungsart und Steuerschlüssel-Kandidaten sind Ludwig-Fachbegriffe |
| Quelle | Entitätsprofil `docs/entitaeten/invoice-line.md` (Status `geprüft`, 726 Zeilen aus Staging) — Datenpunkte, Ränge und „ersetzt" stammen von dort |
| Ersetzt | die Karte je Position in `PositionenTab` (`modules/invoices/ui/tabs`, 770 Z.) |
| Blockiert | 0115 (`InvoiceLineList`) und damit den Reiter „Positionen" in 0071 |
| Spec von / am | Claude, 2026-09-07 (Skill `spec-schreiben`) |

> **Diese Datei war der Sammelauftrag für die ganze Familie.** Das geprüfte
> Profil schneidet sie in drei Formen; jede bekommt ihre eigene Datei, wie es
> `CLAUDE.md` verlangt: **0072** die Zeile, **0114** die Fakten, **0115** die
> Liste. Bau-Reihenfolge: 0072 → 0114 → 0115. Der Sammelauftrag nannte unter
> „Ersetzt" auch `VorsteuerTab` — das ist falsch und hier gestrichen: der
> Reiter greift nachweislich nicht auf `lineItems` zu, er gehört der Rechnung,
> nicht der Position.

## Ziel

Eine Position einer Rechnung als Tabellenzeile: was geliefert wurde, wie viel
davon, zu welchem Preis, mit welcher Umsatzsteuer — und **wie Ludwig sie
eingeordnet hat**. Die Sachbearbeiterin prüft einen Kontovorschlag und sucht
die eine Zeile, die falsch liegt; dafür muss die Einordnung in der Zeile
stehen, nicht im Aufklapper. Heute leistet das `PositionenTab` in einer
770-Zeilen-Datei, die Zeile, Sub-Streifen, Aufklapper und drei Untertabellen
zugleich ist.

## Einordnung

- **Wiederverwenden:** `ExpandableRow` (`@when A small extra detail for a row
  that is read and collapsed again`) ist genau der Aufklapper, den die Position
  braucht — die Fakten werden gelesen und wieder zugeklappt, nicht bearbeitet.
  `Amount`/`AmountCell` für jede Zahl, `Badge` für die Abweichungen, `LongText`
  für die Beschreibung, `Confidence` (0078, fertig) für die Konfidenz der
  Verwendungsart. Keine dieser Komponenten deckt die Zeile allein.
- **Neu, weil:** `spec-schreiben` §3 Nr. 5 — `ui-repraesentationen.md` führt
  für die Rechnungsposition heute genau eine Komponente, und keine vorhandene
  Form deckt sie ab.
- **Erweitert:** `ExpandableRow` klappt heute nur **unkontrolliert** auf
  (`defaultOpen`). Die Liste (0115) besitzt einen Umschalter, der **alle**
  Zeilen zugleich auf- und zuklappt — das geht mit `defaultOpen` nicht. Nach
  §3 Nr. 2 kommt deshalb ein kontrolliertes Paar dazu: `open?: boolean` und
  `onOpenChange?: (open: boolean) => void`. Ohne beide bleibt das heutige
  Verhalten unverändert. Das ist eine Designentscheidung, die wiederkommt
  (jede Liste mit „alles aufklappen"), und sie steht in einem Halbsatz der
  `@when`-Zeile.
- **Zuschnitt:** eine Datei `InvoiceLineRow.tsx`. Die Fakten sind **nicht**
  Teil dieser Datei — sie werden woanders allein gebraucht (0114 hat ihr
  eigenes `@when`) und kommen als `children` in den Aufklapper.
- **Setzt auf:** `ExpandableRow`, `Row`, `AmountCell`, `Badge`, `LongText`,
  `Confidence`, `formatCount`/`formatDate` aus `format.ts`.

## Was in der Zeile steht

Die Ränge des Profils bis Größe S, in derselben Reihenfolge. Sieben Spalten im
Raster, darunter ein Streifen mit dem, was Ludwig aus der Zeile gemacht hat:

| Spalte | Rang | Datenpunkt | Ausrichtung |
|---|---|---|---|
| Pos. | 3 | `position` als `#1` | links, `tnum` |
| Bezeichnung | 1, 4 | `itemName` fett, darunter `productDescription` klein, gekürzt ab **81 Zeichen** (p90) | links |
| Menge | 6 | `quantity` + `unit` in **einer** Zelle | rechts, `tnum` |
| Einzelpreis | 7 | `unitPriceValue` | rechts, `tnum` |
| USt-Satz | 5 | `taxRatePercent` | rechts, `tnum` |
| Netto-Summe | 2 | `lineTotalNetValue`, betont | rechts, `tnum` |

**Keine Rabatt-Spalte.** `lineDiscountValue` ist in 726 von 726 Zeilen leer
(Befund B4); die heutige Kopfzeile führt sie als fünfte von sieben und zeigt
in jeder Zeile „—". Sie kommt erst wieder, wenn ein Wert darin steht.

Der Streifen darunter, in dieser Reihenfolge:

| Was | Rang | Wann sichtbar |
|---|---|---|
| Verwendungsart (`fundUsageNature`) | 10 | **immer** — sie steht heute schon in der kompakten Zeile |
| Konfidenz (`fundUsageConfidence` → `confidenceBand`) | 15 | **immer**, als `Confidence` mit der Achse `konfidenz` |
| Herkunft (`source`) | 8 | nur wenn ≠ `extracted` (98 % sind der Normalfall) |
| Deaktiviert (`disabled`) | 9 | nur wenn `true` (16 von 726) — die Zeile wird zusätzlich gedämpft |
| USt-Sonderfall (`vatSpecialCase`) | 12 | nur wenn ≠ `none` (116 von 726) |
| Sonderart (`lineSpecialType`) | 13 | nur wenn ≠ `none` (262 von 726) |

Vier davon sind **Zustände ohne Registry-Achse** (Befund B2). Sie tragen
deshalb kein `StatusBadge` und keine Farbe als Kritikalitätsstufe, sondern ein
neutrales `Badge` mit Wort — V6/V7 bleiben gewahrt, weil jedes Badge sein Wort
selbst trägt.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `line` | `InvoiceLineItem` | ja | die Position, unverändert aus `src/ludwig/modules/invoices/domain/invoice.ts` | `Standard` |
| `labels` | `InvoiceLineLabels` | ja | die deutschen Wörter der vier Wertebereiche — solange B2 offen ist, kommen sie von außen | `Deviations` |
| `open` | `boolean` | nein | aufgeklappt; ohne die Prop entscheidet die Zeile selbst | `Expanded` |
| `onOpenChange` | `(open: boolean) => void` | nein | meldet das Auf- und Zuklappen an die Liste | `Expanded` |
| `children` | `ReactNode` | nein | was im Aufklapper steht — die Liste steckt `InvoiceLineFacts` (0114) hinein. Fehlt es, hat die Zeile **keinen** Aufklapp-Knopf | `Standard` (ohne) · `Expanded` (mit) |

```ts
/**
 * The German words for the four value ranges the line shows as a badge.
 * They arrive as a prop because none of them has a registry axis yet
 * (finding B2) and R1 forbids a local label map. A value without a word is
 * shown raw — visibly wrong beats silently gone.
 */
export interface InvoiceLineLabels {
  source: Readonly<Record<string, string>>;
  fundUsageNature: Readonly<Record<string, string>>;
  lineSpecialType: Readonly<Record<string, string>>;
  vatSpecialCase: Readonly<Record<string, string>>;
}
```

Typen aus `src/ludwig/`: `InvoiceLineItem` (`modules/invoices/domain/invoice.ts`),
`confidenceBand`/`ConfidenceBand` (`shared/confidence.ts`). GLOSSARY: die
Entität hat **keinen** eigenen Eintrag (Befund B1) — bis dahin gilt der
englische Name `invoice line`.

**Was die Zeile bewusst nicht kann:** nichts ändern. Kein Punkt der Position
hat `änderbar = Nutzer` — nachgeprüft, in `apps/web/src` gibt es auf
`clientInvoiceLineItems` kein `insert`, `update` oder `delete`. Eine falsche
Einordnung wird am Buchungssatz korrigiert (`JournalEntryEditor`, 0015), nicht
hier. Und sie rechnet nichts: die Summe über die Zeilen gehört der Liste.

## Verhalten

Server-Component, bis `onOpenChange` oder der eigene Aufklapp-Zustand gebraucht
wird — `ExpandableRow` trägt `"use client"`, die Zeile selbst kommt ohne aus,
solange sie nur rendert. **Tastatur:** der Aufklapp-Knopf ist ein `<button>`,
also mit Enter und Leertaste bedienbar; keine eigene Taste, weil die Zeile in
einer Liste steht und ein Kürzel je Zeile keinen Sinn ergibt (V14: lieber
keins als eins ohne Wirkung).

Eine deaktivierte Zeile (`disabled`) wird gedämpft **und** trägt das Wort
„deaktiviert" — Farbe allein sagt es nicht (V7). Sie verschwindet nicht: sie
bleibt für den Audit-Trail sichtbar, so wie der Spaltenkommentar es verlangt.

Fehlt zu einem Wert das Wort in `labels`, zeigt die Zeile den Rohwert. Das ist
Absicht: heute zeigt die App für 92 Zeilen den englischen Schlüssel, weil ihre
lokale Map die echten Werte nicht trifft (Befund B6) — ein stiller Ausfall
wäre schlimmer als ein sichtbarer.

## Stories

Abgeleitet nach `spec-schreiben` §6: 1 Zustand (gefüllt) + 1 je Enum-Prop (die
vier Wertebereiche zusammen in `Deviations`) + 1 je Callback (`Expanded`) +
1 „im Einsatz" + 1 Rand (die Zeile kürzt und formatiert) + 1 für den
häufigsten Fall = **6**. Titel `v3/Entitäten/Rechnungsposition/InvoiceLineRow`.

| Story | Beweist |
|---|---|
| `Standard` | Normalfall: sieben Spalten, Verwendungsart und Konfidenz im Streifen, kein Aufklapp-Knopf ohne `children` |
| `Minimal` | der häufigste Fall — **die Hälfte aller Rechnungen hat genau eine Position**; ohne Menge, ohne Einheit (nur 19 % haben eine), ohne Beschreibung |
| `Deviations` | alle vier Wertebereiche zugleich: virtuelle Herkunft, deaktiviert, USt-Sonderfall, Sonderart — jedes Badge mit Wort |
| `Expanded` | Rundlauf über `open`/`onOpenChange` mit `useState`, Fakten als `children` |
| `Edges` | Bezeichnung mit 251 Zeichen (max), Einheit als `Stck` neben `STK` (23 Schreibweisen im Bestand), Fremdwährung, ein Wertebereich **ohne** Wort in `labels` |
| `InUse` | drei Zeilen unter einer Kopfzeile in `Table`, wie im Reiter „Positionen" |

Nicht anwendbar: `Leer` — eine Zeile ohne Position gibt es nicht, der Leerfall
gehört der Liste (0115). `Laedt` und `Fehler` — die Zeile lädt nichts; der
Reiter, in dem sie steht, wird erst geladen, wenn man ihn öffnet.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Die vier Wertebereiche als Registry-Achsen statt als `labels`-Prop | `labels` fällt ersatzlos weg | Befund B2/L-99 ist gelöst — dann liest die Zeile die Wörter selbst |
| Der Sprung von der Position zum Buchungsvorschlag | `onOpenProposal?: (position: number) => void` | ein Screen verlangt den Weg; heute hängt der Vorschlag an der Rechnung, nicht an der Zeile |
| Rabatt als achte Spalte | `line.lineDiscountValue` wird gezeigt | in `line_discount_value` steht ein Wert (Befund B4) |

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

- [ ] Die sechs Spalten stehen in der Reihenfolge der Ränge; **keine Rabatt-Spalte** (Story `Standard`, gemessen)
- [ ] Jede Zahl steht rechts mit `tnum`, jeder Text links, nichts zentriert (Story `Standard`, gemessen)
- [ ] Verwendungsart und Konfidenz stehen **immer** im Streifen, die vier übrigen Badges nur bei Abweichung (Stories `Standard` und `Deviations`, gemessen: in `Standard` zwei Badges, in `Deviations` sechs)
- [ ] Ein Wert ohne Wort in `labels` erscheint als Rohwert, nicht als leeres Badge (Story `Edges`, gemessen)
- [ ] `open`/`onOpenChange` klappen von außen auf und melden zurück; ohne beide klappt die Zeile selbst (Story `Expanded`, gemessen — nicht am State abgelesen, sondern am gerenderten Aufklapper)
- [ ] Ohne `children` hat die Zeile keinen Aufklapp-Knopf (Story `Standard`, gemessen)
- [ ] Eine deaktivierte Zeile ist gedämpft **und** trägt das Wort (Story `Deviations`)
- [ ] Die Beschreibung wird ab 81 Zeichen gekürzt, die Bezeichnung nicht (Story `Edges`, gemessen bei 251 Zeichen)
- [ ] Die Spurbreiten sind gegen den **Wertebereich** gemessen, nicht gegen die Fixtures: Bezeichnung p90 93 / max 251 Zeichen, Menge bis fünf Stellen plus Einheit — bei 1280 px und 1600 px nachgemessen, Zeilenhöhe unverändert
- [ ] `ExpandableRow` verhält sich ohne die neuen Props wie zuvor (Story von 0057/0106, gemessen)
- [ ] Ersetzt die Karte je Position in `PositionenTab` ohne Funktionsverlust — außer den drei Zweigen, die dort nie rendern (B5)

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
