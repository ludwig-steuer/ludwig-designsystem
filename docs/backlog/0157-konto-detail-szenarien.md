# 0157 · Die Kontoseite als Szenarien

| | |
|---|---|
| Status | **in Arbeit** — fremd abgenommen 2026-09-11 mit zwei Mängeln; K6 nachgearbeitet, P1 wartet auf den Owner (Kriterium oder Layout) |
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

## Abnahme

Fremde Abnahme am 2026-09-11 durch eine Prüfer-Session, die nichts gebaut hat (Auftrag `ludwig-manager`). Prüfstand c2a2761 (für 0152/0157 bca4b7d); statische Checks alle grün. Messungen per `scripts/cdp.mjs` auf einem eigenen Storybook der Prüfer-Session.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: typecheck · build · Sprache · Registry | Checks oben, alle 0 | ok |
| Übersicht ist `master \| sidebar` (Code-Probe) | `scenario.tsx` → `Columns pattern="main-aside"`; DOM `.v3cols--main-aside` in allen Konten-Stories | ok |
| Rahmen + Fixtures + zwei Story-Dateien, 19 Exporte | `AccountPage.tsx`, `fixtures.ts`, `AccountKinds.stories.tsx` (13), `AccountPageStates.stories.tsx` (6); alle 19 IDs rendern (`skr03` heißt `seiten-konto-konten--skr-03`) | ok |
| Kein Querlauf bei 1440/1280, Narrow bei 1024 | `m-bca.txt`: scrollW = vw in allen 19×2 Messungen; `narrow`@1024 = 1024; K1@1024 = 1024, @1920 = 1920 | ok |
| Genau ein Signal in K8 und K9, sonst keins | `disappeared` 1, `locked` 1 (Callout 181–298); alle anderen 0 | ok |
| Der Kopf zeigt einen Zustand | `.v2ehead span[title]`: genau „Kontoart: Sachkonto · …" (StatusBadge) je Story | ok |
| Keine leere Kennzahl (K6 = 0,00, K7 = Delta) | Kopf: K6 „Saldo in DATEV 0,00 €", K7 „Nur in Ludwig 540,00 €" ✓. **Aber** Kachel K6 (`unused`): „Letzte Buchung **—** 0 Buchungen insgesamt" — ein Gedankenstrich als Kennzahlwert (19 px `SPAN.v2muted`), D7 | **Mangel** |
| Saldo nur einmal (D7, 2026-09-11) | Kopf „Saldo in DATEV · Rest 1.240,50 €"; Kacheln K1: Nur in Ludwig · Offene Vorschläge · Letzte Buchung (3); K7: 2 Kacheln | ok |
| Zone 2 mit Weg je Zeile in K1/K2/K6/K7/K10; Haken in K3/K4/K5/K8/K9/K11 | K1 2 Zeilen („Nur diese zeigen", „Bewegungen Juli"), K2 2, K6 1 („Beschreibung schreiben"), K7 2 („Nur diese zeigen", „Zum Export"), K10 1; K3/K4/K4b/K5/K8/K9/K11 „Ludwig und DATEV stimmen überein — n Bewegungen, keine offen." | ok |
| Kachel „nur in Ludwig" und Filterliste zählen gleich (K1: 110) | Kachel 110; `#origin=ludwig` → Pager „1–25 von 110"; `#status=proposed` → „1–25 von 110"; `#origin=datev` → „von 450" | ok |
| K2 mit 3.400 Zeilen paginiert | `bank-account`: „1–50 von 3.400", 68 Seiten | ok |
| P1 bei 1280 und 1440×900: Kopf, Kacheln und Anfang der Liste ohne Scrollen | `seite--in-use` @1440: Kopf 136–249 ✓, Stammdaten (Randspalte, jetzt oben) 332–600, Kacheln ab 620, **Filterleiste 1023–1070, Listenkopf und erste Zeile darunter** (Spec: erste Zeile 1210); @1280: Filterleiste 1023–1103, erste Zeile ≈ 1243. Ohne AppShell (K1 @1440): Filterleiste 647–694, erste Zeile 781–820 ✓ | **Mangel** (in der Spec selbst als „teilweise" vermerkt; Folge des Owner-Entscheids „Randspalte oben" — Kriterium und Layout widersprechen sich, einer muss nachgeben) |
| P5: Saldospalte nur bei einer Quelle | Spec-Messung; Code `accountEntryColumns({ balance })` (`AccountEntries.tsx:165/243`), `runningBalance` | ok (Code-Probe) |
| P6 bei 1024: Randspalte fällt um, nichts fällt weg | `narrow`/K1 @1024: aside 244–512 **über** main 532–2305, volle Breite 1024; kein Querlauf | ok |
| Randspalte beim Umbruch **über** der Liste (2026-09-11) | `in-use` @1440: aside 332–600 vor main 620; @1280 dito; K1 @1440/1920 nebeneinander (aside x=1047 / 1367) | ok |
| Kein Text in 16 px | fs≥16: Titel 19, KPI-Werte 19, Callout 17, Leerzustand 18, Drawer-Titel 16 (Set), `sr-only` | ok |
| Alle Reiter in P3 mit Inhalt und Leerzustand | `all-tabs`: zwei Rahmen (Details 244–1355, Rohdaten 1623–3547), Leerzustand „ohne LLM-Profil" | ok |
| Drawer (P4) | `drawers`: `#entry=m2-109` öffnet „Bewegung KB-0110 … Konto 1460 …", Partner-Drawer in K4 | ok |
| Bausteine additiv: `accountEntryColumns({balance})`, `AccountFacts figures`, `.v2fbar`/`.pag` auf `--fs-ui` | Code: `AccountEntries.tsx:158`, `Account.tsx:153 figures = true`; DOM: `.v2fbar` 13,5 px, `nav.pag` keine Schrift ≥ 16 px | ok |
| Spec beschreibt das Gebaute | Nachtrag 2026-09-11 + Messtabelle stimmen (Kacheln 3/2, Randspalte oben). Alter Satz in 0154-Tabelle s. dort | ok |

**Urteil: in Arbeit.** Mängel: (1) `seiten-konto-seite--in-use` @1440/1280 — Liste beginnt bei y ≈ 1023 (Filterleiste), erste Bewegung ≈ 1210/1243, Kriterium verlangt „Anfang der Liste ohne Scrollen"; (2) `seiten-konto-konten--unused` Kachel „Letzte Buchung —" (D7: Satz oder weglassen).

### Nacharbeit 2026-09-11 (durch den Bauenden, Nachprüfung offen)

| Mangel | Nacharbeit | Messung (6107, 1440 × 900) |
|---|---|---|
| K6 `unused`: Kachel „Letzte Buchung —" (D7) | ohne letzte Buchung steht „noch keine" | `unused`: „Letzte Buchung · noch keine · 0 Buchungen insgesamt" |
| P1 `seite--in-use`: erste Bewegung bei 1210 / 1243 | **offen** — Folge des Owner-Entscheids „Randspalte oben"; `ludwig-manager` fragt den Owner, ob das Kriterium oder das Layout nachgibt (z. B. Randspalte kompakter oder aufklappbar) | — |

Mit freigegeben nach der Abnahme (L-289): die Mängelzone rechnet nicht mehr im Showcase, sondern mit `accountDefects()` aus dem Spiegel (F209, B6); Wörter und Wege setzt die Seite. Zeilen je Konto unverändert: K1 2, K2 2, K6 1, K7 2, K10 1, K12 1; K3–K5, K8, K9, K11 der Haken.
