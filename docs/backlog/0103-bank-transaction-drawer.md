# 0103 · BankTransactionDrawer — die Zahlung neben der Arbeit nachschlagen

| | |
|---|---|
| Status | in Arbeit — freigegeben 2026-09-06, Entscheide und Pflichtänderungen im Abschnitt „Freigabe" |
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
| `Closed` | Kein `[role=dialog]` im DOM |
| `Interactive` | Öffnen, Esc, Fokus zurück am Auslöser |
| `InUse` | Aus dem Kontoauszug heraus: die Liste bleibt hinter dem Scrim sichtbar |

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

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

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
