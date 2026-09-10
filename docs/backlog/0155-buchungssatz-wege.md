# 0155 · Wege aus dem Buchungssatz heraus

| | |
|---|---|
| Status | **gebaut 2026-09-10** — Abnahme offen (nicht durch den Bauenden) |
| Stufe | `entities/journal-entry/` und `entities/account/` |
| Quelle | Vier Owner-Wünsche vom 2026-09-10, beim Durchsehen der Stapelabnahme Schritt 3 |
| Nachgetragen | Die Nummer stand ab dem ersten Wunsch in den Code-Kommentaren; diese Datei holt sie ein (Hausregel: eine Nummer wird nie zweimal vergeben, und eine Nummer im Code ohne Datei ist ein toter Verweis) |
| Spec von / am | Claude, 2026-09-10 (nachgezogen zum Bau) |

## Was die vier Wünsche verbindet

Alle vier drehen sich um dieselbe Frage: **wie kommt man von einem
Buchungssatz zu dem, worüber er etwas behauptet** — ohne die halb geprüfte
Buchung zu verlieren.

| # | Wunsch | Umsetzung |
|---|---|---|
| 1 | Die Quellen zeigen die UUID; die soll weg, und ein Beleg soll aufschlagbar sein | `AiSource.label` optional, `onOpen` als Callback; 370 von 919 Quellen zeigten eine rohe Kennung |
| 2 | Neben der Kontonummer das Konto-Zeichen, Klick öffnet den Drawer | `AccountCell` bekommt das Zeichen **am Weg**; die Compact-Ansicht gibt ihre Handkopie auf und nimmt `AccountCell` |
| 3 | BU-Schlüssel und Automatikkonto in der Compact-Ansicht | Spalte „BU" in `JournalEntryCard`, Marke „Automatik 19 %" — **beides zusammen ist der Fehler** |
| 4 | Im Aufklapper auch die große Ansicht der Buchung | Story `AiBookingNotes → InUse`: erst die Buchung, dann die Begründung |

## Die drei Entscheidungen dahinter

**Aufschlagen statt Wegspringen.** Eine Quelle mit `onOpen` wird ein Knopf und
öffnet den Drawer; erst wo es keinen Weg daneben gibt, wird sie ein Link, und
dann in einem neuen Fenster. Dasselbe gilt für die Kontonummer: der Weg führt
in den **Drawer** (`?account=6815`), nicht auf die Kontoseite — wer in einer
Buchungszeile auf eine Nummer trifft, hat eine Frage, kein Ziel.

**Ein Zeichen nur, wo es einen Weg gibt.** Ohne `href` bleibt die Nummer Text.
Eine Zelle, die anklickbar aussieht und nirgends hinführt, ist schlimmer als
eine, die es gar nicht erst behauptet (V14).

**Der Konflikt gehört an die Zeile, an der er entsteht.** Steht auf einem
Automatikkonto zusätzlich ein BU-Schlüssel, meldet das heute ein Guard über
der Buchung. Die Karte zeigt jetzt beides nebeneinander und färbt die Marke
gelb — der Export entfernt den Schlüssel still oder weist den Stapel ab, und
in beiden Fällen steht in Ludwig etwas anderes als in DATEV.

## Was dabei wegfiel

Zwei Handkopien, beide aus dem eigenen Haus:

- `AccountRef` in `JournalEntryCompact` war `AccountCell` nachgebaut — Nummer
  in Mono, Name gedämpft, bei 40 Zeichen gekürzt. Nur den Weg zum Konto kannte
  sie nicht.
- `PaymentAccountOption` war in `PaymentAccountField` lokal definiert, obwohl
  der Typ im Spiegel längst stand. Aufgefallen ist es erst, als die App ihre
  Optionen liefern sollte: die beiden unterschieden sich um `iban`.

## Abnahmekriterien

- [ ] Eine Quelle ohne `label` zeigt Art und Zitat, **nie** eine Kennung
- [ ] `SOURCE_OPENABLE` führt genau die drei Arten, die in den Daten eine
      Kennung tragen (`bank`, `beleg`, `klaerung`)
- [ ] Das Konto-Zeichen steht **nur** an einer Nummer mit Weg
- [ ] Der Weg ist ein Suchparameter (`?account=`), kein Pfad
- [ ] Die BU-Spalte erscheint nur, wenn eine Zeile etwas darin hat
- [ ] Schlüssel **und** Automatikmarke an derselben Zeile färben die Marke gelb
- [ ] Im Aufklapper steht die Buchung **vor** der Begründung, und die
      Begründung trägt keinen zweiten Kopf

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |
