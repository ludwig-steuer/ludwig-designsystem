# 0070 · Belegliste — Spaltensätze für `DataTable`

| | |
|---|---|
| Status | in Arbeit |
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
- **Zuschnitt:** eine Datei mit drei Exporten —
  `sourceDocumentColumns()` (der Katalog), `sourceDocumentTracks()` (die
  Spurliste aus derselben Quelle) und drei benannte Sätze. Dazu
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
| `amount` | 3 | Maß der Ausprägung, rechts mit `tnum`; leer, wo die Ausprägung keins hat |
| `documentDate` | 4 | Belegdatum. NULL bleibt NULL — nie der Upload-Tag |
| `identifier` | 5 | Kennung der Ausprägung, Rückfallkette Nummer → Dateiname → Kurz-ID |
| `case` | 6 | Sachverhalt über `CaseCell` |
| `receivedDate` | 7 | Eingang, `NOT NULL`, der Sortierschlüssel der Belegliste |
| `classification` | — | Einordnung: Kategorie · Richtung · Belegform, je über ihre Achse |
| `processing` | — | Verarbeitung, Achse `beleg` |
| `completed` | — | Erledigt: Zeitpunkt und Weg, sonst „offen" |
| `inboxState` | — | Achse `beleg_inbox` — der einzige Zustand, den jede Ausprägung trägt |
| `confidence` | — | Achse `konfidenz` — wie sicher die Einordnung ist |
| `size` | — | Dateigröße, rechts; nur beim Einreichen, wo die 25-MB-Grenze zählt |

### Die drei Sätze

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
| `caseHref` | `(caseId: string) => string` | nein | Reicht an `CaseCell` durch | `DocumentList` |
| `columns` | `SourceDocumentColumn[]` | nein, Default `DOCUMENT_LIST_COLUMNS` | Welche Punkte. Wählt aus, ordnet nicht um | `Inbox`, `Submit` |

`SourceDocumentList` (kurze Liste): `documents`, `emptyKind`
(`"none" | "not-expected"`), `reason`, `href`.

**Kann bewusst nicht:**

- **Laden, filtern, blättern.** Das ist `DataTable` und die Seite.
- **Die Spalten umsortieren.** Die Reihenfolge gehört dem Profil.
- **Den Leerfall raten.** „Kein Beleg zu erwarten" ist ein Erfolg mit
  Begründung, „keine verbundenen Belege" eine Lücke — die kurze Liste bekommt
  gesagt, welcher gilt.

### Stories

Titel `v3/Entitäten/Beleg/SourceDocumentColumns` bzw. `…/SourceDocumentList`.
Abgeleitet nach §6: 1 Zustand (gefüllt — lädt, leer und Fehler gehören
`DataTable`) + 1 Enum (`columns`, drei Werte in **einer** Story) + 0 Layout +
0 Callbacks + 1 „im Einsatz" + 1 Rand = 4 für den Katalog; für die Liste
2 Leerfälle + 1 gefüllt + 1 „im Einsatz" = 4.

| Story | Beweist |
|---|---|
| `DocumentList` | Der volle Satz: zehn Spalten, Sortierung am Eingang, Zeilenlink am Gegenpart |
| `Inbox` | Der Eingangs-Satz: die Datei führt, Konfidenz und Zustand stehen, kein Jahr und kein Sachverhalt |
| `Submit` | Der Einreich-Satz mit der Größe |
| `Edges` | Rand: ohne Gegenpart, ohne Belegdatum, ohne Betrag, 96-Zeichen-Dateiname |
| `List` · `ListEmpty` · `ListNotExpected` · `ListInUse` | Die kurze Liste mit ihren zwei Leerfällen |

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

**Offen aus der Abnahme:** M11 (`CaseCell` bekommt eine erfundene `kind`),
M13 (Ton und Mono des führenden Punktes — die Farbe erbt jetzt, das Gewicht
steht auf 600, der Mono-Rückfall in der Kennung steht noch aus), M18
(Erfolgs-Icon im Leerfall der kurzen Liste). Sie gehen in die nächste Runde.
