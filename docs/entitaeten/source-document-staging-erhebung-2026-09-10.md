# Source Document — Staging-Erhebung

- **Datum:** 2026-09-10
- **Quelle:** Staging-DB (Supabase Cloud, Transaction-Pooler 6543), **read-only** — ausschließlich `SELECT`, Temp-Views ohne Persistenz
- **Grundgesamtheit:** N = **554** Belege (`ludwig.client_source_docs`), 6 Mandanten (36 … 161 Belege je Mandant, p50 = 95)
- **Subtypen:** 428 Rechnungszeilen (`client_source_docs_invoices`, 1:1, keine Waisen), 3 Verträge (`client_source_docs_contracts`); 126 Belege ohne Subtyp-Zeile (Kontoauszüge, `other`, Reports …)
- **Keine Kundendaten:** nur Aggregate, Feldnamen und Enum-/Code-Werte. Prozentangaben beziehen sich auf N = 554, sofern nicht anders vermerkt.

Alle Abfragen laufen über eine Temp-View `v` = `client_source_docs d LEFT JOIN client_source_docs_invoices i ON i.source_doc_id = d.id LEFT JOIN ops_document_text t ON t.source_doc_id = d.id` (Subtyp → Supertyp immer LEFT JOIN).

---

## 1. Zustände mit Häufigkeit

### 1.1 Hauptachsen des Belegs

**`client_source_docs.status`** (Achse `beleg_inbox`, DB-CHECK: `pending_classification | classified | classification_failed | deleted | awaiting_input`)

| Wert | Anzahl | % |
|---|---:|---:|
| classified | 553 | 99,8 |
| classification_failed | 1 | 0,2 |
| pending_classification | 0 | 0 |
| awaiting_input | 0 | 0 |
| deleted | 0 | 0 |

**`client_source_docs_invoices.processing_status`** (Achse `beleg`, nur Invoice-Subtyp)

| Wert | Anzahl | % von N | % der 428 Rechnungen |
|---|---:|---:|---:|
| processed | 419 | 75,6 | 97,9 |
| review_needed | 8 | 1,4 | 1,9 |
| failed | 1 | 0,2 | 0,2 |
| pending / in_progress | 0 | 0 | 0 |
| *(kein Invoice-Subtyp)* | 126 | 22,7 | — |

**`client_source_docs_invoices.processing_stage`** (Achse `beleg_stage`)

| Wert | Anzahl | % von N |
|---|---:|---:|
| interpreted | 399 | 72,0 |
| preprocessed | 25 | 4,5 |
| classified | 4 | 0,7 |
| extracted / proposed | 0 | 0 |
| *(kein Invoice-Subtyp)* | 126 | 22,7 |

**Erledigung** (`completed_at` + `completed_via`, Achse `beleg_erledigung`)

| completed_at gesetzt | completed_via | Anzahl | % |
|---|---|---:|---:|
| ja | booking | 269 | 48,6 |
| ja | *(NULL)* | 97 | 17,5 |
| ja | manual | 77 | 13,9 |
| ja | no_booking_required | 63 | 11,4 |
| ja | superseded | 7 | 1,3 |
| ja | case_closed | 1 | 0,2 |
| ja | import | 1 | 0,2 |
| **nein** | *(NULL)* | **39** | **7,0** |

→ 515 von 554 Belegen (93,0 %) sind erledigt; 97 davon (17,5 %) ohne `completed_via` (Altbestand vor Einführung des Feldes).

**`source_doc_type`**

| Wert | Anzahl | % |
|---|---:|---:|
| invoice | 431 | 77,8 |
| other | 60 | 10,8 |
| credit_card_statement | 37 | 6,7 |
| bank_statement_pdf | 16 | 2,9 |
| travel_expense_report | 5 | 0,9 |
| contract | 3 | 0,5 |
| *(NULL)* | 2 | 0,4 |
| declaration | 0 | 0 |

**`doc_category`** (Achse `beleg_kategorie`): performance 265 (47,8 %) · *(NULL)* 227 (41,0 %) · payment 46 (8,3 %) · report 6 · foundation 6 · internal 4.

**`class_document_kind`** (Achse `beleg_charakter`): original 421 (76,0 %) · unknown 63 (11,4 %) · credit_note 26 (4,7 %) · self_billing 25 (4,5 %) · refund 17 (3,1 %) · *(NULL)* 2.

Weitere Achsen: `review_disposition` accounting 19 (3,4 %), sonst NULL · `superseded_at` gesetzt 21 (3,8 %) · `datev_ref_system` gesetzt 395 (71,3 %) · `class_overridden_at` gesetzt 28 (5,1 %).

### 1.2 Einzelzustände

| Zustand | Definition (Feld) | Anzahl | % von N |
|---|---|---:|---:|
| Klassifikation fehlgeschlagen | `status = 'classification_failed'` **oder** `status = 'classified' AND class_document_form IS NULL` | 1 | 0,2 |
| Kein Textlayer / OCR-Fallback | `ops_document_text.extraction_method IN ('local_ocr','mixed')` | 125 (106 local_ocr + 19 mixed) | 22,6 |
| — davon ohne `ops_document_text`-Zeile | kein Join-Treffer | 2 | 0,4 |
| Dublettenverdacht | `…_invoices.datev_history_duplicate IS NOT NULL` | 7 (6 suspected + 1 certain) | 1,3 |
| Ohne Partner | Invoice-Zeile vorhanden und `partner_match_outcome IN ('ambiguous','not_found') OR IS NULL` | 169 | 30,5 |
| Empfänger-Mismatch | `recipient_match = 'mismatch'` | 35 | 6,3 |
| Split — Elternbeleg | ≥ 1 Kind mit `parent_source_doc_id = d.id` | 18 (davon 1 selbst Kind) | 3,2 |
| Split — Kindbeleg | `parent_source_doc_id IS NOT NULL` | 99 | 17,9 |
| awaiting_input | `status = 'awaiting_input'` | 0 | 0 |
| Verschlüsseltes PDF | **kein Feld vorhanden** (s. u.) | n/a | n/a |
| Pipeline fehlgeschlagen | `processing_status = 'failed'` | 1 | 0,2 |
| review_needed | `processing_status = 'review_needed'` | 8 | 1,4 |

Details:

- **Klassifikation:** `class_document_form IS NULL` tritt ausschließlich beim einen `classification_failed`-Beleg auf; kein `classified`-Beleg ohne Form. Der einzige `classification_error`-Text beginnt mit `classifier reported failure: OCR fallbac…` (OCR-Fallback-Problem, kein Verschlüsselungshinweis).
- **Verschlüsseltes PDF:** Es gibt **kein** Feld dafür — weder an `client_source_docs`, `ops_stored_files` (`metadata_json` ist bei allen 554 verknüpften Dateien leer/NULL) noch in `classification_error` (0 Treffer auf `encrypt|password|verschl`). Im Code (`apps/web/src/modules/source-docs`, `apps/workflows`, `document-simple-classifier`) findet sich ebenfalls kein Marker `encrypted_pdf`/`password_protected`. Aussage: nicht messbar.
- **Partner-Match-Verteilung** (`partner_match_outcome`, CHECK: `confirmed | ambiguous | not_found | skipped`):

| Wert | Anzahl | % von N | % der 428 Rechnungen |
|---|---:|---:|---:|
| not_found | 162 | 29,2 | 37,9 |
| skipped | 149 | 26,9 | 34,8 |
| *(NULL)* | 133 | 24,0 | 31,1 (davon 126 ohne Invoice-Zeile, 7 Rechnungen ohne Lauf) |
| confirmed | 110 | 19,9 | 25,7 |
| ambiguous | 0 | 0 | 0 |

  `partner_match_stage`: NULL 335 · none 164 · learned_name 41 · ust_id 14 (die übrigen CHECK-Werte `datev_addressee_id`, `datev_account_number`, `tax_id`, `iban`, `name_postal` kommen nicht vor).
- **Empfänger-Prüfung** (`recipient_match`, CHECK: `match | mismatch | uncertain | not_applicable`): match 195 (35,2 %) · not_applicable 162 (29,2 %) · NULL 160 (28,9 %) · mismatch 35 (6,3 %) · uncertain 2 (0,4 %).
- **Split:** 18 Elternbelege, 99 Kinder, Kinder je Eltern p50 = 3, p90 = 10, max = 23. `collection_kind`: NULL 518 · not_connected 34 · payment_gateway_payout 2 (kein `expense_report`, `credit_card_statement`, `cash_register_report`, `vendor_collective_invoice`, `document_with_annexes`). Eltern werden erledigt mit `completed_via = 'superseded'` bzw. `completed_reason`-Präfix „Durch Teilbelege ersetzt" (15).

### 1.3 Gleichzeitige Zustände je Beleg

Gezählt werden die 9 Zustände aus 1.2 (Klassifikation fehlgeschlagen, OCR-Fallback, Dublette, ohne Partner, Empfänger-Mismatch, Split Eltern/Kind, awaiting_input, Pipeline failed, review_needed).

| Zustände gleichzeitig | Anzahl | % | ohne Split-Zustand: Anzahl | % |
|---|---:|---:|---:|---:|
| 0 | 157 | 28,3 | 159 | 28,7 |
| 1 | 150 | 27,1 | 180 | 32,5 |
| 2 | 54 | 9,7 | 47 | 8,5 |
| 3+ | 193 | 34,8 | 168 | 30,3 |

Die „3+"-Gruppe wird von der Kombination *OCR-Fallback × ohne Partner × Split-Kind* bzw. *ohne Partner × Empfänger-Mismatch × OCR* getragen — d. h. Scans aus Sammel-PDFs ohne bekannten Kreditor.

```sql
-- Basis-View
create temp view v as
select d.*, i.id inv_id, i.processing_status, i.processing_stage, i.partner_match_outcome,
       i.recipient_match, i.datev_history_duplicate, i.open_findings, i.business_partner_id,
       t.extraction_method,
       exists(select 1 from ludwig.client_source_docs c where c.parent_source_doc_id=d.id) is_parent,
       (d.parent_source_doc_id is not null) is_child
from ludwig.client_source_docs d
left join ludwig.client_source_docs_invoices i on i.source_doc_id=d.id
left join ludwig.ops_document_text t on t.source_doc_id=d.id;

-- Verteilung einer Achse (Muster)
select status, count(*), round(100.0*count(*)/(select count(*) from v),1) from v group by 1;

-- Gleichzeitige Zustände
with c as (select id,
  (status='classification_failed' or (status='classified' and class_document_form is null))::int
  + (extraction_method in ('local_ocr','mixed'))::int + (datev_history_duplicate is not null)::int
  + (inv_id is not null and (partner_match_outcome is null or partner_match_outcome in ('ambiguous','not_found')))::int
  + (recipient_match='mismatch')::int + (is_parent or is_child)::int + (status='awaiting_input')::int
  + (processing_status='failed')::int + (processing_status='review_needed')::int k from v)
select least(k,3), count(*) from c group by 1 order by 1;
```

---

## 2. Füllgrade

### 2.1 `open_findings` (jsonb-Array an `client_source_docs_invoices`)

| Anzahl Findings je Beleg | Belege | % von N |
|---|---:|---:|
| 0 (leeres Array) | 418 | 75,5 |
| 1 | 6 | 1,1 |
| 2 | 2 | 0,4 |
| 4 | 2 | 0,4 |
| *(kein Invoice-Subtyp → NULL)* | 126 | 22,7 |

→ **10 Belege (1,8 % von N, 2,3 % der Rechnungen) mit nicht-leeren Findings**, 18 Findings insgesamt. Deckt sich mit `processing_status = 'review_needed'` (8) + 2 weitere.

Element-Schema (Keys in allen 18 Elementen): `code`, `severity`, `field`, `message`, `detail`, `source_module`.

| `code` | `severity` | Anzahl |
|---|---|---:|
| missing_required_field | error | 16 |
| line_totals_mismatch | error | 2 |

Nur 2 verschiedene Codes (Top-10 nicht erreichbar). `field`: invoice_total 6 · invoice_number 5 · vendor_name 3 · invoice_date 2 · NULL 2. `source_module`: ausschließlich `invoice-interpreter`.

### 2.2 `completed_reason` (text, kein Enum)

| | Anzahl | % |
|---|---:|---:|
| gefüllt | 515 | 93,0 |
| NULL | 39 | 7,0 |

`completed_reason` ist **genau dann** gefüllt, wenn `completed_at` gesetzt ist (515 = 515, keine Abweichung). Es ist Freitext: 225 verschiedene Werte bei 515 Zeilen. Wiederkehrende System-Präfixe (bis zum ersten Doppelpunkt, nur ≥ 3 Vorkommen): „Durch Teilbelege ersetzt" 15 · „Dublette" 3 · „Archiv-Kopie, keine neue Buchung" 3. Der Rest ist buchungsindividuell (Agent-Begründung).

Ergänzend: `agent_comment` gefüllt bei 9 Belegen (1,6 %); `superseded_note` bei 21 (3,8 %); `class_summary` bei 553; `class_case_summary` NULL bei 69 (12,5 %); `document_date` NULL bei 14 (2,5 %); `received_date` immer gesetzt; `page_count` NULL bei 2 (p50 = 1, p90 = 3, max = 27 Seiten).

### 2.3 `payment_account`-Zuordnung bei Kontoauszügen

An `client_source_docs` gibt es **kein** `payment_account_id`. Die einzige Kante ist `client_bank_import_batches.stored_file_id` (bzw. `source_file_storage_path`) → `ops_stored_files` ← `client_source_docs.stored_file_id`.

| | Anzahl |
|---|---:|
| Belege `bank_statement_pdf` + `credit_card_statement` | 53 (16 + 37) |
| davon mit Import-Batch (→ `payment_account_id`) über `stored_file_id` | **0** |
| davon über `source_file_storage_path = ops_stored_files.storage_key` | 0 |
| `client_bank_import_batches` gesamt / mit `stored_file_id` / mit `payment_account_id` | 16 / 1 / 16 |
| der eine Batch mit `stored_file_id` zeigt auf einen Beleg mit `source_doc_type` | NULL (nicht als Auszug typisiert) |

Alle 16 Batches haben ein Zahlungskonto, aber nur 1 ist an eine Datei gebunden; die Bank-Transaktionen stammen zu 1347 aus `csv` und 79 aus `manual`. Die 53 PDF-Auszüge sind zu 52 erledigt: `no_booking_required` 22 · `booking` 15 · `manual` 8 · NULL 7; 1 offen. Fazit: **die PDF-Auszüge sind nicht über einen Import-Batch mit einem Zahlungskonto verknüpft** — der F170-Weg (`awaiting_input` → `completed_via='import'`) ist auf Staging erst 1× gelaufen (der eine `import`-Beleg).

### 2.4 Partner-FK am Beleg [L-277]

`client_source_docs` hat **keine** Partner-Spalte; die FK liegt am Subtyp `client_source_docs_invoices.business_partner_id`.

| | Anzahl | % von N | % der 428 Rechnungen |
|---|---:|---:|---:|
| Invoice-Zeile mit `business_partner_id` | 123 | 22,2 | 28,7 |
| Invoice-Zeile ohne | 305 | 55,1 | 71,3 |
| kein Invoice-Subtyp | 126 | 22,7 | — |

FK × `partner_match_outcome`: confirmed → 110/110 mit FK · skipped → 12/149 mit FK (manuell gesetzt) · not_found → 1/162 · NULL → 0/7. Zum Vergleich: `client_journal_entry.business_partner_id` und `client_accounting_case.counterparty_partner_id` existieren zusätzlich (nicht Teil dieser Erhebung).

### 2.5 Kante Beleg → Buchungsstapel [L-280]

Direkte Kanten: `client_journal_entry.source_doc_id` (nur 14 Belege, 2,5 %) und `client_source_docs.completed_batch_id` (**0** gefüllt). Der Regelweg ist indirekt: Beleg → `client_accounting_event.source_doc_id` → `case_id` → `client_journal_entry.accounting_event_id` → `export_batch_id` (an Journal Entry, Event **und** Case je eine eigene Spalte).

| Stufe | Belege | % von N |
|---|---:|---:|
| ≥ 1 `client_accounting_event` | 494 | 89,2 |
| ≥ 1 Event mit `case_id` | 494 | 89,2 |
| ≥ 1 Journal Entry (über Event oder direkt) | 289 | 52,2 |
| ≥ 1 Journal Entry mit `export_batch_id` | 258 | 46,6 |
| ≥ 1 Event mit `export_batch_id` | 228 | 41,2 |
| Case mit `export_batch_id` | 203 | 36,6 |
| `completed_batch_id` am Beleg | 0 | 0 |
| **irgendein Batch** (Vereinigung) | **353** | **63,7** |

Events je Beleg (wo > 0): p50 = 1, p90 = 1, max = 3. Nach Erledigung: von 514 erledigten `classified`-Belegen haben 462 ein Event, 288 einen Journal Entry, 349 einen Batch; von den 39 offenen 32 / 1 / 4. Die drei `export_batch_id`-Spalten sind **nicht deckungsgleich** (258 / 228 / 203) — die Vereinigung ist die einzig belastbare Kante.

```sql
-- open_findings
select coalesce(jsonb_array_length(open_findings),0), count(*) from v group by 1;
select e->>'code', e->>'severity', count(*) from v,
  jsonb_array_elements(coalesce(open_findings,'[]')) e group by 1,2 order by 3 desc limit 10;

-- Kontoauszug → Zahlungskonto
select source_doc_type, exists(select 1 from ludwig.client_bank_import_batches b
  where b.stored_file_id=v.stored_file_id and b.payment_account_id is not null), count(*)
from v where source_doc_type in ('bank_statement_pdf','credit_card_statement') group by 1,2;

-- Kette bis Batch
select count(*) filter (where exists(select 1 from ludwig.client_accounting_event e where e.source_doc_id=v.id)),
       count(*) filter (where exists(select 1 from ludwig.client_journal_entry j
         where j.source_doc_id=v.id or j.accounting_event_id in
           (select id from ludwig.client_accounting_event e where e.source_doc_id=v.id))),
       count(*) filter (where exists(select 1 from ludwig.client_journal_entry j
         where j.export_batch_id is not null and (j.source_doc_id=v.id or j.accounting_event_id in
           (select id from ludwig.client_accounting_event e where e.source_doc_id=v.id))))
from v;
```

---

## 3. Textlängen (Zeichen)

| Feld | n | p50 | p90 | max |
|---|---:|---:|---:|---:|
| `client_source_docs.completed_reason` | 515 | 20 | 418 | 868 |
| `open_findings[].message` | 18 | 52 | 54 | 54 |
| `open_findings[].detail` | 18 | 47 | 48 | 48 |
| `client_source_docs.agent_comment` | 9 | 564 | 812 | 812 |
| `client_source_docs.class_summary` | 553 | 178 | 252 | 400 |
| `client_source_docs.superseded_note` | 21 | 84 | 216 | 324 |
| `platform_audit_events.message` (Beleg-Ereignisse) | 1370 | 96 | 395 | 1250 |

`completed_reason` ist bimodal: kurze System-Labels (p50 = 20) und lange Agent-Begründungen (p90 = 418, bis 868). Finding-Texte sind Template-Strings mit fixer Länge.

```sql
select count(*), percentile_disc(0.5) within group (order by length(completed_reason)),
       percentile_disc(0.9) within group (order by length(completed_reason)), max(length(completed_reason))
from v where completed_reason is not null;
select count(*), percentile_disc(0.5) within group (order by length(e->>'message')), ...
from v, jsonb_array_elements(coalesce(open_findings,'[]')) e;
```

---

## 4. Verlauf (Audit-Ereignisse je Beleg)

Tabelle `ludwig.platform_audit_events` (`resource_kind`, `action`, `outcome`, `actor_kind`, `resource_id` text, `payload` jsonb). Beleg-Ereignisse hängen an vier `resource_kind`-Werten; `resource_id` zeigt bei `source_doc`/`source_doc_contract` auf `client_source_docs.id`, bei `source_doc_invoice`/`invoice` auf `client_source_docs_invoices.id` (→ über `source_doc_id` zum Beleg).

### 4.1 Vokabular (resource_kind × action)

| resource_kind | action | outcome | actor_kind | Anzahl | davon an existierendem Beleg |
|---|---|---|---|---:|---:|
| source_doc | document.uploaded_by_agent | success | agent | 597 | 530 |
| source_doc | document.completed_by_agent | success | agent | 358 | 307 |
| source_doc | doc.pipeline_retried_by_agent | success | agent | 95 | 34 |
| source_doc_invoice | doc.extraction_corrected_by_agent | success | agent | 71 | 69 |
| invoice | invoice_ingest.failed | failure | system | 43 | 43 |
| source_doc | doc.completed_manually_by_agent | success | agent | 42 | 8 |
| source_doc | document.superseded_by_agent | success | agent | 38 | 21 |
| source_doc_invoice | doc.review_escalated_to_accounting | success | agent | 36 | 25 |
| source_doc | doc.classification_overridden_by_agent | success | agent | 34 | 31 |
| source_doc | document.metadata_updated_by_agent | success | agent | 21 | 17 |
| source_doc | document.split_by_server | success | agent | 17 | 17 |
| source_doc_contract | contract.fields_updated | success | user | 6 | 0 |
| source_doc | document.completion_reverted | success | user | 6 | 0 |
| source_doc | document.statement_lines_recorded | success | api | 6 | 6 |
| source_doc | document.completed_manually | success | user | 4 | 0 |
| source_doc | document.completed_by_agent | success | system | 1 | 1 |
| source_doc | document.datev_ref_updated_by_agent | success | agent | 1 | 0 |
| source_doc_contract | contract.fields_confirmed | success | user | 1 | 0 |

Summe 1377 Ereignisse, davon 1109 an einem heute existierenden Beleg; 268 (248 `source_doc`, 13 `source_doc_invoice`, 7 `source_doc_contract`) zeigen auf gelöschte Belege (hart gelöscht / Mandanten-Wipe — `client_id` dieser Ereignisse ist NULL). Zwei Namensschemata koexistieren: `document.*` und `doc.*`. `outcome` ist außer bei `invoice_ingest.failed` immer `success`. `source`: web 1051 · workflows 43 · NULL 283.

Zusätzlich referenzieren **Case-Ereignisse** den Beleg nur über `payload.sourceDocId` (nicht über `resource_id`): `case.doc_attached_by_agent` 1042 · `case.created_from_doc_by_agent` 695 · `case.doc_detached_by_agent` 3. Weitere Beleg-Payload-Keys an Case-Ereignissen: `documentNotRequiredReason` 259 · `sourceDocCompleted` 41 · `documentDate` 41 · `documentNumberMismatchRationale` 21.

### 4.2 Ereignisse je Beleg

| Zählweise | Belege ohne Ereignis | % | p50 | p90 | max |
|---|---:|---:|---:|---:|---:|
| nur Beleg-`resource_kind`s (4.1) | 1 | 0,2 | 2 | 3 | 14 |
| zzgl. Case-Ereignisse mit `payload.sourceDocId` | 1 | 0,2 | 4 | 7 | 19 |

Ergänzende Verlaufsquellen außerhalb des Audit-Logs: `ops_llm_call_logs` (549 Belege via `request_metadata_json->>'source_doc_id'`), `ops_extraction_logs` (528 Belege, 6233 Zeilen), `ops_jobs` (doc_process 446 ok / 6 failed · invoice_run_flow 416 / 5 · doc_partner_link 228 / 2 · source_doc_split 18 / 0), `client_invoice_traces` (nicht ausgewertet).

```sql
create temp view ae as
select a.*, coalesce(d1.id, d2.id) doc_id from ludwig.platform_audit_events a
left join ludwig.client_source_docs d1
  on a.resource_kind in ('source_doc','source_doc_contract') and d1.id::text=a.resource_id
left join ludwig.client_source_docs_invoices i
  on a.resource_kind in ('source_doc_invoice','invoice') and i.id::text=a.resource_id
left join ludwig.client_source_docs d2 on d2.id=i.source_doc_id
where a.resource_kind in ('source_doc','source_doc_invoice','source_doc_contract','invoice');

select resource_kind, action, outcome, actor_kind, count(*),
       count(*) filter (where doc_id is not null) from ae group by 1,2,3,4 order by 5 desc;

select count(*) filter (where n=0), percentile_disc(0.5) within group (order by n),
       percentile_disc(0.9) within group (order by n), max(n)
from (select v.id, (select count(*) from ae where ae.doc_id=v.id) n from v) s;
```

---

## Nicht vorhandene Felder (explizit)

| gesucht | Befund |
|---|---|
| Verschlüsseltes PDF | kein Feld an `client_source_docs`, `ops_stored_files.metadata_json` (leer), kein Marker in `classification_error`, kein Code-Marker |
| `partner_match_outcome = 'ambiguous'` | im CHECK vorhanden, 0 Vorkommen |
| `status = 'awaiting_input'` / `'pending_classification'` / `'deleted'` | im CHECK vorhanden, 0 Vorkommen (Snapshot) |
| `payment_account_id` am Beleg | nicht vorhanden; nur indirekt über `client_bank_import_batches.stored_file_id` (1 von 16 Batches gebunden) |
| `business_partner_id` am Supertyp | nicht vorhanden; nur am Subtyp `client_source_docs_invoices` |
| `completed_batch_id` | Spalte vorhanden, 0 gefüllt |
| `completed_reason` als Enum | nein — Freitext (225 distinct / 515) |
| `open_findings` am Supertyp | nein — nur am Invoice-Subtyp; Verträge/Auszüge/`other` haben keine Findings |
