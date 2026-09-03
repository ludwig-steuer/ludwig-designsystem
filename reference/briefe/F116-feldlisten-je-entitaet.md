# F116 — Feldlisten je Entität und Darstellungsgrad

**Status:** vorgeschlagen 2026-08-29 · **Priorität:** mittel · **Grundlage:**
`docs/reference/datenmodell/ui-repraesentationen.md` §4.4 („Familie je
Entität", F111) und `web-ui-offen.md` P20. Side-Task zur Inventarisierung:
das Inventar sagt, *welche Komponenten* es je Entität gibt — diese Liste sagt,
*welche Felder* sie zeigen.

## Auftrag in einem Satz

Für jede Entität des Datenmodells steht an **einer** Stelle, welche Felder sie
in den drei Darstellungsgraden identifizieren — Mini (Inline/Text), Medium
(Tabellenzeile/kleine Karte), Groß (Karte/Kopf) — in Rangfolge, mit Herkunft
(Spalte oder Ableitung) und Fallback bei Leerwert; Komponenten lesen daraus,
statt je Screen neu zu wählen.

## Warum jetzt

Befund am Sachverhalt (Staging, 2026-08-29, 643 Fälle):

| Feld | leer | Bemerkung |
|---|---|---|
| `total_amount` | 58 % | 245 davon haben Ereignisse mit Betrag — die Liste zeigt trotzdem „—" |
| `title` | 58 % | gefüllt fast nur bei OPOS-Übernahmen („Offener Posten …") |
| `summary` | 32 % | wo gefüllt: Prosa, 1–4 Sätze; der erste Satz identifiziert |
| `counterparty_name` | 7 % | fehlt systematisch bei Umbuchung und Bankentgelten |
| `opened_at` | 0 % | ist das Anlagedatum durch den Agenten, oft Wochen nach dem Vorgang (2026-0353: Zahlung 01.07., eröffnet 22.08.) |

Heute wählt jede Komponente ihren eigenen Fallback: Portal `title ??
"Art: Gegenpartei"`, Listen-Tooltip `counterparty ?? "—"`, Hero `title ·
counterparty`, `deriveTitle()` am Ereignis. Vier Antworten auf dieselbe Frage
„wie heißt dieser Sachverhalt" — das ist genau die Duplikat-Quelle, die das
Inventar unter B beschreibt, eine Ebene tiefer als die Komponente.

## Form der Liste

Eine Tabelle je Entität, neuer Abschnitt **§4.6 „Felder je Darstellungsgrad"**
in `ui-repraesentationen.md`. Spalten:

`Rang · Feld · Quelle (Spalte / Ableitung) · Mini · Medium · Groß · Fallback`

Code-Spiegel: die VM in `src/ui/<entität>/types.ts` trägt genau die Felder der
Liste (Groß = Obermenge). Die Doku-Tabelle ist die SSOT für die *Rangfolge*,
die VM für die *Felder*; beides in einem Commit ändern.

## Erste Liste: Sachverhalt (Ergebnis der Analyse, zur Abnahme)

| Rang | Feld | Quelle | Mini | Medium | Groß | Fallback |
|---|---|---|---|---|---|---|
| 1 | Gegenpartei | `counterparty_name` — **immer der Anzeigename**, mit Partner der Partner-Name (Schreibzeit-Sync, s. Entscheid unten); `counterparty_partner_id` nur für den Link | ● | ● fett | ● Kopf | Gegenstand (Rang 4) |
| 2 | Betrag + Richtung | **Ableitung**: Brutto des Anker-Belegs, sonst Bank-Betrag; Vorzeichen aus `counterparty_side`/Ereignis-Art | ● | ● rechts | ● groß | „—" nur bei 0 Ereignissen |
| 3 | Datum | **Ableitung**: `event_date` des Anker-Ereignisses; Groß: Spanne min–max | ● (TT.MM.) | ● | ● Spanne | `opened_at`, sichtbar als „angelegt" |
| 4 | Gegenstand | `title` → 1. Satz `summary` → Referenz (Rang 6) → `deriveTitle` des Anker-Ereignisses | nur wenn Rang 1 leer | ● Zeile 2 | ● Überschrift | Art-Label |
| 5 | Art | `kind` → `CASE_KIND_LABEL` | – | ● Badge | ● | – |
| 6 | Referenz | Rechnungsnr. (Beleg) / Verwendungszweck (Bank) / OPOS-Nr. / Vertragsnr. | – | ● Zeile 2, gekürzt | ● | – |
| 7 | Zustand | `lifecycle_status` (Registry-Achse `sachverhalt`) + offene Klärungen (Zahl) | – | ● Chip | ● | – |
| 8 | Quellen | Zähler Belege / Bank-Ereignisse | – | ● als Icon-Paar, nicht zwei Spalten | ● EventStack | – |
| 9 | `case_number` | Spalte | Suffix mono / Hover | Zelle mono | Meta-Zeile | UUID-Präfix |
| 10 | Personen-/Verrechnungskonto | `fy_personal_account_id` / `fy_clearing_account_id` (+ Saldo) | – | – | ● | – |
| 11 | Zuständig, Export | `disposition`, abgeleiteter Export-Stand | – | Filter/Sekundär | ● Meta | – |
| 12 | angelegt / geschlossen | `opened_at`, `closed_at` | – | – | ● Meta | – |

Abweichungen je Art (Gegenstand, Rang 4):

- **Ein-/Ausgangsrechnung**: `Rechnung <Nr> · <Datum>`; Betrag = Brutto.
- **Dauersachverhalt**: **Periode ist Pflicht** („Leasingrate Juli 2026") —
  ohne sie sind die zwölf GRENKE-Fälle eines Jahres nicht unterscheidbar.
  Quelle: `accrual_period` des Ereignisses, sonst Monat des `event_date`.
- **Umbuchung**: keine Gegenpartei; Gegenstand = `Konto A → Konto B`, Betrag,
  Datum.
- **Auslagen**: Mitarbeiter (= Gegenpartei) + Periode + Auszahlungsbetrag;
  Medium zeigt zusätzlich Anzahl Einzelbelege.
- **Korrektur**: Gegenpartei oft generisch (Finanzamt, Bank) → 1. Satz
  `summary` + Konto.
- **Vertrag**: Vertragspartner + Vertragsgegenstand aus dem Beleg; kein Betrag.

**Owner-Entscheid 2026-08-29 — Gegenpartei:** Leser wählen nie zwischen
`counterparty_name` und Partner-Name. `counterparty_name` ist immer der
Anzeigename: ohne Partner der Freitext (mit dem bestehenden „≠ Mandant"-Guard,
`counterparty-guard.ts`), mit Partner der Partner-Anzeigename — geschrieben im
selben Moment, in dem `counterparty_partner_id` gesetzt wird. Kein
`COALESCE(partner.name, case.counterparty_name)` an Lesestellen. Der rohe
Match-String bleibt am Beleg (`vendor_name`) bzw. an der Bank-Transaktion —
kein Informationsverlust. Sync-Ort: Trigger in `ludwig_private` (deckt die
sechs Writer, Partner-Rename und Partner-Merge auf einmal ab), siehe T116.2a.

Konsequenz für die Liste (heute): Spalten „Belege" und „Bank-Tx" zu einem
Icon-Paar zusammenziehen, „Eröffnet" durch das Ereignis-Datum ersetzen, „Betrag"
ableiten statt aus `total_amount` lesen — drei Spalten frei für Gegenstand
und Referenz.

## Zweite Liste: Klärung (Ergebnis der Analyse, zur Abnahme)

Befund (Staging 2026-08-29, 113 Klärungen): `title` 98 % gefüllt und
sprechend („Rechnung Domainfactory 42405457 (162,14 €) fehlt"); `client_text`
in den Samples eine Kopie des Kanzlei-Texts; `expected_document` nur bei
`document_missing` (24), aber strukturiert (kind/amount/reference/date);
48 % beantwortet; `deferred_until` bisher 0 (F105 frisch). Der **Zustand**
(offen / beantwortet / zurückgestellt) ist keine Spalte, sondern Ableitung aus
`answered_at` + `deferred_until` (`clarificationState`, Registry-Achsen
`klaerung_status`/`klaerung_typ`) — kein Join.

Anders als der Sachverhalt hat die Klärung ein Feld, das die Identifikation
schon leistet: den Titel. Alles Weitere ist Triage — *wer* reagiert, ob es
*blockiert*, *wie viel Arbeit* die Antwort ist.

| Rang | Feld | Quelle | Mini | Medium | Groß | Fallback |
|---|---|---|---|---|---|---|
| 1 | Titel | `title` | ● gekürzt | ● fett | ● Kopf | 1. Zeile `professional_text` |
| 2 | Zustand | **Ableitung** `clarificationState` (Registry `klaerung_status`) | ● Punkt/Icon | ● Chip | ● | – |
| 3 | Blockiert | `severity = required` | – | ● neben Zustand | ● | – |
| 4 | Adressat | `audience` (Kanzlei / Mandant / Agent) | – | ● | ● | – |
| 5 | Antwortform | `answer_kind` + Anzahl `answer_options_json` → „3 Optionen" · „Beleg hochladen" · „Freitext" | – | ● Hinweis | ● Antwort-Block | – |
| 6 | Sachverhalt-Anker | Mini-Sachverhalt (Gegenpartei · Betrag), **ein Join** | – | ● nur außerhalb der Case-Seite | ● | `case_number` |
| 7 | Wartet seit / zurück am | `created_at` bzw. `deferred_until` | – | ● | ● | – |
| 8 | Erwarteter Beleg | `expected_document` (kind · amount · reference · date) | – | ● Zeile 2 bei `document_missing` | ● | Titel |
| 9 | Fragetext | `professional_text` (Markdown), im Portal `client_text` | – | – | ● | – |
| 10 | Antwort | `answer_payload` (formatiert) · `answered_by` → Name (Join `platform_users`) · `answered_at` | – | – | ● | – |
| 11 | Wiedervorlage | `deferred_reason`, `deferred_count`, `deferred_by_*` | – | – | ● | – |
| 12 | Quellen | `sources_json` (Konto-/Beleg-Verweise) | – | – | ● | – |
| 13 | Typ, Herkunft | `question_type` (Filter, Badge nur Groß), `source_module`/`agent_run_id`, `created_at` | – | Filter | ● Meta | – |

Regeln aus den Samples:

- Mini/Medium zeigen **nie** den Text, immer `title` — `client_text` ist Kopie,
  `professional_text` ist Groß-only.
- Im Sachverhalt-Kontext (Liste, Case-Seite) reicht als Mini der **Zähler**
  offener Klärungen wie heute (`ClarificationCell`); der Titel erst beim Hover.
- `document_missing` ist nach S7 ein **Übergang**: „etwas fehlt mit Frist" ist
  eine Erwartung (`client_accounting_case_expectation`), keine Frage. Die
  Feldliste markiert den Typ als auslaufend; die Erwartung bekommt ihre eigene
  Liste (P20: eine der vier Entitäten ohne Darstellung).

## Zu erfassende Entitäten (Reihenfolge des Datenmodells)

Quelle: Beleg (`BelegFactsVM` existiert — gegen die Liste abgleichen),
Bank-Transaktion, Kontoauszug · Ereignis · Sachverhalt (oben) · Buchung
(`JournalEntryVM`), Klärung (oben), Erwartung, Ausgleichs-Zuordnung · Stammdaten:
Geschäftspartner, Konto, Dauersachverhalt-Regel · DATEV: Stapel, OPOS-Posten,
Snapshot · Kanzlei, Benutzer, Mandant.

Die vier Entitäten „ohne jede Darstellung" (P20: Erwartung,
Ausgleichs-Zuordnung, OPOS-Posten, Snapshot) bekommen ihre Feldliste **vor**
der ersten Komponente — die Liste ist dann der Bauplan.

## Schnitt

- **T116.1** §4.6 anlegen, Sachverhalt-Tabelle eintragen (oben, nach
  Owner-Abnahme). Eine Sitzung, nur Doku.
- **T116.2** Sachverhalt-Ableitungen als ein reiner Builder
  (`src/ui/case/`: `CaseIdentityVM` aus Case + Ereignissen — Betrag, Datum,
  Gegenstand, Referenz); Liste, Tooltip, Portal und Hero lesen ihn. Löscht die
  vier Fallback-Varianten. Test: ein Fall je Art aus der Tabelle oben.
- **T116.2a** Gegenpartei-Sync: eine Migration mit zwei Triggern in
  `ludwig_private` — `BEFORE INSERT OR UPDATE OF counterparty_partner_id` am
  Sachverhalt kopiert den Partner-Anzeigenamen nach `counterparty_name`;
  `AFTER UPDATE` des Anzeigenamens am Partner zieht die verknüpften
  Sachverhalte nach. Backfill für die 88+ Fälle mit Partner in derselben
  Migration. Regression-Test: Partner umbenennen → Case-Name folgt.
- **T116.3** Restliche Entitäten, ein Agent-Durchgang je Bucket (Quelle ·
  Ereignis/Buchung · Stammdaten · DATEV). Je Bucket: Samples aus Staging
  lesen (read-only), Befüllungsgrad messen, Tabelle vorlegen. Keine
  Komponenten anfassen.
- **T116.4** Regel nach `web-ui.md`: „Eine Entität hat eine Feldliste je
  Darstellungsgrad (§4.6); eine Komponente, die eine Entität zeigt, wählt ihre
  Felder daraus und erfindet keinen eigenen Fallback."

## Nicht-Scope

- Keine neuen DB-Spalten (T116.2a ist ein Trigger, keine Spalte). Betrag und Datum bleiben Ableitungen aus den
  Ereignissen — `total_amount` wird nicht nachgefüllt.
- Keine Belegart-Renderer (Inventar B4), keine Komponenten-Umbauten außer den
  vier Sachverhalt-Lesern in T116.2.
- Die Beleg-Zwischenseite (F89) und der Stapel (F114) bleiben, wie sie sind;
  sie lesen die Sachverhalt-Felder später aus dem Builder.

## Offen (Owner)

- Rang 1 vs. 4 am Sachverhalt: Gegenpartei bleibt Rang 1 (93 % gefüllt,
  wiedererkennbar); bei Korrektur/Umbuchung greift der Fallback auf den
  Gegenstand. Entschieden mit dem Gegenpartei-Entscheid oben.
- Mini-Format: `GRENKE AG · 129,51 € · 01.07.` oder mit Art-Kürzel davor?
