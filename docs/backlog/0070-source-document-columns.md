# 0070 · Belegliste — Spaltensätze für `DataTable`

| | |
|---|---|
| Status | Abnahme |
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
