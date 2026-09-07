# 0103 · BankTransactionDrawer — die Zahlung neben der Arbeit nachschlagen

| | |
|---|---|
| Status | Abnahme |
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

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `transaction` | `BankTransactionDetailData \| null` | ja | Die Position. `null` = lädt | `Filled`, `Loading` |
| `open` | `boolean` | ja | Der Aufrufer hält den Zustand | `Filled`, `Closed` |
| `onClose` | `() => void` | ja | Der dritte Schließweg | `Interactive` |
| `caseHref` | `(caseId: string) => string` | ja | Zone 5 bei zugeordneter Zahlung, und für `CaseCell` in Zone 3 | `Filled` |
| `assignHref` | `string` | ja | Zone 5 bei nicht zugeordneter Zahlung. Pflicht, weil das der häufigere Fall ist | `Unassigned` |
| `error` | `string \| null` | nein | Steht statt Zone 3 | `Error` |

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
nach §6: 4 anwendbare Zustände + 0 Enums + 0 Layout-Booleans + 1 Callback +
1 „im Einsatz" + 1 Rand = 7.

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
