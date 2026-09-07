# 0101 · BankTransactionRow — eine Zeile des Kontoauszugs

| | |
|---|---|
| Status | Abnahme |
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

## Abnahme (2026-09-07)

Erste Abnahme, fremd: Spec und Code gelesen, kein Chat-Verlauf. Gemessen im
Browser über CDP (Storybook-Dev-Server 6107, headless Chromium, 1440 px, für
L1 zusätzlich 1280 px). Gemessen wurde jeweils die **Wirkung** —
`getBoundingClientRect`, `scrollWidth` gegen `clientWidth`,
`getComputedStyle`, `Range` für Textkanten, echte Tab-Läufe, Screenshots —,
nie die gesetzte Prop; jede Zahl hat eine Gegenprobe (Wert oder Regel zur
Laufzeit geändert, neu gemessen, zurückgesetzt). Die breitesten Werte des
Bestands kommen aus `docs/entitaeten/bank-transaction.md` und
`accounting-case.md` und wurden in die echte Zelle geschrieben. `pnpm build`
war untersagt und ist nicht gelaufen.

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `pnpm typecheck` Exit 0. Dazu `check:icons`, `check:contrast`, `check:when`, `check:language`, `check:mirror` — alle Exit 0. `pnpm build` untersagt, nicht gelaufen | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/bank-transaction/BankTransactionRow.tsx` + `.stories.tsx`; Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionRow`, sechs IDs in `index.json` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `check:language` Exit 0, `check:when` Exit 0; `BankTransactionRow`, `bankTransactionColumns`, `bankTransactionTracks` tragen beide Zeilen | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Kein Hex in beiden Dateien; px nur als `ColumnDef.width` (Rastermaß, wie `case-columns.tsx`/`account-columns.tsx`). Labels kommen aus `BANK_MATCH_STAGE`/`EREIGNIS_BUCHUNG`; `derive.ts` ist reiner Re-Export aus dem Spiegel, `check:mirror` Exit 0 | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Sechs Stories = Ableitung §6 (2 Zustände + 1 Enum `columns` + 1 Layout-Boolean `expanded` + 0 Callbacks + 1 im Einsatz + 1 Rand). Prop-Deckung: `transaction`/`caseHref` (`--filled`), `openHref` (`--unassigned`), `columns` + `accountLabel` (`--columns`), `expanded` (`--expanded`). `lädt`/`Fehler`/`leer nach Filter` sind unter „Verhalten" begründet. **Hinweis:** `rowHref` ist im Bau dazugekommen, steht nicht in der Schnittstellen-Tabelle der Spec und hat in 0101 keine Story — belegt ist es in `BankTransactionList.stories.tsx:94` und `BankTransactionWorklist.stories.tsx:161` | ✓ mit Hinweis |
| Rang 7 = Zustand des **Ereignisses**, Klärungszähler fallweit; beides als Kommentar im Code | `bank-transaction-columns.tsx:26–34` sagt beides wörtlich. `--filled`: ein Fall, Badge „Vorschlag" aus `resolveEventBookingState`, Achse `ereignis` | ✓ |
| Z0 zeigt „offen", nie einen Gedankenstrich | `--unassigned`: `a.v2case__nonelink` mit Text „offen" und `href="#zuordnen"`; in `--in-use` zweimal derselbe Weg. Kein Gedankenstrich im gerenderten Text der sechs Stories | ✓ |
| Z3 zeigt eine Rest-Marke = `restOf()` | `--split`: „Rest 149,90 €"; `restOf` = \|−1.249,90\| − 1.100,00 = 149,90 ✓. `--in-use` Zeile 5: „Rest 480,55 €" = 2.480,55 − 2.000,00 ✓. Bei Z1/Z2 keine Marke | ✓ |
| Das Vorzeichen trägt keine Farbe | `--in-use`, alle sechs Beträge: `color` = `rgb(45, 45, 45)` — Eingang (1.800,00 €) und Ausgänge identisch. Ausrichtung `right`, `font-variant-numeric: lining-nums tabular-nums`. Gegenprobe: `.v2num` zur Laufzeit entfernt → `text-align` `left`, rechte Textkante 1397,0 → 1348,2; Klasse zurück → 1397,0 | ✓ |
| Das Datum trägt das Jahr | `--filled` „26.08.2026"; Spur 100 px, Bedarf 71,6 px | ✓ |
| Rang 5 als `StatusBadge axis="bank_match_stage"`; die vier offenen Klassen tragen ihr Wort (Story `Columns`) | Badge steht (`--columns`: „außerhalb des Bestands", „mehrdeutig"). Aber nur **zwei** der vier offenen Klassen stehen in `Columns`; über alle sechs Stories kommt `unclear_none` („kein Kandidat") dazu, `no_account` („ohne Konto") kommt in keiner Story von 0101 vor (nur `BankTransactionWorklist.stories.tsx:34`) | **M4** |
| Rang 8 als Zahl mit Wort, **ohne** Badge | `--split`: `span.v2btxrow__clar` mit „2 Klärungen", `--in-use` Zeile 5 „1 Klärung"; kein `.bdg` in der Spalte. Spur 110 px, Bedarf 71,4 px — der Höchstwert des Bestands (max 3 offene) passt | ✓ |
| Bei mehreren Fällen steht vor jedem Ereignis-Badge die Fallnummer | `--split`: „2026-0412 / Vorschlag" und „2026-0488 / Buchung fehlt" (DOM-Reihenfolge davor, im Bild darüber — `.v2btxrow__state` ist ein Grid, im CSS begründet: nebeneinander bräuchte die Spur 187 statt 150 px) | ✓ |
| Die vier Ableitungen liegen in einer eigenen Datei und rendern nichts | `derive.ts` ist 23 Zeilen Re-Export, kein JSX; `deriveZ`, `restOf`, `derivePurposeParts`, `resolveEventBookingState` liegen im Spiegel. `check:mirror` Exit 0 | ✓ |
| `columns` lässt weg und ordnet nicht um | `--columns` übergibt **verdreht** (`amount, matchStage, account, purpose, counterparty, postingDate`); gerendert steht die Zeile in der Familien-Reihenfolge, Zellkanten x = 35/145/335/517/677/867 gleich dem Kopf | ✓ |
| Kopf und Zellen haben eine Quelle, keine Flatterkante (Mangel M1/M2 der Vorrunde) | Alle vier gerahmten Stories bei 1440 px: `grid-template-columns` von Kopf und jeder Zeile identisch, Zell-x = Kopf-x in allen acht Spalten, `.v2tbl__scroll` 1398/1398 → Überlauf 0 | ✓ |
| Spurbreiten gegen den Wertebereich | Zweck (`minmax(0, 1fr)`, 232 px): 447 Zeichen → eine Zeile mit Ellipse (`nowrap`/`hidden`/`ellipsis`, `scrollWidth` 1960 gegen `clientWidth` 206), Zeilenhöhe unverändert 70,7 px, Tabelle ohne Überlauf. Sachverhalt (200 px): Titel mit 57 Zeichen → Ellipse am Link (414 gegen 200), Höhe unverändert. Betrag (130 px): „−1.234.567,89 €" ohne Überstand. Buchung (160 px): „Keine Buchung nötig" 149,7 px. DATEV (180 px): „außerhalb des Bestands" 169,0 px. Konto (150 px): 132,6 px. **Gegenpartei (180 px) trägt den Bestand nicht** → M2 | **M2** |
| Zeilenhöhe (V1) | Grundzeile 47,4 px. Zwei Zeilen, wo der Sachverhalt Name **und** Nummer trägt (70,7 px) — dasselbe Verhalten wurde bei 0095 gemessen und als bewusster Tausch abgenommen. Drei Zeilen bei Z3 mit Rest-Marke (93,5 px). **Zusätzlich** wächst die Zeile durch die umbrechende Gegenpartei: `--in-use` Zeile 3 misst 66,8 px, mit gekürztem Namen 48,4 px, zurück 66,8 px → +18,4 px (+38 %) an der häufigsten Zeilenart | **M2** |
| Das (i) steht nur einmal | Der Kopf trägt `StatusInfoButton` für `ereignis` und `bank_match_stage`, die Zellen aber ebenfalls: `--in-use` zählt „DATEV-Historie: Zustände erklären" **7×** (1 Kopf + 6 Zeilen), „Buchung (Ereignis)" **5×**. Tab-Lauf: **24** Fokusstopps in einer Karte mit sechs Zeilen, davon 10 die Zeilen-(i). Gegenprobe: Zeilen-(i) zur Laufzeit entfernt → 14 Stopps, Zeilenhöhen unverändert | **M1** |
| Verschachtelte Anker / Fokusstopps je Zeile | `a a` = 0 und `a > button` = 0 in allen sechs Stories. Je Zeile 3–4 Stopps (Zweck-(i), Fall-Link, zwei Zustands-(i)); nach M1 wären es 2. Tab-Reihenfolge läuft Zeile für Zeile von links nach rechts, Fokusring auf **allen 24** Stopps sichtbar (`outline 2px solid rgb(59,143,196)`, `:focus-visible` wahr) | ✓ (Zahl siehe M1) |
| Spezifitätsfalle des Tabellen-Umbaus | Einzige Klasse an einem `td` dieser Zeile ist `.v2btxrow__split`. `getComputedStyle`: `display: block`, `padding: 8px 16px 12px` (greift über `.v2tbl td.v2btxrow__split`, v3.css:120), `background: rgb(244,246,248)`, `border-bottom: 1px rgb(236,239,243)` — beide letzteren setzt der Reset nicht, sie greifen also auch auf 0-1-0. Alles andere hängt an Spans **in** der Zelle: `.v2num` (block/right/tnum, Gegenprobe oben), `.v2btxrow__cases` flex, `.v2btxrow__states` flex, `.v2btxrow__state` grid, `.v2btxrow__clar`, `.v2purp--inline` flex, `.v2case__link` Ellipse — alle im Bild wirksam | ✓ |
| Prüfliste `design-guidelines.md` §9 | Text links, Zahlen rechts mit `tnum`, nichts zentriert ✓ · kein Hex, keine lokale Label-Map ✓ · Farbe nur als Kritikalität, Vorzeichen ohne Farbe ✓ · jeder farbige Zustand mit Wort, Status aus der Registry ✓ · Kontrast `check:contrast` Exit 0, Fokusring sichtbar ✓ · Icons aus dem Register, kein Icon ohne Wort, keine Versalien, keine Emoji ✓ · Karte hat Rand statt Schatten ✓ · Tabelle in einer Karte mit Kartenkopf und Spaltenkopf ✓ · Zeilenhöhe V1 und (i)-Dopplung siehe M1/M2 · **Legende am Ort (V14):** der Kopf ist handgeschrieben statt `StatusHeader` → M5 · **1280 px (L1):** Rang 1 fällt auf 80 px, Kopfzeilen überdrucken sich → M3. Die zwei Punkte, die der App gelten (v1-Ersatz, §11-Inventar), übersprungen | **M3, M5** |
| Im Browser angesehen | Screenshots `inuse-1440.png`, `inuse-1280.png`, `split-1440.png`, `expanded-1440.png` im Abnahme-Scratchpad | ✓ |
| offen (App): ersetzt die Zeile in `KontoauszugView` und `BankTransactionAssignmentTable`, dazu die dritte Route aus B3 | in diesem Repo nicht prüfbar | offen (App) |

### Mängel

**M1 — Das (i) steht in jeder Zeile ein zweites Mal.**
`bank-transaction-columns.tsx:195` (`StatusBadge axis="bank_match_stage"`) und
`:284` (`axis="ereignis"`) lassen `info` auf dem Default `true`, während der
Kopf für dieselben zwei Achsen schon ein `StatusInfoButton` trägt. Gemessen in
`--in-use` (1440 px): „DATEV-Historie: Zustände erklären" 7× auf der Seite
(1 Kopf + 6 Zeilen), „Buchung (Ereignis)" 5×; ein echter Tab-Lauf ergibt **24**
Fokusstopps für sechs Zeilen, **10** davon die Zeilen-(i). Gegenprobe: die
Zeilen-(i) zur Laufzeit entfernt → 14 Stopps, Zeilenhöhen unverändert
(71,7/71,7/48,4/66,8/93,5/47,4). Bei p90 251 Zeilen je Auszug sind das rund
**400 zusätzliche Fokusstopps**. Die Schwesterzelle macht es richtig:
`CaseCell.tsx:67` setzt `info={false}` mit genau dieser Begründung.
*Kleinster Weg:* `info={false}` an beide `StatusBadge` im Spaltensatz.

**M2 — Die Spur „Gegenpartei" (180 px) trägt den Wertebereich nicht.**
`bank-transaction-columns.tsx:128`. Bestand laut Profil: 97 % gefüllt,
p50 20 · p90 31 · max 53 Zeichen, und das Profil sagt ausdrücklich, der Name
brauche **keine** Grenze. In die echte Zelle geschrieben (Story `--filled`,
1440 px, Spur 180 px): p50 (20 Zeichen) braucht 150,8 px und passt; p90
(„Kontoführungsentgelt August 2026", 32 Zeichen) braucht **224,6 px** — 44,6
px zu viel, die Zelle wird 41,8 px hoch; max (54 Zeichen) braucht **385 px**,
die Zelle wird 62,8 px hoch und die Zeile wächst von 70,7 auf **86,8 px**.
Gekürzt wird nicht: `white-space: normal`, `overflow: visible`,
`text-overflow: clip`, kein `title` — der Wert bricht um, statt zu kürzen.
Was das die häufigste Zeile kostet, zeigt die Gegenprobe an `--in-use`
Zeile 3 (Z0, kein Fall): mit „Kontoführungsentgelt August 2026" 66,8 px, mit
„Post AG" 48,4 px, zurück 66,8 px — **+18,4 px, +38 %** allein durch diesen
Umbruch. *Kleinster Weg:* die Zelle einzeilig kürzen wie `.v2case__link` und
`.v2purp__text` (`overflow:hidden; text-overflow:ellipsis; white-space:nowrap`
plus `title`), das kostet keine Spaltenbreite; sonst die Spur auf ≥ 225 px,
was der Zweck-Spur genauso viel nimmt.

**M3 — Bei 1280 px fällt Rang 1 auf 80 px, und die Kopfzeilen überdrucken sich.**
`BankTransactionRow.stories.tsx:59` rahmt mit `minWidth={1220}`. Die festen
Spuren summieren sich auf 1060 px, dazu 7 × 10 px Lücke und 2 × 18 px Polster
= 1166 px; bei 1220 px bleiben für den Zweck 54 px. Gemessen bei Viewport
1280 (L1 nennt 1280 px Innenbreite als Ziel): kein Scrollen
(`.v2tbl__scroll` 1246/1246), Spurliste
`100px 180px 80px 200px 160px 180px 110px 130px`, `.v2purp__text`
`scrollWidth` 357 gegen `clientWidth` **54** → sichtbar „Wartun…"; im Kopf
läuft „Verwendungszweck" **43,2 px** über die eigene Zelle (335–415, Textkante
458,2) und überdruckt „Sachverhalt" (Zelle ab 425) — der Kopf kürzt nicht.
Gegenprobe: Zweck-Spur zur Laufzeit auf 300 px → Überstand −176,8 px, zurück
→ +43,2 px. Screenshot `inuse-1280.png`. Die Schwester `BankTransactionList`
(0085) hat dafür den Default `minWidth = 1400` (`BankTransactionList.tsx:76`).
*Kleinster Weg:* `minWidth={1400}` im Story-`Frame`, und ein Satz an
`bankTransactionTracks`, der die 1166 px feste Spur nennt.

**M4 — `Columns` zeigt zwei der vier offenen Klassen.**
Das Kriterium verlangt, dass die vier offenen Klassen in der Story `Columns`
ihr Wort tragen. `--columns` zeigt `beyond_bookings` („außerhalb des
Bestands") und `unclear_multi` („mehrdeutig"); `unclear_none` („kein
Kandidat") steht nur in `--unassigned`/`--in-use`, `no_account` („ohne Konto")
in **keiner** Story von 0101 — der einzige Beleg im Repo ist
`BankTransactionWorklist.stories.tsx:34`. Dass `no_account` im Bestand heute
keine Zeile hat (die Verteilung nennt `beyond_bookings` 328 · `unclear_none`
38 · `unclear_multi` 12), macht es nicht unnötig: das Kriterium verlangt für
alle vier das Wort, und der Wert kommt aus den Stammdaten, nicht aus der
Kaskade. *Kleinster Weg:* `Columns` um zwei Zeilen mit `unclear_none` und
`no_account` ergänzen.

**M5 — Der Kopf der Zustands-Spalten ist handgeschrieben statt `StatusHeader`.**
`BankTransactionRow.stories.tsx:63–66` und `:169–171` setzen
`{c.header}<StatusInfoButton …/>` in einen nackten Span; die Spec nennt für
`InUse` ausdrücklich „Köpfe der Status-Spalten über `StatusHeader` (0077)",
und V14 nennt `StatusHeader` als die Form der Legende am Ort. Messbar: der
Abstand zwischen Wortende und (i) ist **0,0 px** („Buchung" 841,0/841,0,
„DATEV-Historie" 1050,6/1050,6); Gegenprobe mit `.v2sth` zur Laufzeit → 4,0 px
(845,0/1054,6), Klasse entfernt → wieder 0,0 px. Dazu schreibt `Columns`
seine Kopf-Beschriftungen von Hand, obwohl der abgeleitete Satz sie in
`.header` mitbringt — dieselbe Driftquelle, die M2 der Vorrunde für die
Spurliste beseitigt hat. *Kleinster Weg:*
`<StatusHeader axis="ereignis" label="Buchung" />` bzw.
`axis="bank_match_stage" label="DATEV-Historie"`, und die Kopfzeile von
`Columns` aus dem abgeleiteten Satz bauen.

**M6 (klein) — Die Unterzeile misst die Betragsspalte ein zweites Mal.**
`v3.css:3356–3357` gibt `.v2btxrow__splitrow` das Raster
`120px 1fr 130px`, und die Zelle hat 16 px Polster gegen 18 px der Datenzeile.
Gemessen in `--expanded` (1440 px): rechte Kante der Betragsspalte **1397,0**,
rechte Kante von Teilbetrag und Summe **1399,0** — 2,0 px Versatz auf allen
drei Unterzeilen, ausgerechnet an den Zahlen, die man übereinander liest.
*Kleinster Weg:* Polster der Unterzeilen-Zelle auf 18 px, dann stehen die
Kanten aufeinander.

**Urteil: zurück.** Der Bau ist in der Sache dicht — die acht Punkte stehen,
die Ableitungen liegen im Spiegel, `columns` wählt aus und ordnet nicht,
Vorzeichen ohne Farbe, Rest-Marke nachgerechnet, Zweck und Fallname kürzen
sauber, Kopf und Zeilen teilen eine Spurliste, kein `a` in `a`. Zurück geht
es an drei Stellen, die jede für sich messbar sind: das doppelte (i) kostet
251 Zeilen rund 400 Fokusstopps (M1), die Gegenpartei-Spur trägt schon das
p90 des Bestands nicht und macht die häufigste Zeile 38 % höher (M2), und bei
der Mindestbreite der Hausregeln zeigt Rang 1 sechs Zeichen, während sich die
Kopfzeilen überdrucken (M3). M4 und M5 sind je eine Story-Zeile, M6 zwei
Pixel.

Abgenommen von / am: **nicht abgenommen** — geprüft von Claude
(Abnahme-Agent, fremd), 2026-09-07 · Offene Punkte: M1–M6; danach
Wiederabnahme. Dazu offen (App): Ersatz der Zeile in `KontoauszugView`, in
`BankTransactionAssignmentTable` und der dritten Route aus B3.

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

## Nach der Abnahme (2026-09-07)

Alle sechs Mängel sind behoben. Drei davon waren an diesem Tag schon in
anderen Spaltensätzen aufgetreten — das ist kein Zufall mehr, sondern ein
Muster, das die Bauform der Spaltensätze betrifft.

**M1 — das (i) stand doppelt.** Zwei Achsen tragen es im Kopf, und die
Abzeichen brachten ihr eigenes mit: „DATEV-Historie" siebenmal (1 Kopf + 6
Zeilen), „Buchung" fünfmal. Gemessen sind es jetzt **2 im Kopf, 0 in den
Zeilen**, und der Tab-Lauf ist von 24 auf **14 Stopps** gefallen — genau die
Zahl, die die Abnahme als Gegenprobe genannt hat. Bei p90 251 Zeilen sind das
rund 400 Stopps weniger.

**M2 — die Spur „Gegenpartei" trug den Bestand nicht.** 180 px reichen für
etwa 20 Zeichen; der Bestand geht bis 54. Ohne Kürzung wuchs die häufigste
Zeilenart um 38 %. Sie hat jetzt `.v2trunc` und ihren `title`; gemessen
`client 180 = scroll 180`.

**M3 — bei 1280 px fiel Rang 1 auf 80 px.** Die Story rahmte mit
`minWidth={1220}`, die Liste selbst nimmt 1400. Nichts scrollte, der
Verwendungszweck war zu 15 % lesbar, und der Kopf lief 43 px über seine Zelle.
Jetzt dieselbe Zahl wie die Liste: gemessen scrollt die Tabelle (1400/1246),
der Zweck hat 208 px.

**M5 — das (i) kommt aus dem Spaltensatz.** Es hing in jeder Story von Hand,
an unterschiedlichen Stellen und ohne den Abstand, den die Regel setzt.
`bankTransactionColumns()` trägt es jetzt in `headerAside`, wie `case-columns`
und `source-document-columns` es längst tun. *(Beim Umbau habe ich es kurz
ganz entfernt — der Spaltensatz hatte noch kein `headerAside`, also rendete
`{c.headerAside}` nichts. Gemessen aufgefallen, nicht gelesen.)*

**M4 — die vierte offene DATEV-Klasse zeigt sich.** `no_account` kam in keiner
Story vor; eine Zeile trägt sie jetzt.

**M6 — die Unterzeile fluchtet mit der Betragsspalte.** Ihr seitliches Polster
war `--space-4` (16 px), jede Tabellenzelle nimmt 18. Die rechte Kante saß
deshalb 2 px daneben — und die Aufteilung soll unter dem Betrag stehen, den
sie aufteilt. Gemessen: **1399,0 gegen 1399,0**.

**Der Hinweis zu `rowHref` bleibt:** die Prop ist im Bau dazugekommen, steht
nicht in der Schnittstellen-Tabelle und hat in 0101 keine eigene Story — 0085
und 0086 belegen sie. Das gehört in die Tabelle nachgetragen, wenn die Spec
das nächste Mal angefasst wird.

## Wiederabnahme 2026-09-07 (fremde Abnahme)

Zweite Abnahme, fremd: Spec und Code gelesen, kein Chat-Verlauf, nicht der
bauende Agent. Gemessen im Browser über CDP gegen den laufenden Dev-Server
6107 (headless Chromium, eigener Port, Breiten 700 · 1100 · 1280 · 1440 ·
1920). Gemessen wurde jeweils die **Wirkung** — `getBoundingClientRect`,
`scrollWidth` gegen `clientWidth`, `getComputedStyle`, `Range` für Textkanten,
echte `Input.dispatchKeyEvent`-Tabs, echte Klicks, `CSS.forcePseudoState` für
Hover —, nie die gesetzte Prop. Aktion und Messung standen in **getrennten**
`Runtime.evaluate`-Aufrufen. Jede Zahl, an der ein Mangel hängt, hat eine
Gegenprobe (Regel zur Laufzeit gesetzt, neu gemessen, zurückgesetzt). Die
breitesten Werte des Bestands stammen aus `docs/entitaeten/bank-transaction.md`
und aus der Registry (`BANK_MATCH_STAGE` 12 Werte, `EREIGNIS_BUCHUNG` 8) und
wurden mit ungebundenem Klon **und** in der echten Zelle gemessen.
`pnpm build` war untersagt (Befund 0117) und ist nicht gelaufen.

**Ein Hinweis zur ersten Messreihe:** die allererste Messung an `--in-use`
zeigte Zeilenhöhen 71,7/71,7/47,1/47,1/93,5/46,1 — ein Zwischenstand während
des ersten Story-Kompilats. Vier Wiederholungen über 3 s ergeben stabil
47,1/47,1/47,1/47,1/67,7/46,1 (`document.fonts.status` = `loaded`). Alle
Zahlen unten stammen aus dem stabilen Zustand.

### Story-Deckung

Sechs Stories, `index.json` bestätigt sechs IDs unter
`v3/Entitäten/Kontoauszugsposition/BankTransactionRow`: `Filled`,
`Unassigned`, `Split`, `Columns`, `Expanded`, `InUse`. Das ist genau die
Ableitung nach `spec-schreiben` §6: 2 anwendbare Zustände + 1 Enum
(`columns`) + 1 Layout-Boolean (`expanded`) + 0 Callbacks + 1 im Einsatz + 1
Rand = 6. Prop-Deckung: `transaction`/`caseHref` (`--filled`), `openHref`
(`--unassigned`, gemessen `href="#zuordnen"`), `columns` + `accountLabel`
(`--columns`), `expanded` (`--expanded`). Ausgeschlossen und begründet:
`lädt` und `Fehler` gehören der Liste (Abschnitt „Verhalten"), `leer nach
Filter` hat eine einzelne Zeile nicht. **Nicht gedeckt bleibt `rowHref`** —
siehe Mangel M-D.

### Kriterien

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `pnpm typecheck` Exit **0** | ✓ |
| `pnpm build` grün | untersagt (parallele Sitzungen, Befund 0117) — nicht gelaufen | nicht geprüft |
| Wächter | `check:language` Exit 0 · `check:icons` Exit 0 · `check:contrast` Exit 0 · `check:mirror` Exit 0 · `check:when` Exit 0. Dazu `check-language.mjs --all` (Bestandsbericht, Exit 1 bei 388 Altzeilen): **kein** Treffer in `entities/bank-transaction/` | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/bank-transaction/BankTransactionRow.tsx` + `.stories.tsx`; Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionRow` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `check:when` Exit 0 über ganz `src/ui/v3`; `BankTransactionRow`, `bankTransactionColumns`, `bankTransactionTracks` tragen beide Zeilen; Typ-Exporte sind nach der Regel des Wächters ausgenommen | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep '#[0-9a-fA-F]{3}'` über die fünf Dateien: Exit 1 (kein Treffer). px nur als `ColumnDef.width` (8 Zeilen, Rastermaß wie `case-columns`/`account-columns`). Labels aus `BANK_MATCH_STAGE`/`EREIGNIS_BUCHUNG` über `StatusBadge`; `derive.ts` ist reiner Re-Export, `check:mirror` Exit 0 | ✓ |
| Rang 7 = Zustand des **Ereignisses**, Klärungszähler fallweit; beides als Kommentar im Code | `bank-transaction-columns.tsx:27–35` sagt beides wörtlich und englisch. `--filled`: Badge „Vorschlag" aus `resolveEventBookingState`, Achse `ereignis` | ✓ |
| Z0 zeigt „offen", nie einen Gedankenstrich | `--unassigned`: `a.v2case__nonelink` mit Text „offen" und `href="#zuordnen"`; Zeilentext gemessen, kein Gedankenstrich (`/(^\|\s)[—–-](\s\|$)/` = false). `--in-use` zweimal derselbe Weg | ✓ |
| Z3 zeigt eine Rest-Marke = `restOf()` | `--split`: „Rest 149,90 €"; `restOf` aus dem Spiegel = \|−1.249,90\| − 1.100,00 = 149,90 ✓. `--in-use` Zeile 5: „Rest 480,55 €" = 2.480,55 − 2.000,00 ✓. Bei Z1 (`--filled`) keine Marke — `deriveZ` liefert dort Z1 | ✓ |
| Das Vorzeichen trägt keine Farbe | `--in-use`, alle sechs Beträge: `color` = `rgb(45, 45, 45)` — Eingang (1.800,00 €) wie Ausgänge. Gegenprobe: Regel `.v2tbl__row .v2num{color:rgb(200,0,0)!important}` zur Laufzeit → alle sechs `rgb(200, 0, 0)`, Regel entfernt → wieder `rgb(45, 45, 45)`. Ausrichtung `right`, `font-variant-numeric: lining-nums tabular-nums`, rechte Kante aller sechs 1399,0 | ✓ |
| Das Datum trägt das Jahr | `--filled` „26.08.2026"; Spur 100 px, Bedarf 71,6 px (ungebundener Klon) | ✓ |
| Rang 5 als `StatusBadge axis="bank_match_stage"`; die vier offenen Klassen tragen ihr Wort (Story `Columns`) | Badge steht. `--columns` zeigt **zwei**: „außerhalb des Bestands" (`beyond_bookings`) und „mehrdeutig" (`unclear_multi`). `unclear_none` („kein Kandidat") steht in `--unassigned`, `no_account` („ohne Konto") in `--in-use` Zeile 3 — beide **nicht** in `Columns` | **M-B** |
| Rang 8 als Zahl mit Wort, **ohne** Badge | `--split`: `span.v2btxrow__clar` „2 Klärungen", `--in-use` Zeile 5 „1 Klärung"; `.bdg` in der Klärungs-Spalte: 0. Spur 110 px, Bedarf „3 Klärungen" (Höchstwert des Bestands) 91,5 px | ✓ |
| Bei mehreren Fällen steht vor jedem Ereignis-Badge die Fallnummer | `--split`: `.v2btxrow__statefor` „2026-0412" über Badge „Vorschlag" (y 137,7 gegen 155,5), „2026-0488" über „Buchung fehlt" (y 179,6 gegen 197,4); DOM-Reihenfolge davor. Im CSS begründet (nebeneinander bräuchte die Spur 187 statt 150 px) | ✓ |
| Die vier Ableitungen liegen in einer eigenen Datei und rendern nichts | `derive.ts` 23 Zeilen, reiner Re-Export, kein JSX; `deriveZ`, `restOf`, `derivePurposeParts`, `resolveEventBookingState` liegen im Spiegel. `check:mirror` Exit 0 | ✓ |
| `columns` lässt weg und ordnet nicht um | `--columns` übergibt **verdreht** (`amount, matchStage, account, purpose, counterparty, postingDate`); gerendert steht die Zeile in der Familien-Reihenfolge, Zell-x = Kopf-x = 35/145/335/517/677/867 in beiden Zeilen | ✓ |
| Kopf und Zellen haben eine Quelle, keine Flatterkante | `--in-use` 1440 px: `grid-template-columns` von Kopf und **allen sechs** Zeilen identisch (`100px 180px 234px 200px 160px 180px 110px 130px`), Zell-x = Kopf-x in allen acht Spalten. `--columns` ebenso | ✓ |
| Spurbreiten gegen den Wertebereich (ungebundener Klon **und** echte Zelle) | Datum 100 / 71,6 · Buchung 160 / **131,7** („Keine Buchung nötig", der breiteste Wert der Achse) · DATEV 180 / **151,0** („außerhalb des Bestands"; „über Namensvariante" 136,1) · Klärung 110 / 91,5 („3 Klärungen") · Betrag 130 / 113,0 („−1.234.567,89 €") · Sachverhalt 200: `.v2case__link` kürzt (130/163) mit `title` · Zweck `minmax(0,1fr)` = 234: `.v2purp__text` kürzt (206/357), `nowrap`/`ellipsis` | ✓ |
| Zeilenhöhe (V1) | `--in-use` stabil **47,1 / 47,1 / 47,1 / 47,1 / 67,7 / 46,1** px. Die eine hohe Zeile ist die Z3-Zeile mit Rest-Marke (4 % des Bestands). `--filled` 46,1 px, `--split` 105,8 px (zwei Fälle **und** Rest) | ✓ |
| Das (i) steht nur einmal (Mangel M1 der Vorrunde) | `--in-use`: „Buchung (Ereignis): Zustände erklären" **1×**, „DATEV-Historie: Zustände erklären" **1×**, beide im Kopf; Knöpfe in Zeilen: 6, davon **0** Status-(i) (alle sechs sind `.v2purp__info` von 0099). Echter Tab-Lauf mit `Input.dispatchKeyEvent`: **14** Fokusstopps für sechs Zeilen (2 Kopf-(i) + 6 Zweck-(i) + 6 Fall-/„offen"-Links), der 15. Druck landet auf `body` — genau die Zahl, die die Vorrunde als Gegenprobe genannt hat | ✓ |
| Fokusring, verschachtelte Anker | Fokusring auf **allen 14** Stopps sichtbar: `outline: rgb(59, 143, 196) solid 2px`, `:focus-visible` wahr. `a a` = 0, `a button` = 0 in allen sechs Stories | ✓ |
| Jedes klickbare Element antwortet auf Hover (§2, I11) | `CSS.forcePseudoState` je Element, mit Rücksetzen: `.v2case__link` `rgb(45,45,45)` → `rgb(26,58,92)` + `underline` → zurück · `.v2case__nonelink` `rgb(92,92,92)` → `rgb(26,58,92)` + `underline` → zurück · `.v2purp__info` `rgb(113,113,113)` → `rgb(26,58,92)` → zurück · Kopf-(i) Opazität 0,65 → 1 → zurück. Kein `cursor: pointer` ohne Antwort | ✓ |
| Echte Klicks | Klick auf das Kopf-(i) der DATEV-Spalte (1065/104) öffnet den Legenden-Dialog mit **allen zwölf** Werten der Achse samt Bedeutung; `Escape` schließt ihn (gemessen `dialog[open]` vorher 0, danach 1, nach Escape 0). Klick auf `.v2case__link` setzt `location.hash` von `""` auf `#fall-c-4412` | ✓ |
| Aufklapp-Mechanik und Aufteilungszeile | Die Zeile klappt bewusst nicht selbst auf (`expanded` ist Zustand, kein Schalter) — im Tab-Lauf gibt es keinen Zeilen-Stopp, in `--split` ist `.v2btxrow__split` **0×** vorhanden, in `--expanded` **1×** und sichtbar (Höhe 97,4 px) | ✓ |
| Polster der Aufteilungszeile (Spezifitätsfalle, Mangel M6 der Vorrunde) | `--expanded`, `getComputedStyle(td.v2btxrow__split)`: `padding` **8px 18px 12px**, `display: block`, `background: rgb(244,246,248)`, `border-bottom: 1px rgb(236,239,243)` — der Reset schlägt sie nicht. Wirkung: rechte Kante von Teilbetrag und Summe **1399,0** = rechte Kante der Betragsspalte **1399,0**. Gegenprobe: `padding-right: 16px` zur Laufzeit → 1401,0 (2 px daneben), zurück → 1399,0 | ✓ |
| §9: Text links, Zahlen rechts, nichts zentriert (V3) | `text-align: center` im ganzen `.v2tbl`: nur auf den Icon-Knöpfen und ihren SVG-Kindern, auf keinem Text | ✓ |
| §9: Kontrast (V10) | `check:contrast` Exit 0. Spot-Messung gegen `rgb(255,255,255)`: `.v2btxrow__rest` 6,69 · `.v2btxrow__clar` 6,69 · `.v2btxrow__statefor` 4,88 · `.v2case__no` 6,69 · `.v2case__link` 13,77 · `.v2purp__text` 13,77 — alle ≥ 4,5 | ✓ |
| §9: Karte Rand **oder** Schatten | `.v2card`: `border 1px solid rgb(221,226,232)`, `box-shadow: none` | ✓ |
| §9: keine Emoji, keine Versalien | Kartentext: `\p{Extended_Pictographic}` false; einziges Versalienwort „DATEV" (Eigenname) | ✓ |
| §9: Baustein mit `minWidth` scrollt statt abzuschneiden — gemessen bei vier Breiten (Mangel M3 der Vorrunde) | `--in-use` mit `Table minWidth={1400}`: 1920 → 1400/1398 · 1440 → 1400/1398 · 1280 → **1400/1246**, `overflow-x: auto`, Spurliste unverändert `100px 180px 234px …`, Zweck behält **234 px**, Kopftext „Verwendungszweck" bleibt **110,8 px innerhalb** seiner Zelle (kein Überdrucken von „Sachverhalt") · 1100 → 1400/1066 · 700 → 1400/666. Screenshot `inuse-1280.png` | ✓ (mit M-C) |
| §9: Legende am Ort (V14) / Story `InUse` „Köpfe der Status-Spalten über `StatusHeader` (0077)" | Der Kopf ist ein nackter `<span>{c.header}{c.headerAside}</span>` (`BankTransactionRow.stories.tsx:62–68`), kein `StatusHeader`. Gemessen ist der Abstand zwischen Wortende und (i) **0,0 px** („Buchung" 843,0/843,0 · „DATEV-Historie" 1052,6/1052,6). Gegenprobe: `.v2sth` zur Laufzeit gesetzt → **4,0 px** (847,0/1056,6), Klasse entfernt → wieder 0,0 px | **M-A** |
| Im Browser angesehen | Screenshots `inuse-1440.png`, `inuse-1280.png`, `split-1440.png`, `expanded-1440.png`, `columns-1440.png` im Abnahme-Scratchpad | ✓ |
| offen (App): ersetzt die Zeile in `KontoauszugView` und `BankTransactionAssignmentTable`, dazu die dritte Route aus B3 | in diesem Repo nicht prüfbar | offen (App) |

### Die Mängel der Vorrunde — nachgemessen

| Vorrunde | Behauptung der Nacharbeit | Nachgemessen |
|---|---|---|
| M1 doppeltes (i) | „2 im Kopf, 0 in den Zeilen, 24 → 14 Stopps" | **stimmt.** 1× je Achse im Kopf, 0 Status-(i) in den Zeilen, echter Tab-Lauf = 14 Stopps |
| M2 Gegenpartei-Spur | „hat jetzt `.v2trunc` und ihren `title`; `client 180 = scroll 180`" | **stimmt und trägt weiter.** p90 (31 Zeichen) in die echte Zelle geschrieben: 180/216, Zeilenhöhe bleibt 47,1 · max (53 Zeichen): 180/379, Zeilenhöhe bleibt 47,1. `--in-use` Zeile 4 („Kontoführungsentgelt August 2026") 180/225 mit vollem `title`. Bedarf ungebunden: p50 178,8 · p90 256,3 · max 448,6 px |
| M3 1280 px | „scrollt (1400/1246), der Zweck hat 208 px" | **stimmt.** 1400/1246 bei 1280 px; die Zweck-Spur misst 234 px (Zelleninhalt `.v2purp__text` 206 px), kein Kopf-Überstand |
| M4 vierte offene Klasse | „`no_account` … eine Zeile trägt sie jetzt" | **halb.** `no_account` steht in `--in-use` Zeile 3 („ohne Konto") — das Kriterium nennt aber Story `Columns`, und dort stehen weiter nur zwei der vier → M-B |
| M5 (i) aus dem Spaltensatz | „`bankTransactionColumns()` trägt es jetzt in `headerAside`" | **halb.** Das (i) kommt aus dem Satz ✓, aber die Story rahmt es ohne `StatusHeader`/`.v2sth`: der Abstand, dessentwegen M5 überhaupt aufgeschrieben wurde, ist wieder **0,0 px** → M-A. Dazu schreibt `Columns` seine Kopfbeschriftungen weiter von Hand (`:166–175`), samt eigenem `StatusInfoButton` |
| M6 Unterzeile | „1399,0 gegen 1399,0" | **stimmt**, mit Gegenprobe (16 px → 1401,0 → zurück 1399,0) |

### Mängel

**M-A — Der Kopf der Status-Spalten ist weiter handgerahmt; das (i) klebt am Wort. (blockiert)**
Ort: `BankTransactionRow.stories.tsx:62–68` (`Frame`) und `:166–175` (`Columns`).
Die Spec nennt für `InUse` ausdrücklich „Köpfe der Status-Spalten über
`StatusHeader` (0077)", und V14 nennt `StatusHeader` als die Form der Legende
am Ort. Gemessen in `--in-use` bei 1440 px: Wortende und Knopf-Kante stehen
auf **derselben** x-Position — „Buchung" 843,0/843,0 und „DATEV-Historie"
1052,6/1052,6, also **0,0 px** Abstand. Gegenprobe: `.v2sth` zur Laufzeit an
beide Kopf-Spans → 4,0 px (847,0 / 1056,6), Klasse entfernt → wieder 0,0 px.
Genau diese Messung stand schon in der Abnahme vom Vortag; die Nacharbeit hat
das (i) in den Spaltensatz verschoben, aber nicht in seinen Rahmen. Dass
`Columns` in derselben Datei `.v2sth` von Hand setzt (dort gemessen 4,0 px),
zeigt, dass es kein Zufall zweier Zahlen ist, sondern zwei Wege in einer Datei.
*Kleinster Weg:* im `Frame` die Kopfzelle als `<span className="v2sth">`
rahmen, wo `c.headerAside` steht (oder `StatusHeader` benutzen, wenn der Kopf
nicht sortierbar sein muss), und die Kopfzeile von `Columns` aus dem
abgeleiteten Satz bauen statt aus sechs Literalen.

**M-B — `Columns` zeigt weiter zwei der vier offenen DATEV-Klassen. (blockiert)**
Ort: `BankTransactionRow.stories.tsx:176–200`. Das Kriterium lautet wörtlich
„die vier offenen Klassen tragen ihr Wort (Story `Columns`)". Gemessen in
`--columns`: die beiden Badges heißen „außerhalb des Bestands"
(`beyond_bookings`) und „mehrdeutig" (`unclear_multi`). `unclear_none`
(„kein Kandidat") steht in `--unassigned`, `no_account` („ohne Konto") in
`--in-use` Zeile 3 — beide nicht dort, wo das Kriterium sie verlangt. Die
Nacharbeit hat `no_account` einer `InUse`-Zeile gegeben; das erfüllt den
Buchstaben des Kriteriums nicht. Der Legenden-Dialog des Kopfes zeigt zwar
alle zwölf Werte (gemessen), aber die Story soll die vier **im Bild** zeigen.
*Kleinster Weg:* `Columns` um zwei Zeilen mit `unclear_none` und `no_account`
ergänzen — die Story hat heute zwei Zeilen und kein Platzproblem.

**M-C (klein) — Die Story-Karte scrollt bei jeder Breite um 2 px. (blockiert nicht)**
Ort: `BankTransactionRow.stories.tsx:56` (`maxWidth: 1400`) gegen `:59`
(`Table minWidth={1400}`). Die Karte hat 1 px Rand je Seite, also bleiben
1398 px Innenbreite für eine Tabelle, die 1400 px fordert. Gemessen:
`.v2tbl__scroll` **1400/1398** bei 1920 px **und** bei 1440 px — die Tabelle
hat auf jedem Bildschirm eine waagerechte Scrollleiste, auch wo genug Platz
wäre. Die Schwester macht es richtig: `BankTransactionList --in-use` misst
1406/1406, kein Überlauf. Das ist die Nebenwirkung der M3-Nacharbeit (vorher
1398/1398, Überlauf 0). *Kleinster Weg:* den Rahmen der Story auf
`maxWidth: 1440` setzen (oder `minWidth` und Rahmen aus einer Zahl ableiten) —
die 1400 der Tabelle bleiben, wie 0085 sie hat.

**M-D (Mangel der Spec, steht seit der Vorrunde) — `rowHref` hat weder Zeile in der Schnittstelle noch Story. (blockiert nicht)**
Ort: `bank-transaction-columns.tsx:79`. Die Prop ist im Bau dazugekommen,
verändert die Zeile spürbar (sie legt einen `.v2rowlink` über die Gegenpartei,
und `.v2tbl__row:has(.v2rowlink)` färbt die ganze Zeile beim Überfahren,
`v3.css:159–169`) und wird in 0101 von **keiner** Story gezeigt — belegt ist
sie nur in `BankTransactionList.stories.tsx:94` und
`BankTransactionWorklist.stories.tsx:161`. Eine Abnahme ändert die Kriterien
nicht, deshalb steht das hier als Mangel der Spec und nicht als gekürzte
Liste. *Kleinster Weg:* Zeile in die Schnittstellen-Tabelle, und entweder eine
Story in 0101 oder ein Satz, warum 0085/0086 sie tragen.

### Befunde am Set

1. **`headerAside` verliert überall den Abstand, den `StatusHeader` gibt.**
   `DataTable.headCell` setzt `{col.header}{col.headerAside}` ohne rahmenden
   `.v2sth`-Span (`DataTable.tsx:354–358` und `:381–389`). Gemessen ist der
   Abstand Wort → (i) deshalb **0,0 px** nicht nur hier, sondern auch in
   `DataTable --in-use` („Bearbeitung") und in `CaseRow --in-use` („Stand",
   „Wer ist dran", „Export") — drei Bausteine, dieselbe Null. `.v2sth`
   (`v3.css:2917`) ist die einzige Stelle, die die 4 px setzt, und der
   `headerAside`-Weg kommt nie an ihr vorbei. Solange das so ist, hat jeder
   Spaltensatz, der Z4 richtig macht, den Abstand falsch. Kleinster Weg an der
   Wurzel: in `headCell` den Kopf als `<span className="v2sth">` rahmen, wenn
   `headerAside` gesetzt ist — dann verschwindet M-A hier und in vier weiteren
   Familien (`case-columns`, `account-columns`, `source-document-columns`,
   `bank-transaction-columns`).

2. **`nicht gelaufen` (matchStage `null`) kommt in keiner Story vor.**
   `bank-transaction-columns.tsx:210` zeigt für `matchStage === null` den Text
   „nicht gelaufen" in `.v2muted`. Der Text deckt sich mit der Registry
   (`AXIS_SOURCE` sagt „NULL = Kaskade nicht gelaufen"), ist also keine lokale
   Label-Map — aber keine der sechs Stories setzt `matchStage: null`, und der
   Zweig ist damit nie im Bild. Kein Kriterium verlangt ihn; als Rand-Wert
   gehört er in `Columns` oder `InUse`, wenn die Spec das nächste Mal
   angefasst wird.

3. **`Filled` zeigt Rang 8 leer.** Die Stories-Tabelle sagt für `Filled`
   „Alle acht Punkte"; die Klärungs-Spalte ist dort leer, weil die Fixture
   `openClarificationsCount: 0` trägt. Alle acht **Spalten** stehen (gemessen),
   nur der achte Wert fehlt. Das Kriterium zu Rang 8 nennt `Split`, und dort
   steht er — kein Mangel, aber die Stories-Tabelle verspricht etwas, das die
   Fixture nicht hält.

**Urteil: zurück.** Der Bau ist in der Sache dicht, und die schweren Mängel der
Vorrunde sind wirklich weg — das doppelte (i) ist auf 14 statt 24 Fokusstopps
zurück (echter Tab-Lauf), die Gegenpartei kürzt jetzt bis zum Höchstwert des
Bestands ohne eine einzige Zeile höher zu werden (180/379 bei 53 Zeichen,
Zeilenhöhe 47,1 px), bei 1280 px scrollt die Tabelle statt Rang 1 auf 80 px zu
drücken, und die Unterzeile fluchtet auf 1399,0 mit der Betragsspalte
(Gegenprobe gemacht). Zurück geht es an zwei Stellen, die beide je zwei Zeilen
kosten: der Kopf der Status-Spalten steht weiter ohne `StatusHeader`, und der
Abstand, dessentwegen M5 aufgeschrieben wurde, ist wieder 0,0 px (M-A); und
`Columns` zeigt weiter zwei der vier offenen DATEV-Klassen, obwohl das
Kriterium diese Story beim Namen nennt (M-B). M-C sind zwei Pixel Scrollleiste
aus der M3-Nacharbeit, M-D ist der stehende Spec-Mangel zu `rowHref`.

Abgenommen von / am: **nicht abgenommen** — geprüft von Claude
(Abnahme-Agent, fremd), 2026-09-07 · Offene Punkte: M-A, M-B (blockierend),
M-C, M-D (nicht blockierend); danach Wiederabnahme. Dazu offen (App): Ersatz
der Zeile in `KontoauszugView`, in `BankTransactionAssignmentTable` und der
dritten Route aus B3.

## Nach der Wiederabnahme (2026-09-07): beide Blocker, und einer an der Wurzel

**M-A — der Abstand gehört der Kopfzelle, nicht fünf Spaltensätzen.** Der
Befund des Prüfers trifft den Kern: `headerAside` wurde als nacktes
Geschwister seines Wortes gerendert, und der Abstand war gemessen **0,0 px**
— nicht nur hier, sondern in `DataTable --in-use`, `CaseRow --in-use` und
`BankTransactionRow --in-use`. Die Spaltensätze, die `.v2sth` von Hand
setzten, hatten 4,0 px; der Rest sah aus wie ein Tippfehler.

Behoben wurde deshalb **an zwei Wurzeln**, nicht in den Stories:

1. `DataTable` rahmt einen Kopf mit `headerAside` selbst in `.v2sth` — in der
   sortierbaren Variante bleibt `headerAside` dabei **außerhalb** des Links
   (ein Knopf im Anker ist ungültiges Markup).
2. Für die Köpfe, die nicht durch `DataTable` gehen — `Table`/`HeadRow` steht
   in Stories und Seiten ebenso —, trägt die Kopfzelle die Regel selbst:
   `.v2tbl th:has(> .v2sinfo)` und `.v2tbl th > *:has(> .v2sinfo)`.

Gemessen bei 1400 px, Wortende → (i), über vier Spaltensätze:

| | vorher | jetzt |
|---|---|---|
| `BankTransactionRow --in-use` (Buchung, DATEV-Historie) | 0,0 | **4,0** |
| `CaseRow --in-use` (Stand, Wer ist dran, Export) | 0,0 | **4,0** |
| `DataTable --in-use` (Bearbeitung) | 4,0 | 4,0 |
| `SourceDocumentColumns --document-list` (drei Köpfe) | 4,0 | 4,0 |

Wer den Kopf baut, muss die Zahl nicht mehr kennen.

**M-B — `Columns` zeigt alle vier offenen DATEV-Klassen.** Zwei fehlten; die
Story hat zwei Zeilen mehr bekommen. Gemessen im gerenderten Text je genau
einmal: „außerhalb des Bestands", „mehrdeutig", „kein Kandidat", „ohne
Konto".

M-C (der Story-Rahmen ist 2 px enger als die Tabelle) und M-D (`rowHref` ohne
Zeile in der Schnittstelle) bleiben offen — der erste ist eine
Zuschnitt-Frage der Story, der zweite ein Spec-Mangel.

**Der Befund am Set ist behoben:** `StatusInfoButton` maß 12 × 12 statt
24 × 24 und antwortete nicht auf Hover; §9 hat jetzt die Zeile zur
Trefferfläche.

`pnpm typecheck`, `check:language`, `check:icons`, `check:contrast`,
`check:mirror`, `check:when` je Exit 0. `pnpm build` lief in dieser Welle im
eigenen Worktree: **Exit 0** (Bauprüfung in 0117).

**Status: Abnahme.**
