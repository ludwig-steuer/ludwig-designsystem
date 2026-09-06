# 0086 · BankTransactionWorklist — offene Zahlungen zuordnen

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/bank-transaction/` |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md`, Abschnitt „Listen" (Zeile `BankTransactionWorklist`) |
| Auftrag | Die Arbeitsliste der Zahlungen **eines Kontos** ohne Sachverhalt (die Seite gruppiert mehrere Konten untereinander), mit Mehrfachauswahl und zwei Sammelaktionen: neuen Sachverhalt anlegen oder einem bestehenden zuordnen. Ersetzt `modules/bank-transactions/ui/BankTransactionAssignmentTable.tsx` (658 Z.). |
| Job | Wenn **Zahlungen ohne Vorgang liegen**, will **die Sachbearbeiterin** **sie in einem Zug einem neuen oder bestehenden Sachverhalt zuordnen**, damit **sie nicht Konto für Konto durchgeht**. |
| Warum eigene Komponente | Sie unterscheidet sich von der Auszugsliste (0085) in **drei** der fünf Merkmale aus `entitaet-analysieren` §8: **Spaltensatz**, **Filter** und **Massenaktion**. Zwei genügen. Die Grundgesamtheit zählt ausdrücklich **nicht** mit — der Prüflauf des Profils hat „kontoübergreifend“ verworfen: beide Listen zeigen ein Konto. |
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
  (Spaltensatz, Filter, Massenaktion); zwei genügen. **Nicht** die
  Grundgesamtheit — beide Listen zeigen ein Konto (Prüflauf des Profils).
- **Zuschnitt:** eine Datei, ein Export, 88 Zeilen — `DataTable` mit
  `selection`, dem kurzen Spaltensatz und dem Erfolgs-Leerfall.
- **Setzt auf:** `DataTable` (0057), `bankTransactionColumns` (0101),
  `BulkAction` (`primitives/Selection`).

### Vier Spalten statt sieben

`WORKLIST_COLUMNS = postingDate · counterparty · purpose · cases · amount` —
die Ränge 1–4 und 6 des Profils. Weggelassen ist **nur** die DATEV-Historie:
sie beantwortet eine andere Frage (steht die Zeile in der Historie?) als die,
für die diese Liste da ist (wem gehört sie?). Wer sie doch braucht, erweitert
den Satz über `columns` — die Reihenfolge bleibt dieselbe, weil `columns`
auswählt und nie umordnet (Story `WithMatchStage`, verwürfelt übergeben).

Die **Sachverhalts-Spalte** stand im ersten Bau nicht drin, mit dem Argument,
in dieser Grundgesamtheit sei jede Zeile ohne Sachverhalt. Das Argument trägt
nicht: es gilt nur für reines Z0, und der zweite Aufrufer sieht alle Zeilen.
Selbst im ersten ist die Spalte der Ort, an dem die Zuordnung erscheint,
**sobald sie passiert** — und der Platz für den Vorschlags-Knopf „→ Beleg Nr."
aus dem Profil.

### Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `transactions` | `BankTransactionRowData[]` | ja | Die offenen Zahlungen **eines** Kontos | `Filled` |
| `caseHref` | `(caseId) => string` | ja | Durchgereicht an den Katalog | `Filled` |
| `bulkActions` | `BulkAction[]` | ja | „Neuen Sachverhalt anlegen" und „Bestehendem zuordnen" | `Filled` |
| `rowActions` | wie `DataTable` | nein | Einzelaktionen je Zeile | — (durchgereicht, von `DataTable` bewiesen) |
| `rowHref` | `(t) => string` | nein | Der Weg in den Drawer einer Zahlung (0103) | `AllOfAnAccount` |
| `openHref` | `string` | nein | Wohin „offen" in der Sachverhalts-Spalte führt | `Filled` |
| `listHref`, `sort`, `pager` | wie `DataTable` | nein | **Der zweite Aufrufer**: die Konfigurationsseite listet alle 500 Zahlungen eines Kontos | `AllOfAnAccount` |
| `columns` | `BankTransactionColumn[]` | nein | Erweitert den kurzen Satz | `WithMatchStage` |
| `loading`, `error` | wie `DataTable` | nein | Durchgereicht | `LoadingAndError` |
| `head` | `{ title, sub?, actions? }` | ja | Kopf der Karte: Konto und Zahl der Offenen | alle |
| `minWidth` | `number` | nein | Voreinstellung 900 | `Filled` bei 900 px |

**Kann bewusst nicht:**

- **Den Ziel-Sachverhalt wählen.** Sie übergibt die Schlüssel; die Wahl ist
  der Picker des Aufrufers (0084).
- **Nach Konto gruppieren.** Das ist die Seite — sie weiß, welche Konten es
  gibt; die Liste weiß nur ihres (Story `InUse`: zwei Listen untereinander).
- **Filtern und suchen.** Kein Filter, keine Suche — das ist der zweite der
  drei §8-Unterschiede zu 0085 und gehört, wo es einen gibt, der Seite.
- **Leer nach Filter.** Sie hat keinen Filter — der einzige Leerfall ist der
  Erfolg.

### Stories

Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionWorklist`. Abgeleitet
nach §6: 3 anwendbare Zustände (gefüllt · leer · lädt/Fehler; „leer nach
Filter" ist begründet ausgeschlossen — die Liste hat keinen Filter) + 1 Enum
(`columns`) + 1 „im Einsatz" + 1 zweiter Aufrufer = **6**. Der Callback der
Sammelaktion bekommt **keine** eigene Story: sein Rundlauf steht in `Filled`,
wo die Auswahl ohnehin gezeigt wird.

| Story | Beweist |
|---|---|
| `Filled` | Auswahl, zwei Sammelaktionen im Rundlauf, Taste am Knopf |
| `WithMatchStage` | `columns` erweitert den Satz, ohne die Reihenfolge zu ändern |
| `Empty` | Nichts offen ist ein **Erfolg** — mit Haken |
| `LoadingAndError` | Kopf bleibt stehen; der Fehler nennt Ursache und Schritt |
| `InUse` | Zwei Konten untereinander — das Gruppieren gehört der Seite |
| `AllOfAnAccount` | Der zweite Aufrufer: alle 500 Zahlungen eines Kontos, mit Pager, Sortierung und gefüllter Sachverhalts-Spalte |

### Abnahmekriterien

Fest: typecheck · build · Datei nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, keine lokale Label-Map · alle Stories · §9 · im
Browser angesehen.

Variabel:

- [ ] Kopf und Zeilen enden bei 900/1100/1440 px an derselben Kante (gemessen)
- [ ] Der Satz trägt die Ränge 1–4 und 6 des Profils und **keine** DATEV-Spalte (Story `Filled`, gemessen)
- [ ] Sortierung und Pager sind durchgereicht, damit der zweite Aufrufer sie hat (Story `AllOfAnAccount`)
- [ ] `columns` erweitert, ohne umzuordnen (Story `WithMatchStage`, gemessen)
- [ ] Jedes Kästchen sagt, **welche** Zeile es wählt, mit absolutem Datum (gemessen: „Stadtwerke Musterstadt vom 26.08.2026 auswählen")
- [ ] Im Leerfall ist das Kopf-Kästchen stillgelegt (gemessen: `disabled === true`)
- [ ] Der Leerfall trägt den Haken **und die Zahl** (Story `Empty`)
- [ ] Die Fehlerzeile trägt einen Weg zurück, nicht nur einen Satz (Story `LoadingAndError`, gemessen: ein Knopf)
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

## Nach der Abnahme vom 2026-09-07

Die Abnahme kam **zurück** — an der Freigaberegel dieser Aufgabe: „freigegeben,
wenn Spec und Profil übereinstimmen". Sie tat es an vier Stellen nicht. Die
Messtechnik hielt: drei Messbehauptungen wurden unabhängig nachgerechnet und
bestätigt (169 px, 150 px, 39 px Kopfüberstand), eine Zahl war falsch — und
zwar zu meinen Ungunsten, nicht zu meinen Gunsten.

### Die Rechnung war falsch, der Schluss richtig (M10)

„Zweimal 35 Polster" stimmt nicht: die Karte hat `padding: 12px 18px`, also
**36 px**. Richtig ist 1060 fest + 70 Rinnen + 36 Polster = **1166 px**; dem
Verwendungszweck blieben bei `minWidth` 1250 also **84 px**, nicht 50, und bei
1400 bekommt er **234 px**, nicht 200. Der Kopf „Verwendungszweck" misst
123 px — der Überstand von 39 px stimmt damit exakt. Spec und JSDoc tragen
jetzt die gemessenen Zahlen. Derselbe falsche Wert stand in
`sourceDocumentMinWidth()` (0070) und ist dort mitkorrigiert.

### Rang 6 kommt zurück in die Arbeitsliste (M2)

Das Profil verlangt für 0086 „Auswahl · 1 · 2 · 3 · 4 · **6**"; gebaut waren
vier Spalten. Meine Begründung — „die Sachverhalts-Spalte sagte in jeder Zeile
dasselbe" — trägt nur, solange die Grundgesamtheit reines Z0 ist. Sie ist es
nicht (siehe M3), und selbst im ersten Aufrufer ist die Spalte der Ort, an dem
die Zuordnung **erscheint, sobald sie passiert**. Das Profil hatte recht.

### Die Liste trägt beide Aufrufer (M3)

Das Profil nennt eine zweite Route: die Konfigurationsseite eines Bankkontos
listet *jede* Zahlung, 500 auf einmal, und schreibt „0086 muss beide Aufrufer
tragen". Die Spec hatte das Gegenteil unter „Kann bewusst nicht" stehen.
Jetzt reicht die Liste `sort`, `pager` und `listHref` durch — 500 Zeilen ohne
Pager sind keine Liste, sondern eine Abschneidung. Story `AllOfAnAccount`.

### Die Zeile hat einen Weg ins Detail (M5)

Das Seitenprofil nennt „eine Zahlung nachschlagen, ohne die Liste zu
verlassen" **oft** und gibt ihm einen Klick; die Liste gab ihn nicht — gemessen
`cursor: auto`, kein `.v2rowlink`. Jetzt `rowHref`, durchgereicht an
`DataTable`, das die Mechanik längst hat. `rowHref` und `expand` schließen
einander aus — das ist die Regel von `DataTable`, nicht unsere: eine Zeile, die
aufklappt, springt nicht auch noch. Story `RowLink`, gemessen: 5 Zeilenlinks,
**0** verschachtelte Anker.

### „kontoübergreifend" war der falsche §8-Beleg (M1)

Der Prüflauf des Entitätsprofils hat das Wort ausdrücklich verworfen: beide
Listen zeigen **ein** Konto. Die drei Unterschiede nach §8 sind
**Spaltensatz · Filter · Massenaktion**. Spec-Prosa und JSDoc sagen das jetzt.

### Der Rest

- **M4** — der Leerfall des Kontoauszugs trägt bewusst keinen Haken
  („weder Erfolg noch Lücke"); das Entitätsprofil sagte weiter „Erfolg". Es
  bekommt eine Prüflauf-Zeile, der Code bleibt.
- **M6** — die Fehlerzeile nannte Ursache, aber keinen nächsten Schritt.
  `retry` war in der Schnittstelle und wurde in keiner Story gesetzt. Jetzt in
  beiden, gemessen: ein Knopf „Erneut laden".
- **M7** — „nichts mehr offen" trägt jetzt die Zahl („0 von 251 offen").
- **M8** — die Story-Ableitung rechnete 3+1+1+1 = 5 und meinte 6 Posten: der
  Rundlauf der Sammelaktion teilt sich die Story mit `Filled`. Steht jetzt so
  da. (Mit der neuen Story `AllOfAnAccount` sind es 6.)
- **M9** — drei deutsche Kommentare im Komponenten-Code sind englisch.
- **M11** — `WithMatchStage` übergab die Spalten bereits in der richtigen
  Reihenfolge und bewies damit nichts. Jetzt verwürfelt; gemessen kommt
  „Datum · Gegenpartei · Verwendungszweck · DATEV-Historie · Betrag" zurück.
- **M12** — doppelte Anführungszeichen im Leerfall nach Filter.
- **M13** — die Story-Daten stiegen, während der Kopf „absteigend" sagte.
- **M14** — die zwei Befunde des Seitenprofils stehen jetzt im Register
  (L-84, L-85).

### Was gemessen bleibt

Kopf und Zeilen an derselben Kante bei 1100/1280/1440/1680/1920 px,
Zellüberlauf 0 — auch in `Extremes` und mit der zurückgeholten
Sachverhalts-Spalte. 15 Stories, keine Konsolenmeldung.
