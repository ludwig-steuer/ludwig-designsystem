# F196 · Erhebung — welche Sachverhalts-Ausprägungen der Bestand wirklich hergibt

| | |
|---|---|
| Für | `designsystem-worker`, Aufgabe 0152 (Welle 2 schneiden) — Anfrage vom 2026-09-10 |
| Datenstand | Staging über den Pooler 6543, 2026-09-10, nur `SELECT`; **1.094 Sachverhalte**, 6 Mandanten, 2 Wirtschaftsjahre; 2.424 Ereignisse; 1.720 Buchungen; 234 Klärungen; 135 Erwartungen; 30 Regeln |
| Regeln | nur Aggregate, Feldnamen, Verteilungen — keine Namen, Beträge, Texte |
| Schon erhoben, hier nicht wiederholt | Füllgrade der Sachverhalts-Spalten und Relationen: `packages/designsystem/docs/entitaeten/accounting-case.md` (Datenpunkte, Schaubild) · **Regel-Felder vollständig**: `entitaeten/recurring-rule.md` (Datenstand 2026-09-08, 30 Regeln, jede Spalte mit Füllgrad) · Zustände und Regeln S1–S18: `docs/topics/sachverhalt.md` |
| Erhoben von | ludwig-manager, 2026-09-10 |

## 1 · Die Ausprägungen nach Häufigkeit

Ereignis-Form je Fall = welche Quellen an den Ereignissen hängen
(`source_doc_id` / `bank_transaction_id` / Art `open_item_carryover` /
`accrual`). Anteile an allen 1.094.

| # | Ausprägung | Fälle | Anteil | Datenform |
|---|---|---|---|---|
| A1 | **Ausgangsrechnung als OPOS-Vortrag** | 318 | 29 % | `kind=outgoing_invoice`, `created_by_kind=system`, `batch_opos_reference` gesetzt (470 Fälle gesamt), **ein** Ereignis `open_item_carryover` **ohne Buchung** (`no_booking_required_reason` gesetzt; 465 solcher Ereignisse), `lifecycle=open` (338 der 441 Ausgangsrechnungen sind offen), Personenkonto gesetzt, kein Beleg. Der Regelfall der Liste — und die stillste Seite |
| A2 | Eingangsrechnung, nur Beleg | 147 | 13 % | `incoming_invoice`, 1 Ereignis `document_received` mit Beleg; Buchung `ai_proposed` (`accepted` 220 · `proposed` 33 · `reversed` 29 über alle Eingangsrechnungen), Zahlungserwartung offen (`kind=payment`, `direction=outgoing`, Frist aus `invoice_due_date` 48 · `payment_term` 19 · `client_default` 11) |
| A3 | Eingangsrechnung, Beleg + Zahlung | 111 | 10 % | 2 Ereignisse (`document_received` + `payment_out`), je eine Buchung, Klammer `client_open_item_links` (60 Fälle haben Klammern: p50 1 · p90 12 · max 15), Erwartung `matched`; 222 der 407 Eingangsrechnungen `closed_accepted` |
| A4 | Eingangsrechnung als OPOS-Vortrag | 85 | 8 % | wie A1, Seite Kreditor |
| A5 | Mandantenstapel | 87 (nur Bank) + 11 + 3 | 9 % | `adjustment_only`, Ereignisse `payment_in`/`payment_out` mit Buchung `origin=client_import`, **alle `proposed`** (833 Buchungen, kein `proposal_rationale`, kein Judge); p50 1 · p90 2 · **max 508 Ereignisse** in einem Fall; 69 `closed_accepted`, 24 `open`, 8 `needs_clarification` |
| A6 | Dauersachverhalt **ohne Regel** | 85 | 8 % (**75 % der 114 Dauersachverhalte**; der Brief sagte 72 %) | §2 |
| A7 | Zahlung ohne Beleg (Eingang) | 52 | 5 % | `incoming_invoice`, nur Bank-Ereignis, Buchung gegen Personenkonto; davon `waiting_for_documents` 15, Beleg-Erwartung offen (`kind=document`, 39 offen, Eskalation 0 bei 38, **einmal Stufe 1**, Frist immer `client_default`) |
| A8 | Ausgangsrechnung mit Zahlung | 51 (nur Bank) + 32 (Beleg + Bank) + 36 (nur Beleg) | 11 % | Seite Debitor; `payment_in` mit `ai_proposed` (185 accepted · 30 proposed); 90 `closed_accepted` |
| A9 | Dauersachverhalt **mit Regel** | 29 | 3 % | §2 |
| A10 | Ausgleichsgruppe | 20 | 2 % | `internal_transfer`, p50 3 · p90 18 · **max 25** Ereignisse, 11 nur Bank · 8 Beleg + Bank; **Verrechnungskonto gesetzt bei nur 3 Fällen** im ganzen Bestand (S15 ist im Bestand fast leer) |
| A11 | Spesenabrechnung | 8 | 1 % | `expense_report`, p50 7 · max **38** Ereignisse, Beleg + Bank 4; 1 wartet auf Beleg |
| A12 | Vertrag | 2 | 0 % | `contract`, 1 Beleg-Ereignis, offen, keine Buchung |
| A13 | Fall ohne Ereignis | 41 | 4 % | über alle Arten (Dauer 23, Eingang 12) — die „leere" Seite ist real, nicht nur ein Story-Zustand |

**Querliegende Zustände** (zählen über alle Arten):

| Zustand | Zahl | Datenform |
|---|---|---|
| Rückfrage offen | 45 Fälle `needs_clarification`; 155 Fälle mit Klärungen, p50 1 · p90 3 · **max 12** (alle 12 offen, ein Mandantenstapel) | §3 |
| Wartet auf Beleg | 26 `waiting_for_documents` | A7 |
| Bei der Kanzlei | `disposition=accounting` 246 (davon `open` 27, `needs_clarification` 43, `closed` 165); `agent` 810; NULL 58; **`client` 0** | Audit `case.routed_to_accounting` 11, `case.routed_by_user` 35 |
| Storniert / zurückgezogen | 86 Buchungen `status=reversed` — **aber 0 Storno-Buchungen** (`reverses_entry_id`, `origin=system_reversal` beide 0). Es sind zurückgezogene Vorschläge: `proposal_rationale.withdrawn_by_agent` 85, Audit `booking.proposal_withdrawn_by_agent` 220 | E7 des Briefs („Storno-Buchung `system_reversal`") gibt es im Bestand **nicht** |
| Ersetzt / zusammengeführt | 14 Fälle `closed_superseded`; 2 Ereignisse `superseded_by_event_id`; Audit `case.merged_by_agent` 23 · `case.superseded_by_merge` 23 | Ersetzen passiert am **Fall** (Merge), fast nie am Ereignis |
| Ereignis ohne Buchung, bewusst | 705 Ereignisse (29 %) mit `no_booking_required_reason`: Vortrag 465, Beleg 223 (davon 27 Dauerrechnungen mit Regel), Bank 68 | S9 |
| Belegnummern-Modus `multiple` | 49 Fälle | Register 0 % (Profil: 99 % ohne) |
| Im Stapel | 203 mit `export_batch_id` | |
| Angelegt von | `agent` 624 · `system` 470 · **`user` 0** | |
| Verlauf (Audit) | 1.473 Fälle mit Einträgen, p50 4 · p90 10 · max 92; häufigste Aktionen: `case.booked_by_agent` 1.916 · `booking.judged_by_agent` 1.618 · `case.doc_attached_by_agent` 1.042 · `case.created_from_doc_by_agent` 695 · `case.created_from_bank_by_agent` 591 · `event.no_booking_required` 454 · `case.clarification_raised` 442 · `booking.proposal_withdrawn_by_agent` 220 · `booking.accept` 166 · `case.comment_added` 31 · `booking.reverse` 18 | Z6-Tiefen: Verlauf = case.*, Protokoll = booking.judged/withdrawn/accept, Technik = Rest |

## 2 · Die wiederkehrenden Fälle

**114 Dauersachverhalte** (`kind=recurring_charge`): 85 ohne Regel (75 %),
29 mit Regel (25 %). Lifecycle: mit Regel **alle 29 `open`**; ohne Regel
58 open · 13 needs_clarification · 9 waiting_for_documents · 5 closed.

| | ohne Regel (85) | mit Regel (29) |
|---|---|---|
| Ereignisse je Fall | p50 1 · p90 2 · max 6 | p50 3 · max 4 |
| Ereignis-Form | 50 nur Bank · **23 leer** · 20 Beleg + Bank · 20 nur Beleg (Summe > 85 wegen Rundung der Klassen: 3 Fälle zählen doppelt — ignorieren) | 27 × `document_received` **ohne Buchung** (die Dauerrechnung aus dem Onboarding-Import, `no_booking_required_reason`) · 26 × `accrual` mit Regel-Buchung · 12 × `payment_in`/`out` (8 `ai_proposed`, 3 `recurring_rule`, 1 offen) |
| Buchungen | `payment_out ai_proposed` 39 accepted · 12 proposed · 1 reversed; `manual` 5; `payment_in ai_proposed` 5 | `accrual → origin=recurring_rule` 24 accepted + 2 proposed; Zahlung `ai_proposed` 8 accepted |
| Monate mit Ereignissen je Fall | 1 Monat: 61 Fälle · 2 Monate: 30 · **mehr: 0** | dito — die Regel-Buchungen liegen **alle im August 2026** (`event_date` 2026-08-01 … 08-28) |
| `expected_interval` am Fall | NULL | `monthly` 29 (= genau die mit Regel) |
| Belegverzicht (`document_not_required_reason`) | 7 | 0 |

**Antworten auf die vier Fragen:**

1. **Ohne : mit = 85 : 29 (75 % : 25 %)** — bestätigt in der Größenordnung.
   Wichtiger als das Verhältnis: die 29 mit Regel sind **ein** Importpfad
   (F91 Onboarding, `import_reference` `datev-wk:`, 29 von 30 Regeln), ein
   Monat, drei Mandanten. Der Bestand zeigt die Regel-Welt einmal, nicht
   zwölfmal.

2. **Was die Regel trägt — gefüllt vs. nur Schema** (aus `recurring-rule.md`,
   hier nur die Kurzform; jede Zeile dort mit Zahl):
   - **Gefüllt (≥ 93 %):** Gegenpartei-Name, `booking_mode`
     (`accrue_then_settle` 29 · `book_on_payment` 1 · `match_only` 0),
     `is_active` (29 aktiv), erwarteter Betrag (`template_amount` = `match_amount`
     in allen 30), `expected_interval` (**alle `monthly`**),
     `expected_direction` (`payment_in` 26 · `payment_out` 2),
     `expected_day_of_month` (1. 22 · 2. 3 · 28. 3 · 10. 1), `valid_from`,
     `template_description` (p50 38 · p90 58 · max 60 Zeichen),
     `template_counter_account_number`, `personal_account_number`,
     `datev_document_number` (immer 8 Zeichen), `document_number_strategy`
     (`period_key` 26 · `from_document` 3 · `fixed` 1), `profile_source`
     (`onboarding` 24 · `derived` 5), `matches_documents` 29 × true.
   - **Nur im Schema (0 von 30):** `template_lines` (Split-Vorlage,
     Prozent-Zeilen), `matching_note`, `valid_until`, `payment_account_id`,
     `match_counterparty_iban`, `match_purpose_regex`, `match_contract_number`,
     `match_document_text_regex`, `match_amount_tolerance_percent`,
     `agent_run_id`. `template_tax_key` 3 von 30.
   - **Folgerung für die Darstellung:** Eine Regel ist im Bestand ein Satz
     „**monatlich am 1. erwartet Ludwig einen Zahlungseingang von <Gegenpart>
     über <Betrag>; gebucht wird <Gegenkonto> an <Personenkonto>, Beleg
     <Strategie>**" — Bedeutung, Auslöser, Wirkung, Erwartung, Strategie und
     Rhythmus sind **alle** aus gefüllten Feldern ableitbar. Prozent-Zeilen,
     Toleranzen, IBAN/Regex-Kriterien und Lernnotiz kann keine Fixture aus dem
     Bestand belegen; sie gehören in **eine** Rand-Story, nicht in den
     Regelfall (Belegregel des Profils: „nur Aggregate mit absoluter Zahl daneben").

3. **Automatische Buchungen — woran man sie erkennt:**
   - `client_journal_entry.origin = 'recurring_rule'` (29: 27 accepted, 2
     proposed), `entry_kind` `revenue` 25 · `payment` 3 · `expense` 1;
     `proposal_rationale` trägt **andere Schlüssel** als der Agent:
     `rule_id`, `period`, `source`, `needs_review`, `judge` — beim Agenten
     `step`, `agent_rationale`, `sources`, `judge`, `belegfeld_source`,
     `guard_warnings`, `withdrawn_by_agent`. Kein `agent_run_id`, kein
     `acceptance_quality` (das steht nur an Agent-Buchungen: `ai_unmodified`
     628 · `ai_edited` 15 · `manual_only` 3). Alle 27 accepted sind
     exportiert. Zeilen je Buchung: p50 2 · p90 3 · max 36 (Bestand gesamt).
   - Das Ereignis dahinter: `kind=accrual`, `recurring_rule_id` gesetzt (27
     Ereignisse), `accrual_period` gesetzt (26). Die Zahlung, die die Regel
     zuordnet, ist ein **eigenes** Ereignis `payment_in` — 3 davon mit
     Regel-Buchung, 8 vom Agenten gebucht.
   - **Container oder zwölf Ereignisse:** zwölf Ereignisse. Jeder Monat ist
     ein `accrual`-Ereignis mit eigener Buchung plus (bei Zahlungseingang)
     ein `payment`-Ereignis; der Sachverhalt ist die Klammer. Im Bestand
     existiert davon **genau ein Monat** — ein Jahr wäre 12 × accrual + bis
     zu 12 × payment + die Dauerrechnung = **bis 25 Ereignisse**, was mit
     `internal_transfer` (max 25) und `expense_report` (max 38) die
     Obergrenze des Einzelfalls ist. Die Fixture muss das extrapolieren; der
     Bestand belegt nur die Form eines Monats.
   - **Was die Sachbearbeiterin sehen soll** (Vorschlag aus den Daten, kein
     Owner-Entscheid): in der Zeile die Herkunft `buchung_origin =
     recurring_rule` („Regelwerk") statt eines Agenten-Textes; statt
     `agent_rationale` die Regel als Satz (Punkt 2) mit Periode; kein Judge-
     Urteil (es gibt keins); `needs_review` als einziger Hinweis. Die
     Registry sagt zu `recurring_rule` „wird nicht nach DATEV exportiert" —
     der Bestand widerspricht (27 von 27 exportiert). **Befund** für die
     Registry-Beschreibung.

4. **Datenform je Szenario** — siehe Tabelle §1 und §2; Tabellen: `client_accounting_case` (Kopf), `client_accounting_event` (Strang; `recurring_rule_id`, `accrual_period`, `no_booking_required_reason`, `superseded_by_event_id`), `client_journal_entry` + `_line` (Buchung; `origin`, `status`, `proposal_rationale`, `acceptance_quality`, `exported_at`, `datev_mirror_entry_id`), `client_accounting_case_rule` (Regel), `client_accounting_case_clarification`, `client_accounting_case_expectation`, `client_open_item_links` (Klammer), `platform_audit_events` (`resource_kind='accounting_case'`).

## 3 · Klärungen und Erwartungen (für E4/E5/S5)

**234 Klärungen** an 155 Fällen (p50 1 · p90 3 · max 12).

| `type` | `audience` | `severity` | beantwortet | n |
|---|---|---|---|---|
| question | accounting | required | ja | 84 |
| question | accounting | required | **nein** | 61 |
| question | agent | required | ja | 38 |
| comment | agent | optional | — | 17 |
| question | accounting | optional | ja | 17 |
| question | client | required | ja / nein | 8 / 1 |
| comment | accounting | optional | — | 8 |

Füllgrade: `title` 99 % · `context` und `question` **28 %** (65) ·
`recommendation` **9 %** (22) · Antwortoptionen 27 % (64) · `sources_json`
31 % (72) · `expected_document` 3 % · `allow_free_text` 88 %. **Zurückgestellt
(`deferred_until`): 0 von 234** — S11/S12 gibt es im Bestand nicht; E5-Variante
`RueckfrageZurueckgestellt` ist reine Extrapolation. Die gegliederte Frage nach
S16 (Titel + Kontext + Frage + Empfehlung) ist der **Ausnahmefall** (≈ 9 %),
der Regelfall ist Titel + `professional_text`.

**135 Erwartungen:** `payment` 92 (outgoing 80, incoming 12; erledigt
`matched` 17), `document` 43 (alle incoming, Frist `client_default`, erledigt
`matched` 1 · `manual` 2). Eskalation: Stufe 0 bei 134, **Stufe 1 einmal**,
Stufe 2 nie.

## 4 · Was der Brief F196 annimmt und der Bestand nicht hergibt

| Brief | Bestand |
|---|---|
| E7 Storno-Buchung `system_reversal` | 0 — „storniert" ist im Bestand ein zurückgezogener Vorschlag (`withdrawn_by_agent`), ohne Gegenbuchung |
| E5-Variante zurückgestellt | 0 |
| E4-Variante überfällig Stufe 2 | 0 (Stufe 1 einmal) |
| S2 Regel mit Prozent-Zeilen, Lernnotiz, Toleranz | 0 — nur Einzeiler-Vorlage, Toleranz 0,00 |
| S4 Verrechnungskonto am Fall | 3 Fälle |
| `disposition = client` | 0 |
| Judge mit drei Urteilen und Korrekturen | `acceptance_quality=ai_edited` 15 — selten; `rationale.judge` an 751 Agent-Buchungen |
| S5 Mandantenstapel mit 120 Ereignissen | real: max 508 Ereignisse, 12 offene Klärungen an einem Fall — der Extremfall ist größer als angenommen |

Diese Zeilen sind kein Grund, die Szenarien zu streichen — die Regeln
S11/S12/S15 gelten, und die Seite muss sie tragen. Sie sagen nur, was
**Rand** ist (je eine Story) und was **Regelfall** (A1–A3, A5–A8: acht
Ausprägungen decken 88 % der Fälle).
