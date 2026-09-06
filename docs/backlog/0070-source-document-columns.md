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
| `SUBMIT_COLUMNS` | Beleg einreichen | Dateiname · Belegart · Größe · Zustand | Die Größe steht nur hier: 25 MB je Datei ist die Grenze, an der das Einreichen scheitert |

**Zwei Punkte fehlen im Anzeige-Typ** und kommen als Befund: `confidence`
(Achse `konfidenz`) und `sizeBytes`. Beide stehen in der App am Eingang, keiner
im `SourceDocumentVM`. Solange sie fehlen, zeigen ihre Spalten „—" — sie
werden **nicht** weggelassen, sonst sähe die Inbox vollständig aus, während
sie die halbe Antwort schuldig bleibt.

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

- [ ] Die Reihenfolge der Punkte ist in allen drei Sätzen dieselbe; `columns` wählt nur aus (Story `Inbox`, verdreht übergeben)
- [ ] Kopf und Zeilen enden bei **vier** Breiten an derselben Kante, kein Überlauf (gemessen)
- [ ] Der führende Punkt kürzt mit Ellipse und hat einen Boden (`minmax`), der Rest steht fest
- [ ] Zahlen rechts mit `tnum`, Dateiname und Kennung mono
- [ ] Jede der vier Achsen läuft über `StatusBadge`, keine lokale Map (`grep`)
- [ ] `confidence` und `size` zeigen „—", solange der Typ sie nicht trägt (Story `Inbox`, `Submit`)
- [ ] Die kurze Liste unterscheidet ihre **zwei** Leerfälle (Stories `ListEmpty`, `ListNotExpected`)
- [ ] Ein Beleg ohne Gegenpart führt mit dem Dateinamen (Story `Edges`)
- [ ] offen (App): ersetzt die Zeilen der drei langen Listen und `BelegeTab`/`ChildDocsCard`

### Befunde für `ludwig/app`

- **B1** — `SourceDocumentVM` trägt weder die **Konfidenz** der Einordnung
  (Achse `konfidenz`) noch die **Dateigröße**. Beide stehen am Eingang der App;
  ohne sie bleibt die Inbox-Spalte „Konfidenz" und die Einreich-Spalte „Größe"
  leer. Kein lokaler Nachbau — die Punkte gehören in den Typ.

### Beim Bauen gemessen

**Eine dehnbare Spur je Tabelle, und ihre Untergrenze in Pixeln.** Der erste
Anlauf gab dem führenden Punkt `minmax(20ch, 1fr)` und der Kennung
`minmax(16ch, 0.8fr)`. Gemessen liefen Kopf und Zeilen **10 px** auseinander —
und der Grund ist eine Falle, die das Set schon dreimal auf andere Weise
getroffen hat: eine `ch`-Untergrenze rechnet sich aus der **Schriftgröße des
Elements**, und der Spaltenkopf steht auf 12,5 px, die Zeile auf 13,5. Zwei
dehnbare Spuren teilen sich den Rest also in Kopf und Zeile verschieden.

Jetzt eine dehnbare Spur mit `minmax(180px, 1fr)`, die Kennung fest. Gemessen
enden Kopf und alle Zeilen bei 1839 px, `scrollWidth − clientWidth` = 0, und
das waagerechte Scrollen trägt der `minWidth`-Rahmen (1840 = Summe der Spuren
plus neun Lücken plus Polster).

**`columns` ordnet nicht um:** die Story `Inbox` übergibt
`["inboxState", "confidence", "classification", "fileName"]` und bekommt
gemessen „Datei · Einordnung · Konfidenz · Zustand".

**Vier Punkte sind in den Typ gekommen**, zwei davon aus dem Profil
(`processingStatus`, Achse `beleg`, und `inboxStatus`, Achse `beleg_inbox` —
der einzige Zustand, den jede Ausprägung trägt), zwei als Befund **L-79**
(`classConfidence`, `sizeBytes`). Die zwei Befund-Spalten zeigen „—", statt
weggelassen zu werden: eine Inbox ohne Konfidenzspalte sähe vollständig aus,
während sie die halbe Antwort schuldig bleibt.
