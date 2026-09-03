# F109 — Design-Brief: Schritt 3, Tab „Wiederkehrende Buchungen" (Sammelabnahme)

**Stand:** 2026-08-29 · **Owner:** Simon Fakir · **Adressat:** claude design ·
**Status:** entschieden. **Ergänzungsbrief** zu
`F109-3-abnahme-design-brief.md` (Schritt 3, Abnahme je Sachverhalt) — der
bestehende Brief gilt unverändert weiter; dieses Dokument beschreibt **nur**
den neuen Tab, der **vor** der Einzelabnahme liegt. Begriffe nach
`GLOSSARY.md`: Dauersachverhalt (LDSV, `kind = 'recurring_charge'`),
Regel (`client_accounting_case_rule`), Sollstellung, Periode
(`accrual_period`), Stapel (Buchungszyklus, P15), Durchgang.

## 0. Die Entscheidungen, die diesem Brief zugrunde liegen

| Frage | Entscheidung |
|---|---|
| Was ist eine „wiederkehrende Buchung"? | Ein Buchungsvorschlag, der **aus einer Regel** entstanden ist — nicht aus einem Beleg oder einer Bankzeile allein. Deterministisch: Sachverhalt `kind = 'recurring_charge'` **und** jedes offene Ereignis mit Vorschlag trägt `recurring_rule_id` (Sollstellung `accrual` oder regelgematchte Zahlung; Sätze `origin = 'recurring_rule'`, Settlement-Sätze der Sollstellung). Ein Dauersachverhalt mit einem Ereignis **ohne** Regelbezug (Jahresabrechnung, Nachberechnung, unerwarteter Beleg) ist **kein** WK-Fall und läuft durch die Einzelabnahme. |
| Wo? | **Eigener Tab in Schritt 3**, als erster: *Wiederkehrende (n) → Einzelfälle (m) → Liste*. Kein eigener Schritt — es sind Vorschläge, die abgenommen werden. |
| Reihenfolge | **Erst WK, dann Einzelfälle.** Ist im WK-Tab nichts mehr offen, leitet der Screen automatisch in die Einzelabnahme weiter. Dort erscheinen WK-Sachverhalte **nicht mehr** — auch nicht die abgelehnten oder zurückgegebenen (die liegen im Rücklauf-Korb). |
| Darstellung | **Liste**, eine Zeile je **Sachverhalt × Periode** (`accrual_period`), zuerst nur Beschreibung + Kennzahlen; **aufklappbar** zeigt die Zeile ihre Buchungssätze, die Regel, die Prüfpunkte, Agent-Begründung, ein Kommentarfeld und die Aktionen. |
| Abnahme | **Checkbox je Zeile**, „Alle übernehmen" setzt alle **grünen** Zeilen; Zeilen mit Befund bleiben abgewählt und wollen einen bewussten Haken. „Ausgewählte freigeben" mit Kontrollsumme. Einzeln: **Anpassen** (Buchungseditor, inline in der aufgeklappten Zeile), **Ablehnen** (Satz), **Zurück an den Agenten** (mit Kommentar), **Sachverhalt öffnen** (Drawer). |
| Kein neuer Kern | Freigeben = `acceptCaseProposal` in Schleife (Dauersachverhalte schließen nie), Ablehnen = `rejectEventBookings`, Zurück = `raiseCaseClarification(audience 'agent')`, Anpassen = `saveEventBooking`. |
| Was hier nicht ist | Fehlende Perioden (Regel ohne Sollstellung im Monat) — das prüft Schritt 6 („2 Vormonate ja, jetzt nein") bzw. Gate 2a; der Tab nennt die Zahl und verlinkt. Regelpflege (Betrag, Konto, Laufzeit) — Regel-Editor `/recurring`, aus der Zeile verlinkt. |

## 1. Kontext — was der Gestalter wissen muss, ohne die anderen Briefe zu lesen

**Die Stapelabnahme** ist die Oberfläche, mit der die Buchhalterin einer
Steuerkanzlei **einen Stapel** (Buchungszyklus für einen Zeitraum, meist ein
Monat) prüft. Der KI-Agent hat in **Durchgängen** Belege und Bankzeilen zu
Sachverhalten gebündelt und Buchungssätze vorgeschlagen (`proposed`); ein
zweiter Agent (**Judge**) hat gegengelesen. **Nur Menschen geben frei.**
Schritt 3 „Stimmen die Vorschläge?" ist die Abnahme dieser Vorschläge —
bisher **Sachverhalt für Sachverhalt** auf einer Karte mit Zonen, Prüfpunkten
und Aktionen (`F109-3-abnahme-design-brief.md`).

**Warum ein eigener Tab:** Ein Drittel bis die Hälfte der Monatssätze eines
typischen Mandanten sind **Dauersachverhalte** — Miete, Leasing, Versicherung,
Darlehensrate, Software-Abo, Strom-Abschlag, eigene Dauerrechnungen an
Kunden. Sie entstehen **ohne Ermessen des Agenten**: eine Regel
(`client_accounting_case_rule`) sagt Konto, Betrag, Rhythmus, Belegfeld;
der Server stellt zur Fälligkeit soll (`accrue_then_settle`) oder bucht bei
Zahlung gegen die Vorlage (`book_on_payment`). Die Prüfung, die die
Buchhalterin dafür braucht, ist eine einzige: **„Wie im Vormonat — ja oder
nein?"** Sie diese 30 Fälle einzeln auf Karten durchklicken zu lassen, ist
Zeitverschwendung; sie als Liste mit einem Haken abzunehmen, ist das, was sie
in DATEV mit dem WK-Stapel auch tut. Regel des Owners: **statische
Buchungskreise deterministisch buchen, der Agent bearbeitet nur Residuen** —
der Tab macht diese Trennung sichtbar.

**Die Nutzerin:** Buchhalterin, DATEV-geprägt, denkt in **Konto | Gegenkonto
| Betrag | BU | Belegfeld 1**, Tastatur, 24-Zoll. Bei wiederkehrenden
Buchungen will sie in **einer Sekunde je Zeile** sehen: dieselbe Gegenpartei,
derselbe Betrag, dasselbe Konto, das richtige Belegfeld — Haken. Nur die
Zeilen, die anders sind als sonst, will sie aufklappen.

**Gemeinsames Layout aller Schritte** — ≥ 1920 px, ≥ 1280 px muss
funktionieren, kein Mobile: links sticky der **Schritt-Rail** (0–10, Zähler,
Ampel, Rücklauf-Korb), darüber der **Stapel-Kopf** (Stapelnummer ·
Bezeichnung · Zeitraum · Zustand · Durchgang n von m). Bestehende Ansichten
(Sachverhalt, Kontenblatt, Beleg, Regel) öffnen als **Drawer** mit URL
(`UrlDrawer`), einer zur Zeit, `Esc` schließt. Status über `StatusBadge` +
Registry, Zeiten Europe/Berlin, Zustands-Spalten nie bloß „Status".

**Gestaltungshaltung:** Business-Webanwendung. **Ruhiger Kontext, laute
Probleme:** die Liste ist dicht und grau; Farbe nur an Zeilen mit Befund.
Grün ist ein Haken, nie eine Fläche. **Hotkey-freundlich**, **DATEV-Optik**
bei Sätzen. **Jeder Screen dokumentiert seine Jobs.**

## 2. Navigation — wo der Tab sitzt

Schritt 3 bekommt eine Sub-Navigation (`TabBar`) unter dem Stapel-Kopf:

```
Schritt 3 · Stimmen die Vorschläge?
[ Wiederkehrende 31 · 4 offen ]  [ Einzelfälle 34 · 12 offen ]  [ Liste ]
```

- **Einstieg** in Schritt 3 = Tab Wiederkehrende, solange dort etwas offen
  ist; sonst Einzelfälle. Im Rail zählt Schritt 3 beide zusammen
  (`offen / gesamt`).
- **Weiterleitung:** sobald im WK-Tab keine Zeile mehr offen ist (alle
  freigegeben, abgelehnt, zurückgegeben oder wartend), erscheint drei Sekunden
  eine Erfolgsleiste („31 wiederkehrende Buchungen abgenommen · 62 Sätze ·
  48.211,37 €") und der Screen wechselt zu **Einzelfälle**, erster offener
  Sachverhalt. Zurück in den Tab geht immer (Filter „alle" zeigt die
  erledigten Zeilen ausgegraut).
- **Einzelfälle** = die bestehende Karten-Abnahme, **ohne** die
  WK-Sachverhalte; Bucket-Chips (Prüfen · Kurz ansehen · Durchwinker ·
  Übernehmen) und Zähler beziehen sich nur auf Einzelfälle.
- **Liste** = die bestehende Listenseite (alle Sachverhalte, beide Arten,
  Spalte „Art: WK / Einzel").

**Tastatur im WK-Tab:** `J`/`K` Zeile · `Space` Haken · `Enter` auf-/zuklappen
· `A` Ausgewählte freigeben · `Shift+A` Alle übernehmen (grüne) · `X`
Ablehnen · `R` Zurück an den Agenten · `E` Anpassen · `S` Sachverhalt · `G`
Regel · `H` Historie · `1`–`9` Kontenblatt der n-ten Zeile · `?` Legende.

## 3. Die Liste — eine Zeile je Sachverhalt und Periode

### 3.1 Zeile (zugeklappt)

```
☐ ●  SV-2025-0044  Büromiete Musterstraße        Hausverwaltung Kern    08/2026  monatl.   6310/6320 an 70003   082026   1.700,00   wie 07/2026 ✓   Sollstellung + Zahlung   [offen]
☐ ●  SV-2025-0061  Leasing Transporter            VW Leasing GmbH        08/2026  monatl.   4840 an 70011        RE-88213 412,80    wie 07/2026 ✓   Beleg + Zahlung          [offen]
☐ ▲  SV-2025-0058  Strom Abschlag Werkstatt       Stadtwerke Kiel        08/2026  monatl.   4240 an 1800         082026   310,00     ≠ 07/2026: 280,00 → 310,00 (+10,7 %)   Zahlung   [wartet: Frage an Mandant]
☐ ◆  SV-2026-0212  Software-Abo Werkstattplanung  Planix GmbH            08/2026  monatl.   4964 an 1800         PLX-2026-08   59,00   neu — erste Periode   Beleg + Zahlung   [offen]
```

| Spalte | Inhalt | Quelle |
|---|---|---|
| ☐ | Auswahl für die Sammelfreigabe; **vorbelegt** bei grün, **leer** bei Befund/neu; gesperrt bei „wartet" | UI |
| Ampel | ● grün = wie Vormonat, alle Prüfpunkte grün · ▲ gelb/rot = Befund (welcher, im Tooltip) · ◆ = neu (erste Periode dieser Regel) · ⏸ = wartet (offene Klärung) | Prüfpunkt-Ableitung (Abschnitt 5) |
| Sachverhalt | Nummer + Titel; Klick/`Enter` klappt auf, `S` öffnet den Drawer | `client_accounting_case` |
| Gegenpartei | Name | `counterparty_name` / Partner |
| Periode | `accrual_period` `08/2026`; bei Nachzügler „07/2026 (nachgebucht)" orange | `client_accounting_event.accrual_period` |
| Rhythmus | monatl. · vierteljährl. · jährl. | `expected_interval` |
| Konto | Vorlage-Konto(en) an Gegenkonto in Kurzform; Split als `6310/6320` | `template_lines` / `fy_template_counter_account_id`, `personal_account_id`, Zahlungskonto |
| Belegfeld 1 | die Periodennummer (`082026`) oder Rechnungsnummer | `resolvePeriodDocumentNumber`, `document_number_strategy` |
| Betrag | Satzbetrag (brutto), `tabular-nums` | Satz |
| Vormonat | „wie 07/2026 ✓" oder „≠ 07/2026: alt → neu (±%)" mit Abweichungs-Farbskala | `client_effective_journal_lines`, letzte Periode |
| Bestandteile | was in dieser Zeile abgenommen wird: „Sollstellung + Zahlung" · „Zahlung" · „Beleg + Zahlung" · „Sollstellung (Zahlung offen)" | Ereignisse mit Sätzen |
| Entscheidung *(nie bloß „Status")* | offen · freigegeben ✓ · angepasst ✎ · abgelehnt ↩ · zurück an Agent ↩ · wartet ⏸ · zurückgestellt | Satz-Status + Klärungen |

**Sortierung:** Befunde und Neue zuerst (▲ ◆), dann ⏸, dann grün —
innerhalb alphabetisch nach Gegenpartei. **Filter-Chips** über der Liste:
*offen* (Default) · *mit Befund* · *neu* · *wartet* · *alle*.
**Gruppierung** (optional, Umschalter): nach Bestandteil (Sollstellungen /
Zahlungen / mit Beleg) — hilft bei Mandanten mit 80 Regeln.

### 3.2 Zeile (aufgeklappt)

Die aufgeklappte Zeile ist eine **kompakte Version der Abnahme-Karte** aus
dem Schritt-3-Brief — dieselben Blöcke, nur die WK-relevanten, in zwei
Spalten:

```
┌─ SV-2025-0044 · Büromiete Musterstraße · Periode 08/2026 ────────────────────────────────────────────┐
│ SÄTZE (DATEV-Optik)                                      │ REGEL & PERIODE (B8)                        │
│ Satz A  Sollstellung 01.08.  Belegfeld 082026            │ accrue_then_settle · monatlich, am 1.         │
│   S 6310 Miete              1.450,00  BU 0               │ Vorlage 1.700,00 (6310 1.450 / 6320 250)      │
│   S 6320 Nebenkosten          250,00  BU 0               │ Belegfeld: Periodenkennung (period_key)       │
│   H 70003 Hausverwaltung    1.700,00                     │ Laufzeit seit 01.01.2025 · offen              │
│ Satz B  Zahlung 03.08.  Bank „MIETE AUG 2026"            │ Notiz: „Abbuchung immer am 3."                │
│   S 70003 Hausverwaltung    1.700,00                     │ Vormonat 07/2026: 1.700,00 auf 6310/6320 ✓    │
│   H 1800 Sparkasse          1.700,00                     │ Historie 12 Monate ▸ (H)   Regel öffnen ▸ (G) │
│ Prüfpunkte: 6 bestanden (eingeklappt) ▸                  │                                               │
│ Agent: „Sollstellung aus Regel; Zahlung per IBAN-Match."  │ NACH ÜBERNAHME (B9)                           │
│ Judge: confirm                                            │ Periode 08/2026 abgenommen — läuft weiter     │
├──────────────────────────────────────────────────────────┴───────────────────────────────────────────┤
│ Kommentar an den Agenten: [______________________________]                                             │
│ [A Freigeben] [E Anpassen] [X Satz ablehnen] [R Zurück an Agent] [S Sachverhalt] [G Regel] [Z Später] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Sätze:** alle `proposed`-Sätze der Periode, je Satz Zeilen-Tabelle
  (Konto · Bezeichnung · Soll · Haben · BU · Belegfeld 1); Steuerzeilen
  eingerückt; jede Kontonummer öffnet das Kontenblatt. Bei `book_on_payment`
  ein Satz; bei `accrue_then_settle` Sollstellung + Zahlung; bei
  Vertragsrechnung (`from_document`) zusätzlich der **Beleg-Kopf** (B3, drei
  Zeilen: Nummer, Datum, Brutto) mit Beleg-Drawer.
- **Prüfpunkte** (Abschnitt 5): rot/gelb aufgeklappt mit Grund und Sprung,
  grün als eine Zeile. Im WK-Tab werden Prüfpunkte **nicht einzeln
  abgehakt** — die Freigabe der Zeile ist die Quittung.
- **Agent & Judge** (B6) in je einer Zeile; Quellen als Chips (`rule`,
  `bank_match`, `document`).
- **Regel & Periode** (B8) wie im Schritt-3-Brief; **Regel öffnen** führt in
  den Regel-Editor (`/recurring`, Drawer) — Betrag/Konto/Laufzeit ändert man
  **dort**, nicht am Vorschlag.
- **Kommentarfeld**: Freitext, der mit `R` als Klärung an den Agenten geht
  oder mit `A` als Hinweis („trotzdem freigegeben") — dieselbe Mechanik wie
  `N` im Schritt-3-Brief.

### 3.3 Fußzeile — Kontrollsumme und Sammelaktionen (sticky)

```
Ausgewählt 27 von 31 · 54 Sätze · Σ Soll 41.880,20 · Σ Haben 41.880,20 · je Konto ▸        [Alle übernehmen · Shift+A]  [Ausgewählte freigeben · A]
Nicht ausgewählt: 2 mit Befund · 1 neu · 1 wartet                                              3 Dauersachverhalte ohne Periode 08/2026 → Schritt 6
```

- **Alle übernehmen** wählt alle grünen Zeilen (setzt keine Befund-/Neu-
  Zeilen) und öffnet den Bestätigungsdialog.
- **Ausgewählte freigeben** öffnet den Bestätigungsdialog mit: Anzahl
  Sachverhalte, Sätze, Σ Soll/Haben, **Summen je Konto** (aufklappbar:
  `6310 Miete 4.350,00 · 4840 Leasing 1.238,40 · …`) und der Liste der
  bewusst mit Befund freigegebenen Zeilen. `Ctrl+Enter` bestätigt.
- Danach: Zeilen werden ✓, Filter *offen* blendet sie aus; bleibt nichts
  offen → Weiterleitung (Abschnitt 2).

## 4. Aktionen

| Taste | Aktion | Wirkung | Kern |
|---|---|---|---|
| `Space` | Auswählen | UI | — |
| `Shift+A` | **Alle übernehmen** | wählt alle grünen Zeilen → Dialog | — |
| `A` | **Ausgewählte freigeben** (oder die aufgeklappte Zeile) | alle `proposed`-Sätze der Periode → `accepted`, `acceptance_quality = 'ai_unmodified'`, `reviewed_by_user_id`; Sachverhalt bleibt offen (`recurring_charge` schließt nie); Kommentar → Hinweis-Klärung `severity 'optional'` | `acceptCaseProposal({ caseId, closeCase: false })` in Schleife — **vorhanden**; Hinweis `raiseCaseClarification` — vorhanden |
| `E` | **Anpassen** | Buchungseditor **inline in der aufgeklappten Zeile** (derselbe Editor wie im Schritt-3-Brief, `F109-buchungseditor-design-brief.md`); danach `A` → `acceptance_quality = 'ai_edited'`, Entscheidung ✎. Hinweis im Editor: „Gilt nur für diese Periode — dauerhaft ändern: Regel öffnen (G)" | `saveEventBooking` — vorhanden |
| `X` | **Satz ablehnen** | Satz → `rejected` mit Grund (Pflicht); übrige Sätze der Periode bleiben; Zeile ↩; Sachverhalt geht in den Rücklauf-Korb | `rejectEventBookings` — vorhanden |
| `R` | **Zurück an den Agenten** | Sätze bleiben `proposed`; Klärung `audience 'agent'`, `severity 'required'`, Kommentar Pflicht; Zeile ↩ | `raiseCaseClarification` — vorhanden |
| `S` / `G` / `H` / `B` | Sachverhalt · Regel · Historie · Beleg | Drawer | reads |
| `Z` | Zurückstellen | ans Ende der Liste, offen | UI |
| Klick Konto | Kontenblatt | Drawer, vorgeschlagene Zeile markiert | read |

Regeln: Freigabe bestätigt sich **nur** im Sammeldialog (Kontrollsumme);
Einzel-`A` an einer aufgeklappten Zeile ohne Dialog. Ablehnen und Zurück
verlangen einen Grund. Undo: `accepted → proposed` bis zur Freigabe des
Stapels (Schritt 8/9) über die Listenseite. Nach `A`/`X`/`R` springt der
Fokus zur nächsten offenen Zeile.

## 5. Prüfpunkte im WK-Tab — die Ampel je Zeile

Nur die Prüfpunkte, die für Regel-Sätze etwas aussagen (Teilmenge des
Katalogs aus dem Schritt-3-Brief §8, gleiche Codes, gleiche Ableitung):

| Code | Frage | grün wenn | Ampel-Wirkung |
|---|---|---|---|
| P-SUMME | Geht der Satz auf? | Σ Soll = Σ Haben | rot |
| P-REGEL-BETRAG | Betrag wie in der Regel? | innerhalb `match_amount_tolerance_percent` / absoluter Toleranz | gelb (innerhalb Prozent-Toleranz, Klärung gestellt) · rot (außerhalb) |
| P-VORMONAT | Wie im Vormonat? | Konto, BU, Betrag wie letzte Periode (Betrag < 30 % Abweichung) | gelb |
| P-BELEGFELD-PERIODE | Trägt die Periode die richtige Nummer? | `resolvePeriodDocumentNumber` = Belegfeld 1 | rot |
| P-AUSGLEICH | Gleicht die Zahlung die Sollstellung aus? | Rest 0 auf dem Personenkonto | rot (Rest) · gelb (Teilzahlung) |
| P-DUBLETTE | Zweite Zahlung derselben Periode? | keine zweite Zahlung (R23c: Verdacht doppelte Lastschrift) | rot |
| P-KONTO | Konto wie Vorlage? | Satz = `template_lines` / Vorlage-Konto | rot |
| P-LAUFZEIT | Regel läuft aus? | `valid_until` leer oder > 3 Monate | gelb (Hinweis, blockiert nicht den Haken) |
| P-NEU | Erste Periode dieser Regel? | Regel hat ≥ 1 frühere abgenommene Periode | ◆ (Zeile abgewählt, Regel-Link) |
| P-JUDGE | Was sagt der Judge? | `confirm` | gelb (`adjust`) · rot (`flag`) |

Ableitung der Ampel: **rot** wenn ein roter Punkt · **gelb** wenn nur gelbe ·
**◆** wenn P-NEU · **⏸** wenn eine offene Klärung am Sachverhalt
(`needs_clarification`) · sonst **grün**. Nur grün wird von „Alle
übernehmen" gesetzt; gelb/rot/◆ kann die Buchhalterin bewusst anhaken
(steht dann im Bestätigungsdialog namentlich) — **außer** rot bei P-SUMME
und P-DUBLETTE (Haken gesperrt, Tooltip „erst Satz anpassen / ablehnen").

## 6. Zustände

| Zustand | Darstellung |
|---|---|
| Alles grün, nichts offen sonst | Liste mit vorbelegten Haken, Fußzeile „Ausgewählt 31 von 31", primär „Ausgewählte freigeben" — der 20-Sekunden-Fall |
| Befunde vorhanden | ▲-Zeilen oben, abgewählt, aufklappbar mit Grund; Fußzeile nennt „2 mit Befund nicht ausgewählt" |
| Neue Regel (erste Periode) | ◆-Zeile, abgewählt, Hinweis „Regel im Durchgang 1 angelegt (Dauerrechnung Planix)"; `G` öffnet die Regel zur Kontrolle |
| Wartet (offene Klärung an Mandant/Kanzlei) | ⏸, Haken gesperrt, Text „Frage an Mandant seit 20.08.: Erhöhung oder Nachzahlung?"; erscheint auch in Schritt 2/5 |
| Nachzügler (Periode vor dem Zeitraum) | Periode orange „07/2026 (nachgebucht)"; normal abnehmbar |
| Runde 2 (Diff-Modus nach Rücklauf) | Filter *offen* zeigt nur ersetzte/neue Zeilen; ersetzte mit „vorher / nachher" (Konto, Betrag, BU farbig); freigegebene aus Runde 1 bleiben ✓ |
| Nachtrag-Stapel | Tab zeigt nur Perioden, die im Nachtrag neu entstanden sind (i. d. R. keine) — sonst gedimmt „keine wiederkehrenden Buchungen im Nachtrag" |
| Stapel ab `ready` | Liste read-only, Haken weg, Entscheidungen sichtbar |
| Kein Dauersachverhalt beim Mandanten | Tab fehlt; Schritt 3 startet in Einzelfälle |
| Leerzustand (alle erledigt) | grüner Haken, „31 wiederkehrende Buchungen abgenommen am 27.08. 14:20 (S. Fakir)", Link Einzelfälle |

## 7. Kanzlei-Ablauf, den dieser Tab abdeckt

| Kanzlei-Ablauf (Prüfkatalog Gesamtbrief §7) | Hier |
|---|---|
| WK-Buchung (Dauersachverhalte) — „Sollstellungen aus Regeln (R23)" | die Liste |
| „Wie im Vormonat?" | Spalte Vormonat, P-VORMONAT |
| Belegfeld je Konto durchgängig | P-BELEGFELD-PERIODE |
| Miete/Abo/Leasing: fehlt ein Beleg? | **nicht hier** — Schritt 6 Gruppe 2 (Link in der Fußzeile) |
| Doppelte Lastschrift | P-DUBLETTE |
| Mieterhöhung / Betragsänderung | P-REGEL-BETRAG → aufklappen → Anpassen für diese Periode **oder** Regel ändern (G) **oder** Frage an Mandant (Klärung, wie Fall 3 im Schritt-3-Brief) |

## 8. Datenkontrakt

**Ein Loader für den Tab:**

```ts
loadRecurringReviewRows({ clientId, batchId }) → RecurringReviewRow[]

RecurringReviewRow {
  caseId, caseNumber, title, counterparty,
  ruleId, ruleSummary,                 // describeRecurringRule()
  bookingMode, expectedInterval, documentNumberStrategy, validFrom, validUntil,
  period: '2026-08', periodIsCarryOver: boolean,
  components: Array<'accrual' | 'payment' | 'document'>,
  entries: Array<{ entry, lines, rationale, judge }>,   // wie ReviewCaseVm.events[].entries
  belegfeld1, amount, accountsShort,   // '6310/6320 an 70003'
  previousPeriod: { period, amount, accounts, taxKey } | null,
  checks: Check[],                     // Abschnitt 5, gleiche Check-Struktur wie Schritt 3
  light: 'green' | 'yellow' | 'red' | 'new' | 'waiting',
  decision: 'open' | 'accepted' | 'edited' | 'rejected' | 'returned' | 'waiting' | 'deferred',
  selectable: boolean, preselected: boolean,
  isFirstPeriod: boolean,
  openClarification?: { audience, title, since }
}
```

**Zugehörigkeit** (reine Funktion, getestet): ein Sachverhalt ist WK-Fall,
wenn `kind = 'recurring_charge'` **und** alle Ereignisse mit `proposed`-Sätzen
im Stapel `recurring_rule_id` tragen. Sonst Einzelfall. Die Einzelabnahme
filtert genau diese Menge heraus (dieselbe Funktion, negiert — Ein-Kern).

**Writes:** siehe Abschnitt 4 — keine neuen Kerne. Die Sammelfreigabe ruft
`acceptCaseProposal` je Sachverhalt in einer Transaktion je Zeile (kein
Alles-oder-nichts über 30 Fälle: eine scheiternde Zeile bleibt offen und
wird rot gemeldet, die anderen sind durch).

**Reads:** Regel (`client_accounting_case_rule`), Periode
(`client_accounting_event.accrual_period`, `recurring_rule_id`), Vormonat
(`client_effective_journal_lines`, letzte Periode derselben Regel),
Belegfeld (`resolvePeriodDocumentNumber`), Fehlende Perioden
(`list_overdue_recurring`, nur Zähler).

## 9. Nicht-Ziele

- Keine Regelpflege im Tab (→ Regel-Editor).
- Keine Prüfpunkt-Quittungen je Punkt (→ die Zeilenfreigabe ist die Quittung).
- Keine Auto-Freigabe grüner Zeilen ohne Klick (R3, R17).
- Keine Anzeige fehlender Perioden als Todo (→ Schritt 6 / Gate 2a).
- Kein zweiter Editor, keine zweite Klärungs-Mechanik.

## 10. Offen (Owner)

1. **Owner-Hinweis zum letzten Schritt** — im Auftrag abgeschnitten („wenn
   beim letzten Schritt noch …"), nachzutragen.
2. Schwelle P-VORMONAT (30 %) — fester Default wie im Schritt-3-Brief.
3. Gruppierung nach Bestandteil als Default oder nur Umschalter — der Brief
   zeigt sie als Umschalter.

## 11. Jobs to be done — was die Nutzerin auf diesem Tab tut

| # | Job | Was sie dafür sehen muss | Aktion · Taste | Fertig, wenn |
|---|---|---|---|---|
| J1 | **Alle unveränderten Dauerbuchungen in einem Zug freigeben** | Liste mit Ampel, Vormonat-Spalte, Kontrollsumme je Konto | `Shift+A` → `Ctrl+Enter` | alle grünen ✓ |
| J2 | **Sehen, welche anders sind als sonst — und warum** | ▲-Zeilen oben, Befund im Tooltip, aufgeklappt mit Grund | `Enter` | — |
| J3 | **Eine Abweichung für diese Periode korrigieren** | Editor inline; Hinweis „nur diese Periode" | `E` → `A` | Zeile ✎ ✓ |
| J4 | **Die Regel dauerhaft ändern** (Mieterhöhung) | Link Regel; Vormonat-Vergleich | `G` → Regel-Editor → zurück → `A` | Regel geändert, Periode freigegeben |
| J5 | **Eine Buchung ablehnen** (doppelte Lastschrift, falsches Konto) | Satz aufgeklappt, Grund-Feld | `X` | Satz `rejected`, im Korb |
| J6 | **Dem Agenten etwas mitgeben** — Kommentar und zurück | Kommentarfeld | `R` | Klärung an Agent, im Korb |
| J7 | **Einen neuen Dauersachverhalt einmal bewusst ansehen** | ◆-Zeile, Regel, Beleg | `Enter`, `G`, `B` → `Space` → `A` | ✓ |
| J8 | **Den ganzen Sachverhalt sehen** (Vorperioden, Klärungen) | Drawer | `S` | — |
| J9 | **Wissen, welche Dauersachverhalte diesen Monat gar nicht gekommen sind** | Fußzeile mit Zähler + Link Schritt 6 | Link | — |
| J10 | **Nach dem Tab nahtlos in die Einzelfälle** | Weiterleitung, WK-Fälle dort nicht mehr | automatisch | Einzelfälle offen |
| J11 | **In Runde 2 nur das Geänderte sehen** | Filter *offen* = neu/ersetzt, vorher/nachher | lesen | — |

## 12. Informations-Check — hat jeder Job, was er braucht?

| Job | Benötigt | Vorhanden in | Lücke / Bewertung |
|---|---|---|---|
| J1 | WK-Zugehörigkeit, Ampel, Σ je Konto | `kind`, `recurring_rule_id`, Prüfpunkt-Ableitung (Schritt-3-Brief, Teilmenge), Zeilen-Summen | ✓ — Zugehörigkeits-Funktion **neu** (pure) |
| J2 | Vormonat je Regel | `client_effective_journal_lines` gefiltert über Ereignisse derselben `recurring_rule_id`, letzte `accrual_period` | ✓ ableitbar; bei `book_on_payment` ohne `accrual_period` am Zahlungs-Event → **Bau prüfen**, ob der Rescan die Periode setzt (R23c: Zahlung gründet die Periode) |
| J3 | Inline-Editor | `F109-buchungseditor-design-brief.md`, `saveEventBooking` | ✓ |
| J4 | Regel-Drawer | `/recurring`-Editor als `UrlDrawer` | ⚠ — heute eigene Seite; Drawer-Fähigkeit prüfen (F113 einbindbare Drawer) |
| J5/J6 | Kerne | `rejectEventBookings`, `raiseCaseClarification` | ✓ |
| J7 | „erste Periode" | frühere abgenommene Periode derselben Regel; Regel `agent_run_id`/`created_at` im Stapel | ✓ ableitbar |
| J8 | Drawer | bestehend | ✓ |
| J9 | Fehlende Perioden | `list_overdue_recurring` (Gate 2a) | ✓ Zähler |
| J10 | Ausschluss in der Einzelabnahme | dieselbe Zugehörigkeits-Funktion | ✓ |
| J11 | Diff gegen letzten Durchgang | `agent_run_id` an Sätzen, Rücklauf-Zeitpunkt | ✓ (wie Gesamtbrief §6) |

**Fazit:** bedienbar; eine neue reine Funktion (Zugehörigkeit), eine
Bau-Prüfung (`accrual_period` bei `book_on_payment`), Regel-Editor als Drawer.

## 13. Datenmodell dieses Tabs mit Beispieldatensatz

Stapel `2026-0009 · 08-2026-Ludwig` (review), Mandant Nordlicht Yachtservice
GmbH (SKR03). Beispielwerte erfunden.

```yaml
tab_summary: {rows: 31, open: 4, accepted: 27, sum_debit: 48211.37, sum_credit: 48211.37, missing_periods: 3}

rows:
  - caseNumber: "SV-2025-0044"   title: "Büromiete Musterstraße"   counterparty: "Hausverwaltung Kern"
    rule: {bookingMode: accrue_then_settle, expectedInterval: monthly, expectedDayOfMonth: 1, documentNumberStrategy: period_key, templateAmount: 1700.00, templateLines: [{account: "6310", amount: 1450.00, taxKey: "0"}, {account: "6320", amount: 250.00, taxKey: "0"}], personalAccount: "70003", validFrom: "2025-01-01", validUntil: null, matchingNote: "Abbuchung immer am 3."}
    period: "2026-08"   components: [accrual, payment]   belegfeld1: "082026"   amount: 1700.00   accountsShort: "6310/6320 an 70003"
    entries:
      - {id: je-44A, kind: accrual, date: 2026-08-01, lines: [{S: "6310", amount: 1450.00, bu: "0"}, {S: "6320", amount: 250.00, bu: "0"}, {H: "70003", amount: 1700.00}], rationale: "Sollstellung aus Regel.", judge: confirm}
      - {id: je-44B, kind: payment, date: 2026-08-03, bank_text: "MIETE AUG 2026 KERN", lines: [{S: "70003", amount: 1700.00}, {H: "1800", amount: 1700.00}], rationale: "Zahlung per IBAN-Match, gleicht Sollstellung aus.", judge: confirm}
    previousPeriod: {period: "2026-07", amount: 1700.00, accounts: "6310/6320", taxKey: "0"}
    checks: [{code: P-SUMME, state: green}, {code: P-REGEL-BETRAG, state: green}, {code: P-VORMONAT, state: green}, {code: P-BELEGFELD-PERIODE, state: green}, {code: P-AUSGLEICH, state: green}, {code: P-JUDGE, state: green}]
    light: green   decision: open   selectable: true   preselected: true

  - caseNumber: "SV-2025-0061"   title: "Leasing Transporter"   counterparty: "VW Leasing GmbH"
    rule: {bookingMode: accrue_then_settle, expectedInterval: monthly, documentNumberStrategy: from_document, templateAmount: 412.80, counterAccount: "4840", taxKey: "9", personalAccount: "70011", matchContractNumber: "L-4471-2025"}
    period: "2026-08"   components: [document, accrual, payment]   belegfeld1: "RE-88213"   amount: 412.80   accountsShort: "4840 an 70011"
    document: {invoice_number: "RE-88213", invoice_date: 2026-08-01, total: 412.80, billing_mode: regular}
    previousPeriod: {period: "2026-07", amount: 412.80, accounts: "4840", taxKey: "9"}
    light: green   decision: open   selectable: true   preselected: true

  - caseNumber: "SV-2025-0058"   title: "Strom Abschlag Werkstatt"   counterparty: "Stadtwerke Kiel"
    rule: {bookingMode: book_on_payment, expectedInterval: monthly, documentNumberStrategy: period_key, matchAmount: 280.00, matchAmountTolerancePercent: 15, counterAccount: "4240", taxKey: "9"}
    period: "2026-08"   components: [payment]   belegfeld1: "082026"   amount: 310.00   accountsShort: "4240 an 1800"
    previousPeriod: {period: "2026-07", amount: 280.00, accounts: "4240", taxKey: "9"}
    checks: [{code: P-REGEL-BETRAG, state: yellow, reason: "310,00 statt 280,00 (+10,7 %) — innerhalb 15 % Toleranz; Klärung gestellt (R23c)"}, {code: P-VORMONAT, state: yellow, reason: "+10,7 % gegen 07/2026"}]
    openClarification: {audience: client, title: "Abschlag erhöht — dauerhaft, einmalig oder falsch?", options: ["dauerhafte Erhöhung ab 08/2026", "einmalige Abweichung", "gehört nicht hierher"], since: "2026-08-20"}
    light: waiting   decision: waiting   selectable: false   preselected: false

  - caseNumber: "SV-2026-0212"   title: "Software-Abo Werkstattplanung"   counterparty: "Planix GmbH"
    rule: {bookingMode: accrue_then_settle, expectedInterval: monthly, documentNumberStrategy: from_document, templateAmount: 59.00, counterAccount: "4964", taxKey: "9", personalAccount: "70044", createdInRun: run-14, source: "Dauerrechnung PLX-2026-08 (billing_mode recurring)"}
    period: "2026-08"   components: [document, accrual, payment]   belegfeld1: "PLX-2026-08"   amount: 59.00   accountsShort: "4964 an 70044"
    previousPeriod: null   isFirstPeriod: true
    checks: [{code: P-NEU, state: new, reason: "Erste Periode — Regel im Durchgang 1 aus Dauerrechnung angelegt"}]
    light: new   decision: open   selectable: true   preselected: false

  - caseNumber: "SV-2025-0039"   title: "Darlehen Werkstattumbau"   counterparty: "Förde Sparkasse"
    rule: {bookingMode: book_on_payment, expectedInterval: monthly, documentNumberStrategy: period_key, matchAmount: 1250.00, templateLines: [{account: "0630", percent: 84}, {account: "2120", percent: 16}]}
    period: "2026-08"   components: [payment]   belegfeld1: "082026"   amount: 1250.00   accountsShort: "0630/2120 an 1800"
    previousPeriod: {period: "2026-07", amount: 1250.00, accounts: "0630/2120"}
    light: green   decision: accepted   acceptedAt: "2026-08-27T14:18:00+02:00"   acceptedBy: u-simon

  - caseNumber: "SV-2025-0052"   title: "Kfz-Versicherung Flotte"   counterparty: "HDI Versicherung"
    rule: {bookingMode: book_on_payment, expectedInterval: monthly, matchAmount: 189.40, counterAccount: "4520", taxKey: "0"}
    period: "2026-08"   components: [payment]   amount: 189.40   accountsShort: "4520 an 1800"
    checks: [{code: P-DUBLETTE, state: red, reason: "Zweite Zahlung 189,40 am 28.08. für dieselbe Periode — Verdacht doppelte Lastschrift (R23c); zweite Zahlung nicht gebucht, gemeldet"}]
    light: red   decision: open   selectable: false   preselected: false   lockReason: "erst ablehnen oder anpassen"

  - caseNumber: "SV-2025-0047"   title: "Miete Lagerhalle"   counterparty: "Hafen Immobilien KG"
    period: "2026-07"   periodIsCarryOver: true   components: [accrual, payment]   amount: 2100.00   belegfeld1: "072026"
    light: green   decision: open   preselected: true   note: "Nachgebucht: Zahlung kam erst am 04.08."

missing_periods: [{caseNumber: "SV-2025-0049", title: "Reinigung Büro", expectedDay: 15, note: "keine Zahlung, keine Sollstellung — Regel book_on_payment"}, {caseNumber: "SV-2025-0055"}, {caseNumber: "SV-2025-0063"}]   # nur Zähler + Link Schritt 6

confirm_dialog (nach Shift+A):
  selected: 27   entries: 54   sum_debit: 41880.20   sum_credit: 41880.20
  by_account: [{account: "6310", name: "Miete", amount: 4350.00}, {account: "4840", name: "Leasing", amount: 1238.40}, {account: "0630", amount: 1050.00}, {account: "2120", amount: 200.00}, {account: "4964", amount: 236.00}, "…"]
  with_findings_included: []          # bewusst angehakte gelbe Zeilen, hier keine
  not_selected: {findings: 2, new: 1, waiting: 1}

after_accept:
  rows_open: 4                         # Strom (wartet), Planix (neu), HDI (rot), Lagerhalle? nein — die war grün und ist durch
  redirect: false                      # erst wenn 0 offen
```

## 14. DATEV-Hinweise

- **Wiederkehrende Buchungen** sind in DATEV eine eigene Funktion („WK",
  `mark_of_origin = 'WK'`): die Kanzlei pflegt einmal einen Buchungssatz mit
  Rhythmus, DATEV erzeugt ihn je Periode, und die Buchhalterin nimmt den
  WK-Stapel monatlich **als Ganzes** ab. Genau dieses Muster bildet der Tab
  nach — Liste, Kontrollsumme, ein Klick. Der Unterschied: bei Ludwig hängt
  an jeder Periode auch die Zahlung (und ggf. der Beleg), und der Vormonat
  steht daneben.
- **Belegfeld 1** bei WK ist in der DATEV-Praxis die Periodenkennung
  (`082026`) oder die Dauerrechnungsnummer; Ludwig folgt der abgeleiteten
  Strategie je Regel (R23b). Eine falsche Nummer verhindert den
  OPOS-Ausgleich — deshalb ist P-BELEGFELD-PERIODE rot, nicht gelb.
- **Sollstellung + Zahlung** entsprechen in DATEV zwei Buchungssätzen
  (Aufwand an Kreditor · Kreditor an Bank). Die Liste zeigt sie als eine
  Zeile, weil die Kanzlei sie als einen Vorgang denkt; aufgeklappt sind es
  zwei Sätze.
- **Doppelte Lastschrift** ist der klassische WK-Fehler in DATEV („zweimal
  Miete im August"). P-DUBLETTE sperrt den Haken bewusst.

## 15. Design-Prinzipien (vom Owner vorgegeben, gelten für jeden Screen)

1. **Business-Webanwendung, nicht Marketing.** Kompakt, übersichtlich.
2. **Schlichte Screens.** Die Liste ist grau und dicht; nichts blinkt.
3. **Farbe nur für Probleme.** ▲ rot/gelb und ◆ tragen die einzige Farbe;
   grün ist ein Haken.
4. **Hotkey-freundlich.** `Space`, `Shift+A`, `A`, `E`, `X`, `R`, `G`.
5. **Todo-Liste als Grundmuster** — hier wörtlich: eine Liste mit Haken.
6. **Eine Information, ein Ort — und Drawer für den Rest.** Regel, Sachverhalt,
   Beleg, Kontenblatt als Drawer; nichts wird kopiert.
7. **DATEV-Optik bei Zahlen und Buchungen.** Konto links, Beträge rechts,
   BU neben dem Konto, Belegfeld 1 sichtbar.
8. **Der Mensch entscheidet, der Server rechnet.** Ampel und Vormonat sind
   deterministisch; der Haken ist der Mensch.
9. **Nichts zweimal.** WK-Fälle erscheinen nie in der Einzelabnahme;
   fehlende Perioden gehören Schritt 6.
10. **Großer Bildschirm.** Die Liste nutzt die volle Breite; aufgeklappte
    Zeile zweispaltig; Fußzeile sticky.

## 16. Szenarien für die Vorschau

**Bitte einen Szenario-Umschalter in die Vorschau einbauen.**

| # | Szenario | Was es zeigt |
|---|---|---|
| S1 | **Alles grün** — 31 Zeilen, alle vorbelegt | Liste, Fußzeile „31 von 31", Bestätigungsdialog mit Σ je Konto, Erfolgsleiste, Weiterleitung zu Einzelfälle |
| S2 | **Mit Befunden** — 2 ▲, 1 ◆, 1 ⏸ oben, Rest grün | Ampel, abgewählte Zeilen, Fußzeile „Nicht ausgewählt: …" |
| S3 | **Zeile aufgeklappt, grün** (Büromiete) | zwei Sätze, Regel & Periode, Prüfpunkte eingeklappt, Aktionen |
| S4 | **Zeile aufgeklappt, Befund** (Strom +10,7 %, wartet) | gelbe Prüfpunkte mit Grund, Klärung an Mandant mit Optionen, Haken gesperrt |
| S5 | **Zeile aufgeklappt, rot** (HDI doppelte Lastschrift) | P-DUBLETTE, Haken gesperrt, `X` mit Grund |
| S6 | **Neue Regel** (Planix, erste Periode) | ◆, Beleg-Kopf Dauerrechnung, Regel-Drawer, bewusster Haken |
| S7 | **Anpassen inline** (Miete 1.800 statt 1.700 für diese Periode) | Editor in der Zeile, Hinweis „nur diese Periode — Regel ändern: G", danach ✎ |
| S8 | **Runde 2 nach Rücklauf** | Filter *offen* zeigt 3 ersetzte Zeilen mit vorher/nachher; 28 ✓ ausgegraut unter *alle* |
| S9 | **Kommentar + Zurück an den Agenten** | Kommentarfeld, `R`, Zeile ↩, Korb-Zähler im Rail steigt |
| S10 | **Leerzustand** | grüner Haken, Abnahme-Zeitpunkt, Link Einzelfälle |
| S11 | **Stapel ab `ready`** | read-only, Entscheidungen sichtbar, keine Haken |
