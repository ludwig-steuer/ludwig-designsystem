# F109 — Design-Brief: Schritt 7 — Was hat der Agent gelernt?

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

**Welche Regeln hat der Agent in diesem Lauf aufgestellt, und stimmen sie?**

Der Agent kann **Konventionen** vorschlagen (F106): Regeln wie „Telekom →
6805, BU 9" oder „Bewirtungsbelege ohne Teilnehmerliste → Klärung an
Mandant". Zwei Ebenen: **Mandanten-Konvention** — gilt sofort für diesen
Mandanten, Status *unbestätigt*, bis ein Mensch bestätigt; **Kanzlei-
Konvention** — gilt **erst** nach menschlicher Freigabe. Jede Konvention
trägt `agent_run_id` des Laufs, in dem sie entstand, und eine Herkunft: aus
einer Klärungsantwort **destilliert** (dann schon *bestätigt*, weil der
Mensch die Antwort gab) oder vom Agenten **beobachtet** (*unbestätigt*).

**Warum am Ende:** Nach den Schritten 3–6 hat die Buchhalterin die
**Anwendung** der Regeln gesehen und kann beurteilen, ob die Regel taugt.
Der Marker „nach Konvention K-07" an Sätzen in Schritt 3 ist der Weg
hierher, falls sie es früher wissen will.

## 2. Todo-Gruppen

### 2.1 Neue Mandanten-Konventionen

Konventionen mit `agent_run_id = runId`, Ebene Mandant.

**Listenpunkt:** Konventionstext (kompakt, imperativ) · Herkunft-Chip
(*destilliert → bestätigt* / *beobachtet → unbestätigt*) · Anzahl der
Sätze dieses Laufs, die sie angewendet haben · Betroffenes (Gegenpartei,
Konto, Belegart).

Beispiel:

```
K-07  „Telekom Deutschland → 6805 Telefon, BU 9, Belegfeld 1 = Rechnungsnummer"
      beobachtet · unbestätigt · angewendet auf 4 Sätze · Gegenpartei 70012
K-08  „Bewirtungsbelege ohne Teilnehmer → Klärung an den Mandanten, nicht buchen"
      destilliert aus Klärung SV-2026-0144 (Antwort 26.08.) · bestätigt · 2 Sätze
```

**Detail:**

| Element | Inhalt |
|---|---|
| Text | editierbar (Textarea, imperativ, eine Regel) |
| Quelle | verlinkt: die Klärung (mit Frage und Antwort) · der Sachverhalt · die Beobachtung („in 3 von 3 Fällen seit Mai") |
| Angewendete Sätze | Liste `case_number` · Titel · Konto · Betrag · Judge-Verdikt, Sprung in Schritt 3 |
| Geltung | „gilt seit Lauf #14 für diesen Mandanten" |
| Konflikt | falls eine ältere Konvention widerspricht: beide nebeneinander, „ersetzt K-03" |

**Aktionen:** **Bestätigen** · **Ändern und bestätigen** (Text) ·
**Verwerfen** mit Grund — die betroffenen Sätze bekommen in Schritt 3 das
Banner „nach verworfener Konvention K-07" mit Filter, damit sie noch einmal
angesehen werden.

### 2.2 Kanzlei-Konventionen zur Freigabe

Der Agent hat eine Regel als **kanzleiweit** eingestuft (z. B. „Rechnungen
mit § 13b-Hinweis immer BU 94 und Klärung, wenn USt-IdNr. fehlt"); sie gilt
**erst nach Freigabe**. Gleiche Anatomie wie 2.1.

**Aktionen:** **Freigeben** (das Gate — Kanzlei-Regel wird aktiv) ·
**Nur für diesen Mandanten** (stuft auf Mandanten-Ebene herab, dann wie
2.1) · **Verwerfen** mit Grund.

### 2.3 Abgelöste Konventionen (eingeklappt)

Was der Agent als überholt markiert hat (`superseded_by`): alter Text →
neuer Text, zur Kenntnis. Keine Aktion nötig; „wiederherstellen" als
tertiäre Aktion.

## 3. Zustände

- **Fertig:** keine unbestätigte neue Mandanten-Konvention, keine
  Kanzlei-Konvention ohne Entscheidung.
- **Stapel-Blocker:** eine **unentschiedene Kanzlei-Konvention** (weil ihre
  Geltung die exportierten Sätze betrifft). Unbestätigte
  Mandanten-Konventionen blockieren nicht.
- **Leer:** „Der Agent hat in diesem Lauf nichts Neues gelernt" — Rail dimmt.
- **Diff-Modus:** Konventionen, die die Buchhalterin im Vorgänger-Review
  verworfen hat und die der Agent erneut vorschlägt, sind rot markiert
  („erneut vorgeschlagen trotz Verwerfung — Begründung des Agenten: …").

## 4. Kanzlei-Ablauf, den dieser Schritt abdeckt

| Kanzlei-Ablauf | Hier |
|---|---|
| Gelernte Konventionen freigeben | 2.1 / 2.2 |
| Notizen (als Regel festhalten) | Text editierbar |

## 5. Datenkontrakt

**Reads:** Konventionen mit `agent_run_id = runId` und Status, Ebene,
Herkunft · angewendete Sätze je Konvention (F106-Speicher, gebaut in W7a) ·
Widersprüche zu bestehenden Konventionen.

**Writes:**

| Aktion | Kern |
|---|---|
| Bestätigen / Ändern und bestätigen | F106-Kern `confirmConvention` (mit Text) |
| Verwerfen | F106-Kern (Status verworfen + Grund; `superseded_by` bleibt leer) |
| Freigeben (Kanzlei) / Herabstufen | F106-Kern (Ebene, Freigabe-Gate) |

## 6. Nicht-Ziele

- Kein zweiter Konventions-Speicher, kein Regel-Editor außerhalb von F106.
- Keine Konventions-Erstellung durch die Buchhalterin hier (das ist die
  Admin-/Sachverhaltsansicht) — nur Entscheidung über Vorschläge des Laufs.

## 7. Offen (Owner)

- F106 sieht die Kanzlei-Freigabe „später im Admin". Dieser Brief legt sie
  in Schritt 7, weil dort die Anwendung sichtbar ist; der Admin-Ort kann
  zusätzlich bleiben.

---

## 8. Jobs to be done — was die Nutzerin auf dieser Seite tut

| # | Job | Was sie dafür sehen muss | Aktion · Taste | Fertig, wenn |
|---|---|---|---|---|
| J1 | **Eine neue Regel lesen und verstehen** — was, woher, wie oft angewendet | Text, Herkunft-Chip, Quelle verlinkt, Anzahl angewendeter Sätze | lesen | — |
| J2 | **Prüfen, ob die Regel richtig angewendet wurde** | Liste der Sätze mit Konto/Betrag/Judge, Sprung in Schritt 3 | Klick Satz | — |
| J3 | **Bestätigen** | — | `A` | Status bestätigt |
| J4 | **Ändern und bestätigen** — Text präzisieren | editierbarer Text | `E`, dann `A` | neuer Text bestätigt |
| J5 | **Verwerfen** mit Grund | Grund-Feld; Hinweis, welche Sätze betroffen sind | `R` + Text | verworfen, Banner in Schritt 3 |
| J6 | **Eine Kanzlei-Regel freigeben oder auf den Mandanten beschränken** | Ebene, Geltungsbereich, Konflikt mit bestehenden Kanzlei-Regeln | `A` freigeben · `M` nur dieser Mandant · `R` verwerfen | entschieden |
| J7 | **Konflikte erkennen** — widerspricht einer älteren Regel | beide Texte nebeneinander, „ersetzt K-03" | lesen | — |
| J8 | **Abgelöste Regeln zur Kenntnis nehmen / wiederherstellen** | alt → neu | „wiederherstellen" | — |
| J9 | **Erneut vorgeschlagene, früher verworfene Regeln erkennen** (Diff) | rote Markierung mit Agenten-Begründung | `R` | — |

## 9. Informations-Check — hat jeder Job, was er braucht?

| Job | Benötigt | Vorhanden in | Lücke / Bewertung |
|---|---|---|---|
| J1 | Text, Ebene, Status, Herkunft, `agent_run_id`, Quelle | F106-Konventions-Speicher (Bau in W7a): `text`, `level` (client/tenant), `status` (unbestätigt/bestätigt/verworfen), `origin` (destilliert/beobachtet), `agent_run_id`, `source_ref` (Klärung/Sachverhalt) | ⚠ — **Speicher ist entschieden, aber im Bau**; Feldnamen hier provisorisch. Der Brief verlangt genau diese Felder; W7a muss sie liefern |
| J2 | angewendete Sätze | `proposal_rationale.sources[]` mit `kind='rule'`, `ref=K-07` → Rückwärtssuche über die Sätze des Laufs | ✓ ableitbar ohne Join-Tabelle (jsonb-Suche je Lauf, gecacht); bei Bedarf später Join-Tabelle |
| J3–J6 | Kerne | F106-Kern (`confirmConvention`, Ebene, Freigabe-Gate, `superseded_by`) | ⚠ — kommt mit W7a |
| J7 | Konflikt-Erkennung | Konventionen desselben Mandanten mit gleicher Gegenpartei/gleichem Konto | ⚠ — einfache Heuristik (gleiche `subject`-Felder); Freitext-Konflikte erkennt niemand automatisch — Anzeige „gleiche Gegenpartei" reicht |
| J9 | verworfen im Vorgänger-Review | Status verworfen + `agent_run_id` des Vorgängers, neuer Vorschlag mit gleichem `subject` | ✓ wenn `subject` strukturiert (Gegenpartei/Konto/Belegart) |

**Fazit:** der Screen ist vollständig spezifizierbar, hängt aber am
W7a-Speicher; Anforderung an W7a: strukturiertes `subject` (Gegenpartei,
Konto, Belegart) neben dem Text, damit Konflikt und Wieder-Vorschlag
erkennbar sind.

## 10. Datenmodell dieses Screens mit Beispieldatensatz

```yaml
Konventionen (F106-Speicher, Feldnamen provisorisch):
  - id: K-07   client_id: c-10160   level: client   status: unconfirmed   origin: observed   agent_run_id: run-14
    text: "Telekom Deutschland → 6805 Telefon, BU 9, Belegfeld 1 = Rechnungsnummer"
    subject: {counterparty_partner_id: 5a…, account_number: "6805", tax_key: "9"}
    source_ref: {kind: observation, note: "3 von 3 Fällen seit 05/2026"}
    applied_entries: [je-A (SV-2026-0187), je-172A, je-158A, je-141A]     # aus proposal_rationale.sources kind=rule ref=K-07
    supersedes: null   superseded_by: null   created_at: 2026-08-27T04:31Z
  - id: K-08   level: client   status: confirmed   origin: distilled   agent_run_id: run-14
    text: "Bewirtungsbelege ohne Teilnehmerangabe → Klärung an den Mandanten, nicht buchen"
    subject: {document_form: hospitality}
    source_ref: {kind: clarification, id: cl-44, case: SV-2026-0144, answered_at: 2026-08-26}
    applied_entries: []   applied_clarifications: [cl-52]
  - id: T-03   level: tenant   status: pending_release   origin: observed   agent_run_id: run-14
    text: "Rechnungen mit § 13b-Hinweis: BU 94; fehlt die USt-IdNr. des Leistenden, Klärung an die Kanzlei"
    subject: {vat_special_case: reverse_charge}
    conflicts_with: []
  - id: K-03   level: client   status: superseded   superseded_by: K-07
    text: "Telekom → 6805, BU 9"            # ohne Belegfeld-Regel

Diff-Modus (Vorgänger-Review run-12):
  - {id: K-05, status: rejected_in_review, rejected_reason: "Printprodukte 7 %", resubmitted_as: K-09 (run-14), agent_note: "Alle 4 Telekom-Belege 08/2026 tragen 19 %"}

Nach Bearbeitung:
  K-07: {status: confirmed, text: "… Belegfeld 1 = Rechnungsnummer ohne Bindestrich", confirmed_by: u-simon, confirmed_at: 2026-08-27T14:02Z}
  T-03: {status: released, released_by: u-simon}
  K-09: {status: rejected, rejected_reason: "bleibt verworfen — Einzelfall prüfen"}   # Banner in Schritt 3
```

## 11. DATEV-Hinweise

- **Lerndatei / Buchungsvorschläge (DUO, Kanzlei-Rechnungswesen):** DATEV
  „lernt" Zuordnungen Gegenpartei → Gegenkonto/BU/Text und zeigt sie als
  Regeln in einer Liste (Kriterium · Gegenkonto · BU · Buchungstext); der
  Anwender kann Regeln löschen oder anpassen. Buchhalterinnen kennen
  Konventionen also als **Lernregel** — die Darstellung „Gegenpartei → Konto ·
  BU · Belegfeld" als Tabellenzeile ist ihnen vertraut; der Freitext ist die
  Erklärung dazu, nicht die Regel selbst.
- **Kanzleiweite Regeln** gibt es in DATEV nicht als Konzept; das nächste
  sind Musterkontenrahmen und Kanzlei-Vorlagen. Darum „Kanzlei-Konvention"
  deutlich als etwas Besonderes markieren (eigene Gruppe, Freigabe-Button
  primär, kurze Erklärung „gilt für alle Mandanten der Kanzlei").
- **Automatik statt Regel:** manches, was hier als Regel erscheint, ist in
  DATEV Kontoeigenschaft (Automatikkonto, Steuersatz am Konto). Bei Regeln,
  die nur BU festlegen, den Hinweis zeigen „in DATEV: Automatikkonto 6805 hat
  BU 9 fest" — dann ist die Regel eine Bestätigung, kein Lernen.

## 12. Design-Prinzipien (vom Owner vorgegeben, gelten für jeden Screen)

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

## 13. Szenarien für die Vorschau

**Bitte einen Szenario-Umschalter in die Vorschau einbauen** (Dropdown oder
Tabs oben rechts), mit dem man zwischen den folgenden Zuständen des Screens
wechselt. Beispielwerte darf der Gestalter frei erfinden; die Szenarien
selbst sind die relevanten.

| # | Szenario | Was es zeigt |
|---|---|---|
| S1 | **Beobachtete Mandanten-Konvention, unbestätigt** | Text, Herkunft „beobachtet", 4 angewendete Sätze, Bestätigen / Ändern / Verwerfen |
| S2 | **Destillierte Konvention, schon bestätigt** | Quelle Klärung verlinkt, nur zur Kenntnis |
| S3 | **Kanzlei-Konvention zur Freigabe** | eigene Gruppe, Freigeben primär, „nur dieser Mandant", Erklärung Geltungsbereich |
| S4 | **Konflikt mit älterer Regel** | beide Texte nebeneinander, „ersetzt K-03" |
| S5 | **Erneut vorgeschlagen trotz Verwerfung** (Diff) | rote Markierung, Agenten-Begründung |
| S6 | **Text ändern** | Editier-Zustand |
| S7 | **Nichts gelernt** | Leerzustand, Rail gedimmt |
