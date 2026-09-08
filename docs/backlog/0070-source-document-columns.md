# 0070 · Belegliste — Spaltensätze für `DataTable`

| | |
|---|---|
| Status | fertig (Schnittstelle) — die gemessene Prüfung steht in 0119 aus |
| Stufe | `entities/source-document/` — `SourceDocumentColumns` + kurze `SourceDocumentList` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Belegart, Einordnung und Erledigung sind Ludwig-Fachbegriffe |
| Quelle | Entitätsprofil `docs/entitaeten/source-document.md`, Abschnitt „Listen" (sechs Job-Sätze) |
| Ersetzt | die Zeilen von Belegliste `/[year]/documents`, `StuckDocumentsTable`, `DocumentInbox`, `InboxInvoiceSubmissionList`, `BelegeTab`, `ChildDocsCard` |
| Blockiert | die drei Beleg-Seitenprofile unter `docs/seiten/` |
| Setzt voraus | `SourceDocumentRow` (diese Familie), `DataTable` (0057) |
| Spec von / am | Claude, 2026-09-07 (Skill `spec-schreiben`, nach dem geprüften Profil und dem Seitenprofil `upload-inbox.md`) |

## Ziel

Sechs Listen zeigen denselben Beleg. Drei davon sind lang, gefiltert und
geblättert (Belegliste des Jahres, Upload & Inbox, Beleg einreichen) — das
ist `DataTable` mit je einem **Spaltensatz**, nicht drei Komponenten;
Vorbild `AccountEntries` (Entscheidung A11a). Drei sind kurz (Belege am
Sachverhalt p90 1, Teilbelege p90 0, stockende Belege ≤ 10) — das ist
`SourceDocumentRow` × n mit Leerfall.

Warum vertagt: die drei langen Listen haben je eine eigene Route und
brauchen nach §8 des Skills `entitaet-analysieren` **je ein Seitenprofil**
unter `docs/seiten/`. Kopfzeile, Vorratszähler, Tab-Leiste und Pager
gehören der Seite, nicht der Entität — solange die Seitenprofile fehlen,
würde die Liste Entscheidungen treffen, die ihr nicht gehören.

## Zuschnitt (Vorgriff, die Spec entscheidet)

- `SourceDocumentColumns` — der Spaltenkatalog, aus dem jede Seite ihren Satz
  wählt. Ein `variant` für die zwei Ausprägungen „stockend": in
  Verarbeitung und problematisch unterscheiden sich nur in Grundgesamtheit
  und Leerfall.
- `SourceDocumentList` — die kurze eingebettete Liste mit **zwei** Leerfällen:
  „kein Beleg zu erwarten" (mit Begründung, ein Erfolg) ist etwas anderes
  als „keine verbundenen Belege".

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Massenaktion „einreichen" | `SelectionScope` um die Tabelle, `bulk`-Slot | sobald die Zyklus-Seite gebaut wird — heute reicht der Knopf je Zeile |
| Filter über die Belegkategorie | `filter`-Prop der Seite | sobald `doc_category` über 46 % hinaus gefüllt ist (Profil-Befund B3) |

## Spec 2026-09-07 (Skill `spec-schreiben`, nach dem geprüften Profil)

### Einordnung

- **Wiederverwenden:** `DataTable` (0057) trägt Rahmen, Sortierung, Auswahl
  und Pager; `SourceDocumentRow` und `sourceDocTypeLabel()` tragen die Zelle;
  `StatusBadge` die vier Achsen (`beleg`, `beleg_inbox`, `beleg_kategorie`,
  `beleg_richtung`); `CaseCell` den Sachverhalt. Was fehlt, ist der
  **Spaltenkatalog** — welcher Punkt in welcher Liste steht.
- **Neu, weil:** `spec-schreiben` §3 Regel 5, und weil der Schnitt aus §8 des
  Profils es so entschieden hat: drei lange Listen, ein Katalog, kein
  dreifacher Baustein. Vorbild `accountEntryColumns` (A11a), Präzedenz seit
  0096 und 0101 in zwei weiteren Familien.
- **Zuschnitt:** eine Datei mit drei Funktionen —
  `sourceDocumentColumns()` (der Katalog), `sourceDocumentTracks()` (die
  Spurliste aus derselben Quelle) und `sourceDocumentMinWidth()` (die
  Mindestbreite, aus derselben Quelle wie die Spuren, damit die Tabelle nicht
  unter ihre eigenen Spalten schrumpft) — dazu vier benannte Sätze. Dazu
  `SourceDocumentList` als **eigene Datei** für die kurzen Listen: sie hat
  eine andere Frage (zwei Leerfälle statt Sortierung und Pager) und wird
  allein gebraucht.
- **Setzt auf:** `DataTable`, `SourceDocumentRow`, `StatusBadge`, `CaseCell`,
  `Time`, `Amount`, `MonoCell`.

### Der Katalog

Die Reihenfolge ist die des Profils und über alle drei Sätze dieselbe;
`columns` **wählt aus**, es ordnet nicht um — dieselbe Regel wie in 0096 und
0101.

| Schlüssel | Rang | Inhalt |
|---|---|---|
| `counterparty` | 1 | Gegenpart; fehlt er (5–50 % je Ausprägung), führt der Dateiname |
| `fileName` | 1b | Dateiname, in der Mitte gekürzt — die Kennung, die **jede** Ausprägung trägt |
| `kind` | 2 | Belegart über `sourceDocTypeLabel()`, Belegform als Rückfall |
| `form` | 2b | Belegform über `formatDocumentForm()` — **nicht** die Art: die Art ist, was der Beleg in Ludwig ist, die Form, was der Klassifikator vom Papier gelesen hat. Nur die Form entscheidet, ob ein Beleg zum Einreichen qualifiziert |
| `amount` | 3 | Maß der Ausprägung, rechts mit `tnum`; leer, wo die Ausprägung keins hat |
| `documentDate` | 4 | Belegdatum. NULL bleibt NULL — nie der Upload-Tag |
| `identifier` | 5 | Kennung der Ausprägung, Rückfallkette Nummer → Dateiname → Kurz-ID |
| `case` | 6 | Sachverhalt über `CaseCell` |
| `receivedDate` | 7 | Eingang, `NOT NULL`, der Sortierschlüssel der Belegliste |
| `classification` | — | Einordnung: Kategorie · Richtung · Belegform, je über ihre Achse |
| `confidence` | — | Achse `konfidenz` — wie sicher die Einordnung ist |
| `size` | — | Dateigröße, rechts; nur beim Einreichen, wo die 25-MB-Grenze zählt |
| `processing` | — | Verarbeitung, Achse `beleg` |
| `stuckState` | — | Achse `beleg_haenger` — woran der Beleg hängt. Was sie über denselben Beleg sagt, entscheidet `stuckVariant` |
| `inboxState` | — | Achse `beleg_inbox` — der einzige Zustand, den jede Ausprägung trägt |
| `completed` | — | Erledigt: Zeitpunkt und Weg, sonst „offen" |

### Die vier Sätze

| Satz | Liste | Spalten | Warum so |
|---|---|---|---|
| `DOCUMENT_LIST_COLUMNS` | Belegliste des Jahres | 1–7 + Einordnung + Verarbeitung + Erledigt | „kein unerledigter Beleg bleibt im Jahr zurück" — die Erledigung ist die Frage, alles davor die Identität |
| `INBOX_COLUMNS` | Upload & Inbox | Dateiname · Einordnung · Konfidenz · Zustand | Der Eingang kennt weder Jahr noch Sachverhalt; der Gegenpart ist erst das **Ergebnis** der Einordnung, deshalb führt hier die Datei |
| `SUBMIT_COLUMNS` | Beleg einreichen | Dateiname · **Belegform** · Größe · Erkennung | Die Größe steht nur hier: 25 MB je Datei ist die Grenze, an der das Einreichen scheitert. Die **Form** ist das Kriterium der Grundgesamtheit, nicht die Art — die beiden Achsen bleiben getrennt |
| `STUCK_COLUMNS` | Stockende Belege, beide Ausprägungen | Gegenpart · Datei · Sachverhalt · Eingang · Einordnung · Beleg-Zustand, geführt von der **Datei** (`lead`) | „nichts verschwindet still". Eine Prop `stuckVariant` entscheidet, was die Achse `beleg_haenger` über denselben Beleg sagt — zwei Ausprägungen, ein Satz (§8) |

**Konfidenz und Größe stehen im Typ** — der ursprüngliche Befund (B1/L-79),
sie fehlten dort, war falsch; `InboxEntry` trägt beide. Die Konfidenz ist dabei
eine **Zahl** (`numeric(5,4)`) und bekommt keinen Badge: die Achse `konfidenz`
gehört dem Buchungsvorschlag (Befund L-80). Siehe „Nach der Abnahme".

### Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `href` | `(doc) => string` | nein | Der Zeilenlink; er liegt am führenden Punkt (`.v2rowlink`) | `DocumentList` |
| `caseHref` | `(caseNumber: string) => string` | nein | Reicht an `CaseCell` durch. Der Parameter ist die Sachverhalts**nummer**, nicht seine Kennung: `SourceDocumentVM` trägt keine (L-207), und die beiden sind verschieden. Wer daraus `/cases/{id}` baut, verlinkt ins Leere | `DocumentList` |
| `columns` | `SourceDocumentColumn[]` | nein, Default `DOCUMENT_LIST_COLUMNS` | Welche Punkte. Wählt aus, ordnet nicht um | `Inbox`, `Submit` |
| `lead` | `"counterparty" \| "fileName"` | nein, abgeleitet | Welcher Punkt den Zeilenlink trägt. Ohne Angabe führt der Gegenpart, sobald er im Satz ist — richtig für vier der fünf Sätze und falsch für den stockenden, der mit der Datei führt | `Stuck` |
| `stuckVariant` | `"stuck" \| "inflight"` | nein, Default `"stuck"` | Welche der beiden Hänger-Listen. Sie entscheidet, was die Achse `beleg_haenger` über denselben Beleg sagt; gelesen nur von der Spalte `stuckState` | `Stuck` |

`SourceDocumentList` (kurze Liste): `documents`, `emptyKind`
(`"none" | "not-expected"`), `reason`, `href`.

**Kann bewusst nicht:**

- **Laden, filtern, blättern.** Das ist `DataTable` und die Seite.
- **Die Spalten umsortieren.** Die Reihenfolge gehört dem Profil.
- **Den Leerfall raten.** „Kein Beleg zu erwarten" ist ein Erfolg mit
  Begründung, „keine verbundenen Belege" eine Lücke — die kurze Liste bekommt
  gesagt, welcher gilt.
- **Dem leeren Sachverhalt einen Weg geben.** „offen" ist eine Aussage über
  den Beleg, kein Angebot: eine Belegliste hat keinen Ort, an den sie schicken
  könnte — der Sachverhalt entsteht aus dem Beleg heraus, und diesen Weg gibt
  es noch nicht. `CaseCell.emptyHref` bleibt deshalb ungesetzt und bekommt
  keine durchgereichte Prop (Sch6, entschieden 2026-09-08).

Alle Angaben sind wahlfrei: `sourceDocumentColumns()` ohne Argument ist der
Aufruf für die Belegliste.

### Stories

Titel `v3/Entitäten/Beleg/SourceDocumentColumns` bzw. `…/SourceDocumentList`.
Abgeleitet nach §6: 1 Zustand (gefüllt — lädt, leer und Fehler gehören
`DataTable`) + 3 Enums (`columns` mit vier Sätzen, `lead`, `stuckVariant` —
jede Achse **eine** Story) + 0 Layout + 0 Callbacks + 1 „im Einsatz" +
1 Rand = 6 für den Katalog; für die Liste
2 Leerfälle + 1 gefüllt + 1 „im Einsatz" = 4. *(Berichtigt nach der
Wiederabnahme 2026-09-07, M6: die Tabelle nannte `List` · `ListEmpty` ·
`ListNotExpected` · `ListInUse`, der Baum führt `Filled` · `Empty` ·
`NotExpected` · `InUse`; `Stuck` und `AllFour` fehlten ganz, und der von §6
verlangte Grund für die drei nicht geltenden Zustände stand nirgends.)*

| Story | Beweist |
|---|---|
| `DocumentList` | Der volle Satz: zehn Spalten, Sortierung am Eingang, Zeilenlink am Gegenpart |
| `Inbox` | Der Eingangs-Satz: die Datei führt, Konfidenz und Zustand stehen, kein Jahr und kein Sachverhalt |
| `Submit` | Der Einreich-Satz mit der Größe |
| `Edges` | Rand: ohne Gegenpart, ohne Belegdatum, ohne Betrag, 96-Zeichen-Dateiname |
| `Stuck` | Der stockende Satz: der Beleg-Zustand führt, der Gegenpart fehlt meist |
| `AllFour` | Alle vier Sätze untereinander — der Vergleich, den keine einzelne Story zeigt |
| `Filled` · `Empty` · `NotExpected` · `InUse` (`SourceDocumentList`) | Die kurze Liste mit ihren zwei Leerfällen. „lädt", „Fehler" und „leer nach Filter" gelten nicht: die Liste bekommt fertige Belege als Prop, lädt nichts und filtert nichts — was scheitern oder filtern kann, liegt bei der Seite |

### Abnahmekriterien

Fest: typecheck · build · Datei nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, kein px, keine lokale Label-Map · alle Stories ·
§9 · im Browser angesehen.

Variabel:

- [ ] Die Reihenfolge der Punkte ist in allen **vier** Sätzen dieselbe; `columns` wählt nur aus (Story `Inbox`, verdreht übergeben). Welcher Punkt **führt**, sagt `lead` — das ist die einzige Abweichung, und sie ist eine Prop
- [ ] Kopf und Zeilen enden bei **vier** Breiten an derselben Kante, kein Überlauf (gemessen)
- [ ] Der führende Punkt kürzt mit Ellipse und hat einen Boden (`minmax`), der Rest steht fest
- [ ] Zahlen rechts mit `tnum`, Dateiname und Kennung mono
- [ ] Jede der vier Achsen läuft über `StatusBadge`, keine lokale Map (`grep`)
- [ ] `confidence` zeigt den **Anteil in Prozent**, nicht ein Achsen-Wort — die Achse `konfidenz` gehört dem Buchungsvorschlag (Story `Inbox`, Befund L-80)
- [ ] `size` rechnet auf derselben Basis wie die Grenze, gegen die sie gelesen wird (`formatBytes`, binär wie `FileDrop`)
- [ ] Jede Liste rollt unterhalb ihrer `minWidth` waagerecht, statt eine Spalte abzuschneiden (`sourceDocumentMinWidth`, gemessen bei 700 px)
- [ ] Die Endung des Dateinamens bleibt **in** ihrer Zelle (Story `Edges`, gemessen)
- [ ] Ein Betrag ohne Währung steht ohne Zeichen da (Story `Edges`)
- [ ] Die kurze Liste unterscheidet ihre **zwei** Leerfälle (Stories `ListEmpty`, `ListNotExpected`)
- [ ] Ein Beleg ohne Gegenpart führt mit dem Dateinamen (Story `Edges`)
- [ ] offen (App): ersetzt die Zeilen der drei langen Listen und `BelegeTab`/`ChildDocsCard`

### Befunde für `ludwig/app`

- **B1** — `SourceDocumentVM` trägt weder die **Konfidenz** der Einordnung
  (Achse `konfidenz`) noch die **Dateigröße**. Beide stehen am Eingang der App;
  ohne sie bleibt die Inbox-Spalte „Konfidenz" und die Einreich-Spalte „Größe"
  leer. Kein lokaler Nachbau — die Punkte gehören in den Typ.

### Beim Bauen gemessen

**`ch` ist kein Maß für eine Spur.** (Der erste Wortlaut dieses Absatzes machte
daraus „eine dehnbare Spur je Tabelle" — das ist widerlegt: zwei dehnbare
Spuren mit px-Boden laufen exakt zusammen, eine mit `ch`-Boden nicht.) Der erste
Anlauf gab dem führenden Punkt `minmax(20ch, 1fr)` und der Kennung
`minmax(16ch, 0.8fr)`. Gemessen liefen Kopf und Zeilen **10 px** auseinander —
und der Grund ist eine Falle, die das Set schon dreimal auf andere Weise
getroffen hat: eine `ch`-Untergrenze rechnet sich aus der **Schriftgröße des
Elements**, und der Spaltenkopf steht auf 12,5 px, die Zeile auf 13,5. Zwei
dehnbare Spuren teilen sich den Rest also in Kopf und Zeile verschieden.

Jetzt `minmax(180px, 1fr)` für den führenden Punkt, die Kennung fest — nicht
weil zwei dehnbare Spuren ein Problem wären, sondern weil die Kennung nichts zu
wachsen hat. Gemessen
enden Kopf und alle Zeilen bei 1839 px, `scrollWidth − clientWidth` = 0, und
das waagerechte Scrollen trägt der `minWidth`-Rahmen (1840 = Summe der Spuren
plus neun Lücken plus Polster).

**`columns` ordnet nicht um:** die Story `Inbox` übergibt
`["inboxState", "confidence", "classification", "fileName"]` und bekommt
gemessen „Datei · Einordnung · Konfidenz · Zustand".

**Vier Punkte sind in den Typ gekommen**, zwei davon aus dem Profil
(`processingStatus`, Achse `beleg`, und `inboxStatus`, Achse `beleg_inbox` —
der einzige Zustand, den jede Ausprägung trägt), zwei als vermeintlicher Befund
**L-79** (`classConfidence`, `sizeBytes`) — der Befund war falsch, die App
trägt beide längst; siehe den Abschnitt nach der Abnahme.

## Nach der Abnahme vom 2026-09-07 — was sich geändert hat

Die Abnahme kam **zurück** und hat dabei zwei Dinge geleistet, die eine gute
Abnahme leistet: sie hat die zentrale Messung dieser Spec nachgerechnet und
bestätigt (der `ch`-Befund, mit eigenen Zahlen: Kopf 12,5 px gegen Zeile
13,5 px, 1ch = 8,25 gegen 8,531 px), und sie hat zwei Kriterien in genau der
Story fallen sehen, die sie beweisen sollte. Was jetzt anders ist:

### Der vierte Spaltensatz steht (M1)

`STUCK_COLUMNS` mit der Spalte `stuckState` über der Achse `beleg_haenger` und
`stuckVariant: "stuck" | "inflight"`. Beide Ausprägungen teilen sich einen
Satz — sie unterscheiden sich nur in Grundgesamtheit und Leerfall, und das ist
nach §8 eine Prop, keine zweite Komponente. Story `Stuck` zeigt beide
untereinander: **dieselben** Spalten, zwei verschiedene Wörter über denselben
Beleg.

Damit war auch der strukturelle Widerspruch fällig, den die Abnahme benannt
hat: der stockende Beleg führt mit der **Datei**, obwohl der Gegenpart im Satz
steht. Die Regel „`columns` wählt aus, ordnet nicht um" bleibt — was
dazukommt, ist eine Prop `lead`. Zwei Folgen, beide gemessen:

- Die **Reihenfolge** des stockenden Satzes ist die des Katalogs
  (Gegenpart · Datei · Sachverhalt · Eingang · Einordnung · Beleg-Zustand),
  nicht die der Profil-Tabelle. Das ist Absicht: §7 des Profils verlangt
  dieselbe Reihenfolge über **alle** Formen, und eine Liste, die sie für sich
  umdreht, bricht genau das. Die Profil-Zeile beschreibt die heutige
  App-Tabelle, nicht eine Anforderung an die Ordnung.
- Der Gegenpart fällt **nicht mehr** auf den Dateinamen zurück, wenn die Datei
  ohnehin ihre eigene Spalte hat — sonst stand derselbe Name zweimal in einer
  Zeile. Gemessen im stockenden Satz, wo ein Gegenpart die Ausnahme ist.

### Belegform statt Belegart beim Einreichen (M2)

Die Grundgesamtheit dieser Liste ist „eingeordnet **und** qualifizierende
Belegform" — die Form ist das Kriterium, das dort geprüft wird. Neue
Katalogspalte `form` über `formatDocumentForm()`; `SUBMIT_COLUMNS` nimmt sie
statt `kind`. Die beiden Achsen sind laut GLOSSARY orthogonal und bleiben es.

### Die Endung des Dateinamens (M3)

Die Mitten-Kürzung nach Zeichen wurde vom CSS am Ende noch einmal gekappt:
gemessen lag „.pdf" **69 px** außerhalb seiner Zelle — in der `Edges`-Story,
die das Gegenteil beweisen sollte. Jetzt trägt der Katalog `FileName` (Name
und Endung in zwei Spans, nur der Name schrumpft), und `.v2doccol__lead` ist
die Flex-Box dazu. Gemessen: die Endung endet bei 249 px in einer Zelle, die
bei 249 px endet — bei 1440, 900 und 700 px.

Ein Zwischenschritt gehört in die Lehre: der erste Versuch schrieb
`> *:not(.v2doc__keyname) { flex-shrink: 0 }` — die Regel traf den Zeilenlink
selbst und nagelte ihn fest; die Endung stand danach 150 px draußen. Richtig
ist `.v2doc__keyname + *`: nur das, was **hinter** dem Namen steht.

### `minWidth` ist keine Handarbeit mehr (M4)

`sourceDocumentMinWidth(columns)` rechnet Spuren, Rinnen und Polster. Vorher
setzten zwei Stories die Zahl von Hand und zwei gar nicht — gemessen verlor
`Inbox` bei 700 px 132 px ihrer letzten Spalte, ohne Scrollweg, und die Karte
schneidet ab. Jetzt rollt jede der vier Listen waagerecht, statt eine Spalte zu
verschlucken (gemessen bei 700 px).

### Achsenwerte, Währung, Zahlen (M5, M6, M7, M8)

- Die Fixtures führten `processingStatus: "booked"` und `"extracted"` — beides
  kennt die Achse `beleg` nicht, und die Spalte zeigte gemessen das rohe Wort
  **„booked"**. Jetzt `processed`, `in_progress`, `review_needed`, `failed` —
  die Spalte zeigt damit auch eine Kritikalitätsstufe.
- `currency={m.currency ?? "EUR"}` ist weg. Die Familie schreibt eine Datei
  weiter, dass `currency: null` eine Dezimalzahl **ohne** Währung ist; ein
  stilles „€" auf einer Schweizer Rechnung ist eine falsche Tatsache, kein
  Format-Vorgabewert. Story `Edges` zeigt „2.480,00" ohne Zeichen.
- Zwei Byte-Formatierer stritten sich um die 25-MB-Grenze: der Katalog rechnete
  dezimal, `FileDrop` binär — und die Prüfung der Grenze ist binär. Jetzt
  einer, `formatBytes` in `format.ts`, von beiden benutzt.
- **Die Konfidenz ist eine Zahl, keine Achse.** `class_confidence` ist
  `numeric(5,4)`; die Achse `konfidenz`, die dem Namen nach passt, gehört dem
  Buchungsvorschlag und hätte einer Belegklassifikation „Bitte Konto und
  Steuerschlüssel prüfen" geantwortet. Die Spalte zeigt jetzt den Anteil als
  Prozentzahl, rechtsbündig — so wie die Belegtabs der App ihn schon schreiben.
  Der Typ trägt `classConfidence: number | null` statt `string`.

### Die Spec selbst war an drei Stellen falsch (M8a, M16, M17)

- **Das „—"-Kriterium ist gestrichen.** Es widersprach dem eigenen Abschnitt
  „Beim Bauen gemessen": die Felder **sind** im Typ, die Spalten zeigen echte
  Werte. Die Abwägung („eine Inbox ohne Konfidenzspalte sähe vollständig aus,
  während sie die halbe Antwort schuldig bleibt") war richtig gestellt und
  falsch beantwortet, weil der dritte Weg — die Spalte **füllen** — offenstand.
- **Befund B1/L-79 stimmte nicht.** `InboxEntry` trägt beide Felder längst;
  L-79 ist im Register zurückgezogen und auf das Durchreichen ins View-Model
  der Belegliste eingeschränkt. Neu: **L-80** (eigene Achse für die
  Klassifikations-Konfidenz) und **L-81** (die Hänger-Ableitung gehört in
  `domain/`, nicht in die UI).
- **Die Lehre aus der Messung war zur Hälfte falsch.** „Eine dehnbare Spur je
  Tabelle" ist keine Regel — nachgemessen laufen zwei dehnbare Spuren mit
  px-Boden exakt zusammen (Δ 0), während **eine** dehnbare Spur mit `ch`-Boden
  schon 5,4 px auseinanderläuft. Die Regel lautet: **`ch` ist kein Maß für eine
  Spur.** Kommentar und Spec sagen das jetzt beide.

### Dazu, ohne eigene Nummer

- Die vier Zustandsspalten tragen ihr **(i)** jetzt selbst (`headerAside`,
  Z4) — vorher hängten die Stories es von Hand in ihren eigenen Kopf und
  verdeckten die Lücke (M9). Dasselbe steht für `caseColumns` und
  `bankTransactionColumns` noch aus.
- Der Kopf „Zustand" heißt **„Erkennung"** (M10): Z4 verbietet das leere Wort,
  und die Spalte sagt eine bestimmte Sache — wie weit die Einordnung kam.
- Die Stories laufen jetzt über **`DataTable`** statt über handgebauten Kopf
  und Zeilen (M12). Damit findet die Sortierung, die der Katalog anbietet,
  auch statt: gemessen vier Sortier-Links im Kopf der Belegliste. Der
  Spaltensatz wird dadurch das, was er sein soll — der Katalog **für**
  `DataTable`, nicht daneben.
- Deutsche Kommentare im Katalog sind englisch (M14), `sourceDocumentTracks`
  hat `@when`/`@instead` (M15).

**Offen aus der ersten Abnahme:** nur noch M11 (`CaseCell` bekommt eine
erfundene `kind`). M13 und M18 sind entgegen einer früheren Fassung dieses
Absatzes **beide** erledigt — die Nachabnahme hat es nachgemessen: Gewicht
600, Farbe geerbt, Kennung mono, Haken im Erfolgs-Leerfall.

## Zweite Runde, 2026-09-07 — zwei Fixes hatten neue Verstöße eingebaut

Die Nachabnahme kam wieder **zurück**, knapp und aus dem lehrreichsten Grund:
zwei der acht Korrekturen haben gegen genau die Regeln verstoßen, die sie
wiederherstellen sollten.

**N1 — der `lead`-Fix baute zwei Zeilenlinks.** Die Gegenpart-Zelle rief
`leading()` **unbedingt**; steht sie im Satz und führt die Datei, trugen beide
Zellen einen `.v2rowlink` auf dasselbe Ziel — und der erste hieß „—", weil ein
stockender Beleg keinen Gegenpart hat. Ein Fokus-Stopp mit dem zugänglichen
Namen „Gedankenstrich" ist das Gegenteil von I11. Jetzt liest **jede** der
beiden Zellen `lead`, nicht nur eine. Gemessen: ein Zeilenlink je Zeile, in
allen vier Sätzen.

**N2 — der Mono-Fix schaltete die Kürzung ab.** `sourceDocumentIdentifier`
gibt für den Dateinamen-Rückfall jetzt `mono: true` — und damit lief der Wert
in den `MonoCell`-Zweig, der ihn **ungekürzt** ausgibt. Gemessen: 81 Zeichen
in einer 170-px-Spur, sechs Zeilen, **130 px** Zeilenhöhe gegen 48 px normal.
Der Fehler war, `mono` als Antwort auf zwei verschiedene Fragen zu benutzen:
*wie wird gesetzt* und *wie wird gekürzt*. Die Rückfallkette gibt jetzt
zusätzlich `isFileName` zurück; damit setzen Zeile **und** Katalog den Namen
mono **und** kürzen ihn in der Mitte. Gemessen: zurück auf 48 px.

**N3 — die Grundgesamtheit der Einreich-Liste war halb geprüft.** „eingeordnet
**und** qualifizierende Belegform" — die Fixtures prüften nur die erste
Hälfte, und der M2-Fix machte den Widerspruch erst lesbar: in der neuen
Belegform-Spalte standen „Kontoauszug" und „Vertrag", beide mit
`invoiceFlow: false`. Jetzt filtert die Story mit
`formQualifiesForInvoiceFlow()`, und zwei qualifizierende Fixtures kommen
dazu. Gemessen: Rechnung · Bewirtungsbeleg · Tankquittung.

Dazu die drei kleineren: **N4** — die `Stuck`-Story zeigte zwei disjunkte
Reihen und behauptete „zwei Wörter über denselben Beleg"; jetzt stehen in
beiden Tabellen dieselben zwei Belege, einer mit Rechnungszeile, einer ohne,
und damit fallen **alle vier** Werte der Achse. **N5** — die Einordnungsspalte
zeigt vier Achsen und trug ein (i); jetzt drei, eins je erklärbarer Achse.
**N6** — die Kennung wiederholte den Dateinamen, den die Zeile schon führt;
die Zeile prüft das seit 0074 (`identRepeatsLead`), der Katalog kannte die
Prüfung nicht.

**Die Lehre, in einem Satz:** ein Wert, der zwei Fragen beantwortet
(`mono` = wie gesetzt **und** wie gekürzt), ist keine Antwort, sondern eine
Verwechslung, die auf ihren Anlass wartet. Und: ein Fix, der eine Spalte
richtigstellt, deckt auf, was die Daten dahinter falsch machen — der M2-Fix
hat N3 sichtbar gemacht, nicht verursacht.

**Weiter offen:** M11. Seit dem Umstieg auf `DataTable` ist die erfundene
`kind` teurer geworden — sie steht als Titelzeile „Eingangsrechnung: …" in
jeder Zeile mit Sachverhalt und treibt die Zeile auf 73 px. Der Fix gehört
`CaseCell` (`kind` optional), nicht diesem Katalog.

## Abnahme (2026-09-07)

Fremde Abnahme, ohne Chat-Verlauf, gegen Spec und `docs/design-guidelines.md`
§9 (die zwei App-Punkte übersprungen). Gemessen im Storybook-Dev-Server auf
6107 über CDP; jede Zahl mit Gegenprobe.

**Ergebnis: zurück.** Es blockieren M1 und M2 — beide reißen einen Punkt der
Kriterienliste, beide sind in dieser Datei zu beheben.

### Was gehalten hat (gemessen)

| Kriterium | Messung |
|---|---|
| Kopf und Zeilen an derselben Kante, kein Überlauf | `maxDiff = 0` in allen vier Sätzen bei 700 · 900 · 1100 · 1280 · 1440 · 1900 · 2200 px — auch dort, wo die dehnbare Spur wirklich zieht (`Inbox` 1440: Datei 482 px; `Stuck` 1440: zwei dehnbare Spuren, beide 316 px). Gegenprobe: eine Spur nur im Kopf auf `minmax(220px, 1fr)` → Kopf 1775 gegen Zeile 1735 px, zurückgesetzt wieder 1735/1735 |
| Führender Punkt mit Boden, Rest fest | `minmax(180px, 1fr)` / `minmax(200px, 1fr)`, alle übrigen Spuren fest; bei 700 px stehen sie auf ihren Böden 180/200 |
| Waagerechtes Rollen unter `minWidth` | bei 700 px: Belegliste 1736/666, Inbox 816/666, Einreichen 736/666, Stockend 1146/666, `overflow-x: auto`, Seite selbst ohne Überlauf (`scrollWidth = clientWidth = 700`) |
| `columns` wählt aus, ordnet nicht um | `Inbox` übergibt `["inboxState","confidence","classification","fileName"]`, gemessener Kopf: Datei · Einordnung · Konfidenz · Erkennung |
| `lead` | `Stuck`: der `.v2rowlink` sitzt in Spalte 1 (Datei), genau einer je Zeile, in beiden Tabellen und in allen vier Sätzen |
| Endung bleibt in der Zelle | `Edges`, 96-Zeichen-Name: `.pdf` endet bei 215,0 px in einer Zelle, die bei 215,0 px endet — bei 1440, 900 und 700. Gegenprobe: `flex-shrink: 0` auf den Namen → die Endung liegt 1850,6 px draußen; mit 200 Zeichen im Namen bleibt sie bei 0 |
| Zahlen rechts mit `tnum` | `font-variant-numeric: lining-nums tabular-nums`, `text-align: right` an Betrag, Konfidenz, Größe |
| Vier Achsen über `StatusBadge` | keine lokale Map im Katalog; Werte alle im Wertebereich der Registry (`processed`, `in_progress`, `review_needed`, `failed`; `classified`, `pending_classification`; die vier von `beleg_haenger`) |
| Konfidenz als Anteil | „94 %", „71 %", „88 %", rechtsbündig; `null` → „—" |
| Größe binär, ein Formatierer | `formatBytes` aus `format.ts`, auch von `FileDrop` benutzt: 412 000 → „402 kB", 1 100 000 → „1,0 MB" |
| Betrag ohne Währung | `Edges` d10: „2.480,00" ohne Zeichen |
| Beleg ohne Gegenpart | `Edges` d4/d9: führt mit dem Dateinamen, der Zeilenlink liegt darauf |
| Zwei Leerfälle der kurzen Liste | „Keine verbundenen Belege" ohne Zeichen gegen „Kein Beleg zu erwarten" + Begründung + `circle-check` |
| Spurbreiten gegen den Wertebereich | breitester Wert je Achse in die echte Zelle geschrieben: Erledigt „Sachverhalt geschlossen" 156,1 px in 170 px; Verarbeitung „Fehlgeschlagen" 104,8 px in 160 px; Belegart „Kreditkartenabrechnung" 154,7 px in 170 px; Betrag „1.234.567,89 €" 93,4 px in 130 px — alle einzeilig. **Ausnahme: Einordnung, siehe M1** |
| Fokus und Hover | mit echten Tabulator-Anschlägen: `.v2rowlink` bekommt `outline: solid 2px rgb(59,143,196)`, Offset 2 px; `.v2tbl__row:has(.v2rowlink):hover` färbt die ganze Zeile |
| Fest | `pnpm typecheck` Exit 0, `pnpm check:icons` Exit 0, `pnpm check:contrast` Exit 0; Barrel-Export vollständig; Code englisch, `@when`/`@instead` an allen drei Funktionen und an `SourceDocumentList`; kein Hex, keine lokale Label-Map (px nur als Rasterspuren — Präzedenz `accountEntryColumns`, `caseColumns`, `bankTransactionColumns`). **Nicht geprüft: `build`** (in dieser Runde untersagt, 0117) |

### Story-Deckung

Jede Prop hat ihre Story: `href`/`caseHref` → `DocumentList`, `columns` →
`Inbox`/`Submit`/`AllFour`, `lead` und `stuckVariant` → `Stuck`; die kurze
Liste deckt `documents`, `emptyKind`, `reason`, `href` ab. Nach §6 ergeben
sich 1 Zustand + 2 Enum-Props (`columns`, `stuckVariant`) + 1 „im Einsatz" +
1 Rand = 5; gebaut sind 6 (die Obergrenze 10 ist eingehalten). Was fehlt, ist
die Buchführung darüber — siehe M7.

### Mängel

**M1 — die Einordnungsspalte drückt die Zeile auf 73 px.**
`source-document-columns.tsx:374` gibt `classification` 220 px. Die Zelle
trägt bis zu vier Achsen und bricht um: Story
`v3-entitäten-beleg-sourcedocumentcolumns--inbox`, Zeile d1 (eine gewöhnliche
Eingangsrechnung) — Badge „Leistungsbeleg" 102,1 px + „Eingangsrechnung"
121,0 px + 4 px Rinne = **227,1 px** in einer 220-px-Spur. Ist: Zelle 48,2 px,
Zeile **73,2 px**; Soll: 47–48 px wie die drei Nachbarzeilen. Dasselbe in
`DocumentList` (Zeile 1), `Edges` (Zeilen 3 und 4: 73,2 und 72,2 px) und
`AllFour`. Mit allen vier Achsen („Zahlungsbeleg · Ausgangsrechnung ·
§14-UStG-Gutschrift · Auszahlung Zahlungsdienstleister") braucht die Zelle
429,6 px und die Zeile wird 125,4 px hoch. Gegenprobe: Spur zur Laufzeit auf
260 px → Zelle 22,1 px, Zeile 47,1 px; zurück auf 220 px → wieder 73,2 px.
Das ist §9 „Zeilenhöhe ≤ `.v2tbl__row`" und der Wortlaut von V1 („Chip drückt
die Zeile auf — der Chip wird kleiner, nicht die Zeile größer").
Kleinster Weg: die Spur auf das Maß der zwei Achsen bringen, die zusammen
auftreten (gemessen ≥ 232 px), oder eine Achse aus der Zelle nehmen.

**M2 — der Dateiname ist nur in drei von vier Sätzen mono.**
`source-document-columns.tsx:224–244`: fällt der Gegenpart aus, zeigt die
Zelle den Dateinamen, aber ohne `v2mono`. Gemessen `DocumentList` Zeile 4 und
`Edges` Zeilen 1 und 3: „Scan-2026-09-01-14-32-08.pdf" in **Inter**, während
derselbe Wert in `Inbox` (Spalte Datei) und in der Kennung derselben Tabelle
(`DocumentList` Zeile 2) in **JetBrains Mono** steht. Das reißt „Dateiname
und Kennung mono" und wiederholt genau den Fehler, den
`sourceDocumentIdentifier` schon einmal behoben hat („one document, two
typefaces in one row"). Kleinster Weg: `v2mono` an die Gegenpart-Zelle, wenn
sie den Dateinamen zeigt.

**M3 — das (i) steht jetzt zweimal: am Kopf und in jeder Zeile.**
Der M9-Fix hat `headerAside` ergänzt, aber drei der Badges behalten ihr
eigenes (i): `processing` (Z. 386), `inboxState` (Z. 414), `stuckState`
(Z. 403) rufen `StatusBadge` ohne `info={false}`, während `classification`
und `completed` es über ihre Komponenten abschalten. Gemessen: `DocumentList`
4 von 4 Zeilen mit „Beleg: Zustände erklären" — wortgleich mit dem Knopf im
Kopf; `Inbox` 4 von 4 mit „Dokument: Zustände erklären"; `Stuck` 2 von 2 in
beiden Tabellen. Auf einer Seite mit 25 Zeilen sind das 25 zusätzliche
Tabulator-Anschläge je Zustandsspalte für dieselbe Erklärung (Z4/R1: die
Legende steht einmal am Kopf). Kleinster Weg: `info={false}` an die drei
Badges.

**M4 — die Sachverhaltszelle sagt zweimal etwas anderes als `CaseCell`.**
`source-document-columns.tsx:335–354`: ohne `caseNumber` schreibt der Katalog
ein eigenes „—" (gemessen `DocumentList` Zeilen 2 und 3, beide `Stuck`-Zeilen),
statt `CaseCell` seinen eigenen Leerfall „offen" schreiben zu lassen — dessen
Kommentar genau das begründet („a dash would say ,unknown'"). Und mit
Sachverhalt steht dort die erfundene `kind: "incoming_invoice"` (der schon
bekannte, weiter offene M11): gemessen „Eingangsrechnung: Bürobedarf Meier
GmbH", Titel-Link 170 px = volle Spur, die Nummer bricht darunter, Zelle
46,7 px. Der zweite Teil gehört `CaseCell` (`kind` optional), der erste
gehört hierher.

**M5 — `completed` zeigt den Weg, nicht den Zeitpunkt.** Die Katalog-Tabelle
der Spec sagt „Erledigt: Zeitpunkt und Weg, sonst ,offen'". Gemessen steht in
der Zelle nur „Gebucht" (Badge 64,9 px in einer 170-px-Spur); `completedAt`
(2026-08-30) kommt in keiner Zeile vor. Entweder die Spalte zeigt den
Zeitpunkt, oder die Spec streicht ihn.

**M6 — die vierte Achse der Einordnung hat kein (i).** `headerAside`
(Z. 367–373) trägt `beleg_kategorie`, `beleg_richtung`, `dokumentgruppe`;
`SourceDocumentClass` kann zusätzlich `beleg_charakter` zeigen. Keine Fixture
setzt `classDocumentKind` oder `collectionKind` — der breiteste Fall der
Spalte steht also in keiner Story und ist bisher nirgends geprüft (siehe M1).

**M7 — die Story-Tabelle der Spec deckt sich nicht mit dem Baum.** `Stuck`
und `AllFour` fehlen in ihr (Stuck steht nur im Nachtragsabschnitt, AllFour
nirgends); die kurze Liste heißt in der Spec `List` · `ListEmpty` ·
`ListNotExpected` · `ListInUse`, im Code `Filled` · `Empty` · `NotExpected` ·
`InUse`. Für `SourceDocumentList` fehlt außerdem der von §6 verlangte Grund,
warum „lädt", „Fehler" und „leer nach Filter" nicht gelten.

**M8 (klein) — im stockenden Satz sind zwei Spalten fett.**
`.v2doccol__lead` setzt `font-weight: 600` unbedingt; gemessen tragen in
`Stuck` sowohl die Gegenpart- als auch die Datei-Zelle 600 — in Zeile 1 also
ein fettes „—" neben dem führenden Dateinamen. Führen soll einer.

### Abgenommen von / am

Claude (fremde Abnahme, ohne Bau-Verlauf), 2026-09-07 — **zurück**,
blockierend sind M1 und M2.

## Nach der Abnahme (2026-09-07)

Die zwei blockierenden Mängel sind behoben, dazu der erste der nicht
blockierenden.

**M1 — die Einordnungsspalte drückte die Zeile auf 73,2 px.** Die zwei
Abzeichen brauchen 227,1 px (102,1 + 121,0 plus 4 px Rinne), die Spur war
220 px breit; die Zelle brach um, und die Zeile war anderthalbmal so hoch wie
ihre Nachbarn — V1 verlangt eine Zeilenhöhe. Die Spur steht jetzt auf 232 px.
Gemessen in `Inbox` bei 1440 px: Zeilen **47,1 · 47,1 · 47,1 · 46,1**, Spur
232,0.

**M2 — der Dateiname war nur in drei von vier Sätzen mono.** Im
Gegenpart-Rückfall stand derselbe Wert in Inter, während ihn die Spalte
„Datei" und die Kennung derselben Tabelle in JetBrains Mono zeigten. Gemessen
sind es jetzt in allen Sätzen JetBrains Mono.

**M3 — das (i) stand doppelt.** Der Kopf trägt es (Z4), und die Abzeichen in
den Zeilen brachten ihr eigenes mit — wortgleich, in jeder Zeile. Gemessen in
`Inbox`: **4 im Kopf, 0 in den Zeilen**.

**M4 bis M8 bleiben offen und sind hier vermerkt:** das eigene „—" statt des
„offen" von `CaseCell` samt der erfundenen `kind`; `completed` ohne Zeitpunkt;
die vierte Achse ohne (i) und in keiner Fixture; die Story-Tabelle der Spec,
die sich nicht mit dem Baum deckt; und die zwei fetten Spalten im stockenden
Satz. Keiner davon blockiert, und jeder braucht eine Entscheidung, keine
Reparatur.

## Wiederabnahme (2026-09-07)

Fremde Wiederabnahme, ohne Bau-Verlauf, gegen die Spec und
`docs/design-guidelines.md` §9. Gemessen im Dev-Server auf 6107 über CDP,
eigenes Skript; jede Zahl mit Gegenprobe. Die Nummern M1–M6 unten sind die
**dieser** Runde.

**Ergebnis: zurück.** Es blockiert M1: der M2-Fix der letzten Runde hat den
Dateinamen mono gemacht und dabei die Kürzung abgeschaltet — die Endung steht
wieder außerhalb ihrer Zelle, gemessen 180 px, und überschreibt die
Nachbarspalte. Das ist genau das Kriterium, das die Story `Edges` beweisen
soll, und derselbe Mechanismus wie N2 aus der zweiten Runde.

### Die drei Reparaturen der letzten Runde

| Was | Messung |
|---|---|
| **M1 (Einordnung 220 → 232 px) — behoben** | `Inbox` bei 1440: Spur **232,0**, Zelle **22,1**, Zeilen **47,1 · 47,1 · 47,1 · 46,1**. Gegenprobe zur Laufzeit: Spur auf 220 px → Zelle 48,2, Zeile **73,2**; auf 260 px → 47,1; zurück auf 232 → 47,1. Wertebereich in der echten Zelle: das breiteste Paar der zwei Achsen, die zusammen auftreten (`Leistungsbeleg` 97,3 + `Ausgangsrechnung` 124,3 + 4 px Rinne = **225,6**), passt in 232 px, Zeile bleibt 47,1 — 6,4 px Luft |
| **M2 (Dateiname mono) — Schrift behoben, Kürzung gerissen** | Der Wert steht jetzt überall in JetBrains Mono 12,5 px/600: `DocumentList` Zeile 4 und `Edges` Zeilen 1 und 3 gemessen. **Aber:** siehe M1 unten |
| **M3 (das (i) stand doppelt) — behoben** | Knöpfe im Kopf / in allen Datenzeilen: `DocumentList` **5 / 0**, `Inbox` **4 / 0**, `Submit` **1 / 0**, `Stuck` **4 / 0** in beiden Tabellen. Die fünf im Kopf der Belegliste heißen Belegkategorie · Belegrichtung · Art der Dokumentgruppe · Beleg · Erledigung |

### Was gehalten hat (gemessen, mit Gegenprobe)

| Kriterium | Messung |
|---|---|
| Kopf und Zeilen an derselben Kante | `maxDiff = 0` in allen vier Sätzen bei **700 · 900 · 1100 · 1280 · 1440 · 1900 · 2200 px** (`AllFour` alle vier Tabellen, `Stuck` beide) |
| Boden der führenden Spur, Rest fest | `minmax(180px, 1fr)` / `minmax(200px, 1fr)`; bei 700 px stehen sie auf 180 bzw. 200, alle übrigen Spuren fest |
| Waagerechtes Rollen unter `minWidth` | bei 700 px: Belegliste 1748/666, Inbox 828/666, Einreichen 736/666, Stockend 1158/666, `overflow-x: auto`, Seite selbst ohne Überlauf (`scrollWidth = clientWidth = 700`) |
| `columns` wählt aus, ordnet nicht um | `Inbox` übergibt `["inboxState","confidence","classification","fileName"]`, gemessener Kopf: Datei · Einordnung · Konfidenz · Erkennung |
| `lead` | genau **ein** `.v2rowlink` je Zeile in allen vier Sätzen; in `Stuck` sitzt er in Spalte **1** (Datei), in der Belegliste in Spalte 0 (Gegenpart) |
| Zahlen rechts mit `tnum` | Betrag, Konfidenz, Größe: Kopf `text-align: right`, Zelle `text-align: right` und `font-variant-numeric: lining-nums tabular-nums`; die rechte Textkante liegt auf der Spurkante (Inbox 700: Konfidenz 627,0 = 627,0; Submit 700: Größe 535,0 = 535,0) |
| Konfidenz als Anteil | 94 % · 71 % · 88 %, `null` → „—" |
| Größe binär, ein Formatierer | `formatBytes` aus `format.ts`, auch von `FileDrop` benutzt: 412 000 → „402 kB", 1 100 000 → „1,0 MB", 240 000 → „234 kB" |
| Betrag ohne Währung | `Edges` d10: „2.480,00" ohne Zeichen; der Vertrag (d3) hat gar keine Zelle (Höhe 0) |
| Vier Achsen über `StatusBadge` | keine lokale Map, kein Hex, kein px in der Datei außer den Rasterspuren; Barrel-Export vollständig |
| Zwei Leerfälle der kurzen Liste | „Keine verbundenen Belege" + Erklärsatz gegen „Kein Beleg zu erwarten" + Begründung + `circle-check` |
| Sortierung | vier Sortier-Links im Kopf der Belegliste (Gegenpart · Betrag · Belegdatum · Eingang) |
| Fest | `pnpm typecheck` · `check:icons` · `check:contrast` · `check:when` · `check:language` · `check:mirror` alle Exit **0**. **Nicht geprüft: `build`** (untersagt, 0117) |

**Zum Tabellen-Reset (0106, `:where()`).** Die Sonderzellen dieses Satzes
durchgemessen: `td`/`th` tragen `padding: 0px` aus dem Reset, `th` steht links —
und `.v2num` gewinnt jetzt als Klassenregel gegen beide, im Kopf **und** in der
Zelle (oben gemessen, Textkante = Spurkante). `.v2doccol__lead` mit
`font-weight: 600` sitzt auf einem Span in der Zelle, nicht auf der Zelle
selbst, und ist vom Umbau unberührt. **Keine Regression aus 0106 in diesem
Satz.**

### Mängel

**M1 (blockiert) — die Endung steht wieder außerhalb ihrer Zelle; der
Mono-Fix hat die Kürzung abgeschaltet.**
`source-document-columns.tsx:235–237`: der Gegenpart-Rückfall legt `FileName`
jetzt in einen **zusätzlichen** `<span className="v2mono">`. Damit ist nicht
mehr `.v2doc__keyname` das Flex-Kind von `.v2doccol__lead`, sondern der neue
Span — und der hat `min-width: auto` und schrumpft nicht. Gemessen in
`v3-entitäten-beleg-sourcedocumentcolumns--edges` bei 1440 px:

- Zeile 3 (d9, der 96-Zeichen-Name): der Hüll-Span ist **360,0 px** breit in
  einer 180-px-Spur; der Name läuft von 35,0 bis 365,0, „.pdf" endet bei
  **395,0** in einer Zelle, die bei **215,0** endet — **180,0 px draußen**. Er
  überschreibt die Nachbarspalte: „Rechnung" steht bei 225,0–289,3,
  **64,3 px Überlappung**.
- Zeile 1 (d4, „Scan-2026-09-01-14-32-08.pdf"): „.pdf" bei 245,0 gegen
  Zellkante 215,0 — **30,0 px draußen**. Dasselbe in `DocumentList` Zeile 4.
- Dieselben Zahlen bei **900** und **700 px**. Bei 1900 px verschwindet es,
  weil die dehnbare Spur dann 298 px hat — der Fehler zeigt sich immer, wenn
  die führende Spur auf ihrem Boden steht.

Gegenprobe, zur Laufzeit, zweimal: (a) `.v2doccol__lead > … > .v2mono
{ display:flex; min-width:0 }` → Name endet bei 185,0, „.pdf" bei **215,0**,
Überstand **0** in allen drei Breiten; (b) den Hüll-Span aus dem Baum entfernt
→ Name 188,6, „.pdf" **215,0**, Überstand **0**. Soll: 0.

Das reißt zwei Kriterien: „Die Endung des Dateinamens bleibt **in** ihrer Zelle
(Story `Edges`, gemessen)" und „Der führende Punkt kürzt mit Ellipse". Es ist
derselbe Mechanismus wie N2 der zweiten Runde: ein Fix für das **Setzen**
(mono) nimmt das **Kürzen** mit.

Kleinster Weg: keinen zweiten Span bauen. Die Spalte `fileName` macht es zwei
Dutzend Zeilen weiter richtig — `className="v2doccol__lead v2mono"` an der
Hülle, die schon da ist (Z. 244), damit `FileName`s zwei Spans die direkten
Flex-Kinder bleiben.

**M2 — die Zeilenhöhe der Belegliste ist weiter gerissen, jetzt vom
Sachverhalt.** Die Einordnung ist repariert, aber `DocumentList` Zeile 1 misst
**71,7 px** gegen 48 · 48 · 47 ihrer Nachbarn, `Edges` Zeilen 3 und 4 messen
**71,7** und **70,7 px**. Ursache ist die Sachverhaltszelle mit **46,7 px** —
die erfundene `kind: "incoming_invoice"` schreibt „Eingangsrechnung: Alpine
Systems AG" als Titelzeile über die volle 170-px-Spur, die Nummer bricht
darunter. Das ist der bekannte M11/M4 und gehört `CaseCell`. Vermerkt wird es
hier trotzdem, weil die Reparatur von M1 der letzten Runde in **der Story, die
sie meldete**, nur 1,5 px gebracht hat (73,2 → 71,7): §9 „Zeilenhöhe ≤
`.v2tbl__row`" ist in der Belegliste weiter verletzt. Ohne Sachverhaltsspalte
(`Inbox`, `Submit`) stimmt sie: 47,1.

**M3 — die dritte und vierte Achse der Einordnung sprengen die 232 px.** Der
breiteste Wert je Achse in die echte Zelle geschrieben (`Inbox`, 1440):
mit `dokumentgruppe` = „Auszahlung Zahlungsdienstleister" (215,1 px) wird die
Zelle **45,8 px** hoch und die Zeile **70,8**; mit zusätzlich
`beleg_charakter` = „§14-UStG-Gutschrift" (130,1 px) sind es **70,8** und
**95,8 px**. `SourceDocumentClass` kann alle vier zeigen, keine Fixture setzt
`classDocumentKind` oder `collectionKind`, und `headerAside` trägt nur drei (i)
— `beleg_charakter` fehlt. Das ist der offene M6, jetzt mit Zahlen: 232 px
deckt den Zwei-Achsen-Fall, nicht den Wertebereich der Spalte.

**M4 bis M6 — unverändert offen, wie vermerkt, nachgemessen:**

- **M4** (= alter M4): ohne `caseNumber` schreibt der Katalog sein eigenes „—"
  (`DocumentList` Zeilen 2 und 3, `Edges` Zeilen 1 und 2, beide `Stuck`-Zeilen)
  statt `CaseCell` sein „offen" schreiben zu lassen.
- **M5** (= alter M5): `completed` zeigt „Gebucht", der Zeitpunkt
  `completedAt: 2026-08-30` steht in keiner Zeile. Entweder die Spalte zeigt
  ihn, oder die Katalog-Tabelle der Spec streicht „Zeitpunkt und".
- **M6** (= alte M7 und M8): die Story-Tabelle der Spec (Z. 132–138) nennt
  weiter `List` · `ListEmpty` · `ListNotExpected` · `ListInUse`, der Baum
  `Filled` · `Empty` · `NotExpected` · `InUse`; `Stuck` und `AllFour` fehlen in
  ihr. Und in `Stuck` tragen **beide** führenden Zellen `font-weight: 600` —
  gemessen ein fettes „—" in Spalte Gegenpart neben dem fetten Dateinamen,
  in beiden Tabellen, bei 1440 und 700 px.

### Abgenommen von / am

Claude (fremde Wiederabnahme, ohne Bau-Verlauf), 2026-09-07 — **zurück**,
blockierend ist M1.

## Nach der Wiederabnahme (2026-09-07)

Die drei Reparaturen sind bestätigt — Spur 232 px mit reagierender Gegenprobe
(220 → Zeile 73,2; 260 → 47,1; zurück → 47,1), das (i) nur noch im Kopf
(5/0 · 4/0 · 1/0 · 4/0). Zurück kam die Abnahme an **meinem eigenen Fix**.

**M1 (blockierend) — der Mono-Fix riss die Kürzung.** Ich hatte `FileName` in
einen **zusätzlichen** `<span className="v2mono">` gelegt. Damit war nicht mehr
`.v2doc__keyname` das Flex-Kind von `.v2doccol__lead`, sondern der neue Span —
und der hat `min-width: auto`, schrumpft also nicht. Gemessen in `Edges` bei
1440 px: Hüll-Span **360,0 px** in einer 180-px-Spur, „.pdf" endete bei 395,0
in einer Zelle, die bei 215,0 endet — **180 px draußen**, davon 64,3 px über
der Nachbarspalte. Und zwar in genau der Story, die beweisen soll, dass die
Endung in ihrer Zelle bleibt.

Das ist dieselbe Falle wie N2 der zweiten Runde: `min-width: auto` an einem
Flex-Kind. Mono sitzt jetzt an der **vorhandenen** Hülle, wie es die Spalte
„Datei" zwei Dutzend Zeilen weiter längst macht. Gemessen: Überstand **0** in
`Edges`, `DocumentList` und `Inbox`.

**Beim Umbau fiel ein zweiter Fehler auf, den die Abnahme nicht sehen konnte:**
die Bedingung hing zuerst an der Spalte statt am Inhalt — damit standen die
**Dateinamen in Inter und die Firmennamen in Mono**, also genau verkehrt.
Gemessen jetzt: `Scan-2026-09-01-…` und `Mietvertrag-…` in JetBrains Mono,
„Immobilien Musterstadt KG" und der Gedankenstrich in Inter.

**M2, M3 und M4–M6 bleiben offen und sind nachgemessen vermerkt:** die
Zeilenhöhe der Belegliste reißt weiter, jetzt an der Sachverhaltszelle mit der
erfundenen `kind` (71,7 gegen 48); 232 px decken den Zwei-Achsen-Fall, mit
einer dritten Achse wächst die Zeile wieder; und die vierte Achse hat weder
Fixture noch (i). Jeder dieser Punkte braucht eine Entscheidung, keine
Reparatur.

**Zum Tabellen-Reset:** die Abnahme hat ihn in diesem Spaltensatz
durchgemessen — `.v2num` gewinnt jetzt in Kopf **und** Zelle, keine Regression.

## Wiederabnahme 2026-09-07 (fremde Abnahme)

Dritte fremde Abnahme, ohne Bau-Verlauf, gegen die Spec und
`docs/design-guidelines.md` §9 (die zwei App-Punkte übersprungen). Gemessen im
laufenden Dev-Server auf 6107 über CDP, eigener Port, eigenes Skript; nicht
gebaut (0117). Jede Zahl mit Gegenprobe. Die Nummern M1–M8 sind die **dieser**
Runde.

**Ergebnis: zurück.** Es blockiert M1: die Spalte `Kennung` trägt ihren
Wertebereich nicht. Der Katalog kürzt den Wert nach **Zeichen** (`clipMiddle`,
32) und gibt ihm kein CSS dazu — ein gewöhnlicher Vertragsgegenstand mit 29
Zeichen bricht in der 170-px-Spur um und treibt die Zeile von 48 auf
**66,8 px**. Das ist derselbe Mechanismus wie N2 und wie M1 der letzten Runde
(Zeichen-Kürzung ohne CSS-Kürzung), nur eine Spalte weiter — und
`SourceDocumentRow` macht es zwei Dateien weiter längst richtig.

### Die Reparatur der letzten Runde — bestätigt

| Was | Messung |
|---|---|
| **M1 der letzten Runde (Hüll-Span riss die Kürzung) — behoben** | `Edges`, Zeile 3 (96-Zeichen-Name): `.pdf` endet bei **215,0 px** in einer Zelle, die bei **215,0 px** endet — Überstand **0**, und zwar bei **1440, 900 und 700 px** identisch. Ebenso Zeile 1 (`Scan-2026-09-01-…`). Mono sitzt jetzt an der vorhandenen Hülle: `.v2doccol__lead v2mono`, ein einziges Flex-Kind (`.v2rowlink`, `min-width: 0px`), dahinter die Endung mit `flex-shrink: 0`. Gegenprobe über alle sechs Breiten: kein Nachfahre einer Zelle ragt über ihre Kante (`maxOver = 0` in allen sechs Stories) |
| Die Bedingung hängt am **Inhalt**, nicht an der Spalte | `DocumentList` Zeile 4 und `Edges` Zeilen 1/3: Dateiname in **JetBrains Mono**; `Immobilien Musterstadt KG`, `Alpine Systems AG` und der Gedankenstrich in **Inter**. In `Inbox`, `Submit` und `Stuck` alle Dateinamen mono |

### Story-Deckung

Jede Prop hat ihre Story: `href`/`caseHref` → `DocumentList` (gemessen: ein
`.v2rowlink` je Zeile, `v2case__link` in der Sachverhaltszelle); `columns` →
`Inbox` (verdreht übergeben), `Submit`, `AllFour`; `lead` und `stuckVariant` →
`Stuck` (beide Tabellen, alle vier Werte der Achse `beleg_haenger` gemessen).
`SourceDocumentList` deckt `documents`, `emptyKind`, `reason`, `href` ab
(gemessen: `Filled` 2 Zeilen, `InUse` mit `#teilbeleg-…`-Zielen).

Ableitung nach `spec-schreiben` §6: 1 Zustand (gefüllt) + 2 Enum-Props
(`columns`, `stuckVariant`) + 1 „im Einsatz" + 1 Rand = **5**; gebaut sind
**6** (Obergrenze 10 eingehalten). Für die kurze Liste: 1 gefüllt + 2 Leerfälle
+ 1 „im Einsatz" = **4**, gebaut **4**. Was weiter fehlt, ist die Buchführung
in der Spec — siehe M6.

### Was gehalten hat (gemessen, mit Gegenprobe)

| Kriterium | Messung |
|---|---|
| Kopf und Zeilen an derselben Kante, kein Überlauf | `maxDiff = 0` (linke **und** rechte Kante jeder Spur gegen jede Zeile) in allen vier Sätzen bei **700 · 900 · 1100 · 1280 · 1440 · 1900 px**; `AllFour` alle vier Tabellen, `Stuck` beide. Auch dort, wo die dehnbare Spur wirklich zieht (`AllFour`/Einreichen bei 1440: Datei **870 px**; `Stuck` 1440: zwei dehnbare Spuren, beide **314 px**) |
| Führender Punkt kürzt mit Ellipse, hat einen Boden; Rest fest | `minmax(180px, 1fr)` bzw. `minmax(200px, 1fr)`; bei 700 px steht die Spur der Belegliste auf **180px**, die der Inbox auf **200px**, alle übrigen fest. Die Kürzung greift: `.v2doc__keyname` `scrollWidth 330 / clientWidth 150` in `Edges` Zeile 3, `overflow: hidden`, `text-overflow: ellipsis` |
| Der gekürzte Wert ist ganz lesbar | `title` an der Hülle: `Sammelrechnung-Bürobedarf-Meier-GmbH-August-2026-Positionen-1-bis-47-Nachtrag.pdf` (voller 81-Zeichen-Name) in `Edges`; ebenso an Gegenpart, Kennung, Datum, Sachverhaltslink und an jedem Abzeichen |
| Reihenfolge gleich, `columns` wählt nur aus | `Inbox` übergibt `["inboxState","confidence","classification","fileName"]`, gemessener Kopf: **Datei · Einordnung · Konfidenz · Erkennung**. `Stuck` (Eingabe `fileName, classification, counterparty, receivedDate, case, stuckState`) rendert **Gegenpart · Datei · Sachverhalt · Eingang · Einordnung · Beleg-Zustand** — die Ordnung des Katalogs |
| `lead` | genau **ein** `.v2rowlink` je Zeile in allen vier Sätzen; in `Stuck` in Spalte **1** (Datei), in der Belegliste in Spalte **0** (Gegenpart) |
| Waagerechtes Rollen unter `minWidth` | bei 700 px: Belegliste **1748/666**, Inbox **828/666**, Einreichen **736/666**, Stockend **1158/666**, `overflow-x: auto`; die Seite selbst ohne Überlauf (`scrollWidth = clientWidth = 700`) |
| Zahlen rechts mit `tnum` | `.v2num` als direktes Kind der Zelle: `display: block`, `text-align: right`, `font-variant-numeric: lining-nums tabular-nums` — an Betrag, Konfidenz und Größe, in Kopf **und** Zelle. Rechte Textkante = Spurkante (Betrag 535,0 = 535,0; Konfidenz 897,0 = 897,0; Größe 897,0 = 897,0) |
| Dateiname und Kennung mono | JetBrains Mono in allen vier Sätzen — führende Zelle, Spalte „Datei" und der Dateiname-Rückfall der Kennung (`DocumentList` Zeile 2). Der Vertragsgegenstand steht als Satz in Inter, wie `SourceDocIdentifier` es vorsieht |
| Vier Achsen über `StatusBadge` | `grep` nach Hex und nach Label-Maps in `source-document-columns.tsx` und `SourceDocumentList.tsx`: **Exit 1** (nichts gefunden); px nur als Rasterspuren (Präzedenz `accountEntryColumns`). Alle Werte im Wertebereich der Registry |
| Spurbreiten gegen den **Wertebereich** (breitester Wert in die echte Zelle geschrieben, danach zurückgesetzt) | Erledigt 170 px: „Sachverhalt geschlossen", „Über Import erledigt", „Keine Buchung nötig" → Zelle 22,1, Zeile unverändert, Überstand 0. Erkennung 190 px: „Einordnung fehlgeschlagen" → 22,1 / 47,1 / 0. Verarbeitung 160 px: „Fehlgeschlagen" → 23,0 / 0. Belegart und Belegform 170 px: „Kreditkartenabrechnung" → 20,9 / 0. Betrag 130 px: „1.234.567,89 €" → 0. Größe 110 px: „1.023,9 kB" → 0. Beleg-Zustand 170 px: „wird klassifiziert" (Bedarf 109,9) → 0. **Ausnahmen: Kennung (M1) und Einordnung (M3)** |
| Konfidenz als Anteil | 94 % · 71 % · 88 %, `null` → „—", rechtsbündig |
| Größe binär, ein Formatierer | `formatBytes` aus `format.ts`, auch von `FileDrop` benutzt: 412 000 → „402 kB", 1 100 000 → „1,0 MB", 240 000 → „234 kB" |
| Betrag ohne Währung | `Edges` d10: „2.480,00" ohne Zeichen; der Vertrag (d3) hat gar keinen Betrag, die Zelle bleibt leer statt „—" |
| Beleg ohne Gegenpart führt mit dem Dateinamen | `Edges` Zeile 1 und `DocumentList` Zeile 4: `Scan-2026-09-01-14-32-08.pdf` in der Spalte Gegenpart, mono, mit dem `.v2rowlink` darauf |
| Zwei Leerfälle der kurzen Liste | `Empty`: „Keine verbundenen Belege" + Erklärsatz, **kein** Icon. `NotExpected`: „Kein Beleg zu erwarten" + Begründung + `lucide-circle-check` |
| Das (i) steht nur am Kopf | Knöpfe im Kopf / in allen Datenzeilen: `DocumentList` **5 / 0**, `Inbox` **4 / 0**, `Submit` **1 / 0**, `Stuck` **4 / 0** in beiden Tabellen |
| Sortierung | vier Sortier-Links im Kopf der Belegliste, je mit dem Zustand im Namen („Nach Eingang sortieren — derzeit absteigend") |
| Fokus und Hover | mit **echten Tabulator-Anschlägen** (14 Stopps durchgezählt): jeder Stopp `:focus-visible`, `outline: solid 2px rgb(59,143,196)`, Offset 2 px. `.v2tbl__row:has(.v2rowlink):hover` färbt die Zeile, `.v2rowlink::after { inset: 0 }` macht sie ganz klickbar (I11) |
| Fest | `pnpm typecheck` · `check:language` · `check:icons` · `check:contrast` · `check:mirror` · `check:when` — alle Exit **0**. Barrel-Export vollständig (beide Dateien, alle Typen). Kein `text-transform`, kein Emoji, kein Unicode-Icon in den beiden Dateien. **Nicht geprüft: `build`** (untersagt, 0117) |

### Mängel

**M1 (blockiert) — die Spalte `Kennung` trägt ihren Wertebereich nicht.**
`source-document-columns.tsx:341`: fällt die Rückfallkette auf einen
**nicht-mono** Wert, gibt der Katalog `<span title>{clipMiddle(value, 32)}</span>`
— ein blanker Span ohne `min-width: 0`, ohne `overflow`, ohne `text-overflow`.
Der nicht-mono Zweig ist laut `SourceDocIdentifier` genau der Fall, in dem die
Kennung „ein Satz ist, keine Zahl": der **Vertragsgegenstand**. Der Katalog
plant also selbst mit bis zu 32 Zeichen und hält sie nicht aus.

Gemessen in `v3-entitäten-beleg-sourcedocumentcolumns--document-list` bei
1440 px, Zeile 3, Spur 170 px, Wert in die echte Zelle geschrieben:

- Fixture „Büroflächen Erdgeschoss" (23 Zeichen): Zelle **20,9 px**, Zeile
  **48,0**, Überstand 0.
- „Wartungsvertrag Aufzugsanlage" (29 Zeichen, ein gewöhnlicher
  Vertragsgegenstand): Zelle **41,8 px**, Zeile **66,8** — gegen 48 · 48 · 47
  der Nachbarzeilen.
- „Rahmenvertrag-Wartung-Aufzug-2026" (33 Zeichen): ebenfalls **41,8 / 66,8**.
- Ohne Trennmöglichkeit (32 Zeichen am Stück) läuft der Wert **265,9 px**
  über die Zellkante und damit über die Spalten Sachverhalt und Eingang.
- Gegenprobe: Wert zurück auf die Fixture → wieder **20,9 / 48,0**.

Das reißt §9 „Zeilenhöhe ≤ `.v2tbl__row` (V1)" und den Wortlaut von V1 (der
Inhalt wird kleiner, nicht die Zeile größer). Keine Fixture zeigt es — die
Story trägt mit 23 Zeichen genau den einen Wert, der noch passt; das ist die
Falle „eine Spur, die ihren breitesten Wert nicht trägt", die diese Familie
jetzt zum dritten Mal stellt.

Kleinster Weg: nichts erfinden — es steht zwei Dateien weiter richtig da.
`SourceDocumentRow` (Z. 353–364) gibt denselben Wert durch `FileName` in einer
`.v2doc__key`-Hülle aus, also mit `.v2doc__keyname` (`min-width: 0`,
`overflow: hidden`, `text-overflow: ellipsis`). Der Katalog macht es in seinem
eigenen `isFileName`-Zweig drei Zeilen darüber schon so. Der nicht-mono Zweig
braucht dieselbe Hülle.

**M2 (blockiert nicht) — die Zeilenhöhe der Belegliste reißt weiter am
Sachverhalt; unverändert seit zwei Runden.** `DocumentList` Zeile 1 misst
**71,7 px** gegen 48 · 48 · 47 ihrer Nachbarn, `Edges` Zeilen 3 und 4 messen
**71,7** und **70,7**. Ursache ist die erfundene `kind: "incoming_invoice"`
(`source-document-columns.tsx:358`): sie schreibt „Eingangsrechnung: Alpine
Systems AG" als Titelzeile über die volle 170-px-Spur, die Nummer bricht
darunter, Zelle **46,7 px**. Ohne Sachverhaltsspalte (`Inbox`, `Submit`,
`Stuck`) stimmt die Zeile: 47,1. Nachgeprüft, warum es hier nicht zu beheben
ist: `CaseLink.kind` ist in `case-title.ts` **Pflichtfeld** (`kind: CaseKind`),
der Katalog kann also nichts anderes übergeben als eine Behauptung. Der Fix
gehört `CaseCell` (0095, `kind` optional) — er steht seit der ersten Abnahme
als M11 offen und hält §9 im Standard-Spaltensatz dieses Bausteins seit drei
Runden gerissen. Das ist eine Entscheidung des Owners, keine Reparatur an
0070.

**M3 (blockiert nicht) — die dritte und vierte Achse der Einordnung sprengen
die 232 px; nachgerechnet mit eigenen Zahlen.** Die breitesten Werte je Achse
in die echte Zelle geschrieben (`Inbox`, 1440 px, Spur 232 px):

- zwei Achsen („Leistungsbeleg" + „Ausgangsrechnung"): Zelle **22,1**, Zeile
  **47,1** — passt, wie in der letzten Runde;
- drei Achsen (+ `dokumentgruppe` „Auszahlung Zahlungsdienstleister"): Zelle
  **48,2**, Zeile **73,2**;
- vier Achsen (+ `beleg_charakter` „§14-UStG-Gutschrift"): Zelle **74,3**,
  Zeile **99,3**.

`SourceDocumentClass` kann alle vier zeigen, keine Fixture setzt
`classDocumentKind` oder `collectionKind`, und `headerAside` trägt weiter nur
drei (i) — `beleg_charakter` fehlt. 232 px decken den Zwei-Achsen-Fall, nicht
den Wertebereich der Spalte. Braucht eine Entscheidung (Spur breiter, Achse
raus, oder umbrechen dürfen), keine Reparatur.

**M4 (blockiert nicht) — der Katalog schreibt sein eigenes „—" statt des
„offen" von `CaseCell`.** `source-document-columns.tsx:367`: ohne `caseNumber`
steht ein Gedankenstrich (gemessen `DocumentList` Zeilen 2 und 3, `Edges`
Zeilen 1 und 2, beide `Stuck`-Zeilen). `CaseCell` hat für genau diesen Fall
sein Wort und seine Begründung: „a dash would say ,unknown'". Unverändert
offen.

**M5 (blockiert nicht) — `completed` zeigt den Weg, nicht den Zeitpunkt.**
Gemessen steht in der Zelle „Gebucht" (Abzeichen 22,1 px hoch in einer
170-px-Spur); `completedAt: 2026-08-30` kommt in keiner Zeile vor. Die
Katalog-Tabelle der Spec sagt „Erledigt: **Zeitpunkt und Weg**, sonst
,offen'". Entweder die Spalte zeigt ihn, oder die Spec streicht ihn — eine
Abnahme entscheidet das nicht. Unverändert offen.

**M6 (blockiert nicht) — die Story-Tabelle der Spec deckt sich nicht mit dem
Baum.** Die Tabelle (Z. 132–138) nennt weiter `List` · `ListEmpty` ·
`ListNotExpected` · `ListInUse`; im Baum stehen `Filled` · `Empty` ·
`NotExpected` · `InUse`. `Stuck` und `AllFour` fehlen in ihr ganz. Und für
`SourceDocumentList` fehlt der von §6 verlangte **Grund**, warum „lädt",
„Fehler" und „leer nach Filter" nicht gelten. Ein Mangel der Spec, kein Grund,
Kriterien zu kürzen.

**M7 (klein) — im stockenden Satz sind zwei Spalten fett.** `.v2doccol__lead`
setzt `font-weight: 600` unbedingt; gemessen tragen in `Stuck` **beide**
führenden Zellen 600 — in Zeile 1 also ein fettes „—" in der Spalte Gegenpart
neben dem fetten Dateinamen, in beiden Tabellen und in `AllFour`. Führen soll
einer. Unverändert offen.

**M8 (klein, neu) — die Gegenpart-Zelle verspricht im Tooltip eine Datei und
zeigt einen Gedankenstrich.** `source-document-columns.tsx:253`: der `title`
wird unbedingt aus `d.counterparty ?? d.fileName` gebildet, auch in dem Zweig,
der bewusst nur „—" ausgibt (weil die Datei ihre eigene Spalte hat). Gemessen
in `Stuck`, Zeile 1, Spalte Gegenpart: Text **„—"**, `title`
**„Scan-2026-09-01-14-32-08.pdf"**. Ein Tooltip ist eine Aussage über die
Zelle, unter der er steht; hier sagt er den Namen einer Datei, die zwei
Spalten weiter noch einmal steht. Kleinster Weg: den `title` an denselben
Zweig hängen wie den Inhalt (kein `title`, wo „—" steht).

### Befunde am Set (gehören nicht zu 0070)

- **`CaseCell` erzwingt eine Belegart.** `CaseLink.kind` ist `CaseKind`, nicht
  optional. Solange das so ist, kann **kein** Aufrufer, der nur eine
  Sachverhaltsnummer hat, `CaseCell` benutzen, ohne eine Tatsache zu erfinden —
  0070 tut es, und die Zeile wächst dadurch auf 71,7 px. Der Befund ist die
  Ursache von M2 und gehört 0095.
- **`.v2doccol__lead { font-weight: 600 }` ist bedingungslos.** Die Klasse sagt
  „führt", das Gewicht folgt daraus. Wo zwei Zellen die Klasse tragen (Katalog
  mit `lead`), führen zwei — das ist in der CSS entschieden, nicht im Katalog
  (M7 ist die Ausprägung).
- **Die Achse `beleg_haenger` schreibt klein.** „wird klassifiziert", „wird
  extrahiert", „nicht extrahiert" gegen „Datum fehlt" — vier Werte, zwei
  Schreibweisen. Gemessen in beiden `Stuck`-Tabellen. Gehört der Registry.
- **`Range.getClientRects()` ist kein Überlaufmaß.** Für die Nachwelt: an einer
  Zelle mit `overflow: hidden` meldet ein Textbereich die **ungekürzte**
  Geometrie (in `DocumentList` Zeile 2 Kennung: 885,0 gegen eine Zellkante bei
  845,0), obwohl nichts gemalt wird. Wer Überlauf misst, misst die Kästen der
  Nachfahren, nicht den Textbereich — sonst meldet er einen Mangel, den es
  nicht gibt.

### Abgenommen von / am

Claude (fremde Abnahme, ohne Bau-Verlauf), 2026-09-07 — **zurück**,
blockierend ist M1.

## Nach der Wiederabnahme (2026-09-07): der Blocker und fünf von sechs kleinen

Gemessen gegen den Dev-Server `http://localhost:6107` über CDP, Aktion und
Messung in **getrennten** Aufrufen — im selben Aufruf las ich zweimal noch den
alten Wert und hätte den Blocker fast als behoben gemeldet, den ich gerade
erst gebaut hatte.

**M1 (Blocker) — die Kennung kürzt jetzt mit CSS.** Der nicht-mono Zweig gab
einen blanken `<span title>` mit einer Kürzung nach **Zeichenzahl** aus. Das
ist bei einem Satz keine Kürzung: der Wert blieb ganz genug, um umzubrechen.
Jetzt trägt er dieselbe Hülle wie der Dateinamen-Zweig (`.v2doc__key` +
`.v2doc__keyname`) — aber mit der Ellipse am **Ende**: bei einem Satz trägt
der Anfang die Bedeutung, bei einem Dateinamen die Endung.

Gemessen in `DocumentList` bei 1440 px, Spur 151,4 px, Wert in die echte Zelle
geschrieben:

| Wert | vorher | jetzt |
|---|---|---|
| „Büroflächen Erdgeschoss" (23 Z.) | Zelle **41,8** px, zweizeilig | **20,9** px, Überstand 0 |
| „Wartungsvertrag Aufzugsanlage" (29 Z.) | **41,8** px | **20,9** px, Überstand 0 |
| „Rahmenvertrag-Wartung-Aufzug-2026" (33 Z.) | **41,8** px | **20,9** px, Überstand 0 |
| 59 Zeichen ohne Trennmöglichkeit | **278,2 px Überstand** | **0** |

`clipMiddle` wird von dieser Datei nicht mehr gebraucht; der Import ist weg.

**M4 — `CaseCell` schreibt sein „offen".** Ohne `caseNumber` stand ein eigener
Gedankenstrich in der Zelle, und ein Strich sagt „unbekannt" — der Sachverhalt
ist nicht unbekannt, es gibt noch keinen. Gemessen zeigen `DocumentList` und
`Stuck` jetzt je „offen" aus `.v2case__none` (drei bzw. vier Stellen), kein
Katalog-Strich mehr.

**M5 — „Erledigt" trägt Zeitpunkt und Weg.** `SourceDocumentCompletion` setzt
das Datum neben das Abzeichen; die Zelle liest gemessen „Gebucht 30.08.2026",
die offenen Zeilen nur „Offen". Die Spur bleibt 170 px, die Zelle 22,1 px hoch
— die Zeile wächst nicht.

**M7 — fett führt einer.** `.v2doccol__lead` setzte `font-weight: 600`
bedingungslos, auch auf der Zelle, die nur „—" zeigt. Gemessen in `Stuck`
tragen die beiden führenden „—" jetzt **400**, die vier echten Führungen
**600**.

**M8 — kein `title`, wo „—" steht.** Der Tooltip hing am ganzen Zweig statt am
Inhalt und versprach eine Datei, die zwei Spalten weiter noch einmal steht.
Gemessen: die „—"-Zellen in `Stuck` haben jetzt `title = null`, die echten
Werte ihren eigenen.

**M6 — Sache der Spec, nicht des Codes.** Die Story-Tabelle nennt Namen, die
der Baum nicht führt. Sie ist unten berichtigt.

### M2 bleibt offen — und ist jetzt eingegrenzt

Der Katalog hat **aufgehört zu erfinden**: er übergab `kind:
"incoming_invoice"` für jeden Beleg, obwohl er die Art des Sachverhalts nicht
kennt. `CaseLink.kind` darf seither `null` sein (`case-title.ts`), und
`caseDisplayTitle` fällt dann auf „Sachverhalt" zurück — eine wahre Angabe
statt einer falschen.

Die Zeilenhöhe behebt das **nicht**, und die Spur ist nicht die Ursache.
Gemessen: bei 170 px ist die Zelle 46,7 px hoch, bei **232 px ebenso** 46,7.
Der Grund steht in `CaseCell` selbst: `.v2case__one` ist `flex-wrap: wrap`,
also bekommt der Name eine eigene Zeile, **bevor** irgendetwas schrumpft — so
gebaut und so begründet (0095: „der Name behält seinen Platz"). In einer Liste
aus 48-px-Zeilen ist die Zelle damit der eine Ausreißer mit 71,7 px. Das ist
ein Befund für `CaseCell`, keine Spurbreite hier; die Verbreiterung habe ich
gemessen und wieder zurückgenommen.

**Und ein Wächter hat wieder zugeschlagen:** meine neue Konstante `EMPTY` in
`BankTransactionPurpose.tsx` schob sich zwischen das `@when`-JSDoc und die
Funktion — `pnpm check:when` Exit 1, eine Minute später behoben. Genau dafür
ist er seit gestern schärfer.

`pnpm typecheck`, `check:language`, `check:icons`, `check:contrast`,
`check:mirror`, `check:when` je Exit 0. Nicht gebaut (0117).

**Status: Abnahme** — das Urteil war „zurück", also entscheidet die nächste
Runde.

## Schlanke Abnahme (Schnittstelle) 2026-09-08

Vierte fremde Abnahme, ohne Bau-Verlauf. **Schlank** nach dem Owner-Entscheid
vom 2026-09-08 (Skill `v3-komponente`, „Zwei Tiefen"): geprüft wird die
**Schnittstelle**, nicht die Darstellung. Gelesen wurden
`source-document-columns.tsx`, `SourceDocumentList.tsx` und ihre zwei
Story-Dateien Zeile für Zeile gegen den Spec-Teil (Zuschnitt Z. 59, Katalog
Z. 74–89, Sätze Z. 93–98, Schnittstelle Z. 107–111, Stories Z. 124–144,
Kriterien ab Z. 146); dazu **ein** Durchlauf über alle zehn Stories im
Dev-Server auf 6107 mit `scripts/cdp.mjs`. **Nicht gebaut** (0117).

**Ergebnis: zurück.** Es blockieren zwei Aussagen der Schnittstelle, die nicht
stimmen — keine davon am gebauten Verhalten: **Sch1**, die Spec führt die
Schnittstelle nicht, die der Code hat (zwei Props und zwei Werte der Union
fehlen), und **Sch2**, `caseHref` verspricht im Typ einen `caseId` und bekommt
eine Sachverhalts**nummer**. Beides trifft die App bei `[year]/documents`
direkt, und beides ist eine Zeile.

### Die Nacharbeit — was sie an der Schnittstelle geändert hat

Gefragt war, ob die sieben Nacharbeiten die Schnittstelle bewegt haben. Sie
haben es nicht — mit einer Einschränkung, die nicht 0070 gehört:

- **`clipMiddle` ist als Import gefallen.** `source-document-columns.tsx:1–20`
  führt ihn nicht mehr; der Export lebt weiter in `SourceDocument.tsx:120` und
  wird dort von `FileName` gebraucht. Keine Signatur geändert. Seit heute ist
  `noUnusedLocals` an (`tsconfig.json:13`) — ein toter Import wäre jetzt ein
  Typfehler; `pnpm typecheck` steht auf Exit **0**.
- **`SourceDocumentCompletion` zeigt Zeitpunkt und Weg** (`SourceDocument.tsx:198–214`).
  Die Props sind unverändert (`{ document }`), die **Ausgabe** nicht: hinter
  dem Abzeichen steht jetzt `<Time value={document.completedAt} …>`. Weil vier
  Formen denselben Export benutzen, tragen Zeile, Zelle, Facts und Drawer die
  Datumsangabe mit — im Browser gesehen in `SourceDocumentList--filled`:
  „… Leistungsbeleg Eingangsrechnung **Gebucht 30.08.2026**". Kein Mangel an
  0070; ein Punkt für die Formen (unten unter „Befunde am Set").
- **M2 ist ohne Änderung an 0070 erledigt.** Der Owner-Entscheid steht als
  **Vorgabe** in `CaseCell.tsx:31` (`layout = "inline"`); der Katalog übergibt
  nichts und bekommt sie. Im Browser steht der Sachverhalt einzeilig
  („2026-0412 Sachverhalt" in einer Zeile, `DocumentList`).
- Sonst: keine Prop dazu, keine weg, keine umbenannt.

### 1. Jede Prop und jeder Typ gegen die Schnittstelle

`SourceDocumentColumnOptions` (`source-document-columns.tsx:140–158`), Zeichen
für Zeichen gegen die Tabelle Z. 109–111:

| Spec (Z.) | Code | Urteil |
|---|---|---|
| `href` · `(doc) => string` · nein | `href?: (document: SourceDocumentVM) => string` (Z. 142) | stimmt |
| `caseHref` · `(caseId: string) => string` · nein | `caseHref?: (caseId: string) => string` (Z. 144) | Typ stimmt, der **Wert** nicht → **Sch2** |
| `columns` · `SourceDocumentColumn[]` · nein, Default `DOCUMENT_LIST_COLUMNS` | `columns?: SourceDocumentColumn[]`, Vorgabe `DOCUMENT_LIST_COLUMNS` (Z. 145, 182) | stimmt |
| — | `lead?: "counterparty" \| "fileName"` (Z. 152), Vorgabe abgeleitet: `counterparty`, wenn im Satz, sonst `fileName` (Z. 189–190) | **fehlt in der Spec** → Sch1 |
| — | `stuckVariant?: StuckVariant` (Z. 157), Vorgabe `"stuck"` (Z. 184); `StuckVariant = "stuck" \| "inflight"` (Z. 160) | **fehlt in der Spec** → Sch1 |

Die Union führt **sechzehn** Werte (Z. 39–55): `counterparty`, `fileName`,
`kind`, **`form`**, `amount`, `documentDate`, `identifier`, `case`,
`receivedDate`, `classification`, `processing`, `completed`, `inboxState`,
`confidence`, `size`, **`stuckState`**. Die Katalog-Tabelle der Spec
(Z. 76–89) führt **vierzehn** — `form` und `stuckState` fehlen, obwohl beide
in der Sätze-Tabelle darunter vorkommen. Das ist derselbe Befund wie bei
`CaseColumn` in 0096 (zehn statt dreizehn).

`ORDER` (Z. 58–75) ist vollständig und deckt sich mit `defs`; die Vollzähligkeit
erzwingt `Record<SourceDocumentColumn, ColumnDef<…>>` (Z. 205) — ein
vergessener Wert wäre ein Typfehler.

Die vier Sätze (Z. 81–138) stimmen mit der Sätze-Tabelle überein:
`DOCUMENT_LIST_COLUMNS` zehn Punkte, `INBOX_COLUMNS` vier, `SUBMIT_COLUMNS`
vier mit `form` statt `kind`, `STUCK_COLUMNS` sechs. Im Browser gemessene
Köpfe, in genau dieser Ordnung:

- `DocumentList` — Gegenpart · Belegart · Betrag · Belegdatum · Kennung ·
  Sachverhalt · Eingang · Einordnung · Verarbeitung · Erledigt (**10**)
- `Inbox`, verdreht übergeben (`["inboxState","confidence","classification","fileName"]`)
  — Datei · Einordnung · Konfidenz · Erkennung: `columns` **wählt aus, ordnet
  nicht um**
- `Submit` — Datei · Belegform · Größe · Erkennung
- `Stuck` — Gegenpart · Datei · Sachverhalt · Eingang · Einordnung ·
  Beleg-Zustand, in **beiden** Tabellen gleich

Die zwei weiteren Funktionen: `sourceDocumentTracks(columns: ColumnDef<SourceDocumentVM>[]): string`
(Z. 508) und `sourceDocumentMinWidth(columns: ColumnDef<SourceDocumentVM>[]): number`
(Z. 525). Beide nehmen die **gebauten** Spaltendefinitionen, nicht
`SourceDocumentColumn[]` — das steht in der Spec nirgends, und
`sourceDocumentMinWidth` steht in Zuschnitt und Schnittstelle überhaupt nicht
(nur im Fließtext der ersten Nacharbeit, M4).

`SourceDocumentList` (`SourceDocumentList.tsx:26–38`) gegen Z. 113–114:
`documents: readonly SourceDocumentVM[]` (Pflicht), `emptyKind?: SourceDocumentEmptyKind`
= `"none" | "not-expected"` mit Vorgabe `"none"` (Z. 18, 28), `reason?: string`,
`href?: (document: SourceDocumentVM) => string`. **Stimmt.** Dass die Union
einen eigenen exportierten Namen trägt (`SourceDocumentEmptyKind`), sagt die
Spec nicht — im Barrel steht er, die App kann ihn also lesen.

Barrel vollständig (`src/ui/v3/index.ts:315–327`): beide Dateien, drei
Funktionen, vier Sätze, drei Typen (`SourceDocumentColumn`,
`SourceDocumentColumnOptions`, `StuckVariant`) und `SourceDocumentEmptyKind`.

### 2. Typen aus `src/ludwig/`

- `SourceDocumentVM extends Omit<MirrorDocument, "detail">` mit
  `MirrorDocument` aus `@/ludwig/modules/source-docs/domain/source-document-vm`
  (`SourceDocument.tsx:3, 65`) — **keine lokale Neudefinition**; die vier
  Zusatzfelder sind begründet und mit Befund (L-207, L-208) versehen.
- `sourceDocTypeLabel` und `formatDocumentForm` aus
  `@/ludwig/modules/source-docs/domain/…` (Z. 1–2), `SourceDocCompletionVia`
  aus derselben Quelle re-exportiert.
- `StatusAxis` kommt aus `@/ludwig/ui/status/status-registry` über
  `StatusBadge`; `CaseLink` aus `case-title.ts`, dort `kind: CaseKind | null`
  (`case-title.ts:35`) — der Katalog übergibt `kind: null` (Z. 382), erfindet
  also nichts mehr.
- **Keine `as`-Zusicherung** in beiden Dateien: `grep` nach ` as ` findet nur
  Prosa in Kommentaren (Z. 23, 219, 220, 252, 364), keine Zusicherung.
- Eine Ausnahme, bewusst und mit Befund: `stuckState()` (Z. 169) gibt `string`
  zurück statt einer Union. Die vier Werte stehen in der Registry
  (`status-registry.ts:632–635`: `wird_klassifiziert`, `wird_extrahiert`,
  `nicht_extrahiert`, `datum_fehlt`), aber `StatusBadge.status` ist
  `string | null | undefined` — der Compiler prüft sie nicht. Das ist die
  Bauart des Bausteins, nicht ein Fehler dieser Datei; die Ableitung ist als
  **L-81** schon nach `domain/` vorgemerkt.

### 3. `@when`/`@instead`, Dateiname, Story-Ordner

Alle vier exportierten Funktionen tragen beide Zeilen:
`sourceDocumentColumns` (Z. 175–178), `sourceDocumentTracks` (Z. 505–506),
`sourceDocumentMinWidth` (Z. 521–523), `SourceDocumentList`
(`SourceDocumentList.tsx:21–24`). Konstanten und Typen sind nach der Regel des
Wächters ausgenommen (`scripts/check-when.mjs`, „Konstanten sind ausgenommen"),
tragen aber trotzdem je einen Satz, der sagt, wofür der Satz da ist.
`pnpm check:when` Exit **0**.

Datei nach der Familie: `source-document-columns.tsx` in
`src/ui/v3/entities/source-document/`, wie `bank-transaction-columns.tsx`,
`case-columns.tsx`, `account-columns.tsx` in ihren Familien. Stories liegen im
selben Ordner, Titel `v3/Entitäten/Beleg/SourceDocumentColumns` und
`…/SourceDocumentList` — genau wie in der Spec (Z. 125).

### 4. Story-Deckung

Jede Prop hat ihre Story:

| Prop | Story |
|---|---|
| `href` | `DocumentList`, `Inbox`, `Submit`, `Stuck`, `Edges`, `AllFour` — im Browser **4 `.v2rowlink`** bei 4 Datenzeilen, also einer je Zeile |
| `caseHref` | `DocumentList`, `Stuck`, `Edges`, `AllFour` |
| `columns` | `Inbox` (verdreht übergeben), `Submit`, `Stuck`, `AllFour` |
| `lead` | `Stuck` (beide Tabellen), `AllFour` |
| `stuckVariant` | `Stuck` — beide Werte untereinander, dieselben zwei Belege |
| `documents` | `Filled`, `InUse` |
| `emptyKind` | `Empty` (`"none"`), `NotExpected` (`"not-expected"`) |
| `reason` | `NotExpected` |
| `href` (Liste) | `InUse` (`#teilbeleg-…`) |

Zahl gegen §6: 1 anwendbarer Zustand (gefüllt) + 1 je Enum-Prop — und es sind
**drei**: `columns`, `lead`, `stuckVariant` — + 0 Layout + 0 Callbacks + 1 „im
Einsatz" + 1 Rand = **6**. Gebaut sind **6** (Obergrenze 10 eingehalten).
Für die kurze Liste 1 gefüllt + 2 Leerfälle + 1 „im Einsatz" = **4**, gebaut
**4**. Die ausgeschlossenen Zustände sind begründet: „lädt, leer und Fehler
gehören `DataTable`" (Z. 126) für den Katalog, und für die Liste steht der
Grund in der Story-Tabelle („die Liste bekommt fertige Belege als Prop, lädt
nichts und filtert nichts"). **Die Ableitung in der Spec selbst rechnet
weiter 4** — siehe Sch4.

### 5. Status nur über die Registry

Sieben Achsen, alle über `StatusBadge`/`StatusInfoButton`: `beleg_kategorie`,
`beleg_richtung`, `dokumentgruppe` (Z. 411–413), `beleg` (Z. 431, 435),
`beleg_erledigung` (Z. 443, über `SourceDocumentCompletion`), `beleg_haenger`
(Z. 450, 452), `beleg_inbox` (Z. 459, 463). **Keine lokale Label-Map** — die
einzigen deutschen Zeichenketten in der Datei sind Spaltenköpfe („Gegenpart",
„Datei", „Belegart", „Belegform", „Betrag", „Belegdatum", „Kennung",
„Sachverhalt", „Eingang", „Einordnung", „Verarbeitung", „Erledigt",
„Beleg-Zustand", „Erkennung", „Konfidenz", „Größe") und das „—" der Leerfälle.
**Kein Hex** (`grep -E "#[0-9a-fA-F]{3,8}"` in beiden Dateien: Exit 1).

`px` steht als **Rasterspur** (16 `width:`-Angaben) und in den zwei Konstanten
von `sourceDocumentMinWidth` (`GUTTER = 10`, `PADDING = 36`). Das ist die
Präzedenz aller Spaltenkataloge des Sets — `case-columns.tsx` 13,
`bank-transaction-columns.tsx` 9, `account-columns.tsx` 8 px-Spuren — und war
schon in den drei vorigen Abnahmen so gewertet. Der Wortlaut des Kriteriums
(„kein px") deckt sich nicht mit der Praxis; siehe „Befunde am Set".

### 6. Die sechs Wächter über den Exit-Code

Vollständig gelesen, nicht über `| tail` beurteilt:

| Lauf | Exit | Selbstprüfung (`--test`) |
|---|---|---|
| `pnpm typecheck` | **0** | kennt kein `--test` (`error TS5023`), also keine |
| `pnpm check:language` | **0** („2 angefasste Dateien geprüft") | **0**, 8 Fälle |
| `pnpm check:icons` | **0** (53 Zeichen in der Registry) | **0** |
| `pnpm check:contrast` | **0** (33 Angaben nachgerechnet) | **0**, 16 Fälle |
| `pnpm check:mirror` | **0** (8 Fälle) | **0**, 8 Fälle |
| `pnpm check:when` | **0** | **0**, 11 Fälle |

`noUnusedLocals`/`noUnusedParameters` stehen beide auf `true`
(`tsconfig.json:13–14`); der gefallene `clipMiddle`-Import wäre sonst ein
Typfehler. Anmerkung ohne Mangel: `check:language` prüft nur die **angefassten**
Dateien (hier zwei aus `bank-transaction/`); für 0070 sagt sein Exit-Code
deshalb nichts — die Prüfung auf Englisch ist oben von Hand gemacht.

### 7. Ein Durchlauf über die Stories

Ein Skript, ein Browser über `scripts/cdp.mjs` aus dem Repo, 1440 px,
Dev-Server 6107. Alle zehn Stories:

| Story | rendert | Konsole |
|---|---|---|
| `DocumentList` | 10 Köpfe, 4 Datenzeilen, 4 Zeilenlinks | sauber |
| `Inbox` | 4 Köpfe, 4 Zeilen, 94 % · 71 % · 88 % | sauber |
| `Submit` | 4 Köpfe (Datei · Belegform · Größe · Erkennung), 402 kB | sauber |
| `Stuck` | 2 Tabellen à 6 Köpfe, alle vier Werte der Achse | sauber |
| `Edges` | 10 Köpfe, 4 Zeilen, „Beleg", „—", 96-Zeichen-Name | sauber |
| `AllFour` | 4 Tabellen, 24 Köpfe, 1461 Zeichen | sauber |
| `Filled` · `Empty` · `NotExpected` · `InUse` | 2 Zeilen · „Keine verbundenen Belege" · „Kein Beleg zu erwarten" + Begründung · `#teilbeleg-…` | sauber |

Kein `sb-errordisplay` sichtbar (`display: none` in allen zehn), keine
Ausnahme, keine `console.error`/`warn` aus dem Set. Das einzige, was fällt,
ist ein **404 auf `/favicon.ico`** — Storybook selbst, nicht diese Dateien.

Ehrlichkeitshalber vermerkt: im ersten Lauf stand `DocumentList` leer da
(`len = 0`). Das war das kalte Übersetzen der ersten Story; mit 2,5 s mehr
Wartezeit wiederholt, rendert sie ihre zehn Spalten. Gegenprobe im selben
Lauf: `Inbox` unverändert.

### Mängel

**Sch1 (blockiert) — die Spec führt nicht die Schnittstelle, die gebaut ist.**
Vier Stellen, alle im Spec-Teil, keine im Code:

1. Die Tabelle Z. 109–111 nennt drei Props; `SourceDocumentColumnOptions` hat
   **fünf**. Es fehlen `lead?: "counterparty" | "fileName"` (Vorgabe:
   abgeleitet — `counterparty`, wenn im Satz, sonst `fileName`) und
   `stuckVariant?: "stuck" | "inflight"` (Vorgabe `"stuck"`). Beide stehen als
   *Erzählung* in „Nach der Abnahme vom 2026-09-07" und in der Sätze-Tabelle
   (Z. 98) — aber die Schnittstelle ist die Tabelle, und die App liest sie.
2. Die Katalog-Tabelle Z. 76–89 führt 14 Werte, die Union 16: `form` und
   `stuckState` fehlen.
3. Zuschnitt Z. 59 sagt „drei Exporte … und **drei** benannte Sätze";
   exportiert sind **vier** Funktionen und **vier** Sätze —
   `sourceDocumentMinWidth` kommt in Zuschnitt und Schnittstelle nicht vor.
4. Die Überschrift Z. 91 heißt „Die **drei** Sätze"; die Tabelle darunter hat
   vier Zeilen.

Das ist derselbe Faden wie in 0095 (`kind: CaseKind` gegen `CaseKind | null`)
und 0096 (`href` als `string` gegen eine Funktion, `CaseColumn` mit zehn statt
dreizehn Werten): die Abnahmen haben den Code richtiggestellt, die Spec hat es
nicht mitgeschrieben. Es blockiert, weil die App **als Nächstes** gegen genau
diese Tabelle migriert: wer sie liest, kennt zwei Props und zwei Spaltenwerte
nicht und baut den stockenden Satz danach falsch. Kleinster Weg: zwei Zeilen
in die Schnittstellen-Tabelle, zwei in die Katalog-Tabelle, ein Wort in
Z. 59 und eins in Z. 91. Kein Code.

**Sch2 (blockiert) — `caseHref` verspricht eine Kennung und bekommt eine
Nummer.** `source-document-columns.tsx:144` typt
`caseHref?: (caseId: string) => string`, und Z. 374 füllt
`caseId: d.caseNumber`. `CaseCell` ruft damit `href(c.caseId)`
(`CaseCell.tsx:77`) — der Rückruf der App bekommt also **„2026-0412"**, nicht
die Kennung des Sachverhalts.

Dass die beiden im Set verschieden sind, steht eine Familie weiter
schwarz auf weiß: `document-number/fixtures.ts:35` führt
`caseId: "c-4412"` **neben** `caseNumber: "2026-0412"`, und `CasePicker`
(Z. 101) gibt `c.caseId` als Wert heraus. Die Spiegel-VM des Belegs trägt
keine Sachverhalts-Kennung — nur `caseNumber` und einen fertigen `caseHref`
(`SourceDocument.tsx:87–89`, Befund L-207); der Katalog kann also gar nichts
anderes übergeben. Der Fehler ist nicht die Übergabe, sondern der **Name im
Typ**: er sagt der App das Gegenteil dessen, was ankommt.

Es blockiert, weil es genau die Aufrufstelle trifft, die als Nächstes gebaut
wird: `[year]/documents` gibt einen `caseHref` mit, und eine Route, die auf
einer Kennung steht, führt ins Leere. Kleinster Weg, ohne Verhalten zu ändern:
den Parameter `caseNumber` nennen — `caseHref?: (caseNumber: string) => string`
— und den Satz in Spec und JSDoc dazuschreiben („der Katalog kennt nur die
Nummer, L-207"). Eine Zeile hier, eine dort.

**Sch3 (blockiert nicht, klein) — `sourceDocumentColumns()` verlangt ein
Argument.** Z. 179–185 destrukturiert ohne Vorgabe, das Objekt selbst hat
also keine: `sourceDocumentColumns()` ist ein Typfehler,
`sourceDocumentColumns({})` nicht. Die Spec führt jede Prop als „nein" und
sagt zum Objekt nichts; ein Leser erwartet nach so einer Tabelle einen
Aufruf ohne Argumente. Kleinster Weg: `= {}` hinter das Destrukturieren, oder
ein Satz in der Spec.

**Sch4 (blockiert nicht, klein) — die Ableitung nach §6 rechnet 4 und listet
6.** Z. 126–131 zählt „1 Zustand + **1** Enum (`columns`) … = **4** für den
Katalog"; die Tabelle unmittelbar darunter (Z. 133–141) führt **sechs**
Stories. Mit allen drei Enum-Props — `columns`, `lead`, `stuckVariant` —
liefert §6 genau **6**, also die gebaute Zahl. Der Satz ist damit nicht bloß
veraltet: er verfehlt das Ergebnis seiner eigenen Regel. (Die Wiederabnahme
vom 2026-09-07 rechnete 5, weil sie `lead` nicht als Enum-Prop zählte.)
Kleinster Weg: den Satz auf drei Enum-Props und 6 stellen.

**Sch5 (blockiert nicht, klein) — die Katalog-Tabelle steht in einer anderen
Reihenfolge als `ORDER`.** Die Tabelle Z. 76–89 listet
… `classification` · `processing` · `completed` · `inboxState` · `confidence` ·
`size`; `ORDER` (Z. 58–75) hat … `classification` · `confidence` · `size` ·
`processing` · `stuckState` · `inboxState` · `completed`. Die Sätze-Tabelle
(„Dateiname · Einordnung · Konfidenz · Zustand") und der gemessene Kopf der
`Inbox` folgen dem **Code**, nicht der Katalog-Tabelle. Die Zeilen ohne Rang
tragen zwar nur „—", aber wer eine Tabelle liest, liest ihre Reihenfolge als
die Reihenfolge. Kleinster Weg: die sechs zustandslosen Zeilen in die
Ordnung des Codes bringen.

**Sch6 (blockiert nicht, klein) — der Leerfall des Sachverhalts hat kein
Ziel.** Z. 395 ruft `<CaseCell cases={[]} href={…} />` ohne `emptyHref`, und
`CaseCell` sagt zu dieser Prop selbst: „Without it the word stands without a
way." Der Katalog bietet dem Aufrufer keine Prop, mit der er das Ziel setzen
könnte — „offen" bleibt also in jeder Belegliste ein Wort ohne Weg. Das
braucht eine Entscheidung (Prop dazu oder bewusst ohne), keine Reparatur.

### Befunde am Set (gehören nicht zu 0070)

- **`SourceDocumentCompletion` ist ein geteilter Export.** Der M5-Fix hat den
  Zeitpunkt in ihn hineingelegt, und damit tragen ihn **vier** Formen mit:
  Zeile, Zelle, Facts und Drawer-Kopf. Im Browser gesehen in
  `SourceDocumentList--filled` („Gebucht 30.08.2026" in der Zeile). Wer 0074,
  0076 oder 0084 wieder liest, sollte das Datum dort abnicken — abgenommen
  wurde es dort ohne.
- **Der Beleg kann `CaseCell` keine Kennung geben.** Die Spiegel-VM führt
  weder `caseId` noch etwas, woraus er einer würde (L-207). Solange das so
  ist, wird jeder Beleg-Baustein, der `CaseCell` benutzt, die Nummer in ein
  Feld namens `caseId` legen — Sch2 ist nur die erste Stelle. Gehört zur
  Spiegel-VM, nicht zu 0070.
- **`StatusBadge.status` ist `string`.** Deshalb prüft kein Compiler die vier
  Wörter, die `stuckState()` (Z. 169) an die Achse `beleg_haenger` gibt; sie
  stimmen (`status-registry.ts:632–635`), aber ein Tippfehler fiele erst im
  Browser auf. Eine Achse, deren Wertebereich die Registry kennt, könnte ihn
  auch als Typ hergeben.
- **Das Kriterium „kein px" trifft keinen Spaltenkatalog des Sets.** Vier
  Kataloge, alle mit px-Spuren: `case-columns.tsx` 13, `bank-transaction-columns.tsx`
  9, `account-columns.tsx` 8, dieser 16. Der Wortlaut sollte sagen, was
  gemeint ist — kein px **im Abstand und in der Schrift**, Rasterspuren
  ausgenommen —, sonst reißt ihn jede neue Spaltendatei formal.
- **Die Achse `beleg_haenger` schreibt zwei Schreibweisen.** Unverändert seit
  der letzten Runde: „wird klassifiziert", „wird extrahiert", „nicht
  extrahiert" gegen „Datum fehlt" (`status-registry.ts:632–635`). Gehört der
  Registry.

### Nicht geprüft (vertagt nach `docs/backlog/0119-visuelle-pruefung-nachholen.md`)

Spurbreiten, Zeilenhöhen, Überläufe, Kontraste, Trefferflächen, Hover, Fokus,
Tastaturwege — und damit auch, ob die Reparatur an der Kennung (M1 der letzten
Runde) und die an `.v2doccol__lead` (M7) an vier Breiten halten. Nichts davon
ist in diesem Abschnitt gemessen; die Zahlen der vorigen Runden stehen
unberührt.

### Abgenommen von / am

Claude (fremde Abnahme, ohne Bau-Verlauf), 2026-09-08 — **zurück**,
blockierend sind Sch1 und Sch2. Beide sind Aussagen der Schnittstelle, keine
Fehler im Verhalten: das Gebaute ist in sich stimmig, es steht nur nicht so in
der Spec, und ein Name sagt das Gegenteil des Werts. Der Code selbst wurde für
diese Abnahme nicht angefasst.

### Nacharbeit 2026-09-08 (nach der schlanken Abnahme)

Alle sechs Punkte erledigt, zwei davon im Code, vier in der Spec:

| Punkt | Was getan | Wo |
|---|---|---|
| **Sch1** | Die Schnittstellen-Tabelle führt jetzt `lead` und `stuckVariant`, die Katalog-Tabelle `form` und `stuckState` (16, nicht 14), der Zuschnitt drei Funktionen statt zwei und vier Sätze statt drei, die Überschrift „Die vier Sätze" | Spec, §Zuschnitt · §Der Katalog · §Die vier Sätze · §Schnittstelle |
| **Sch2** | `caseHref` heißt jetzt `(caseNumber: string) => string` und sagt im JSDoc, warum: die Spiegel-VM trägt keine Kennung (L-207), und die beiden sind im Set nachweislich verschieden. Ein Kommentar an der Übergabe hält fest, dass die Nummer für die Kennung einspringt, solange L-207 offen ist | `source-document-columns.tsx:143–151, 374` |
| **Sch3** | `= {}` hinter das Destrukturieren; `sourceDocumentColumns()` ohne Argument ist jetzt der Aufruf für die Belegliste, und die Spec sagt das | Code + Spec §Kann bewusst nicht |
| **Sch4** | Die §6-Rechnung nennt drei Enum-Props und kommt auf 6 — die gebaute Zahl | Spec, §Stories |
| **Sch5** | Die sieben zustandslosen Zeilen der Katalog-Tabelle stehen in der Ordnung von `ORDER` | Spec, §Der Katalog |
| **Sch6** | **Entschieden: bewusst ohne.** „offen" ist eine Aussage über den Beleg, kein Angebot — eine Belegliste hat keinen Ort, an den sie schicken könnte, weil der Sachverhalt aus dem Beleg heraus entsteht und dieser Weg noch nicht existiert. Keine durchgereichte Prop; eine Prop, die niemand füllt, wird nicht gebaut (A12) | `source-document-columns.tsx:392–395` + Spec §Kann bewusst nicht |

Kein Verhalten geändert: die zwei Code-Änderungen sind ein Vorgabewert und
zwei Kommentare. `pnpm typecheck` und die fünf Wächter stehen auf Exit 0.

Die drei **Befunde am Set** bleiben stehen, sie gehören anderen Aufgaben: das
Datum in `SourceDocumentCompletion` (0074, 0076, 0084 sollten es abnicken),
die fehlende Kennung der Spiegel-VM (L-207 — Sch2 ist nur die erste Stelle,
an der sie fehlt) und `StatusBadge.status` als `string` (L-81).
