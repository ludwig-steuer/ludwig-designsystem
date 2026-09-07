# 0072 · `InvoiceLineRow`

| | |
|---|---|
| Status | in Arbeit |
| Freigabe | 2026-09-07, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
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
  `Confidence` (0078). **Keine Datums- und keine Zähl-Formatierung:** die
  Zeile zeigt kein Datum (`formatDate` gibt es nicht und wird nicht
  gebraucht), und `formatCount` rundet auf ganze Zahlen — für die Menge
  (2,5 h) ist das falsch. Menge und Einzelpreis laufen über `Amount` bzw.
  `formatAmount(value, null)`; der USt-Satz steht als `${taxRatePercent} %`
  in einer `v2num`-Zelle.

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
(Befund **L-201**); die heutige Kopfzeile führt sie als fünfte von sieben und zeigt
in jeder Zeile „—". Sie kommt erst wieder, wenn ein Wert darin steht.

Der Streifen darunter, in dieser Reihenfolge:

| Was | Rang | Wann sichtbar |
|---|---|---|
| Verwendungsart (`fundUsageNature`) | 10 | **immer** — sie steht heute schon in der kompakten Zeile |
| Konfidenz (`fundUsageConfidence` → `confidenceLevel`) | 15 | **immer**, als `Confidence` mit `level` und `value` (Achse `konfidenz`) |
| Herkunft (`source`) | 8 | nur wenn ≠ `extracted` (98 % sind der Normalfall) |
| Deaktiviert (`disabled`) | 9 | nur wenn `true` (16 von 726) — die Zeile wird zusätzlich gedämpft |
| USt-Sonderfall (`vatSpecialCase`) | 12 | nur wenn ≠ `none` (116 von 726) |
| Sonderart (`lineSpecialType`) | 13 | nur wenn ≠ `none` (262 von 726) |

Vier davon sind **Zustände ohne Registry-Achse** (Befund **L-99**). Sie tragen
deshalb kein `StatusBadge` und keine Farbe als Kritikalitätsstufe, sondern ein
neutrales `Badge` mit Wort — V6/V7 bleiben gewahrt, weil jedes Badge sein Wort
selbst trägt.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `line` | `InvoiceLineItem` | ja | die Position, unverändert aus `src/ludwig/modules/invoices/domain/invoice.ts` | `Standard` |
| `labels` | `InvoiceLineLabels` | ja | die deutschen Wörter der vier Wertebereiche — solange L-99 offen ist, kommen sie von außen | `Deviations` |
| `open` | `boolean` | nein | aufgeklappt; ohne die Prop entscheidet die Zeile selbst | `Expanded` |
| `onOpenChange` | `(open: boolean) => void` | nein | meldet das Auf- und Zuklappen an die Liste | `Expanded` |
| `children` | `ReactNode` | nein | was im Aufklapper steht — die Liste steckt `InvoiceLineFacts` (0114) hinein. Fehlt es, hat die Zeile **keinen** Aufklapp-Knopf | `Standard` (ohne) · `Expanded` (mit) |

```ts
/**
 * The German words for the four value ranges the line shows as a badge.
 * They arrive as a prop because none of them has a registry axis yet
 * (finding L-99) and R1 forbids a local label map. A value without a word is
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
`confidenceLevel`/`ConfidenceLevel` (`shared/confidence.ts`). GLOSSARY: die
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

**Der Streifen ist die dritte Zeile der Bezeichnungs-Zelle**, keine eigene
Tabellenzeile und kein neues Layout-CSS: unter `itemName` und
`productDescription` stehen die Badges in derselben Zelle, und die Tabelle
läuft mit `density="wide"`. So bleibt die Spaltenordnung unberührt und die
Zeile eine Zeile.

**Die Spuren:** sechs Datenspalten, dazu die Chevron-Spur
`var(--v2-tbl-pick)` — **nur wenn `children` gesetzt sind**. Ohne sie gibt es
keinen Aufklapper und also auch keine Spur dafür. Die Kopfzeile der Liste
trägt an dieser Stelle eine leere Kopfzelle, wie `DataTable` es tut
(`DataTable.tsx:243`).

**Alle Beträge sind EUR.** Die `*_value`-Felder der Position sind in
Belegwährung umgerechnet EUR (GLOSSARY *Transaction currency*), und
`InvoiceLineItem` hat keine Währungsspalte. Der Fremdwährungs-Spiegel gehört
den Fakten (Rang 22, 0114), nicht der Zeile.

**Fehlt die Bezeichnung** (`itemName === null`), nimmt die Zeile die erste
Zeile von `productDescription`; fehlt auch die, steht dort „Position n" mit
der Positionsnummer. Eine namenlose Zeile darf nicht namenlos aussehen.

Eine deaktivierte Zeile (`disabled`) wird gedämpft **und** trägt das Wort
„deaktiviert" — Farbe allein sagt es nicht (V7). Sie verschwindet nicht: sie
bleibt für den Audit-Trail sichtbar, so wie der Spaltenkommentar es verlangt.

Fehlt zu einem Wert das Wort in `labels`, zeigt die Zeile den Rohwert. Das ist
Absicht: heute zeigt die App für 92 Zeilen den englischen Schlüssel, weil ihre
lokale Map die echten Werte nicht trifft (Befund **L-203**) — ein stiller
Ausfall wäre schlimmer als ein sichtbarer.

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
| `Edges` | Bezeichnung mit 251 Zeichen (max), Einheit als `Stck` neben `STK` (23 Schreibweisen im Bestand), ein Wertebereich **ohne** Wort in `labels`, und eine Position ganz ohne `itemName` |
| `InUse` | drei Zeilen unter einer Kopfzeile in `Table`, wie im Reiter „Positionen" |

Nicht anwendbar: `Leer` — eine Zeile ohne Position gibt es nicht, der Leerfall
gehört der Liste (0115). `Laedt` und `Fehler` — die Zeile lädt nichts; der
Reiter, in dem sie steht, wird erst geladen, wenn man ihn öffnet.

## Offene Fragen

Keine mehr offen — die drei, die beim Schreiben blieben, sind mit der Freigabe
vom 2026-09-07 entschieden:

1. **Wo steht der Streifen?** Als dritte Zeile in der Bezeichnungs-Zelle,
   Tabelle mit `density="wide"`. Kein neues Layout-CSS, keine zweite
   Tabellenzeile je Position.
2. **Welche Währung?** Immer EUR. Die `*_value`-Felder sind EUR (GLOSSARY
   *Transaction currency*), `InvoiceLineItem` hat keine Währungsspalte; der
   Fremdwährungs-Spiegel gehört den Fakten (0114).
3. **Was steht da, wenn `itemName` fehlt?** Die erste Zeile von
   `productDescription`, sonst „Position n".

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Die vier Wertebereiche als Registry-Achsen statt als `labels`-Prop | `labels` fällt ersatzlos weg | Befund **L-99**/L-99 ist gelöst — dann liest die Zeile die Wörter selbst |
| Der Sprung von der Position zum Buchungsvorschlag | `onOpenProposal?: (position: number) => void` | ein Screen verlangt den Weg; heute hängt der Vorschlag an der Rechnung, nicht an der Zeile |
| Rabatt als achte Spalte | `line.lineDiscountValue` wird gezeigt | in `line_discount_value` steht ein Wert (Befund **L-201**) |

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
- [ ] Der Streifen ist die dritte Zeile **derselben** Zelle wie die Bezeichnung, nicht eine zweite Tabellenzeile (Story `Standard`, gemessen: eine `<tr>` je Position)
- [ ] Ohne `children` fehlt die Chevron-Spur ganz, mit `children` ist sie `var(--v2-tbl-pick)` breit (Stories `Standard` und `Expanded`, gemessen)
- [ ] Fehlt `itemName`, steht die erste Zeile von `productDescription` da, sonst „Position n" (Story `Edges`, gemessen)
- [ ] Die Menge zeigt Nachkommastellen (2,5 h), wird also nicht gerundet (Story `Standard`, gemessen)
- [ ] `open`/`onOpenChange` klappen von außen auf und melden zurück; ohne beide klappt die Zeile selbst (Story `Expanded`, gemessen — nicht am State abgelesen, sondern am gerenderten Aufklapper)
- [ ] Ohne `children` hat die Zeile keinen Aufklapp-Knopf (Story `Standard`, gemessen)
- [ ] Eine deaktivierte Zeile ist gedämpft **und** trägt das Wort (Story `Deviations`)
- [ ] Die Beschreibung wird ab 81 Zeichen gekürzt, die Bezeichnung nicht (Story `Edges`, gemessen bei 251 Zeichen)
- [ ] Die Spurbreiten sind gegen den **Wertebereich** gemessen, nicht gegen die Fixtures: Bezeichnung p90 93 / max 251 Zeichen, Menge bis fünf Stellen plus Einheit — bei 1280 px und 1600 px nachgemessen, Zeilenhöhe unverändert
- [ ] `ExpandableRow` verhält sich ohne die neuen Props wie zuvor (Story von 0057/0106, gemessen)
- [ ] Ersetzt die Karte je Position in `PositionenTab` ohne Funktionsverlust — außer den drei Zweigen, die dort nie rendern (**L-202**)

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Freigabe (2026-09-07, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Ränge, Relationen und „ersetzt" wörtlich aus dem Profil; die drei Entscheidungen des Autors tragen: `labels` als ein Prop mit Rohwert-Rückfall (R1, Präzedenz L-96), kontrolliertes Paar `open`/`onOpenChange` an `ExpandableRow` (§3 Regel 2, zweiter Abnehmer `DataTable.expand`), nichts bauen, was gemessen leer ist. Entscheide zu den abgeleiteten Fragen: der Streifen liegt als dritte Zeile in der Bezeichnungs-Zelle (`density="wide"`), kein neues Layout-CSS · die Zeile ist immer EUR (GLOSSARY *Transaction currency*: die `*_value`-Felder sind EUR, `InvoiceLineItem` hat keine Währungsspalte) — hinschreiben · `itemName` bei `null`: erste Zeile von `productDescription`, sonst „Position n".

Vor dem Bau in die Spec: (a) Typ-Satz: `confidenceLevel`/`ConfidenceLevel` aus `src/ludwig/shared/confidence.ts` statt `confidenceBand` — `Confidence` nimmt `level` (Achse `konfidenz`), `value` zeigt den Prozentwert; (b) „Setzt auf": `formatDate` gibt es nicht und die Zeile zeigt kein Datum; `formatCount` rundet auf ganze Zahlen — für `quantity` (2,5 h) `formatAmount(q, null)` bzw. `Amount currency={null}`; USt-Satz als `${taxRatePercent} %` in `v2num`; (c) Spaltenzahl vereinheitlichen: sechs Datenspalten plus Chevron-Spur `var(--v2-tbl-pick)` nur mit `children`, `InUse` mit der leeren Kopfzelle wie `DataTable.tsx:243`; (d) Streifen-Ort und EUR-Regel als Satz in „Verhalten"; in `Edges` „Fremdwährung" streichen (Rang 22 ist Fakten-Sache); (e) Befund-Nummern: B4/B5/B6 → L-201/L-202/L-203; (f) Abschnitt „Offene Fragen" mit den drei Entscheiden oben nachtragen (Skill §8.4).

Familie: Typen aus `InvoiceLineItem` (Spiegel) und `InvoiceLineLabels` in einer Datei `entities/invoice-line/invoice-line.ts`, dazu `fixtures.ts` mit den 22 Positionen für alle drei Story-Dateien. Gedämpfte Zeilen brauchen eine eigene Klasse (`is-dimmed` gibt es nur an `.abn__step`) — Präfix vorher greppen.
