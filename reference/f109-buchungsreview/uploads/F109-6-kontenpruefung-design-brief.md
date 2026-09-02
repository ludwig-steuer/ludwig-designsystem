# F109 — Design-Brief: Schritt 6 — Sieht der Monat aus wie sonst?

**Stand:** 2026-08-27 · **Owner:** Simon Fakir · **Adressat:** claude design ·
**Status:** entschieden. Dieser Brief ist in sich vollständig.

## Kontext — was der Gestalter wissen muss, ohne den Gesamtbrief zu lesen

**Das Buchungsreview** ist die Oberfläche, mit der die Buchhalterin einer
Steuerkanzlei **einen abgeschlossenen Buchungslauf** des KI-Agenten prüft.
Der Agent (`client_agent_runs`) hat Belege und Bankzeilen zu Sachverhalten
(`client_accounting_case`) gebündelt, Buchungssätze vorgeschlagen
(`client_journal_entry`, Status `proposed`) und jeden Satz von einem zweiten
Agenten, dem **Judge**, gegenlesen lassen. Nur Menschen geben frei; der Agent
schreibt nie Status `accepted`. Am Ende des Reviews steht genau eines von
zwei Ergebnissen: **Stapel anlegen** (Export nach DATEV) oder **Zurück an den
Agenten** (er arbeitet die Anmerkungen ein, läuft erneut, das Review geht im
Diff-Modus weiter). Ersetzt wird der alte Wizard `clients/[slug]/[year]/review/*`.

**Die acht Schritte** (Reihenfolge = der Monatsprozess der Kanzlei):

```
0 Ergebnis des Laufs           Was der Agent geschafft hat · was dich braucht · Gates · Bericht
1 Ist alles da?                Auszüge, Salden, Belege erledigt; Mengengerüst vs. 3 Monate
2 Was will der Agent von mir?  Fragen an die Kanzlei beantworten; Overrides quittieren
3 Stimmen die Vorschläge?      je Sachverhalt seine Sätze mit Prüfpunkten; freigeben · korrigieren · ablehnen
4 Geht die Bank auf?           Bank 100 % erklärt, Verrechnungskonten leer, Sachverhalte ausgeglichen
5 Wer schuldet wem?            OPOS je Gegenpartei: in Frist · überfällig → Aktion · wartend · Dubletten
6 Sieht der Monat aus wie sonst?  je Konto vs. 3 Monate: erstmals, fehlt, Abweichung, Vorzeichen, Konsistenz
7 Was hat der Agent gelernt?   neue Konventionen bestätigen · ändern · verwerfen; Kanzlei-Regeln freigeben
8 Prüfprotokoll & Entscheidung alle Checks ✓ / ? / ✗ · Probe-Export · Stapel anlegen ODER zurück an den Agenten
```

Jeder Schritt hat eine eigene Brief-Datei (`F109-<n>-…-design-brief.md`); der
Gesamtbrief `F109-buchungsreview-design-brief.md` trägt Leitprinzipien,
Prüfkatalog und die gemeinsamen Datenkontrakt-Teile.

**Die Nutzerin:** Buchhalterin, 20–60 Mandanten, DATEV-geprägt, denkt in
**Konto | Gegenkonto | Betrag | BU | Belegfeld 1**, arbeitet mit Tastatur,
hat wenig Zeit und ist mit „allen Informationen auf einmal" schnell
überfordert. Der Screen muss ihr sagen, **was** sie an **diesem** Punkt prüfen
soll, nicht alles anbieten, was er weiß.

**Gemeinsames Layout aller Schritte** — Zielgerät ist der **24-Zoll-Arbeitsplatz**
(1920 × 1080 bis 2560 × 1440): das Layout wird für **≥ 1920 px Breite** ausgelegt
und darf die Fläche nutzen (drei Spalten nebeneinander, Drawer **neben** der
Arbeitsfläche statt darüber, dichte Tabellen ohne Umbruch); ≥ 1280 px muss noch
funktionieren (Kontext rutscht unter die Arbeitsfläche), Mobile ist kein Ziel:
links ein sticky **Schritt-Rail** (0–8, je Schritt Zähler `offen / gesamt` und
Ampel grau · blau · grün · orange = fertig mit Rücklauf-Punkten · rot =
blockiert; darunter der **Rücklauf-Korb** mit Zähler), in der Mitte die
**Todo-Liste** des Schritts (Filter offen / erledigt / alle; Gruppierung je
Schritt verschieden), rechts das **Detail** des gewählten Punkts
(Master-Detail, kein Modal). Bestehende Ansichten (Sachverhalt, Kontenblatt,
Beleg-Shell, DATEV-Satz, Gegenpartei) öffnen als **Drawer** mit URL über dem
Review (`web-ui.md` R8) — einer zur Zeit, `Esc` schließt. Jede Information
hat **einen** Ort; was nicht auf den Screen passt, geht **vollständig** in
einen Drawer, nie verloren.

**Todo-Punkt, Anatomie:** Zustand-Icon links (offen ○ · geprüft ✓ ·
korrigiert ✎ · abgelehnt/an Agent ↩ · quittiert mit Grund **?** mit Tooltip ·
blockiert ⊘), Titel, Sekundärzeile (Gegenpartei · Datum · Betrag), rechts
Badges. `Enter` öffnet das Detail; Aktionen im Detail-Kopf als Button-Gruppe
in fester Reihenfolge: primär (Freigeben / Quittieren / Bestätigen) ·
sekundär (Korrigieren / Ändern) · tertiär (Ablehnen / Verwerfen / Frage).
Nach einer Aktion springt die Auswahl zum nächsten offenen Punkt.

**Tastatur:** `J`/`K` Punkt · `Enter` Detail · `A` Freigeben/Quittieren ·
`E` Bearbeiten · `R` Ablehnen/Beanstanden · `F` Frage an den Agenten ·
`1`–`8` Schritt · `0` Ergebnis · `?` Legende.

**Blockierend vs. quittierbar:** **rot** ist nur, was der Server hart weiß
und was den Stapel verhindert (z. B. Saldenanschluss reißt). Alles andere
quittiert ein Klick — mit optionalem Grund, der am Prüfgegenstand bleibt und
im Prüfprotokoll (Schritt 8) als **?** erscheint. Quittungen speichert
`recordReviewCheck` (Tabelle `client_review_checks`, Schlüssel
`(client_id, check_kind, subject_key, period)` + `value_hash`): sie hängen am
**Prüfgegenstand**, nicht am Lauf, und überleben einen Folgelauf, solange sich
der geprüfte Wert nicht ändert.

**Vergleichen statt raten:** „Ist das plausibel?" heißt immer: gegen die
letzten drei Monate aus **DATEV-Spiegel ∪ Ludwig**
(`client_effective_journal_lines`). Die **Vergleichs-Engine** liefert je
Zeile `{m3, m2, m1, avg, current, deviationPct, flagged}`; fester Default
für `flagged`: |Abweichung| ≥ 50 % **und** ≥ 500 € bei Konten, ≥ 30 % bei
Stückzahlen; unter zwei Vormonaten „zu jung", keine Aussage. Die
**Abweichungs-Farbskala** ist kontinuierlich nach |%|: neutral bis ±15 %,
über gelb zu orange (±50 %) zu rot (≥ ±100 %), Richtung als Vorzeichen und
Pfeil; Mouseover zeigt die Rechnung: „Ø 05–07: 4.210 € · jetzt 1.980 € ·
−53 %". Die Farbe ist Lesehilfe, der Todo-Status ist die Schwelle — beide
dieselbe Zahl.

**Rücklauf-Korb und Diff-Modus:** Alles, was an den Agenten geht
(Ablehnungen mit Kommentar, beantwortete Fragen, Beanstandungen,
Merge-Aufträge, verworfene Konventionen, neue Fragen), sammelt sich sichtbar
im Korb; die Buchhalterin entscheidet in Schritt 8, wann er abgeschickt
wird. Der Korb ist **kein eigener Speicher**, sondern die Abfrage „was seit
Lauf-Ende in dieser Periode an den Agenten adressiert wurde". Kommt der
Folgelauf zurück, öffnet das Review im **Diff-Modus**: jede Todo-Liste hat
den Filter „Neu / Geändert" vorgewählt; quittierte, unveränderte Punkte
bleiben erledigt; ersetzte Sätze zeigen vorher / nachher.

**Leerzustände:** „Nichts zu tun" ist ein Erfolg und sieht so aus (grüner
Haken, ein Satz, was geprüft wurde und wann). Ein Schritt ohne Gegenstand
wird im Rail gedimmt.

**Konventionen der App:** Zeiten Europe/Berlin · Status über `StatusBadge`
+ Registry · Zustands-Spalten nie bloß „Status" · Karten auf `Section` ·
Tabs über `TabBar` · Drawer über `UrlDrawer` · „Beleg" statt „Rechnung", wo
jede Belegart gemeint ist. Alle Schreibwege sind bestehende Kern-Funktionen
(Ein-Kern-Regel); der einzige neue Write-Kern des Reviews ist
`recordReviewCheck`.

**Gestaltungshaltung:** Business-Webanwendung. Kompakt, übersichtlich, klare
Navigation, einfache Bedienung geht vor Ausdruck. **Ruhiger Kontext, laute
Probleme:** Flächen und Standardinhalte sind schlicht, neutral, sachlich —
wenig Farbe, keine Illustrationen, dichte Tabellen in DATEV-Optik (Konto
links, Zahlen rechtsbündig, Soll/Haben getrennt). Farbe, Priorität und
Ampel gehören **ausschließlich** dem, was Aufmerksamkeit braucht: rot /
orange / gelb führen das Auge zur Aufgabe; grün ist eingeklappt oder ein
kleiner Haken; Neutrales bleibt grau. **Hotkey-freundlich:** jede wichtige
Aktion zeigt ihre Taste am Button (`Freigeben · A`), `?` öffnet die Legende,
die Fokus-Reihenfolge folgt der Leserichtung, alles Wesentliche geht ohne
Maus. **Jeder Screen dokumentiert seine Jobs:** was die Nutzerin hier tun
kann und soll, mit welcher Information, und ob sie vorhanden ist.

---

## 1. Die Frage dieses Schritts

**Sieht die Saldenliste dieses Monats aus wie die der letzten drei — und wo
nicht, warum?**

Das ist die BWA- und Kontenprüfung der Kanzlei, ohne BWA: Konto letzten
Monat bebucht, jetzt nicht · Abweichung zum Vormonat · Stornos · Anomalien
im Jahresverlauf · negative Konten · Konsistenz (USt-Schlüssel, Soll/Haben,
Belegnummern durchgängig) · Vorsteuer-Restliste. Kreditoren und Debitoren
werden hier **nicht** angesehen (Personenkonten ausgeblendet).

## 2. Datenbasis

Saldenliste dieses Monats gegen **M-1, M-2, M-3 und den Drei-Monats-Schnitt**
aus Ludwig ∪ DATEV-Spiegel (`client_effective_journal_lines`; `getTrialBalance`
× 4), **inklusive** freigegebener, **ohne** abgelehnte Vorschläge. Dieselbe
Vergleichs-Engine wie in Schritt 1, je Konto.

## 3. Kopf des Schritts — die Konten-Vergleichstabelle

Spalten **Konto · Bezeichnung · M-3 · M-2 · M-1 · Ø · dieser Monat ·
Abweichung %**, sortiert nach |Abweichung|, Abweichungszelle gefärbt,
Mouseover mit Rechnung. Filter: nur auffällige / alle / Kontoklasse.

| Konto | Bezeichnung | M-3 | M-2 | M-1 | Ø | jetzt | Abw. |
|---|---|---|---|---|---|---|---|
| `6310` | Miete | `1.700` | `1.700` | `1.700` | `1.700` | `1.800` | `+6 %` |
| `6805` | Telefon | `92` | `89` | `89` | `90` | `89` | `−1 %` |
| `6600` | Werbekosten | `410` | `380` | `12.900` | `4.563` | `390` | `−91 %` (Vormonat Anomalie) |
| `4400` | Erlöse 19 % | `58.900` | `61.200` | `57.400` | `59.167` | `60.100` | `+2 %` |
| `6222` | AfA Kfz | `310` | `310` | `310` | `310` | `0` | `−100 %` (fehlt) |
| `6851` | Nebenkosten Geldverkehr | `0` | `0` | `0` | `0` | `129` | erstmals |

## 4. Todo-Gruppen — jeder Befund ein Punkt, deterministisch

| Gruppe | Erkennung | Detail-Hinweis |
|---|---|---|
| **1 Erstmals bebucht** | keine Bewegung in den letzten 12 Monaten (`client_effective_journal_lines`) | „Neu in der Buchhaltung — richtig, oder gehört es auf ein bestehendes Konto?" mit den Zeilen |
| **2 Vormonate ja, jetzt nein** | in ≥ 2 der 3 Vormonate bebucht, jetzt nicht | „Miete, Abo, Leasing: fehlt ein Beleg?"; verweist auf die Dauersachverhalt-Regel (`client_accounting_case_rule`), wenn eine existiert, und ob sie sollgestellt hat |
| **3 Abweichung** | `flagged` der Vergleichs-Engine (≥ 50 % und ≥ 500 €) | die drei Vormonate aufgeklappt, größte Einzelbuchungen |
| **4 Falsches Vorzeichen** | Aufwandskonto mit Haben-Saldo, Erlöskonto mit Soll-Saldo, negativer Saldo auf Aktivkonto | „falsch herum gebucht oder Storno?" — Storno-Sätze (`reverses_entry_id`) markiert |
| **5 Konsistenz auf dem Konto** | mehrere `tax_key` auf einem Konto · wechselnde Seite · Belegfeld-1-Muster bricht (z. B. `RE-…` und `082026` gemischt) | die abweichenden Zeilen |
| **6 Vorsteuer-Restliste** | `get_vat_assessment` mit Verdikt `blocked` / `uncertain`, die in Schritt 3 nicht bereits behandelt wurden | Verdikt mit Rationale, Sprung zum Sachverhalt |

## 5. Detail je Konto

| Element | Quelle |
|---|---|
| Kopf | Nummer, Bezeichnung, `skr_class`, Automatikkonto (`datev_main_function_number`), `datev_tax_rate` |
| **12-Monats-Verlauf** als Balken | Saldenliste je Monat; die drei Vergleichsmonate markiert, Anomalie sichtbar |
| Kontenblatt des Monats | `getAccountSheet(account, month)`: **Konto \| Beschreibung \| Betrag S \| Betrag H \| Saldo**, Herkunft je Zeile (Ludwig / DATEV / Vorschlag), Sprung zum Sachverhalt |
| Regel | falls Dauersachverhalt-Regel auf dieses Konto zeigt: Modus, Intervall, letzte Periode |

**Aktionen:** **Quittieren** („plausibel", Grund optional →
`recordReviewCheck`, `check_kind` je Gruppe: `account_first_use` ·
`account_missing` · `account_deviation` · `account_sign` ·
`account_consistency` · `vat_finding`) · **Buchung korrigieren** (springt
in Schritt 3 auf den Sachverhalt) · **Frage an den Agenten** · **Storno
anstoßen** (bestehender Pfad, nur exportierte Sätze).

## 6. Zustände

- **Fertig:** jeder Befund quittiert, korrigiert oder an den Agenten
  gegeben.
- **Nie blockierend:** alle Befunde sind quittierbar; „zu jung" (weniger als
  zwei Vormonate in der Historie) zeigt die Tabelle ohne Abweichungsspalte.

## 7. Kanzlei-Ablauf, den dieser Schritt abdeckt

| Kanzlei-Ablauf | Hier |
|---|---|
| BWA: Konto letzten Monat bebucht, jetzt nicht | Gruppe 2 |
| BWA: Abweichung zum Vormonat, Stornos | Gruppe 3 + 4 |
| BWA: Jahresübersicht / Anomalie | Detail, 12 Monate |
| Negative Konten / falsch herum | Gruppe 4 |
| Komische / erstmals bebuchte Konten | Gruppe 1 |
| USt-Schlüssel, Soll/Haben, Belegnummer durchgängig je Konto | Gruppe 5 |
| Vorsteuerprüfung (Rest) | Gruppe 6 |
| Kreditoren/Debitoren nicht ansehen | Personenkonten ausgeblendet |
| Kontenhistorie, Konto aufklappen | Detail |
| Abschreibungen, BWA, UStVA | **nicht** — bleiben DATEV (R4); Hinweis-Zeile im Prüfprotokoll |

## 8. Datenkontrakt

**Reads:** Vergleichs-Engine je Konto (`getTrialBalance` × 4, gecacht je
Lauf) · 12-Monats-Reihe · `getAccountSheet(account, month)` ·
Befund-Ableitung (reine Funktion, getestet je Gruppe) · `getVatAssessment`
Restliste · Regeln je Konto.

**Writes:** `recordReviewCheck` (sechs `check_kind`s) ·
`raiseCaseClarification({ audience: 'agent' })` · Storno über den bestehenden
Pfad.

## 9. Nicht-Ziele

- Keine BWA, keine UStVA, keine AfA-Berechnung.
- Keine je Mandant konfigurierbaren Schwellen in v1.

---

## 10. Jobs to be done — was die Nutzerin auf dieser Seite tut

| # | Job | Was sie dafür sehen muss | Aktion · Taste | Fertig, wenn |
|---|---|---|---|---|
| J1 | **Die Saldenliste gegen die Vormonate lesen** — was fällt auf? | Konten-Vergleichstabelle, sortiert nach Abweichung, gefärbt | Filter „nur auffällige" · Sortierung | — |
| J2 | **Einen Befund beurteilen** — erstmals / fehlt / Abweichung / Vorzeichen / Konsistenz | Detail: 12-Monats-Verlauf, Kontenblatt des Monats mit Herkunft je Zeile, Regel-Verweis | `Enter` · Klick Zeile → Sachverhalt | verstanden |
| J3 | **Einen Befund quittieren** | Grund optional | `A` | Quittung gespeichert |
| J4 | **Eine falsche Buchung korrigieren lassen** | Sprung zum Sachverhalt in Schritt 3 | `E` | in Schritt 3 |
| J5 | **Den Agenten fragen** — „warum erstmals 6851?" | Klärung an Agent | `F` | Korb +1 |
| J6 | **Ein fehlendes Konto erklären** — Miete nicht gebucht? | Dauersachverhalt-Regel, letzte Periode, Sollstellungs-Status | Sprung `/recurring` · `F` | quittiert oder Korb |
| J7 | **Vorsteuer-Restliste abarbeiten** | Ereignisse mit Verdikt `blocked`/`uncertain` und Rationale | `Enter` → Sachverhalt · `A` | jeder Rest entschieden |
| J8 | **Einen Storno anstoßen** (exportierte Sätze) | Original-Satz, Storno-Pfad | Button | Storno-Satz `proposed` |
| J9 | **Das Kontenblatt lesen** | DATEV-Optik, Saldo laufend | Klick Konto | — |

## 11. Informations-Check — hat jeder Job, was er braucht?

| Job | Benötigt | Vorhanden in | Lücke / Bewertung |
|---|---|---|---|
| J1 | Monatssalden je Konto M-3…M, Kontoklasse, Personenkonten-Ausschluss | `getTrialBalance(year, month)` × 4 über `client_effective_journal_lines`; `client_ledger_accounts.skr_class/accounting_role` | ✓ — Tabelle je Lauf cachen |
| J2 | 12 Monate, Kontenblatt mit Herkunft, Automatikkonto | Saldenliste je Monat; `getAccountSheet`; `client_ledger_accounts.datev_main_function_number/datev_tax_rate` | ✓ |
| J2 Gruppe 5 | BU-Streuung, Seitenwechsel, Belegfeld-Muster | Kontenblatt-Zeilen (`tax_key`, `side`, `external_document_number`) | ⚠ — **Belegfeld-Muster** ist eine neue Ableitung (Regex-Klassen: `RE-…`, `MMJJJJ`, numerisch); ohne sie zeigt Gruppe 5 nur BU und Seite — ausreichend für v1 |
| J3 | Quittung | `recordReviewCheck` (`account_first_use` · `account_missing` · `account_deviation` · `account_sign` · `account_consistency` · `vat_finding`) | ✓ |
| J6 | Regel je Konto, letzte Sollstellung | `client_accounting_case_rule.fy_template_counter_account_id`, `list_overdue_recurring` | ✓ |
| J7 | Vorsteuer-Verdikte | `get_vat_assessment` je Ereignis; Abgleich „in Schritt 3 behandelt" über Quittungen `proposal_checkpoint` | ✓ |
| J8 | Storno-Pfad | bestehender Storno-Kern (`system_reversal`, nur `exported`) | ✓ |

**Fazit:** vollständig bedienbar; eine Ableitung (Belegfeld-Muster) ist
optional für v1.

## 12. Datenmodell dieses Screens mit Beispieldatensatz

```yaml
Vergleichs-Engine je Konto (Periode 2026-08, Personenkonten ausgeblendet):
  - {account: "6310", name: Miete,                   m3: 1700,  m2: 1700,  m1: 1700,  avg: 1700,  current: 1800,  deviationPct: 5.9,   flagged: false}
  - {account: "6600", name: Werbekosten,             m3: 410,   m2: 380,   m1: 12900, avg: 4563,  current: 390,   deviationPct: -91.5, flagged: true,  finding: account_deviation}
  - {account: "6222", name: AfA Kfz,                 m3: 310,   m2: 310,   m1: 310,   avg: 310,   current: 0,     deviationPct: -100,  flagged: true,  finding: account_missing}
  - {account: "6851", name: Nebenkosten Geldverkehr, m3: 0,     m2: 0,     m1: 0,     avg: 0,     current: 129,   deviationPct: null,  flagged: true,  finding: account_first_use}
  - {account: "4400", name: Erlöse 19 %,             m3: 58900, m2: 61200, m1: 57400, avg: 59167, current: 60100, deviationPct: 1.6,   flagged: false}
  - {account: "6805", name: Telefon,                 m3: 92.10, m2: 89.25, m1: 89.25, avg: 90.20, current: 89.25, deviationPct: -1.1,  flagged: false}

Weitere Befunde:
  - {finding: account_sign, account: "6640", name: Bewirtung, balance: -120.00, reason: "Aufwandskonto mit Haben-Saldo", entries: [je-144B (Storno? reverses_entry_id: null)]}
  - {finding: account_consistency, account: "6815", name: Bürobedarf, tax_keys_used: ["9", "8"], sides: [debit], doc_patterns: ["RE-…", numeric]}
  - {finding: vat_finding, case: SV-2026-0144, verdict: uncertain, rationale: "Bewirtungsbeleg ohne Teilnehmerangabe — Vorsteuer nur bei vollständigem Bewirtungsnachweis", handled_in_step3: false}

client_ledger_accounts (6600):
  account_number: "6600"   name: Werbekosten   skr_class: expense   accounting_role: general_ledger
  datev_main_function_number: null   datev_tax_rate: null   account_kind: expense

12-Monats-Reihe 6600: [09/25: 420, 10/25: 390, 11/25: 3900, 12/25: 410, 01/26: 400, 02/26: 380, 03/26: 410, 04/26: 400, 05/26: 410, 06/26: 380, 07/26: 12900, 08/26: 390]

Kontenblatt 6600 (08/2026, getAccountSheet):
  - {date: 2026-08-06, doc1: RE-2026-7712, counter: "70031 Werbeagentur Kling", text: "Social Ads August", debit: 390.00, credit: null, balance: 390.00, source: ludwig, status: accepted, case: SV-2026-0192}

Dauersachverhalt-Regel für 6222 (account_missing):
  client_accounting_case_rule: {case_id: SV-2025-0031 „AfA Kfz monatlich", booking_mode: accrue_then_settle, expected_interval: monthly, fy_template_counter_account_id: → 6222, template_amount: 310.00, valid_until: 2026-07-31}
  # → Regel lief im Juli aus → Befund erklärt sich; Quittung mit Grund

Nach Bearbeitung (client_review_checks):
  - {check_kind: account_deviation, subject_key: "6600", period: 2026-08, value_hash: h(390,4563), note: "Juli war die Messe"}
  - {check_kind: account_missing,   subject_key: "6222", period: 2026-08, note: "AfA-Regel lief 07/2026 aus — Jahres-AfA in DATEV"}
  - {check_kind: account_first_use, subject_key: "6851", period: 2026-08, note: null}
```

## 13. DATEV-Hinweise

- **Summen- und Saldenliste (SuSa):** `Konto · Bezeichnung · EB-Wert · Soll ·
  Haben · Saldo`, wahlweise mit **Vormonats-/Vorjahresspalte**. Unsere
  Vergleichstabelle ist eine SuSa mit drei Vormonatsspalten und einer
  Abweichungsspalte — Spaltenreihenfolge und Zahlenformat (rechtsbündig,
  Tausenderpunkt, S/H-Kennzeichen beim Saldo) übernehmen, Monatsnamen als
  Spaltenköpfe.
- **BWA mit Vorjahresvergleich:** DATEV stellt Monat, kumuliert, Vorjahr und
  Abweichung in % nebeneinander. Die Buchhalterin liest also **Prozent-
  Abweichungen mit Vorzeichen** routiniert — keine Balken nötig in der
  Tabelle; der 12-Monats-Verlauf im Detail darf ein schlichter Balken sein.
- **Kontennachweis / Kontoblatt:** `Datum · Beleg 1 · Beleg 2 · Gegenkonto ·
  Text · Soll · Haben · Saldo` — im Detail unverändert übernehmen, Herkunft
  (Ludwig / DATEV / Vorschlag) als kleines Symbol vor der Zeile.
- **Automatikkonten:** in DATEV am Konto erkennbar (Funktionsnummer);
  Buchungen mit BU auf Automatikkonten sind ein klassischer Fehler → Gruppe
  5 sollte „BU auf Automatikkonto" als eigenen Konsistenz-Befund führen
  (`datev_main_function_number` gesetzt und `tax_key` ≠ null).

## 14. Design-Prinzipien (vom Owner vorgegeben, gelten für jeden Screen)

1. **Business-Webanwendung, nicht Marketing.** Kompakt, übersichtlich, klare
   Navigation. Einfache Bedienung geht vor Ausdruck.
2. **Schlichte Screens.** Neutrale Flächen, wenig Farbe, keine
   Illustrationen. Der Kontext (Stammdaten, Historie, Beleg) wird ruhig und
   sachlich wahrgenommen.
3. **Farbe nur für Probleme.** Rot / orange / gelb, Prioritäten und Ampeln
   markieren ausschließlich das, was Aufmerksamkeit braucht — der Nutzer wird
   visuell zu seinen Aufgaben geführt. Grün ist ein kleiner Haken oder
   eingeklappt, nie eine Fläche.
4. **Hotkey-freundlich.** Wichtige Aktionen zeigen ihre Taste sichtbar am
   Button (`Freigeben · A`). `J`/`K` navigieren, `?` zeigt die Legende, alles
   Wesentliche geht ohne Maus.
5. **Todo-Liste als Grundmuster.** Jeder Screen ist eine Liste von Punkten mit
   Zustand und Zähler; ein Punkt in Arbeit rechts im Detail. Ein Schritt ist
   fertig, wenn kein Punkt mehr offen ist.
6. **Eine Information, ein Ort — und Drawer für den Rest.** Jede Info-Gruppe
   hat einen festen Platz; was nicht auf den Screen passt, geht vollständig in
   einen Drawer, nie verloren.
7. **DATEV-Optik bei Zahlen und Buchungen.** Konto links, Beträge
   rechtsbündig, Soll/Haben getrennt, BU neben dem Konto, Belegfeld 1 sichtbar.
8. **Der Mensch entscheidet, der Server rechnet.** Alles, was deterministisch
   prüfbar ist, steht als Ergebnis da und wird quittiert — nicht nachgerechnet.
9. **Nichts zweimal.** Quittiertes, Freigegebenes, Bestätigtes bleibt beim
   nächsten Durchgang erledigt.
10. **Großer Bildschirm.** Die Anwender arbeiten an 24-Zoll-Monitoren
    (≥ 1920 px). Die Fläche nutzen — mehr nebeneinander, weniger Scrollen,
    Drawer neben statt über der Arbeit — ohne die Dichte in Unruhe kippen zu
    lassen.

## 15. Szenarien für die Vorschau

**Bitte einen Szenario-Umschalter in die Vorschau einbauen** (Dropdown oder
Tabs oben rechts), mit dem man zwischen den folgenden Zuständen des Screens
wechselt. Beispielwerte darf der Gestalter frei erfinden; die Szenarien
selbst sind die relevanten.

| # | Szenario | Was es zeigt |
|---|---|---|
| S1 | **Ruhiger Monat** | Tabelle fast neutral, 1–2 gelbe Zeilen, Filter „nur auffällige" leer-ish |
| S2 | **Abweichung durch Vormonats-Anomalie** (Werbekosten) | −91 % gegen Ø, 12-Monats-Verlauf zeigt den Juli-Ausreißer, Quittieren |
| S3 | **Konto fehlt** (AfA-Regel ausgelaufen) | Gruppe 2 mit Regel-Verweis, Sprung `/recurring` |
| S4 | **Erstmals bebucht** | Gruppe 1, Kontenblatt mit einer Zeile, Frage an den Agenten |
| S5 | **Falsches Vorzeichen** | Aufwandskonto mit Haben-Saldo, Storno-Frage |
| S6 | **Konsistenz-Befund** | ein Konto mit BU 9 und 8 gemischt, abweichende Zeilen markiert |
| S7 | **Vorsteuer-Restliste** | zwei Ereignisse `uncertain` mit Rationale |
| S8 | **Historie zu jung** | Tabelle ohne Abweichungsspalte |
| S9 | **Detail-Drawer Konto** | 12-Monats-Balken + Kontenblatt in DATEV-Optik |
