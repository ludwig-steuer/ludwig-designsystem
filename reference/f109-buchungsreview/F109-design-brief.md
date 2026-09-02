# F109 — Design-Brief: Buchungsreview

**Was das ist:** die Übergabe an *claude design*. Beschrieben werden Ablauf,
Screens, Interaktion, Zustände und der Datenkontrakt des Buchungsreviews —
der Oberfläche, mit der die Buchhalterin **einen abgeschlossenen
Buchungslauf** Schritt für Schritt prüft, Fragen beantwortet, Buchungen
freigibt oder korrigiert, gelernte Konventionen bestätigt und am Ende entweder
den DATEV-Stapel anlegt oder den Lauf mit ihren Anmerkungen an den Agenten
zurückgibt.

**Was das nicht ist:** kein Implementierungsplan. Backend wird nur als
Kontrakt benannt (Abschnitt 9); alle Schreibwege sind bestehende Kern-Funktionen
(`buchung.md` R6). Problem-Eintrag: `topics/web-ui-offen.md` P17.

Begriffe nach `GLOSSARY.md`: Buchungslauf (agent run), Sachverhalt, Ereignis,
Buchungsvorschlag, Abnahme, Klärungsfrage, Wiedervorlage, Erwartung,
Beleggruppe, Personenkonto, Verrechnungskonto, Kontenblatt, Stapel
(= Exportvorgang), Judge, Triage-Bucket, Konvention (Mandant/Kanzlei, F106).

---

## 1. Ausgangslage

**Ersetzt wird** der Wizard unter `clients/[slug]/[year]/review/*`
(Upload → Verarbeitung → Freigabe → Kreditoren → Abschluss). Er stammt aus der
Zeit vor dem Agenten: beleg-zentriert, kennt keinen Lauf, listet unter
„Freigabe" Belege mit Extraktionsbefund statt Buchungsvorschläge, und sein
„Abschluss" suggeriert einen einmaligen Endpunkt, den es nicht gibt (der Export
ist beliebig wiederholbar). Bank, offene Posten, Konten und Konventionen kommen
darin nicht vor.

**Bleibt und wird eingebunden:** die Abnahme-Triage (`pruefen` / `kurz_ansehen`
/ `durchwinker` / `uebernehmen`, `domain/acceptance-triage.ts`, heute lose
unter `/cases`), der Lauf-Detail (`/agent-runs/[runId]`: Step-Log, Bericht,
Gates), der 3-Schritt-Export-Wizard (`DatevExportWizard`: Zeitraum → Vorschau →
Stapel anlegen), die OPOS-Seite, das Kontenblatt (`AccountLedgerDrawer`), die
Beleg-Shell (`BelegPreview`), die Sachverhaltsansicht mit Klärungen und
Kommentaren, der Konventions-Speicher aus F106.

**Was der Lauf schon liefert** (alles deterministisch, serverseitig, keine
LLM-Zahlen):

| Quelle | Inhalt |
|---|---|
| Step-Log `client_agent_run_steps` | je Teilschritt 1a…5a: Gate `passed` / `blocked` / `overridden`, offene Zähler, Override-Grund mit Sachverhaltsnummern |
| `client_agent_runs.stats` | Handover-Statistik: neue Vorschläge, wartende Vorschläge, neue/offene Klärungen (Kanzlei, Mandant), Beleg-Nachforderungen, unerklärte Transaktionen, Ereignisse ohne Buchung, Belege ohne Sachverhalt |
| `client_agent_runs.report` | Übergabetext des Agenten (Markdown) |
| Gate 1a | je Zahlungskonto: Auszüge vorhanden, Saldenanschluss (Endsaldo n = Anfangssaldo n+1, Anfang + Σ = Ende) |
| Gate 3f / `completed_at` | jeder Beleg im und vor dem Zeitraum ist erledigt (zugeordnet und gebucht oder begründet nicht gebucht) |
| Judge (4a) | je Vorschlag Verdikt `confirm` / `adjust` / `flag`, Kommentar, verletzte Kriterien, Zeilen-Ampeln |
| `get_proposal_batch_overview` (4b) | Konto-Streuung je Kreditor, Dubletten-Kandidaten (gleicher Kreditor, Betrag ±1 ct, Datum ±3 Tage), BU-Streuung |
| Gate 4d | Bank 100 % erklärt, Verrechnungskonten auf Null, jede Auszugszeile gebucht, Probe-Export (`simulate_export`) fehlerfrei |
| DATEV-Spiegel `client_datev_mirror_entries` ∪ Ludwig (`client_effective_journal_lines`) | die vollständige Buchungshistorie des Mandanten ab Onboarding — Basis jedes Vormonats- und Drei-Monats-Vergleichs |
| `get_trial_balance(year, month)` | je Konto Soll/Haben/Saldo, mit/ohne `proposed` |
| `get_account_sheet` | Kontenblatt mit Weg zurück zum Sachverhalt |
| `get_bank_coverage` | je Monat und Konto: Anzahl Tx, Zeitraum, größte Lücke, Zuordnungsquote |
| `get_vat_assessment` | je Ereignis Vorsteuer-Fakten (Empfänger, Kleinbetrag, USt-IdNr., §13b, Leistungszeitraum …) mit Verdikt |
| Erwartungen `client_accounting_case_expectation` | fehlender Beleg / fehlende Zahlung mit Frist und Eskalationsstufe; offener Betrag aus den Ereignissen |
| Klärungen | `audience` Kanzlei / Mandant / Agent, Antwortoptionen als Handlungen (S13), Wiedervorlage (S11) |
| Konventionen (F106) | je Lauf: neu entstandene Mandanten-/Kanzlei-Konventionen mit Herkunft (destilliert/beobachtet), Status bestätigt/unbestätigt, `agent_run_id` |

---

## 2. Nutzerin und Situation

Die Buchhalterin der Kanzlei. Sie bekommt die Abschluss-Mail „Lauf 08/2026 für
Mandant X ist fertig" und öffnet Ludwig. Sie hat einen Bildschirm, oft DATEV
daneben. Sie kennt ihren Monatsprozess auswendig (Abschnitt 7) und will ihn
**in derselben Reihenfolge** abarbeiten — nur dass der Agent die Vorschläge
schon gemacht hat. Sie ist mit „allen Informationen auf einmal" schnell
überfordert: das Review muss ihr sagen, **was** sie an **diesem** Satz prüfen
soll, nicht alles anbieten, was es weiß.

Was sie am Ende hat, ist genau eines von zwei Ergebnissen:

- **Freigegeben → Stapel angelegt.** Alle Buchungen des Laufs sind abgenommen
  (unverändert, korrigiert oder abgelehnt), die Prüfungen sind grün oder
  bewusst quittiert, der Stapel geht nach DATEV.
- **Zurück an den Agenten.** Ihre Antworten, Kommentare, Ablehnungen und
  Nachforderungen sind gebündelt, der Agent läuft erneut, sie kommt zurück und
  sieht **nur, was sich geändert hat**.

Beides darf mehrfach hintereinander passieren; ein Monat kann drei Läufe und
drei Reviews haben. Was sie einmal freigegeben hat, sieht sie nie wieder als
offen.

---

## 3. Leitprinzipien

1. **Ein Review = ein Lauf.** Einstieg über den fertigen Lauf. Der Vorgänger
   (früherer Lauf derselben Periode) ist der Diff-Bezug, nie ein zweiter
   Arbeitsvorrat.
2. **Erst das Ergebnis, dann die Arbeit.** Der Einstieg zeigt, was der Agent
   geschafft hat — beziffert, positiv, ehrlich. Die Baustellen kommen danach.
3. **Jeder Screen ist eine Todo-Liste.** Links die Punkte mit Zustand und
   Zähler, rechts der Punkt in Arbeit. Ein Schritt ist fertig, wenn kein Punkt
   mehr offen ist. Nichts ist „automatisch grün", außer der Server hat es
   deterministisch geprüft — dann steht das Ergebnis da, und die Buchhalterin
   quittiert es mit einem Klick, nicht mit Nachrechnen.
4. **Jeder Buchungssatz bringt seine eigenen Prüfpunkte mit.** Serverseitig
   abgeleitet, 3–6 Stück, nur die relevanten. Was grün ist, ist eingeklappt.
   Der Prüfpunkt öffnet die Information, die er braucht — nicht umgekehrt.
5. **Die Reihenfolge ist die der Kanzlei** (Abschnitt 7). Der Schritt-Rail ist
   ein Vorschlag, kein Zwang: jeder Schritt ist jederzeit erreichbar, der
   Abschluss zeigt, was noch offen ist.
6. **Vergleichen statt raten.** „Ist das plausibel?" heißt immer: gegen die
   letzten drei Monate aus der DATEV-Historie. Die Abweichung steht in
   Prozent gegen den Drei-Monats-Schnitt und färbt den Punkt; Mouseover
   erklärt die Rechnung.
7. **Der Mensch schreibt fest, der Agent schlägt vor** (`buchung.md` R3).
   Freigeben, Korrigieren, Ablehnen, Konvention bestätigen, Stapel anlegen sind
   Web-Aktionen. Der Agent bekommt Antworten und Kommentare, nie Buchungsbefehle.
8. **Rücklauf ist jederzeit möglich, nicht erst am Ende.** Alles, was an den
   Agenten geht, sammelt sich sichtbar in einem „Rücklauf-Korb"; die
   Buchhalterin entscheidet, wann er abgeschickt wird.
9. **Nichts zweimal prüfen.** Akzeptierte Buchungen, quittierte Prüfpunkte,
   bestätigte Konventionen und beantwortete Fragen bleiben im nächsten
   Review-Durchgang erledigt. Der Diff-Modus zeigt nur Neues und Geändertes.
10. **Konto | Beschreibung | Betrag S | Betrag H | Saldo.** Buchungen sehen aus
    wie in DATEV: erst der Satz zusammengefasst, dann die Zeilen.

---

## 4. Prozess-Skelett

```
Abschluss-Mail / Dashboard „Lauf 08/2026 wartet auf Review"
        │
        ▼
┌─ 0 Ergebnis des Laufs ────────────────────────────────────────────────┐
│  Was der Agent geschafft hat · was dich braucht · Gates · Bericht      │
└───────────────────────────────────────────────────────────────────────┘
        │
        ▼
 1 Ist alles da — und so viel wie sonst?   Auszüge, Salden, Belege erledigt; Mengengerüst vs. 3 Monate
 2 Was will der Agent von mir?             Fragen an die Kanzlei beantworten; Overrides quittieren
 3 Stimmen die Vorschläge?                 je Satz seine Prüfpunkte; USt-Block; freigeben · korrigieren · ablehnen
 4 Geht die Bank auf?                      Bank 100 % erklärt, Verrechnungskonten leer, Sachverhalte ausgeglichen
 5 Wer schuldet wem?                       OPOS je Gegenpartei: in Frist · überfällig → Aktion · wartend · Dubletten
 6 Sieht der Monat aus wie sonst?          je Konto vs. 3 Monate: erstmals, fehlt, Abweichung, Vorzeichen, Konsistenz, VSt
 7 Was hat der Agent gelernt?              neue Konventionen bestätigen · ändern · verwerfen; Kanzlei-Regeln freigeben
 8 Prüfprotokoll & Entscheidung            alle Checks ✓ / ? / ✗ · Probe-Export · ┌ Stapel anlegen ─▶ Export-Wizard
                                                                                  └ Zurück an den Agenten ─▶ neuer Lauf ─▶ Review (Diff)
```

Jeder Schritt trägt im Rail einen Zähler `offen / gesamt` und eine Ampel:
grau (nicht begonnen) · blau (in Arbeit) · grün (fertig) · orange (fertig, mit
Rücklauf-Punkten) · rot (blockiert: Server-Prüfung schlägt fehl und ist nicht
quittierbar, z. B. Saldenanschluss reißt).

---

## 5. Screens — je Schritt ein eigener Brief

Jeder Schritt hat eine **eigene, in sich vollständige Brief-Datei**, die
einzeln an *claude design* übergeben werden kann. Jede beginnt mit demselben
Kontext-Block (Review, acht Schritte, Nutzerin, gemeinsames Layout,
Todo-Anatomie, Tastatur, Quittieren, Vergleichs-Engine, Rücklauf/Diff) und
beschreibt dann Frage, Todo-Gruppen, Detail, Aktionen, Zustände, den
abgedeckten Kanzlei-Ablauf und den Datenkontrakt des Schritts.

| Schritt | Frage | Datei |
|---|---|---|
| 0 | Was hat der Agent geschafft? | `F109-0-ergebnis-design-brief.md` |
| 1 | Ist alles da — und so viel wie sonst? | `F109-1-vollstaendigkeit-design-brief.md` |
| 2 | Was will der Agent von mir? | `F109-2-rueckfragen-design-brief.md` |
| 3 | Stimmen die Vorschläge? (Abnahme je Sachverhalt, Zonen/Drawer, Prüfprofile, Prüfpunkte) | `F109-3-abnahme-design-brief.md` |
| 4 | Geht die Bank auf? | `F109-4-bank-design-brief.md` |
| 5 | Wer schuldet wem? | `F109-5-opos-design-brief.md` |
| 6 | Sieht der Monat aus wie sonst? | `F109-6-kontenpruefung-design-brief.md` |
| 7 | Was hat der Agent gelernt? | `F109-7-konventionen-design-brief.md` |
| 8 | Prüfprotokoll & Entscheidung | `F109-8-pruefprotokoll-design-brief.md` |

**Gemeinsames Layout** (Desktop, ≥ 1280 px, kein Mobile-Ziel): links ein
schmaler **Schritt-Rail** (sticky, 0–8, Zähler, Ampel, darunter der
Rücklauf-Korb), in der Mitte die **Todo-Liste** des Schritts, rechts das
**Detail** (Master-Detail, kein Modal). Bestehende Ansichten öffnen als
`UrlDrawer` über dem Review. Bei Widerspruch zwischen diesem Dokument und
einem Schrittbrief gilt der Schrittbrief.

---

## 6. Der Rücklauf — Wiedereinstieg mit Diff

Der Agent ist fertig, der neue Lauf hat eine neue `runId`, dieselbe Periode.
Das neue Review öffnet im **Diff-Modus**:

- Ergebnis-Seite zuoberst „Seit deinem letzten Review": *n* Vorschläge neu,
  *m* ersetzt (Ablehnung → neuer Satz am selben Ereignis, alt/neu
  nebeneinander), *k* Fragen beantwortet → daraus gebucht, *j* Punkte
  unverändert offen (mit der Begründung des Agenten aus dem Bericht), *i* neue
  Fragen, *c* neue Konventionen.
- Jede Todo-Liste hat den Filter **„Neu / Geändert"** vorgewählt. Ein im
  Vorgänger-Review quittierter, unveränderter Punkt wird **nicht** wieder
  offen (Quittung hängt am Prüfgegenstand, Abschnitt 9). Eine
  Mengengerüst-Zeile, die sich durch neue Buchungen verändert hat, wird
  wieder offen.
- Ersetzte Sätze zeigen „vorher / nachher" (Konto, Betrag, BU, Belegfeld
  farbig diffend) und die Kommentar-Kette: ihre Ablehnung → seine Antwort.
- Der Korb ist leer und beginnt neu.

Gegenfragen des Agenten (S11) erscheinen in Schritt 2 mit dem Faden.

---

## 7. Prüfkatalog — Kanzlei-Ablauf → Screen → Datenquelle

| Kanzlei-Ablauf | Screen | Datenquelle | Stand |
|---|---|---|---|
| Belege buchen | Schritt 3 Eingang/Ausgang | Vorschläge + Judge + Triage | da |
| Lohn | Schritt 3 Lohn (Sichtprüfung) | deterministischer Lohn-Zahlungskreis (R24) | da |
| WK-Buchung (Dauersachverhalte) | Schritt 3 Dauersachverhalte | Sollstellungen aus Regeln (R23) | da |
| Abschreibungen | — | out of scope (R4), Hinweis-Zeile im Protokoll | bewusst nicht |
| Bank buchen | Schritt 3 Bank | Vorschläge aus Bank-Ereignissen | da |
| Banksaldo stimmt überein | Schritt 1 + Schritt 4 | Gate 1a + Kontenblatt-Saldo Zahlungskonto | da; Saldo ableitbar |
| „Ist es so viel wie sonst?" | Schritt 1 Mengengerüst | DATEV-Spiegel ∪ Ludwig, 3 Monate | ableitbar, Engine neu |
| BWA: Konto letzten Monat bebucht, jetzt nicht | Schritt 6 Gruppe 2 | Vergleichs-Engine je Konto | ableitbar |
| BWA: Abweichung zum Vormonat, Stornos | Schritt 6 Gruppe 3 | Vergleichs-Engine + Storno-Kennzeichen | ableitbar |
| BWA: Jahresübersicht/Anomalie | Schritt 6 Detail (12 Monate) | Saldenliste je Monat | ableitbar |
| Konten, die ausgeglichen sein müssen | Schritt 4 Gruppe 2 | `clearing_account_type` + Saldo | da |
| Negative Konten / falsch herum | Schritt 6 Gruppe 4 | Vorzeichen vs. Kontoklasse | ableitbar |
| OPOS je Gegenpartei, Zahlungsziel, überfällig | Schritt 5 | Erwartungen mit Frist + Stufe | da |
| OPOS doppelt / Belege doppelt | Schritt 5 Banner, Schritt 3 Prüfpunkt | Batch-Overview C2, Belegnummern-Register | da |
| Anderes Bankkonto? Noch nicht bezahlt? | Schritt 5 „Mandant fragen" | Klärung mit Antwortoptionen | da |
| Müssen wir mahnen? | Schritt 5 Notiz | Sachverhalts-Kommentar; Mahnwesen bleibt DATEV | da |
| Notizen erfassen | überall | Sachverhalts-Kommentar (F106) | da |
| Bank am Ende nochmal | Schritt 4 Gruppe 4 | wie Schritt 1, inkl. Freigaben | da |
| Vorsteuerprüfung | Schritt 3 USt-Block, Schritt 6 Gruppe 6 | `get_vat_assessment` + Extraktion | da |
| Komische / erstmals bebuchte Konten | Schritt 6 Gruppe 1 | Vergleichs-Engine, 12 Monate | ableitbar |
| USt-Schlüssel, Soll/Haben, Belegnummer durchgängig je Konto | Schritt 6 Gruppe 5 | Kontenblatt-Zeilen; Belegfeld-Muster neu | ableitbar |
| Kreditoren/Debitoren nicht ansehen | Schritt 6 blendet Personenkonten aus | — | Regel |
| UStVA | — | out of scope (R4); Probe-Export ist der Ersatz | bewusst nicht |
| Beleg: Empfänger, USt-IdNr., §13b, Leistungszeitraum | Schritt 3 Belegformalien + USt-Block | Extraktion + Vorsteuer-Fakten | da (Leistungszeitraum: `web-ui-offen.md` P5) |
| Belegfeld / Buchungstext / Text aus Historie | Schritt 3 Prüfpunkt Belegfeld & Text | Vorschlag + `search_past_bookings` | da |
| Kontenhistorie, Konto aufklappen | Schritt 3 Prüfpunkt Konto, Schritt 6 Detail | `get_account_sheet` | da |
| Kreditkarte geteilt / Ausgleich Karte | Schritt 4 Gruppe 2 | Kartenkonto als Verrechnungskonto (W1) | teils — W1 liefert die Kennung |
| Rückfragen des Agenten | Schritt 2 | Klärungen `audience='accounting'` | da |
| Alle eingereichten Belege verarbeitet | Schritt 1 Belege | Gate 1b + 3f, `completed_at` | da |
| Gelernte Konventionen freigeben | Schritt 7 | F106-Speicher, `agent_run_id` | Speicher entschieden, Bau in W7a |

---

## 8. Interaktionsmuster und Zustände

**Todo-Punkt, Anatomie:** Zustand-Icon links (offen ○ · geprüft ✓ ·
korrigiert ✎ · abgelehnt/an Agent ↩ · quittiert mit Grund **?** mit Tooltip ·
blockiert ⊘), Titel, Sekundärzeile (Gegenpartei · Datum · Betrag), rechts
Badges. Enter öffnet das Detail; Aktionen im Detail-Kopf als Button-Gruppe,
immer in derselben Reihenfolge: primär (Freigeben/Quittieren/Bestätigen) ·
sekundär (Korrigieren/Ändern) · tertiär (Ablehnen/Verwerfen/Frage). Nach einer
Aktion springt die Auswahl zum nächsten offenen Punkt (abschaltbar).

**Prüfpunkte am Satz (Schritt 3):** Akkordeon, grüne Punkte als eine Zeile
zusammengefasst („4 Prüfpunkte ohne Befund"), offene aufgeklappt mit genau
der Information, die sie brauchen. Im Bucket „Prüfen" hat jeder offene Punkt
eine Checkbox; „Freigeben" wird aktiv, wenn alle gesetzt sind.

**Abweichungs-Farbskala** (Schritt 1 Mengengerüst, Schritt 6 Konten, überall, wo ein
Wert gegen den Drei-Monats-Schnitt steht): kontinuierlich nach |%|, kein
Ampel-Sprung — neutral bis ±15 %, dann über gelb zu orange (±50 %) zu rot
(≥ ±100 %); Richtung als Vorzeichen und kleiner Pfeil. Mouseover: „Ø 05–07:
4.210 € · jetzt 1.980 € · −53 %". Eine Zeile wird zum Todo, wenn die
Abweichung den festen Default reißt (Abschnitt 9). Die Farbe ist Lesehilfe,
der Todo-Status ist die Schwelle — beide dieselbe Zahl.

**Zähler und Fortschritt:** im Rail `offen / gesamt` je Schritt; oben rechts
eine schmale Fortschrittsleiste über alle Schritte („41 von 118 Punkten").

**Leerzustände:** „Nichts zu tun" ist ein Erfolg und sieht so aus (grüner
Haken, ein Satz, was geprüft wurde und wann). Ein Schritt ohne Gegenstand
(kein Mandantenstapel, keine neue Konvention) wird im Rail gedimmt.

**Blockierend vs. quittierbar:** rot ist nur, was der Server hart weiß und was
den Stapel verhindert. Alles andere quittiert ein Klick — mit optionalem
Grund, der am Prüfgegenstand bleibt und im Protokoll als **?** erscheint.

**Rücklauf-Korb:** persistent unten im Rail, Zähler, Aufklappen zeigt die
Punkte nach Art; Button „An den Agenten geben" öffnet Schritt 8 mit dem Korb
ausgeklappt.

**Drawer statt Seitenwechsel:** Sachverhalt, Kontenblatt, DATEV-Satz,
Beleg-Shell als `UrlDrawer` über dem Review.

**Tastatur:** J/K Punkt, Enter Detail, A Freigeben/Quittieren/Bestätigen,
E Bearbeiten, R Ablehnen/Beanstanden/Verwerfen, F Frage an den Agenten,
1–8 Schritt, 0 Ergebnis, ? Legende.

**Konventionen der App:** Zeiten Europe/Berlin (R3), Status über `StatusBadge`
+ Registry (R1), Zustands-Spalten nie bloß „Status" (R2), Karten auf
`Section`, Tabs über `TabBar` (R9), Drawer (R8), „Beleg" statt „Rechnung", wo
jede Belegart gemeint ist (P7).

**Ladeverhalten:** Listen serverseitig (Server Components), Aktionen als
Server Actions mit optimistischer Zustandsänderung am Punkt; Detail lädt beim
Wechsel, Belegvorschau lazy, Vergleichs-Engine gecacht je Lauf.

---

## 9. Datenkontrakt

Alles Lesen und Schreiben läuft über bestehende Kerne; das Review fügt **eine**
neue Entität und **zwei** neue reine Ableitungen hinzu.

**Neu — Prüf-Quittung** (`client_review_checks`, Arbeitstitel): eine Zeile je
quittiertem Prüfpunkt. Schlüssel ist der **Prüfgegenstand**, nicht der Lauf —
`(client_id, check_kind, subject_key, period)` mit `check_kind` aus einem
festen Katalog (`volume_row`, `bank_balance_link`, `clearing_account_zero`,
`account_first_use`, `account_missing`, `account_deviation`, `account_sign`,
`account_consistency`, `vat_finding`, `gate_override`, `open_item_waiting`,
`proposal_checkpoint` …), `subject_key` = Konto / Ereignis / Step-Log-Zeile /
Sachverhalt / Mengengerüst-Zeile, `period` = Buchungszeitraum, dazu
`checked_by`, `checked_at`, `note`, `run_id`, `value_hash` (Fingerabdruck des
geprüften Werts — ändert sich der Wert, ist die Quittung hinfällig). Damit
bleibt eine Quittung über Läufe derselben Periode gültig (Abschnitt 6) und ist
im Audit-Log nachvollziehbar (`recordAuditEvent`, R10). Das Prüfprotokoll
(Schritt 8) ist die Projektion dieser Tabelle plus der Server-Checks.

**Neu — Vergleichs-Engine** (reine Funktion, getestet): Eingabe Monatswerte
M-3…M aus `client_effective_journal_lines` (Spiegel ∪ Ludwig, ohne `rejected`),
Ausgabe je Zeile/Konto `{m3, m2, m1, avg, current, deviationPct, flagged}`.
Fester Default für `flagged`: |Abweichung| ≥ 50 % **und** ≥ 500 € (Konten)
bzw. ≥ 30 % (Stückzahlen). Wird ein Vormonat leer geführt, zählt der Schnitt
über die vorhandenen Monate; unter zwei Vormonaten keine Aussage („zu jung").

**Neu — Prüfpunkt-Ableitung je Satz** (reine Funktion, getestet): aus
Vorschlag, Extraktion, Vorsteuer-Verdikt, Historie und Batch-Overview die
Liste der relevanten Prüfpunkte mit Status grün/offen und dem Grund.

**Review-Status je Lauf** — abgeleitet: `offen` (Lauf fertig, kein Stapel,
kein Folgelauf) · `zurückgegeben` (Folgelauf existiert) · `abgeschlossen`
(Stapel mit diesem Zeitraum nach dem Lauf). Braucht am Lauf nur den
Buchungszeitraum (`period_from/to`, Grundlage von Gate 3f).

**Reads und Writes je Schritt** stehen im jeweiligen Schrittbrief
(Abschnitt „Datenkontrakt"). Gemeinsame Regel: Web-Actions, keine MCP-Tools
(R3); jede Aktion ruft genau einen bestehenden Kern; der einzige neue
Write-Kern ist `recordReviewCheck`. „Zurück an den Agenten" hat **keinen**
eigenen Speicher — der Korb ist die Query „was in dieser Periode seit
Lauf-Ende an den Agenten adressiert wurde".

---

## 10. Nicht-Ziele

- Keine BWA, keine UStVA, keine AfA, kein Mahnwesen (R4). Wo die Kanzlei das
  im Prozess hat, steht im Review ein Vergleich, ein Ersatz-Check oder eine
  Notiz.
- Kein Auto-Accept, keine Konfidenz-Schwelle, ab der ungesehen gebucht wird
  (R3, R17). „Gruppe freigeben" ist ein Klick mit Kontrollsummen.
- Kein zweiter Editor, keine zweite Buchungsansicht, keine zweite
  Klärungs-Mechanik, kein zweiter Konventions-Speicher. Der Review verbindet,
  was es gibt.
- Keine je Mandant konfigurierbaren Schwellen in v1 — fester Default, Farbe
  trägt die Nuance.
- Kein Mobile-Layout, kein Zwei-Fenster-Modus in v1.
- Keine Bewertung des Agenten in der Oberfläche („Trefferquote" bleibt im
  Admin) — die Erfolgszahlen auf der Ergebnis-Seite sind Mengen, keine Noten.

---

## 11. Offene Entscheidungen (Owner)

1. **Stichprobe bei „Gruppe freigeben"** — reicht Kontrollsumme + Liste für
   den Durchwinker-Bucket, oder soll jeder n-te Satz aufgeklappt sein?
   (`buchung-offen.md` „Abnahme-Ergonomie")
2. **Erfolgszahlen auf der Ergebnis-Seite** — nur Mengen (Belege, Sätze,
   Bank-%), oder auch eine Zeitersparnis-Schätzung? Letztere braucht eine
   ehrliche Rechenbasis (z. B. Minuten je Satz × unverändert freigegeben),
   sonst lieber weglassen.
3. **Lauf-Trigger aus der Oberfläche** — „Zurück an den Agenten" braucht den
   Start eines Laufs; der Trigger ist offen (`buchung-offen.md`). Bis dahin:
   Auftrag liegt bereit, Start manuell.
4. **Konventions-Freigabe hier oder im Admin** — F106 sieht die
   Kanzlei-Freigabe „später im Admin". Der Brief legt sie in Schritt 7, weil
   dort die Anwendung sichtbar ist; der Admin-Ort kann zusätzlich bleiben.
