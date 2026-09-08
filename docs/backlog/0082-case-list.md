# 0082 · CaseList + CaseColumns — der Vorrat eines Wirtschaftsjahres

| | |
|---|---|
| Status | fertig (Schnittstelle) — die gemessene Prüfung steht in 0119 aus |
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
| `tab` | `CaseListTab` = `Exclude<CaseListTab, "offen" \| "schliessen">` aus `src/ludwig/` | ja | Welche Grundgesamtheit — und damit welcher Leerfall. **Abgeleitet, nicht abgeschrieben:** ein siebter Reiter drüben erreicht diese Liste von selbst | `Tabs`, `Empty` |
| `cases` | `CaseListItem[]` | ja | Die Zeilen **dieser Seite**, fertig sortiert und gefiltert | `Filled` |
| `href` | `(c) => string` | nein | Wohin die Zeile führt | `Filled` |
| `counterpartyHref` | `(c) => string \| undefined` | nein | Reicht an den Spaltensatz durch | `Filled` |
| `columns` | `CaseColumn[]` | nein | Wählt aus dem Katalog; der Partner-Reiter nimmt einen kürzeren Satz | `Columns` |
| `listHref` | `(patch: ListPatch) => string` | nein | Sortierung und Blättern über die URL | `Filled` |
| `sort`, `pager`, `loading`, `error` | wie `DataTable`, `pager` **einschließlich** `pageSizeOptions` | nein | Durchgereicht | `Loading`, `Error` |
| `filtered` | `{ summary, resetHref }` | nein | Der fünfte Leerfall | `EmptyAfterFilter` |
| `head` | `{ title?, sub?, actions? }` | nein | Kopf der Karte; ohne ihn steht der Reiter-Titel aus `CASE_LIST_TAB_LABEL` dort | `Filled` |
| `emptyCount` | `number` | nein | Der Bestand hinter einem erledigten Leerfall — „Alle 117 … sind abgeschlossen." Ohne ihn steht der Satz ohne Zahl; der Reiter „alle" nimmt ihn nicht, dort **fehlt** der Bestand | `Empty` |
| `density` | `TableDensity` | nein | Durchgereicht; dieselbe Liste in einem schmaleren Zusammenhang | `Columns` |
| `minWidth` | `number` | nein, Vorgabe 1630 | Ab wann die Tabelle waagerecht scrollt, statt den Anzeigenamen zu quetschen — zehn Spuren, neun Lücken, zwei Polster | `Columns` (900) |

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

Titel `v3/Entitäten/Sachverhalt/CaseList`. Abgeleitet nach §6: 5 anwendbare
Zustände (gefüllt · leer · leer nach Filter · lädt · Fehler) + 1 Enum (`tab`,
vier Werte in **einer** Story) + 0 Layout + 0 Callbacks + 1 „im Einsatz" +
1 Rand = 8. *(Berichtigt 2026-09-08, M10: der Satz zählte „4 anwendbare" und
kam auf 8 — die Zahl stimmte, die Rechnung nicht.)* Der Export der
Reiter-Story heißt `TabsSideBySide` und trägt `name: "Tabs"`: `Tabs` selbst
ist in der Datei der Reiter-Baustein aus `primitives/Nav`, den die Story
„im Einsatz" braucht.

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

## Schlanke Abnahme (Schnittstelle) 2026-09-08

**Urteil: zurück.** Zur Frage, die zählt — **ja, die Komponente ist im Kern
das, was die Spec beschreibt.** Der Reiter ist wirklich der Leerfall: gemessen
zeigen alle vier Reiter denselben Spaltensatz und vier verschiedene Sätze,
drei davon mit dem Erfolgshaken; der fünfte Fall („keine Treffer im Filter")
existiert und hat seinen Weg zurück. Die Liste bringt keine Reiterleiste und
keinen Filter mit, hält keinen eigenen Zustand und reicht Sortierung und
Blättern über `listHref` durch. Wer heute drüben dagegen baut, baut gegen die
richtige Idee.

Zurück geht es an **drei Stellen, die genau die App treffen**, die gerade
migriert:

1. `CaseListTab` ist im Set **neu erfunden**, obwohl `src/ludwig/` den Typ
   führt — und die Aufrufstelle drüben bezahlt das schon mit einem Cast (M1).
2. Die vier Reiter-Titel sind eine **wörtliche Kopie** von
   `CASE_LIST_TAB_LABEL`; auf der Seite, die gerade migriert, stehen dadurch
   Reiterleiste und Kartenkopf aus zwei Quellen übereinander (M2).
3. Der Erfolgs-Leerfall hat **keine Zahl**, und die Schnittstelle hat keinen
   Platz für eine — L6, T6 und die Story-Tabelle der Spec verlangen sie (M3).

Dazu sechs Stellen, an denen die **Spec hinter ihrem Code zurückgeblieben**
ist (M4–M8, M10–M11) — derselbe rote Faden wie in 0095 und 0096: die Datei
kann mehr, als die Tabelle sagt, aus der die App abliest. Und die Aufgabe
steht bis heute auf Status `spec`, obwohl der Baustein seit `4d59f31` im Code
und im Barrel steht.

**Prüftiefe.** Geprüft wurde die **Schnittstelle, nicht die Darstellung**
(Owner-Entscheid 2026-09-08, Skill `v3-komponente`, „Zwei Tiefen"). Damit ist
das Kriterium „Kopf und Zeilen enden bei vier Breiten an derselben Kante
(gemessen)" (Z. 112) **nicht** Teil dieser Abnahme; es gehört mit Maßen,
Kontrasten, Trefferflächen, Hover, Fokus und Tastaturwegen nach
`docs/backlog/0119-visuelle-pruefung-nachholen.md`. Gebaut wurde nichts, kein
Code geändert.

### Geprüft

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| Jede Prop gegen die Schnittstelle (Typ, Pflicht, Vorgabe) | Spec Z. 60–70 gegen `CaseList.tsx` Z. 64–105, Zeichen für Zeichen. Deckungsgleich: `tab` (Pflicht) · `cases: CaseListItem[]` (Pflicht) · `href?: (item: CaseListItem) => string` · `counterpartyHref?: (item: CaseListItem) => string \| undefined` · `columns?: CaseColumn[]` · `listHref?: (patch: ListPatch) => string` · `sort?: { key: string; dir: "asc" \| "desc" }` · `loading?: boolean` · `error?: { message: string; retry?: React.ReactNode }` · `filtered?: { summary: string; resetHref: string }` · `head?: { title?, sub?, actions? }`. Abweichend: `pager` (M6), dazu **zwei Props, die die Spec nicht führt** — `density?: TableDensity` (Z. 103, M4) und `minWidth?: number = 1630` (Z. 81, M5) | ✗ (M4, M5, M6) |
| `CaseListTab` gegen den Code | Spec Z. 62 nennt den Typ ohne Wertebereich; `CaseList.tsx` Z. 22 definiert ihn **lokal** vierwertig, während `src/ludwig/modules/accounting-cases/domain/case.ts` Z. 393–401 `CASE_LIST_TABS` und `type CaseListTab` **sechswertig** führt. Der Barrel (`src/ui/v3/index.ts` Z. 385) exportiert den vierwertigen unter demselben Namen | ✗ (M1) |
| `caseListTracks` gegen den Code | `CaseList.tsx` Z. 144–146: `caseListTracks(columns?: CaseColumn[]): string`, `@when`/`@instead` vorhanden (Z. 136–143). Die Spec führt den zweiten Export nicht und sagt Z. 32 ausdrücklich „eine Datei, **ein** Export" | ✗ (M7) |
| Typen aus `src/ludwig/`, keine lokale Neudefinition | `CaseList.tsx` Z. 1 zieht `CaseListItem` aus `@/ludwig/…/domain/case`; `case-columns.tsx` Z. 1 und Z. 11 ziehen `caseKindLabel` und `asCurrency` von dort. `ListPatch` aus `../../patterns/DataTable`, `TableDensity` aus `../../primitives/Table`, `CaseColumn` aus `./case-columns` — kein Fachtyp nachgebaut **außer** `CaseListTab` (M1) und den vier Reiter-Titeln (M2) | ✗ (M1, M2) |
| Keine `as`-Zusicherung | `grep -nE "\bas [A-Z]"` über `CaseList.tsx` → kein Treffer. In `CaseList.stories.tsx` Z. 84 steht `as CaseListTab[]` — eine Folge von M1: käme der Typ aus `src/ludwig/`, stünde dort `CASE_LIST_TABS.filter(…)` ohne Zusicherung | ✗ (Teil von M1) |
| `@when`/`@instead` an jedem Export | `CaseList.tsx` Z. 58–63 (`CaseList`) und Z. 136–143 (`caseListTracks`); `pnpm check:when` → Exit 0 über den ganzen Baum (Typ-Exporte sind im Wächter ausgenommen) | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `src/ui/v3/entities/accounting-case/CaseList.tsx` neben `CaseCell`, `CaseRow`, `CaseCard`, `CaseDrawer` …; `CaseList.stories.tsx` daneben; Titel `v3/Entitäten/Sachverhalt/CaseList` — identisch geschnitten wie die zehn Geschwister der Familie | ✓ |
| Story-Deckung je Prop | `tab` → `Tabs`, `Empty` · `cases` → `Filled` · `href` → jede · `counterpartyHref` → `Filled`, `InUse` · `columns` → `Columns` · `listHref` → `Filled`, `InUse` · `sort` → `Filled` · `pager` → `Filled` · `loading` → `Loading` · `error.message` → `Error` · `filtered` → `EmptyAfterFilter` · `head` → `Filled` (`sub`), `Columns` (`title`) · `minWidth` → `Columns` (900). **Ohne Story: `density` (M4), `head.actions`, `error.retry` (M8)** | ✗ (M4, M8) |
| Story-Zahl gegen `spec-schreiben` §6 | Acht Stories im Baum: `Filled`, `TabsSideBySide` (Anzeige „Tabs"), `Empty`, `EmptyAfterFilter`, `Loading`, `Error`, `Columns`, `InUse`. Ableitung: 5 Zustände + 1 Enum (`tab`, vier Werte in **einer** Story) + 0 Layout + 0 Callbacks + 1 „im Einsatz" + 1 Rand = **8**. Zahl stimmt, Obergrenze 10 gehalten. Die Spec rechnet Z. 85–88 „4 anwendbare Zustände (… = 5)" und widerspricht sich in derselben Klammer (M10); ihre Tabelle nennt die Story `Tabs`, der Export heißt `TabsSideBySide` (M11) | ✗ (M10, M11) |
| Ausgeschlossene Zustände begründet | Keiner ausgeschlossen — alle fünf Zustände haben ihre Story. Was die Liste bewusst **nicht** kann, steht in der Spec Z. 72–81 (Reiterleiste, Filter, Sammelaktion, Reiter „Offene Zahlungen") und ist im Code eingehalten: `grep -n "Tabs\|FilterBar\|Filter"` über `CaseList.tsx` → kein Treffer; `grep -n "useState\|useEffect\|use client"` → kein Treffer | ✓ |
| Status nur über die Registry | `CaseList.tsx` setzt kein Abzeichen; der Spaltensatz tut es über `StatusBadge axis="sachverhalt" \| "disposition" \| "export_case"` und `StatusInfoButton` (`case-columns.tsx` Z. 132, 138, 185, 189, 239, 243), die Art über `caseKindLabel` aus `src/ludwig/`. Gerendert in `--filled`: die Spaltenköpfe „Stand", „Wer ist dran", „Export" mit ihren (i) | ✓ |
| Keine lokale Label-Map | Für **Status** keine. Aber `TAB_TITLE` (Z. 51–56) ist eine wörtliche Kopie von vier Einträgen aus `CASE_LIST_TAB_LABEL` (`src/ludwig/…/case.ts` Z. 403–410) | ✗ (M2) |
| Kein Hex, kein px | `grep -nE '#[0-9a-fA-F]{3,8}\b'` und `grep -nE '[0-9]+px'` über `CaseList.tsx` → je kein Treffer. `minWidth = 1630` ist eine Zahl an `DataTable.minWidth?: number` — die Rechnung dazu steht in der Spec Z. 142–144 | ✓ |
| Sortierung und Blättern über `listHref`, kein eigener Zustand | `grep -n "useState"` über `CaseList.tsx` → kein Treffer; `listHref` geht als `href` an `DataTable` (Z. 125), die daraus Spaltenkopf-Links und Pager baut | ✓ |
| Alle vier Reiter zeigen **denselben** Spaltensatz | `--tabs-side-by-side` im Browser: vier Karten, je zehn `th`, die Kopfzeile in allen vier Zeichen für Zeichen `Sachverhalt\|Stand\|Nummer\|Betrag\|Gegenpart\|Wer ist dran\|Art\|Klärung\|Eröffnet\|Export` (40 `th` gesamt) | ✓ |
| Jeder Reiter hat seinen eigenen Leerfall, drei davon Erfolg | Dieselbe Story, `innerText` je Karte: „Kein Sachverhalt ist mehr offen." · „Es fehlt keine Unterlage mehr." · „Nichts wartet auf Bearbeitung." · „In diesem Wirtschaftsjahr gibt es noch keinen Sachverhalt." Vier verschiedene Sätze. Die ersten drei tragen **vier** `svg`, die vierte **drei** — das eine Zeichen Unterschied ist der Erfolgshaken aus `done: true` | ✓ |
| „Keine Treffer" ist ein **fünfter** Fall mit eigenem Satz und Weg zurück | `--empty-after-filter`, gerendert: „Keine Treffer für „Bürobedarf · Dauersachverhalt"." plus genau **ein** `<a>` mit „Filter zurücksetzen". Kommt aus `DataTable` Z. 259–266, ausgelöst allein durch `filtered` | ✓ |
| Der Erfolgs-Leerfall nennt die Zahl (Spec Z. 94, §9 → L6/T6) | `--empty`, vollständiger `innerText` des Leerfalls: „Kein Sachverhalt ist mehr offen." / „Alles, was in diesem Wirtschaftsjahr angefangen wurde, ist abgeschlossen." — **keine Zahl**, in keiner der vier Reiter-Fassungen. Und keine Prop, über die eine hineinkäme | ✗ (M3) |
| Die sechs Wächter über den Exit-Code | `pnpm typecheck` (0 Zeilen Ausgabe) · `check:language` („2 angefasste Dateien geprüft") · `check:icons` („53 Zeichen in der Registry, 2 Datei(en) noch offen") · `check:contrast` („33 Angaben nachgerechnet") · `check:mirror` („8 Fälle", Spiegel `f1c58c44`) · `check:when` — **je Exit 0**. `noUnusedLocals` und `noUnusedParameters` stehen seit `1662bb2` in `tsconfig.json` und sind in diesem Lauf mitgelaufen | ✓ |
| Selbstprüfungen der Wächter | `check-when.mjs --test` (11 Fälle) · `check-contrast.mjs --test` (16) · `check-language.mjs --test` (8) · `mirror-filter.mjs --test` (8) — je Exit 0. `check-icons.mjs` hat keine (Befund S4 der Abnahme 0096, unverändert) | ✓ |
| Ein Durchlauf über alle acht Stories | Ein Skript, ein Messbrowser (`scripts/cdp.mjs` aus dem Repo, Dev-Server 6107), Breite 1600. Jede Story rendert: `--filled` 747 Zeichen / 10 `th` / 15 Links · `--tabs-side-by-side` 857 / 40 `th` / 4 Leerfälle · `--empty` 234 / 10 `th` / 0 Zeilen · `--empty-after-filter` 175 / 1 Link · `--loading` 119 / 10 `th` / 5 Skelettzeilen (Kopf und Spaltenkopf stehen) · `--error` 196, Satz vorhanden · `--columns` 309 / **6** `th`, Kopf „Sachverhalte" · `--in-use` 1077 / 10 `th` / 20 Links, mit Reiterleiste und `FilterBar` **außerhalb** der Karte. Keine leere Story | ✓ |
| Konsole | Über acht Stories dieselben drei Meldungen je Story — `[vite] connecting…`, `[vite] connected.`, der React-DevTools-Hinweis — dazu **einmalig** ein 404 auf `/favicon.ico` beim ersten Aufruf, das Storybook selbst anfordert. Keine Warnung, keine Ausnahme, nichts aus `CaseList`, `caseColumns` oder `DataTable` | ✓ |
| Deutsche Kommentare im Code (CLAUDE.md) | `node scripts/check-language.mjs --all` nennt `CaseList.tsx:78` und `:79`. Der Wächter im Tor ist grün, weil er nur geänderte Zeilen aus `HEAD~1`/`HEAD`/`--cached` liest und die Datei zuletzt in `4d59f31` angefasst wurde | ✗ (M9) |
| offen (App): ersetzt die Tabelle in `[year]/cases/page.tsx` samt `CasesTable` | läuft — `apps/web/src/app/(app)/clients/[clientSlug]/[year]/cases/page.tsx` Z. 354 ruft `CaseList` bereits auf. Nicht in diesem Repo abzunehmen | offen (App) |

### Mängel

1. **`CaseListTab` ist lokal nachgebaut, obwohl `src/ludwig/` den Typ führt.** —
   *Kriterium:* „Typen aus `src/ludwig/`, keine lokale Neudefinition."
   *Ort:* `CaseList.tsx` Z. 22 gegen `src/ludwig/modules/accounting-cases/domain/case.ts`
   Z. 393–401; exportiert über `src/ui/v3/index.ts` Z. 385.
   *Befund:* das Datenmodell führt `CASE_LIST_TABS` mit **sechs** Werten und
   dazu `type CaseListTab`. Das Set exportiert unter **demselben Namen** einen
   zweiten, vierwertigen Typ, der mit dem ersten in keiner Beziehung steht. Die
   Verengung auf vier ist fachlich **richtig** — `offen` zeigt Bankzeilen und
   `schliessen` Karten, beides steht in „Kann bewusst nicht" (Z. 78–81). Falsch
   ist nur, dass sie **abgeschrieben statt abgeleitet** ist. Die Rechnung dafür
   liegt schon auf dem Tisch: `apps/web/src/app/(app)/clients/[clientSlug]/[year]/cases/page.tsx`
   erfindet Z. 65 dieselbe Verengung noch einmal
   (`type CaseListVisibleTab = Exclude<CaseListTab, "offen" \| "schliessen">`)
   und kommt Z. 355 nur mit `tab={activeTab as CaseListVisibleTab}` hinein —
   ein Cast an genau der Prop, die diese Abnahme prüft. Wer drüben einen
   siebten Reiter einträgt, ändert eine Liste und nicht die andere, und nichts
   sagt es ihm.
   *Kleinster Weg:* zwei Zeilen in `CaseList.tsx`, die vier Werte bleiben
   unverändert:
   `import type { CaseListTab as AnyCaseListTab } from "@/ludwig/modules/accounting-cases/domain/case";`
   und `export type CaseListTab = Exclude<AnyCaseListTab, "offen" | "schliessen">;`.
   Danach fällt auch die Zusicherung in `CaseList.stories.tsx` Z. 84 weg.
   **Blockiert.**

2. **Die vier Reiter-Titel sind eine Kopie von `CASE_LIST_TAB_LABEL`.** —
   *Kriterium:* keine lokale Label-Map; Werte für Fachdaten aus `src/ludwig/`.
   *Ort:* `CaseList.tsx` Z. 51–56 gegen `src/ludwig/…/case.ts` Z. 403–410.
   *Befund:* „Laufende Sachverhalte", „Wartet auf Unterlagen", „Zur
   Bearbeitung", „Alle Sachverhalte" — vier Zeichenketten, in beiden Dateien
   identisch. Und die Kopie ist nicht theoretisch: die Seite, die gerade
   migriert, übergibt **kein** `head`, also rendert `TAB_TITLE` den Kartenkopf
   (gemessen in `--filled`, `--empty`, `--tabs-side-by-side`), während die
   Reiterleiste unmittelbar darüber `CASE_LIST_TAB_LABEL` liest
   (`apps/web/src/modules/accounting-cases/ui/CaseListTabsBar.tsx` Z. 63). Zwei
   Quellen für dieselben vier Wörter auf demselben Bildschirm, übereinander —
   derselbe Fund wie in 0103.
   *Kleinster Weg:* `CASE_LIST_TAB_LABEL` importieren und in Z. 119
   `head?.title ?? CASE_LIST_TAB_LABEL[tab]` schreiben; `TAB_TITLE` entfällt.
   **Blockiert.**

3. **Der Erfolgs-Leerfall hat keine Zahl, und keine Prop lässt eine hinein.** —
   *Kriterium:* Spec Z. 94 („`Empty` beweist: „Nichts offen" als **Erfolg**,
   **mit der Zahl**") und der feste Block „§9" → L6 („Prüfschritt ohne offene
   Punkte: Haken + **ein Satz mit Zahl**") und T6 („leer, weil erledigt (L6,
   mit Zahl)").
   *Ort:* `CaseList.tsx` Z. 28–49 (`EMPTY`) und Z. 131.
   *Befund:* gemessen enthält keiner der vier Leerfälle eine Zahl. Der Haken
   ist da (`done: true`, drei von vier), der Satz ist gut — nur die Zahl fehlt,
   und das ist die eine Angabe, die aus „nichts zu tun" einen Beleg macht.
   `DataTable` böte den Platz: `empty.description` und `empty.action` sind
   ReactNode. `CaseList` verschließt beide — die Beschreibung steht fest in
   `EMPTY`, `action` wird nie durchgereicht. Das ist deshalb kein Story-Versehen,
   sondern **ein Loch in der Schnittstelle**: der Aufrufer kann die Zahl nicht
   liefern, auch wenn er sie hat (die Seite hat sie, sie steht in ihrer
   Reiterleiste).
   *Kleinster Weg:* eine optionale Prop — `emptyCount?: number` — die an die
   Beschreibung anhängt („Alle 117 Sachverhalte sind abgeschlossen."); rein
   additiv, keine Aufrufstelle bricht. Dazu die Zahl in die Story `Empty`.
   **Blockiert.**

4. **`density` steht nicht in der Schnittstelle und hat keine Story.** —
   *Kriterium:* jede Prop des Codes steht in der Spec-Tabelle, und jede Prop
   hat ihre Nachweis-Story (`spec-schreiben` §5).
   *Ort:* `CaseList.tsx` Z. 103 gegen Spec Z. 60–70.
   *Befund:* `density?: TableDensity` wird durchgereicht (Z. 124), taucht in
   der Spec nirgends auf und wird von keiner der acht Stories gesetzt. Die
   Prop, deren Vorgabe still entscheidet, welche Zeilenhöhe die App bekommt.
   *Kleinster Weg:* eine Zeile in der Schnittstellen-Tabelle
   (`` `density` | `TableDensity` | nein, Vorgabe von `DataTable` | Zeilenmaß, durchgereicht | ``)
   und der Nachweis in einer bestehenden Story, oder die Prop streichen, wenn
   die Seite sie nicht braucht. Nicht blockierend — die App setzt sie heute
   nicht.

5. **`minWidth` steht nicht in der Schnittstelle.** — *Kriterium:* wie M4.
   *Ort:* `CaseList.tsx` Z. 81 gegen Spec Z. 60–70.
   *Befund:* `minWidth?: number = 1630` ist die einzige Prop mit einer
   **Vorgabe**, und die Vorgabe trägt die ganze Rechnung aus „Beim Bauen
   gemessen" (Z. 142–144). Die Story `Columns` beweist sie (900 für den
   kürzeren Satz) — nur die Tabelle, aus der die App abliest, kennt sie nicht.
   *Kleinster Weg:* eine Zeile in der Tabelle mit der Vorgabe 1630 und dem
   Verweis auf die Rechnung. Nicht blockierend.

6. **`pager` ist enger als „wie `DataTable`".** — *Kriterium:* Spec Z. 68
   („`sort`, `pager`, `loading`, `error` | **wie `DataTable`** | durchgereicht").
   *Ort:* `CaseList.tsx` Z. 93 gegen `DataTable.tsx` Z. 148–154.
   *Befund:* `DataTable.pager` führt fünftens `pageSizeOptions?: number[]`, und
   nur damit rendert `Pagination` den Umschalter (`DataTable.tsx` Z. 309–312).
   `CaseList.pager` lässt das Feld weg — die Seitengröße ist über diesen
   Baustein **nicht erreichbar**. Drüben ist die Folge schon sichtbar: der
   `listHref` der Seite behandelt `patch.pageSize` (page.tsx Z. 328), und
   nichts kann ihn je damit aufrufen.
   *Kleinster Weg:* `pageSizeOptions?: number[]` in den Typ aufnehmen; rein
   additiv. Nicht blockierend, aber genau die Sorte Abweichung, die eine
   „wie X"-Zeile in der Spec unbrauchbar macht.

7. **Der Zuschnitt „eine Datei, ein Export" stimmt nicht.** — *Kriterium:*
   Spec Z. 32.
   *Ort:* `CaseList.tsx` Z. 144–146.
   *Befund:* die Datei hat **zwei** Funktions-Exporte. `caseListTracks` ist
   sauber gebaut und hat `@when`/`@instead`, wird aber weder im Set noch in der
   App irgendwo gerufen (`grep -rn "caseListTracks"` → nur der Barrel Z. 385).
   *Kleinster Weg:* entweder den Satz in Z. 32–35 auf zwei Exporte fassen und
   `caseListTracks` in die Schnittstelle aufnehmen, oder den Export entfernen,
   solange ihn niemand braucht. Nicht blockierend.

8. **Die Story `Error` beweist nicht, was die Spec ihr zuschreibt.** —
   *Kriterium:* Spec Z. 97 („`Error` | Satz **plus ein Weg, es erneut zu
   versuchen**").
   *Ort:* `CaseList.stories.tsx` Z. 128–139.
   *Befund:* die Story setzt nur `message`. Gemessen endet `--error` nach dem
   Satz — kein Knopf, kein Link. Die Prop `error.retry` existiert (Z. 95) und
   hat damit als einzige der Fehler-Schnittstelle keinen Nachweis.
   *Kleinster Weg:* `retry` in der Story setzen, drei Zeilen. Nicht blockierend.

9. **Zwei deutsche Kommentarzeilen im Code.** — *Kriterium:* CLAUDE.md, „Code
   nur Englisch … Kommentare".
   *Ort:* `CaseList.tsx` Z. 78–79.
   *Befund:* `node scripts/check-language.mjs --all` nennt beide Zeilen. Das
   Tor bleibt grün, weil der Wächter nach eigener Beschreibung nur geänderte
   Zeilen prüft und die Datei zuletzt in `4d59f31` angefasst wurde — die Zeilen
   sind also nie durch das Tor gegangen, sie sind daran vorbeigewachsen. Der
   Inhalt ist gut (die 1630er-Rechnung), er steht nur in der falschen Sprache,
   und dieselbe Rechnung steht auf Englisch bereits in `case-columns.tsx`
   Z. 97–102.
   *Kleinster Weg:* die drei Zeilen übersetzen. Nicht blockierend.

10. **Die §6-Rechnung der Spec widerspricht sich in der eigenen Klammer.** —
    *Ort:* Spec Z. 85–88: „4 anwendbare Zustände (gefüllt · leer · leer nach
    Filter · lädt · Fehler = 5, davon alle anwendbar)". Es sind fünf; die
    Summe 8 stimmt nur mit fünf. *Kleinster Weg:* die „4" auf „5". Nicht
    blockierend.

11. **Story-Name: die Spec sagt `Tabs`, der Export heißt `TabsSideBySide`.** —
    *Ort:* Spec Z. 93 gegen `CaseList.stories.tsx` Z. 80–81.
    *Befund:* die Umbenennung ist **richtig** — die Datei importiert Z. 10
    `Tabs` aus `primitives/Nav`, ein gleichnamiger Export wäre eine Kollision;
    `name: "Tabs"` hält die Anzeige. Nur heißt die Story-ID dadurch
    `--tabs-side-by-side`, und wer nach der Spec sucht, findet sie nicht.
    *Kleinster Weg:* in der Story-Tabelle `TabsSideBySide` (Anzeige „Tabs")
    schreiben. Nicht blockierend.

12. **Die Aufgabe steht auf Status `spec`, obwohl sie gebaut ist.** — *Ort:*
    Kopftabelle Z. 5. *Befund:* `CaseList` steht seit `4d59f31` im Code, hat
    acht Stories und ist im Barrel; die App baut dagegen. *Kleinster Weg:* nach
    Abarbeitung von M1–M3 auf `fertig`, bis dahin auf `in Arbeit`. Nicht
    blockierend im Sinne des Codes, aber der Grund, warum diese Abnahme
    überhaupt nachgeholt werden musste.

### Befunde am Set

- **S1 — Zwei exportierte Typen namens `CaseListTab` im selben Importgraphen.**
  Der Fall aus M1 ist keine Eigenheit dieser Datei: sobald ein Baustein eine
  Union aus `src/ludwig/` verengt, ist der bequeme Weg das Abschreiben und der
  richtige `Exclude<…>`. Ein `grep -rn "^export type .* = \"" src/ui/v3` über
  die Familie würde zeigen, wie oft das sonst noch passiert ist. Für 0119
  vorgemerkt.
- **S2 — `check:language` ist ein Tor für neue Zeilen, kein Netz für alte.**
  M9 wäre in keinem Lauf des Tors aufgefallen; nur `--all` nennt die Zeilen.
  Das ist die dokumentierte Absicht des Wächters (sein JSDoc nennt `--all`
  ausdrücklich „ein Bericht, kein Tor") — aber es heißt, dass jede schlanke
  Abnahme den Bericht selbst ziehen muss, sonst geht der Punkt „Code englisch"
  durch, ohne geprüft zu sein. Gehört in den Skill, nicht in diese Spec.
- **S3 — `check-icons.mjs` hat als einziger der sechs Wächter keine
  Selbstprüfung.** Unverändert seit Befund S4 der Abnahme 0096.
- **S4 — Der Spiegel steht still, und einer der Befunde dieser Spec ist drüben
  schon erledigt.** `check:mirror` meldet den Spiegel auf `f1c58c44`
  (eingefroren 2026-09-08), die App auf `15e87e7b`. In der Zwischenzeit hat
  die App `CaseFilter.disposition` bekommen
  (`apps/web/src/modules/accounting-cases/domain/case.ts` Z. 387–390, Z. 451) —
  genau der Befund, den diese Spec Z. 122–126 als „Neu" notiert („der
  Zuständigkeits-Filter wirkt nicht"). Der Eintrag kann beim nächsten Sync
  gestrichen werden. Kein Handlungsbedarf im Set, solange der Spiegel bewusst
  eingefroren ist.

### Nacharbeit 2026-09-08 (nach der schlanken Abnahme)

Alle zwölf Punkte erledigt oder entschieden.

| Punkt | Was getan |
|---|---|
| **M1** | `CaseListTab` ist jetzt `Exclude<CaseListTab, "offen" \| "schliessen">` aus `src/ludwig/`. Die vier Werte bleiben unverändert, aber sie sind **abgeleitet**: ein siebter Reiter drüben erreicht diese Liste von selbst, und der Cast an der Aufrufstelle der App (`cases/page.tsx:355`) kann weg. Die Zusicherung in der Story ist damit auch gefallen — eine Annotation (`TABLE_TABS: CaseListTab[]`) statt einer Behauptung |
| **M2** | `TAB_TITLE` ist gelöscht; der Kartenkopf liest `CASE_LIST_TAB_LABEL` aus dem Spiegel. Reiterleiste und Kopf haben damit dieselbe Quelle |
| **M3** | Neue Prop `emptyCount?: number`. **Nicht** als angehängter Satz, wie der Vorschlag lautete: 117 abgeschlossene Sachverhalte und 117 Sachverhalte, deren Unterlagen vollständig sind, sind zwei verschiedene Aussagen — ein Satz für alle vier wäre in dreien falsch. Deshalb ist `description` je Reiter eine Funktion der Zahl, mit ihrem alten Wortlaut als Fall ohne Zahl. Der Reiter „alle" nimmt sie nicht: dort ist der Bestand das, was fehlt, und „0 Sachverhalte" sagt weniger als der Satz. Gemessen: „Kein Sachverhalt ist mehr offen. **Alle 117 Sachverhalte dieses Wirtschaftsjahres sind abgeschlossen.**" |
| **M4** | `density` steht in der Schnittstelle und ist an `Columns` belegt — der kürzere Satz **und** die dichte Setzung sind derselbe Fall: dieselbe Liste in einem schmaleren Zusammenhang. Keine neunte Story |
| **M5** | `minWidth` steht in der Schnittstelle, samt Rechnung |
| **M6** | `pager` führt `pageSizeOptions?: number[]`. Damit ist der Zweig `patch.pageSize` drüben (page.tsx:328) erreichbar, statt tot zu sein |
| **M7** | **`caseListTracks` entfernt**, aus der Datei und aus dem Barrel. Niemand ruft ihn, und sein Rumpf ist `caseTracks(caseColumns())` — wer die Tabelle von Hand baut, schreibt genau das. Ein Export ohne Aufrufer ist dasselbe wie eine Prop, die nichts tut. Der Zuschnitt „eine Datei, ein Export" stimmt damit wieder, statt umgeschrieben zu werden |
| **M8** | `Error` setzt `retry`. Gemessen endet die Story jetzt mit „Erneut laden" |
| **M9** | Die zwei deutschen Kommentarzeilen sind Englisch |
| **M10** | Die §6-Rechnung zählt fünf anwendbare Zustände und kommt auf 8 — die Zahl stimmte, die Rechnung nicht |
| **M11** | **Kein Mangel, jetzt begründet:** der Export heißt `TabsSideBySide` und trägt `name: "Tabs"`, weil `Tabs` in derselben Datei der Reiter-Baustein aus `primitives/Nav` ist, den die Story „im Einsatz" braucht. Der Baum zeigt „Tabs"; steht so in der Spec |
| **M12** | Status gesetzt |

Ein Browserlauf über die fünf berührten Stories (`empty`, `error`, `columns`,
`tabs-side-by-side`, `filled`): alle rendern, die Zahl steht im Leerfall, der
Weg zurück im Fehler. `pnpm typecheck` und die fünf Wächter auf Exit 0.

**Offen bleibt** die gemessene Prüfung (0119) — Spurbreiten, Zeilenhöhen,
Kontraste, Trefferflächen, Hover, Fokus, Tastatur, und darin das
Spec-Kriterium „vier Breiten, dieselbe Kante".

### Nachtrag 2026-09-08 — der Owner-Entscheid trifft die Kernannahme

„**Reiter sind keine Filter**": `[year]/cases` bekommt vorübergehend einen
Reiter „Alle Sachverhalte" mit Liste, Suche und Filtern; Reiter kommen
später zurück, aber nur für Sachverhaltsarten mit **eigener Ansicht**.
Zielbild 1 + n Sonderansichten. Festgehalten in `docs/seiten/sachverhalte.md`
und als Absatz unter R9 in `docs/web-ui-regeln.md`.

**Kein Bauauftrag** (Ansage `ludwig-manager`), aber es gehört hierher, weil
es die eine Entscheidung dieser Spec berührt: „**Der Reiter ist der
Leerfall.**" Diese Spec hat aus vier Reitern eine Komponente gemacht, gerade
weil sie sich in nichts als der Grundgesamtheit unterschieden — dieselbe
Messung, aus der der Owner jetzt den umgekehrten Schluss zieht: was sich nur
in der Grundgesamtheit unterscheidet, braucht keinen Reiter.

Was das für `CaseList` heißt:

- **Die Komponente bleibt richtig.** Sie nimmt den Reiter als Prop und ist
  darin schon der eine Fall: geht die App auf einen Reiter, ruft sie
  `tab="alle"` und alles Übrige steht. Weil `CaseListTab` seit heute aus
  `src/ludwig/` **abgeleitet** ist (M1), schrumpft der Typ von selbst mit,
  sobald drüben `CASE_LIST_TABS` schrumpft — nichts nachzuziehen.
- **Was `EMPTY` betrifft — beantwortet.** Drei der vier Leerfälle sind
  ein **Erfolg** („Kein Sachverhalt ist mehr offen."). Mit einer Liste
  entsteht dieser Zustand nicht mehr durch den Reiter, sondern durch einen
  **Filter mit leerem Ergebnis** — und den behandelt `DataTable` über
  `filtered` als Bedienfehler mit Weg zurück, nicht als Erfolg. Genau die
  Aussage, die dieser Seite ihren Job gibt („fertig ist sie, wenn kein Fall
  mehr auf sie wartet"), hängt daran. **Beantwortet am 2026-09-08 (Owner):**
  der Standardstand entscheidet — offen und eigene Zuständigkeit, unverändert
  und leer heißt Erfolg; verändert und leer heißt „keine Treffer". Die Falle
  liegt in der Berechnung: der Standard ist selbst ein Filter, `filtered` ist
  also „weicht vom Standard ab", nicht „ein Filter ist gesetzt". Für `CaseList`
  ändert sich nichts — die Seite kennt ihren Standardstand, `filtered` ist
  schon durchgereicht. Wortlaut im Seitenprofil.
- **`emptyCount` wird dabei wichtiger, nicht überflüssig:** die Zahl ist das,
  was einen erfolgreichen Leerfall belegen kann, wenn der Reiter ihn nicht
  mehr benennt.
