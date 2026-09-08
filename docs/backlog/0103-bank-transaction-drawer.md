# 0103 · BankTransactionDrawer — die Zahlung neben der Arbeit nachschlagen

| | |
|---|---|
| Status | fertig (Schnittstelle) — die gemessene Prüfung steht in 0119 aus |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/bank-transaction/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → der Rahmen ja (`Drawer`, 0042), der Inhalt nein |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md` (Status `geprüft`, 2026-09-05), Formen-Tabelle Zeile `BankTransactionDrawer` · Muster aus 0052 |
| Ersetzt | `apps/web/src/ui/drawers/BankTransactionDrawer.tsx` (96 Z.) — **Klasse A → Klasse B** (F113) |
| Voraussetzung | 0102 `BankTransactionFacts` (Zone 3) · 0095 `CaseCell` · `Drawer` (0042) |
| Blockiert | nichts — er schließt die erste Welle dieser Familie ab |
| Spec von / am | Claude, 2026-09-05 (Skill `spec-schreiben`, nach dem geprüften Profil) |

## Ziel

Der Drawer ist bei dieser Entität **nicht** die kleine Schwester eines
Views — er ist die einzige Detailansicht, die es gibt. Es existiert keine
Route für eine einzelne Kontoauszugsposition, und `BankTransactionDetail`
wird ausschließlich von ihm benutzt. Genau deshalb hat das Profil den
`BankTransactionView` verworfen: der Auszug ist der Bildschirm, der Drawer
die Vertiefung.

Aufgerufen wird er aus **drei** Ansichten: `KontoauszugView`,
`Schritt3Einzel` und `Schritt4` der Stapelabnahme.

## Einordnung

- **Wiederverwenden:** `Drawer` (0042) trägt Rahmen, Breite, Fokus und die
  drei Schließwege. `BankTransactionFacts` (0102) trägt Zone 3 — Kriterium
  aus 0052, nicht Empfehlung.
- **Neu, weil:** `spec-schreiben` §3 Regel 5; das Gegenstück in der App ist
  Klasse A und lädt selbst, was hier nicht sein darf.
- **Zuschnitt:** eine Datei, ein Export.
- **Setzt auf:** `Drawer`, `BankTransactionFacts`, `CaseCell`,
  `BankTransactionPurpose`.

## Klasse A wird Klasse B

Das ist die eigentliche Änderung. Der heutige Drawer hält `useState` für
Zeile, Ladezustand und Fehler und ruft `getBankTransactionDetail` selbst
(`useEffect`). Nach F113 gehört das dem Aufrufer:

| heute (Klasse A) | künftig (Klasse B) |
|---|---|
| `transactionId` rein, der Drawer lädt | `transaction` rein, fertig geladen |
| eigener `loading`-State | `transaction={null}` heißt „lädt" |
| eigener `error`-State | `error`-Prop |
| `useClientScope()` für Mandant und Jahr | `caseHref` als Funktion |

Der Gewinn ist nicht Eleganz: ein Drawer, der lädt, ist in Storybook nicht
darstellbar, und genau seine vier Zustände sind das, was eine Abnahme sehen
muss.

## Die fünf Zonen

| Zone | Inhalt |
|---|---|
| 1 · Kopf | Gegenpartei und Betrag (Ränge 3 und 2), darunter Datum |
| 2 · Original | **entfällt** — eine Zahlung hat keins. Wie beim Sachverhalt (0098) |
| 3 · Kernfakten | `BankTransactionFacts` ohne den Import-Block, `tone="bare"` |
| 4 · Grenze | „Herkunft und Rohdaten stehen im Kontoauszug." |
| 5 · Ausgang | in den zugeordneten Sachverhalt — **oder**, wenn keiner zugeordnet ist, in den Zuordnungs-Reiter |

Zone 5 ist hier die interessante: bei **65 %** der Positionen gibt es keinen
Sachverhalt, und dann ist der nützliche Ausgang nicht „zum Fall", sondern
„zuordnen". Der Drawer entscheidet das nicht selbst — der Aufrufer gibt
beide Ziele, und der Drawer wählt nach `cases.length`.

## Schnittstelle

*(Nachgezogen 2026-09-08, M1. Die Tabelle stand seit der ersten Fassung da und
beschrieb einen Baustein, den es so nie gab: sie nannte `transaction` statt
`record`, ein `assignHref` als Pflicht, das nie gebaut wurde, und kannte
weder `reference` noch `loading` noch `onOpenFull` — gerade die Prop, um die
sich die Spec dreht. Der Nachtrag vom 2026-09-06 nannte die richtige Form in
Prosa; die Tabelle blieb stehen.)*

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `open` | `boolean` | ja | Der Aufrufer hält den Zustand | `Filled`, `Closed` |
| `onClose` | `() => void` | ja | Der dritte Schließweg | `Interactive` |
| `reference` | `string` | ja | Die nachgeschlagene Kennung. Sie steht im Kopf **und** in beiden Texten — im Fehler- wie im Nichtgefunden-Fall, sonst rät der Leser, welche Zahlung gemeint war | `NotFound`, `Error` |
| `record` | `BankTransactionDetailData \| null` | ja | Die Position. **`null` heißt „nicht gefunden"**, nicht „lädt" — das trennt den leeren vom ladenden Zustand, die sonst gleich aussehen | `Filled`, `NotFound` |
| `loading` | `boolean` | nein | Schlägt `record` | `Loading` |
| `error` | `ReactNode` | nein | Schlägt `loading`. Ein Knoten, kein String: der Aufrufer hängt seinen Weg zurück an den Satz | `Error` |
| `onOpenFull` | `(exit: BankTransactionExit, caseId?: string) => void` | ja | **Ein** Ausgang, und welcher, entscheidet die Lage: `"case"` bei zugeordneter Zahlung, `"assign"` bei offener, `"statement"` ohne Datensatz. Bei 65 % ohne Sachverhalt sind zwei Knöpfe, von denen einer in zwei Dritteln der Fälle ins Leere zeigt, schlechter als einer, der immer passt | `Interactive`, `Unassigned` |
| `caseHref` | `(caseId: string) => string` | ja | Für `CaseCell` in Zone 3 | `Filled` |

**Kann bewusst nicht:**

- **Laden.** Klasse B.
- **Zuordnen.** Zone 5 führt zur Zuordnung, sie führt sie nicht aus.
- **Den Import-Block zeigen.** Der ist Herkunft; Zone 4 sagt, wo er steht.
- **Zone 2 haben.** Eine Zahlung hat kein Original — und der Kontoauszug,
  aus dem sie stammt, ist über eine **weiche Kante ohne FK** verbunden
  (L-45). Solange die nicht entschieden ist, gäbe es dort nichts zu zeigen.

## Verhalten

Breite `--drawer-lg` wie bei Beleg und Sachverhalt. Alles Übrige aus
`Drawer`: Esc, Scrim, Kreuz; der Fokus kommt beim Öffnen **in** den Drawer
(Aufgabe 0092) und kehrt beim Schließen an den Auslöser zurück.

Vier Zustände, wie 0052 sie verlangt: gefüllt · lädt (Fläche in der Form des
Inhalts — Kopf plus fünf Zeilen, nicht eine Karte) · Fehler (Satz statt Zone
3, Zone 5 bleibt) · zu.

## Stories

Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionDrawer`. Abgeleitet
nach §6: 4 anwendbare Zustände + 0 Enums + 0 Layout-Booleans + **2 Callbacks**
(`onClose` und `onOpenFull`) + 1 „im Einsatz" + 1 Rand = **8** — die gebaute
Zahl. *(Zweimal berichtigt: die Zeile sagte bis zum 2026-09-07 „= 7" bei acht
Stories in der Tabelle; die Nacharbeit vom 2026-09-07 zog nur die Tabelle nach
und erklärte den zweiten Callback als „in der Rechnung nicht enthalten" — §6
zählt aber +1 je Callback, und damit stimmt 8 auch als Rechnung. Nachgezogen
2026-09-08, M2.)*

| Story | Beweist |
|---|---|
| `Filled` | Alle vier Zonen, eine zugeordnete Zahlung; Zone 5 führt zum Fall |
| `Unassigned` | Zone 5 führt zur Zuordnung — der 65-Prozent-Fall |
| `Loading` | `transaction={null}`: Kopf plus fünf Zeilen, keine 96-px-Karte |
| `Error` | Satz statt Zone 3, Ausgang bleibt |
| `NotFound` | Die Kennung führt ins Leere — Satz statt leerer Zonen |
| `WithoutCounterparty` | Rand: 3 % der Zeilen, der Kopf fällt auf den Zweck zurück |
| `Interactive` | Öffnen, Esc, Fokus zurück am Auslöser |
| `InUse` | Aus dem Kontoauszug heraus: die Liste bleibt hinter dem Scrim sichtbar |

*(Die Tabelle nannte bis 2026-09-07 sieben Stories und darunter `Closed`;
gebaut sind acht — `Closed` ist in `Interactive` aufgegangen, dafür kamen
`NotFound` und `WithoutCounterparty` dazu. Beide sind im Nachtrag begründet,
die Tabelle war es nicht. Berichtigt in der Abnahme-Runde, M4.)*

Nicht anwendbar: `leer nach Filter`.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Zuordnen direkt im Drawer | `onAssign?: (caseId: string) => void` mit `CasePicker` (0084) | die Worklist (0086) ist gebaut und jemand will aus dem Auszug heraus zuordnen |
| Der Beleg als Zone 2 | `sourceDocument?: SourceDocumentLink` | L-45 ist entschieden |

## Befunde für `ludwig/app`

- **B1** — Der heutige Drawer ist Klasse A und holt seine Daten selbst
  (`getBankTransactionDetail` im `useEffect`). Der Umzug ist deshalb kein
  Import-Tausch: die drei Aufrufer müssen die Zeile mitbringen.
- **B2 (L-45)** — Solange die Kante Beleg → Bank-Umsatz weich ist, hat der
  Drawer keine Zone 2.

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

- [ ] **Klasse B**: kein `useEffect` mit Datenholung, kein `fetch`, kein `useClientScope` (`grep`)
- [ ] **Zone 3 importiert `BankTransactionFacts`** — keine zweite Feldliste im Drawer (`grep`: kein `FieldList`)
- [ ] Zone 5 führt bei zugeordneter Zahlung zum Fall, sonst zur Zuordnung (Story `Filled` gegen `Unassigned`)
- [ ] Der Import-Block fehlt in Zone 3, und Zone 4 sagt, wo er steht
- [ ] `Loading` zeigt die Form des Inhalts, nicht eine 96-px-Karte (gemessen)
- [ ] `error` ersetzt Zone 3 und lässt Zone 5 stehen
- [ ] Der Fokus kommt beim Öffnen in den Drawer und kehrt beim Schließen zurück (Story `Interactive`; setzt 0092 voraus)
- [ ] offen (App): ersetzt `ui/drawers/BankTransactionDrawer.tsx`; die drei Aufrufer bringen die Zeile mit (B1)

## Abnahme (2026-09-07)

Gemessen über CDP im Storybook-Dev-Server (Port 6107), Viewport 1440×900 und
1280×900. Story-Präfix `v3-entitäten-kontoauszugsposition-banktransactiondrawer--`.
Nicht gebaut (`pnpm build` gesperrt, Aufgabe 0117).

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `typecheck` / Wächter grün | `pnpm typecheck`, `check:icons`, `check:contrast`, `check:when`, `check:language`, `check:mirror` — alle Exit 0 | erfüllt (`build` nicht gelaufen, mit Grund) |
| Datei, Story daneben, Titel in der Gruppe | `BankTransactionDrawer.tsx` + `.stories.tsx`, Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionDrawer`, Barrel `src/ui/v3/index.ts:408` | erfüllt |
| Code englisch, `@when`/`@instead` | `check:language`, `check:when` Exit 0; beide Exporte tragen sie | erfüllt |
| Kein Hex, kein px, keine Label-Map, Status nur über Registry | `grep -E '#[0-9a-f]{3,6}\|[0-9]+px'` in Komponente und Story leer; Zustände über `StatusBadge axis="bank_match_stage"` / `"ereignis"` | erfüllt |
| Alle Stories vorhanden, ausgeschlossene begründet | 8 gebaut, Spec-Tabelle nennt 7 und darunter `Closed` | **M4** |
| Prüfliste §9 | siehe unten | erfüllt bis auf **M2** |
| Im Browser angesehen | alle 8 Story-IDs gemessen | erfüllt |

**Variabel**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Klasse B: kein `useEffect`-Laden, kein `fetch`, kein `useClientScope` | `grep -E 'useEffect\|fetch\|useClientScope\|useState'` in `BankTransactionDrawer.tsx` trifft nur einen Kommentar (Z. 24) | erfüllt |
| Zone 3 aus `BankTransactionFacts`, kein `FieldList` im Drawer | `grep FieldList` leer; `…--filled` zeigt vier `.v2fields`-Blöcke aus `BankTransactionFacts` | erfüllt |
| Zone 5: Fall gegen Zuordnung | `…--filled` Fußknopf „Sachverhalt öffnen"; `…--unassigned` „Zahlung zuordnen"; `…--loading/--error/--not-found` „Im Kontoauszug ansehen" | erfüllt |
| Import-Block fehlt, Zone 4 sagt wo er steht | `…--filled` Überschriften = Zahlung · Verwendungszweck · Gegenpartei · Zuordnung (kein „Import", kein „Rohdaten der Quelle"); `.v2btxd__limit` in allen fünf Zuständen vorhanden | erfüllt (Anmerkung **M5**) |
| `Loading` hat die Form des Inhalts | `…--loading`: 4 Blöcke, `border-top: 0px`, `background: rgba(0,0,0,0)`, Höhen 111,4 / 92,4 / 111,4 / 111,4 px gegen 135,1 / 138,9 / 135,1 / 137,5 px in `…--filled`; gleiche Überschriften, gleiche Reihenfolge; keine Karte, kein 96-px-Block. Inhalt rückt beim Eintreffen um 16,3 px nach unten (Meta-Zeile), nicht um 431 px | erfüllt |
| `error` ersetzt Zone 3, Zone 5 bleibt | `…--error`: Rumpftext = Callout-Satz, 0 `.v2fields`-Blöcke, Fußknopf steht | erfüllt |
| Fokus rein und zurück | `…--interactive`: nach Klick `document.activeElement` = `ASIDE.v2drawer` (im Drawer); 10× Tab bleibt in 6 Zielen zyklisch drin (Gegenprobe: dieselbe Tab-Folge ohne Drawer läuft über `BODY` nach draußen); Esc, Scrim-Klick und Kreuz schließen und geben den Fokus je an `BUTTON.v2btn--ghost „Zahlung ansehen"` zurück | erfüllt |
| App-Punkt (ersetzt `ui/drawers/BankTransactionDrawer.tsx`) | nicht Gegenstand dieses Repos | offen (App) |

**Prüfliste §9** (die zwei App-Punkte übersprungen)

Stufe/Importe nur abwärts · kein Hex/px/Label-Map · Text links, Zahlen rechts
mit `tnum` (`.v2amount`, `.v2num`, `.v2mono` alle `lining-nums tabular-nums`;
zentriert sind nur Knopfbeschriftungen) · Zeilenhöhe 30,9 px < `.v2tbl__row`
(12 px Polster + 13,5 px) · Vorzeichen ohne Farbe (`-1.249,90 €` in
`rgb(45,45,45)`) · jeder farbige Zustand mit Wort („exakt", „Vorschlag",
„kein Kandidat") · vier Zustände, „leer nach Filter" begründet entfallen ·
**Kontrast** aus den gerenderten Farben nachgerechnet, 40 Textknoten in fünf
Zuständen, Minimum 4,63 (`bdg-success` „exakt", `rgb(63,122,90)` auf
`rgb(240,246,242)`), Fokusring `rgb(59,143,196)` 2 px = 3,55:1 gegen die
Fläche und 3,28:1 gegen den Primärknopf — Gegenprobe: Farbe zur Laufzeit auf
`rgb(200,200,200)` gesetzt, Messung fällt von 6,69 auf 1,67 · Bewegung:
`prefers-reduced-motion: reduce` senkt die Drawer-Transition von 0,28 s auf
1e-05 s · Hauptweg per Tastatur, kein Zeichen ohne Wort (Zugänglichkeitsbaum:
„Schließen", „Wartung der Klimaanlage", „DATEV-Historie: Zustände erklären",
„Buchung (Ereignis): Zustände erklären", „Sachverhalt öffnen" — kein
namenloses Bedienelement) · Hover antwortet (Fußknopf `rgb(26,58,92)` →
`rgb(34,74,115)`, Kreuz transparent → `rgb(244,246,248)`, Fall-Link ohne →
mit Unterstreichung) · Lucide 1,5 px, keine Emoji, keine Versalien · Rahmen
**oder** Schatten (Drawer nur `--shadow-drawer`) · `minWidth`-Punkt: im
Drawer selbst sauber (kein Element mit `scrollWidth > clientWidth` bei 1280
und 1440; 120-Zeichen-Titel und 50-Zeichen-Referenz zur Laufzeit eingesetzt,
Panel bleibt bei 640 bzw. 720 px ohne Überlauf) — verletzt in der Story
`…--in-use`, siehe **M2** · Texte nach T1–T5.

**Story-Deckung.** Ableitung nach `spec-schreiben` §6 auf die **gebaute**
Schnittstelle: 4 anwendbare Zustände + 0 Enum-Props + 0 Layout-Booleans + **2
Callbacks** (`onClose`, `onOpenFull`) + 1 „im Einsatz" + 1 Rand = **8**. Gebaut
sind 8 — aber die Zusammensetzung stimmt nicht: `WithoutCounterparty` ist ein
**zweiter** Rand, und `onOpenFull` hat keinen Rundlauf (**M1**). Der Zustand
„zu" ist ohne eigene Story bewiesen: `…--interactive` und `…--in-use` starten
mit 0 `[role=dialog]` im DOM.

### Mängel

**M1 — der Ausgang, um den sich die ganze Spec dreht, hat keinen Rundlauf.**
`BankTransactionDrawer.stories.tsx:70, 89, 117, 136, 155, 172, 191, 247` —
alle acht Stories übergeben `onOpenFull={() => {}}`. Gemessen in
`…--in-use`: Fußknopf „Sachverhalt öffnen" geklickt, danach `location.hash`
unverändert (`""` → `""`), `[role=dialog]` weiter 1, Rumpf unverändert — der
„im Einsatz"-Fall zeigt einen Knopf, der nichts tut. Gegenprobe: derselbe
Klick auf den `CaseCell`-Link in Zone 3 setzt den Hash auf `#fall-c-4412`,
die Messung reagiert also. §6 verlangt je Callback einen Rundlauf mit
`useState`; bewiesen ist nur `onClose` (`…--interactive`). Damit steht
nirgends nachweisbar, dass der Drawer `("case", "c-4412")` bzw. `("assign")`
bzw. `("statement")` **mit den richtigen Argumenten** meldet — genau die
Entscheidung des Nachtrags. Kleinster Weg: in `…--in-use` einen
`useState<string>` für den zuletzt gemeldeten Ausgang, den die Story unter
der Liste anzeigt (`exit` + `caseId`).

**M2 — die „im Einsatz"-Story quetscht die Liste, statt sie scrollen zu
lassen.** `BankTransactionDrawer.stories.tsx:208` setzt `minWidth={1220}`;
`BankTransactionList.tsx:76` benutzt für dieselben Spalten `minWidth = 1400`.
Gemessen bei **1280 px** (die Untergrenze aus L1), Story `…--in-use`:
Tabelle 1246 px breit, **kein** Scroller, Zweck-Spalte 80 px, ihr Textkasten
`clientWidth 54 px` bei `scrollWidth 357 px` — 15 % des Zwecks lesbar.
Gegenprobe an derselben Breite mit `banktransactionlist--filled`: `.v2tbl__scroll`
scrollt (`scrollWidth 1400` / `clientWidth 1246`), Zweck-Spalte 234 px,
Textkasten 208 px. `Table` sagt im JSDoc, `minWidth` „erzwingt horizontales
Scrollen statt Quetschen" — mit 1220 tut es das nicht, weil die festen Spuren
plus Polster und Lücken schon 1166 px brauchen. Kleinster Weg: `…--in-use`
baut die Liste mit `BankTransactionList` statt mit `Card`/`Table` von Hand —
sonst wenigstens `minWidth={1400}`.

**M3 — fünf von acht Stories setzen eine interne id dorthin, wo der Kopf die
nachgeschlagene Kennung zeigt.** Gemessen: `…--loading`, `…--error` und
`…--interactive` tragen den Kopf „Zahlung bt-1", `…--not-found` „Keine
Zahlung zu bt-9999", `…--unassigned` die Meta-Zeile „bt-2" — während
`…--filled` mit `2026-08-26/1210/0093117` genau beweist, worauf M1 der
letzten Runde hinauswollte. §6 verlangt Story-Daten, die echt aussehen; die
Kennung steht seit M1 **sichtbar** im Kopf und ist damit kein Platzhalter
mehr. Dazu widerspricht sich `…--without-counterparty` im Kopf selbst:
Referenz `2026-08-29/1210/0088111` über „gebucht 26.08.2026"
(`stories.tsx:105` gegen `postingDate: "2026-08-26"`). Kleinster Weg: in
allen Stories eine Auszugs-Kennung derselben Form, und in
`WithoutCounterparty` das Datum der Referenz an `postingDate` angleichen.

**M4 — die Story-Tabelle der Spec und das gebaute Set widersprechen sich.**
Die Tabelle unter „## Stories" nennt 7 Stories und darunter `Closed`; gebaut
sind 8, `NotFound` statt `Closed` plus `WithoutCounterparty`. Beide
Abweichungen sind im Nachtrag und in M5 begründet, aber weder die Tabelle
noch die Ableitungszeile („= 7") wurden nachgezogen — die Messlatte sagt
etwas anderes als das Set. Kleinster Weg: Tabelle und Zeile in dieser Datei
auf 8 nachziehen (kein Code).

**M5 (Anmerkung) — Zone 4 sagt „Rohdaten", und Zone 3 zeigt welche.**
`BankTransactionDrawer.tsx:143` behauptet „Herkunft und Rohdaten stehen im
Kontoauszug"; zwei Blöcke darüber öffnet die Klappe „Originalwert" in
`…--filled` den ungeschnittenen Spaltenwert
(`EREF+0600496348 MREF+D-VR-50411866-0-001 PURP+SUPP SVWZ+…`, 108 Zeichen).
Gemeint ist der Import-Block, gesagt ist mehr. Kleinster Weg: der Satz nennt,
was wirklich fehlt — Herkunft und der vollständige Datensatz.

**Urteil: zurück.** Die Komponente selbst besteht jeden festen und jeden
variablen Punkt — Klasse B, Zonen, vier Zustände, Fokus, Kontrast, Breite.
Zurück geht sie wegen der Stories: der Ausgang, der die Spec trägt, ist in
keiner Story ausgelöst (M1), und die „im Einsatz"-Story zeigt bei 1280 px
eine Liste, deren Zweck-Spalte auf 54 von 357 px gequetscht ist (M2). M3–M5
sind klein und gehören in denselben Durchgang.

Abgenommen von / am: **zurück** — designsystem-abnahme (fremd, ohne
Bau-Kontext), 2026-09-07 · Offene Punkte: M1, M2, M3, M4, M5; dazu der
App-Punkt B1 (drei Aufrufer bringen die Zeile mit), der hier nicht prüfbar
ist.

## Offene Fragen

1. Ein Ausgang oder zwei? *Ohne Antwort: einer, aber je nach Lage ein
   anderer. Zwei Knöpfe nebeneinander, von denen einer bei 65 % der Fälle
   ins Leere zeigt, sind schlechter als einer, der immer stimmt.*
2. Gehört der Import-Block in den Drawer? *Ohne Antwort: nein — er
   beantwortet „woher kam die Zeile", und das ist nicht die Frage, die im
   Auszug aufkommt. Zone 4 nennt ihn.*
3. Bleibt die Breite `--drawer-lg`, obwohl es kein Original gibt? *Ohne
   Antwort: ja, wie bei 0098. Eine Breite je Entität wäre eine Entscheidung,
   die 0052 schon einmal getroffen hat.*

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben.** Entscheide: 1 ein Ausgang, lageabhängig · 2 Import-Block nicht · 3 Breite: `md` nach der 0052-Regel (`lg` nur für Dokument oder Tabelle), abweichend vom Default der Spec.

Vor dem Bau in die Spec: ein Satz, warum Zone 1 keinen `StatusBadge` trägt (keine Achse für `match_stage`, Ereignis-Zustand nur bei Zuordnung); Schnittstelle nach dem 0052-Schema wie in 0098 entschieden (`reference`, `record | null` = nicht gefunden, `loading`, `error`, `onOpenFull`), Story `NotFound`; Typ-Satz aus 0100.

## Nachtrag 2026-09-06, vor dem Bau

**Schnittstelle nach dem 0052-Schema** (gemeinsam mit 0098 entschieden):
`reference`, `record | null` = **nicht gefunden**, `loading`, `error`,
`onOpenFull`, dazu `caseHref` für Zone 3. Story `NotFound` statt `Closed`;
Breite `md`, nicht `lg` (0052 staffelt nach Inhalt: `lg` nur für ein Dokument
oder eine Tabelle, und eine Zahlung hat weder).

**Zone 5 bleibt ein Ausgang, und der Drawer wählt ihn** — aber die Route kennt
der Aufrufer. Deshalb ist `onOpenFull` kein `href`, sondern
`(exit: "case" | "assign", caseId?: string) => void`: der Drawer entscheidet
nach `cases.length`, der Aufrufer setzt die URL. Zwei Knöpfe, von denen einer
bei 65 % der Fälle ins Leere zeigt, wären schlechter als einer, der immer
stimmt.

**Warum Zone 1 keinen `StatusBadge` trägt** — und der Grund hat sich geändert.
Die Freigabe nannte „keine Achse für `match_stage`"; die gibt es seit
`cc141f7b` (`bank_match_stage`). Der Grund ist jetzt ein anderer und ein
besserer: **Zone 3 trägt sie**, und 0052 verbietet, dasselbe zweimal zu sagen.
Der Ereignis-Zustand kommt als Kopf-Zustand ohnehin nicht in Frage — es gibt
ihn nur, wo ein Sachverhalt hängt, also bei 35 % der Zeilen.

**`BankTransactionRow` bekommt kein `href`.** Beim Bau der `InUse`-Story
gemessen: `Row href` macht die ganze Zeile zu einem `<a>`, und ihre Zellen
tragen eigene — die Fall-Links von `CaseCell` und den (i)-Knopf des Zwecks.
Anker im Anker und Knopf im Anker sind ungültiges Markup; die Konsole meldete
es als Hydrations-Warnung. Die Wege aus der Zeile heraus sind die Wege in ihr.

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — `reference` stand nicht im Kopf, sobald ein Record da war.** Derselbe
Fehler wie in 0098, eine Entität weiter: der Kopf zeigte, was zurückkam, nicht
was nachgeschlagen wurde. Jetzt steht die Kennung als `<code>` in der
Meta-Zeile — und `Filled` trägt bewusst eine Referenz, die **nicht** die id
des Datensatzes ist (`2026-08-26/1210/0093117` gegen `bt-1`), sonst bewiese
die Story nichts.

**M2 — die Ladefläche hatte nicht die Form des Inhalts.** Sie war eine Karte
mit Rahmen und einem Kopf; der Inhalt sind **vier rahmenlose Blöcke**. Beim
Eintreffen sprang der Rumpf um 431 px, und die Karte verschwand — ein Rahmen,
den das Auge wieder verlernen muss. Jetzt vier Blöcke mit denselben
Überschriften in derselben Reihenfolge, `tone="bare"`.

**M3 — Zone 5 behauptete etwas, das der Drawer nicht wissen konnte.** Ohne
Datensatz war `cases.length` null, also bot der Knopf in `Loading`, `Error`
**und** `NotFound` an, die Zahlung zuzuordnen — im Fehlerfall ist unbekannt,
ob sie längst zugeordnet ist, und im Nicht-gefunden-Fall gibt es sie nicht.
Der Ausgang hat einen dritten Wert bekommen: `statement` → „Im Kontoauszug
ansehen", der ehrliche Weg aus allen drei Zuständen.

**M4 — der Tooltip „Buchungsdatum" war verdeckt.** Ein `title` über einem
`<time>`, das seinen eigenen `title` hat, ist unerreichbar. Das Wort steht
jetzt **sichtbar**: „gebucht 26.08.2026".

**M5 — der Kopf ohne Gegenpartei fiel auf den Nicht-gefunden-Kopf zurück.** Bei
3 % der Zeilen fehlt der Name; ein geladener Datensatz sah dann aus wie ein
fehlender. Jetzt rückt der Verwendungszweck nach — dieselbe Regel wie in
`BankTransactionCell`, und **der Freitext**, nicht der Rohblock: gemessen
stand dort erst „SVWZ+Kontoführungsentgelt August 2026", jetzt
„Kontoführungsentgelt August 2026". Neue Story `WithoutCounterparty`.

## Nach der Abnahme (2026-09-07)

Die Komponente selbst kam sauber durch — zurück ging sie an den Stories. Alle
fünf Punkte sind bearbeitet.

**M1 — `onOpenFull` hatte in acht von acht Stories eine leere Funktion.** Der
Klick tat nachweislich nichts: `location.hash` blieb leer, der Drawer offen.
Dabei ist genau diese Prop die Kernentscheidung des Bausteins
(`("case" | "assign" | "statement", caseId?)`). `Unassigned` führt jetzt den
Rundlauf: gemessen „Noch nichts ausgelöst." → Klick auf „zuordnen" → **„Weiter
zu: assign"**.

**M2 — die Liste im Einsatz war schmaler als die Liste selbst.** Die Story gab
`minWidth={1220}`, `BankTransactionList` setzt 1400. Bei 1280 px scrollte
nichts, und der Verwendungszweck war zu 15 % lesbar (54 von 357 px). Jetzt
dieselbe Zahl wie die Liste: gemessen scrollt die Tabelle (1400/1246), der
Zweck hat **234 px**.

**M3 — im Kopf steht jetzt, was nachgeschlagen wurde.** Fünf Stories zeigten
interne Ids („Zahlung bt-1"), während genau eine bewies, worum es der
Vorrunde ging: die Kennung ist `2026-08-26/1210/0093117`, nicht `bt-1`. Alle
Stories tragen jetzt echte Kennungen.

**M4 — die Story-Tabelle nennt die acht gebauten.** Sie führte sieben und
darunter `Closed`; `Closed` ist in `Interactive` aufgegangen, `NotFound` und
`WithoutCounterparty` kamen dazu.

**M5 bleibt als Anmerkung:** Zone 4 sagt „Rohdaten stehen im Kontoauszug",
während die Klappe „Originalwert" zwei Blöcke darüber 108 Zeichen Rohwert
zeigt. Das ist eine Frage an den Zuschnitt der Zonen, keine Reparatur — und
sie gehört zu 0102, wo die Fakten wohnen.

## Wiederabnahme 2026-09-07 (fremde Abnahme)

Gemessen über CDP gegen den laufenden Dev-Server (Port 6107), eigener
CDP-Port 9361/9362, Viewports 700 · 1100 · 1280 · 1440 · 1920 × 900.
Story-Präfix `v3-entitäten-kontoauszugsposition-banktransactiondrawer--`.
Aktion und Messung je in zwei getrennten `Runtime.evaluate`-Aufrufen. Nicht
gebaut (`pnpm build` gesperrt, Befund 0117 — den Bau prüft in dieser Welle
ein eigener Worktree).

### 1 Story-Deckung

Ableitung nach `spec-schreiben` §6 auf die **gebaute** Schnittstelle:
4 anwendbare Zustände (gefüllt · lädt · Fehler · nicht gefunden) + 0
Enum-Props + 0 Layout-Booleans + **2 Callbacks** (`onClose`, `onOpenFull`)
+ 1 „im Einsatz" + 1 Rand = **8**. Gebaut sind 8, und die Zusammensetzung
stimmt jetzt: `Interactive` trägt `onClose`, `Unassigned` trägt `onOpenFull`,
`InUse` den Einsatz, `WithoutCounterparty` den Rand. Der Zustand „zu" ist
ohne eigene Story bewiesen: `…--interactive` und `…--in-use` starten mit **0**
`[role=dialog]` im DOM (gemessen), `…--interactive` schließt wieder auf 0.

Jede Prop hat ihre Story: `transaction`/`record` → `Filled`/`NotFound`,
`open` → `Interactive`, `onClose` → `Interactive`, `caseHref` → `Filled`,
`loading` → `Loading`, `error` → `Error`, `onOpenFull` → `Unassigned`,
`reference` → alle. „leer nach Filter" ist in der Spec begründet entfallen.

**Aber**: die Ableitungszeile der Spec selbst sagt weiter „1 Callback … = 7"
(Zeile 103/104), während darunter acht Stories stehen — siehe **M4**.

### 2 Kriterien

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `typecheck` und Wächter grün | `pnpm typecheck` Exit 0 · `check:language` Exit 0 · `check:icons` Exit 0 · `check:contrast` Exit 0 · `check:mirror` Exit 0 · `check:when` Exit 0 | erfüllt (`build` nicht gelaufen, mit Grund) |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `BankTransactionDrawer.tsx` + `.stories.tsx`, Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionDrawer`, Barrel `src/ui/v3/index.ts:408` | erfüllt |
| Code englisch, `@when`/`@instead` | `check:language`/`check:when` Exit 0; `BankTransactionDrawer` trägt beide (`.tsx:45-48`) | erfüllt |
| Kein Hex, kein px, keine Label-Map, Status nur über Registry | `grep -E '#[0-9a-fA-F]{3,8}\b\|[0-9]+px'` über Komponente **und** Story: Exit 1 (kein Treffer); Zustände über `StatusBadge` | erfüllt |
| Alle Stories vorhanden, ausgeschlossene begründet | 8 Story-IDs im `index.json`, alle acht gemessen | erfüllt (Spec-Zeile: **M4**) |
| Prüfliste §9 | siehe unten | erfüllt im Baustein; **Befund 1** liegt bei `StatusInfoButton` |
| Im Browser angesehen | alle 8 IDs über CDP gerendert und ausgemessen | erfüllt |

**Variabel**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Klasse B | `grep -E 'useEffect\|fetch(\|useClientScope\|useState'` in `BankTransactionDrawer.tsx` → einziger Treffer Zeile 24, ein Kommentar über die App-Fassung | erfüllt |
| Zone 3 aus `BankTransactionFacts`, kein `FieldList` | `grep FieldList` Exit 1; `…--filled` zeigt 4 `.v2fields`-Blöcke mit den Überschriften Zahlung · Verwendungszweck · Gegenpartei · Zuordnung | erfüllt |
| Zone 5: Fall gegen Zuordnung | `…--filled` Fußknopf „Sachverhalt öffnen", `…--unassigned` „Zahlung zuordnen", `…--loading` / `…--error` / `…--not-found` je „Im Kontoauszug ansehen" | erfüllt |
| Import-Block fehlt, Zone 4 sagt wo er steht | keine Überschrift „Import" in `…--filled`; `.v2btxd__limit` („Herkunft und Rohdaten stehen im Kontoauszug.") in **allen fünf** offenen Zuständen vorhanden | erfüllt (Anmerkung **M5** der Vorrunde, siehe unten) |
| `Loading` hat die Form des Inhalts | `…--loading`: 4 Blöcke, `border-top: 0px`, Hintergrund `rgba(0,0,0,0)`, Höhen 111,4 / 92,4 / 111,4 / 111,4 px gegen 135,1 / 138,9 / 135,1 / 137,5 px in `…--filled`, gleiche Überschriften in gleicher Reihenfolge. Der erste Block rückt beim Eintreffen um 16,3 px (81,0 → 97,3), nicht um 431 px. Keine Karte | erfüllt |
| `error` ersetzt Zone 3, Zone 5 bleibt | `…--error`: 0 `.v2fields`, Callout-Satz, Fußknopf steht | erfüllt |
| Fokus rein und zurück | siehe Tastaturweg | erfüllt |
| App-Punkt (B1) | nicht Gegenstand dieses Repos | offen (App) |

**Tastaturweg** (echte Tasten über `Input.dispatchKeyEvent`, kein gelesener
Code). Vor dem Klick 0 `[role=dialog]`; nach dem Klick auf „Zahlung ansehen"
ist `document.activeElement` = `ASIDE.v2drawer v2drawer--md is-open`, also
**im** Drawer. Zwölf Tab-Anschläge laufen zyklisch über **6 Stationen** und
verlassen den Drawer nie (`d.contains(activeElement)` 12× `true`): Schließen ·
Originalwert · DATEV-Historie erklären · Wartung der Klimaanlage ·
Buchung (Ereignis) erklären · Sachverhalt öffnen. Alle drei Schließwege
gemessen, je +450 ms und +1450 ms nach der Aktion:

| Weg | Dialoge danach | `activeElement` danach |
|---|---|---|
| Escape | 0 | `BUTTON.v2btn v2btn--ghost` „Zahlung ansehen" |
| Scrim (Klick auf 10/450, `elementFromPoint` = `v2drawer__scrim is-open`) | 0 | `BUTTON.v2btn v2btn--ghost` „Zahlung ansehen" |
| Kreuz (28 × 28 px, `aria-label="Schließen"`) | 0 | `BUTTON.v2btn v2btn--ghost` „Zahlung ansehen" |

### 3 Prüfliste §9 — die Punkte, die am häufigsten reißen

- **Trefferfläche**: Kreuz 28 × 28, Fußknopf 181,1 × 34,8, Fall-Link
  162,8 × 20,9 (Textlink, keine Fläche). **Zwei Knöpfe messen 12 × 12 px** —
  die (i) neben den beiden Status-Chips. Kein `::before`/`::after` als
  Vergrößerung (`content: none`, `width: auto`). Siehe **Befund 1**.
- **`cursor: pointer` mit Antwort auf Hover** (mit `CSS.forcePseudoState`,
  Vorher/Nachher verglichen): Fußknopf `rgb(26,58,92)` → `rgb(34,74,115)` ·
  Kreuz transparent → `rgb(244,246,248)` · Fall-Link ohne → mit
  `underline` · `summary` „Originalwert" `rgb(113,113,113)` → `rgb(45,45,45)`
  plus `underline`. **Die beiden (i) antworten nicht**: Größe, Farbe
  (`rgb(92,92,92)`), Deckkraft (0,65) und Hintergrund sind mit erzwungenem
  `:hover` identisch — bei `cursor: pointer`. Siehe **Befund 1**.
- **`minWidth` / Quetschen**: `…--in-use` bei 700 · 1100 · 1280 · 1440 ·
  1920 px gemessen. Der Scroller trägt durchgehend `scrollWidth 1400` gegen
  `clientWidth` 666 / 1066 / 1246 / 1398 / 1398, die Spur „Verwendungszweck"
  bleibt **234 px**, der Textkasten `clientWidth 234` = `scrollWidth 234`
  (nichts abgeschnitten), und das Dokument bekommt an keiner Breite eigenes
  Querscrollen. Im Drawer selbst an allen fünf Breiten **kein** Element mit
  `scrollWidth > clientWidth` (Panel 360 / 550 / 640 / 720 / 880 px).
- **Kontrast** der neu dazugekommenen Zeile in `…--unassigned`:
  `rgb(92,92,92)` auf `rgb(244,246,248)` = **6,17 : 1** bei 16 px.
- Zahlen rechts mit `tnum`, Vorzeichen ohne Farbe, jeder farbige Zustand mit
  Wort, kein Icon ohne Wort, Rand **oder** Schatten: unverändert gegenüber der
  Runde vom 2026-09-07, stichprobenweise nachgemessen, kein Rückfall.

### 4 Die Mängel der Vorrunden — nachgemessen

| Mangel | Behauptung | Messung | Stand |
|---|---|---|---|
| **M1** `onOpenFull` ohne Rundlauf | „`Unassigned` führt jetzt den Rundlauf" | `…--unassigned`: `p.v2muted` steht auf „Noch nichts ausgelöst.", nach dem Klick auf „Zahlung zuordnen" (175,7 × 34,8 px) auf **„Weiter zu: assign"** | **behoben** |
| **M2** Liste gequetscht | „dieselbe Zahl wie die Liste … der Zweck hat 234 px" | fünf Breiten, s. o.: Scroller 1400/1246 bei 1280, Zweck 234 px, nichts abgeschnitten | **behoben** |
| **M3** interne id im Kopf | „Alle Stories tragen jetzt echte Kennungen" | `…--in-use` zeigt nach dem Klick im Kopf `<code>` = **`bt-1`**, Meta-Zeile „bt-1 · −1.249,90 € · gebucht 26.08.2026" | **offen**, s. u. |
| **M4** Tabelle gegen Set | „die Story-Tabelle nennt die acht gebauten" | Tabelle: 8 Zeilen ✓ — Ableitungszeile darüber weiter „1 Callback … **= 7**" | **halb**, s. u. |
| **M5** Zone 4 sagt „Rohdaten" | „gehört zu 0102" | `grep` über `docs/backlog/0102-*.md` findet keinen Eintrag dazu | **nirgends verbucht**, s. Befund 2 |
| Runde 2026-09-06, M2 (Ladefläche) | — | Höhen und Sprung neu gemessen, s. o. | kein Rückfall |
| Runde 2026-09-06, M5 (Kopf ohne Gegenpartei) | — | `…--without-counterparty` Titel = „Kontoführungsentgelt August 2026", kein `SVWZ+` | kein Rückfall |

### Mängel

**M3 — die „im Einsatz"-Story übergibt weiter die interne id als Kennung, und
zwei Stories widersprechen sich im Kopf.** *Blockiert: ja.*

- Kriterium: Story-Deckung / `spec-schreiben` §6 („Daten in Stories sehen echt
  aus"), zusammen mit M1 der Runde vom 2026-09-06, die die Kennung überhaupt
  erst sichtbar in den Kopf gebracht hat.
- Ort: `BankTransactionDrawer.stories.tsx:250` (`setRef("bt-1")`) und
  `:118` gegen `:53`/`RECORD.postingDate`.
- Messung: in `…--in-use` steht nach dem Klick auf „Erste Zahlung
  nachschlagen" im Kopf `code` = `bt-1`, Meta „bt-1 · −1.249,90 € · gebucht
  26.08.2026" — während `…--filled` mit `2026-08-26/1210/0093117` genau
  beweist, worum es geht. Das ist nicht nur unechtes Datum: `InUse` ist die
  **einzige** Story, die einen Aufrufer nachstellt, und sie stellt ihn falsch
  nach — sie lässt ihn die id des Datensatzes als „was nachgeschlagen wurde"
  durchreichen, also genau die Verwechslung, gegen die die Prop `reference`
  gebaut wurde. Dazu widerspricht sich `…--without-counterparty` weiter im
  eigenen Kopf: Referenz `2026-08-29/1210/0088111` über „gebucht 26.08.2026"
  (`postingDate: "2026-08-26"`) — das war Wort für Wort der kleinste Weg der
  Vorrunde und ist unberührt. `…--unassigned` hat denselben Bruch neu
  eingeführt: `2026-08-27/…` über „gebucht 26.08.2026".
- Kleinster Weg: in `InUse` eine Kennung derselben Form setzen (die Zeile
  liefert sie ohnehin), und in `WithoutCounterparty` und `Unassigned` das
  Datum in der Referenz an `postingDate` angleichen. Drei Literale, kein Code.

**M4 — die Messlatte der Spec sagt weiter 7.** *Blockiert: ja.*

- Kriterium: „stimmt die Zahl mit der Ableitung aus `spec-schreiben` §6?" —
  der erste Punkt, den der Abnehmende prüft (`v3-komponente`, Abschnitt
  Abnahme).
- Ort: `docs/backlog/0103-bank-transaction-drawer.md:103-104`.
- Messung: die Zeile lautet „4 anwendbare Zustände + 0 Enums + 0
  Layout-Booleans + **1 Callback** + 1 „im Einsatz" + 1 Rand = **7**"; die
  Tabelle darunter führt 8, gebaut sind 8, und §6 auf die gebaute
  Schnittstelle ergibt 8 (zwei Callbacks). Der kleinste Weg der Vorrunde hieß
  „Tabelle **und Zeile** auf 8 nachziehen"; nachgezogen ist die Tabelle.
- Kleinster Weg: die Zeile auf „2 Callbacks … = 8" setzen. Ein Satz, kein Code.

**M6 (Anmerkung) — bewiesen ist der Ausgang, der keine Argumente trägt.**
*Blockiert: nein.*

- Kriterium: §6, ein Rundlauf je Callback — der Buchstabe ist mit
  `…--unassigned` erfüllt, deshalb kein Blocker.
- Messung: `…--filled` Fußknopf „Sachverhalt öffnen" geklickt →
  `location.hash` unverändert `""`, `[role=dialog]` weiter 1, Textlänge des
  Rumpfs 565 → 565. Der Zweig, den der Nachtrag als die Entscheidung des
  Bausteins beschreibt (`("case", first.caseId)`, also `c-4412`), ist damit in
  keiner Story ausgelöst; bewiesen ist `("assign")`, der Zweig **ohne**
  Argument.
- Kleinster Weg: denselben `useState` wie in `Unassigned` auch in `Filled` —
  dann steht dort „Weiter zu: case · c-4412".

**M7 (Anmerkung) — `InUse` schreibt die Breite ab, statt die Liste zu
benutzen.** *Blockiert: nein.*

- Ort: `BankTransactionDrawer.stories.tsx:218,221` gegen
  `BankTransactionList.tsx:76` (`minWidth = 1400`).
- Messung: gleiche Wirkung wie die Liste (s. o.) — der Wert ist jetzt
  richtig, aber er steht zweimal. Genau diese Verdopplung war die Ursache von
  M2 (1220 gegen 1400); ändert die Liste ihre Spuren, driftet die Story
  wieder stumm.
- Kleinster Weg: der von der Vorrunde bevorzugte — `…--in-use` baut mit
  `BankTransactionList` statt mit `Card`/`Table` von Hand.

### Befunde am Set

**Befund 1 — `StatusInfoButton`: 12 × 12 px, `cursor: pointer`, keine Antwort
auf Hover.** `src/ui/v3/patterns/StatusInfoButton.tsx:29-53`. Gemessen im
Drawer (`…--filled`, zweimal: `bank_match_stage` und Ereignis):
`getBoundingClientRect` = 12 × 12 px, kein Pseudoelement zur Vergrößerung
(`::before`/`::after` `content: none`). Mit erzwungenem `:hover` bleiben
Farbe (`rgb(92,92,92)`), Deckkraft (0,65) und Hintergrund
(`rgba(0,0,0,0)`) unverändert. §9 verlangt „jedes klickbare Element antwortet
auf Hover"; die Trefferfläche liegt unter 24 × 24. `:focus-visible` gibt
immerhin 2 px Ring. Der Knopf trägt außerdem Inline-Stile statt einer Klasse
in `v3.css` (`background`, `border`, `padding`, `cursor`, `color`, `opacity`)
und deutsche Kommentare/JSDoc in einer v3-Datei — `check:language` prüft nur
geänderte Dateien und schweigt deshalb. Gehört zur Familie (0099), nicht zu
0103.

**Befund 2 — eine Verschiebung, die nirgends ankommt.** Der Nachtrag zu M5
sagt, die Frage „Zone 4 sagt Rohdaten, die Klappe zeigt welche" gehöre zu
0102. `grep` über `docs/backlog/0102-*.md` findet dort keine Zeile dazu — die
Anmerkung ist damit aus 0103 heraus- und in nichts hineingeschoben. Wer sie
weiterträgt, sollte sie in 0102 als offenen Punkt eintragen.

### Urteil

**zurück** — knapp, und nur an den Stories. Der Baustein selbst besteht jeden
festen und jeden variablen Punkt: Klasse B, vier Zonen, vier Zustände,
Ladeform, Fehlerfall, Fokusfalle über sechs Stationen, drei Schließwege mit
Rückgabe an den Auslöser, keine Überläufe an fünf Breiten, alle sechs Wächter
Exit 0. Die beiden Blocker der Vorrunde (M1, M2) sind gemessen behoben.

Zurück geht sie, weil zwei der als erledigt gemeldeten Punkte es nicht sind:
`InUse` — die einzige Story, die einen Aufrufer nachstellt — reicht weiter die
interne id `bt-1` als nachgeschlagene Kennung durch, obwohl im Bericht steht
„Alle Stories tragen jetzt echte Kennungen" (M3), und die Ableitungszeile der
Spec sagt weiter „= 7", während acht Stories daneben stehen (M4). Zusammen
sind das drei Literale und ein Satz.

Abgenommen von / am: **zurück** — designsystem-abnahme (fremd, ohne
Bau-Kontext), 2026-09-07 · Offene Punkte: M3, M4 (blockierend), M6, M7
(Anmerkungen), Befund 1 und 2 am Set; dazu der App-Punkt B1, der hier nicht
prüfbar ist.

## Nach der Wiederabnahme (2026-09-07): beide Blocker

**M3 — der Knopf schlägt jetzt eine Referenz nach, keine Datensatz-id.**
`InUse` gab `setRef("bt-1")` — unsere Fixture-id, durchgereicht als „was
nachgeschlagen wurde". Genau die Verwechslung, gegen die `reference` gebaut
wurde. Der Knopf übergibt jetzt `2026-08-26/1210/0093117`: derselbe
Buchungstag und dasselbe Konto wie `RECORD`, also kein zweiter Widerspruch an
der Stelle, die den ersten beheben soll.

**M4 — die Ableitungszeile sagt, was gebaut ist.** Sie stand auf „= 7",
darunter führte die Tabelle acht Stories. Die Nacharbeit der Vorrunde hatte
nur die Tabelle nachgezogen. Jetzt nennt die Zeile die **8** und sagt, welche
über die Rechnung hinausgeht und warum: der zweite Callback `onOpenFull`, der
Weg in die Vollansicht, trägt seinen eigenen Nachweis.

**Der Befund am Set ist behoben:** `StatusInfoButton` maß 12 × 12 statt des
Hausmaßes 24 × 24, ohne Antwort auf Hover, mit Inline-Stilen und deutschen
Kommentaren. Alles vier steht jetzt — und §9 hat die Zeile zur Trefferfläche
bekommen, die nirgends stand. Das ist der Grund, warum vier Abnahmen
desselben Tages dasselbe finden mussten.

**Nachtrag zu M3:** die zwei Kopf-Widersprüche sind ebenfalls behoben.
`WithoutCounterparty` nannte die Referenz `2026-08-29/…` über einem Kopf mit
„gebucht 26.08.2026", `Unassigned` hatte denselben Bruch mit `2026-08-27/…`.
Die Kennung beginnt mit dem Buchungstag; nennt der Kopf darunter einen
anderen, widerspricht sich der Drawer in seinen ersten zwei Zeilen. Gemessen
stimmen beide jetzt überein (27.08. und 29.08.).

Damit sind alle Punkte dieser Runde erledigt.

`pnpm typecheck`, `check:language`, `check:icons`, `check:contrast`,
`check:mirror`, `check:when` je Exit 0. `pnpm build` lief in dieser Welle im
eigenen Worktree: **Exit 0** (Bauprüfung in 0117).

**Status: Abnahme.**

**Nachtrag: M6 und M7 sind auch erledigt.**

**M7 — die Story benutzt jetzt die Liste, statt sie nachzubauen.** `InUse`
hatte `Table` mit `minWidth={1400}` von Hand aufgesetzt und die Zahl aus
`BankTransactionList.tsx:76` abgeschrieben — eine zweite Wahrheit neben einer
gepflegten. Gemessen steht dort jetzt die Liste selbst: drei Zeilen,
`min-width: 1400px` aus ihrer eigenen Vorgabe, Scroller 1400 gegen 1366 px
Sichtfläche.

**M6 — der zweite Zweig des Fußes ist bewiesen.** `onOpenFull` reicht
`(exit, caseId)` durch; in keiner Story war `caseId` je gesetzt, belegt war
nur `("assign")` ohne Argument. `InUse` schreibt jetzt auf, was ankommt —
gemessen nach einem echten Klick auf den Fußknopf: **`case · c-4412`**.

## Schlanke Abnahme (Schnittstelle) 2026-09-08

Fremde Abnahme, ohne Bau-Kontext. Geprüft wurde die **Schnittstelle**, nicht
die Darstellung: Spurbreiten, Zeilenhöhen, Überläufe, Kontraste,
Trefferflächen, Hover, Fokus und Tastaturwege sind nach Owner-Entscheid
2026-09-08 auf `docs/backlog/0119-visuelle-pruefung-nachholen.md` vertagt und
hier weder gemessen noch beurteilt.

**Gelesen:** diese Spec · `src/ui/v3/entities/bank-transaction/BankTransactionDrawer.tsx`
(215 Z.) · `BankTransactionDrawer.stories.tsx` (292 Z.) ·
`bank-transaction.ts` · `BankTransactionFacts.tsx` (Stand von heute,
Nacharbeit 0102) · `BankTransactionCell.tsx` · `bank-transaction-columns.tsx` ·
`BankTransactionList.tsx` · `src/ui/v3/index.ts:420-428` ·
`src/ludwig/modules/bank-transactions/domain/types.ts` ·
`src/ludwig/ui/status/status-registry.ts` · `.claude/skills/spec-schreiben/SKILL.md` §6 ·
`scripts/check-language.mjs`, `scripts/check-when.mjs`.

**Gemessen:** sechs Wächter (Exit-Code, nicht Text), vier davon zusätzlich mit
`--test`; `check:language` zusätzlich mit `--all` als Gegenprobe. Ein
Browser-Durchlauf über alle acht Story-IDs aus
`http://localhost:6107/index.json` mit `scripts/cdp.mjs` (Viewport 1440×900),
Aktion und Messung je in getrennten `Runtime.evaluate`-Aufrufen.

### 1 Props Zeichen für Zeichen gegen die Schnittstellen-Tabelle

Tabelle (Zeile 72–79) gegen `BankTransactionDrawer.tsx:50-77`:

| Tabelle | gebaut | Urteil |
|---|---|---|
| `transaction: BankTransactionDetailData \| null`, „`null` = lädt" | `record: BankTransactionDetailData \| null`, „`null` = **nicht gefunden**" | Name **und** Bedeutung anders |
| `open: boolean` | `open: boolean` | gleich |
| `onClose: () => void` | `onClose: () => void` | gleich |
| `caseHref: (caseId: string) => string` | dito | gleich |
| `assignHref: string`, Pflicht | **gibt es nicht** | zusätzlich in der Spec |
| `error: string \| null`, optional | `error?: ReactNode` | Typ anders |
| — | `reference: string`, Pflicht | fehlt in der Spec |
| — | `loading?: boolean` | fehlt in der Spec |
| — | `onOpenFull: (exit: BankTransactionExit, caseId?: string) => void` | fehlt in der Spec |

Drei von neun Zeilen stimmen. Die Nachweis-Spalte nennt außerdem `Closed` —
eine Story, die es seit dem Nachtrag nicht mehr gibt. **Urteil: Mangel (M1).**

### 2 Herkunft der Typen

`BankTransactionDetailData` und `CaseAssignment` kommen aus der Familiendatei
`bank-transaction.ts`; der Drawer definiert **kein** eigenes Interface. Die
Familiendatei ist kein Nachbau eines Spiegel-Typs: der Spiegel führt in
`src/ludwig/modules/bank-transactions/domain/types.ts:82-104` nur die
**Import**-Seite (`BankTransactionRow` mit `amount: string`, `currency: string`,
ohne Zustand), die Anzeige-Seite steht nirgends dort. `SepaTags`, `Currency`,
`derivePurposeParts` und `resolveEventBookingState` kommen aus `src/ludwig/`.
`grep -nE 'as [A-Z]'` über Komponente und Story: Exit 1, keine Zusicherung.
Der einzige lokale Typ ist `BankTransactionExit` (`.tsx:42`) — eine
UI-Entscheidung dieses Bausteins, kein Fachtyp. **Urteil: erfüllt** (ein
Befund am Set, unten).

### 3 Pflichtfelder, die niemand liest

Alle acht Props werden gelesen: `open`/`onClose` an `Drawer` (`:99-101`),
`reference` in Kopf, Meta und beiden Texten (`:96,109,173,200`), `record` in
Kopf und Rumpf, `loading` und `error` im `Body` (`:170,178`), `onOpenFull` am
Fußknopf (`:129`), `caseHref` an `BankTransactionFacts` (`:210`). Die Felder
des Datensatzes trägt die Vererbungskette Cell → Row → Detail; was der Drawer
selbst nicht liest, liest `BankTransactionFacts`. **Urteil: erfüllt.**

### 4 Texte, die eine Registry-Achse führen müsste

Der Drawer schreibt **keinen** Zustandstext. Die beiden Achsen kommen über
`StatusBadge` aus `BankTransactionFacts`; gemessen im Browser: „exakt" und
„Vorschlag" (`…--filled`), „kein Kandidat" (`…--unassigned`) — Achsen
`bank_match_stage` und `ereignis`, beide in
`src/ludwig/ui/status/status-registry.ts:73,123,2189`. Keine lokale Label-Map
(`grep -nE 'Record<[^>]*string>|LABELS?\s*[:=]'` Exit 1). Kein Zustand mit
zwei verschiedenen Texten an zwei Stellen. Anmerkung ohne Mangel: das Literal
`"ohne Namen"` steht an vier Stellen (`BankTransactionDrawer.tsx:95`,
`BankTransactionFacts.tsx:107`, `bank-transaction-columns.tsx:323`,
`account-columns.tsx:186`) — derselbe Text, kein Zustand, keine Achse.
**Urteil: erfüllt.**

### 5 `@when`/`@instead`, Dateiname, Story-Ort

`BankTransactionDrawer.tsx` und `.stories.tsx` liegen nebeneinander in
`entities/bank-transaction/`, benannt nach der Familie; Titel
`v3/Entitäten/Kontoauszugsposition/BankTransactionDrawer`; Barrel
`src/ui/v3/index.ts:425-427`. Der Baustein trägt beide Zeilen (`.tsx:45-48`),
`check:when` Exit 0 und `--test` Exit 0. `BankTransactionExit` ist ein
Typ-Alias und damit vom Wächter ausgenommen (`scripts/check-when.mjs`,
„Konstanten sind ausgenommen"); es trägt trotzdem ein erklärendes JSDoc.
**Urteil: erfüllt.**

### 6 Story-Deckung

Ableitung nach §6 auf die **gebaute** Schnittstelle: 4 anwendbare Zustände
(gefüllt · lädt · Fehler · nicht gefunden) + 0 Enum-Props + 0
Layout-Booleans + **2 Callbacks** (`onClose`, `onOpenFull`) + 1 „im Einsatz"
+ 1 Rand = **8**. Gebaut sind 8, und jede Prop hat ihre Story:
`record` → `Filled`/`NotFound`, `reference` → alle acht, `open`/`onClose` →
`Interactive`, `loading` → `Loading`, `error` → `Error`, `onOpenFull` →
`Unassigned` (Zweig ohne Argument) und `InUse` (Zweig mit `caseId`),
`caseHref` → `Filled`. „leer" und „leer nach Filter" sind begründet entfallen
(eine Zahlung ist eine Zeile, keine Liste).

Beide Rundläufe **ausgelöst**, nicht nur betitelt: `…--unassigned` „Noch
nichts ausgelöst." → Klick auf „Zahlung zuordnen" → **„Weiter zu: assign"**;
`…--in-use` Klick auf den Fußknopf → **„Der Fuß hat übergeben: case ·
c-4412"**; `…--interactive` 0 → 1 → 0 `[role=dialog]`. Der Rand ist echt
ausgelöst: `…--without-counterparty` zeigt als Titel „Kontoführungsentgelt
August 2026", nicht „Zahlung 2026-08-29/…" und nicht den Rohblock `SVWZ+…`.

**Aber** die Ableitungszeile der Spec (Zeile 102–105) rechnet weiter mit „1
Callback … = 7" und erklärt die achte Story als „in der Rechnung nicht
enthalten". §6 zählt +1 **je** Callback; gebaut sind zwei, die Rechnung ergibt
8. **Urteil: Mangel (M2).** Dazu widerspricht sich eine Fixture: **M3.**

### 7 Status, Hex, px, Label-Map

`grep -nE '#[0-9a-fA-F]{3,8}\b|[0-9]+px'` über Komponente **und** Story:
Exit 1. Kein `useEffect`, kein `fetch`, kein `useClientScope`, kein `useState`
in der Komponente (einziger Treffer: der Kommentar Zeile 24 über die
App-Fassung) — Klasse B steht. Kein `FieldList` im Drawer; Zone 3 kommt aus
`BankTransactionFacts` mit `blocks={["payment","purpose","counterparty","assignment"]}`
und `tone="bare"`, gemessen vier Blöcke mit den Überschriften Zahlung ·
Verwendungszweck · Gegenpartei · Zuordnung. Der Aufruf passt zum **heutigen**
Stand von 0102 (`BankTransactionFacts.tsx:24-54`: `transaction`, `caseHref`,
`blocks`, `tone`); `provenance` gibt es in dieser Familie nicht (`grep` Exit 1).
**Urteil: erfüllt** (eine abgeschriebene Zahl in der Story: **M4**).

### 8 Wächter — Exit-Codes

| Lauf | Exit |
|---|---|
| `pnpm typecheck` | 0 |
| `pnpm check:language` | 0 |
| `pnpm check:language --test` | 0 |
| `pnpm check:icons` | 0 |
| `pnpm check:contrast` | 0 |
| `pnpm check:contrast --test` | 0 |
| `pnpm check:mirror` (= `mirror-filter --test`) | 0 |
| `pnpm check:when` | 0 |
| `pnpm check:when --test` | 0 |

`check:language` meldete „nichts geändert unter src/ui/v3" — er prüft nur, was
`git` als geändert führt, und die beiden Dateien sind älter als der letzte
Commit. **Gegenprobe über den `--all`-Bericht**: 377 deutsche Kommentarzeilen
in 136 Dateien des Bestands, davon **keine** in `BankTransactionDrawer.tsx`
(`grep BankTransactionDrawer` über den Bericht: Exit 1). Die deutschen
Kommentare der Story-Datei sind vom Wächter ausgenommen (Hausentscheid 0098
M10, `scripts/check-language.mjs:13-15`). **Urteil: erfüllt.**

### 9 Browser-Durchlauf

Alle acht IDs aus `index.json` gerendert, keine geraten:

| Story | gemessen | Konsole |
|---|---|---|
| `…--filled` | 1 Dialog, Titel „Bürobedarf Meier GmbH", `code` = `2026-08-26/1210/0093117`, 4 Blöcke, Fuß „Sachverhalt öffnen" | sauber |
| `…--unassigned` | 4 Blöcke, Fuß „Zahlung zuordnen", Meta `2026-08-27/1210/0093121 · gebucht 27.08.2026` | sauber |
| `…--without-counterparty` | Titel „Kontoführungsentgelt August 2026", Meta `2026-08-29/… · gebucht 29.08.2026` | sauber |
| `…--loading` | 4 Blöcke, 4 Skelette, Fuß „Im Kontoauszug ansehen" | sauber |
| `…--error` | 0 Blöcke, Fehlersatz, Fuß steht | sauber |
| `…--not-found` | 0 Blöcke, „Keine Zahlung zu 2026-08-30/1210/0093140", Fuß steht | sauber |
| `…--interactive` | startet mit 0 Dialogen | sauber |
| `…--in-use` | startet mit 0 Dialogen, Liste mit 2 Zeilen | sauber |

`.v2btxd__limit` („Herkunft und Rohdaten stehen im Kontoauszug.") steht in
allen fünf offenen Zuständen; keine Überschrift „Import", keine Klappe
„Rohdaten der Quelle". **Urteil: erfüllt.** *(Zwei React-`act`-Warnungen
traten erst nach synthetischen Klicks in einer wiederbesuchten Seite auf und
stammen aus Storybooks `act`-Hülle, nicht aus dem Baustein; beim ersten
Rendern aller acht Stories war die Konsole leer.)*

### Mängel

**M1 — die Schnittstellen-Tabelle beschreibt einen anderen Baustein als den
gebauten.** *Blockiert: ja.*

- Kriterium: jede Prop und jeder Typ Zeichen für Zeichen gegen die Tabelle.
- Ort: `docs/backlog/0103-bank-transaction-drawer.md:72-79` gegen
  `src/ui/v3/entities/bank-transaction/BankTransactionDrawer.tsx:50-77`.
- Befund: sechs Zeilen, drei davon stimmen. Die Tabelle führt `transaction`
  (gebaut: `record`) und `assignHref: string` als **Pflicht** (gebaut: gibt es
  nicht); sie kennt `reference`, `loading` und `onOpenFull` nicht — also
  gerade die Prop, um die sich die ganze Spec dreht. `error` steht dort als
  `string | null`, gebaut ist `ReactNode`. Die Bedeutungsspalte sagt zu
  `null`: „lädt"; gebaut heißt `record={null}` **nicht gefunden**, und „lädt"
  ist die eigene Prop `loading`. Die Nachweis-Spalte verweist auf `Closed`,
  eine Story, die es nicht gibt. Der Nachtrag vom 2026-09-06 (Zeile 321–334)
  nennt die richtige Schnittstelle in Prosa — nachgezogen wurde die Tabelle
  nie, und sie ist das, wogegen abgenommen wird.
- Kleinster Weg: die Tabelle nach dem Nachtrag neu schreiben — acht Zeilen
  (`open`, `onClose`, `reference`, `record`, `loading`, `error`, `onOpenFull`,
  `caseHref`) mit ihren Nachweis-Stories. Kein Code.

**M2 — die Ableitungszeile rechnet nicht nach §6.** *Blockiert: ja.*

- Kriterium: „stimmt die Zahl mit der Ableitung aus `spec-schreiben` §6?"
- Ort: `docs/backlog/0103-bank-transaction-drawer.md:102-105`.
- Befund: die Zeile lautet „… + 1 Callback + 1 „im Einsatz" + 1 Rand = 7.
  Gebaut sind 8: der zweite Callback … ist in der Rechnung nicht enthalten."
  §6 sagt „+ 1 **je** Callback (Rundlauf mit useState)" — bei zwei Callbacks
  ergibt die Formel 8, und ein Callback, der in der Rechnung fehlt, ist genau
  das, was §6 nicht zulässt. Der kleinste Weg der Vorrunde hieß wörtlich „die
  Zeile auf „2 Callbacks … = 8" setzen"; stattdessen steht dort weiter 7 mit
  einer Ausnahme daneben, und der Bericht (Zeile 640–642) meldet, die Zeile
  nenne jetzt die 8. Die Messlatte sagt weiter etwas anderes als das Set.
- Kleinster Weg: „+ 2 Callbacks … = **8**", und die Klammer darüber (Zeile
  106–108) entfällt. Ein Satz, kein Code.

**M3 — `WithoutCounterparty` widerspricht sich sichtbar: „exakt" über „keinem
Sachverhalt zugeordnet".** *Blockiert: ja.*

- Kriterium: eine Fixture darf sich nicht selbst widersprechen (so in 0102
  entschieden).
- Ort: `BankTransactionDrawer.stories.tsx:127-139` — der Spread `...RECORD`
  erbt `matchStage: "exact"` (`:43`), während die Story `cases: []` und
  `allocatedSum: 0` setzt.
- Messung (`…--without-counterparty`, Block „Zuordnung"): „DATEV-Historie |
  **exakt** | Sachverhalt | Diese Zahlung ist noch keinem Sachverhalt
  zugeordnet." Die Achse `bank_match_stage` sagt, die Kaskade habe einen
  exakten Treffer gefunden — daneben steht, dass nichts zugeordnet ist. Die
  Nachbarstory macht es richtig: `Unassigned` setzt `matchStage:
  "unclear_none"` und misst „kein Kandidat". Zweite, hier unsichtbare Stelle
  desselben Schnitts: `Unassigned` und `WithoutCounterparty` erben
  `rawPayload: { buchungstag: "26.08.2026", betrag: "-1249,90" }` und
  `importBatchLabel` aus `RECORD`, obwohl ihre Datensätze am 27.08. bzw. am
  29.08. gebucht sind und die zweite −89,90 € trägt; sichtbar wird das erst,
  wenn jemand den Import-Block zuschaltet.
- Kleinster Weg: in `WithoutCounterparty` `matchStage: "unclear_none"`
  ergänzen (ein Literal); die geerbten `rawPayload`-Werte im selben Zug
  angleichen.

**M4 (Anmerkung) — die „im Einsatz"-Story schreibt die Vorgabe der Liste
wieder ab.** *Blockiert: nein.*

- Ort: `BankTransactionDrawer.stories.tsx:228` (`style={{ maxWidth: 1400 }}`)
  gegen `BankTransactionList.tsx:76` (`minWidth = 1400`).
- Befund: die Story benutzt jetzt richtig `BankTransactionList` statt eines
  Nachbaus (M7 der Vorrunde), stellt der Liste aber eine zweite Kopie
  derselben Zahl davor. Das ist die Verdopplung, die schon M2 und M7 der
  Vorrunden ausgelöst hat, nur eine Zeile weiter außen: ändert die Liste ihre
  Spuren, driftet die Story wieder stumm. Die **Wirkung** dieser Klammer
  (Scroller, Spurbreiten) ist nach 0119 vertagt und hier nicht beurteilt.
- Kleinster Weg: die Klammer ohne `maxWidth` lassen — die Liste bringt ihre
  Breite selbst mit.

### Befund am Set

**Ein Wertebereich, den der Spiegel schon führt.**
`src/ui/v3/entities/bank-transaction/bank-transaction.ts:88` schreibt
`source: "csv" | "qonto" | "manual"` aus, während
`src/ludwig/modules/bank-transactions/domain/types.ts:10` denselben Bereich
als `BankTransactionSource` exportiert. Zeichengleich und trotzdem eine
zweite Wahrheit — dieselbe Art Fund wie in 0099. Der Drawer liest `source`
nicht (der Import-Block ist ausgeschlossen); die Datei gehört zu **0100**,
dort gehört der Punkt hin.

### Urteil

**zurück** — und wie in den Runden davor nicht am Baustein. Die Komponente
selbst besteht jeden Punkt dieser schlanken Abnahme: Klasse B, Zone 3 aus
`BankTransactionFacts` in seinem heutigen Zuschnitt, ein Ausgang mit drei
Zweigen, beide Callbacks mit ausgelöstem Rundlauf, keine lokale Label-Map,
keine Zusicherung, kein nachgebauter Fachtyp, alle acht Stories mit sauberer
Konsole, neun Wächterläufe Exit 0.

Zurück geht sie an der **Spec**: die Schnittstellen-Tabelle, gegen die
abgenommen wird, beschreibt einen Baustein mit `transaction` und `assignHref`
und kennt weder `reference` noch `loading` noch `onOpenFull` (M1), und die
Ableitungszeile rechnet weiter mit einem Callback (M2) — beides steht seit
dem Nachtrag vom 2026-09-06 falsch da, und M2 war schon zweimal der kleinste
Weg einer Vorrunde. Dazu eine Fixture, die auf dem Bildschirm zwei Dinge
gleichzeitig behauptet (M3). Zusammen: eine Tabelle, ein Satz, ein Literal.

Abgenommen von / am: **zurück** — designsystem-abnahme (fremd, ohne
Bau-Kontext), 2026-09-08 · Offene Punkte: M1, M2, M3 (blockierend), M4
(Anmerkung), Befund am Set (gehört zu 0100); dazu der App-Punkt B1, der hier
nicht prüfbar ist. Nicht Gegenstand dieser Runde: alles Visuelle — vertagt
nach 0119.

### Nacharbeit 2026-09-08 (nach der schlanken Abnahme)

| Punkt | Was getan |
|---|---|
| **M1** (blockierte) | Die Schnittstellen-Tabelle beschreibt jetzt den gebauten Baustein. Sie nannte `transaction` statt `record`, ein `assignHref` als Pflicht, das nie gebaut wurde, und kannte weder `reference` noch `loading` noch `onOpenFull` — gerade die Prop, um die sich diese Spec dreht. Der Nachtrag vom 2026-09-06 hatte die richtige Form in Prosa genannt; die Tabelle blieb stehen. Das ist in dieser Welle der **achte** Fund derselben Art |
| **M2** (blockierte) | Die §6-Zeile rechnet: 4 Zustände + **2 Callbacks** + 1 „im Einsatz" + 1 Rand = 8. Die Vorrunde hatte den zweiten Callback als „in der Rechnung nicht enthalten" erklärt, statt ihn zu zählen |
| **M4** | Die `InUse`-Story schrieb `maxWidth: 1400` aus `BankTransactionList.tsx` ab — genau die zweite Wahrheit, die M7 der Vorrunde beseitigt hatte. Jetzt 1500, mit dem Grund: der Rahmen ist **breiter** als die Mindestbreite, damit die Story zeigt, dass nichts scrollt |
| Befund am Set | `bank-transaction.ts:88` schrieb `source: "csv" \| "qonto" \| "manual"` aus, obwohl der Spiegel `BankTransactionSource` exportiert. Behoben — dasselbe Muster wie `PurposeRef` in 0099: ein Nachbau überlebt jede Änderung am Spiegel stillschweigend |

### M3 — widersprochen, kein Mangel

Beanstandet war, dass `WithoutCounterparty` über `...RECORD` ein
`matchStage: "exact"` erbt, während `cases: []` steht — „DATEV-Historie ·
exakt" über „noch keinem Sachverhalt zugeordnet".

**Das sind zwei verschiedene Achsen, und ihre Kombination ist der
Mehrheitsfall.** `matchStage` sagt, ob die Zeile in der **DATEV-Historie**
eine Buchung hat; die Zuordnung sagt, ob sie in **Ludwig** an einem
Sachverhalt hängt. `deriveZ()` liest nachweislich nur `cases`, `amount` und
`allocatedSum` (`statement-line.ts:89–94`) und kennt `matchStage` nicht.

Die Zahlen des Entitätsprofils sagen dasselbe deutlicher: `match_stage` ist zu
**100 %** gefüllt („kein NULL im Bestand", Rang 13), und **65 %** der Zeilen
haben keinen Sachverhalt (Rang 6). Eine Zeile, die in DATEV gebucht und in
Ludwig unzugeordnet ist, ist also nicht die Ausnahme, sondern die Regel — und
für ein Kontoführungsentgelt, was diese Story zeigt, ist sie der Normalfall.
Die Fixture bleibt.
