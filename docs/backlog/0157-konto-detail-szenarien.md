# 0157 · Die Kontoseite als Szenarien

| | |
|---|---|
| Status | **gebaut 2026-09-10**, beide Owner-Fragen am 2026-09-11 entschieden und nachgebaut — Abnahme offen (nicht durch den Bauenden) |
| Stufe | `src/showcase/account/` (Seiten-Stories; Code englisch, Owner 2026-09-10), dazu Ausbauten an `accountEntryColumns` (0067) und `AccountFacts` (0066) |
| Quelle | Design-Brief **F198** (`ludwig/app`, `docs/backlog/F198-account-detail-scenarios-design-brief.md`), überbracht von `ludwig-manager`, Owner-Freigabe 2026-09-10 |
| Präzedenz | `src/showcase/document/` (0144), `src/showcase/case/` (0152) |
| Angelegt | Claude, 2026-09-10 |

## Auftrag (Kurzfassung des Briefs)

Die komplette Kontoseite als Seiten-Stories, **19 Exporte** (K1–K12 samt K4b,
P1–P6), aus vorhandenen Bausteinen: `LedgerAccountView`/`DetailView`,
`AccountFacts`, `accountEntryColumns`, `AccountDrawer`, die Mängelzone
(0153), das Spaltenmuster `master | sidebar` (0154) und `BarChart` (0110).

**Drei Reiter:** Übersicht · Details · Rohdaten. Buchungen und Monate gehen in
die Übersicht auf; die Monatstabelle wird eine Klappe unter dem
Zwölf-Monats-Diagramm.

Alle sechs Owner-Fragen O1–O6 sind mit ihrem Default entschieden. Die
App-Befunde B1–B8 aus §10 gehören der App — hier wird nur festgehalten, was
ein Baustein **nicht** trägt.

## Was daran neu ist (und deshalb zuerst gelesen wird)

Zwei Dinge unterscheiden diese Seite von Beleg und Sachverhalt:

1. **DATEV führt, Ludwig ist das Delta.** Die Bewegungsliste trägt die
   Herkunft als **Zeileneigenschaft**, nicht als zwei Listen. Dazu ein
   Herkunftsfilter und eine Saldospalte, die nur bei **genau einer** Quelle
   erscheint — beides ist der Ausbau von 0067, den der Brief jetzt anfordert.
2. **Der Buchungssatz wird nicht neu gezeichnet.** Der Bewegungs-Drawer
   komponiert, was es gibt: `JournalEntryCompact`/`Card` (0044, 0155),
   `JournalEntryGrid` (0113), `AiBookingNotes` (0151). **Ein** Parameter
   `?entry=` für beide Quellen, `?account=` fürs Gegenkonto, `?partner=` für
   den Partner.

## Reihenfolge

Nach den offenen Wellen von 0152 (Welle 2: E2–E9, Welle 3: S1–S5 und die
Seitenzustände). Der Grund ist nicht Höflichkeit, sondern Erfahrung aus heute:
`Columns`, `OpenPoints` und `DetailView` sind an der Sachverhaltsseite
entstanden, und jede weitere Seite, die sie benutzt, prüft sie noch einmal.
Wer zwei Seiten gleichzeitig baut, merkt nicht, welche von beiden den Baustein
biegt.

## Rückfragen

An `ludwig-manager`, nicht an `ludwig-worker` (Ansage des Auftrags).

## Gebaut (2026-09-10)

**Dateien** unter `src/showcase/account/`: `AccountPage.tsx` (Rahmen aus
`DetailView` und `EntityHeader`), `fixtures.ts` (Reihen, Ableitung, bekannte
Konten), `scenarios.ts` (K1–K12), `scenario.tsx` (`ScenarioPage`: Übersicht,
Details, Rohdaten, drei Drawer), `AccountKinds.stories.tsx`
(`Seiten/Konto/Konten`, 13 Exporte), `AccountPageStates.stories.tsx`
(`Seiten/Konto/Seite`, 6 Exporte). **19 Exporte.**

**Bausteine** — additiv, nicht breaking:

- `accountEntryColumns({ balance })` und `AccountEntry.runningBalance`: die
  Saldospalte bei genau einer Quelle (B3, O5). Story `AccountEntries/Balance`.
- `AccountFacts({ figures: false })`: der Stammdaten-Satz ohne Saldo, Delta,
  Bewegungszahl und letzte Buchung (B4). Story `Account/WithoutFigures`.
- Arbeitsregister: `.v2fbar` (FilterBar) und `.pag` (Pagination) tragen jetzt
  `font-size: var(--fs-ui)` — „Zurücksetzen" und die Auslassung im Pager
  standen auf 16 px.

**Wie es gebaut ist:**

- Ein Szenario sind Reihen von Bewegungen; Saldo, Zähler und Monate leitet
  `scenario()` einmal daraus ab. Deshalb zählen Kachel, Mängelzeile und
  gefilterte Liste gleich (I12; K1: 110).
- Der Listenzustand steht im Hash (`#entry=`, `#account=`, `#partner=`,
  `#origin=`, `#q=`, `#status=`, `#month=`, `#tab=`), so wie die App ihn in
  der Query hält: ein Story-iframe lädt bei `?` neu, und `DataTable` kennt
  Zeilen nur als Links.
- Die Mängelzone rechnet `accountDefects()` im Showcase — Platzhalter für die
  fehlende Domain-Ableitung (B6, L-289).
- Die Randspalte ist `AccountFacts figures={false}` plus die B5-Felder aus dem
  Fixture-Typ `AccountMaster`; die Feldnamen sind mit `ludwig-manager` für
  F209 abgestimmt.

## Messung (CDP, 1440 × 900, sofern nicht anders genannt)

| Kriterium | Ergebnis |
|---|---|
| `pnpm typecheck`, `check:language` | grün |
| alle 19 Exporte rendern, kein Querlauf | ✓ 0 px |
| genau ein Signal in K8 und K9, keins sonst | ✓ |
| der Kopf zeigt einen Zustand | ✓ ein `StatusBadge` in `AccountPage` |
| keine leere Kennzahl | ✓ K6 „0,00 €", K7 „Nur in Ludwig 540,00 €" |
| Kachel und Filterliste zählen gleich | ✓ K1: Mängelzeile 110, `#origin=ludwig` 110, `#status=proposed` 110 |
| Saldospalte nur bei einer Quelle | ✓ K1 `ludwig` und `datev,mirrored` mit, `datev,ludwig` ohne; P5 nur im Stand „exportiert" |
| K2 paginiert | ✓ „1–50 von 3.400" |
| Zone 2 mit Weg je Zeile | ✓ K1 2, K2 2, K6 1, K7 2, K10 1; Haken-Zeile in K3, K4, K5, K8, K9, K11 |
| Drawer | ✓ Ludwig-Satz (Karte, Zustand, Begründung, große Ansicht, Weg zum Sachverhalt), DATEV-Satz (Spiegel-Zustand), Konto 1600, Partner (K4) |
| P6 bei 1024 | ✓ Randspalte unter der Hauptfläche, nichts fällt weg |
| kein Text in 16 px | ✓ bis auf den Drawer-Titel (Überschrift des Set-Drawers) |
| P1: Kopf, Kacheln und Anfang der Liste ohne Scrollen | **teilweise**: Kopf und Kacheln ✓; ohne AppShell (K1) steht die erste Datenzeile bei 834. **Im AppShell stehen seit 2026-09-11 die Stammdaten über der Liste** (Owner-Entscheid unten): Stammdaten y = 332–600, erste Datenzeile bei 1210 (1440) und 1243 (1280) statt 922 und 954 |
| Saldo nur einmal (D7, Owner 2026-09-11) | ✓ Kopf-Kennzahl bleibt, keine Saldo-Kachel; drei Kacheln, in K7 zwei („Nur in Ludwig" steht dort im Kopf) |
| Randspalte beim Umbruch über der Liste | ✓ `InUse` 1440 und 1280, `Narrow`, K1 bei 1024: Stammdaten oben; K1 bei 1440 und 1920 weiter nebeneinander |

## Abweichungen vom Brief

1. **Namen englisch** (Owner 2026-09-10): `src/showcase/account/`,
   `AccountPage.tsx`, englische Exporte; die Storybook-Titel bleiben deutsch.
2. **K1 hat die Nummer 1460, nicht 1461.** Der Brief nennt 1461 im Kopf und
   verbietet dieselbe Zahl im selben Abschnitt (grep-Regel); 1460 ist die
   SKR04-Nummer für Geldtransit.
3. **Mängel neben dem Diagramm, Kacheln in einer Reihe darunter** (`split`,
   0154: „ein Diagramm neben seinen Zahlen"). Untereinander begann die Liste
   bei y = 1100.
4. **Filterleiste ohne „nur offene Vorschläge".** Der Brief nennt Suche und
   Herkunft; `#status=proposed` erreicht man über die Kachel, und die Liste
   nennt den Filter mit „Zurücksetzen".

## Entschieden (Owner 2026-09-11, über `ludwig-manager`)

Beide Fragen „fixen":

1. **Die Randspalte bricht über die Liste.** Umgesetzt im Muster selbst:
   `main-aside` bricht mit `flex-wrap: wrap-reverse` (0154, Nachtrag) —
   einziger Aufrufer außerhalb der Pattern-Stories ist diese Seite. Der
   Preis steht in der Messung: im AppShell rückt die erste Bewegung um
   288 px nach unten.
2. **Der Saldo steht einmal, im Kopf.** Die Kachel „Saldo in DATEV" fällt;
   ohne Spiegelsaldo (K7) trägt der Kopf „Nur in Ludwig", dann fällt auch
   diese Kachel.

Die ursprünglichen Fragen zum Nachlesen:

- **Randspalte im AppShell unter der Liste.** `main-aside` mit Stufe `table`
  (960 px, 0154/0063) plus 360 px Randspalte braucht 1.340 px Inhaltsbreite;
  im AppShell sind es bei 1440 nur 1.136. Die Stammdaten stehen dort also
  unter 25 Bewegungen (y ≈ 2.125) — neben der Liste erst ab rund 1.650 px
  Fensterbreite. Frage: soll die Randspalte beim Umbruch **über** die Liste?
  *Ohne Antwort: bleibt, wie 0154 es festlegt.*
- **Derselbe Saldo zweimal.** Kopf-Kennzahl und Kachel „Saldo in DATEV"
  zeigen dieselbe Zahl; der Brief verlangt beides (§5 Zone 1 und Zone 3),
  D7 spricht dagegen. *Ohne Antwort: bleibt wie im Brief.*

## Befunde

App (gesammelt in F209, `ludwig-worker`): L-286 (B1 Monatsverlauf), L-287
(B2 ein Drawer-Parameter), L-288 (B5 und Zusatzfelder), L-289 (B6
`accountDefects()`), L-290 (B7 zwei Loader), L-291 (B8 Schreibweg
Verrechnungskonto). B3 und B4 sind im Set erledigt (oben).

