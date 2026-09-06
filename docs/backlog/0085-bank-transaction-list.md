# 0085 · BankTransactionList + BankTransactionColumns — der Kontoauszug

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/bank-transaction/` |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md`, Abschnitt „Listen" (Zeile `BankTransactionList`) |
| Auftrag | Der Kontoauszug eines Zahlungskontos als Liste: Zeile (`BankTransactionRow`), Zeitraum- und Zustands-Filter, Volltextsuche über Zweck, Gegenpartei, Betrag, Sachverhalt und SEPA-Referenzen, Aufklapper je Zeile für die zugeordneten Sachverhalte mit Teilbeträgen. Ersetzt `modules/bank-transactions/ui/KontoauszugView.tsx` (631 Z.). |
| Job | Wenn **ein Kontoauszug importiert ist**, will **die Sachbearbeiterin** **sehen, welche Zahlungen noch keinem Vorgang gehören**, damit **kein Geldfluss ungebucht durchrutscht**. |
| Umfang | je Konto und Jahr p50 36 · **p90 251** · max 952 (Staging 2026-09-05) → `Pagination`, Serverfilter, Lade- und Fehlerfall gehören in die Spec |
| Vertagt, weil | für die Route `[clientSlug]/[year]/banks/[accountId]` **kein Seitenprofil** unter `docs/seiten/` existiert. Ohne es sind Kopfzeile, Zeitraum, Saldo und die beiden Leerfälle geraten. |
| Zu entscheiden | Offene Frage 3 des Profils: gehört der laufende Saldo in die Zeile oder unter die Liste? *Default: unter die Liste* — eine Saldo-Spalte je Zeile stimmt nur bei genau einer Sortierung, und die Liste ist filterbar. Dass der Auszug heute gar keinen Saldo zeigt, ist Befund L-58. |
| Setzt voraus | `BankTransactionRow` (erste Welle) · `DataTable` (0057) · Seitenprofil `docs/seiten/kontoauszug.md` |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |

## Spec 2026-09-07 (Skill `spec-schreiben`), gebaut in derselben Sitzung

Die Wartebedingung ist weg: das Seitenprofil steht als
`docs/seiten/kontoauszug.md`.

### Einordnung

- **Wiederverwenden:** `DataTable` (0057) trägt Karte, Sortierung, Pager,
  Aufklapper und die fünf Zustände; `bankTransactionColumns()` (0101) trägt
  die acht Punkte; `FilterBar` (0003) bleibt bei der **Seite**.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 — das Profil führt die Liste,
  und was fehlt, ist nicht die Tabelle, sondern **wer den Spaltensatz, den
  Leerfall und die Breite dieses Auszugs kennt**.
- **Zuschnitt:** eine Datei, ein Export, 104 Zeilen. Die Liste wählt, übersetzt
  und reicht durch; sie rechnet nichts.
- **Setzt auf:** `DataTable`, `bankTransactionColumns`.

### Die eine Entscheidung: der Saldo steht unter der Liste

Offene Frage 3 des Profils, entschieden wie im Seitenprofil begründet: **ein
laufender Saldo je Zeile stimmt nur bei genau einer Sortierung und keinem
Filter** — und diese Liste ist beides, sortierbar und filterbar. Eine Zahl,
die nach jedem Filterklick etwas anderes bedeutet, ist schlechter als keine.
Der Saldo gehört deshalb in Zone 6, unter die Liste, und kommt als `footer`
vom Aufrufer. Solange die Zahlen fehlen (Befund L-58), steht dort eine
**benannte Lücke**, kein leerer Platz (Story `WithFooter`).

Zwei Punkte, die das Seitenprofil zusätzlich entschieden hat und die hier
eingebaut sind:

- Der **Vertagungsgrund entfällt.** Die Spec wartete auf ein Seitenprofil;
  seit `docs/seiten/kontoauszug.md` steht, sind Kopfzeile, Zeitraum, Saldo und
  die beiden Leerfälle nicht mehr geraten.
- **Leer ist hier weder Erfolg noch Lücke.** Ein Konto, auf dem im Zeitraum
  kein Geld bewegt wurde, ist nicht fertig und nicht kaputt — der Satz trägt
  deshalb **keinen Haken**. Nur „leer nach Filter" bekommt seinen eigenen Satz
  mit Weg zurück.

### Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `transactions` | `BankTransactionRowData[]` | ja | Die Zeilen **dieser Seite**, fertig sortiert und gefiltert | `Filled` |
| `caseHref` | `(caseId) => string` | ja | Wohin ein Sachverhalt führt | `Filled` |
| `openHref` | `string` | nein | Wohin „offen" führt — die Zuordnung | `Filled` |
| `expand` | `(t) => ReactNode` | nein | Was unter einer aufgeklappten Zeile steht: die Aufteilung mit Teilbeträgen | `Expanded` |
| `columns` | `BankTransactionColumn[]` | nein | Wählt aus dem Katalog; ordnet nicht um | (0086 `WithMatchStage`) |
| `listHref` | `(patch: ListPatch) => string` | nein | Sortierung und Blättern über die URL | `Filled` |
| `sort`, `pager`, `loading`, `error` | wie `DataTable` | nein | Durchgereicht | `Filled`, `LoadingAndError` |
| `filtered` | `{ summary, resetHref }` | nein | Der Leerfall nach Filter | `EmptyAfterFilter` |
| `head` | `{ title, sub?, actions? }` | ja | Kopf der Karte: Bank, Konto, Zeitraum | alle |
| `footer` | `ReactNode` | nein | Zone 6 — **der Saldo, und nur hier** | `WithFooter` |
| `rowHref` | `(t) => string` | nein | Der Weg in den Drawer einer Zahlung (0103) — das Seitenprofil nennt das Nachschlagen **oft**. Schließt `expand` aus, das ist die Regel von `DataTable` | `RowLink` |
| `density` | `TableDensity` | nein | Durchgereicht | — (Prop von `DataTable`, hier nur weitergegeben) |
| `minWidth` | `number` | nein | Voreinstellung **1400**, gemessen (siehe unten) | `Filled` bei 1280 px |

**Kann bewusst nicht:**

- **Zuordnen.** Sie zeigt, wohin „offen" führt; die Zuordnung ist die
  Arbeitsliste (0086) oder der Drawer (0103).
- **Den Saldo rechnen.** Sie stellt ihn nur dorthin, wo er stimmt.
- **Filtern oder suchen.** `FilterBar` steht über der Karte, bei der Seite.
- **Nach Konto gruppieren.** Ein Auszug ist ein Konto — das Gruppieren ist die
  Arbeitsliste.

### Stories

Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionList`. Abgeleitet nach
§6: 5 anwendbare Zustände (Laden und Fehler in **einer** Story
nebeneinander = 4 Stories) + 1 Callback (`expand`) + 1 Layout (`footer`) +
1 Weg ins Detail (`rowHref`, schließt `expand` aus und braucht deshalb eine
eigene) + 1 „im Einsatz" + 1 Rand = **9**.

| Story | Beweist |
|---|---|
| `Filled` | Acht Spalten, Sortierung am Kopf, Pager, „offen" als Wort mit Weg |
| `RowLink` | Der Weg in den Drawer — die Zeile als Link, ohne verschachtelten Anker |
| `Expanded` | Die Aufteilung unter der Zeile — der Aufrufer sagt, was drinsteht |
| `Empty` | Konto ohne Bewegung: eine **Feststellung**, kein Haken |
| `EmptyAfterFilter` | „Keine Treffer" mit Weg zurück |
| `LoadingAndError` | Kopf bleibt stehen; der Fehler nennt Ursache und nächsten Schritt |
| `WithFooter` | Der Saldo unter der Liste — heute als benannte Lücke (L-58) |
| `Extremes` | Die **breitesten** Werte jeder Spalte; daran sind die festen Spuren gemessen |
| `InUse` | `PageHeader` und `FilterBar` über der Karte — die ganze Seite |

### Abnahmekriterien

Fest: typecheck · build · Datei nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, keine lokale Label-Map · alle Stories · §9 · im
Browser angesehen.

Variabel:

- [ ] Kopf und Zeilen enden bei 1280/1440/1680/1920 px an derselben Kante (gemessen)
- [ ] **Keine** Zelle läuft über ihre Spur — auch nicht mit dem längsten Wort jeder Achse (Story `Extremes`, gemessen)
- [ ] Unter 1400 px rollt die Tabelle waagerecht, statt eine Spalte abzuschneiden (gemessen bei 1280 px)
- [ ] Der Saldo erscheint **nur** über `footer`, nie in einer Zeile (`grep`: keine Saldo-Spalte im Katalog)
- [ ] Der Leerfall des Kontos trägt **keinen** Haken, der Filterfall einen Weg zurück (Stories `Empty`, `EmptyAfterFilter`)
- [ ] `expand` entscheidet der Aufrufer; ohne ihn hat die Zeile keinen Aufklapper (Stories `Filled` gegen `Expanded`)
- [ ] Die Zeile hat einen Weg ins Detail, und er erzeugt keine verschachtelten Anker (Story `RowLink`, gemessen: 5 Zeilenlinks, 0 `a a`)
- [ ] Die Fehlerzeile trägt einen Weg zurück, nicht nur einen Satz (Story `LoadingAndError`, gemessen: ein Knopf)
- [ ] Keine Konsolenmeldung in allen acht Stories (gemessen)
- [ ] offen (App): ersetzt `KontoauszugView.tsx` (631 Z.)

### Beim Bauen gemessen

**Zwei feste Spuren waren schmaler als ihr breitester Wert.** Die Achse
`bank_match_stage` trägt „außerhalb des Bestands" — 169 px in einer 160-px-Spur,
der Text lief 9 px in die Rinne. Die Achse `ereignis` trägt „Keine Buchung
nötig" — mit der vorangestellten Fallnummer 187 px in einer 140-px-Spur. Beide
Werte sind **gemessen**, nicht geschätzt; die Spuren stehen jetzt auf 180 px
und 160 px. `max-content` schied aus: Kopf und Zeile sind getrennte Raster,
und jede aus dem Inhalt gerechnete Spur löst sich dort verschieden auf (0106).

**Die Fallnummer steht jetzt über dem Badge, nicht daneben.** Nebeneinander
hätte die Spur 187 px gebraucht — und diese Breite hätte **jede** Zeile
bezahlt, obwohl die Mehrfach-Zuordnung 4 % sind. Gestapelt kostet sie nur
diese 4 % eine Zeile, und die sind ohnehin die höchsten.

**`minWidth` deckt die Rechnung:** sieben feste Spuren = 1060 px, sieben
Rinnen à 10, zweimal 18 px Kartenpolster = **1166 px**. Bei der alten
Voreinstellung (1250) blieben dem Verwendungszweck **84 px**, und der Kopf
„Verwendungszweck“ (123 px) stand **39 px** außerhalb seiner eigenen Zelle.
Jetzt 1400, damit 234 px für den Zweck; darunter rollt `DataTable` waagerecht.

*(Der erste Wortlaut rechnete mit „zweimal 35 Polster“ und kam auf 50 px. Die
Abnahme hat nachgemessen: das Polster ist `12px 18px`. Der Schluss stimmte,
die Zahl nicht — und dieselbe falsche 70 stand in `sourceDocumentMinWidth()`
aus 0070, wo sie mitkorrigiert ist.)*

**Ein Kästchen ohne Wirkung.** Der Kopf der Auswahlspalte war im Leerfall
klickbar und wählte nichts. Behoben in `SelectAllCell` (0057) — es gilt für
jede Liste mit Auswahl, nicht nur für 0086.
