# F109 — Design-Brief: Schritt 5 — Wer schuldet wem?

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

**Welche offenen Posten gibt es je Gegenpartei, welche sind überfällig, und
was tun wir damit?**

Die OPOS-Prüfung der Kanzlei: nach Gegenpartei, Zahlungsziel, überfällig →
Aktion (Mandant fragen: bezahlt? anderes Konto? — oder mahnen lassen),
Dubletten. Grundlage sind Ludwigs **Erwartungen**
(`client_accounting_case_expectation`, S7/S8): „zu diesem Sachverhalt fehlt
noch eine Zahlung / ein Beleg", mit Frist und Eskalationsstufe.

## 2. Gliederung

Nach **Gegenpartei** (Personenkonto), innerhalb nach Alter. Drei Reiter aus
dem Erwartungs-Status:

| Reiter | Erkennung | Darstellung |
|---|---|---|
| **Innerhalb der Frist** | `status = 'pending'`, `due_date` ≥ heute | nur Zähler und Summe je Gegenpartei, eingeklappt |
| **Überfällig → Aktion** | `status in ('due','escalated')`, `escalation_level`, `escalated_at` | offen, Eskalationsstufe sichtbar, teuerste zuerst |
| **Bekannt wartend** | vom Menschen markiert (Notiz + Wiedervorlage-Datum) | kommt am Wiedervorlage-Tag zurück nach „Aktion" |

**Listenpunkt:** Gegenpartei (`expected_counterparty_name`, Personenkonto) ·
Sachverhalt `case_number` + `title` · Belegnummer (`expected_reference`) ·
offener Betrag (aus den Ereignissen: Beleg − Teilzahlungen) · Fälligkeit
(`due_date`) mit Herkunft (`due_source`: Beleg-Zahlungsziel · Partner-Default
· Regel) · Tage überfällig · Stufe.

Beispiel:

```
Debitor 10087 Kunde Nord GmbH                                  3 Posten · 7.420,00 €
  SV-2026-0161  AR-2026-0412   2.980,00   fällig 15.08. (Beleg)   12 Tage   Stufe 2
  SV-2026-0173  AR-2026-0431   3.200,00   fällig 22.08. (Beleg)    5 Tage   Stufe 1
  SV-2026-0180  AR-2026-0440   1.240,00   fällig 04.09.            —        in Frist
```

## 3. Detail je Posten

| Element | Quelle | Beispiel |
|---|---|---|
| Sachverhalt-Kurzform | `client_accounting_case` | Titel, Gegenpartei, Ereignisse |
| Beleg | Beleg-Shell (lazy) | AR-2026-0412 |
| Offener Betrag mit Breakdown | Ereignisse | `2.980,00 = Beleg 2.980,00 − Teilzahlung 0,00` |
| Zahlungsziel mit Herkunft | `due_date`, `due_source` | „15.08. — laut Beleg, 14 Tage netto" |
| DATEV-OPOS-Stand | Spiegel (`client_datev_mirror_entries`, Replay-Stichtag) | „DATEV 25.08.: offen 2.980,00" — Abweichung gelb |
| Notizen und Klärungen | Sachverhalts-Kommentare, Klärungen | chronologisch |
| Freitext-Notiz | Sachverhalts-Kommentar | Eingabe |

## 4. Aktionen

| Aktion | Wirkung | Kern |
|---|---|---|
| **Mandant fragen** | Klärung `audience = 'client'`, `answer_kind = 'single_choice'`, Optionen als Handlungen: „Bezahlt am … auf anderes Konto — Auszug nachreichen" · „Noch offen, wird gemahnt" · „Rechnung wird storniert" | `raiseCaseClarification` |
| **Als bekannt wartend markieren** | Notiz + Wiedervorlage-Datum; Posten wandert in „Bekannt wartend" | Sachverhalts-Kommentar + `recordReviewCheck(check_kind = 'open_item_waiting')` |
| **Mahnhinweis für DATEV notieren** | Notiz am Sachverhalt — Mahnwesen bleibt DATEV (R4) | Sachverhalts-Kommentar |
| Sachverhalt / Beleg öffnen | Drawer | read |

## 5. Dubletten-Verdacht (Banner)

Gleiche Gegenpartei, gleicher Betrag (± 1 ct), Datum ± 3 Tage, **zwei
Sachverhalte** (`get_proposal_batch_overview` C2, Belegnummern-Register).
Banner über der Liste, Klick öffnet beide Belege nebeneinander.

**Aktionen:** **Zusammenführen** (Agent-Auftrag in den Rücklauf-Korb, weil
`merge_cases` die Belegnummer entscheidet, S5) · **Beide echt** (Quittung
`recordReviewCheck(check_kind = 'duplicate_pair')`).

## 6. Nicht hier

Der **DATEV-Altbestand** (OPOS vor Ludwig) bleibt auf der OPOS-Seite (Link
„Altbestand ansehen"); hier nur Posten aus Ludwig-Buchungen dieses
Wirtschaftsjahres (S7).

## 7. Zustände

- **Fertig:** kein überfälliger Posten ohne Aktion (Frage gestellt,
  wartend markiert oder Mahnhinweis).
- **Nicht blockierend** für den Stapel: überfällige Posten verhindern den
  Export nicht.

## 8. Kanzlei-Ablauf, den dieser Schritt abdeckt

| Kanzlei-Ablauf | Hier | Datenquelle |
|---|---|---|
| OPOS je Gegenpartei, Zahlungsziel, überfällig | 2–4 | Erwartungen mit Frist + Stufe |
| OPOS doppelt / Belege doppelt | 5 | Batch-Overview C2, Belegnummern-Register |
| Anderes Bankkonto? Noch nicht bezahlt? | 4 „Mandant fragen" | Klärung mit Antwortoptionen |
| Müssen wir mahnen? | 4 Notiz | Sachverhalts-Kommentar; Mahnwesen bleibt DATEV |
| Notizen erfassen | 3 Freitext | Sachverhalts-Kommentar (F106) |

## 9. Datenkontrakt

**Reads:** Erwartungen mit Frist/Stufe je Gegenpartei · `loadCaseOpenPayments`
· Dubletten aus Batch-Overview · `loadOposBestand` als Vergleichsspalte.

**Writes:** `raiseCaseClarification` · Sachverhalts-Kommentar (+
Wiedervorlage-Datum) · `recordReviewCheck` · Merge-Auftrag = Klärung
`audience = 'agent'` mit Vorlage „SV-A und SV-B zusammenführen".

---

## 10. Jobs to be done — was die Nutzerin auf dieser Seite tut

| # | Job | Was sie dafür sehen muss | Aktion · Taste | Fertig, wenn |
|---|---|---|---|---|
| J1 | **Sehen, wer wem was schuldet** — je Gegenpartei, mit Summe | Gruppen je Personenkonto, Posten mit Belegnummer, Betrag, Fälligkeit, Tage überfällig, Stufe | lesen · Gruppe auf/zu | — |
| J2 | **Einen überfälligen Posten in Aktion bringen** | Detail mit Breakdown, DATEV-OPOS-Stand, Notizen | `F` Mandant fragen · `W` wartend markieren + Datum · `M` Mahnhinweis | Posten hat Aktion |
| J3 | **Den Mandanten gezielt fragen** — bezahlt? anderes Konto? storniert? | Klärungs-Dialog mit vorgelegten Antworten | `F`, Option wählen | Klärung offen |
| J4 | **Einen Dubletten-Verdacht entscheiden** | beide Belege nebeneinander, Betrag/Datum/Nummer | „Zusammenführen" (Korb) · „Beide echt" (`A`) | entschieden |
| J5 | **Den DATEV-OPOS-Stand vergleichen** | Spiegel-Spalte mit Stichtag, Abweichung markiert | lesen | — |
| J6 | **Notizen hinterlassen / lesen** | Kommentare am Sachverhalt | Freitext + `Enter` | — |
| J7 | **Zum Sachverhalt oder Beleg springen** | Drawer | `S` · `B` | — |
| J8 | **Erkennen, dass nichts blockiert** | Hinweis „OPOS blockieren den Stapel nicht" | lesen | — |

## 11. Informations-Check — hat jeder Job, was er braucht?

| Job | Benötigt | Vorhanden in | Lücke / Bewertung |
|---|---|---|---|
| J1 | Erwartung mit Gegenpartei, Betrag, Fälligkeit, Stufe; offener Betrag aus Ereignissen | `client_accounting_case_expectation.kind/direction/expected_counterparty_name/_partner_id/expected_amount/expected_reference/due_date/due_source/escalation_level/escalated_at/status`, Ereignisse | ✓ — Personenkonto über `client_accounting_case.fy_personal_account_id` |
| J2 | wartend-Markierung mit Datum | Sachverhalts-Kommentar + Wiedervorlage | ⚠ — Erwartungen haben **kein Wiedervorlage-Feld**; Vorschlag: `recordReviewCheck(check_kind='open_item_waiting', note, value_hash)` trägt das Datum in `note`/Payload, und die Liste liest es. Keine neue Spalte an der Erwartung |
| J3 | Klärung mit Optionen | `raiseCaseClarification({audience:'client', answerKind:'single_choice', answerOptions})` | ✓ |
| J4 | Dubletten-Kandidaten | `get_proposal_batch_overview` C2 (gleicher Kreditor, Betrag ± 1 ct, Datum ± 3 Tage), Belegnummern-Register | ✓ — Merge selbst bleibt Agent (`merge_cases`, S5) |
| J5 | DATEV-OPOS zum Stichtag | `loadOposBestand` (Spiegel-Replay) | ✓ — Stichtag des Spiegels anzeigen (`client_datev_mirror_entries` Snapshot `as_of`) |
| J6 | Kommentare | Sachverhalts-Kommentar (F106) | ✓ |
| J8 | Blocker-Regel | Schritt 8 | ✓ |

**Fazit:** vollständig bedienbar; „bekannt wartend" läuft über die Quittung
statt über ein neues Feld.

## 12. Datenmodell dieses Screens mit Beispieldatensatz

```yaml
client_accounting_case_expectation (offen, Periode ≤ 2026-08):
  - id: ex-61   case_id: → SV-2026-0161 „Kunde Nord AR-2026-0412"   kind: payment   direction: inbound
    expected_counterparty_name: Kunde Nord GmbH   expected_counterparty_partner_id: → Debitor 10087
    expected_amount: 2980.00   expected_reference: AR-2026-0412   expected_date: 2026-08-15
    due_date: 2026-08-15   due_source: invoice_terms   status: escalated   escalation_level: 2   escalated_at: 2026-08-25
    origin_journal_entry_id: je-161A   resolved_at: null
  - id: ex-73   case_id: → SV-2026-0173 „Kunde Nord AR-2026-0431"   kind: payment   expected_amount: 3200.00
    due_date: 2026-08-22   due_source: invoice_terms   status: due   escalation_level: 1
  - id: ex-80   case_id: → SV-2026-0180   kind: payment   expected_amount: 1240.00   due_date: 2026-09-04   status: pending
  - id: ex-77   case_id: → SV-2026-0177 „Lieferung Schmidt"   kind: document   expected_document_kind: invoice
    expected_amount: 890.00   due_date: 2026-08-30   status: pending          # fehlender Beleg zu einer Zahlung

Gruppierung (abgeleitet):
  - {personal_account: "10087", name: Kunde Nord GmbH, side: debtor, count: 3, sum_open: 7420.00,
     items: [ex-61 (12 Tage überfällig, Stufe 2), ex-73 (5 Tage, Stufe 1), ex-80 (in Frist)]}

Detail ex-61:
  breakdown: {invoice: 2980.00, payments: [], open: 2980.00}
  datev_opos: {as_of: 2026-08-25, open: 2980.00, dunning_level: 1}     # aus loadOposBestand
  comments: [{at: 2026-08-26, by: u-simon, text: "Kunde hat telefonisch Zahlung bis 05.09. zugesagt"}]

Dubletten-Verdacht (batch overview C2):
  - {case_a: SV-2026-0161 (AR-2026-0412, 2980.00, 2026-07-31), case_b: SV-2026-0166 (AR-2026-0412a, 2980.00, 2026-08-01), reason: "Betrag gleich, Datum 1 Tag, Nummer ähnlich"}

Nach Bearbeitung:
  client_accounting_case_clarification: [{case_id: SV-2026-0161, audience: client, answer_kind: single_choice,
     answer_options_json: ["Bezahlt am … auf anderes Konto — Auszug nachreichen", "Noch offen, wird gemahnt", "Rechnung wird storniert"], status: open}]
  client_review_checks: [{check_kind: open_item_waiting, subject_key: ex-73, period: 2026-08, note: "Zusage bis 05.09.", payload: {until: 2026-09-05}}]
  Korb: [{kind: merge_request, cases: [SV-2026-0161, SV-2026-0166]}]
```

## 13. DATEV-Hinweise

- **OPOS-Liste (Kanzlei-Rechnungswesen):** je Personenkonto ein Block mit
  Kopf `Konto · Name`, darunter Posten `Rechnungs-Nr. (Beleg 1) · Belegdatum
  · Fälligkeit · Betrag · Rest · Mahnstufe · Skonto bis`, am Ende Summe je
  Konto und Gesamt. Genau diese Spalten und diese Gruppierung übernehmen —
  die Buchhalterin liest das seit Jahren so.
- **Fälligkeitsliste / Altersstruktur:** DATEV gruppiert nach Überfälligkeit
  (0–30, 31–60, > 60 Tage). Unsere drei Reiter (in Frist · überfällig ·
  wartend) sind gröber, aber handlungsorientiert; die Tage überfällig als
  Zahl je Posten reichen.
- **Mahnwesen** bleibt DATEV (R4): keine Mahnstufen setzen, nur den Hinweis
  notieren. Die Spalte „Mahnstufe" zeigt den **DATEV-Stand aus dem Spiegel**,
  read-only.
- **Debitor/Kreditor:** DATEV zeigt Personenkonten immer als Nummer + Name;
  Debitoren 10000–69999, Kreditoren 70000–99999 (SKR-üblich). Die Nummer
  vorn, damit die Buchhalterin sofort weiß, welche Seite.

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
| S1 | **Debitor mit drei Posten, zwei überfällig** | Gruppe mit Summe, Stufen 1 und 2, Tage überfällig, Detail mit Breakdown und DATEV-OPOS-Stand |
| S2 | **Kreditor überfällig** (wir schulden) | Richtung sichtbar, Aktion „Mandant fragen: bezahlt?" |
| S3 | **Fehlender Beleg zu einer Zahlung** (`kind = 'document'`) | Erwartung Beleg statt Zahlung, Nachforderung |
| S4 | **Bekannt wartend** | Reiter mit Wiedervorlage-Datum, Notiz |
| S5 | **Dubletten-Verdacht** | Banner, beide Belege nebeneinander, „zusammenführen" / „beide echt" |
| S6 | **DATEV-OPOS weicht ab** | Spiegel-Spalte gelb, Stichtag |
| S7 | **Alles in Frist** | nur Zähler und Summen, eingeklappt — Leerzustand als Erfolg |
