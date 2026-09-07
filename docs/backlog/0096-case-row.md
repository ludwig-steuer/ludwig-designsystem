# 0096 · CaseRow — der Sachverhalt als eine Zeile

| | |
|---|---|
| Status | Abnahme |
| Freigabe | 2026-09-06 — Zuschnitt neu gefasst (Abschnitt „Neufassung"), damit freigegeben |
| Stufe | `entities/accounting-case/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: zehn Datenpunkte einer Ludwig-Entität, drei davon aus ihren Achsen |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md` (Status `geprüft`, 2026-09-05), Formen-Tabelle Zeile `CaseRow`; Ränge 1–10 |
| Ersetzt | die 11-Spalten-Zeile in `app/(app)/clients/[clientSlug]/[year]/cases/page.tsx` samt `CaseIdCell`, `CaseKindCell`, `StatusCell`, `ExportStatusCell`, `DispositionCell`, `ClarificationCell`, `CaseRow.tsx` (27 Z.) und `CaseSummaryTooltip` — **und** die 6-Spalten-Tabelle in `business-partners/ui/tabs/CasesTab.tsx` |
| Voraussetzung | 0095 `CaseCell` (die Zeile nennt den Fall über sie) |
| Blockiert | `CaseList` (0082), `CasePicker` (0084), `CaseCard` (0081) |
| Spec von / am | Claude, 2026-09-05 (Skill `spec-schreiben`, nach dem geprüften Profil) |

## Ziel

Die Sachbearbeiterin überfliegt ihren Vorrat — p90 **190 offene** Fälle je
Mandant und Jahr — und muss je Zeile drei Dinge sehen: *worum geht es, bin
ich dran, was hängt daran?* Heute steht diese Zeile zweimal handgeschrieben
in zwei Seitendateien, mit zwei verschiedenen Spaltensätzen und sechs
Zell-Hilfskomponenten, die es nur dort gibt.

## Einordnung

- **Wiederverwenden:** `Row` trägt das Zeilen-Markup, `CaseCell` (0095) den
  Fall selbst, `StatusBadge` die drei Achsen, `Amount` und `Time` die Werte.
  Was fehlt, ist die Reihenfolge — welcher Punkt wo steht, und zwar in beiden
  Listen gleich.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 — die Zeile ist die Form, die
  `ui-repraesentationen.md` für diese Entität führt, sie existiert zweimal
  handgeschrieben, und keine vorhandene Form deckt sie ab.
- **Zuschnitt:** eine Datei, ein Export. Der Spaltensatz ist **keine**
  zweite Komponente: die Listen unterscheiden sich in der Grundgesamtheit,
  nicht in der Zeile (Profil §Listen). Welche Spalten eine Liste zeigt,
  entscheidet `CaseList` (0082) über `columns`.
- **Setzt auf:** `Row`, `CaseCell`, `StatusBadge`, `Badge`, `Amount`, `Time`.

## Die Reihenfolge ist die Entscheidung

Die zehn Punkte in der Reihenfolge des geprüften Profils. Sie ist **über alle
Formen dieselbe** — was die Zeile zeigt, zeigt die Karte auch, und zwar an
derselben Stelle:

| Rang | Punkt | Woher |
|---|---|---|
| 1 | Anzeigename | `caseDisplayTitle()` (0095) |
| 2 | Bearbeitungsstand | Achse `sachverhalt` |
| 3 | Nummer | `caseNumber`, mono |
| 4 | Betrag | `totalAmount` + `currency`, rechts, `tnum` |
| 5 | Gegenpart | `counterpartyName` |
| 6 | Zuständigkeit | Achse `disposition` |
| 7 | Art | `CASE_KIND_LABEL` — **kein Status**, also keine Farbe (Befund L-53) |
| 8 | Offene Klärungen | Zähler, Achse `klaerung` |
| 9 | Eröffnet | `openedAt` |
| 10 | Export-Zustand | Achse `export_case`, abgeleitet |

**Der Gegenpart steht ab S und nicht erst ab M** — das ist die Korrektur des
Prüflaufs vom 2026-09-05: 483 Fälle haben einen `title`, aber nur **15**
nennen darin den Gegenpart. In 467 von 483 Fällen trüge Rang 1 ihn also
nicht. Die Zeile zeigt beides, und das ist keine Dopplung.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `case` | `CaseListItem` | ja | Der Fall. Der Typ kommt aus `src/ludwig/modules/accounting-cases/domain/case.ts` und wird nicht lokal neu definiert | `Filled` |
| `href` | `string` | nein | Die ganze Zeile wird ein Link. Ohne `href` ist sie ein `div` — der Partner-Reiter zeigt sie heute ohne Ziel | `Filled`, `WithoutLink` |
| `columns` | `CaseColumn[]` | nein, Default alle zehn | Welche Punkte in welcher Reihenfolge. Die Reihenfolge ist **nicht frei**: die Prop wählt aus, sie sortiert nicht um | `Columns` |
| `counterpartyHref` | `string` | nein | Der Gegenpart wird ein Link zum Geschäftspartner, wo einer aufgelöst ist (47 %) | `Filled` |

`CaseColumn` ist eine String-Union der zehn Punkte (`name`, `state`,
`number`, `amount`, `counterparty`, `disposition`, `kind`, `clarifications`,
`openedAt`, `exportState`) — keine freie Zeichenkette, damit ein Tippfehler
ein Typfehler ist.

**Kann bewusst nicht:**

- **Die Spalten umsortieren.** Die Reihenfolge ist die Entscheidung dieser
  Spec und über alle Formen dieselbe. `columns` lässt weg, es ordnet nicht um.
- **Die Art färben.** `CASE_KIND_LABEL` ist laut eigenem Kommentar kein
  Status; die App färbt `recurring_charge` trotzdem (Befund L-53). Die Zeile
  zeigt die Art als `Badge` ohne Ton, bis die Achse entschieden ist.
- **Klicken, außer als ganze Zeile.** Kein `onSelect`, kein Menü — die
  Auswahl bringt `DataTable` mit (0057), die Zeilenaktionen `RowActions`.
- **Die Zusammenfassung zeigen.** Sie ist Rang 11 und p90 309 Zeichen lang;
  in der Zeile steht sie heute nur im Tooltip, und ein Tooltip trägt keine
  300 Zeichen (T8). Sie kommt in `CaseFacts` (0097).

## Verhalten

Server-Component. Text links, Zahlen rechts mit `tnum`, nichts zentriert
(V3). Der Anzeigename ist die kräftige Spalte (`v2main`) und kürzt mit
Ellipse; der volle Name steht im `title`. Kein Zustand ohne Wort (V7): alle
drei Achsen laufen über `StatusBadge`, der Klärungszähler zeigt „n offen"
statt einer nackten Zahl.

Mit `href` ist die ganze Zeile ein Link (`Row href`); der Link auf den
Geschäftspartner darin ist der eine erlaubte zweite Klickweg und stoppt die
Propagation nicht selbst — das macht `Row`, wie im Bestand.

Zustände: gefüllt · leer (kein Betrag, kein Gegenpart, keine Klärung — der
häufige Fall bei 52 % Betrags-Füllung). Lädt und Fehler gehören der Liste
(`TableLoading`, `ErrorRow`), nicht der Zeile.

## Stories

Titel `v3/Entitäten/Sachverhalt/CaseRow`. Abgeleitet nach §6: 2 anwendbare
Zustände + 1 Enum (`columns`) + 1 Layout-Boolean (`href`) + 0 Callbacks +
1 „im Einsatz" + 1 Rand = 6.

| Story | Beweist |
|---|---|
| `Filled` | Alle zehn Punkte, ein Fall mit Betrag, Gegenpart und Klärung; die Zeile ist ein Link |
| `Sparse` | Leer: ohne Betrag, ohne Gegenpart, ohne Klärung, ohne Export — jeder Punkt sagt „—" statt zu fehlen |
| `Columns` | Der 6-Spalten-Satz des Partner-Reiters neben dem vollen — dieselbe Zeile, zwei Auswahlen |
| `WithoutLink` | Ohne `href`: ein `div`, kein `a`; der Gegenpart bleibt trotzdem klickbar |
| `Edges` | Rand: 90-Zeichen-Name, Betrag über einer Million, drei offene Klärungen, Nummer ohne Wirtschaftsjahr |
| `InUse` | Fünf Zeilen in einer `Card` mit `HeadRow` — Köpfe der Status-Spalten über `StatusHeader` (0077), Regel Z4 einmal komplett |

Nicht anwendbar: `leer nach Filter`, `lädt`, `Fehler` (Begründung im
Verhalten).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Der Abnahme-Bucket als Gruppenkopf (Rang 25) | `CaseColumn` um `triage` erweitert | `CaseCard` (0081) baut den Schließen-Flow, der ihn heute als Gruppenkopf führt |
| Im Drawer nachschlagen | reicht `onPeek` an `CaseCell` durch | 0098 ist gebaut |

## Befunde für `ludwig/app`

- **B1 (L-53)** — Die Art wird zweimal ohne Achse gefärbt: `CaseKindCell`
  (`recurring_charge` → warning, sonst info) und `CloseCasesPanel` (fest
  verdrahtete Hex-Werte, ganz ohne `Badge`). Entweder eine Achse in der
  Registry oder die Farbe weg; bis dahin zeigt die Zeile die Art tonlos.
- **B2 (L-63)** — Der Zuständigkeits-Filter der Liste ist tot:
  `CaseListFilters` schreibt `?dispo=`, `caseFilterForListTab()` liest ihn
  nicht, `CaseFilter` hat kein Feld dafür. Rang 6 steht in der Zeile; der
  Filter darüber wirkt nicht.
- **B3** — `disposition = 'client'` kommt im Bestand **nullmal** vor, obwohl
  der CHECK ihn erlaubt und das Portal auf ihm steht. Vor dem Umzug klären,
  ob die Portal-Liste je gefüllt war.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Die zehn Punkte stehen in der Reihenfolge der Tabelle oben; `columns` lässt weg und ordnet **nicht** um (Story `Columns`)
- [ ] Der Gegenpart steht als eigener Punkt ab S — nicht erst in `CaseFacts` (Story `Filled`)
- [ ] Alle drei Achsen laufen über `StatusBadge`; `grep` findet keine lokale Label-Map in der Datei
- [ ] Die Art trägt **keinen** Ton, solange L-53 offen ist (Story `Filled`)
- [ ] Der Klärungszähler zeigt „n offen", nie eine nackte Zahl (V7, Story `Filled`)
- [ ] Ohne `href` rendert kein `<a>` für die Zeile (Story `WithoutLink`)
- [ ] `case` ist `CaseListItem` aus `src/ludwig/`; die Datei definiert keinen eigenen Zeilen-Typ
- [ ] Jeder fehlende Wert steht als „—", keiner fehlt still (Story `Sparse`)
- [ ] offen (App): ersetzt die Zeile in `[year]/cases/page.tsx` samt sechs Zell-Hilfskomponenten und `CaseSummaryTooltip`, dazu die Tabelle in `CasesTab.tsx`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: siehe Abschnitt „Abnahme (2026-09-07)“ am Ende der Datei.

## Offene Fragen

1. Zehn Spalten sind viel für eine Liste mit p90 190 Zeilen. Fliegt einer
   raus? *Ohne Antwort: nein — der Schnitt gehört der Liste (0082) über
   `columns`, nicht der Zeile. Die Zeile kann alle zehn, die Seite wählt.*
2. Trägt die Zeile den Gegenpart auch dann, wenn `title` ihn schon nennt (15
   von 483)? *Ohne Antwort: ja. Eine Spalte, die bei 3 % der Zeilen doppelt
   ist, ist billiger als eine, die bei 97 % fehlt.*
3. Bleibt der Klärungszähler eine eigene Spalte oder wandert er als Marke an
   den Zustand? *Ohne Antwort: eigene Spalte, wie heute — sie ist
   sortierbar, eine Marke wäre es nicht.*

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: zurück — Zuschnitt neu.** Drei Gründe: (1) `CaseCell` in der Zeile ergibt Dopplung und `<a>` in `<a>` (`Row href` + Link in der Zelle + `counterpartyHref`); Hausmuster ist `SourceDocumentRow`: die Zeile teilt `case-title.ts`/`caseIdentifier()`, komponiert die Zelle nicht, der Zeilenlink liegt als `.v2rowlink` am Anzeigenamen (I11). (2) `DataTable` rendert aus `ColumnDef.cell`, nimmt keine Row-Komponente — die Hauptliste (p90 190, Pagination, Sortierung) braucht einen `ColumnDef<CaseListItem>[]`-Satz, Vorbild `accountEntryColumns`. (3) Zwei stille Abweichungen vom Profil: die Ereignis-Zähler Belege/Bank-Tx fehlen, `CaseColumn` kennt kein `fiscalYear` (Rang 20, Partner-Reiter).

**Entscheid (vorab freigegeben, wenn die Neufassung dem folgt):** `caseColumns()` als `ColumnDef`-Satz mit `columns`-Auswahl als Option, plus `CaseRow` für kurze Listen (≤ 50) aus denselben Zellfunktionen — wie `AccountEntries`. Offene Fragen 1–3 mit Default. B3 (`disposition='client'`) streichen — `case.ts` sagt schon „stillgelegt". `CaseColumn` um `fiscalYear`, `documents`, `bankTransactions` erweitern oder mit Grund ausschließen. Diese Entscheidung gilt zugleich für 0101 (`BankTransactionRow`) und 0085.

Befunde ins Register: **L-69** — `CaseListItem.counterpartyPartnerId` fehlt; die Zeile kann den Gegenpart nicht verlinken, obwohl 47 % aufgelöst sind.

## Neufassung 2026-09-06 — der Zuschnitt nach der Freigabe

Die Freigabe hat den ersten Zuschnitt zurückgewiesen. Was jetzt steht:

**`caseColumns()` ist die Komponente, `CaseRow` der zweite Rahmen.**
`DataTable` rendert aus `ColumnDef.cell` und nimmt keine Zeilen-Komponente —
die Hauptliste (p90 190, Pagination, Sortierung) braucht einen
`ColumnDef<CaseListItem>[]`-Satz. Kurze Listen (der Reiter des
Geschäftspartners) bekommen `CaseRow`, gebaut aus **denselben** Zellfunktionen.
Zwei Zeilen-Komponenten für eine Entität wären R17; zwei Zelldefinitionen
wären derselbe Verstoß eine Ebene tiefer. Vorbild ist `accountEntryColumns`.

**Die Zeile komponiert `CaseCell` nicht.** Die Zelle trägt ihren eigenen Link,
und der Zeilenlink würde ihn umschließen — Anker im Anker. Beide teilen
stattdessen `case-title.ts`, wo die Benennungsregel tatsächlich wohnt. Der
Zeilenlink liegt als `.v2rowlink` am Anzeigenamen und deckt die Zeile über
`::after` (I11, Hausmuster `SourceDocument`); gemessen trifft ein Klick bei
75 % der Zeilenbreite den Link, und im ganzen Set gibt es null verschachtelte
Anker.

**Der Spaltensatz ist um drei Punkte gewachsen** (Freigabe): `fiscalYear`
(Rang 20 — nur wo eine Liste über Jahre hinweg listet, also im Partner-Reiter),
`documents` und `bankTransactions` (die zwei Ereignis-Zähler des Profils).
Alle drei sind **nicht** im Vorgabesatz: die Hauptliste steht in einem Jahr
und zeigt zehn Punkte.

**`counterpartyHref` ist eine Funktion des Falls**, kein fester String:
`CaseListItem` trägt keine Partner-Id (**L-69**), 47 % sind aufgelöst, und
welcher, weiß nur der Aufrufer.

**`href` ebenfalls als Funktion** — die Zeile baut keine URL, und ein fester
String je Zeile wäre bei 190 Zeilen 190 Props.

**B3 gestrichen:** `case.ts` sagt zu `disposition='client'` schon
„stillgelegt"; ein zweiter Befund darüber wäre Doppelung.

**Story-Formel:** 2 anwendbare Zustände + 1 Enum (`columns`) + 1
Layout-Boolean (`href`) + 0 Callbacks + 1 „im Einsatz" + 1 Rand = 6.
`Columns` übergibt seine Auswahl **verdreht**, sonst bewiese die Story nicht,
dass `columns` auswählt statt zu ordnen.

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — die Spalte mit Rang 1 war 2 px breit.** Die neun festen Spuren ergeben
mit Lücken und Polster 1396 px; in einem 1398-px-Rahmen blieben dem
Anzeigenamen zwei. Er lief über seinen Nachbarn — in `InUse` um bis zu 289 px.
`minWidth={1180}` lag **unter** dem festen Anteil, also sprang das waagerechte
Scrollen nie an. Jetzt `minmax(24ch, 1fr)` und `minWidth={1570}`; gemessen ist
die erste Zelle 204 px breit und die Tabelle scrollt.

**M2 — die Ellipse griff nicht.** `.v2caserow__name` sitzt an einem Span **in**
der Zelle, und der ist `display: inline` — dort wirkt weder `overflow` noch
`text-overflow` noch `min-width`. Jetzt `display: block`.

**M3 — die Zustandsspalte lief über.** „Wartet auf Unterlagen" misst 179 px,
die Spur stand auf 160. Jetzt 190.

**M4 — vier Punkte fehlten still.** Stand, Zuständigkeit und Export zeigen
jetzt „—". Der Klärungszähler **nicht**: keine Klärung ist kein fehlender
Wert, sondern die Antwort null — „0 offen" wäre Lärm in einer Spalte, die nur
meldet, wenn es etwas zu melden gibt. Das steht als Kommentar am Code.

**M5 — `caseTracks` ohne `@when`/`@instead`** — nachgetragen.

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

**L-69 ist erledigt.** Die App hat `CaseListItem.counterpartyPartnerId` mit
`a094826e` ergänzt; der Spiegel führt das Feld. An der Schnittstelle ändert
das nichts — `counterpartyHref` bleibt eine Funktion des Falls, weil die Route
dem Aufrufer gehört —, aber die Stories bauen den Verweis jetzt aus der
**Partner-Id** statt aus der Sachverhalts-Id. Das ist der Unterschied, um den
es im Befund ging: 47 % der Sachverhalte haben einen aufgelösten Partner, und
nur die bekommen einen Link. Ein Fall in `CaseList` trägt deshalb einen
Gegenpart **ohne** Id — sonst zeigte keine Story, dass der Name dann kein Link
ist.

## Abnahme (2026-09-07)

Erste Abnahme, fremder Prüfer (designsystem, kein Bauanteil, kein Chat-Verlauf).
Gemessen im Storybook-Dev-Server auf 6107 über CDP, Viewport 1440×900 (für die
Trefferprobe 1760×900). `pnpm build` wurde **nicht** gelaufen — mehrere Prüfer
teilen den Baum (Aufgabe 0117); `pnpm typecheck` steht dafür als Beleg.

| Kriterium | Nachweis (Story-ID · Befehl · Zahl) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | Exit 0 | **ja** |
| `pnpm build` grün | nicht ausgeführt (0117) — Konsole aller sechs Stories fehlerfrei, nur Vite-/React-DevTools-Hinweise | offen |
| Datei nach der Familie benannt, Story daneben, Titel richtig | `entities/accounting-case/{CaseRow,case-columns,CaseRow.stories}.tsx`; Titel `v3/Entitäten/Sachverhalt/CaseRow` | ja |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:when` Exit 0, `pnpm check:language` Exit 0; `caseColumns`, `caseTracks`, `CaseRow` tragen beide Zeilen | ja |
| Kein Hex, kein px in TSX außer Spurbreiten, keine lokale Label-Map | `grep -E '#[0-9a-f]{3,8}'` leer; Labels aus `CASE_KIND_LABEL` und der Registry; Spurbreiten wie in `source-document-columns` (16×), `account-columns` (8×) | ja |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | 6 vorhanden = Formel §6 (2 Zustände + 1 Enum + 1 Layout-Boolean + 0 Callbacks + 1 Einsatz + 1 Rand); „leer nach Filter“, „lädt“, „Fehler“ begründet an die Liste abgegeben | ja, mit **M3/M5** |
| Prüfliste `design-guidelines.md` §9 | durchgegangen (App-Punkte A6 und §11 übersprungen) | **M1** (Zeilenhöhe V1), **M2** (Tastatur), **M4** |
| Im Browser angesehen | sechs Stories gerendert, drei Screenshots, Konsole sauber | ja |
| Reihenfolge fest; `columns` wählt aus, ordnet **nicht** um | `…--columns` übergibt `fiscalYear, state, amount, openedAt, number, name`; gerendert `Sachverhalt · Stand · Nummer · Betrag · Eröffnet · Jahr` | **ja** |
| Gegenpart als eigener Punkt ab S | Rang 5, eigene Spur, in `Filled` als Link auf den Partner | ja, aber **M1** |
| Alle drei Achsen über `StatusBadge`, keine lokale Label-Map | `sachverhalt`, `disposition`, `export_case`; Klassen gemessen `bdg-info` / `bdg-warning` | ja |
| Die Art trägt **keinen** Ton | `…--filled`: Art `bdg-neutral` `rgb(236,239,243)` gegen Stand `bdg-info` `rgb(227,240,248)` | **ja** |
| Klärungszähler „n offen“, nie eine nackte Zahl | `Filled` „1 offen“, `Sparse` „3 offen“; 0 bleibt stumm (begründet am Code) | ja |
| Ohne `href` kein `<a>` für die Zeile | `…--without-link`: einziger Anker der Zeile ist der Gegenpart; kein `.v2rowlink` | **ja** |
| `case` ist `CaseListItem` aus `src/ludwig/` | Import Z. 1, kein lokaler Zeilentyp | ja |
| Jeder fehlende Wert steht als „—“ | `Sparse`: Betrag, Gegenpart, Wer ist dran, Export je „—“ | ja, außer **M6** |
| Keine verschachtelten Anker | `a a` = **0** in allen sechs Stories und in `CaseList` `Filled`; die Zeile trifft an 18 von 21 sichtbaren Punkten den `.v2rowlink` (86 %), die Ausnahmen sind der Gegenpart-Link und ein (i) | **ja** |
| Nachtrag L-69: Verweis aus der Partner-Id, ein Fall ohne Id | `caselist--filled`: Zeile 3 „Stadtwerke Musterstadt“ (`counterpartyPartnerId: null`) ist **kein** Anker; die drei anderen zeigen auf `#partner-bp-8841` | **ja** |
| offen (App): ersetzt die zwei handgeschriebenen Zeilen | nicht Gegenstand dieser Abnahme | offen |

### Mängel

**M1 — die Gegenpart-Spur ist gegen ihren eigenen Wertebereich zu schmal; die
Zeile wächst statt zu kürzen.** `case-columns.tsx:154–166` — `width: "180px"`,
und die Zelle hat keine Kürzungsregel. Der breiteste Wert kam in die echte
Zelle, gemessen in `v3-entitäten-sachverhalt-caserow--in-use` bei 1440×900
(Spur 180 px, Zeile im Ausgang 48,0 px):

| Gegenpart | Zeilenhöhe |
|---|---|
| 10 Zeichen (Ausgang) | 48,0 px |
| p50 · 14 Zeichen | 48,0 px |
| **p90 · 27 Zeichen** | **66,8 px (+39 %)** |
| max · 57 Zeichen | **87,8 px (+83 %)** |
| Gegenprobe zurück auf 10 Zeichen | 48,0 px |

Wertebereich aus dem geprüften Profil (`docs/entitaeten/accounting-case.md`,
Rang 5): 95 % gefüllt, **p50 14 · p90 27 · max 57 Zeichen**. Gemessen misst
„Bürobedarf Meier GmbH“ (21 Zeichen) 156,1 px, also 7,4 px je Zeichen — 180 px
tragen 24. Ab dem 25. Zeichen bricht die Zelle um; jede zehnte Zeile ist damit
anderthalb Zeilen hoch (V1). Rang 1 hat die Regel (`.v2caserow__name`), Rang 5
hat sie nicht. Kleinster Weg: an die Gegenpart-Zelle die vorhandene
`.v2trunc` (`v3.css:3456`) plus `title={c.counterpartyName}` — eine Klasse,
keine neue Regel.

**M2 — das (i) steht zweimal: im Spaltenkopf und in jeder Zeile.**
`case-columns.tsx:132–137, 172–177, 226–231` geben `StatusBadge` kein
`info={false}`, obwohl der Kopf sein (i) schon über `headerAside` trägt
(Z. 128, 170, 224) und der eigene Kommentar der Datei (Z. 124–127) genau das
festhält. Gemessen in `…--in-use` bei 1760×900: Kopfzeile 3 Knöpfe, **jede
Datenzeile ebenfalls 3** → **5 Fokusstopps je Zeile** (`A.v2rowlink`, 3 ×
`BUTTON` „…: Zustände erklären“, `A` Gegenpart) statt 2; bei p90 190 Zeilen sind
das 570 zusätzliche Tabstopps vor dem Pager. Gegenprobe: die Knöpfe zur Laufzeit
entfernt → 2 Fokusstopps je Zeile, und die Zustandszelle schrumpft von
**181,3 auf 163,3 px** — die breiteste Ausprägung „Wartet auf Unterlagen“ hat
mit dem (i) nur **8,7 px** Luft in der 190-px-Spur, ohne es 26,7. Die
Geschwister im Set machen es anders: `source-document-columns.tsx:397/414/425`,
`account-columns.tsx:199`, `DataTable.stories.tsx:137` und `CaseCell.tsx:67`
derselben Familie setzen `info={false}`. Kleinster Weg: `info={false}` an die
drei `StatusBadge`.

**M3 — die Story `Columns` zeigt zwei ihrer sechs Punkte nicht.**
`CaseRow.stories.tsx:112` setzt `MIN_WIDTH = 1630` für **alle** Stories, auch
für den Sechs-Spalten-Satz, dessen feste Spuren nur 620 px ergeben. Gemessen in
`…--columns` bei 1440×900: Spuren `924px 190px 110px 130px 110px 80px`, Tabelle
1630 px in einem 1398-px-Fenster — alles ab „Eröffnet“ ist abgeschnitten, und
damit ist **`fiscalYear` unsichtbar**, die eine Spalte, für die der
Partner-Reiter-Satz überhaupt existiert. Der Anzeigename bekommt 924 statt der
200 px Boden. `CaseList.stories.tsx:151` rechnet denselben Satz richtig
(`minWidth={900}`, `maxWidth 1180`). Kleinster Weg: `Frame` rechnet die
Mindestbreite aus `columns` (Summe der Spuren + Lücken + 36 Polster + 200)
statt sie zu konstantieren; für die sechs Spalten sind das 906.

**M4 — der Spaltenkopf baut von Hand nach, was zwei Bausteine liefern.**
`CaseRow.stories.tsx:130–135` hängt drei `StatusInfoButton` selbst in die
`HeadRow`, obwohl jede Spalte ihr `headerAside` mitbringt und `StatusHeader`
(0077) genau dieses Markup ist — die Spec verlangt für `InUse` ausdrücklich
„Köpfe der Status-Spalten über `StatusHeader`“. Gemessen: der Abstand zwischen
„Stand“ und dem (i) ist **0 px**; `.v2sth` (`v3.css:2906`) gäbe
`var(--space-1)`. Kleinster Weg: im `Frame` `{c.header}{c.headerAside}`
rendern.

**M5 — zwei der dreizehn `CaseColumn`-Werte hat nie jemand gesehen.**
`documents` (100 px) und `bankTransactions` (110 px) kommen in **keiner** Story
der Familie vor (`grep` über alle `*.stories.tsx` unter
`entities/accounting-case/`). Die Freigabe hatte sie „erweitern oder mit Grund
ausschließen“ verlangt; erweitert sind sie, gezeigt nicht — ihre Spurbreiten
sind ungemessen. Kleinster Weg: sie in die `Columns`-Auswahl aufnehmen, die
ohnehin der Nachweis ist, dass `columns` auswählt.

**M6 — Rang 3 verliert die Identität, wo die Familie sie gerade rettet.**
`case-columns.tsx:144` rendert `MonoCell value={c.caseNumber}`; bei
`caseNumber === null` steht dort „—“. Der Fall ist echt (`case.ts:277–279`:
„Kann null sein, wenn der Case kein `fiscal_year` hat“) und die Story baut ihn
selbst: `…--edges`, zweite Zeile, Zelle „Nummer“ = „—“. `case-title.ts:52–62`
hält dafür `caseIdentifier()` bereit und begründet ausdrücklich, dass der Strich
hier falsch ist („es hat eine, es hat nur keine Nummer“); `CaseCell.tsx:62`
benutzt sie. Kleinster Weg: `caseIdentifier(c)` statt `c.caseNumber`.

**M7 (klein) — zwei Story-Texte sagen etwas anderes als ihr Bild.** `Sparse`
soll laut Spec „ohne Klärung“ zeigen, zeigt aber „3 offen“ (der stumme Nullfall
steht nur in `InUse`), und ihr Kommentar sagt, der Anzeigename falle „auf Art
plus Gegenpart“ zurück — gemessen steht dort „Umbuchung“, die Art allein, weil
der Fall keinen Gegenpart hat. Dazu tragen in `CaseRow.stories.tsx` drei
verschiedene Firmen dieselbe `counterpartyPartnerId` `bp-8841` (§6: Daten in
Stories sehen echt aus).

### Was gemessen wurde und hielt

- Die Ellipse greift: `…--edges`, `.v2caserow__name` `display: block`,
  `scrollWidth` 647 gegen `clientWidth` 204, voller Name im `title`, Zeile
  bleibt 48,0 px hoch (M2 der Vorrunde ist erledigt).
- Rang 1 ist 204 px breit und die Tabelle scrollt: `minmax(200px, 1fr)`,
  Fenster 1398, Tabelle 1630 (M1 der Vorrunde ist erledigt).
- Die breitesten Werte je Achse in der echten Zelle (1440×900):
  Stand „Wartet auf Unterlagen“ 181,3 in 190 · Art „Ausgangsrechnung“ 127,6 in
  160 · Export „Nicht exportiert“ 123,9 in 150 · Zuständigkeit „Mandant“ 86,4
  in 150 · Nummer `2026-0412` 69,5 in 110 · Eröffnet `26.08.2026` 73,6 in 110 ·
  Klärung „3 offen“ 43,8 in 120 · Jahr 80 in 80. Der Betrag über einer Million
  misst 102,3 px in 130 und steht bündig an der Spurkante (`text-align: right`,
  `tabular-nums`).
- Alle sechs Stories rendern ohne Konsolenmeldung.

Abgenommen von / am: **zurück** — designsystem (fremder Prüfer), 2026-09-07.
Offene Punkte: M1 und M2 tragen das Urteil (die Zeile wächst bei p90 des
Wertebereichs auf 66,8 px und trägt fünf Fokusstopps statt zwei); M3–M7 sind
klein und in einem Zug mit zu erledigen. `pnpm build` bleibt für die
Wiedervorlage offen.

## Nach der Abnahme (2026-09-07)

Beide tragenden Mängel sind behoben, dazu drei der kleinen.

**M1 — die Gegenpart-Spur trug 24 Zeichen, der Wertebereich geht bis 57.**
Ohne Kürzung brach die Zelle um: p90 (27 Zeichen) machte die Zeile 39 %, das
Maximum 83 % höher als ihre Nachbarn. Sie hat jetzt `.v2trunc` und ihren
`title`. Gemessen in `InUse` bei 1760 px, Werte zur Laufzeit gesetzt:

| Zeichen | Zeile | kürzt |
|---|---|---|
| 14 (p50) | 48,0 px | nein |
| 27 (p90) | **48,0 px** (vorher 66,8) | ja (329 → 180) |
| 57 (max) | **48,0 px** (vorher 87,8) | ja (695 → 180) |

**M2 — das (i) stand zweimal.** Der Kopf trägt es über `headerAside`, und die
drei Abzeichen brachten ihr eigenes mit — bei 190 Zeilen sind das 570
zusätzliche Tabstopps. Jetzt `info={false}`, wie es `CaseCell` und drei andere
Spaltensätze im Set längst tun.

**M3 — die Mindestbreite folgt dem Spaltensatz.** `Columns` erbte die feste
1630 des vollen Satzes; zwei Spalten standen außerhalb der Karte, darunter
`fiscalYear` — die, für die der Partner-Satz überhaupt existiert. Gemessen
sind jetzt alle sechs sichtbar.

**M4 — das (i) kommt aus dem Spaltensatz.** Die Story hängte drei
`StatusInfoButton` von Hand in die Kopfzeile; jetzt rendert sie `headerAside`,
also dieselbe Stelle und derselbe Abstand wie in `DataTable`.

**M6 — die Nummer nutzt `caseIdentifier()`.** Ein Sachverhalt ohne Nummer zeigt
die ersten acht Zeichen seiner Id statt „—". Der Strich sagte „hat keine" —
er hat eine Identität, nur keine Nummer, und `case-title.ts` hält die Regel
dafür seit jeher bereit.

**M7 — der Story-Text stimmt.** Er behauptete einen Rückfall auf „Art plus
Gegenpart"; ohne Titel **und** ohne Gegenpart bleibt die Art allein, und die
drei offenen Klärungen sind kein Widerspruch: der Fall ist dünn an Stammdaten,
nicht an Arbeit.

**M5 bleibt offen:** `documents` und `bankTransactions` haben keine Story, ihre
Spurbreiten sind ungemessen. Das ist eine Story-Ergänzung, keine Reparatur.

## Wiederabnahme 2026-09-07 (fremde Abnahme)

Zweiter Prüfer, kein Bauanteil, kein Chat-Verlauf — gelesen wurden Spec,
Skill-Abschnitt „Abnahme", `design-guidelines.md` §9 und der Code. Gemessen
über CDP gegen den laufenden Dev-Server auf **6107**, Viewport 1440×900, die
Layout-Punkte zusätzlich bei **700 · 1100 · 1400 · 1920**, die Zeilenprobe bei
1760×900. `pnpm build` wurde **nicht** gelaufen (Aufgabe 0117 — mehrere Prüfer
teilen den Baum); `pnpm typecheck` steht dafür als Beleg.

**Urteil: zurück** — aber kein Mangel blockiert. Die beiden tragenden Mängel
der Vorrunde (M1 Zeilenhöhe, M2 doppeltes (i)) sind behoben und nachgemessen,
ebenso M3, M4 und M6. Offen bleiben **M5** (vom Bauenden selbst als offen
vermerkt), der Rest von **M7** und ein **neuer, kleiner Befund N1**, der aus
der M3-Reparatur stammt. Nach der Hausregel („alles ✓ → fertig, sonst zurück")
reicht das nicht für `fertig`; alle drei sind in einem Zug zu erledigen.

### Story-Deckung (zuerst geprüft)

| Frage | Befund |
|---|---|
| Zahl gegen die Ableitung §6 | 2 Zustände + 1 Enum (`columns`) + 1 Layout-Boolean (`href`) + 0 Callbacks + 1 Einsatz + 1 Rand = **6**; vorhanden sind `Filled`, `Sparse`, `Columns`, `WithoutLink`, `Edges`, `InUse` — **stimmt** |
| Hat jede Prop ihre Story | `case` → `Filled` · `href` → `Filled`/`WithoutLink` · `columns` → `Columns` · `counterpartyHref` → `Filled`, `WithoutLink` — **ja** |
| Ausgeschlossene Zustände begründet | „leer nach Filter", „lädt", „Fehler" gehören laut Verhalten der Liste (`TableLoading`, `ErrorRow`) — **ja** |
| Enum vollständig gezeigt (§6: „alle Werte nebeneinander") | **nein** — 11 der 13 `CaseColumn`-Werte rendern (10 im Vorgabesatz, `fiscalYear` in `Columns`). `grep -rn '"documents"\|"bankTransactions"' src/ui/v3/` (Exit 0) findet sie nur in `case-columns.tsx` und einer fremden Palette-Id → **M5**, unverändert offen |

### Kriterien

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | Exit **0** | ja |
| `pnpm build` grün | nicht ausgeführt (0117); Konsole aller sechs Stories ohne `error`/`warning` (CDP `Log.entryAdded` + `Runtime.consoleAPICalled`) | offen |
| Datei nach der Familie, Story daneben, Titel richtig | `entities/accounting-case/{CaseRow,case-columns,CaseRow.stories}.tsx`; Titel `v3/Entitäten/Sachverhalt/CaseRow`; Barrel `index.ts:384/387–390` | ja |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:when` Exit **0**, `pnpm check:language` Exit **0**; `caseColumns`, `caseTracks`, `CaseRow` tragen beide Zeilen | ja |
| Kein Hex, kein px (außer Spurbreiten), keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,8}\b'` über die drei Dateien Exit **1** (leer); `px` nur als `width` der Spuren (13×, wie `source-document-columns`/`account-columns`); Labels aus `caseKindLabel` (Spiegel) und der Registry; `pnpm check:mirror` Exit **0** | ja |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | sechs, siehe Story-Deckung | ja, mit **M5** |
| Prüfliste §9 durchgegangen | App-Punkte A6 und §11 übersprungen; Rest gemessen (siehe unten) | ja, mit **N1** |
| Im Browser angesehen | sechs Stories bei vier Breiten gerendert, Konsole leer | ja |
| Reihenfolge fest; `columns` wählt aus, ordnet **nicht** um | `…--in-use` Kopf gerendert: `Sachverhalt · Stand · Nummer · Betrag · Gegenpart · Wer ist dran · Art · Klärung · Eröffnet · Export` = Ränge 1–10 der Tabelle. `…--columns` übergibt `fiscalYear, state, amount, openedAt, number, name`, gerendert `Sachverhalt · Stand · Nummer · Betrag · Eröffnet · Jahr` | **ja** |
| Gegenpart als eigener Punkt ab S | Rang 5, eigene Spur 180 px, in `…--filled` ein Anker auf `#partner-bp-8841` | ja |
| Alle drei Achsen über `StatusBadge`, keine lokale Label-Map | gemessene Klassen/Farben: `bdg-info` `rgb(227,240,248)` („Zur Prüfung", „Nicht exportiert"), `bdg-success` `rgb(240,246,242)` („Verbucht"), `bdg-warning` `rgb(245,238,224)` („Kanzlei", „Agent", „Mandant", „Klärung offen"); Wörter aus der Registry | ja |
| Die Art trägt **keinen** Ton | `…--filled`: Art `bdg bdg-neutral` `rgb(236,239,243)` gegen Stand `bdg-info` `rgb(227,240,248)` | **ja** |
| Klärungszähler „n offen", nie eine nackte Zahl | `…--filled` „1 offen", `…--sparse` „3 offen"; 0 bleibt stumm — `…--in-use` Zeilen 2, 3, 5 haben eine **leere** Klärungszelle (begründet am Code, `case-columns.tsx:205–213`) | ja |
| Ohne `href` kein `<a>` für die Zeile | `…--without-link`: `document.querySelectorAll('.v2rowlink').length` = **0**; einziger Anker der Zeile ist der Gegenpart | **ja** |
| `case` ist `CaseListItem` aus `src/ludwig/` | Import `CaseRow.tsx:1` / `case-columns.tsx:1`; kein lokaler Zeilentyp | ja |
| Jeder fehlende Wert steht als „—" | `…--sparse`: **4 ×** „—" (Betrag, Gegenpart, Wer ist dran, Export); Anzeigename fällt auf die Art zurück („Umbuchung") | ja |
| Keine verschachtelten Anker | `a a` = **0** in allen sechs Stories **und** in `caselist--filled` | **ja** |
| Ganze Zeile klickbar (I11, §9) | Trefferprobe `…--in-use` bei 1760×900, 35 sichtbare Punkte über die Zeilenbreite: **31 ×** `.v2rowlink`, **4 ×** Gegenpart-Anker, **0** tote Stelle; `.v2rowlink::after` `inset: 0px`, `.v2tbl__row:has(.v2rowlink):hover` setzt `--color-bg-soft` | **ja** |
| Zahlen rechts mit `tnum` (V3) | Betrag: `text-align: right`, `font-variant-numeric: lining-nums tabular-nums`; „1.284.900,55 €" endet bei x 695 = rechte Spurkante 695. Zentriert ist nur das Icon der drei (i)-Knöpfe (UA-Vorgabe des `button`), keine Datenzelle | ja |
| Tastatur, Fokus sichtbar (V11/V14) | `…--in-use`: Tab-Folge = 3 Kopf-(i) + je Zeile **2** Stopps (Zeile ohne Gegenpart: 1) = 12 bis zum Ende; Fokusring `2px solid rgb(59,143,196)` an jedem Stopp | ja |
| Kontrast, Icons | `pnpm check:contrast` Exit **0**, `pnpm check:icons` Exit **0** | ja |
| offen (App): ersetzt die zwei handgeschriebenen Zeilen | nicht Gegenstand dieser Abnahme | offen |

### Die Mängel der Vorrunde — nachgemessen

- **M1 (behoben).** `…--in-use` bei 1760×900, Werte zur Laufzeit in die echte
  Zelle gesetzt und Aktion/Messung getrennt: 13 Zeichen → **48,0 px**, 26
  Zeichen (p90 27) → **48,0 px** (vorher 66,8), 57 Zeichen (max) → **48,0 px**
  (vorher 87,8), Gegenprobe zurück auf 10 → **48,0 px**. Die Kürzung greift
  nachweislich: `scrollWidth` 190 bzw. **397** gegen `clientWidth` **180**,
  `text-overflow: ellipsis`, `title` trägt den vollen Namen. Der Wertebereich
  ist geprüft: `docs/entitaeten/accounting-case.md` Rang 5 — 95 % gefüllt,
  **p50 14 · p90 27 · max 57**.
- **M2 (behoben).** `…--in-use`: Kopfzeile **3** Knöpfe, jede der fünf
  Datenzeilen **0**. Fokusstopps je Zeile **2** statt 5. `caselist--filled`
  gegengeprüft: Kopf 3 (i) (`Sachverhalt`, `Zuständig`, `DATEV-Export`),
  Zeilen 0 — die Achse steht einmal, Regel Z4 erfüllt.
- **M3 (behoben in der Sache, siehe N1).** `…--columns` bei 1440×900: Spuren
  `692px 190px 110px 130px 110px 80px`, Kopf `Sachverhalt · Stand · Nummer ·
  Betrag · Eröffnet · Jahr` — **alle sechs sichtbar**, rechte Kante 1397
  gegen Fensterkante des Scrollers 1415. `fiscalYear` steht.
- **M4 (behoben, wie vom Vorprüfer vorgegeben).** Der `Frame` rendert
  `{c.header}{c.headerAside}`; das (i) sitzt an denselben drei Spalten wie in
  `DataTable`. **Der Buchstabe der Spec ist damit nicht erfüllt**
  („Köpfe der Status-Spalten über `StatusHeader` (0077)"): `.v2sth` kommt in
  der Story nicht vor, und der Abstand Wort → (i) ist gemessen **0,00 px**.
  Gegenprobe: in `caselist--filled`, also in `DataTable` selbst, ebenfalls
  **0,00 px** und ebenfalls ohne `.v2sth`. Das ist deshalb kein Mangel dieser
  Aufgabe, sondern ein Befund am Set (unten).
- **M6 (behoben).** `…--edges`, zweite Zeile, Zelle „Nummer" = **„c-9002"**
  (`caseIdentifier()`), nicht „—".
- **M7 (halb behoben).** Der Story-Text stimmt jetzt: `…--sparse` zeigt
  gemessen „Umbuchung" als Anzeigenamen, und der Kommentar sagt das auch.
  **Nicht behoben** ist der zweite Teil — siehe M7a.

### Mängel

**M5 (offen aus der Vorrunde) — zwei der dreizehn `CaseColumn`-Werte hat nie
jemand gesehen.** *Kriterium:* Story-Deckung / §6 „ein Enum, alle Werte
nebeneinander"; dazu die Freigabe vom 2026-09-06 („erweitern **oder** mit
Grund ausschließen"). *Ort:* `case-columns.tsx:215–228` (`documents` 100 px,
`bankTransactions` 110 px) gegen alle `*.stories.tsx` unter
`entities/accounting-case/`. *Messung:*
`grep -rn '"documents"\|"bankTransactions"' src/ui/v3/` (Exit 0) trifft
ausschließlich `case-columns.tsx` — keine Story rendert sie, ihre Spurbreiten
sind ungemessen. Der Wertebereich spricht dafür, dass sie tragen (Profil
§Relationen: Ereignisse p50 1 · p90 2 · **max 38**, also höchstens zwei
Stellen), aber gemessen ist das nicht. *Kleinster Weg:* die beiden in die
`Columns`-Auswahl aufnehmen — sie ist ohnehin der Nachweis, dass `columns`
auswählt. **Blockiert nicht.**

**N1 (neu) — die Mindestbreite ist 25 px kleiner als der Spaltensatz selbst.**
*Kriterium:* §9 („ein Baustein mit `minWidth` … scrollt, statt abzuschneiden")
und die M3-Reparatur. *Ort:* `CaseRow.stories.tsx:116–122` — `minBreite()`
rechnet für jede Spur ohne reines `px`-Maß **175**, während
`case-columns.tsx:103` dem Anzeigenamen `minmax(**200px**, 1fr)` gibt. Der
Kommentar der Story (Z. 113: „24ch ≈ 175 px") widerspricht dabei dem
Kommentar der Spaltendatei (Z. 99–102: „in **px**, never in `ch`").
*Messung:* voller Satz — Spuren 1500 + Lücken 9×10 + Polster 36 = **1626 px**
nötig, gesetzt sind **1601 px**; Sechser-Satz — 820 + 50 + 36 = **906 px**
nötig, gesetzt **881 px**. Wirkung in `…--in-use`, gemessen bei **700, 1100,
1400 und 1920**: `.v2tbl__inner` `clientWidth` 1601 gegen `scrollWidth`
**1608** — das Grid läuft über sein eigenes Polster. Ganz nach rechts
gescrollt bleibt rechts neben der letzten Spalte **0,0 px**, links stehen
18 px (`padding: 9px 18px` bzw. `12px 18px`). In `…--columns` derselbe Effekt
bei 700 px; ab 1100 px trägt der Satz und der Abstand ist wieder 18 px.
Abgeschnitten wird **nichts** — der Scroller führt bis 1608 —, verloren geht
das rechte Polster. *Kleinster Weg:* in `minBreite()` 200 statt 175 und den
`24ch`-Kommentar berichtigen. **Blockiert nicht.**

**M7a (Rest aus der Vorrunde) — vier Firmen, eine Geschäftspartner-Id.**
*Kriterium:* §6 „Daten in Stories sehen echt aus". *Ort:*
`CaseRow.stories.tsx:19–106` — nur `CASE()` setzt `counterpartyPartnerId`,
keiner der vier Überschreiber ändert sie. *Messung:* `…--in-use`, die Anker
je Zeile: `#partner-bp-8841` für „Bürobedarf Meier GmbH", „Musterbau GmbH",
„Stadtwerke Musterstadt" **und** „Handwerk Schulz KG". `CaseList.stories.tsx`
macht es richtig (dort ist „Stadtwerke Musterstadt" ohne Id und darum kein
Anker — gemessen in `caselist--filled`). *Kleinster Weg:* je Fall eine eigene
Id, und einem der Fälle `counterpartyPartnerId: null` geben — dann zeigt auch
`CaseRow`, dass 47 % aufgelöst heißt: nicht jeder Name ist ein Link.
**Blockiert nicht.**

**M7b (klein) — `Sparse` beweist nicht, was die Spec ihr aufträgt.**
*Kriterium:* Story-Tabelle der Spec — `Sparse` = „ohne Betrag, ohne Gegenpart,
**ohne Klärung**, ohne Export". *Ort:* `CaseRow.stories.tsx:174–180` (Fall
`CASES[3]`, `openClarificationsCount: 3`). *Messung:* `…--sparse` zeigt in der
Klärungsspalte **„3 offen"**; der stumme Nullfall steht nur in `…--in-use`
(Zeilen 2, 3, 5, Zelle leer). Die Begründung des Bauenden („dünn an
Stammdaten, nicht an Arbeit") ist nachvollziehbar — nur ändert eine Abnahme
die Kriterien nicht: entweder trägt `Sparse` den Nullfall, oder die Zeile der
Spec wird von der Spec-Seite her geändert. *Kleinster Weg:* im Fall der
`Sparse`-Story `openClarificationsCount: 0` setzen; der Rand mit drei offenen
steht schon in `…--edges`. **Blockiert nicht.**

### Was gemessen wurde und hielt

- Zeilenhöhe über alle Stories und alle vier Breiten konstant: **48,0 px**
  (letzte Zeile 47,0 — Rahmenrundung), auch mit 90-Zeichen-Name, Betrag über
  einer Million und 57-Zeichen-Gegenpart (V1).
- Die Ellipse greift an Rang 1: `…--edges`, `.v2caserow__name`
  `display: block`, `scrollWidth` **647** gegen `clientWidth` **200**, voller
  Name im `title`.
- Betrag rechtsbündig mit `tabular-nums`, bündig an der Spurkante;
  „1.284.900,55 €" in 130 px.
- Achsen-Wörter und -Farben kommen aus der Registry; die Art bleibt
  `bdg-neutral`, solange L-53 offen ist.
- `a a` = 0 in allen sechs Stories und in `CaseList`; die Zeile ist an jedem
  sichtbaren Punkt entweder Zeilenlink oder Gegenpart-Link.
- Nachtrag L-69 hält: in `caselist--filled` ist „Stadtwerke Musterstadt"
  (`counterpartyPartnerId: null`) **kein** Anker, die drei anderen zeigen auf
  `#partner-bp-8841`.
- Alle sechs Stories rendern ohne Konsolenmeldung.
- `pnpm typecheck` · `check:language` · `check:icons` · `check:contrast` ·
  `check:mirror` · `check:when` — je **Exit 0**.

### Befunde am Set (gehören nicht zu 0096)

- **S1 — `headerAside` steht ohne Abstand am Wort.** Gemessen 0,00 px
  zwischen „Stand" und dem (i), sowohl in der `CaseRow`-Story als auch in
  `DataTable` selbst (`caselist--filled`). `.v2sth` (`v3.css:2909`, aus 0077)
  gäbe `var(--space-1)`, wird aber weder von `DataTable.tsx:355–357/386–388`
  noch von einem Spaltensatz benutzt — `StatusHeader` hat damit im ganzen
  Tabellenweg keinen Aufrufer. Entweder `DataTable` umschließt
  `header` + `headerAside` mit `.v2sth`, oder 0077 verliert seinen Zweck.
  Betrifft jeden Spaltensatz mit Status-Spalte, nicht nur diesen.
- **S2 — doppeltes `.v2num`.** `CaseRow.tsx:34` legt um jede
  `align: "end"`-Zelle ein `<span class="v2num">`, und die Zellen
  `fiscalYear`/`documents`/`bankTransactions` bringen selbst eines mit
  (`case-columns.tsx:220/227/255`). Gemessen in `…--columns` stehen zwei
  ineinander (x 1317/w 80 und x 1362/r 1397); die Wirkung ist richtig, die
  Regel steht zweimal. Kosmetisch.

Abgenommen von / am: **zurück** — designsystem (fremder Prüfer), 2026-09-07.
Kein Mangel blockiert: M1 und M2 der Vorrunde sind behoben und nachgemessen.
Offen sind M5 (zwei Enum-Werte ohne Story), N1 (Mindestbreite 25 px unter dem
Satz), M7a (vier Firmen, eine Partner-Id) und M7b (`Sparse` ohne den
Nullfall) — vier kleine Punkte in einem Zug. `pnpm build` bleibt für die
Wiedervorlage offen (0117).

## Nach der Wiederabnahme (2026-09-07): die vier kleinen in einem Zug

Urteil war „zurück", kein Mangel blockierte. Alle vier erledigt, gemessen
gegen den Dev-Server `http://localhost:6107` über CDP.

**N1 — die Mindestbreite liest den Boden aus dem Satz.** `minBreite()` rechnete
flexible Spuren mit einer festen 175 („24ch ≈ 175 px"); der Satz gibt Rang 1
seit der Nacharbeit `minmax(200px, 1fr)`. Eine Zahl neben der Wahrheit
veraltet mit dem nächsten Commit — jetzt wird der Boden aus dem `minmax()`
gelesen. Gemessen `.v2tbl__inner`:

| Story | vorher | jetzt |
|---|---|---|
| `InUse` | client 1601 gegen scroll **1608** (7 px Überstand) | client **1626** = scroll 1626 |
| `Columns` | 881 | **906** |

Bei 700, 1100, 1400 und 1920 px je `diff = 0` am `.v2tbl__inner`.

**M5 — die zwei Zähler haben ihre Story.** `documents` und
`bankTransactions` hatte im ganzen Set nie jemand gerendert. `Columns` zeigt
jetzt einen **zweiten** Satz darunter (ein Satz mit allen dreizehn Spalten
sprengt die Karte): gemessen „Belege" 100 px und „Zahlungen" 110 px, Zeilen
unverändert 48,0 px. Damit ist der Enum-Wertebereich vollständig gezeigt.

**M7a — vier Firmen, vier Zustände.** Nur `CASE()` setzte
`counterpartyPartnerId`, und keiner der Überschreiber änderte sie: alle vier
Firmen trugen `bp-8841`. Jetzt je eine eigene, und „Stadtwerke Musterstadt"
bekommt `null` — 47 % der Sachverhalte tragen einen aufgelösten Partner
(L-69), der Rest ist ein Name ohne Ziel. Gemessen in `InUse` drei Anker
(`bp-8841`, `bp-8842`, `bp-8845`) und eine Firma ohne.

**M7b — `Sparse` trägt den Nullfall.** Die Story-Tabelle der Spec sagt „ohne
Betrag, ohne Gegenpart, **ohne Klärung**, ohne Export"; die Fixture stand auf
`openClarificationsCount: 3`. Jetzt 0 — gemessen ist die Klärungszelle in
`Sparse` leer, und der Rand mit „3 offen" und „1 offen" steht in `Edges`.

`pnpm typecheck`, `check:language`, `check:icons`, `check:contrast`,
`check:mirror`, `check:when` je Exit 0. Nicht gebaut (0117).

**Status: Abnahme** — das Urteil war „zurück", also entscheidet die nächste
Runde.
