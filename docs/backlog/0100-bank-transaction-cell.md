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
