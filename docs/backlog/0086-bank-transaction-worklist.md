# 0086 · BankTransactionWorklist — offene Zahlungen zuordnen

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/bank-transaction/` |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md`, Abschnitt „Listen" (Zeile `BankTransactionWorklist`) |
| Auftrag | Die kontoübergreifende Arbeitsliste jeder Zahlung ohne Sachverhalt — nach Konto gruppiert, mit Mehrfachauswahl und zwei Sammelaktionen: neuen Sachverhalt anlegen oder einem bestehenden zuordnen. Ersetzt `modules/bank-transactions/ui/BankTransactionAssignmentTable.tsx` (658 Z.). |
| Job | Wenn **Zahlungen ohne Vorgang liegen**, will **die Sachbearbeiterin** **sie in einem Zug einem neuen oder bestehenden Sachverhalt zuordnen**, damit **sie nicht Konto für Konto durchgeht**. |
| Warum eigene Komponente | Sie unterscheidet sich von der Auszugsliste (0085) in **drei** der fünf Merkmale aus `entitaet-analysieren` §8: Grundgesamtheit (kontoübergreifend statt ein Konto), Massenaktion (ja statt keine) und Spaltensatz (mit Konto, ohne Zuordnung). Zwei genügen. |
| Umfang | 65 % aller Positionen haben kein Ereignis (Staging 2026-09-05, 1281 Zeilen) |
| Vertagt, weil | sie an `CasePicker` (0084) hängt — heute ist die Auswahl des Ziel-Sachverhalts ein `<select>` über alle Fälle — und an einer Sammelaktion, die es serverseitig nur je Zeile gibt (Befund L-16). |
| Setzt voraus | `BankTransactionRow` (erste Welle) · `CasePicker` (0084) · `DataTable` mit `SelectionBar` |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |

## Spec 2026-09-07 (Skill `spec-schreiben`), gebaut in derselben Sitzung

### Die Wartebedingung, zur Hälfte aufgelöst

Die Spec wartete auf `CasePicker` (0084) — und 0084 ist von dieser Freigabe
ausdrücklich **ausgenommen**. Gebaut wird trotzdem, weil die Auswahl des
Ziel-Sachverhalts gar nicht der Liste gehört: sie **bietet** die zwei
Sammelaktionen an und übergibt die Schlüssel; **welcher** Fall es wird,
entscheidet der Aufrufer. Eine Liste, die selbst einen Picker öffnete,
entschiede etwas, das nicht ihres ist. Damit ist `bulkActions` die
Schnittstelle zu 0084, ohne 0084 zu kennen — und ohne es anzufassen.

Die zweite Wartebedingung bleibt offen und ist ein Befund, kein Baustopp:
serverseitig gibt es die Zuordnung nur je Zeile (**L-16**).

### Einordnung

- **Warum eigene Komponente:** drei der fünf Merkmale aus §8 gehen auseinander
  (Grundgesamtheit, Massenaktion, Spaltensatz); zwei genügen.
- **Zuschnitt:** eine Datei, ein Export, 88 Zeilen — `DataTable` mit
  `selection`, dem kurzen Spaltensatz und dem Erfolgs-Leerfall.
- **Setzt auf:** `DataTable` (0057), `bankTransactionColumns` (0101),
  `BulkAction` (`primitives/Selection`).

### Vier Spalten statt sieben

`WORKLIST_COLUMNS = postingDate · counterparty · purpose · amount`. Weggelassen
sind **Sachverhalt** und **DATEV-Historie** — nicht aus Platzgründen: In dieser
Grundgesamtheit ist jede Zeile ohne Sachverhalt, die Spalte sagte in jeder
Zeile dasselbe; und der DATEV-Haken beantwortet eine **andere** Frage (steht
die Zeile in der Historie?) als die, für die diese Liste da ist (wem gehört
sie?). Wer die Historie doch braucht, erweitert den Satz über `columns` — die
Reihenfolge bleibt dieselbe, weil `columns` auswählt und nie umordnet.

### Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `transactions` | `BankTransactionRowData[]` | ja | Die offenen Zahlungen **eines** Kontos | `Filled` |
| `caseHref` | `(caseId) => string` | ja | Durchgereicht an den Katalog | `Filled` |
| `bulkActions` | `BulkAction[]` | ja | „Neuen Sachverhalt anlegen" und „Bestehendem zuordnen" | `Filled` |
| `rowActions` | wie `DataTable` | nein | Einzelaktionen je Zeile | — (durchgereicht, von `DataTable` bewiesen) |
| `columns` | `BankTransactionColumn[]` | nein | Erweitert den kurzen Satz | `WithMatchStage` |
| `loading`, `error` | wie `DataTable` | nein | Durchgereicht | `LoadingAndError` |
| `head` | `{ title, sub?, actions? }` | ja | Kopf der Karte: Konto und Zahl der Offenen | alle |
| `minWidth` | `number` | nein | Voreinstellung 900 | `Filled` bei 900 px |

**Kann bewusst nicht:**

- **Den Ziel-Sachverhalt wählen.** Sie übergibt die Schlüssel; die Wahl ist
  der Picker des Aufrufers (0084).
- **Nach Konto gruppieren.** Das ist die Seite — sie weiß, welche Konten es
  gibt; die Liste weiß nur ihres (Story `InUse`: zwei Listen untereinander).
- **Blättern und sortieren.** Diese Liste ist die Arbeit eines Vormittags,
  nicht ein Bestand von 251 Zeilen; braucht eine Seite doch einen Pager,
  nimmt sie `BankTransactionList` mit ihrem Filter.
- **Leer nach Filter.** Sie hat keinen Filter — der einzige Leerfall ist der
  Erfolg.

### Stories

Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionWorklist`. Abgeleitet
nach §6: 3 anwendbare Zustände (gefüllt · leer · lädt/Fehler; „leer nach
Filter" ist begründet ausgeschlossen) + 1 Callback (Rundlauf der
Sammelaktion) + 1 Enum (`columns`) + 1 „im Einsatz" = **5**.

| Story | Beweist |
|---|---|
| `Filled` | Auswahl, zwei Sammelaktionen im Rundlauf, Taste am Knopf |
| `WithMatchStage` | `columns` erweitert den Satz, ohne die Reihenfolge zu ändern |
| `Empty` | Nichts offen ist ein **Erfolg** — mit Haken |
| `LoadingAndError` | Kopf bleibt stehen; der Fehler nennt Ursache und Schritt |
| `InUse` | Zwei Konten untereinander — das Gruppieren gehört der Seite |

### Abnahmekriterien

Fest: typecheck · build · Datei nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, keine lokale Label-Map · alle Stories · §9 · im
Browser angesehen.

Variabel:

- [ ] Kopf und Zeilen enden bei 900/1100/1440 px an derselben Kante (gemessen)
- [ ] Der kurze Satz hat **keine** Sachverhalts- und keine DATEV-Spalte (`grep`, Story `Filled`)
- [ ] `columns` erweitert, ohne umzuordnen (Story `WithMatchStage`, gemessen)
- [ ] Jedes Kästchen sagt, **welche** Zeile es wählt, mit absolutem Datum (gemessen: „Stadtwerke Musterstadt vom 26.08.2026 auswählen")
- [ ] Im Leerfall ist das Kopf-Kästchen stillgelegt (gemessen: `disabled === true`)
- [ ] Der Leerfall trägt den Haken (Story `Empty`, gemessen)
- [ ] Die Komponente kennt keinen `CasePicker` (`grep`: 0 Treffer)
- [ ] Keine Konsolenmeldung in allen fünf Stories (gemessen)
- [ ] offen (App): ersetzt `BankTransactionAssignmentTable.tsx` (658 Z.), sobald L-16 steht

### Beim Bauen gemessen

Die Auswahl-Beschriftung stand zuerst auf dem ISO-Datum (`2026-08-26`). Ein
Kästchen, das seine Zeile nennt, muss sie so nennen, wie die Zeile sich selbst
nennt (T7) — jetzt über `formatTime(…, "date", "medium")`.

**Das Kopf-Kästchen war im Leerfall klickbar** und wählte nichts. Behoben in
`SelectAllCell` (0057, `disabled` bei leerer Ordnung); der Fund gehört jeder
Liste mit Auswahl, nicht nur dieser.
