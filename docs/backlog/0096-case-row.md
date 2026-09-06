# 0096 · CaseRow — der Sachverhalt als eine Zeile

| | |
|---|---|
| Status | spec — zurück 2026-09-06, Zuschnitt neu nach Abschnitt „Freigabe", danach ohne zweite Runde freigegeben |
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

Abgenommen von / am: … · Offene Punkte: …

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
