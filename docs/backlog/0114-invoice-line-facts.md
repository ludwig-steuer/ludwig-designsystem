# 0114 · `InvoiceLineFacts`

| | |
|---|---|
| Status | in Arbeit |
| Freigabe | 2026-09-07, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/invoice-line/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Buchungsgegenstand, USt-Sonderbehandlung und DATEV-Steuerschlüssel sind Ludwig-Fachbegriffe |
| Quelle | Entitätsprofil `docs/entitaeten/invoice-line.md` (Status `geprüft`), Formen-Tabelle · Ränge 11, 14, 16–25 |
| Ersetzt | den Aufklapper in `PositionenTab` mit seinen fünf Blöcken und drei Untertabellen |
| Blockiert | 0115 (`InvoiceLineList`), die sie in die Zeile steckt |
| Spec von / am | Claude, 2026-09-07 (Skill `spec-schreiben`) |

## Ziel

Was die Zeile (0072) nicht mehr trägt: **womit Ludwig seine Einordnung
begründet**. Die Sachbearbeiterin hat in der Liste die eine Zeile gefunden,
die falsch aussieht, und will wissen, warum der Interpreter sie so eingeordnet
hat — Buchungsgegenstand, Begründung, USt-Sonderbehandlung samt Rechtsgrundlage
und die DATEV-Steuerschlüssel, die er vorschlägt.

Heute ist das der Aufklapper in `PositionenTab`: fünf Blöcke, drei
Untertabellen, in derselben 770-Zeilen-Datei wie Liste und Zeile.

## Einordnung

- **Wiederverwenden:** `FieldList` (`@when Master data and properties of an
  item, read-only`) trägt jeden Block; `tone="bare"` stellt die Zeilen frei,
  weil die Zeile schon der Rahmen ist. `LongText` kürzt die zwei langen
  Freitexte, `Amount` und `AmountCell` die Zahlen.
- **Neu, weil:** `spec-schreiben` §3 Nr. 5 — keine vorhandene Form deckt die
  Fakten einer Rechnungsposition ab; `FieldList` allein wüsste nicht, welche
  Felder wann erscheinen.
- **Zuschnitt:** eine Datei `InvoiceLineFacts.tsx`. Getrennt von der Zeile,
  weil sie ihr eigenes `@when` hat (die Zeile zeigt, was auf dem Beleg steht;
  die Fakten zeigen, was Ludwig daraus gemacht hat) und weil die Zeile ohne
  sie funktioniert.
- **Setzt auf:** `FieldList`, `LongText`, `Amount`, `Badge`, `formatDate` und
  `formatPercent` aus `format.ts`.

## Was die Fakten zeigen

Die Ränge des Profils ab 11, in Blöcken. **Ein Feld ohne Wert steht nicht
da** — kein „—", keine leere Zeile; das ist die Regel, an der die heutige
Rabatt-Spalte scheitert.

| Block | Felder (Rang) | Wann sichtbar |
|---|---|---|
| Buchungsklassifikation | Buchungsgegenstand (11, gekürzt ab **161** Zeichen), Begründung der Verwendungsart (17, gekürzt ab **169**) | wenn eins von beiden gesetzt ist — im Bestand 99 % |
| Umsatzsteuer | USt-Betrag (14), gesetzliche Grundlage (18), extrahierter USt-Satz (25) | je Feld einzeln; der extrahierte Satz **nur wenn er von `taxRatePercent` abweicht** |
| DATEV-Steuerschlüssel | Steuerschlüssel-Kandidaten (16) | sobald die Liste nicht leer ist — **eigener Block**, nicht mehr an den USt-Sonderfall gebunden |
| Beleg | Artikelnummer (19), Leistungsdatum (20) | je Feld einzeln |
| Fremdwährung | die vier `fx*`-Spiegel (22) | nur wenn gesetzt — 20 von 726 Zeilen |
| Hinweise | Zeilen-Notizen (23) | wenn nicht leer |
| Beleg-Kollaps | Kollaps-Entscheidung (24) | nur auf einer `virtual_aggregate`-Position — 9 von 726 |

**Der Steuerschlüssel-Block steht für sich.** Heute hängt er im Block
„USt-Sonderbehandlung" und wird nur gezeigt, wenn es einen Sonderfall gibt —
423 der 440 gefüllten Kandidatenlisten bleiben dadurch unsichtbar (Befund B5c).
Das ist ein Fehler in der Bedingung, kein Merkmal.

**Zwei Dinge werden nicht gebaut**, beide mit Messung statt Meinung:

- die Untertabelle „Alternative Kategorien (Historie)" — `historyCandidates`
  ist in **726 von 726** Zeilen ein leeres Array (B5a). Eine Untertabelle für
  Daten, die es nicht gibt, ist derselbe Fehler wie die Rabatt-Spalte.
- der **Rabatt** (Rang 21 im Profil) — 0 % gefüllt (B4). Er steht im Ausbau,
  nicht im Bau. Das ist die einzige Stelle, an der diese Spec vom Profil
  abweicht, und sie sagt hier, warum.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `line` | `InvoiceLineItem` | ja | die Position, unverändert aus `src/ludwig/modules/invoices/domain/invoice.ts` | `Standard` |
| `labels` | `InvoiceLineLabels` | ja | dieselben Wörter wie in 0072 — für USt-Sonderfall und Sonderart, die hier ihren **Wert** zeigen, nicht nur ihr Badge | `Standard` |
| `notes` | `readonly string[]` | nein | die Hinweise, vom Aufrufer aus den drei Notiz-Spalten zusammengesetzt (siehe Befund unten) | `Standard` |
| `collapse` | `readonly [string, string][]` | nein | der Audit-Trail des Beleg-Kollaps als Label/Wert-Paare, wie `FieldList` sie nimmt | `Aggregate` |
| `tone` | `"bare" \| "soft"` | nein | `bare` im Aufklapper der Zeile (Vorgabe), `soft` wenn die Fakten für sich stehen | `InUse` |

**Befund für `ludwig/app` (neu, B7):** `vatEvidence`, `vatNotes` und
`collapseDecisionJson` sind in `InvoiceLineItem` als `unknown` typisiert. Eine
Komponente kann `unknown` nicht darstellen, und eine eigene Struktur dafür wäre
genau die lokale Erfindung, die `spec-schreiben` §5 verbietet. Deshalb nimmt
diese Spec die drei als aufbereitete Props entgegen (`notes`, `collapse`) —
die **Darstellung** ist frei, die Struktur nicht. Sobald `src/ludwig/` einen
Typ dafür führt, fallen beide Props weg. Belegstellen (40 % nicht leer) und
USt-Notizen (68 %) sind damit heute nur über den Aufrufer erreichbar; die
typisierten `lineNotes` sind es in 1 % der Zeilen.

**Was die Fakten bewusst nicht können:** nichts ändern (kein Punkt der Position
hat `änderbar = Nutzer`), nichts nachladen, und keine Position mit einer
anderen vergleichen — dafür ist die Liste da.

## Verhalten

Server-Component: die Fakten rendern nur. Das Auf- und Zuklappen gehört der
Zeile (0072), das gemeinsame Aufklappen der Liste (0115).

Zustände: **gefüllt** und **fast leer** sind die beiden, die vorkommen. Ein
Block ohne Feld erscheint nicht; sind alle Blöcke leer, steht ein Satz statt
einer leeren Fläche („Zu dieser Position hat Ludwig nichts vermerkt.") — das
ist der Leerfall, nicht ein Fehlerfall: er kommt bei einer synthetisierten
Position (`virtual_fallback`) vor, die nichts als Zahlen hat.

## Stories

Abgeleitet nach `spec-schreiben` §6: 2 Zustände (gefüllt, leer) + 1 je
Layout-Prop (`tone`) + 1 „im Einsatz" + 1 Rand (die Form kürzt zwei
Freitexte) + 2 Ausprägungen mit eigenem Block (Aggregat, Fremdwährung) =
**7**. Titel `v3/Entitäten/Rechnungsposition/InvoiceLineFacts`.

| Story | Beweist |
|---|---|
| `Standard` | Normalfall: Klassifikation, Umsatzsteuer, Steuerschlüssel-Block, Beleg, Hinweise |
| `Sparse` | die synthetisierte Position ohne Klassifikation — der Satz statt der leeren Fläche |
| `TaxKeysWithoutSpecialCase` | Steuerschlüssel-Kandidaten **ohne** USt-Sonderfall: der Block erscheint (423 von 440 Zeilen im Bestand, heute unsichtbar) |
| `Aggregate` | die `virtual_aggregate`-Position mit dem Kollaps-Kasten |
| `ForeignCurrency` | der `fx*`-Block, der nur bei 20 von 726 Zeilen erscheint |
| `Edges` | Buchungsgegenstand mit 392 Zeichen (max), Begründung mit 295 — beide gekürzt; dazu ein extrahierter USt-Satz, der **abweicht**, damit die Klammer einmal zu sehen ist |
| `InUse` | im Aufklapper einer `InvoiceLineRow` (0072), `tone="bare"` — so, wie die Liste sie steckt |

Nicht anwendbar: `Laedt` und `Fehler` — die Fakten laden nichts, sie stehen im
Aufklapper einer Zeile, die schon da ist. `LeerNachFilter` — es wird nicht
gefiltert.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Belegstellen und USt-Notizen als eigene Blöcke | `notes`/`collapse` fallen weg, `line` trägt die Typen selbst | Befund B7 ist gelöst — `src/ludwig/` führt einen Typ für die drei JSONB-Spalten |
| Der Rabatt | `line.lineDiscountValue` wird gezeigt | in `line_discount_value` steht ein Wert (B4) |
| Alternative Kategorien | eine Untertabelle | `historyCandidates` ist irgendwo nicht leer (B5a) |
| Der Weg zum Buchungsvorschlag | `onOpenProposal?` an der Zeile (0072), nicht hier | ein Screen verlangt ihn |

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

- [ ] Ein Feld ohne Wert erscheint **nicht** — kein „—", keine leere Zeile (Story `Sparse`, gemessen: die Zahl der gerenderten Zeilen)
- [ ] Der Steuerschlüssel-Block erscheint ohne USt-Sonderfall (Story `TaxKeysWithoutSpecialCase`, gemessen)
- [ ] Der extrahierte USt-Satz erscheint nur bei Abweichung (Story `Edges`: da; `Standard`: nicht da — beides gemessen)
- [ ] Der Kollaps-Kasten erscheint nur auf `virtual_aggregate` (Story `Aggregate` gegen `Standard`, gemessen)
- [ ] Der `fx*`-Block erscheint nur bei gesetzten Werten (Story `ForeignCurrency` gegen `Standard`)
- [ ] Sind alle Blöcke leer, steht der Satz statt der leeren Fläche (Story `Sparse`, gemessen)
- [ ] Die zwei Freitexte werden bei 161 und 169 Zeichen gekürzt, nicht bei einer geratenen Zahl (Story `Edges`, gemessen)
- [ ] `tone="bare"` hat keinen Rahmen und keinen eigenen Innenabstand (Story `InUse`, bei 1280 px und 1600 px gemessen)
- [ ] Ersetzt den Aufklapper in `PositionenTab` ohne Funktionsverlust — außer der Historie-Tabelle und der Klammer „(extrahiert: …)", die dort nie rendern (B5)

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Freigabe (2026-09-07, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Ränge exakt nach der Formen-Tabelle; die Abweichung „Steuerschlüssel als eigener Block, nicht am USt-Sonderfall" trägt — sie ist im Profil (P12) entschieden, 423 von 440 Kandidatenlisten wären sonst unsichtbar. Historie-Untertabelle und Rabatt nicht bauen, Trigger im Ausbau. Entscheide: Währung des Fremdwährungs-Blocks als Prop `fxCurrency?: string` (Pflicht, sobald ein `fx*`-Wert gesetzt ist; Quelle `InvoiceDetail.fxCurrency` — `Amount` wirft bei nackter Zahl) · `tone` streichen, immer `bare`, die Stories rahmen mit `Card` (kein Abnehmer, A12) · Kollaps-Kasten: „erscheint nur, wenn `collapse` gesetzt ist; die Story setzt es auf der Aggregat-Zeile".

Vor dem Bau in die Spec: (a) Prop `fxCurrency` in die Schnittstelle, Story `ForeignCurrency` beweist sie; (b) `notes` auf Belegstellen und USt-Notizen eingrenzen — `line.lineNotes` ist typisiert und wird von der Form selbst gelesen; (c) „Setzt auf": `formatTime(d, "date")`/`Time` statt `formatDate`, Prozent wie in 0072; (d) `tone` streichen, Kollaps-Kriterium umformulieren; (e) „B7" → L-204, mit Präzisierung: der Typ hat vier `unknown`-Felder (`historyCandidates` dazu); (f) Abschnitt „Offene Fragen" nachtragen.
