# 0100 · BankTransactionCell — die Zahlung, in einer fremden Ansicht genannt

| | |
|---|---|
| Status | fertig (Schnittstelle) — die gemessene Prüfung steht in 0119 aus |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/bank-transaction/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: sie nennt eine Kontoauszugsposition und trägt deren Vorzeichen-Regel |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md` (Status `geprüft`, 2026-09-05), Formen-Tabelle Zeile `BankTransactionCell` — **im Prüflauf von „verworfen" auf „jetzt" gedreht** |
| Ersetzt | `EventStack.BankTransactionBlock` (Gegenpartei · Konto · Datum · Zweck) im Zeitstrahl des Sachverhalts und die Auszugszeile in `stapelabnahme/ui/Schritt4.tsx` |
| Voraussetzung | 0099 `BankTransactionPurpose` |
| Blockiert | nichts direkt; sie ist der kleinste Baustein der Familie |
| Spec von / am | Claude, 2026-09-05 (Skill `spec-schreiben`, nach dem geprüften Profil) |

## Ziel

Eine fremde Ansicht nennt eine Zahlung: der Zeitstrahl eines Sachverhalts,
ein Schritt der Stapelabnahme. Sie braucht dort nicht die ganze Auszugszeile
mit acht Punkten, aber mehr als eine Zeile Text — **Gegenpartei, Datum,
Betrag, Zweck**, und zwar in derselben Form wie überall.

Diese Form stand ursprünglich auf **verworfen**. Die Begründung war: „in
fremden Zeilen wird nicht die Position genannt, sondern ihr Zweck." Der
Prüflauf hat das widerlegt — an drei Stellen wird die Position genannt, jedes
Mal handgebaut, und genannt wird eben nicht nur der Zweck. Diese Spec steht
also, weil die Ablehnung nicht getragen hat.

## Einordnung

- **Wiederverwenden:** `BankTransactionPurpose` (0099) trägt den Zweck,
  `Amount` den Betrag mit Vorzeichen, `Time` das Datum. Was fehlt, ist der
  Zuschnitt: welche vier Punkte, in welcher Anordnung.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 — die Zelle ist die XS-Form
  dieser Entität, drei Stellen bauen sie heute von Hand, und keine
  vorhandene Form deckt sie ab.
- **Zuschnitt:** eine Datei, ein Export. Sie ist **keine** kleine
  `BankTransactionRow`: die Zeile hat acht Punkte und lebt in einer Tabelle,
  die Zelle hat vier und lebt in fremdem Fließtext.
- **Setzt auf:** `BankTransactionPurpose`, `Amount`, `Time`, `Link`.

## Das Vorzeichen ist die Richtung

Die Regel aus dem GLOSSARY, die jede Form dieser Familie trägt: **positiv =
Eingang, negativ = Ausgang.** Es gibt keine Richtungs-Spalte, und es darf
auch keine geben — die Information steckt im Betrag.

Daraus folgt zweierlei, und beides ist ein Abnahmekriterium:

- Das Vorzeichen bekommt **keine Farbe** (V3/A7). Rot ist im Set die
  Kritikalität, nicht die Richtung; ein Ausgang ist kein Fehler.
- Das Minus ist der Hyphen-Minus, den `formatAmount` (`de-DE`) schreibt —
  U+2212 wäre eine eigene Formatierung und wurde in der Freigabe gestrichen.
  Was bleibt, ist die Farbe: keine.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `transaction` | `BankTransactionCellData` | ja | Die Position: `postingDate`, `amount`, `currency`, `counterpartyName`, `purpose`, `sepaTags`. **Kein `id`** — die Zelle liest keins, und ein Pflichtfeld, das niemand liest, zwingt jeden Aufrufer, eines zu beschaffen, um eine Zeile Text zu zeigen. Der Schlüssel sitzt an `BankTransactionRowData`, wo die Liste ihn braucht (berichtigt 2026-09-08, M1) | `Filled` |
| `account` | `{ label: string; href?: string }` | nein | Das Zahlungskonto — **nur wenn die Zelle kontofern steht**. Im Kontoauszug wäre es die Spalte, die die Seite ohnehin setzt | `WithAccount` |
| `href` | `string` | nein | Wohin die Zelle führt; ohne sie ist sie Text | `Filled`, `Plain` |

Der Typ ist die Teilmenge von `BankTransactionAssignmentRow`
(`modules/bank-transactions/infrastructure/`), die diese Zelle braucht. Er
liegt heute nicht im Spiegel — das ist Befund **L-56**.

**Nicht deckungsgleich, und mit Absicht** (berichtigt 2026-09-08, M2): drei
Felder sind hier enger als drüben — `amount` ist `number` statt `string`
(jede Form der Familie gibt Beträge an `Amount`, die Zahlen formatiert; einmal
an der Grenze zu parsen ist ehrlich, fünfmal in fünf Komponenten ist dieselbe
Entscheidung fünfmal), `currency` ist die Union `Currency` statt `string`, und
`sepaTags` ist `SepaTags` statt `Record<string, string>`. Das ist durch die
Freigabe (c) gedeckt und steht in L-56; der frühere Satz „wird lokal
deckungsgleich definiert" stimmte nie.

**Kann bewusst nicht:**

- **Den Zustand zeigen.** Weder DATEV-Haken noch Sachverhalts-Zuordnung: das
  sind Ränge 5–8 und gehören der Zeile. Wer sie in einer fremden Ansicht
  braucht, braucht die Zeile.
- **Die Richtung als Wort sagen.** Sie steht im Vorzeichen. Ein zusätzliches
  „Eingang"/„Ausgang" wäre dieselbe Information zweimal.
- **Den Zweck kürzen entscheiden.** Das macht `BankTransactionPurpose`
  (`variant="inline"`).

## Verhalten

Server-Component. Zwei Zeilen: oben Gegenpartei (kräftig) mit Datum und
Betrag rechts, darunter der Zweck einzeilig mit Ellipse. Mit `account` steht
das Konto als dritte Angabe in der Kopfzeile, gedämpft.

Fehlt die Gegenpartei (3 % der Zeilen), rückt der Zweck nach oben — dann ist
er die Identität. Fehlt der Zweck nie (100 % Füllung), es gibt also keinen
Fall ohne beides.

Zustände: gefüllt · ohne Gegenpartei. Leer, lädt und Fehler gibt es nicht —
die Zelle bekommt ihre Daten mit dem Eintrag, in dem sie steht.

## Stories

Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionCell`. Abgeleitet
nach §6: 2 anwendbare Zustände + 0 Enums + 1 Layout-Boolean (`account`) +
0 Callbacks + **2** „im Einsatz" (Freigabe a) + 1 Rand = 6, plus
`TagsAndPlainAccount` für die zwei Prop-Wege, die sonst keine Story trägt = 7.

| Story | Beweist |
|---|---|
| `Filled` | Gegenpartei, Datum, Betrag, Zweck — ein Eingang und ein Ausgang nebeneinander, beide in derselben Farbe |
| `WithoutCounterparty` | Ohne Gegenpartei rückt der Zweck nach oben |
| `WithAccount` | `account` als dritte Angabe, kontofern |
| `Plain` | Ohne `href`: kein `<a>` im DOM |
| `InUseTimeline` | Im Zeitstrahl eines Sachverhalts, wie `EventStack` sie heute baut — daneben derselbe Eintrag in der alten Fassung zum Vergleich |
| `InUseGate` | Die Gate-Zeile aus Schritt 4 der Stapelabnahme: Bezeichnung, Betrag, das offene Gate als eigene Spalte (Freigabe a) |
| `TagsAndPlainAccount` | `sepaTags` gewinnen gegen das Nachparsen; `account` ohne `href` |

Nicht anwendbar: `leer`, `leer nach Filter`, `lädt`, `Fehler` (Begründung im
Verhalten).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Im Drawer nachschlagen | `onPeek?: () => void` | 0103 `BankTransactionDrawer` ist gebaut und der Zeitstrahl will ihn öffnen |
| Der DATEV-Haken auch hier | `showMatch?: boolean` | eine fremde Ansicht fragt „ist das schon gebucht?" — heute fragt sie das nicht |

## Befunde für `ludwig/app`

- **B1 (L-56)** — Der Anzeige-Typ liegt nicht im Spiegel; `src/ludwig/modules/bank-transactions/domain/`
  trägt nur die Import-Seite. Lokal deckungsgleich definiert.
- **B2 (L-61)** — `SachverhaltScreen.BankPane` beschriftet ein Feld
  „Wertstellung" und füllt es aus `postingDate`. Valuta und Buchungsdatum
  sind zwei Spalten und weichen regelmäßig ab. Beim Umzug fällt es auf; die
  Zelle zeigt das Buchungsdatum und nennt es so.

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

- [ ] **Das Vorzeichen trägt keine Farbe** — Eingang und Ausgang stehen in derselben Farbe (Story `Filled`, gemessen)
- [ ] Der Zweck läuft über `BankTransactionPurpose`, nicht als roher String (`grep`: kein `.purpose` direkt im JSX)
- [ ] Ohne Gegenpartei rückt der Zweck nach oben (Story `WithoutCounterparty`)
- [ ] `account` erscheint nur, wenn gesetzt (Story `WithAccount` gegen `Filled`)
- [ ] Ohne `href` rendert kein `<a>` (Story `Plain`)
- [ ] Kein Zustand in der Zelle — kein `StatusBadge`, kein DATEV-Haken (`grep`)
- [ ] Das Datum ist das **Buchungsdatum** und wird so beschriftet, nicht „Wertstellung" (B2)
- [ ] offen (App): ersetzt `EventStack.BankTransactionBlock` und die Auszugszeile in `Schritt4.tsx`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. Zwei Zeilen oder eine? *Ohne Antwort: zwei — der Zweck hat p90 84 Zeichen
   und passt neben Gegenpartei, Datum und Betrag in keine Zeile, ohne dass
   einer von ihnen weicht.*
2. Zeigt die Zelle das Datum mit oder ohne Jahr? *Ohne Antwort: mit. Der
   Kontoauszug lässt es heute weg (`fmtDateShort` → „15.04."), was in einer
   über Jahresgrenzen gefilterten Liste mehrdeutig ist — und im Zeitstrahl
   eines Sachverhalts erst recht.*
3. Gehört das Zahlungskonto in die Zelle oder in den Kontext? *Ohne Antwort:
   in die Zelle, aber nur mit `account` — im Auszug setzt es die Seite, im
   Zeitstrahl weiß es sonst niemand.*

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Entscheide: 1 zwei Zeilen · 2 Datum mit Jahr · 3 Konto nur über `account`.

Vor dem Bau in die Spec: (a) zweite Story `InUseGate` aus `Schritt4` (Bezeichnung · Betrag · Gate, Link in den Drawer) — der Startprompt verlangt zwei `InUse`-Stellen; (b) Kriterium „Minus ist U+2212" streichen — `formatAmount` (`de-DE`) schreibt Hyphen-Minus, „Vorzeichen ohne Farbe" bleibt; (c) **Typ-Satz für die Familie (gilt für 0100–0103):** Typen in `entities/bank-transaction/bank-transaction.ts`: `BankTransactionDetailData ⊃ BankTransactionRowData ⊃ BankTransactionCellData`, `SepaTags`, `cases: CaseLink[]` (0095) plus Ereignis-Zustand je Fall — eine Datei, keine drei Kopien (L-56).

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1/M2 — die Zelle lief in schmalen Spalten über.** `.v2btx__who` hatte weder
Ellipse noch Boden: ab 340 px brach der Name um, ab 240 px stand er außerhalb
seiner Box, und in `InUseGate` ragte der Betrag 28,7 px in die Nachbarspalte.
**Derselbe Fehler wie in 0095** — der Kommentar an `.v2case__link` beschreibt
ihn wörtlich, und er ist hier trotzdem wieder entstanden. Behoben mit
`overflow: hidden` + `text-overflow: ellipsis` + `min-width: 8ch`, dazu
`flex-wrap` auf der Kopfzeile, weil Datum und Betrag mit `flex: 0 0 auto`
sonst einen harten Boden von rund 180 px setzen. Gemessen bei 520 · 340 · 260
· 180 px: kein Überlauf der Zelle mehr (`scrollWidth − clientWidth` = 0 in
allen vier), `WithAccount` ist von 69,4 px auf 49 px geschrumpft und der Name
steht wieder auf einer Zeile.

**M3 — die Kopfzeile hatte kein eigenes Maß.** Sie erbte 16 px in der Karte
und 13,5 px in der Tabelle; dieselbe Komponente las sich je nach Wirt als zwei
Größen. Jetzt `var(--fs-ui)` = 13,5 px, gemessen in beiden Wirten gleich.

**M4 — das Buchungsdatum war nicht als solches beschriftet.** Der Wert war
richtig, aber Befund L-61 handelt genau davon, dass eine Zahl allein nicht
sagt, welches der beiden Daten sie ist — drüben heißt `posting_date` in der
`BankPane` „Wertstellung". Das Wort reist jetzt mit (`title="Buchungsdatum"`).

**M5 — `InUseTimeline` zeigte die alte Fassung nicht.** Sie steht jetzt
darunter, mit ihren Inline-Maßen nachgebaut. Der Vergleich sagt etwas: die
alte zeigt den **Betrag gar nicht**, das Datum ohne Jahr, den Zweck als
nackten Text ohne Zugang zu den Referenzen.

**M7 — zwei Prop-Wege ohne Story.** `TagsAndPlainAccount` deckt beide:
`sepaTags` gewinnen gegen das Nachparsen, und `account` ohne `href`.

**M6 (Buchhaltung)** — Story-Tabelle, Story-Formel und das gestrichene
U+2212-Kriterium sind nachgezogen, der Status steht auf `Abnahme`.

Der Hinweis des Abnehmenden zum Link-Kontrast auf `#f4f6f8` (4,44:1) gehört
zur globalen Schicht und steht in **0111**.

## Wiederabnahme 2026-09-07 (fremde Abnahme)

**Urteil: zurück.** Ein blockierender Mangel (M1): das Buchungsdatum ist als
solches **nicht** beschriftet — die Nacharbeit der Vorrunde (M4) hat den
`title` an eine Stelle gesetzt, an der er nie erscheint. Alles andere trägt:
die sechs übrigen variablen Kriterien sind gemessen erfüllt, und die Mängel
M1/M2/M3/M5/M7 der Vorrunde halten unter Belastung.

Gemessen gegen den laufenden Dev-Server `http://localhost:6107` über CDP
(eigener Port 9411), Aktion und Messung je in **getrennten**
`Runtime.evaluate`-Aufrufen, Textbedarf mit ungebundenem Klon
(`position:absolute; visibility:hidden; width:auto; max-width:none;
white-space:nowrap`), Hover und Fokus über `CSS.forcePseudoState` — nicht im
Stylesheet nachgelesen. **Kein `pnpm build`** (Befund 0117: der Build leert
`storybook-static/` unter parallelen Sitzungen weg).

### 1 · Story-Deckung

Ableitung der Spec: 2 Zustände + 0 Enums + 1 Layout-Boolean + 0 Callbacks +
2 „im Einsatz" + 1 Rand = 6, plus `TagsAndPlainAccount` = **7**. `index.json`
des laufenden Servers meldet **7** Stories unter
`v3-entitäten-kontoauszugsposition-banktransactioncell`.

| Prop / Zustand | Story | Nachweis |
|---|---|---|
| `transaction` | `--filled` | 2 Zellen gerendert, Gegenpartei · Datum · Betrag · Zweck alle vier im DOM |
| `account` gesetzt | `--with-account` | `.v2btx__acct` = **1** |
| `account` nicht gesetzt | `--filled` | `.v2btx__acct` = **0** |
| `account` ohne `href` | `--tags-and-plain-account` | `.v2btx__acct a` = 0, Anker der Zelle nur „Bürobedarf Meier GmbH" |
| `href` gesetzt | `--filled` | 2 Anker, `cursor: pointer` |
| `href` fehlt | `--plain` | `a` im ganzen Story-Wurzelknoten = **0** |
| `sepaTags` | `--tags-and-plain-account` | Chips: `EREF 0600496348` · `MREF AUS-DEM-IMPORT-4711`, während der Originalwert weiter `MREF+D-VR-50411866-0-001` trägt → Tags gewinnen |
| Zustand „ohne Gegenpartei" | `--without-counterparty` | `.v2btx__what` = 0, `.v2btx__who .v2purp` vorhanden |
| im Einsatz 1 | `--in-use-timeline` | 2 Zellen in einer `Card`, darunter die alte Fassung |
| im Einsatz 2 | `--in-use-gate` | 2 Zeilen in `Table cols="1fr 200px"`, Gate als eigene Spalte |

Ausgeschlossen: `leer`, `leer nach Filter`, `lädt`, `Fehler` — begründet im
Abschnitt „Verhalten" (die Zelle bekommt ihre Daten mit dem Eintrag, in dem
sie steht). Trägt.

**Die Zahl stimmt, die Zusammensetzung nicht:** die Formel zählt „+1 Rand",
die Story-Tabelle führt aber keinen Randfall — `Plain` und
`TagsAndPlainAccount` sind beide Prop-Wege. Es gibt keine Story, in der
`.v2btx__who` kürzt (siehe M2).

### 2 · Kriterien

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | Exit **0** | ✓ |
| `pnpm build` grün | **nicht geprüft** — Befund 0117 verbietet den Build gegen den geteilten Baum; ersatzweise `check:icons` · `check:contrast` · `check:mirror` · `check:when` · `check:language` je Exit **0** | offen (mit Grund) |
| Datei nach der Familie, Story daneben, Titel in der richtigen Gruppe | `entities/bank-transaction/BankTransactionCell{,.stories}.tsx`; Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionCell`, Gruppenkommentar `src/ui/v3/index.ts:393` lautet `/* Kontoauszugsposition */` | ✓ |
| Code englisch; `@when`/`@instead` am Export | `check:language` Exit 0 (Selbstprüfung `--test` Exit 0, 8 Fälle); `--all` nennt **keine** Datei unter `entities/bank-transaction/`; `check:when` Exit 0 (Selbstprüfung 11 Fälle) | ✓ |
| Kein Hex, kein px, keine lokale Label-Map, Status nur über Registry | `grep -nE` auf Hex, `px` und `fontSize` in `BankTransactionCell.tsx` Exit **1**; im Browser: Elemente mit Hex im `style` = 0 | ✓ |
| Alle Stories vorhanden, ausgeschlossene Zustände begründet | 7 von 7, siehe §1 | ✓ |
| §9 durchgegangen | siehe §3 | ✓ mit Befunden |
| Im Browser angesehen | alle sieben Stories geladen und gemessen (nicht nur gebaut) | ✓ |
| **Vorzeichen ohne Farbe** | `--filled`, `getComputedStyle`: `-1.249,90 €` = `rgb(45, 45, 45)`, `1.800,00 €` = `rgb(45, 45, 45)` — **identisch**. Minuszeichen ist U+002D (`2d`), nicht U+2212, wie in der Freigabe (b) verlangt. `font-variant-numeric: lining-nums tabular-nums` | ✓ |
| Zweck über `BankTransactionPurpose` | `grep -n "purpose"`: `.purpose` steht nur in der Destrukturierung, im JSX ausschließlich `<BankTransactionPurpose purpose={purpose} …>` (Zeilen 60, 81) | ✓ |
| Ohne Gegenpartei rückt der Zweck nach oben | `--without-counterparty`: `.v2btx__what` = **0**, `.v2btx__who` enthält `.v2purp`, ein Anker („Wartung Klimaanlage …") | ✓ |
| `account` nur wenn gesetzt | `--filled` 0 · `--with-account` 1; Reihenfolge in der Kopfzeile gemessen: `v2btx__who` → `v2btx__acct` → `v2btx__when` → `v2amount`; gedämpft (`rgb(113,113,113)`, 11,5 px) | ✓ |
| Ohne `href` kein `<a>` | `--plain`: 0 Anker | ✓ |
| Kein Zustand in der Zelle | `grep -nEi` auf `StatusBadge`, `datev`, `matchStage` in `BankTransactionCell.tsx` Exit **1**; im `--in-use-gate` steht das Gate in der Nachbarspalte, nicht in der Zelle | ✓ |
| **Datum ist das Buchungsdatum und wird so beschriftet** | Wert ✓ (`postingDate`, mit Jahr: „26.08.2026"). Beschriftung ✗ — siehe **M1** | ✗ (M1) |
| ersetzt `EventStack.BankTransactionBlock` und `Schritt4.tsx` | App-Seite, hier nicht prüfbar | offen |

### 3 · §9, die Punkte die am häufigsten reißen

- **Text links, Zahlen rechts mit `tnum`, nichts zentriert.** `text-align: center`
  im Zellbaum: 5 Elemente je Zelle, und zwar **ausschließlich** der (i)-Knopf
  und sein SVG (`BUTTON.v2purp__info`, `svg.lucide-info`, `circle`, 2 × `path`)
  — die UA-Vorgabe für `<button>`, kein Inhalt. Betrag rechts über
  `margin-left: auto`; in `--in-use-gate` liegt die rechte Kante beider
  Beträge bei 687,0 px = Spaltenkante, Δ **0,0 px**. ✓
- **Farbe nur als Kritikalität, Vorzeichen ohne Farbe.** Siehe §2. ✓
- **Jedes klickbare Element antwortet auf Hover** (mit `CSS.forcePseudoState`,
  nicht nachgelesen): Gegenpartei-Link `rgb(43,111,156)` → `rgb(26,58,92)`;
  Konto-Link ebenso; (i)-Knopf `rgb(113,113,113)` → `rgb(26,58,92)`. Alle drei
  `cursor: pointer`. Fokusring `:focus-visible` = `2px solid rgb(59,143,196)`. ✓
- **Trefferfläche.** `.v2purp__info` misst **24 × 24 px** in allen sieben
  Stories — das Hausmaß aus 0113 hält, die Nacharbeit von 0099 M9 ist hier
  nicht zurückgefallen. Die beiden Textlinks messen 16 bzw. 14 px hoch; sie
  tragen ein Wort und fallen damit nicht unter das Maß, das 0113/0099 für
  wortlose Knöpfe gesetzt haben. Der einzige Knopf unter dem Maß in einer
  Story ist fremd (siehe Befunde am Set 1).
- **Ein Baustein in einem Raster-/Flex-Kind mit `min-width: 0`.** `.v2btx`
  trägt `min-width: 0`, `.v2btx__who` `min-width: 8ch` (gemessen 71,25 px) mit
  `overflow: hidden` + `text-overflow: ellipsis`. Belastungsprobe siehe §4/M2:
  kein Überlauf bei 700 · 1100 · 1400 · 1920 px, auch nicht mit einem
  113-Zeichen-Namen.
- **Kein Icon ohne Wort, keine Emoji, keine Versalien.** Ein einziges Icon in
  der Zelle (das (i) des Zwecks), mit `aria-label` **und** `title`. ✓
- **Karte: Rand oder Schatten.** `--in-use-timeline` und `--in-use-gate`
  nutzen `Card` unverändert. ✓
- **Zeilenhöhe ≤ `.v2tbl__row` (V1).** Die Zelle ist zweizeilig (Freigabe,
  Entscheid 1) — in `--in-use-gate` misst die Zeile 67,3 px (mit Zweckzeile)
  bzw. 46,1 px. Bei 700 px wächst die zweite Zeile auf 76,3 px, weil die
  Kopfzeile umbricht. Das ist die gewollte Folge des `flex-wrap` aus M1/M2 der
  Vorrunde (die Alternative war der Überlauf) — Beobachtung, kein Mangel.

### 4 · Die Mängel der Vorrunde, nachgemessen

| Vorrunde | Behauptung | Messung heute | |
|---|---|---|---|
| M1/M2 | kein Überlauf mehr, Name auf einer Zeile | `scrollWidth − clientWidth` = **0** in `--in-use-gate` und `--in-use-timeline` bei 700 · 1100 · 1400 · 1920 px; Betragskante − Spaltenkante = **0,0 px**; `document.scrollWidth − clientWidth` = 0. Belastung: 53-Zeichen-Name (Bedarf 395,3 px) → Umbruch, kein Überlauf; 113-Zeichen-Name (Bedarf 816,9 px gegen 420 px Kasten) → `truncated: true`, Zelle weiter überlauffrei | ✓ |
| M3 | Kopfzeile hat ein eigenes Maß, in beiden Wirten gleich | `.v2btx__who` `font-size` = **13,5 px** in der Karte (`--filled`, `--in-use-timeline`) **und** in der Tabelle (`--in-use-gate`), bei allen vier Breiten | ✓ |
| M4 | „Das Wort reist jetzt mit (`title` = Buchungsdatum)" | **✗ — siehe M1 unten.** Der `title` sitzt am Umschlag-`span`, das `<time>` darin trägt seinen eigenen | ✗ |
| M5 | `InUseTimeline` zeigt die alte Fassung | Im DOM: „Zum Vergleich: die alte Fassung derselben Zahlung", danach `Bürobedarf Meier GmbH · Commerzbank · 1210 · 26.08. · Wartung Klimaanlage …` — **ohne Betrag**, Datum **ohne Jahr**, Zweck als nackter Text. Genau der behauptete Unterschied | ✓ |
| M7 | `TagsAndPlainAccount` deckt beide Prop-Wege | Chips `EREF 0600496348` · `MREF AUS-DEM-IMPORT-4711` gegen den unveränderten Originalwert `MREF+D-VR-50411866-0-001`; `.v2btx__acct a` = 0 | ✓ |
| M6 | Buchhaltung nachgezogen | Story-Tabelle, Formel und der Wegfall des U+2212-Kriteriums stehen in der Spec; Status `Abnahme` | ✓ |

### 5 · Mängel

**M1 — das Buchungsdatum ist nicht beschriftet; die Nacharbeit der Vorrunde
greift nicht. Blockiert.**
Kriterium: „Das Datum ist das **Buchungsdatum** und wird so beschriftet, nicht
‚Wertstellung' (B2)".
Ort: `src/ui/v3/entities/bank-transaction/BankTransactionCell.tsx:74–76`
(`<span className="v2btx__when" title="Buchungsdatum">` um ein `<Time>`).
Messung (`--filled`, 1400 px): `Time` setzt selbst
`title={formatTimeFull(value)}`, hier „26.08.2026". Die Elementkette in der
Mitte des Datumstexts lautet `TIME[title=26.08.2026]` → `SPAN[title=Buchungsdatum]`;
der **wirksame** `title` über den Ziffern ist damit „26.08.2026". Der äußere
`title` greift nur auf einem Streifen von **6,0 px oberhalb** und **3,8 px
unterhalb** der Glyphen — waagerecht sind Span und `<time>` exakt gleich breit
(Δ **0,00 px**). Das Wort „Buchungsdatum" erscheint also praktisch nie, und
der innere Tooltip wiederholt nur den sichtbaren Text.
Kleinster Weg: das Wort **sichtbar** machen statt es in einen Tooltip zu legen
— `Time` hat dafür die Prop `prefix` (`<Time prefix="Buchung" …>`), das kostet
rund 50 px in einer Kopfzeile, die bereits umbricht, und erfüllt zugleich V14
(nichts nur per Hover). Falls die Zeile das nicht hergibt: den `title` an das
`<time>` selbst bringen — dazu muss `Time` ihn durchreichen (siehe Befund am
Set 2), ein `title` am Umschlag kann es nicht.

**M2 — kein Randfall: keine Story kürzt den Namen, und der gekürzte Name gibt
nichts zurück. Blockiert nicht.**
Kriterium: Story-Ableitung `spec-schreiben` §6 („+1 Rand, falls die Komponente
formatiert oder kürzt") und §9 (Bedarf einer Spur gegen ihren breitesten Wert).
Ort: `BankTransactionCell.stories.tsx` (Fixtures `OUT`/`IN`) und
`src/styles/v3.css:3337–3341` (`.v2btx__who`).
Messung: längster Name in allen sieben Stories ist „Bürobedarf Meier GmbH" mit
**158,8 px** Bedarf gegen 249,3–493,0 px Kasten — `whoTruncated` ist bei
700 · 1100 · 1400 · 1920 px in **beiden** `InUse`-Stories `false`. Die Kürzung
ist also von keiner Story belegt; genau dieser Weg war der Mangel der
Vorrunde (M1/M2) und ist derselbe, der in 0095 und 0099 dreimal zurückfiel.
Gegenprobe mit eingesetztem Namen: der Mechanismus **trägt** (113 Zeichen,
Bedarf 816,9 px → `truncated: true`, Zellüberlauf 0) — es fehlt nur der
Wächter. Dabei fällt der zweite Teil auf: `.v2btx__who` hat weder `title` noch
`aria-label` (gemessen: beide `null`), während `.v2purp__text` daneben seinen
Volltext im `title` führt. Wer den Namen verliert, bekommt ihn nicht zurück.
Kleinster Weg: `title={name}` an `.v2btx__who` (eine Zeile, spiegelt die
Entscheidung aus 0099) und einer Fixture einen p90-langen Namen aus dem
Entitätsprofil geben — am besten der ersten Zeile in `InUseGate`, weil dort
die Spur am schmalsten ist (420 px bei 700 px Fenster).

**M3 — `InUseGate` baut das doppelte (i) nach, das 0101 M1 abgeschafft hat.
Blockiert nicht.**
Kriterium: §10 „Jede Status-Spalte `StatusHeader` … + `StatusBadge`" und der
Hausentscheid aus 0101 (das (i) steht **einmal**, im Kopf).
Ort: `BankTransactionCell.stories.tsx`, Story `InUseGate` — `HeadRow` mit
nacktem `<span>Gate</span>`, dazu zwei `StatusBadge axis="bank_match_stage"`
mit dem voreingestellten `info = true`.
Messung (`--in-use-gate`, 700–1920 px): Knöpfe mit `aria-label`
„DATEV-Historie: Zustände erklären" — **2** in den Zeilen, **0** im Kopf.
Die Zelle selbst ist sauber: genau **ein** (i) je Zelle in allen sieben
Stories.
Kleinster Weg: im `HeadRow` `StatusHeader axis="bank_match_stage"` statt des
Spans, an den Zeilen-Badges `info={false}`.

**M4 — die Fixtures erfinden: eine Id trägt drei verschiedene Zahlungen.
Blockiert nicht.**
Kriterium: `spec-schreiben` §6 („Daten in Stories sehen echt aus").
Ort: `BankTransactionCell.stories.tsx`, `OUT` (`id: "bt-1"`) und die zwei
Spreads darauf.
Messung (gerenderter Text): `bt-1` steht in `Filled` für „Bürobedarf Meier
GmbH · −1.249,90 €", in `WithoutCounterparty` für „ohne Gegenpartei ·
−89,90 €" und in `TagsAndPlainAccount` für dieselbe Zeile mit einem **anderen**
MREF. Dazu ist `AUS-DEM-IMPORT-4711` kein Wert, der echt aussieht — er sagt,
was er beweisen soll. Beides ist genau das Muster, das diese Familie schon
einmal eingefangen hat.
Kleinster Weg: `id: "bt-3"` bzw. `id: "bt-6"` in den beiden Spreads, und als
Import-MREF eine Mandatsreferenz in der Form der echten (`D-VR-50411866-0-002`)
— der Unterschied zum nachgeparsten Wert bleibt sichtbar, ohne dass die Story
eine Kennung erfindet.

### 6 · Befunde am Set (gehören nicht zu dieser Aufgabe)

1. **`StatusInfoButton` misst 12 × 12 px.** Gemessen in `--in-use-gate` an
   beiden Knöpfen („DATEV-Historie: Zustände erklären"): `12 × 12`. Das
   Hausmaß ist **24 × 24** (0113, in 0099 M9 durchgesetzt);
   `src/ui/v3/patterns/StatusInfoButton.tsx:53` setzt `ActionIcon size={12}`
   ohne Polster. Gehört zu 0077.
2. **`Time` schreibt einen `title`, der nichts hinzufügt — und einen Label des
   Wirts verdeckt.** `src/ui/v3/primitives/Time.tsx` setzt immer
   `title={formatTimeFull(value)}`; bei `format="date"` ist das wörtlich der
   sichtbare Text („26.08.2026"). Weil `title` vom innersten Element gewinnt,
   kann kein Wirt sein Datum über einen Umschlag beschriften — das ist die
   Ursache von M1. Kleinster Weg dort: den `title` weglassen, wenn er dem
   gerenderten Text gleicht, und eine `title`-Prop durchreichen. Gehört zu 0033.
3. **Links sind nur an der Farbe zu erkennen.** `text-decoration-line: none`
   im Ruhezustand **und** im Hover; die Antwort auf Hover ist allein der
   Farbwechsel `rgb(43,111,156)` → `rgb(26,58,92)` (gemessen, nicht
   nachgelesen). V14 verlangt „nichts nur per Farbe". Globale Schicht, gehört
   neben den Link-Kontrast in **0111**.

### 7 · Wächter

| Befehl | Exit |
|---|---|
| `pnpm typecheck` | 0 |
| `pnpm check:language` | 0 (`--test`: 0, 8 Fälle · `--all`: keine Zeile unter `entities/bank-transaction/`) |
| `pnpm check:icons` | 0 (53 Zeichen in der Registry) |
| `pnpm check:contrast` | 0 (20 Angaben nachgerechnet) |
| `pnpm check:mirror` | 0 (8 Fälle) |
| `pnpm check:when` | 0 (`--test`: 0, 11 Fälle) |
| `pnpm build` | **nicht gelaufen** — Befund 0117 |

Abgenommen von / am: fremder Prüfer, 2026-09-07 · **zurück** wegen M1 ·
Offene Punkte: M1 (blockiert), M2, M3, M4; Status zurück auf `in Arbeit`.

## Nach der Wiederabnahme (2026-09-07): der Blocker und drei kleine

Gemessen gegen den Dev-Server `http://localhost:6107` über CDP, Aktion und
Messung getrennt.

**M1 (Blocker) — das Wort steht jetzt da, statt sich verstecken zu müssen.**
Der äußere `title="Buchungsdatum"` war wirkungslos: `Time` schreibt seinen
eigenen `title` (den vollen Zeitstempel), und der innere gewinnt über den
Ziffern — der äußere griff nur auf den 6,0 px darüber und 3,8 px darunter.
Statt einen zweiten Tooltip zu bauen, trägt `Time` das Wort jetzt sichtbar:
`prefix="Buchung"`. Ein Wort, für das man erst zeigen muss, ist keines
(V11, T8).

Gemessen in `Filled`, `InUse` und `InUseGate` bei 700 und 1400 px: der Text
lautet **„Buchung 26.08.2026"**, und `scrollWidth − clientWidth` ist in allen
sechs Fällen **0** — die Zeile wird davon nicht breiter.

**M2 — der gekürzte Name hat einen Weg zum ganzen.** `.v2btx__who` trug
weder `title` noch `aria-label`; der Name kürzt per CSS. Jetzt `title`, aber
**nur im Namens-Zweig**: der Zweck bringt seinen eigenen mit, und zwei
Tooltips über derselben Stelle sagen zwei Dinge über sie. Gemessen in
`Filled`: „Bürobedarf Meier GmbH" und „Musterbau GmbH" tragen je ihren
eigenen, vollständigen `title`.

**M3 — ein (i), und zwar im Kopf.** `InUseGate` baute das doppelte Zeichen
nach, das 0101 für die Zeilenfamilie abgeschafft hat: zwei
`StatusInfoButton` in den Zeilen, keiner im Kopf. Jetzt umgekehrt — gemessen
**1 im Kopf, 0 in den Zeilen**. Die Achse erklärt sich einmal; in einer Liste
von hundert Zeilen stünde sonst hundertmal dasselbe Zeichen.

**M4 — die Fixtures sagen die Wahrheit.** Drei verschiedene Zahlungen trugen
`id: "bt-1"`; sie heißen jetzt `bt-1`, `bt-3` und `bt-4`. Und die MREF
`AUS-DEM-IMPORT-4711` war ein Zettel an sich selbst — sie lautet
`M-2026-08-4471` und sieht aus wie eine Mandatsreferenz. Der Story-Text sagt
dazu, was sie beweist: die gesetzte Referenz gewinnt gegen die aus dem Text.

**Der Befund am Set ist behoben, nicht vermerkt.** Der (i)-Knopf maß
12 × 12 px statt des Hausmaßes 24 × 24 — vier Abnahmen desselben Tages haben
das unabhängig gemeldet (0099, 0100, 0103, 0105). Er hat jetzt eine Klasse
mit 24 × 24, negativem Rand (die Zeilenhöhe bleibt) und einer Antwort auf
Hover; §9 hat die Zeile dazu bekommen, die nirgends stand.

`pnpm typecheck`, `check:language`, `check:icons`, `check:contrast`,
`check:mirror`, `check:when` je Exit 0. `pnpm build` lief in dieser Welle im
eigenen Worktree: **Exit 0**, kein ENOENT (Bauprüfung in 0117).

**Status: Abnahme** — das Urteil war „zurück", also entscheidet die nächste
Runde.

## Schlanke Abnahme (Schnittstelle) 2026-09-08

**Urteil: durch.** Kein blockierender Mangel. Die drei Props stehen Zeichen für
Zeichen so im Code, wie die Schnittstellen-Tabelle sie nennt; die Fachtypen
kommen aus dem Spiegel; alle sieben Wächter laufen auf Exit 0; alle sieben
Stories rendern mit leerer Konsole. Vier Mängel, alle nicht blockierend, und
**alle vier hängen an der Spec, nicht am Code** — das Muster von 0070, 0082,
0095 und 0096.

Dies ist die **schlanke** Tiefe (Owner-Entscheid 2026-09-08): geprüft wurde die
Schnittstelle, nicht die Darstellung. Spurbreiten, Zeilenhöhen, Überläufe,
Kontraste, Trefferflächen, Hover, Fokus und Tastaturwege sind nach
`docs/backlog/0119-visuelle-pruefung-nachholen.md` vertagt und hier weder
gemessen noch bewertet. Die Messungen der Wiederabnahme vom 2026-09-07 zu
diesen Punkten wurden **nicht** nachgeprüft.

**Gelesen:** die Spec ganz; `BankTransactionCell.tsx` (95 Zeilen),
`BankTransactionCell.stories.tsx` (251 Zeilen), `bank-transaction.ts`
(112 Zeilen), `src/styles/v3.css:3355–3373`, `src/ui/v3/index.ts:407–415`,
`spec-schreiben` §6, `scripts/check-when.mjs` (Geltungsbereich), im Spiegel
`modules/bank-transactions/domain/types.ts` und `.../statement-line.ts`,
`shared/money.ts`, `ui/status/status-registry.ts`, in der App
`apps/web/src/modules/bank-transactions/infrastructure/bank-transactions-queries.ts:160–172,379–403`.
**Gemessen:** sieben Wächterläufe (Exit-Code, nicht Text) und ein
Browser-Durchlauf über alle sieben Stories gegen den Dev-Server
`http://localhost:6107` über `scripts/cdp.mjs` (eigener Port 9433,
Story-IDs aus `/index.json`, nicht geraten).

### 1 · Props Zeichen für Zeichen

`BankTransactionCell.tsx:29–43` gegen die Tabelle der Spec (Zeilen 57–61):

| Spec | Code | |
|---|---|---|
| `transaction` · `BankTransactionCellData` · Pflicht | `transaction: BankTransactionCellData` (Z. 30, 34) | ✓ |
| `account` · `{ label: string; href?: string }` · optional | `account?: { label: string; href?: string }` (Z. 31, 40) | ✓ |
| `href` · `string` · optional | `href?: string` (Z. 32, 42) | ✓ |

Keine zusätzliche, keine fehlende, keine anders benannte Prop. Die
Ausbau-Props `onPeek` und `showMatch` sind — richtig — **nicht** gebaut.

Was die Tabelle **nicht** deckt: die Feldliste der Spalte „Bedeutung" nennt
sechs Felder, der Typ hat sieben (**M1**), und die Herkunftsaussage darunter
trägt nicht mehr (**M2**).

### 2 · Herkunft der Typen

- `Currency` ← `@/ludwig/shared/money` (`bank-transaction.ts:2`), `SepaTags` ←
  `@/ludwig/modules/bank-transactions/domain/statement-line` (Z. 1, dort
  `export type { SepaTags }` in Z. 101, ursprünglich aus `domain/sepa-tags.ts:34`).
  Beide aus dem Spiegel, keiner lokal nachgebaut. ✓
- `CaseLink` ← `../accounting-case/case-title` (0095), Set-eigener Typ, nicht
  Fachtyp. ✓
- `BankTransactionCellData` ist **lokal** definiert
  (`bank-transaction.ts:22–42`). Das ist gedeckt: der Spiegel trägt die
  **Import**-Seite (`domain/types.ts:81–102`, `BankTransactionRow`), die
  Anzeige-Seite liegt in der `infrastructure/` der App (Befund L-56), und die
  Freigabe (c) verlangt genau diese eine Familiendatei mit
  `Detail ⊃ Row ⊃ Cell`. Die Verschachtelung steht so im Code (Z. 51, 71). ✓
- **Verschärfungen:** drei Felder weichen vom App-Typ ab —
  `amount: number` gegen `string`, `currency: Currency` gegen `string`,
  `sepaTags?: SepaTags | null` gegen `Record<string, string> | null`
  (App: `bank-transactions-queries.ts:164–165,385`). Alle drei sind im JSDoc
  begründet und für die ganze Familie einmal entschieden; die Spec behauptet
  aber das Gegenteil („deckungsgleich"). → **M2**, kein Codemangel.
- `grep -nE '\bas [A-Z]'` über Komponente, Stories und Typdatei: **kein
  Treffer** (Exit 1). Keine Zusicherung, nirgends. ✓

### 3 · Deklaration, Ort, Namen

| Kriterium | Nachweis | |
|---|---|---|
| `@when`/`@instead` an jedem Export | `BankTransactionCell.tsx:22–28`, direkt über dem einzigen Export; `check:when` Exit 0 (`--test`: 0, 11 Fälle; `--all`: Exit 0). Die vier Interfaces in `bank-transaction.ts` sind ausgenommen — der Wächter greift nur bei `function`/`class`/Pfeil-Konstanten (`check-when.mjs:47–52`) | ✓ |
| Datei nach der Familie benannt | `entities/bank-transaction/BankTransactionCell.tsx` | ✓ |
| Story daneben, richtige Gruppe | `BankTransactionCell.stories.tsx:11` Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionCell`; Barrel-Kommentar `src/ui/v3/index.ts:407` lautet `/* Kontoauszugsposition */`, Export in Z. 415, Typ in Z. 409 | ✓ |
| Code englisch | `check:language` Exit 0; `--all` (Exit 1 wegen 377 Altzeilen in 136 Dateien) nennt **keine** Datei unter `entities/bank-transaction/`. Deutsch nur in Nutzer-Strings (`prefix="Buchung"`) und Story-JSDoc | ✓ |

Beobachtung, kein Mangel: über dem `@when`-Block steht ein zweites JSDoc
(Z. 7–20). Für den Wächter zählt der untere, für die IDE auch — der obere
Beschreibungsblock hängt an nichts und erscheint im Hover nicht.

### 4 · Story-Deckung

Sieben Stories im Code, sieben in `index.json` des laufenden Servers, sieben in
der Story-Tabelle der Spec. Ableitung §6: 2 Zustände + 0 Enums + 1
Layout-Boolean + 0 Callbacks + 2 „im Einsatz" + 1 Rand = 6, plus
`TagsAndPlainAccount` = **7**. Die Zahl stimmt.

| Prop / Weg | Story | Gemessen im Browser |
|---|---|---|
| `transaction` | `--filled` | 2 Zellen, Gegenpartei · Datum · Betrag · Zweck alle vier im DOM |
| `href` gesetzt | `--filled` | 2 Anker in den Zellen |
| `href` fehlt | `--plain` | Anker im Story-Wurzelknoten = **0** |
| `account` gesetzt | `--with-account` | `.v2btx__acct` = 1, darin ein Anker |
| `account` nicht gesetzt | `--filled` | `.v2btx__acct` = 0 |
| `account` ohne `href` | `--tags-and-plain-account` | `.v2btx__acct` = 1, `.v2btx__acct a` = 0 |
| `transaction.sepaTags` | `--tags-and-plain-account` | Chip `MREF M-2026-08-4471`, während der Originalwert weiter `MREF+D-VR-50411866-0-001` trägt → die gesetzten Tags gewinnen |
| `counterpartyName = null` | `--without-counterparty` | `.v2btx__what` = 0, `.v2btx__who .v2purp` = 1 |
| im Einsatz 1 | `--in-use-timeline` | 2 Zellen in `Card`, darunter die alte Fassung (ohne Betrag, Datum ohne Jahr) |
| im Einsatz 2 | `--in-use-gate` | 2 Zeilen in `Table cols="1fr 200px"`, Gate als eigene Spalte |

Ausgeschlossen: `leer`, `leer nach Filter`, `lädt`, `Fehler` — begründet im
Abschnitt „Verhalten" (die Zelle bekommt ihre Daten mit dem Eintrag, in dem sie
steht). Trägt. `purpose: null` hat ebenfalls keine Story und ist mit „Fehlt der
Zweck nie (100 % Füllung)" begründet. Trägt.

**Die Zusammensetzung stimmt weiter nicht:** die Formel zählt „+1 Rand", die
Story-Tabelle führt keinen. → **M3**, unverändert aus der Wiederabnahme vom
2026-09-07 (dort M2): die Nacharbeit hat den `title` nachgezogen, die Fixture
nicht.

### 5 · Zustand, Farbe, Maße in der Komponente

| Kriterium | Nachweis | |
|---|---|---|
| Kein Zustand in der Zelle | `grep` auf `StatusBadge`, `datev`, `matchStage` in `BankTransactionCell.tsx`: Exit 1. Im Browser: Elemente mit Status-Klasse **innerhalb** einer Zelle = 0 in allen sieben Stories | ✓ |
| Status nur über die Registry | Die Zelle trägt keinen Status. Die Stories nehmen `StatusBadge`/`StatusInfoButton` mit `axis="bank_match_stage"`; beide lesen `@/ludwig/ui/status/status-registry` (`StatusBadge.tsx:5`, `StatusInfoButton.tsx:8`). `unclear_multi`/`unclear_none` stehen dort (Z. 1910–1911), gerendert kam „mehrdeutig" — keine lokale Label-Map | ✓ |
| Kein Hex, kein px, kein `fontSize` in der Komponente | `grep -nE '#[0-9a-f]{3,8}\b\|[0-9]+px\|fontSize\|style='` auf `BankTransactionCell.tsx`: Exit **1**. Im Browser: Elemente mit Hex im `style` innerhalb der Zellen = 0 | ✓ |
| Vorzeichen ohne Farbe | `--filled`: `-1.249,90 €` = `rgb(45, 45, 45)`, `1.800,00 €` = `rgb(45, 45, 45)` — identisch. Ebenso in `--in-use-timeline` (`-1.249,90 €` / `249,90 €`) und `--in-use-gate` | ✓ |
| Zweck über `BankTransactionPurpose` | Kein `.purpose` im JSX; die Prop geht in beiden Zweigen an die Komponente (Z. 64, 90). Im DOM `.v2purp` in jeder Zelle | ✓ |
| Buchungsdatum, so beschriftet | Alle sieben Stories, jede Zelle: `.v2btx__when` liest **„Buchung 26.08.2026"** (bzw. 27./31.08.) — sichtbar, mit Jahr, nicht im Tooltip. Der Blocker der Wiederabnahme ist damit weg | ✓ |
| px in den Stories | Nur in `OldBlock` (`stories.tsx:170–207`) — der nachgebauten alten App-Fassung, deren Inline-Maße der Vergleich gerade zeigen soll — und in den `maxWidth`-Rahmen der Story-Gerüste. Nicht in der Komponente | ✓ |

### 6 · Wächter (Exit-Code, nicht Textausgabe)

| Befehl | Exit | zusätzlich |
|---|---|---|
| `pnpm typecheck` | **0** | |
| `pnpm check:language` | **0** | `--test`: 0 (8 Fälle) · `--all`: 1, aber keine Zeile unter `entities/bank-transaction/` |
| `pnpm check:icons` | **0** | 53 Zeichen in der Registry |
| `pnpm check:contrast` | **0** | `--test`: 0 (16 Fälle) · Lauf: 33 Angaben nachgerechnet |
| `pnpm check:mirror` | **0** | `--test`: 0 (8 Fälle); Spiegel eingefroren auf `f1c58c44` — Absicht |
| `pnpm check:when` | **0** | `--test`: 0 (11 Fälle) · `--all`: 0 |

`pnpm build` nicht gelaufen (Befund 0117, geteilter Baum); in der schlanken
Tiefe auch nicht verlangt.

### 7 · Browser-Durchlauf

Alle sieben Story-IDs aus `http://localhost:6107/index.json`, je einzeln
geladen, Aktion und Messung in getrennten `Runtime.evaluate`-Aufrufen, Helfer
`scripts/cdp.mjs` (räumt selbst ab, keine eigene Kopie).

| Story-ID | rendert | Konsole |
|---|---|---|
| `…banktransactioncell--filled` | 2 Zellen | leer |
| `…--without-counterparty` | 1 Zelle | leer |
| `…--with-account` | 1 Zelle | leer |
| `…--tags-and-plain-account` | 1 Zelle | leer |
| `…--plain` | 1 Zelle | leer |
| `…--in-use-timeline` | 2 Zellen + alte Fassung | leer |
| `…--in-use-gate` | 2 Zellen in der Tabelle | leer |

Keine Warnung, kein Fehler, keine geworfene Ausnahme in sieben von sieben.

### 8 · Mängel

**M1 — die Schnittstellen-Tabelle nennt `id` nicht. Blockiert nicht.**
Kriterium: jede Prop und jeder Typ Zeichen für Zeichen gegen die Tabelle.
Ort: Spec Zeile 59 gegen `src/ui/v3/entities/bank-transaction/bank-transaction.ts:23`.
Befund: die Spalte „Bedeutung" führt `postingDate`, `amount`, `currency`,
`counterpartyName`, `purpose`, `sepaTags` — `BankTransactionCellData` verlangt
zusätzlich ein **pflichtiges** `id: string`. Die Zelle liest es nicht
(`BankTransactionCell.tsx:44` destrukturiert es nicht), aber jeder Aufrufer
muss es liefern; für die Familie (`Row`, `Detail`) ist es richtig. Die Spec ist
hinterher, nicht der Code.
Kleinster Weg: `id` in die Feldliste der Zeile `transaction` aufnehmen, mit dem
Halbsatz, dass die Zelle es nicht zeigt.

**M2 — „deckungsgleich definiert" trägt nicht mehr. Blockiert nicht.**
Kriterium: Herkunft der Typen; Spec-Aussage gegen Code.
Ort: Spec Zeilen 63–66 gegen `bank-transaction.ts:34,35,41` und
`ludwig/app/apps/web/src/modules/bank-transactions/infrastructure/bank-transactions-queries.ts:164,165,385`.
Befund: die Spec sagt, der Typ sei „die Teilmenge von
`BankTransactionAssignmentRow` … und wird lokal **deckungsgleich** definiert".
Er ist es in drei Feldern nicht: `amount` ist `number` statt `string`,
`currency` ist die Union `Currency` statt `string`, `sepaTags` ist `SepaTags`
statt `Record<string, string>`. Zwei davon sind Verschärfungen. Alle drei sind
im JSDoc begründet (einmal am Rand parsen statt in fünf Komponenten), beide
Fachtypen kommen aus dem Spiegel, und die Freigabe (c) hat den Satz ohnehin
durch die Familiendatei ersetzt — aber sie steht noch da und behauptet etwas
anderes als der Code.
Kleinster Weg: den Absatz auf den Stand der Freigabe (c) bringen und die drei
Abweichungen benennen, statt „deckungsgleich" zu schreiben.

**M3 — die Story-Formel zählt einen Rand, den keine Story trägt. Blockiert nicht.**
Kriterium: Story-Deckung gegen `spec-schreiben` §6 („+1 Rand, falls die
Komponente formatiert oder **kürzt**").
Ort: Spec Zeilen 93–106 gegen `BankTransactionCell.stories.tsx:17–35` (Fixtures
`OUT`/`IN`) und `src/styles/v3.css:3364–3368` (`.v2btx__who` mit
`overflow: hidden; text-overflow: ellipsis; white-space: nowrap`).
Befund: die Komponente kürzt nachweislich (die CSS-Regel und der eigens dafür
gesetzte `title` in `BankTransactionCell.tsx:56` sagen es beide), aber der
längste Name in allen sieben Stories ist „Bürobedarf Meier GmbH" (21 Zeichen).
Die sechs Stories der Formel sind 2 Zustände + 1 Layout + 2 „im Einsatz" +
`Plain` — und `Plain` ist ein Prop-Weg, kein Rand. Derselbe Punkt stand als M2
in der Wiederabnahme vom 2026-09-07; die Nacharbeit hat den `title` ergänzt,
die Fixture nicht. Gemessen wurde hier nur die Fixture-Länge, nicht das
Kürzungsverhalten (vertagt nach 0119).
Kleinster Weg: einer Fixture einen p90-langen Gegenparteinamen aus dem
Entitätsprofil geben und die Story-Tabelle den Rand benennen lassen.

**M4 — „Setzt auf" nennt einen Baustein, der nicht vorkommt, und übergeht
einen, der es tut. Blockiert nicht.**
Kriterium: Spec gegen Code.
Ort: Spec Zeile 39 gegen `BankTransactionCell.tsx:1–4`.
Befund: die Einordnung listet `BankTransactionPurpose`, `Amount`, `Time`,
`MonoCell`. `MonoCell` steht in der Zelle nirgends — es ist in
`BankTransactionFacts.tsx` gelandet, wo es hingehört. Dafür setzt die Zelle auf
`Link`, den die Spec nicht nennt.
Kleinster Weg: in Zeile 39 `MonoCell` durch `Link` ersetzen.

### 9 · Gesamturteil

**durch.** Die Schnittstelle ist die der Spec, die Typen kommen von dort, wo
sie herkommen sollen, die Wächter sind grün, und alle sieben Stories rendern
sauber. Die vier Mängel sind Buchhaltung an der Spec (M1, M2, M4) und eine
fehlende Randfall-Fixture (M3) — keiner davon hält die Komponente auf.

Abgenommen von / am: fremder Prüfer (schlanke Tiefe), 2026-09-08 ·
Offene Punkte: M1, M2, M3, M4 — keiner blockierend ·
Vertagt: die visuelle Prüfung nach 0119 · Nicht geprüft: `pnpm build` (0117),
der App-Umzug (`EventStack.BankTransactionBlock`, `Schritt4.tsx`).

### Nacharbeit 2026-09-08 (nach der schlanken Abnahme)

Urteil war **durch**; die vier Punkte sind trotzdem abgearbeitet, zwei davon
im Code:

| Punkt | Was getan |
|---|---|
| **M1** | `id` ist aus `BankTransactionCellData` **entfernt** und sitzt jetzt an `BankTransactionRowData`, wo `rowKey` es braucht. Die Zelle las es nie; ein Pflichtfeld, das niemand liest, hätte jeden Aufrufer gezwungen, einen Schlüssel zu beschaffen, um eine Zeile Text zu zeigen. Der Typ bleibt strukturell — eine Zeile mit `id` passt weiter hinein, also bricht keine Aufrufstelle |
| **M2** | Der Satz „wird lokal deckungsgleich definiert" ist ersetzt. Er stimmte nie: `amount` ist `number` statt `string`, `currency` die Union statt `string`, `sepaTags` typisiert statt `Record`. Die Spec nennt jetzt alle drei mit Grund |
| **M3** | Der Rand hat seine Fixture: `TagsAndPlainAccount` trägt einen Gegenpart mit 63 Zeichen, an dem `.v2btx__who` sichtbar kürzt. Keine achte Story — der Rand gehört zu der, die ohnehin die volle Zelle zeigt |
| **M4** | „Setzt auf" nennt `Link` statt `MonoCell` |

`pnpm typecheck` und die fünf Wächter auf Exit 0.
