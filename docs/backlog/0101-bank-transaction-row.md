# 0101 · BankTransactionRow — eine Zeile des Kontoauszugs

| | |
|---|---|
| Status | in Arbeit |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/bank-transaction/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: acht Punkte dieser Entität, drei davon aus Ludwig-Ableitungen |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md` (Status `geprüft`, 2026-09-05), Formen-Tabelle Zeile `BankTransactionRow`; Ränge 1–8 |
| Ersetzt | die Zeile aus `KontoauszugView.tsx` (Z. 229–320) und die aus `BankTransactionAssignmentTable.tsx`, dazu `CaseIndicatorBadges`, `DatevMatchTick`, `ClarBubble` und `EventStatusInline` aus `kontoauszug-presentation.tsx` |
| Voraussetzung | 0099 `BankTransactionPurpose` · 0095 `CaseCell` (die Zeile nennt den Sachverhalt über sie) |
| Blockiert | `BankTransactionList` (0085), `BankTransactionWorklist` (0086) |
| Spec von / am | Claude, 2026-09-05 (Skill `spec-schreiben`, nach dem geprüften Profil) |

## Ziel

Die Sachbearbeiterin liest einen Kontoauszug — p90 **251 Zeilen** je Konto und
Jahr — und sucht die eine Frage: *gehört diese Zahlung schon zu einem
Vorgang?* Bei **65 %** der Positionen lautet die Antwort nein. Die Zeile muss
das auf einen Blick sagen, und daneben, ob die Buchung dahinter schon läuft
und ob DATEV sie kennt.

## Einordnung

- **Wiederverwenden:** `Row`, `BankTransactionPurpose` (0099), `CaseCell`
  (0095), `Amount`, `Time`, `StatusBadge`. Was fehlt, ist die Reihenfolge und
  die Zuordnungs-Logik.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 — die Zeile existiert zweimal
  handgeschrieben, und keine vorhandene Form deckt sie ab.
- **Zuschnitt:** eine Datei, ein Export plus die reinen Ableitungen daneben
  in `bank-transaction-state.ts` (`deriveZ`, `restOf`, `datevMatchTitle`,
  `deriveCaseIndicators`). Trennung nach §4 Absatz 1: die Ableitungen werden
  allein gebraucht — die Worklist filtert über `deriveZ`, ohne zu zeichnen.
- **Setzt auf:** `Row`, `BankTransactionPurpose`, `CaseCell`, `Amount`,
  `Time`, `StatusBadge`, `Badge`, `ActionIcon`.

## Die acht Punkte, und wem der Zustand gehört

| Rang | Punkt | Woher |
|---|---|---|
| 1 | Verwendungszweck | `BankTransactionPurpose` — die breiteste Spalte |
| 2 | Betrag | `amount` + `currency`, rechts, Vorzeichen ohne Farbe |
| 3 | Gegenpartei | `counterpartyName` |
| 4 | Buchungsdatum | `postingDate` — **mit Jahr** |
| 5 | DATEV-Haken | `datevMatchTitle(matchStage)` |
| 6 | Sachverhalts-Zuordnung | `deriveZ()` — Z0 keiner · Z1 einer, erklärt · Z2 mehrere, erklärt · Z3 Rest offen |
| 7 | Buchungs-Zustand des **Ereignisses** | Achse `ereignis` |
| 8 | Offene Klärungen | Zähler, hängt am **Sachverhalt** |

Der Satz, der diese Familie zusammenhält, steht wörtlich im heutigen Code und
gilt weiter:

> Buchungs-Zustand des **EREIGNISSES** hinter dieser Zeile — nicht der Status
> des Sachverhalts. Eine Zeile im Auszug ist genau eine Zahlung; steht
> derselbe Sachverhalt zweimal im Auszug, kann eine gebucht und die andere
> offen sein.

Der Klärungszähler dagegen ist **fallweit** — er hängt am Sachverhalt, nicht
an der Zahlung. Zwei Zustände, zwei Bezugspunkte, in derselben Zeile. Das ist
kein Versehen und gehört als Kommentar in den Code.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `transaction` | `BankTransactionRowData` | ja | Die Position samt zugeordneten Fällen (`cases`), `allocatedSum`, `matchStage`, `sepaTags` | `Filled` |
| `caseHref` | `(caseId: string) => string` | ja | Reicht an `CaseCell` durch | `Filled` |
| `openHref` | `string` | nein | Wohin „offen" führt — der Zuordnungs-Reiter | `Unassigned` |
| `columns` | `BankTransactionColumn[]` | nein, Default alle acht | Welche Punkte. Die Worklist lässt Zuordnung und Buchungs-Zustand weg und nimmt stattdessen das Konto auf | `Columns` |
| `accountLabel` | `string` | nein | Das Zahlungskonto — nur in der kontoübergreifenden Worklist | `Columns` |
| `expanded` | `boolean` | nein | Die Unterzeilen je zugeordnetem Sachverhalt mit Teilbetrag und Summe | `Expanded` |

**Kann bewusst nicht:**

- **Den Zustand des Sachverhalts zeigen.** Rang 7 ist der Zustand des
  Ereignisses. Wer den Fall-Zustand will, sieht ihn in `CaseCell`.
- **Aufklappen.** `expanded` ist ein Zustand, kein Schalter — der Aufrufer
  hält ihn (`DataTable expand`, 0057).
- **Zuordnen.** Die Handlung gehört der Worklist (0086); die Zeile zeigt nur,
  dass etwas offen ist.
- **Den Rest rechnen.** `restOf()` ist eine reine Ableitung in der
  Nachbardatei; die Zeile ruft sie, sie rechnet nicht selbst.

## Verhalten

Server-Component. Der Zweck ist die einzige ungesetzte Spalte und trägt die
Breite; alles andere hat ein festes Maß. Betrag rechts mit `tnum`, Vorzeichen
**ohne Farbe** — ein Ausgang ist kein Fehler (V3/A7).

Der DATEV-Haken steht vor der Gegenpartei und trägt sein Wort im `title`
(V7): „In der DATEV-Historie bereits gebucht" bzw. „Manuell mit einer
DATEV-Buchung verknüpft". Die vier **offenen** Klassen (`unclear_multi`,
`unclear_none`, `beyond_bookings`, `no_account` — zusammen 29 %) zeigen
keinen Haken; sie haben heute keine Achse (Befund L-57) und bleiben bis
dahin unsichtbar. Das steht als Kommentar im Code, damit es nicht als
Versehen gelesen wird.

Die Zuordnung: **Z0** zeigt „offen" als Pille mit `openHref`; **Z1** einen
Fall über `CaseCell`; **Z2** mehrere über denselben Stapel; **Z3** zusätzlich
eine Marke „Rest x" mit dem Betrag aus `restOf()`.

Zustände: gefüllt · nicht zugeordnet (Z0, der häufigste) · aufgeklappt. Lädt
und Fehler gehören der Liste.

## Stories

Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionRow`. Abgeleitet nach
§6: 2 anwendbare Zustände + 1 Enum (`columns`) + 1 Layout-Boolean
(`expanded`) + 0 Callbacks + 1 „im Einsatz" + 1 Rand = 6.

| Story | Beweist |
|---|---|
| `Filled` | Alle acht Punkte, ein zugeordneter Fall, DATEV-Haken, Buchungs-Zustand |
| `Unassigned` | Z0: „offen" mit `openHref` — die 65 %, um die es geht |
| `Split` | Z3: zwei Fälle und eine Rest-Marke; der Betrag stimmt mit `restOf()` überein |
| `Columns` | Der Spaltensatz der Worklist neben dem des Auszugs — dieselbe Zeile, zwei Auswahlen |
| `Expanded` | Unterzeilen je Fall mit Teilbetrag und Summe |
| `InUse` | Sechs Zeilen in einer `Card`, Köpfe der Status-Spalten über `StatusHeader` (0077); ein Eingang und ein Ausgang in derselben Farbe |

Nicht anwendbar: `leer nach Filter`, `lädt`, `Fehler`.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Die Match-Stufe im Klartext statt nur als Haken | keine Prop — eine Achse in der Registry (L-57) | die Achse ist da; dann wird aus dem Haken ein `StatusBadge` |
| Der laufende Saldo | `balance?: number` | 0085 entscheidet, ob er in die Zeile oder unter die Liste gehört (Befund L-58) |
| Im Drawer nachschlagen | `onPeek?: () => void` | 0103 ist gebaut |

## Befunde für `ludwig/app`

- **B1 (L-57)** — `match_stage` hat keine Registry-Achse, obwohl es zwölf
  Werte mit Bedeutung sind. Heute wird daraus ein grüner Haken und ein
  handgeschriebener Titel; die vier offenen Klassen — `beyond_bookings`
  allein 328 von 1281 — sind unsichtbar.
- **B2 (L-59)** — `KontoauszugView` benutzt `PurposeDisplay` nicht und zeigt
  den Zweck ohne Chips und ohne Zugang zum Original. Der Umzug behebt es.
- **B3 (L-62)** — Eine dritte Route zeigt dieselbe Zeile:
  `configuration/bankkonten/[accountId]/transactions`, mit stummem
  `limit 500`. Sie gehört in die Ablösung, sonst bleibt eine Kopie stehen.

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

- [ ] Rang 7 ist der Zustand des **Ereignisses**, nicht des Sachverhalts; der Klärungszähler ist fallweit — beides steht als Kommentar im Code (Story `Filled`)
- [ ] Z0 zeigt „offen", nie einen Gedankenstrich (Story `Unassigned`)
- [ ] Z3 zeigt eine Rest-Marke, deren Betrag `restOf()` entspricht (Story `Split`, nachgerechnet)
- [ ] Das Vorzeichen trägt keine Farbe (Story `InUse`, gemessen)
- [ ] Das Datum trägt das Jahr (Story `Filled`)
- [ ] Rang 5 steht als `StatusBadge axis="bank_match_stage"`; die vier offenen Klassen tragen ihr Wort (Story `Columns`)
- [ ] Rang 8 steht als Zahl mit Wort, **ohne** Badge (Story `Split`)
- [ ] Bei mehreren Fällen steht vor jedem Ereignis-Badge die Fallnummer (Story `Split`)
- [ ] Die vier Ableitungen liegen in einer eigenen Datei und rendern nichts (`grep`: kein JSX darin)
- [ ] `columns` lässt weg und ordnet nicht um (Story `Columns`)
- [ ] offen (App): ersetzt die Zeile in `KontoauszugView` und in `BankTransactionAssignmentTable`, dazu die dritte Route aus B3

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. Bleibt der DATEV-Haken ein Haken, solange L-57 offen ist? *Ohne Antwort:
   ja, mit Wort im `title`. Ein Wort in der Zeile bräuchte die Achse, und die
   gibt es noch nicht.*
2. Gehört „offen" in die Sachverhalts-Spalte oder in eine eigene? *Ohne
   Antwort: in die Sachverhalts-Spalte — es ist die Antwort auf dieselbe
   Frage, nur die negative.*
3. Zeigt die Zeile den Rest immer oder nur bei Z3? *Ohne Antwort: nur bei Z3.
   Bei Z1 und Z2 ist er null, und eine Marke „Rest 0,00 €" sagt nichts.*

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Entscheide: 1 Haken bis L-57 · 2 „offen" in der Sachverhalts-Spalte · 3 Rest nur bei Z3 · **Namenskollision:** der Komponentenname `BankTransactionRow` bleibt (Familienkonvention), der Datentyp heißt `BankTransactionRowData`, die Familie importiert den gespiegelten Typ `BankTransactionRow` aus `modules/bank-transactions/domain/types.ts` nie, Kommentar am Export.

Vor dem Bau in die Spec: (a) Rang 7 = `StatusBadge axis="ereignis"` über `resolveEventBookingState`, Rang 8 = `StatusBadge axis="klaerung"` mit Zähler, ein Satz zur Achse `buchung` (Vorschlags-Indikator aus `CaseIndicatorBadges`: Default in Rang 7 gefaltet); (b) Namens-Satz von oben; (c) Typ-Satz aus 0100; (d) **Zuschnitt wie 0096:** `bankTransactionColumns()` als `ColumnDef`-Satz für `DataTable` (0085) plus `BankTransactionRow` für kurze Listen aus denselben Zellfunktionen — einmal für beide Familien entschieden.

## Nachtrag 2026-09-06, vor dem Bau: die Achse ist da

**L-57 ist erledigt** — `bank_match_stage` steht seit `cc141f7b` im Register,
zwölf Werte, Titel „DATEV-Historie", Quelle `client_bank_transactions.match_stage`
(NULL = Kaskade nicht gelaufen). Damit ändern sich drei Dinge in dieser Spec:

- **Rang 5 ist kein Haken mehr**, sondern `StatusBadge axis="bank_match_stage"`.
  Die Übergangsregel („die vier offenen Klassen zeigen keinen Haken, und der
  Code sagt warum") **entfällt**; das Kriterium dazu ebenso. Der Gewinn ist
  nicht Kosmetik: 29 % des Bestands — `beyond_bookings` allein 328 von 1281 —
  hatten vorher **kein** Wort, weil ein Haken nur ja sagen kann.
- Das Kriterium „Die vier Ableitungen liegen in einer eigenen Datei und
  rendern nichts" ist über den **Spiegel** erfüllt: `deriveZ`, `restOf`,
  `derivePurposeParts` und `resolveEventBookingState` liegen dort. `derive.ts`
  in dieser Familie ist eine Re-Export-Datei, damit die Familie eine Adresse
  hat — keine zweite Fassung.
- Offene Frage 1 („Bleibt der Haken?") ist damit beantwortet: nein.

**Zwei Abweichungen von der Freigabe, im Bau entschieden:**

(a) **Rang 8 bekommt kein `StatusBadge`.** Die Achse `klaerung` ist eine
Dringlichkeit **je Rückfrage** (blockierend / optional); die Zeile hat eine
**Anzahl** über den Fall. Eine Anzahl ist kein Zustand, und ein Badge heißt in
diesem Set „hier steht ein Zustand". Kriterium: die Zahl steht mit ihrem Wort
(„2 Klärungen"), ohne Badge.

(b) **Rang 7 nennt bei mehreren Fällen die Fallnummer vor dem Badge.** Der
Satz, der die Familie trägt, ist, dass der Zustand dem Ereignis gehört und
nicht dem Sachverhalt — bei zwei Fällen sagt ein Badge allein nicht, zu
welchem er gehört. Kriterium: bei `cases.length > 1` steht vor jedem Badge
die Nummer (Story `Split`).

**Zuschnitt, wie die Freigabe ihn entschieden hat:**
`bankTransactionColumns()` gibt den `ColumnDef`-Satz für `DataTable` (0085),
`BankTransactionRow` rahmt dieselben Zellen für kurze Listen. `columns`
**wählt aus**, ordnet nie um — die Reihenfolge der Punkte ist über alle Formen
dieser Familie dieselbe.

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — Kopf und Zellen liefen auseinander, die Zeile lief über.** Der Zweck
hatte `width: "1fr"`, und `1fr` ist `minmax(auto, 1fr)`: `auto` ist die
**min-content**-Breite des Inhalts. Kopf und jede Zeile sind eigene Grids mit
eigenem Inhalt, also maß jedes seine Spur selbst. Gemessen stand die
Betragsspalte über sechs Zeilen an **drei verschiedenen x-Positionen**, und
die Zeilen ragten 111 px über den Kopf hinaus; bei 1100 px waren es 260 px
Versatz und 425 px Überlauf. Ausgerechnet die Spalte, über die man Beträge
vergleicht, war eine Flatterkante.

`minmax(0, 1fr)` behebt es: die Spur darf auf null schrumpfen, und das Maß ist
überall dasselbe. Gemessen danach — Kopf und alle Zeilen enden bei 1397 px,
`scrollWidth − clientWidth` = 0 in allen vier Stories.

**M2 — Kopf und Zellen hatten keine gemeinsame Quelle für die Spurliste.**
`bankTransactionTracks(columns)` steht jetzt neben `bankTransactionColumns()`
und wird exportiert, weil den Rahmen der Aufrufer baut. Die `Columns`-Story
schrieb ihre Liste von Hand — jetzt leitet auch sie ab.

**M3 — die Zeile reichte die Teilbeträge an `CaseCell` durch.** Damit stand
jede zugeordnete Zeile auf drei Zeilen (94 px gegen 47 px), und in `Expanded`
stand derselbe Teilbetrag zweimal — einmal in der Zelle, einmal in der
Unterzeile, wofür `expanded` da ist. Die Zeile reicht sie nicht mehr durch.
Gemessen bleibt eine Spanne von 47 bis 91 px: eine zugeordnete Zeile trägt
Fallname und Nummer, eine Z3-Zeile zusätzlich die Rest-Marke. Das ist Inhalt,
nicht Willkür — und 65 % der Zeilen sind der einzeilige Fall.

**M4 — totes Layout-Attribut.** `gridColumn: span n` auf der Unterzeilen-Fläche
hatte keine Wirkung (`.v2tbl` ist ein Block, die Zeilen sind die Grids); die
volle Breite kommt aus dem Blockfluss. Attribut und `span`-Parameter sind weg.

**M5 — `Columns` bewies sein Kriterium nicht.** Die Story übergab die Auswahl
schon in der Reihenfolge der Familie. Jetzt übergibt sie **verdreht**, und die
Zeile steht trotzdem richtig — das ist der Beweis, dass `columns` auswählt und
nicht ordnet.
