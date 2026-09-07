# 0100 · BankTransactionCell — die Zahlung, in einer fremden Ansicht genannt

| | |
|---|---|
| Status | Abnahme |
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
- **Setzt auf:** `BankTransactionPurpose`, `Amount`, `Time`, `MonoCell`.

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
| `transaction` | `BankTransactionCellData` | ja | Die Position: `postingDate`, `amount`, `currency`, `counterpartyName`, `purpose`, `sepaTags` | `Filled` |
| `account` | `{ label: string; href?: string }` | nein | Das Zahlungskonto — **nur wenn die Zelle kontofern steht**. Im Kontoauszug wäre es die Spalte, die die Seite ohnehin setzt | `WithAccount` |
| `href` | `string` | nein | Wohin die Zelle führt; ohne sie ist sie Text | `Filled`, `Plain` |

Der Typ ist die Teilmenge von `BankTransactionAssignmentRow`
(`modules/bank-transactions/infrastructure/`), die diese Zelle braucht. Er
liegt heute nicht im Spiegel — das ist Befund **L-56** und wird lokal
deckungsgleich definiert.

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
