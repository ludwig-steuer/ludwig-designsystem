# F109 — Design-Brief: Schritt 8 — Prüfprotokoll & Entscheidung

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

**Haben wir alles geprüft — und geht der Monat jetzt nach DATEV, oder noch
einmal zum Agenten?**

Der letzte Schritt ist eine Übersicht: alle Plausibilitäts-Checks des
Reviews als **✓ / ? / ✗**, der Probe-Export, die Blocker, der Rücklauf-Korb
— und die **zwei Ausgänge** nebeneinander. Das Protokoll ist zugleich der
Nachweis „so haben wir 08/2026 geprüft", der als Notiz am Stapel und im
Audit-Log landet.

## 2. Inhalt

### 2.1 Prüfprotokoll

Eine Seite, gruppiert nach Schritt, jede Zeile ein Check mit Symbol und
Sprung:

| Symbol | Bedeutung | Quelle |
|---|---|---|
| **✓** grün | vom Server geprüft **oder** von ihr quittiert ohne Befund | Server-Check bestanden · `client_review_checks` ohne `note` |
| **?** gelb | aufgefallen und **mit Grund** quittiert — der Grund steht in der Zeile | `client_review_checks.note` gesetzt |
| **✗** rot | offen oder blockierend | Server-Check gescheitert · Punkt ohne Quittung |

Beispiel:

```
1  Ist alles da?
   ✓  Saldenanschluss Sparkasse (3 Auszüge, lückenlos)
   ?  Eingangsbelege −58 % gegen Ø 05–07 — „Juli hatte die Jahresabrechnung" (S. Fakir, 27.08. 14:12)
   ✓  Alle 142 Belege im Zeitraum erledigt
2  Rückfragen
   ✓  6 Fragen beantwortet · 1 Override quittiert
3  Vorschläge
   ✓  112 freigegeben (104 unverändert, 8 korrigiert) · ↩ 4 abgelehnt → Rücklauf · ✗ 2 noch offen
4  Bank
   ✓  Bank 100 % erklärt · ?  1617 Kreditkarte −412,80 — „Abrechnung kommt im September"
5  OPOS
   ✓  3 überfällige Posten mit Aktion
6  Konten
   ?  6600 Werbekosten −91 % — „Vormonat war die Messe"  ·  ✓ 5 weitere Befunde quittiert
7  Konventionen
   ✓  2 bestätigt · 0 verworfen · ✗ 1 Kanzlei-Konvention unentschieden
—  Nicht geprüft (bleibt DATEV): AfA · BWA · UStVA
```

### 2.2 Probe-Export

`simulate_export` über alle `accepted`-Sätze des Zeitraums: jede nicht
exportierbare Buchung mit **wörtlicher** Fehlermeldung und Sprung in
Schritt 3. Grün = leer.

### 2.3 Blocker für den Stapel (rot)

| Blocker | Erkennung |
|---|---|
| `proposed`-Sätze im Zeitraum | `client_journal_entry.status = 'proposed'`, `booking_date` im Zeitraum |
| Rote Punkte aus Schritt 1 / 4 | Saldenanschluss, fehlender Auszug, unerledigter Beleg, unerklärte Auszugszeile |
| Probe-Export-Fehler | 2.2 |
| Unentschiedene Kanzlei-Konvention | Schritt 7 |
| Lauf `incomplete` mit Gate `blocked` | Schritt 0 |

**Nicht** blockierend: offene Mandanten-Fragen, überfällige OPOS,
quittierte Befunde (**?**), unbestätigte Mandanten-Konventionen.

### 2.4 Rücklauf-Korb (ausgeklappt)

Alles, was an den Agenten geht, nach Art gruppiert, editierbar, löschbar:

| Art | Quelle | Beispiel |
|---|---|---|
| Abgelehnte Vorschläge mit Kommentar | `client_journal_entry.status = 'rejected'` seit Lauf-Ende + Kommentar | „SV-2026-0198 Satz A: falsches Konto, gehört auf 0650 (Aktivierung)" |
| Beantwortete Fragen | Klärungen `answered_at` seit Lauf-Ende | „SV-2026-0144: Aktivieren auf 0650" |
| Beanstandungen / Fragen an den Agenten | Klärungen `audience = 'agent'` seit Lauf-Ende | „Override 3f: Lieferscheine bitte als Erwartung anlegen" |
| Merge-Aufträge | Klärung `audience = 'agent'` mit Vorlage | „SV-0161 und SV-0173 zusammenführen" |
| Verworfene Konventionen | F106 verworfen seit Lauf-Ende | „K-07 verworfen: Telekom-Printprodukte sind 7 %" |
| Hinweise „trotzdem freigegeben" | Klärungen `audience = 'agent'`, `severity = 'optional'` | „Beim nächsten Mal Belegfeld ohne Bindestrich" |
| Freitext-Auftrag | Eingabe hier | „Bitte Kassenbelege vom 12.08. nochmal prüfen" |

Der Korb ist **kein Speicher** — er ist die Abfrage „was seit Lauf-Ende in
dieser Periode an den Agenten adressiert wurde". Löschen im Korb = die
Klärung auflösen bzw. die Ablehnung zurücknehmen.

### 2.5 Zahlen des Reviews

Deterministisch: freigegeben unverändert / korrigiert / abgelehnt
(`acceptance_quality`, `status`) · quittierte Befunde · Konventionen
bestätigt / verworfen · Dauer des Reviews · Vergleich zum Vorgänger-Review
derselben Periode.

## 3. Die zwei Ausgänge — nebeneinander, gleichwertig, große Karten

### „Stapel anlegen"

Aktiv **nur ohne Blocker**. Führt in den bestehenden **Export-Wizard**
(`DatevExportWizard`, 3 Schritte: Zeitraum → Vorschau → Stapel anlegen) mit
Zeitraum aus dem Lauf vorbelegt, Nachzügler-Zähler, CSV/Bridge nach
Mandanten-Default. Das Prüfprotokoll geht als Stapel-Notiz (`note`) mit.
Danach: Review `abgeschlossen`, zurück auf Schritt 0 mit Stapelnummer und
Link auf die Export-Historie.

Karte zeigt vorab: Anzahl Sätze · Σ Soll · Σ Haben · Zeitraum · Zielsystem ·
„Protokoll wird als Notiz angehängt".

### „Zurück an den Agenten"

Aktiv, sobald der Korb nicht leer ist **oder** ein Freitext-Auftrag steht.
Zeigt, was mitgeht (2.4), und **dass der neue Lauf nur die Residuen
bearbeitet**: Freigegebenes bleibt, Quittiertes bleibt, Bestätigtes bleibt.
Startet den Lauf über den bestehenden Trigger — solange der fehlt:
„Auftrag liegt bereit — Lauf manuell starten" (`buchung-offen.md`
„Buchungslauf-Trigger"). Review `zurückgegeben`, Schritt 0 zeigt den
laufenden Lauf.

Beide dürfen mehrfach hintereinander passieren; ein Monat kann drei Läufe
und drei Reviews haben.

## 4. Der Wiedereinstieg — Diff-Modus

Der Folgelauf hat eine neue `runId`, dieselbe Periode. Das neue Review
öffnet im Diff-Modus (Schritt 0: „Seit deinem letzten Review"); hier in
Schritt 8 zusätzlich:

- **Was aus dem letzten Korb wurde:** je Korb-Punkt des Vorgängers der
  Stand — erledigt (neuer Satz / Antwort verarbeitet) · unverändert offen
  mit der Begründung des Agenten aus `client_agent_runs.report` · neue
  Gegenfrage (S11, steht in Schritt 2).
- Ersetzte Sätze: „vorher / nachher" (Konto, Betrag, BU, Belegfeld farbig
  diffend) und die Kommentar-Kette ihre Ablehnung → seine Antwort.
- Der Korb ist leer und beginnt neu.

## 5. Zustände

| Zustand | Darstellung |
|---|---|
| Blocker vorhanden | „Stapel anlegen" inaktiv mit Liste der Blocker (jeder ein Sprung); „Zurück an den Agenten" aktiv, wenn Korb nicht leer |
| Kein Blocker, Korb leer | „Stapel anlegen" primär hervorgehoben |
| Kein Blocker, Korb nicht leer | beide aktiv — die Buchhalterin entscheidet: Stapel jetzt (Korb geht trotzdem an den Agenten für den Folgelauf) oder erst Rücklauf |
| Review abgeschlossen | Seite read-only, Protokoll mit Stapelnummer |

## 6. Kanzlei-Ablauf, den dieser Schritt abdeckt

| Kanzlei-Ablauf | Hier |
|---|---|
| UStVA | **nicht** (R4) — der Probe-Export ist der Ersatz-Check |
| Abschreibungen, BWA | Hinweis-Zeile „bleibt DATEV" |
| Gesamtprüfung / Nachweis | Prüfprotokoll |

## 7. Datenkontrakt

**Reads:** `simulateExportForClient` · Prüfprotokoll-Projektion
(`client_review_checks` ∪ Server-Checks aller Schritte) · Blocker-Aggregat
· Korb-Abfrage · Review-Zahlen.

**Writes:**

| Aktion | Kern |
|---|---|
| Stapel anlegen | Export-Wizard (`createExportvorgang` / `runDatevExport`), Prüfprotokoll als `note` — sonst unverändert |
| Zurück an den Agenten | bestehender Lauf-Trigger (offen); bis dahin Markierung „Auftrag bereit" |
| Freitext-Auftrag | Klärung `audience = 'agent'` am Lauf-Kontext |
| Korb-Punkt löschen | `resolveClarification` bzw. Ablehnung zurücknehmen (`rejected` → `proposed`) |

## 8. Nicht-Ziele

- Kein eigener Korb-Speicher, kein zweiter Export-Pfad.
- Kein Auto-Export nach grünem Protokoll — der Klick bleibt.

## 9. Offen (Owner)

- **Lauf-Trigger aus der Oberfläche** — „Zurück an den Agenten" braucht den
  Start eines Laufs; der Trigger ist offen. Bis dahin: Auftrag liegt bereit,
  Start manuell.

---

## 10. Jobs to be done — was die Nutzerin auf dieser Seite tut

| # | Job | Was sie dafür sehen muss | Aktion · Taste | Fertig, wenn |
|---|---|---|---|---|
| J1 | **Sehen, ob alles geprüft ist** — auf einen Blick | Prüfprotokoll ✓ / ? / ✗ je Schritt, Zähler | lesen | kein ✗ |
| J2 | **Einen Blocker beheben** | Blocker-Liste mit Sprung | `Enter` → Schritt | Blocker weg |
| J3 | **Den Probe-Export lesen und Fehler beheben** | Fehlermeldung wörtlich, Satz, Sprung in Schritt 3 | `Enter` | Probe-Export leer |
| J4 | **Den Rücklauf-Korb kuratieren** — lesen, ergänzen, löschen | Korb nach Art, editierbar; Freitext-Auftrag | `Enter` bearbeiten · `Del` löschen · Freitext | — |
| J5 | **Stapel anlegen** | Vorschau: Anzahl, Σ Soll/Haben, Zeitraum, Ziel; Protokoll geht mit | `Ctrl+Enter` / Button (nur ohne Blocker) → Export-Wizard | Stapel angelegt, Review `abgeschlossen` |
| J6 | **Zurück an den Agenten geben** | was mitgeht; Zusicherung „nur Residuen" | Button (Korb nicht leer) | Review `zurückgegeben` |
| J7 | **Den Nachweis sichern** — Protokoll als Notiz am Stapel, drucken/PDF | Protokoll-Ansicht, Druckansicht | „Als PDF" | — |
| J8 | **Die Zahlen des Reviews sehen** — unverändert / korrigiert / abgelehnt, Dauer, Vergleich Vorgänger | Zahlen-Block | lesen | — |
| J9 | **Im Diff-Modus sehen, was aus dem letzten Korb wurde** | je Korb-Punkt: erledigt / offen mit Begründung / Gegenfrage | lesen · Sprung | — |
| J10 | **Eine Freigabe zurücknehmen** (bis zum Stapel) | Listenseite Schritt 3 | dort | `accepted` → `proposed` |

## 11. Informations-Check — hat jeder Job, was er braucht?

| Job | Benötigt | Vorhanden in | Lücke / Bewertung |
|---|---|---|---|
| J1 | alle Quittungen + Server-Checks je Schritt | `client_review_checks` (Periode, `check_kind`, `note`, `value_hash`) ∪ Server-Checks (Gates, Saldo, Probe-Export) | ✓ — Projektion; `value_hash` stale → Zeile wird ✗ mit Hinweis „Wert hat sich geändert" |
| J2 | Blocker-Aggregat | `proposed` im Zeitraum · Gate 1a/3f/4d · Probe-Export · Kanzlei-Konvention offen · Lauf `blocked` | ✓ |
| J3 | Probe-Export | `simulateExportForClient` (wörtliche Fehlermeldungen je Satz) | ✓ |
| J4 | Korb-Abfrage | Sätze `rejected` seit `finished_at` + Kommentar; Klärungen `answered_at` / `audience='agent'` seit `finished_at`; verworfene Konventionen; Freitext | ⚠ — **Freitext-Auftrag** hat keinen Sachverhalt; Träger: Klärung `audience='agent'` am **Lauf** (kein `case_id`) — heute ist `case_id` Pflicht. Vorschlag: `case_id` nullable **oder** ein Lauf-Sachverhalt je Periode. Bau-Entscheidung |
| J5 | Vorschau-Zahlen, Wizard, Notiz | Export-Wizard (`createExportvorgang` mit `note`) | ✓ |
| J6 | Trigger | **offen** (`buchung-offen.md` Buchungslauf-Trigger) | ⚠ — bis dahin Markierung „Auftrag bereit" + manueller Start |
| J7 | Druckansicht | Print-CSS der Protokoll-Ansicht; Stapel-`note` | ✓ (kein PDF-Generator nötig — Browser-Druck) |
| J8 | Zähler | `acceptance_quality`, `status`, Quittungen, Konventionen, Zeitstempel erster/letzter Review-Aktion | ✓ — Dauer = erste bis letzte Quittung/Freigabe des Laufs (kein Review-Objekt nötig) |
| J9 | Zuordnung Korb-Punkt → Ergebnis | Vorgänger-Korb (Abfrage) × neue Sätze/Klärungen × `stats.unresolved[]` (Wunsch an den Agenten, Schritt 0) | ⚠ — ohne `unresolved[]` nur „erledigt / unbekannt" |
| J10 | Rücknahme | `accepted` → `proposed` solange kein `export_batch_id` | ✓ Kern muss existieren (Bau prüfen) |

**Fazit:** bedienbar; zwei Bau-Entscheidungen (Träger für laufbezogene
Klärungen, Rücknahme-Kern) und eine externe Abhängigkeit (Lauf-Trigger).

## 12. Datenmodell dieses Screens mit Beispieldatensatz

```yaml
Prüfprotokoll (Projektion, Periode 2026-08, Lauf run-14):
  - {step: 1, kind: bank_balance_link,   subject: pa-1,          state: ok,   label: "Saldenanschluss Sparkasse (3 Auszüge, lückenlos)", source: server}
  - {step: 1, kind: volume_row,          subject: docs_inbound,  state: note, label: "Eingangsbelege −58 % gegen Ø 05–07", note: "Juli hatte die Jahresabrechnung", by: u-simon, at: 2026-08-27T12:12Z}
  - {step: 1, kind: docs_completed,      subject: period,        state: ok,   label: "Alle 142 Belege im Zeitraum erledigt", source: server}
  - {step: 2, kind: clarifications,      subject: accounting,    state: ok,   label: "6 Fragen beantwortet"}
  - {step: 2, kind: gate_override,       subject: st-3f,         state: ok,   label: "Override 3f quittiert"}
  - {step: 3, kind: proposals,           subject: period,        state: open, label: "112 freigegeben (104 unverändert, 8 korrigiert) · 4 abgelehnt → Rücklauf · 2 offen"}
  - {step: 4, kind: bank_explained,      subject: pa-1,          state: ok,   label: "Bank 100 % erklärt", source: server}
  - {step: 4, kind: clearing_account_zero, subject: "1617",      state: note, label: "1617 Kreditkarte −412,80", note: "Kartenabrechnung kommt im September"}
  - {step: 5, kind: open_items,          subject: period,        state: ok,   label: "3 überfällige Posten mit Aktion"}
  - {step: 6, kind: account_deviation,   subject: "6600",        state: note, label: "6600 Werbekosten −91 %", note: "Juli war die Messe"}
  - {step: 7, kind: conventions,         subject: period,        state: open, label: "2 bestätigt · 1 Kanzlei-Konvention unentschieden"}
  - {step: null, kind: out_of_scope,     subject: datev,         state: info, label: "Nicht geprüft (bleibt DATEV): AfA · BWA · UStVA"}

Probe-Export (simulateExportForClient, 2026-08):
  errors:
    - {journal_entry_id: je-203A, case: SV-2026-0203, message: "Konto 4400 ist Automatikkonto — BU-Schlüssel 3 nicht zulässig", jump: step3}
  exportable: 111   not_exportable: 1

Blocker:
  - {kind: proposed_in_period, count: 2, jump: step3}
  - {kind: export_error, count: 1, jump: step3}
  - {kind: tenant_convention_pending, ref: T-03, jump: step7}

Korb (Abfrage seit run-14.finished_at):
  - {kind: rejected_proposal, journal_entry_id: je-198A, case: SV-2026-0198, comment: "Falsches Konto — gehört auf 0650 (Aktivierung)", at: 2026-08-27T12:31Z}
  - {kind: answered_clarification, clarification_id: cl-51, case: SV-2026-0198, answer: "Aktivieren auf 0650, AfA 13 Jahre"}
  - {kind: agent_question, clarification_id: cl-58, case: SV-2026-0161, text: "SV-0161 und SV-0166 zusammenführen — gleiche Rechnung"}
  - {kind: rejected_convention, id: K-09, reason: "bleibt verworfen — Einzelfall prüfen"}
  - {kind: hint_after_accept, clarification_id: cl-60, case: SV-2026-0187, text: "Belegfeld künftig ohne Bindestrich"}
  - {kind: free_text, text: "Bitte Kassenbelege vom 12.08. noch einmal prüfen"}          # Träger: Bau-Entscheidung

Zahlen des Reviews:
  accepted_unmodified: 104   accepted_edited: 8   rejected: 4   checks_noted: 4   conventions_confirmed: 2   conventions_rejected: 1
  duration_min: 74   predecessor: null

Ausgänge:
  stapel_anlegen: {enabled: false, reason: "3 Blocker"}
  zurueck_an_agent: {enabled: true, items: 6, trigger_available: false}      # → „Auftrag liegt bereit — Lauf manuell starten"

Nach „Stapel anlegen" (später, ohne Blocker):
  client_datev_export_batches: {id: batch-31, period: 2026-08, entries: 112, note: "<Prüfprotokoll als Text>", created_at: …}
  review_status: abgeschlossen
```

## 13. DATEV-Hinweise

- **Stapelverarbeitung / Protokoll:** Beim Verarbeiten eines Buchungsstapels
  zeigt DATEV ein Protokoll mit Fehlerliste — je Fehler Zeilennummer,
  Konto, Meldung im Wortlaut (z. B. „Konto 4400: Buchung mit BU-Schlüssel auf
  Automatikkonto nicht zulässig"). Der Probe-Export soll **dieselben
  Meldungstexte** zeigen, die DATEV beim Import ausgibt — die Buchhalterin
  erkennt sie wieder und weiß sofort, was zu tun ist.
- **Festschreiben:** DATEV kennt den Unterschied „gebucht" und
  „festgeschrieben" (GoBD). Unser Stapel ist die Übergabe; das Festschreiben
  passiert in DATEV. Der Text auf der Karte „Stapel anlegen" sollte das
  sagen („wird in DATEV importiert, dort festgeschrieben"), damit niemand
  glaubt, hier sei etwas unumkehrbar.
- **Buchungsstapel-Übersicht:** Stapelnummer, Zeitraum, Anzahl Buchungen,
  Status. Nach dem Anlegen genau diese vier Werte zeigen.
- **Prüfprotokoll als Nachweis:** In der Kanzlei ist das die
  Abschluss-Checkliste des Monats (oft Papier oder Excel). Die Druckansicht
  soll wie eine Checkliste aussehen — Schritt, Prüfung, Ergebnis, wer, wann —
  keine Grafik.

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
| S1 | **Alles grün, Korb leer** | Protokoll nur ✓ und ?, Probe-Export leer, „Stapel anlegen" primär, „Zurück an den Agenten" inaktiv |
| S2 | **Blocker vorhanden** | 2 `proposed`, 1 Export-Fehler, 1 Kanzlei-Konvention — Liste mit Sprüngen, „Stapel anlegen" inaktiv |
| S3 | **Korb voll, kein Blocker** | beide Ausgänge aktiv, Korb nach Art ausgeklappt, editierbar |
| S4 | **Zurück an den Agenten ohne Trigger** | „Auftrag liegt bereit — Lauf manuell starten" |
| S5 | **Diff-Modus** | „Was aus dem letzten Korb wurde": erledigt / offen mit Begründung / Gegenfrage |
| S6 | **Nach Stapel** | read-only, Stapelnummer, Zeitraum, Anzahl, Link Export-Historie |
| S7 | **Druckansicht des Protokolls** | Checklisten-Optik: Schritt · Prüfung · Ergebnis · wer · wann |
