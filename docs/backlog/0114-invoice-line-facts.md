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
- **Setzt auf:** `FieldList`, `LongText`, `Amount`, `Badge`, `Time`/`formatTime` aus
  `format.ts`. **Nicht** `formatDate` oder `formatPercent` — beide gibt es
  nicht.

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
423 der 440 gefüllten Kandidatenlisten bleiben dadurch unsichtbar (L-202 c).
Das ist ein Fehler in der Bedingung, kein Merkmal.

**Zwei Dinge werden nicht gebaut**, beide mit Messung statt Meinung:

- die Untertabelle „Alternative Kategorien (Historie)" — `historyCandidates`
  ist in **726 von 726** Zeilen ein leeres Array (L-202 a). Eine Untertabelle für
  Daten, die es nicht gibt, ist derselbe Fehler wie die Rabatt-Spalte.
- der **Rabatt** (Rang 21 im Profil) — 0 % gefüllt (L-201). Er steht im Ausbau,
  nicht im Bau. Das ist die einzige Stelle, an der diese Spec vom Profil
  abweicht, und sie sagt hier, warum.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `line` | `InvoiceLineItem` | ja | die Position, unverändert aus `src/ludwig/modules/invoices/domain/invoice.ts` | `Standard` |
| `labels` | `InvoiceLineLabels` | ja | dieselben Wörter wie in 0072 — für USt-Sonderfall und Sonderart, die hier ihren **Wert** zeigen, nicht nur ihr Badge | `Standard` |
| `notes` | `readonly string[]` | nein | Belegstellen und USt-Notizen, vom Aufrufer zu Sätzen gemacht — die beiden JSONB-Spalten, für die es keinen Typ gibt (L-204). `line.lineNotes` ist typisiert und wird von der Form **selbst** gelesen, nicht hierüber | `Standard` |
| `collapse` | `readonly [string, string][]` | nein | der Audit-Trail des Beleg-Kollaps als Label/Wert-Paare, wie `FieldList` sie nimmt | `Aggregate` |
| `fxCurrency` | `string` | nein | die Währung des Fremdwährungs-Blocks (Quelle `InvoiceDetail.fxCurrency`). **Pflicht, sobald ein `fx*`-Wert gesetzt ist** — `Amount` wirft bei einer nackten Zahl ohne Währung | `ForeignCurrency` |

**Befund für `ludwig/app` (L-204):** `vatEvidence`, `vatNotes`, `collapseDecisionJson` und `historyCandidates` — **vier**
Felder — sind in `InvoiceLineItem` als `unknown` typisiert. Eine
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
Zeile (0072), das gemeinsame Aufklappen der Liste (0115). Die Form steht
**immer frei** (`FieldList tone="bare"`): sie sitzt im Aufklapper einer Zeile,
die den Rahmen schon setzt. Eine `tone`-Prop gibt es nicht — sie hätte keinen
Abnehmer (A12); die Stories rahmen mit `Card`, wenn sie einen Rahmen brauchen.

Datum und Prozent wie in 0072: das Leistungsdatum über `Time`
(`formatTime(value, "date")`), der USt-Satz als `${taxRatePercent} %` in
`v2num`. `formatDate` gibt es nicht.

Zustände: **gefüllt** und **fast leer** sind die beiden, die vorkommen. Ein
Block ohne Feld erscheint nicht; sind alle Blöcke leer, steht ein Satz statt
einer leeren Fläche („Zu dieser Position hat Ludwig nichts vermerkt.") — das
ist der Leerfall, nicht ein Fehlerfall: er kommt bei einer synthetisierten
Position (`virtual_fallback`) vor, die nichts als Zahlen hat.

## Stories

Abgeleitet nach `spec-schreiben` §6: 2 Zustände (gefüllt, leer) + 1 je Prop
mit eigenem Zweig (`fxCurrency`, `collapse`) + 1 Bedingung, die heute falsch
steht (Steuerschlüssel ohne Sonderfall) + 1 „im Einsatz" + 1 Rand (die Form
kürzt zwei Freitexte) = **7**. Titel `v3/Entitäten/Rechnungsposition/InvoiceLineFacts`.

| Story | Beweist |
|---|---|
| `Standard` | Normalfall: Klassifikation, Umsatzsteuer, Steuerschlüssel-Block, Beleg, Hinweise |
| `Sparse` | die synthetisierte Position ohne Klassifikation — der Satz statt der leeren Fläche |
| `TaxKeysWithoutSpecialCase` | Steuerschlüssel-Kandidaten **ohne** USt-Sonderfall: der Block erscheint (423 von 440 Zeilen im Bestand, heute unsichtbar) |
| `Aggregate` | die `virtual_aggregate`-Position mit dem Kollaps-Kasten |
| `ForeignCurrency` | der `fx*`-Block, der nur bei 20 von 726 Zeilen erscheint |
| `Edges` | Buchungsgegenstand mit 392 Zeichen (max), Begründung mit 295 — beide gekürzt; dazu ein extrahierter USt-Satz, der **abweicht**, damit die Klammer einmal zu sehen ist |
| `InUse` | im Aufklapper einer `InvoiceLineRow` (0072) — so, wie die Liste sie steckt |

Nicht anwendbar: `Laedt` und `Fehler` — die Fakten laden nichts, sie stehen im
Aufklapper einer Zeile, die schon da ist. `LeerNachFilter` — es wird nicht
gefiltert.

## Offene Fragen

Keine mehr offen — entschieden mit der Freigabe vom 2026-09-07:

1. **Woher kommt die Währung des Fremdwährungs-Blocks?** Als Prop
   `fxCurrency`, Quelle `InvoiceDetail.fxCurrency`. Pflicht, sobald ein
   `fx*`-Wert gesetzt ist: `Amount` wirft bei einer nackten Zahl.
2. **Braucht die Form eine `tone`-Prop?** Nein. Sie steht immer frei; einen
   Rahmen setzt, wer sie einsetzt (A12: keine Prop ohne Abnehmer).
3. **Wann erscheint der Kollaps-Kasten?** Wenn `collapse` gesetzt ist — die
   Story setzt es auf der Aggregat-Zeile. Die Form prüft nicht selbst auf
   `source === "virtual_aggregate"`; sie zeigt, was sie bekommt.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Belegstellen und USt-Notizen als eigene Blöcke | `notes`/`collapse` fallen weg, `line` trägt die Typen selbst | L-204 ist gelöst — `src/ludwig/` führt einen Typ für die drei JSONB-Spalten |
| Der Rabatt | `line.lineDiscountValue` wird gezeigt | in `line_discount_value` steht ein Wert (L-201) |
| Alternative Kategorien | eine Untertabelle | `historyCandidates` ist irgendwo nicht leer (L-202 a) |
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
- [ ] Der Kollaps-Kasten erscheint genau dann, wenn `collapse` gesetzt ist; die Story setzt es auf der Aggregat-Zeile (Story `Aggregate` gegen `Standard`, gemessen)
- [ ] Der `fx*`-Block erscheint nur bei gesetzten Werten und zeigt die Währung aus `fxCurrency` (Story `ForeignCurrency` gegen `Standard`, gemessen)
- [ ] Sind alle Blöcke leer, steht der Satz statt der leeren Fläche (Story `Sparse`, gemessen)
- [ ] Die zwei Freitexte werden bei 161 und 169 Zeichen gekürzt, nicht bei einer geratenen Zahl (Story `Edges`, gemessen)
- [ ] Die Form hat keinen eigenen Rahmen und keinen eigenen Innenabstand (Story `InUse`, bei 1280 px und 1600 px gemessen)
- [ ] Ersetzt den Aufklapper in `PositionenTab` ohne Funktionsverlust — außer der Historie-Tabelle und der Klammer „(extrahiert: …)", die dort nie rendern (L-202)

## Abnahme

Gemessen am laufenden Storybook (6107), je Zustand ein eigener Aufruf; die
Blöcke sind über ihren gerenderten Text gezählt, nicht über den Code gelesen.

**Story-Deckung: vollständig.** Sieben Stories, wie abgeleitet (2 Zustände +
`fxCurrency` + `collapse` + die heute falsche Bedingung + im Einsatz + Rand).
`line` → `Standard`, `notes` → `Standard`, `collapse` → `Aggregate`,
`fxCurrency` → `ForeignCurrency`. Ausschlüsse (`Laedt`, `Fehler`,
`LeerNachFilter`) sind begründet. Ein Schönheitsfehler: die Spec nennt für
`labels` den Nachweis `Standard`, dort ist `vatSpecialCase` aber `none` — die
Prop wirkt erst in `Aggregate` und `ForeignCurrency`.

| Kriterium | Nachweis (Story-ID · Messung) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build` grün | beide Exit 0 | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `entities/invoice-line/InvoiceLineFacts.tsx` + `.stories.tsx`, Titel `v3/Entitäten/Rechnungsposition/InvoiceLineFacts` | ✓ |
| Code englisch; `@when`/`@instead` am Export | vorhanden; die drei Helfer (`rows`, `text`, `money`) sind modul-lokal | ✓ |
| Kein Hex, kein px, keine lokale Label-Map | keine Farbe, kein Maß in der Datei; Wörter über `labels` | ✓ |
| Alle Stories vorhanden, Ausschlüsse begründet | 7/7 | ✓ |
| Prüfliste §9 durchgegangen | Zahlen rechts (`FieldList`), Text links, keine Farbe als Kategorie, keine Konsolenmeldung | ✓ |
| Im Browser angesehen | alle sieben Stories geladen, 0 Fehler/Warnungen | ✓ |
| Ein Feld ohne Wert erscheint **nicht** | `Standard`: fünf Blöcke, darin kein „—" und keine leere Zeile; `USt-Sonderfall`, `Rechtsgrundlage`, `Extrahierter USt-Satz`, `Fremdwährung`, `Beleg-Kollaps` fehlen ganz. `Sparse`: 0 Blöcke | ✓ |
| Steuerschlüssel-Block ohne USt-Sonderfall | `TaxKeysWithoutSpecialCase` · linke Form ohne Kandidaten: nur „Buchungsklassifikation"; rechte Form mit `taxCandidateKeys` und `vatSpecialCase: "none"`: „DATEV-Steuerschlüssel · Kandidaten · 9 · 8 · 3" | ✓ |
| Extrahierter USt-Satz nur bei Abweichung | `Edges` (`vatExtractedRatePercent` 7 gegen `taxRatePercent` 19) → „Extrahierter USt-Satz 7,00 %"; `Standard` → Feld fehlt | ✓ |
| Kollaps-Kasten genau dann, wenn `collapse` gesetzt ist | `Aggregate` → Block „Beleg-Kollaps" mit drei Paaren; `Standard` (dieselbe Form ohne `collapse`) → kein Block. Die Form prüft `source` nicht selbst | ✓ |
| `fx*`-Block nur bei gesetzten Werten, Währung aus `fxCurrency` | `ForeignCurrency` → „Fremdwährung · Einzelpreis 399,00 $ · USt-Betrag 0,00 $ · Netto-Summe 1.197,00 $"; `Standard` → kein Block | ✓ (siehe M2) |
| Sind alle Blöcke leer, steht der Satz | `Sparse` · 0 `.v2ilfacts`, ein `<p class="v2muted">Zu dieser Position hat Ludwig nichts vermerkt.</p>` | ✓ |
| Die zwei Freitexte werden bei 161 und 169 Zeichen gekürzt | `Edges` · Buchungsgegenstand: Fixture 165 Zeichen → 158 gerendert plus „…" (Schnitt bei 161, Wortgrenze). **Begründung: Fixture 159 Zeichen → 159 gerendert, kein Schnitt** — die Grenze 169 wird von keiner Story erreicht | **✗ M1** |
| Kein eigener Rahmen, kein eigener Innenabstand (1280/1600) | `InUse` · `.v2ilfacts`: `border 0`, `padding 0`, Hintergrund transparent, Radius 0; die fünf Blöcke sind `v2fields v2fields--bare`, ebenfalls ohne Rahmen und Polster. Rahmen und Polster kommen von `.v2tbl__detail` (`18px 18px 20px 46px`, `rgb(244,246,248)`). Identisch bei beiden Breiten | ✓ |
| Ersetzt den Aufklapper in `PositionenTab` ohne Funktionsverlust | gegen `PositionenTab.tsx` gelesen: „Buchungsklassifikation", „USt-Sonderbehandlung" (hier auf „Umsatzsteuer" plus eigenen Steuerschlüssel-Block aufgeteilt, P12), „Fremdwährung", „Hinweise" (`vatNotes` + `lineNotes`) und der Kollaps-Kasten sind gedeckt; dazu neu: Artikelnummer und Leistungsdatum. Bewusst weggelassen: „Alternative Kategorien (Historie)" (L-202 a) und der Roh-Schlüssel in Klammern hinter dem Spezial-Typ, dessen Wort jetzt in der Zeile steht | ✓ |

### Mängel

1. **Die Grenze 169 ist von keiner Story bewiesen (blockiert).** Kriterium
   „Die zwei Freitexte werden bei 161 und 169 Zeichen gekürzt, nicht bei einer
   geratenen Zahl". Gemessen in `Edges`: `LONG.accountingSubject` ist 165
   Zeichen lang und wird auf 158 plus „…" geschnitten — die 161 sind belegt.
   `LONG.fundUsageReasoning` ist **159** Zeichen lang, bleibt also unter 169 und
   erscheint vollständig; der zweite Schnitt ist ungeprüft. Dazu behauptet der
   deutsche Story-Text „Buchungsgegenstand mit 392 Zeichen (max), Begründung mit
   295" — beides trifft auf die Fixture nicht zu (165 / 159), und die Spec
   nennt genau diese beiden Maximalwerte. Vorschlag: die zwei Fixture-Texte auf
   392 und 295 Zeichen bringen; dann zeigt `Edges` beide Schnitte und der
   Story-Text stimmt wieder mit dem Bild überein.
2. **Ein `fx*`-Wert ohne `fxCurrency` verschwindet lautlos.** `money()` gibt
   `null` zurück, wenn die Währung fehlt — der ganze Block entfällt dann, ohne
   Spur. Die Spec macht `fxCurrency` „Pflicht, sobald ein `fx*`-Wert gesetzt
   ist"; ein Aufrufer, der sie vergisst, verliert damit Daten unbemerkt. Das ist
   das Gegenteil der Regel, die dieselbe Familie für `labels` aufstellt
   („visibly wrong beats silently gone", L-203). Vorschlag: den Block mit einem
   Wort statt gar nicht zeigen, oder `Amount` werfen lassen. Nicht blockierend.
3. **`currency={currency as never}`.** Der Cast schaltet genau die Prüfung ab,
   die `fxCurrency` erst zur Pflicht macht; `pnpm typecheck` ist deshalb grün,
   ohne dass die Währung je geprüft wird. Vorschlag: `fxCurrency` mit dem Typ
   deklarieren, den `Amount` annimmt. Nicht blockierend.

**Urteil: zurück.** Blockierend ist Mangel 1 — ein Kriterium, das „gemessen"
verlangt und dessen Story die Grenze gar nicht erreicht, dazu ein Story-Text,
dem das Bild widerspricht. Alles Übrige ist gemessen und gehalten.

Abgenommen von / am: Claude (Abnahme, nicht Bau), 2026-09-07 · Offene Punkte:
M1 (blockiert), M2–M3.

## Freigabe (2026-09-07, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Ränge exakt nach der Formen-Tabelle; die Abweichung „Steuerschlüssel als eigener Block, nicht am USt-Sonderfall" trägt — sie ist im Profil (P12) entschieden, 423 von 440 Kandidatenlisten wären sonst unsichtbar. Historie-Untertabelle und Rabatt nicht bauen, Trigger im Ausbau. Entscheide: Währung des Fremdwährungs-Blocks als Prop `fxCurrency?: string` (Pflicht, sobald ein `fx*`-Wert gesetzt ist; Quelle `InvoiceDetail.fxCurrency` — `Amount` wirft bei nackter Zahl) · `tone` streichen, immer `bare`, die Stories rahmen mit `Card` (kein Abnehmer, A12) · Kollaps-Kasten: „erscheint nur, wenn `collapse` gesetzt ist; die Story setzt es auf der Aggregat-Zeile".

Vor dem Bau in die Spec: (a) Prop `fxCurrency` in die Schnittstelle, Story `ForeignCurrency` beweist sie; (b) `notes` auf Belegstellen und USt-Notizen eingrenzen — `line.lineNotes` ist typisiert und wird von der Form selbst gelesen; (c) „Setzt auf": `formatTime(d, "date")`/`Time` statt `formatDate`, Prozent wie in 0072; (d) `tone` streichen, Kollaps-Kriterium umformulieren; (e) „B7" → L-204, mit Präzisierung: der Typ hat vier `unknown`-Felder (`historyCandidates` dazu); (f) Abschnitt „Offene Fragen" nachtragen.

## Nach der Abnahme (2026-09-07): drei Mängel, einer blockierend

**M1 erledigt — die Grenze 169 war von keiner Story bewiesen.** Die Fixture
`LONG` trug 165 und 159 Zeichen, während der Story-Text 392 und 295
behauptete. Beides sind jetzt echte Texte in der Länge des Wertebereichs
(**400** und **297** Zeichen), und die Story-Beschreibung nennt genau diese
Zahlen. Ein JSDoc, das eine Messung behauptet, ist so bindend wie ein
Kriterium — der Mangel war die Behauptung, nicht die Kürzung.

**M2 erledigt — ein `fx*`-Wert ohne `fxCurrency` verschwand lautlos.** Das war
das Gegenteil der Familienregel. Jetzt steht der Betrag **ohne Währung** da,
und an ihrer Stelle steht, was fehlt: `(Währung fehlt)`, oder bei einem
unbekannten Code `(XYZ?)`. Ein Betrag, den es gibt, verschwindet nicht, weil
seine Währung fehlt.

**M3 erledigt** — `currency as never` ist weg. Die Form prüft den Code gegen
`CURRENCIES` aus `src/ludwig/shared/money.ts`; nur ein bekannter geht an
`Amount`, alles andere nimmt den Weg aus M2. Damit schaltet nichts mehr die
Typprüfung ab, die den Fall absichern soll.
