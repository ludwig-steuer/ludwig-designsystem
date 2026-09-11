# Detailseiten — Pattern-Inventar

| | |
|---|---|
| Stand | 2026-09-11 |
| Auftrag | Owner über `ludwig-manager` (2026-09-11): „das Format ist fix, aber die Elemente, die dafür verfügbar sind, also die Patterns, sind nicht vollständig oder sollten ausgebessert werden." |
| Grundlage | `docs/detailseiten-standard.md` (D1–D26) · Beispielseiten im Storybook unter **Muster/Detailseite** (Beleg, Sachverhalt, Konto — jeder Baustein mit Nummer und Regel beschriftet) |
| Von / am | Claude, 2026-09-11 |

Der Standard sagt, **wie** eine Detailseite gebaut ist. Dieses Inventar sagt,
**womit**: welcher Baustein jeden Slot, jede Zone und jedes wiederkehrende
Element trägt, wie weit er ist, und wo er schwach ist — mit dem Beleg aus
Abnahme, Messung oder Befund. Reifegrad:

- **fertig** — gebaut und fremd abgenommen
- **gebaut** — gebaut, aber mit bekannter Lücke
- **ausbessern** — gebaut, trägt den Fall nicht ganz
- **fehlt** — kein Baustein im Set

## 1 Das Inventar

| Ort | Regel | Baustein heute | Reifegrad | Was fehlt oder schwach ist (Beleg) | Nächster Schritt |
|---|---|---|---|---|---|
| Slot **Pager** | D3, D19 | `RecordPager` (0047) | fertig | Die Liste kommt über ihre Filterparameter zurück; das trägt der Aufrufer (F210-Abgleich) | — |
| Slot **Kopf** | D6, D7, D8, D24 | `EntityHeader` (0048, Prozessbild 0137), `StatusBadge` + `StatusInfoButton`, `OverflowMenu` (0008) | fertig | — | — |
| Slot **Signal** | D22 | `StatusCallout` (0049), `Banner` | fertig | „Keins bei Fremdwartezeit" entscheidet der Aufrufer — richtig so, das Pattern kennt keine Wartenden | — |
| Slot **Reiter** | D10–D12, D18, D19 | `Tabs` (Zähler, `alarm`, leiser Reiter 0136) | fertig | Viele Punkte in **einem** Reiter haben keine Navigation; D10 verbietet Unterreiter (Owner-Frage „senkrechte Reiter") | Abschnitts-Index, Default der Owner-Frage → **S7** |
| **Körper**: Spaltenmuster | D17 | `Columns` (0154), `DetailView` (0138) | gebaut | Die schmale dritte Stufe für die Notizspalte ist ungemessen, `aside`/`minDetail` stehen noch im Rahmen statt im Muster (0154, „Was 0152 noch braucht"). **Der Beleg erfüllt D17 nicht:** `SourceDocumentCard` (0071) stellt Original und Fakten in einem eigenen Raster gegenüber (`.v2doccard__cols`) statt in `Columns split` — Abweichungszeile im Seitenprofil `beleg-detail` (Beispielseite Beleg, Nr. 5 und 6; Prüfung `ludwig-manager` 2026-09-11) | **S3**, **S4** |
| Zone 2 **Mängel** | D2, D21, D23 | `OpenPoints` (0153), `SourceDocumentDefects`, `defectPoints()` | fertig | Der Mangel **am Wert** („Belegdatum fehlt" an seiner Zeile) gibt es nur am Beleg (`SourceDocumentFacts missing`, `SourceDocumentGap`); R21 hebt ihn beim zweiten Konsumenten. Kandidat: „Der Gegenpart fehlt" am Sachverhalt (0152, E9) | **S5** |
| Zone 3 **Fakten** | D4, D25 | `FieldList` (0006), die Facts der Entitäten, `ProvenanceMark` (0163) | ausbessern — S1 gebaut, Abnahme offen | `FieldList` setzt jeden Wert rechts und fett und kann **keinen Satz** tragen; zwei Aufrufer bauen denselben Umweg in `v3.css` (`.v2btxf__note`, `.v3prov__note` — 0006, Nachtrag) | **S1** |
| Zone 4 **Abrisse** | D15, D16 | `Card` + `DataTable` mit den Spaltenkatalogen (0070, 0096, 0101), `KpiTile href` (0126), `Sparkline` (0124), `BarChart` (0041, 0110) | fertig | 0126 und 0120 tragen noch keine gemessene Prüfung (0119) | 0119 |
| Zone 5 **Verlauf** | D26 | `LogList` (0053), `LogBrowser` (0054), `Timeline`, `CaseTimeline` (0040, 0152), `BatonBar` | gebaut | Das Muster trägt die Tiefe (`LogEntry.depth`, Sicht im `LogBrowser`), aber **nur der Stapel ordnet seine Aktionen zu** (L-320 → App P36); der Bezug steht roh als `kind:id` (L-319 → P35); die Aktionen haben keine Wörter (L-318 → P34). Der Sachverhalt baut deshalb seinen eigenen Verlauf (`HistorieTab`) | nach P34–P36: prüfen, ob `LogBrowser` ohne neue Prop reicht → **S10** |
| **Randspalte** | D20 | `Columns main-aside` (bricht nach oben), `FieldList` + `Disclosure`, `ExpectationRow` (0025), `NoteFeed` (0158), `ClarificationList` | fertig | „Höchstens drei Zeilen" ist Disziplin des Aufrufers, kein Wert des Patterns — so gewollt | — |
| Reiter **Ereignisse**: Auswahl und Detail | D18 | `CaseTimeline` wählbar (0152), `EntryPane` im Showcase | gebaut | Die Detailfläche des gewählten Ereignisses lebt nur im Showcase (`EventPane`, `scenario.tsx:291`) | `EventFacts` (Profil `accounting-event`, Marke „jetzt") |
| Letzter Reiter **Rohdaten / Technik** | D12, D19 | `RawRecord` (0051), `Disclosure`, `Tabs` leise (0136) | fertig | — | — |
| **Leerzustände** | D23 | `EmptyState`, `DataTable empty` (`done`), `OpenPoints` leer, `FieldList empty` | fertig | Die Props heißen je Baustein anders (`empty`, `emptyText`, `emptyHint`) — ein Lesehindernis, kein Fehler | — |
| **Aktionen und Bearbeiten** | D8, D9 | `EntityHeader actions`, `OverflowMenu` (0008), `ActionButton` mit `ask`/`confirm` (0121, 0159), `InlineEdit` (0020), `ReasonDialog` | fertig | — | — |
| **Verknüpftes** | D13 | `Drawer` und der Katalog: `CaseDrawer` (0098), `BusinessPartnerDrawer` (0143), `SourceDocumentDrawer`, `BankTransactionDrawer`, `AccountDrawer` | fertig (Klasse A) | Einheitliche Drawer-Parameter und die zentrale Bereitstellung sind App-Sache (web-ui-offen P33) | — |
| **Herkunft** | D25 | `ProvenanceMark`, `ProvenanceNote` (0163) | fertig | `AiBookingNotes` baut Begründung und Quellen noch selbst (0163, Ausbau) | **S8** |
| **Vorher / Nachher** | D25 (von Hand korrigiert) | — | fehlt (B3 `DiffView`) | Blockiert 0164 (bearbeitete Vorschläge) und 0165 (Nachlese `matched_corrected`); `ProvenanceNote` nennt nur wer und wann | **S2** |
| **Aufteilung** | — | — | fehlt (B4 `AllocationEditor`) | `allocated_amount` bei 1 % der Ereignisse; erst der Sammelsachverhalt verlangt es | **S9** |
| **Saldo-Prüfung** | D24 | Meldungen im `JournalEntryEditor`, Saldo-Randspalte in Plausibilität | fehlt (B6 `BalanceCheck`) | „Soll = Haben", „Verrechnungskonto auf 0", „Rest x" stehen heute in drei Formen | **S6** |
| **Abgleich zweier Quellen** | — | `ReconciliationTable` (0161), `PeriodGrid` (0162) | fertig | Für 0165 fehlt die Achse der Paar-Arten (L-303 → App P20) | — |

## 2 Spec-Liste — Pattern ausbessern oder ergänzen

In der Reihenfolge, in der sie Seiten entblocken. Nummern bekommen die Specs
bei ihrer Anlage (`spec-schreiben`); jede Owner-Frage hat ihren Default, damit
kein Bau wartet.

| | Spec | Art | Warum in diesem Rang | Owner-Frage — ohne Antwort |
|---|---|---|---|---|
| **S1** | `FieldList`: Prosa-Zeile (Nachtrag 0006) | ausbessern | fällig — zwei Aufrufer bauen denselben Umweg; jede weitere Herleitung, Notiz oder Begründung in Zone 3 wäre der dritte | Eine Prop für die ganze Liste (Werte links, eine Label-Spalte) **und** ein Wert-Wrapper für die einzelne Zeile? — *beides* |
| **S2** | B3 `DiffView`: Vorher / Nachher feldweise | ergänzen | blockiert 0164 und 0165; der Weg vom korrigierten Wert zu seiner Änderung (`ProvenanceNote`) endet heute bei „wer und wann" | Nur die geänderten Felder oder alle mit Markierung? — *nur die geänderten, Rest eingeklappt* |
| **S3** | `Columns`: Stufe für die schmale Spalte, `aside`/`minDetail` aus `DetailView` ins Muster (Nachtrag 0154) | ausbessern | die Notizspalte des Sachverhalts ist die einzige ungemessene Breite; ein zweiter Rahmen mit Randspalte würde den Umweg kopieren | Beim Umbruch fällt Spalte 3 nach unten oder klappt Spalte 1 ein (0152, offene Frage 2)? — *nach unten, wie gebaut* |
| **S4** | `SourceDocumentCard` auf `Columns split` (Nachtrag 0071) | ausbessern | D17: der Beleg ist die einzige Detailseite, deren Gegenüberstellung ein eigenes Raster hat (`.v2doccard__cols`); die Karte steht auch im Drawer (`tone="bare"`), der Umbau trifft beide | — |
| **S5** | Mangel am Wert im Set (neu, R21) | ergänzen | sobald ein zweiter Konsument ihn zeigt — der Sachverhalt ohne Gegenpart ist der erste Kandidat | Eigene Komponente oder eine Zeile der `FieldList` mit Satz und Weg? — *eine `FieldList`-Zeile* |
| **S6** | B6 `BalanceCheck`: geht es auf? (neu) | ergänzen | Saldo und Soll/Haben stehen heute in drei Formen; D24 verlangt sie einmal | — |
| **S7** | Abschnitts-Index im Reiter (neu, D27) | ergänzen | die Owner-Frage „senkrechte Reiter" | Senkrechte Unterreiter oder Sprungmarken im Reiter? — *Sprungmarken, keine zweite Reiterebene (D10)* |
| **S8** | `AiBookingNotes` auf `ProvenanceNote` (Nachtrag 0163) | ausbessern | zwei Formen derselben Herleitung, sobald `JournalEntryFacts` gebaut wird | — |
| **S9** | B4 `AllocationEditor` | ergänzen | Backlog — 1 % der Ereignisse; erst der Sammelsachverhalt verlangt es | Jetzt oder mit dem Sammelsachverhalt? — *mit dem Sammelsachverhalt* |
| **S10** | `LogBrowser`: Tiefe in allen drei Listen (Prüfung, ggf. Nachtrag 0054) | prüfen | nach App P34–P36; das Muster trägt die Tiefe schon | — |
