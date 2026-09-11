# 0155 · Wege aus dem Buchungssatz heraus

| | |
|---|---|
| Status | **fertig** — fremd abgenommen 2026-09-11 samt Nachprüfung (c6f3f4d) |
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

Fremde Abnahme am 2026-09-11 durch eine Prüfer-Session, die nichts gebaut hat (Auftrag `ludwig-manager`). Prüfstand c2a2761 (für 0152/0157 bca4b7d); statische Checks alle grün. Messungen per `scripts/cdp.mjs` auf einem eigenen Storybook der Prüfer-Session.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Quelle ohne `label`: Art und Zitat, nie Kennung | `AiBookingNotes.tsx:250` `s.label ? … : null`; `--source-kinds`: „Kontoauszug „Zahlung vom 28.07.2026 …"", 0 UUIDs | ok |
| `SOURCE_OPENABLE` = bank, beleg, klaerung | `AiBookingNotes.tsx:86–94`; im DOM sind genau diese drei `BUTTON.ki__src--open`, `history/regel/gesetz` `DIV` | ok |
| Konto-Zeichen nur an Nummer mit Weg | `journalentrycompact--with-account-link`: Links `?account=1200/4400` mit Icon; zweite Karte ohne `href`: 0 Icons an `.v2mono` | ok |
| Weg ist Suchparameter | `href="?account=6815"` etc. | ok |
| BU-Spalte nur, wenn eine Zeile etwas darin hat | **`--filled`, `--in-use`, `--edges`: `.v2je--bu` gesetzt und Kopfzelle „BU" da, alle BU-Zellen leer.** Ursache `JournalEntryCompact.tsx:223`: `lines.some((l) => l.taxKey \|\| l.automaticRate !== null)` — `undefined !== null` ist wahr, die Spalte erscheint immer | **Mangel** |
| Schlüssel **und** Automatikmarke färben gelb | `--with-tax-key`: Zelle „3 Automatik 19 %" → `bdg bdg-warning`; „Automatik 19 %" allein → `bdg-neutral` | ok |
| Im Aufklapper Buchung vor Begründung, kein zweiter Kopf | `aibookingnotes--in-use`: Buchungsgitter (Index 0) vor „Begründung des Vorschlags" (162/194/201); `.ki__h` = 0 | ok |
| Spec beschreibt das Gebaute | Tabelle Wünsche/Umsetzung stimmt | ok |

**Urteil: in Arbeit.** Mangel: BU-Spalte in `v3-entitäten-buchungssatz-journalentrycompact--filled` (und `--in-use`, `--edges`) sichtbar, obwohl keine Zeile Schlüssel oder Automatik trägt — erwartet: keine Spalte (`JournalEntryCompact.tsx:223`, `!= null` statt `!== null`).

### Nacharbeit 2026-09-11 (durch den Bauenden, Nachprüfung offen)

| Mangel | Nacharbeit | Messung (6107) |
|---|---|---|
| BU-Spalte erscheint immer (`automaticRate !== null` ist bei `undefined` wahr) | `JournalEntryCompact.tsx`: `!= null` | `journalentrycompact--filled`, `--in-use`, `--edges`: keine `.v2je--bu`; `--with-tax-key`: Spalte da |

Die App rendert `JournalEntryCompact`; dort verschwindet die leere BU-Spalte ohne Codeänderung.

### Nachprüfung 2026-09-11 (Prüfer-Session, gegen c6f3f4d)

**Fertig.** BU-Spalte nur noch in `journalentrycompact--with-tax-key`.
