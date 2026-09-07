# 0082 · CaseList + CaseColumns — der Vorrat eines Wirtschaftsjahres

| | |
|---|---|
| Status | spec |
| Stufe | `entities/accounting-case/` |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md`, Abschnitt „Listen" |
| Auftrag | **Ein** Listen-Baustein für alle vier Reiter der Sachverhaltsliste (`laufend` · `belege` · `klaerung` · `alle`) — sie unterscheiden sich nur in der Grundgesamtheit, nicht in Sortierung, Spaltensatz oder Massenaktion, und sind deshalb nach §8 ein Prop, keine vier Komponenten. Ersetzt die Tabelle in `app/(app)/clients/[clientSlug]/[year]/cases/page.tsx` (571 Z.) samt `CaseListFilters` und `CaseListTabsBar`. |
| Job | Wenn **der Vorrat eines Wirtschaftsjahres offen ist**, will **die Sachbearbeiterin** **den nächsten Fall finden, den sie selbst zur Buchung bringen kann**, damit **sie nicht 117 Fälle einzeln öffnet, um zu sehen, wer am Zug ist**. |
| Umfang | offen je Mandant + Jahr p50 86 · p90 190 · max 259 (Staging 2026-09-05) → `Pagination`, Serverfilter, Lade- und Fehlerfall gehören in die Spec |
| Vertagt, weil | für die Route `[clientSlug]/[year]/cases` **kein Seitenprofil** unter `docs/seiten/` existiert. Ohne es sind Kopfzeile, Vorratszähler, Reiterlogik und die beiden Leerfälle geraten — das Entitätsprofil hält nur Job und Tabellenschnitt fest. |
| Setzt voraus | `caseColumns()` (0096) · `DataTable` (0057) · Seitenprofil `docs/seiten/sachverhalte.md` — **angelegt 2026-09-07** |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |

Zwei Befunde hängen an dieser Liste und sind drüben zu bauen: sie sortiert
heute nicht (L-15) und kennt keine Sammelaktion (L-16).

## Spec 2026-09-07 (Skill `spec-schreiben`)

Die Wartebedingung ist weg: das Seitenprofil steht als
`docs/seiten/sachverhalte.md`.

### Einordnung

- **Wiederverwenden:** `DataTable` (0057) trägt Karte, Sortierung, Pager,
  Auswahl und die fünf Zustände; `caseColumns()` (0096) trägt die zehn Punkte;
  `FilterBar` (0003) trägt Suche und Filter — sie bleibt bei der **Seite**,
  wie `DataTable` es in seinem `@instead` festhält.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 und §8 des Profils. Was fehlt,
  ist nicht die Tabelle, sondern **wer die vier Grundgesamtheiten
  auseinanderhält** — und das ist genau ein Prop.
- **Zuschnitt:** eine Datei, ein Export. `CaseList` ist dünn und soll es sein:
  sie wählt den Spaltensatz, übersetzt den Reiter in seinen **Leerfall** und
  reicht alles Übrige durch. Vier Komponenten wären vier Kopien derselben
  Tabelle.
- **Setzt auf:** `DataTable`, `caseColumns`, `caseTracks`.

### Der Reiter ist der Leerfall

Das ist die eigentliche Entscheidung dieser Spec. Die vier Reiter
unterscheiden sich — nachgemessen im Profil — **nur in der Grundgesamtheit**:
`caseOrderExprs()` gibt für alle vier dieselbe Sortierung, der Spaltensatz
steht einmal, die Filter hängen an allen gleich, eine Massenaktion hat keiner.
Was auseinandergeht, ist der Satz, der dasteht, wenn nichts da ist:

| Reiter | Grundgesamtheit | leer heißt |
|---|---|---|
| `laufend` | nicht geschlossen | **Erfolg**: „Kein Sachverhalt ist mehr offen." |
| `belege` | wartet auf Unterlagen (19 von 915) | **Erfolg**: „Es fehlt keine Unterlage mehr." |
| `klaerung` | zur Bearbeitung | **Erfolg**: „Nichts wartet auf Bearbeitung." |
| `alle` | alles im Jahr | **Lücke**: „In diesem Wirtschaftsjahr gibt es noch keinen Sachverhalt." |

Und quer dazu der fünfte Fall, den die Seite heute **nicht** kennt (Profil,
Zweifel 2): **„keine Treffer"** — leer wegen des Filters, nicht wegen des
Bestands. Der bekommt seinen eigenen Satz und einen Weg zurück. Genau diese
Unterscheidung sagt der Sachbearbeiterin, ob sie fertig ist.

### Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `tab` | `CaseListTab` | ja | Welche Grundgesamtheit — und damit welcher Leerfall | `Tabs`, `Empty` |
| `cases` | `CaseListItem[]` | ja | Die Zeilen **dieser Seite**, fertig sortiert und gefiltert | `Filled` |
| `href` | `(c) => string` | nein | Wohin die Zeile führt | `Filled` |
| `counterpartyHref` | `(c) => string \| undefined` | nein | Reicht an den Spaltensatz durch | `Filled` |
| `columns` | `CaseColumn[]` | nein | Wählt aus dem Katalog; der Partner-Reiter nimmt einen kürzeren Satz | `Columns` |
| `listHref` | `(patch: ListPatch) => string` | nein | Sortierung und Blättern über die URL | `Filled` |
| `sort`, `pager`, `loading`, `error` | wie `DataTable` | nein | Durchgereicht | `Loading`, `Error` |
| `filtered` | `{ summary, resetHref }` | nein | Der fünfte Leerfall | `EmptyAfterFilter` |
| `head` | `{ title?, sub?, actions? }` | nein | Kopf der Karte; ohne ihn steht der Reiter-Titel dort | `Filled` |

**Kann bewusst nicht:**

- **Die Reiterleiste zeigen.** Sie gehört der Seite: sie kennt die Zähler
  aller vier Grundgesamtheiten, die Liste kennt nur ihre eigene.
- **Filtern oder suchen.** `FilterBar` steht über der Karte und gehört der
  Seite (`DataTable` §instead).
- **Massenweise schließen.** Das ist der Reiter „Zum Schließen", er zeigt
  Karten statt Zeilen und hängt an `CaseCard` (0081).
- **Den Reiter „Offene Zahlungen".** Er zeigt Bankzeilen — eine andere
  Entität in derselben Reiterleiste (Profil, Zweifel 1).

### Stories

Titel `v3/Entitäten/Sachverhalt/CaseList`. Abgeleitet nach §6: 4 anwendbare
Zustände (gefüllt · leer · leer nach Filter · lädt · Fehler = 5, davon alle
anwendbar) + 1 Enum (`tab`, vier Werte in **einer** Story) + 0 Layout +
0 Callbacks + 1 „im Einsatz" + 1 Rand = 8.

| Story | Beweist |
|---|---|
| `Filled` | Zehn Spalten, Sortierung am Kopf, Pager, Zeilenlink |
| `Tabs` | Die vier Reiter nebeneinander — **derselbe** Spaltensatz, vier Leerfälle |
| `Empty` | „Nichts offen" als **Erfolg**, mit der Zahl |
| `EmptyAfterFilter` | „Keine Treffer" mit Weg zurück — der Fall, den die Seite heute nicht kennt |
| `Loading` | Kopf und Spaltenkopf bleiben stehen |
| `Error` | Satz plus ein Weg, es erneut zu versuchen |
| `Columns` | Der kürzere Satz des Partner-Reiters, mit Jahr |
| `InUse` | In der `AppShell` mit Reiterleiste und `FilterBar` darüber — die ganze Seite |

### Abnahmekriterien

Fest: typecheck · build · Datei nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, kein px, keine lokale Label-Map · alle Stories ·
§9 · im Browser angesehen.

Variabel:

- [ ] Alle vier Reiter zeigen **denselben** Spaltensatz (Story `Tabs`, gemessen)
- [ ] Jeder Reiter hat seinen eigenen Leerfall, und drei davon sind ein **Erfolg** (Story `Tabs`)
- [ ] „Keine Treffer" ist ein **fünfter** Fall mit eigenem Satz und Weg zurück (Story `EmptyAfterFilter`)
- [ ] Kopf und Zeilen enden bei vier Breiten an derselben Kante (gemessen)
- [ ] Die Liste zeigt keine Reiterleiste und keinen Filter (`grep`)
- [ ] Sortierung und Blättern laufen über `listHref`, nicht über eigenen Zustand (`grep`: kein `useState`)
- [ ] offen (App): ersetzt die Tabelle in `[year]/cases/page.tsx` samt `CasesTable`

### Befunde für `ludwig/app`

- **L-15** (keine Sortierung) und **L-16** (keine Sammelaktion) stehen schon im
  Register; `CaseList` bringt die Sortierung mit, sobald die Seite `listHref`
  liefert.
- **Neu:** der Zuständigkeits-Filter in `CaseListFilters` **wirkt nicht** —
  `caseFilterForListTab()` liest `dispo` nicht, `CaseFilter` hat kein Feld
  dafür. Ein Filter, der nichts tut, verspricht die Antwort auf Rang 3 des
  Seitenprofils und liefert sie nicht.

### Beim Bauen gemessen

**`ch` ist kein Maß für eine Spur — auch hier nicht.** Der Anzeigename stand
auf `minmax(24ch, 1fr)`; gemessen liefen Kopf und Zeilen **6 px**
auseinander, weil eine `ch`-Untergrenze sich aus der Schriftgröße des Elements
rechnet und der Spaltenkopf auf 12,5 px steht, die Zeile auf 13,5. Derselbe
Fund wie in 0070, hier und im Belegnummern-Register mitgezogen. Jetzt
`minmax(200px, 1fr)`; gemessen enden Kopf und alle Zeilen bei 1629 px,
Überlauf 0.

**Die vier Reiter zeigen denselben Spaltensatz** — gemessen zehn `th` in allen
vieren — und vier verschiedene Leerfälle, drei davon als Erfolg. Der fünfte
(„Keine Treffer für …" mit „Filter zurücksetzen") kommt von `DataTable` und ist
der Fall, den die Seite heute nicht kennt.

**`minWidth` deckt die Rechnung:** zehn Spuren = 1500 px, neun Lücken à 10,
zweimal 18 Polster = 1626 → 1630.
