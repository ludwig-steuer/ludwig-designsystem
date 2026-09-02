# F109 — Design-Brief: Schritt 4 — Geht die Bank auf?

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

**Ist jede Auszugszeile erklärt, stehen die Konten, die auf Null sein
müssen, auf Null, und gehen die Sachverhalte auf?**

Nach der Abnahme (Schritt 3) sind Sätze freigegeben oder abgelehnt; jetzt
wird geprüft, ob die Bank damit vollständig gebucht ist. Das ist der zweite
Bank-Blick der Kanzlei („Bank am Ende nochmal").

## 2. Todo-Gruppen

### 2.1 Unerklärte Auszugszeilen

Bank-Ereignis (`client_accounting_event.bank_transaction_id` gesetzt) ohne
Satz, ohne `no_booking_required_reason`, nicht im DATEV-Spiegel gebucht.

**Listenpunkt:** Datum · Betrag · Verwendungszweck (gekürzt) · Gegenpartei /
IBAN · Zahlungskonto.

**Detail:** die Bankzeile vollständig (`client_bank_transactions`:
Buchungsdatum, Valuta, Betrag, Zweck, Gegen-IBAN, Alias-Treffer aus
`client_business_partner_bank_aliases`), darunter **Kandidaten** aus der
Zahlungs-Leiter (`propose_payment_allocation`): Belegnummer im Zweck ·
Betrag · Gegenpartei — als Buttons.

Beispiel:

```
29.08.2026  −1.475,60  „BUEROBEDARF MEIER RE 4471 KD 88213"   Sparkasse
Kandidaten:
  [ zu SV-2026-0198 „Bürobedarf Meier RE-4471" zuordnen — Betrag exakt, Nummer im Zweck ]
  [ zu SV-2026-0150 „Meier Sammelrechnung Juli" — Betrag weicht ab (−1.475,60 vs. −1.240,00) ]
  [ neuer Sachverhalt ]   [ Frage an den Agenten ]   [ kein Buchungsbedarf, Grund … ]
```

**Aktionen:** **Zuordnen** (`link_transaction_to_case`-Kern) · **Neuer
Sachverhalt** (`create_case_from_bank_transactions`-Kern) · **Frage an den
Agenten** (Klärung `audience = 'agent'`, Rücklauf) · **Kein Buchungsbedarf**
mit Grund (`no_booking_required_reason`).

### 2.2 Konten, die ausgeglichen sein müssen

Ein Punkt je Konto mit `clearing_account_type` (Geldtransit,
Kreditkarten-Ausgleich, Mitarbeiter-Verrechnung, …) aus
`list_clearing_accounts`, mit Saldo zum Periodenende (Ludwig ∪ Spiegel,
inkl. freigegebener Sätze).

| Konto | Art | Saldo 31.08. | Zustand |
|---|---|---|---|
| `1460 Geldtransit` | Geldtransit | `0,00` | grün |
| `1617 Kreditkarte` | Kreditkarten-Ausgleich | `−412,80` | offen |
| `1590 Verrechnung Mitarbeiter` | Mitarbeiter-Verrechnung | `0,00` | grün |

**Detail (Saldo ≠ 0):** Kontenblatt des Monats mit hervorgehobenen
unausgeglichenen Paaren (Abbuchung ohne Abrechnung — typisch Kreditkarte:
Aufwand am Beleg auf `1617`, Auszugszeile der Sammelabbuchung fehlt oder
umgekehrt), Sprung zum Sachverhalt je Zeile.

**Aktionen:** **Kontenblatt** (Drawer) · **Sachverhalt öffnen** ·
**Quittieren mit Grund** („Kartenabrechnung kommt im Folgemonat" →
`recordReviewCheck(check_kind = 'clearing_account_zero')`).

### 2.3 Sachverhalte mit Rest

Personenkonto-Saldo des Sachverhalts ≠ 0 **ohne** offene Erwartung
(`client_accounting_case_expectation` mit `resolved_at is null`). Das ist
ein Sachverhalt, der weder geschlossen noch erklärt ist.

**Detail:** Sachverhalt-Kurzform mit **Ausgleichs-Breakdown**: Beleg
1.475,60 · Zahlung −1.240,00 · Rest 235,60 — und woher der Rest kommt
(Teilzahlung? Skonto? zweite Rechnung?). Aktionen: **Erwartung anlegen**
(„Restzahlung erwartet bis …") · **Frage an den Agenten** · **Sachverhalt
öffnen**.

### 2.4 Salden, zweiter Blick

Dieselbe Auszugs-Tabelle wie in Schritt 1, jetzt **inklusive Freigaben**:
gebuchter Endsaldo je Zahlungskonto (Kontenblatt, `accepted` + Spiegel) =
Auszugs-Endsaldo. Ein Klick quittiert (`bank_balance_link`).

## 3. Zustände

- **Fertig:** keine unerklärte Zeile, jedes Pflicht-Ausgleichskonto grün
  oder quittiert, kein Sachverhalt mit unerklärtem Rest.
- **Rot (Stapel-Blocker):** unerklärte Auszugszeile im Zeitraum · Salden
  gehen nach Freigabe nicht auf.
- **Quittierbar:** Ausgleichskonto ≠ 0 mit Grund · Rest mit angelegter
  Erwartung.

## 4. Kanzlei-Ablauf, den dieser Schritt abdeckt

| Kanzlei-Ablauf | Hier | Datenquelle |
|---|---|---|
| Bank buchen (Rest) | 2.1 | Bank-Ereignisse ohne Buchung |
| Konten, die ausgeglichen sein müssen | 2.2 | `clearing_account_type` + Saldo |
| Kreditkarte geteilt / Ausgleich Karte | 2.2 | Kartenkonto als Verrechnungskonto |
| Bank am Ende nochmal | 2.4 | wie Schritt 1, inkl. Freigaben |

## 5. Datenkontrakt

**Reads:** Bank-Ereignisse ohne Buchung (Gegenmenge zu
`AGENT_BLOCKED_BY_SQL`) · `list_clearing_accounts` + Saldo ·
`loadCaseOpenPayments` · `propose_payment_allocation` als Kandidaten ·
`getAccountSheet(account, month)` · `getBankCoverage`.

**Writes:**

| Aktion | Kern |
|---|---|
| Zuordnen | `link_transaction_to_case`-Kern |
| Neuer Sachverhalt | `create_case_from_bank_transactions`-Kern |
| Kein Buchungsbedarf | Ereignis-Kern (`no_booking_required_reason`) |
| Erwartung anlegen | Erwartungs-Kern (S7) |
| Frage an den Agenten | `raiseCaseClarification({ audience: 'agent' })` |
| Quittieren | `recordReviewCheck(check_kind = 'clearing_account_zero' \| 'bank_balance_link')` |

## 6. Nicht-Ziele

- Kein Bank-Import, keine Regel-Pflege hier (Sprung nach `/recurring`).
- Keine automatische Zuordnung ohne Klick.

---

## 7. Jobs to be done — was die Nutzerin auf dieser Seite tut

| # | Job | Was sie dafür sehen muss | Aktion · Taste | Fertig, wenn |
|---|---|---|---|---|
| J1 | **Eine unerklärte Auszugszeile erklären** — zuordnen, neu anlegen oder „kein Buchungsbedarf" | Bankzeile vollständig, Kandidaten mit Grund und Score, Gegenpartei/IBAN-Treffer | `1`–`3` Kandidat · `N` neuer Sachverhalt · `K` kein Bedarf + Grund · `F` Frage an Agent | Ereignis hat Sachverhalt oder Grund |
| J2 | **Ein Ausgleichskonto prüfen** — muss auf Null | Konto, Art, Saldo, Kontenblatt mit offenen Paaren | Klick Konto · `A` quittieren + Grund | Saldo 0 oder quittiert |
| J3 | **Einen Sachverhalt mit Rest erklären** | Ausgleichs-Breakdown (Beleg − Zahlungen = Rest), Herkunft des Rests | „Erwartung anlegen" · `F` · `S` Sachverhalt | Erwartung offen oder Rest erklärt |
| J4 | **Salden nach Freigabe prüfen** | Auszugs-Endsaldo vs. gebuchter Saldo (inkl. `accepted`) | `A` quittieren | gleich |
| J5 | **Das Kontenblatt eines Geldkontos lesen** | Kontenblatt-Drawer in DATEV-Optik | Klick Konto | — |
| J6 | **Erkennen, was den Stapel blockiert** | rote Punkte (unerklärte Zeile, Saldo ≠) | lesen | — |

## 8. Informations-Check — hat jeder Job, was er braucht?

| Job | Benötigt | Vorhanden in | Lücke / Bewertung |
|---|---|---|---|
| J1 | Bankzeile, Alias-Treffer, Kandidaten mit Score | `client_bank_transactions`, `client_business_partner_bank_aliases`, `propose_payment_allocation` (Zahlungs-Leiter: Belegnummer im Zweck · Betrag · Gegenpartei) | ✓ — Score und Grund der Kandidaten müssen **im Kandidaten-Objekt** stehen (heute liefert die Leiter Stufen; Grund als Text ableiten) |
| J1 „kein Bedarf" | Grund am Ereignis | `client_accounting_event.no_booking_required_reason` | ✓ |
| J2 | Konten mit Ausgleichspflicht, Saldo, Paare | `list_clearing_accounts` (`clearing_account_type`), `getAccountSheet`, Kartenkonto-Kennung (W1) | ⚠ — **Paar-Erkennung** (Abbuchung ohne Abrechnung) ist eine neue Ableitung: gleiche Gegenpartei/Karte, Betrag Sammelabbuchung = Σ Einzelbelege ± Toleranz. Ohne sie zeigt das Kontenblatt nur alle Zeilen — für den Job ausreichend, Paar-Markierung ist Komfort |
| J3 | Personenkonto-Saldo je Sachverhalt, Erwartungen | Ereignisse, `client_accounting_case_expectation` | ✓ — Erwartung anlegen: Kern aus S7 |
| J4 | Saldo inkl. `accepted` | `client_effective_journal_lines` mit Status-Filter | ✓ |
| J5 | Kontenblatt | `getAccountSheet` | ✓ |
| J6 | Server-Checks | Gate 4d | ✓ |

**Fazit:** vollständig bedienbar; eine Komfort-Ableitung (Kreditkarten-Paare)
kann später kommen.

## 9. Datenmodell dieses Screens mit Beispieldatensatz

```yaml
Unerklärte Auszugszeile:
  client_bank_transactions (tx-289):
    booking_date: 2026-08-29   value_date: 2026-08-29   amount: -1475.60
    purpose: "BUEROBEDARF MEIER RE 4471 KD 88213"   counterparty_name: Buerobedarf Meier GmbH   counterparty_iban: DE44…
    payment_account_id: pa-1 (Sparkasse, Ledger 1800)
  client_accounting_event (ev-289): {kind: bank_transaction, bank_transaction_id: tx-289, case_id: null, no_booking_required_reason: null}
  alias_hit: {client_business_partner_bank_aliases: {alias_kind: iban, value: DE44…, business_partner_id: → 70044 Bürobedarf Meier}}
  candidates (propose_payment_allocation):
    - {rank: 1, case: SV-2026-0198 „Bürobedarf Meier RE-4471", open_amount: 1475.60, reason: "Belegnummer im Zweck, Betrag exakt", score: high}
    - {rank: 2, case: SV-2026-0150 „Meier Sammelrechnung Juli", open_amount: 1240.00, reason: "Gegenpartei gleich, Betrag weicht ab", score: low}

Ausgleichskonten (list_clearing_accounts + Saldo):
  - {account_number: "1460", name: Geldtransit,           clearing_account_type: transit,      balance_period_end: 0.00}
  - {account_number: "1617", name: Kreditkarte,           clearing_account_type: card_clearing, balance_period_end: -412.80}
  - {account_number: "1590", name: Verrechnung Mitarbeiter, clearing_account_type: employee,   balance_period_end: 0.00}
  Kontenblatt 1617 (08/2026):
    - {date: 2026-08-03, doc1: RE-8811, text: "Amazon Toner",    debit: 89.90,  credit: null, case: SV-2026-0171}
    - {date: 2026-08-12, doc1: RE-9032, text: "Bahn Fahrkarte",  debit: 122.90, credit: null, case: SV-2026-0190}
    - {date: 2026-08-19, doc1: RE-9110, text: "Hotel Hamburg",   debit: 200.00, credit: null, case: SV-2026-0201}
    # Sammelabbuchung Kreditkarte 08/2026 fehlt (kommt am 05.09.) → Saldo −412,80

Sachverhalte mit Rest:
  - {case: SV-2026-0173 „Kunde Nord AR-2026-0431", personal_account: "10087", balance: 3200.00, expectations_open: 0, breakdown: {invoice: 3200.00, payments: 0.00}}

Salden zweiter Blick:
  - {payment_account: pa-1, statement_closing: 12345.22, booked_incl_accepted: 12345.22, ok: true}

Nach Bearbeitung:
  ev-289.case_id: → SV-2026-0198          # zugeordnet
  client_review_checks: [{check_kind: clearing_account_zero, subject_key: "1617", period: 2026-08, note: "Kartenabrechnung kommt im September"}]
  client_accounting_case_expectation: [{case_id: SV-2026-0173, kind: payment, expected_amount: 3200.00, due_date: 2026-09-05, due_source: invoice_terms, status: pending}]
```

## 10. DATEV-Hinweise

- **Bankbuchung in Kanzlei-Rechnungswesen:** Umsätze werden als Liste mit
  Vorschlag für das Gegenkonto (aus Lerndatei / Zahlungsbedingungen)
  gebucht; der Anwender bestätigt je Zeile oder ändert das Gegenkonto. Unser
  Kandidaten-Muster entspricht dem — die erste Option ist der Vorschlag,
  `Enter` übernimmt ihn.
- **Verrechnungskonten** prüft die Kanzlei in der **Summen- und
  Saldenliste** (Saldo ≠ 0 fällt auf) und im Kontoblatt. Darum: die Liste
  der Ausgleichskonten als Mini-SuSa (`Konto · Bezeichnung · Soll · Haben ·
  Saldo`), Saldo ≠ 0 orange.
- **Kreditkarte:** DATEV-übliche Praxis ist ein Verrechnungskonto (z. B.
  1617/1360), Einzelbelege im Soll, Sammelabbuchung im Haben — das
  Kontoblatt zeigt die offenen Belege bis zur Abrechnung. Die Erklärung
  „Abrechnung kommt im Folgemonat" ist Alltag; die Quittung muss darum ein
  Klick sein.

## 11. Design-Prinzipien (vom Owner vorgegeben, gelten für jeden Screen)

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

## 12. Szenarien für die Vorschau

**Bitte einen Szenario-Umschalter in die Vorschau einbauen** (Dropdown oder
Tabs oben rechts), mit dem man zwischen den folgenden Zuständen des Screens
wechselt. Beispielwerte darf der Gestalter frei erfinden; die Szenarien
selbst sind die relevanten.

| # | Szenario | Was es zeigt |
|---|---|---|
| S1 | **Bank geht auf** | keine unerklärte Zeile, alle Ausgleichskonten 0, Salden gleich — Leerzustand als Erfolg |
| S2 | **Unerklärte Zeile mit klarem Kandidaten** | Bankzeile, Kandidat 1 „Belegnummer im Zweck, Betrag exakt", `Enter` übernimmt |
| S3 | **Unerklärte Zeile ohne Kandidaten** | nur „neuer Sachverhalt" / „Frage an Agent" / „kein Buchungsbedarf" |
| S4 | **Kreditkarte nicht ausgeglichen** | 1617 mit −412,80, Kontenblatt mit drei Einzelbelegen ohne Sammelabbuchung, Quittieren mit Grund |
| S5 | **Sachverhalt mit Rest** | Breakdown Beleg − Zahlung = Rest, Erwartung anlegen |
| S6 | **Salden weichen nach Freigabe ab** (rot) | zweiter Blick zeigt Differenz, Sprung ins Kontenblatt |
| S7 | **Mehrere Zahlungskonten** | Sparkasse, PayPal, Kreditkarte — je ein Block |
