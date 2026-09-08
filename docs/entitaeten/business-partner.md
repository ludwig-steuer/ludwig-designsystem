# Geschäftspartner · `business partner` — Entitätsprofil

| | |
|---|---|
| Status | analysiert |
| GLOSSARY | `### Business partner (Geschäftspartner)` — englisch `business partner`, Ordner `entities/business-partner/` |
| Tabelle | `ludwig.client_business_partners` (46 Spalten) + `ludwig.client_business_partner_bank_aliases` (Lookup-Schlüssel, kein Subtyp) |
| Typen | `src/ludwig/modules/business-partners/domain/business-partner.ts` — `BusinessPartnerListItem`, `BusinessPartnerDetail`, `PartnerAccountRef`, `PartnerPersonalAccount`, `BusinessPartnerFilter`, `VAT_PROFILE`, `TYPICAL_NATURE`, `PARTNER_NATURE_LABEL`, `ONBOARDING_STATE`, `PARTNER_ROLE_LABEL`; `domain/tabs.ts` — `PARTNER_TABS`, `PARTNER_TAB_LABEL` |
| Status-Achsen | `STATUS_REGISTRY.partner` (`onboarding_state`: draft · proposed · confirmed). Die Rolle ist **keine** Achse — sie steht am Personenkonto (`accounting_role`), und `vat_profile` / `typical_nature` sind Eigenschaften, keine Zustände |
| Wichtigkeit | **hoch** — F76 hat `client_creditors` + `client_debtors` in dieser Tabelle zusammengeführt; sie ist FK-Ziel von Sachverhalt, Konto, Rechnung, Buchungssatz und Erwartung |
| Datenstand | **Staging-Bestand, 2026-09-08 — 14.890 Geschäftspartner über 6 Mandanten**, davon 3.319 mit mindestens einer Buchung auf einem ihrer Konten und **189** mit Beleg, Sachverhalt oder Buchungssatz. Gelesen über den Postgres-Endpunkt aus `apps/web/.env.staging.local` (`127.0.0.1:55452`) — derselbe Bestand, aus dem die Profile `account`, `accounting-case` und `source-document` rechnen (915 Sachverhalte, 41.570 Konten, 384 Belege). Der Pooler aus `.env.local` trägt heute 2 Partner und ist leer. Nur `SELECT`; keine Kundendaten im Dokument, alle Beispielwerte erfunden (Musterfirma GmbH) |
| Rückfrage | gestellt am 2026-09-08, **unbeantwortet** — die Defaults der drei offenen Fragen gelten |
| Analyse von / am | Claude, 2026-09-08 (Skill `entitaet-analysieren`) |

## Was sie ist

Der Geschäftspartner ist die **zeitlose Identität** einer Firma oder Person, mit
der ein Mandant Geschäfte macht: Name, Anschrift, USt-IdNr., Bank und das, was
Ludwig über ihr Verhalten gelernt hat. Die Sachbearbeiterin schlägt ihn nach,
wenn sie wissen will, wer hinter einer Kontonummer steht, und sie wählt ihn aus,
wenn ein Beleg oder eine Zahlung noch keinen Gegenpart hat. Anlegen und Pflegen
tut sie ihn heute nicht — der DATEV-Import und der Agent schreiben ihn, die
Kanzlei bestätigt.

Anzeige-Regeln aus den GLOSSARY-Notes, wörtlich:

- „Ein Partner kann Lieferant UND Kunde zugleich sein: die Rolle steht nicht am
  Partner, sondern an seinen Personenkonten (`client_ledger_accounts.accounting_role`)."
- „Ein Partner ohne Personenkonto ist ein erlaubter Normalfall (F76 R3)."
- „Keine Historisierung (R4, last-write-wins wie DATEV-Addressees; ‚wie hieß der
  2024‘ beantworten die Snapshots an der Buchungszeile)."
- „Keine DATEV-GUID am Partner — `datev_addressee_id` ist Sync-Attribut am
  Personenkonto (R5); n GUIDs pro Partner sind der gewollte Normalfall."
- „Nachträgliches Zusammenführen über den Grabstein `merged_into_partner_id`
  (Leser folgen dem Zeiger; kein Merge-Journal)." Spaltenkommentar dazu:
  „Grabsteine erscheinen in keiner Auswahl-Liste mehr."
- Gegenpartei-Seite (F92): „Drei Felder, drei Fragen — `counterparty_side`
  (welche Seite), `counterparty_partner_id` (wer), `fy_personal_account_id`
  (wogegen); zusammenlegen geht nicht, weil Diverse-Konten viele Identitäten
  teilen und eine Identität auch ganz ohne Konto existieren darf (F76 R3)."
- Abrechner (Auslagen): „Sie ist Geschäftspartner **ohne eigene Kontonummer**:
  ihr Kreditor *ist* das Auslagenkonto." Und: „Kein Partner-Typ ‚Mitarbeiter‘ —
  die Eigenschaft steckt in `clearing_account_type` des verknüpften Kontos."

Daraus folgt die wichtigste Anzeige-Regel dieser Familie: **die Zeile zeigt,
welche Konten der Partner trägt, und leer ist ein Wert, kein Fehlen.** Kein
Kreditorkonto heißt „ist kein Kreditor", nicht „Nummer unbekannt".

## Schaubild

```mermaid
erDiagram
  PLATFORM_CLIENTS ||--o{ CLIENT_BUSINESS_PARTNERS : "Mandant, NOT NULL"
  CLIENT_BUSINESS_PARTNERS ||--o{ CLIENT_BUSINESS_PARTNERS : "Grabstein merged_into_partner_id, 0 im Bestand"
  CLIENT_BUSINESS_PARTNERS ||--o{ CLIENT_LEDGER_ACCOUNTS : "p50 1 - p90 2 - max 6"
  CLIENT_BUSINESS_PARTNERS ||--o{ CLIENT_ACCOUNTING_CASE : "99 Prozent ohne - max 43"
  CLIENT_BUSINESS_PARTNERS ||--o{ CLIENT_SOURCE_DOCS_INVOICES : "57 Partner - max 10"
  CLIENT_BUSINESS_PARTNERS ||--o{ CLIENT_JOURNAL_ENTRY : "94 Partner - max 20"
  CLIENT_BUSINESS_PARTNERS ||--o{ CLIENT_ACCOUNTING_CASE_EXPECTATION : "max 10"
  CLIENT_BUSINESS_PARTNERS ||--o{ CLIENT_BUSINESS_PARTNER_BANK_ALIASES : "0 Zeilen im Bestand"
  CLIENT_BUSINESS_PARTNERS ||--o{ CLIENT_AGENT_NOTES : "0 Zeilen im Bestand"
  CLIENT_BUSINESS_PARTNERS ||..o{ PLATFORM_AUDIT_EVENTS : "resource_kind business_partner 39, creditor 33, debtor 2"
  CLIENT_BUSINESS_PARTNERS ||..o{ KONTONUMMERN_ALS_TEXT : "creditor_ debtor_ clearing_ default_debit_account_number"
```

Eltern oben, Kinder unten, FK-lose Verweise gestrichelt. Zwei Besonderheiten:

1. **Die Kontonummern stehen doppelt.** Die Wahrheit ist die Kante
   `client_ledger_accounts.business_partner_id` (Konto → Partner, je Jahr und
   Rolle höchstens eines); `creditor_account_number`, `debtor_account_number`
   und `clearing_account_numbers` sind der **jahrgangsinvariante Cache** am
   Partner, als Text ohne FK — weil der Kontenplan je Wirtschaftsjahr vorliegt
   (F64) und der Partner zeitlos ist. Im Bestand weichen sie nirgends ab.
2. **Die Historie liegt unter drei `resource_kind`-Werten** — `business_partner`
   (39), `creditor` (33), `debtor` (2). Seit F76 ist das eine Entität; das
   Audit-Vokabular ist der Zusammenführung nicht gefolgt (Befund L-226).

## Datenpunkte

Von 46 Spalten tragen **17** einen Rang. Der Rest steht unter der Tabelle: er
ist entweder Technik, DATEV-Sync-Attribut oder im Bestand leer.

| Datenpunkt | Quelle | Rolle | Füllgrad | heute in | änderbar | Rang | ab Form | Beleg |
|---|---|---|---|---|---|---|---|---|
| Name (`legalName`) | Spalte | Identität | 100 % | Partnerliste (Link), Partnerkopf, `MasterDataTab`, `CreditorCombobox`, Karte „Gegenpartei"; als Fremdfeld in `case-columns`, `account-columns`, `CaseFacts` | Server (Import) · Agent | 1 | XS | Füllgrad · heute in sechs Formen |
| Kreditorkonto (`creditorAccount`) | Spalte `creditor_account_number`, Wahrheit über `client_ledger_accounts` | Identität | 13 % gesamt · **60 %** der 189 benutzten | Partnerliste (Spalte), Partnerkopf (`AccountChip`), `CreditorCombobox` (führt die Optionszeile) | Nutzer (beim Bestätigen) · Server | 2 | XS | Füllgrad · `CreditorCombobox` zeigt Nummer **vor** Name |
| Debitorkonto (`debtorAccount`) | Spalte `debtor_account_number` | Identität | 87 % gesamt · **44 %** der benutzten | Partnerliste, Partnerkopf | Nutzer (beim Bestätigen) · Server | 3 | S | Füllgrad. Die 87 % kommen aus zwei Mandanten mit je 6.228 Debitoren — die Zahl der benutzten ist die ehrlichere |
| Reifegrad (`onboardingState`) | Spalte, Achse `partner` | Zustand | 100 % (`confirmed` 14.852 · `proposed` 36 · `draft` 2) | Partnerliste (`StatusBadge axis="partner"`), Partnerkopf, Reiter „Alle / Bestätigt / Vorgeschlagen / Entwurf" | Nutzer (`proposed → confirmed`, einbahnig) | 4 | XS | Registry-Achse · V7 |
| Buchungen (`usageBookingCount`) | `abgeleitet: Σ über die Personenkonten` — steht im Spiegel | Maß | **78 % haben 0** · p90 6 · max 3.874 | Partnerliste (Spalte), `MasterDataTab`, `AccountsTab` je Konto | Server | 5 | S | Staging · Präzedenz `account.md` Nachtrag: die Buchungsspalte beantwortet „Karteileiche oder nicht", nicht der Status |
| Letzte Buchung (`lastBookingDate`) | `abgeleitet: max über die Personenkonten` — steht im Spiegel | Zeit | wie oben | Partnerliste, `MasterDataTab`, `AccountsTab` | Server | 6 | S | heute in der Liste |
| Ort (`city`) | Spalte | Identität | 77 % gesamt · 47 % der benutzten (`postalCode` 74 % / 45 %) | Partnerliste (Spalte „Stadt"), `MasterDataTab` | Server | 7 | S | GLOSSARY „Debtor": Match-Schlüssel `normalized_name + postal_code` — der Ort unterscheidet zwei gleichnamige Partner |
| Kurzname (`shortName`) | Spalte | Identität | 98 %, davon **49 % ungleich `legalName`**; genau 15 Zeichen (DATEV-Kurzbezeichnung) | Partnerliste (zweite Zeile), Partnerkopf (`· …`), `MasterDataTab` | Server | 8 | S (als zweite Zeile) | Füllgrad · offene Frage 1 |
| USt-IdNr. (`ustIds`) | Spalte (`text[]`, wo gesetzt **immer genau eine**) | Identität | 0,7 % gesamt · 9 % der benutzten | Partnerliste (Spalte), `MasterDataTab`, Freitextsuche | Server · Agent (Backfill) | 9 | M | Füllgrad unter 20 % → nicht vor M (§5). Trotzdem Rang 9: Stufe 3 der Resolver-Kaskade |
| Umsatzsteuer-Profil (`vatProfile`) | Spalte | Erklärung | 8 % ≠ `unknown` gesamt · **73 %** der benutzten (`domestic_standard` 1.083 · `eu_acquisition_or_service` 69 · `tax_exempt` 28 · Rest < 20) | Partnerliste (**roher Enum-Wert**, L-223), `MasterDataTab` | Agent | 10 | M | Füllgrad unter den benutzten · GLOSSARY „A hint for proposals and verification, never a rule" |
| Typische Lieferung (`typicalNature`) | Spalte | Erklärung | 11 % ≠ `unknown` gesamt · **76 %** der benutzten (`service` 877 · `goods` 465 · `expense` 164 · `mixed` 59 · `investment` 47) | Partnerliste (Spalte „Art", `PARTNER_NATURE_LABEL`), `MasterDataTab` | Agent (einziger Update-Pfad) | 11 | M | Füllgrad · **924 Partner tragen einen Wert, für den es kein Wort gibt** (L-222) |
| Verrechnungskonten (`clearingAccounts`) | Spalte `clearing_account_numbers` (`text[]`) | Identität | **12 Partner** (0,08 %) | Partnerliste (Spalte „Verrechnung") | Agent (`link_expense_partner`) · Onboarding | 12 | M | GLOSSARY „Abrechner": ohne eigene Kontonummer, ihr Kreditor *ist* das Auslagenkonto. Leer heißt „kein Abrechner", nicht „unbekannt" |
| Beschreibung (`businessDescription`) | Spalte | Erklärung | 12 % gesamt · **77 %** der benutzten; p50 30 · p90 50 · max 101 Zeichen | `MasterDataTab` | Agent | 13 | M | Füllgrad unter den benutzten. Kürzen unnötig: max 101 Zeichen passen in eine Zeile der `FieldList` |
| Anschrift (`addressLine1`, `postalCode`, `countryCode`) | Spalten | Kontext | 73 % / 74 % / **4 %** | `MasterDataTab` (Box „Adresse") | Server | 14 | L | Füllgrad. `countryCode` bleibt in der Box, wird aber nie eigene Zeile |
| Kontakt (`contactEmail`, `contactPhone`) | Spalten | Kontext | 14 % / 39 % | heute **nirgends** — weder Liste noch `MasterDataTab` noch `TechnicalTab` | Server | 15 | L | Füllgrad. Zwei Spalten mit Wert, die keine Form zeigt |
| Herkunft (`source`) | Spalte | Verantwortung | 100 % (`onboarding_import` 14.852 · `manual` 38) | `MasterDataTab`, `TechnicalTab` — je **roh, ohne Wort** | Server | 16 | L | GLOSSARY „Creditor source": zusammen mit `onboardingState` die Vertrauenskette. Kein Label (L-225) |
| Grabstein (`mergedIntoPartnerId`) | Spalte, Selbst-FK | Zustand | **0 im Bestand** | heute nur in SQL (`searchCreditors` filtert ihn weg) | Nutzer (manuelles Zusammenführen) | 17 | L | Spaltenkommentar: „Leser folgen dem Zeiger; Grabsteine erscheinen in keiner Auswahl-Liste mehr" — er ändert das Verhalten der Auswahl, nicht nur die Anzeige |

**Ausgelassen — Technik** (7 Spalten, nie zeigen): `id`, `tenant_id`,
`client_id`, `created_at`, `updated_at`, `normalized_name` (Match-Schlüssel,
kein Anzeigewert), `profiling_metadata_json` (0 % gefüllt).

**Ausgelassen — DATEV-Sync-Attribute** (5 Spalten): `datev_last_modified_at`
(50 %), `datev_is_business_partner_active` (50 %), `datev_term_of_payment_id`
(1 %, unaufgelöste DATEV-Id), `datev_payment_medium` (0,6 %),
`datev_bank_accounts` (0,9 %). Sie gehören in den Reiter „Technik", nicht in
eine Form der Familie — Präzedenz `TechnicalTab`.

**Ausgelassen — im Bestand leer oder tot** (13 Spalten, je mit Zahl):
`typical_tax_keys` 0 · `observed_vat_ids` 0 · `payment_terms` 0 ·
`sepa_mandate_reference` 0 · `typical_currency` 0 ·
`typical_payment_term_days` 0 · `default_debit_account_number` 0 ·
`vat_notes` 0 · `datev_is_various_account` 0 · `website_url` 6 ·
`observed_vendor_names` 36 · `tax_ids` 44 · `typical_payment_type` 84 (alle
`bank_transfer`). Sie kommen zurück, sobald ein Wert darin steht — die Präzedenz
für dieses Vorgehen ist L-201. Zwei davon sind mehr als leer:
`default_debit_account_number` ist das typische Gegenkonto, das jeder
Buchungsvorschlag bräuchte, und `datev_is_various_account` ist das Kennzeichen,
über das `searchCreditors` die Diverse-Konten aus der Auswahl hält — im
Bestand trägt es **keine** Zeile (Befund L-227).

**Text-Grenzen:** `legalName` p50 15 · p90 21 · max 50 im ganzen Bestand,
p50 17 · p90 33 · max 49 unter den benutzten → in der Zelle bei **36 Zeichen**
hinten kürzen; das ist `MAX_COUNTERPARTY` aus `SourceDocument.tsx`, dort schon
über `clipEnd()` auf denselben Namen angewandt, und es deckt den p90 (33) ab.
In Zeile und Kopf ungekürzt. `shortName` ist auf 15 Zeichen begrenzt und wird nie gekürzt.
`businessDescription` max 101 → ungekürzt.

**Eine Ableitung fehlt und wird gebraucht:** ein `partnerDisplayName()`, das
zwischen `shortName` und `legalName` entscheidet. Heute rendert jede Stelle
`legalName` roh und hängt `shortName` dekorativ daran; die Präzedenz für die
Ableitung sind `documentCounterparty()` (L-36) und `caseDisplayTitle()` (L-52).
Befund **L-224**, offene Frage 1.

## Relationen

| Relation | Richtung | Kardinalität | Rolle | ab Form | Darstellung | Beleg |
|---|---|---|---|---|---|---|
| Personenkonten (`client_ledger_accounts.business_partner_id`) | Kind | **0 % ohne** · p50 1 · p90 2 · max 6; 6.515 Partner über zwei Wirtschaftsjahre, 8.373 über eines; **3 Partner** mit Nummernwechsel zwischen den Jahren; 15 Konten sind Ludwig-Platzhalter (`system_allocated`, 89xxxx, `local_only`) | Identität | Nummern ab XS, Liste ab L | Nummer im Kopf (Ränge 2/3) · Liste je Wirtschaftsjahr eingebettet als `accountColumns()` → Profil `account` | Staging · `AccountsTab` |
| Sachverhalte (`counterparty_partner_id`) | Kind | 99 % ohne; unter den 168 mit: p50 1 · p90 4 · max 43 (nur 10 Partner über 5). Von 915 Sachverhalten tragen **429 (47 %)** einen Partner | Kontext | Zähler ab S, Liste ab L | Zähler (S) · Liste (L) eingebettet als `CaseRow` → Profil `accounting-case` | Staging · `CasesTab` · `CaseRow` trägt den Fall im `@when` bereits („the tab of a business partner") |
| Rechnungen (`client_source_docs_invoices.business_partner_id`) | Kind | 100 % ohne; unter den 57 mit: p50 1 · p90 3 · max 10 | Kontext | L | Liste eingebettet als `SourceDocumentList` → Profil `source-document` | Staging · `InvoicesTab` |
| Buchungssätze (`client_journal_entry.business_partner_id`) | Kind | 99 % ohne; unter den 94 mit: p50 1 · p90 3 · max 20 | Maß | L | Liste eingebettet als `JournalEntryCompact` → Profil `journal-entry` | Staging · Karte „Letzte Buchungen Kreditor" |
| Erwartungen (`expected_counterparty_partner_id`) | Kind | 100 % ohne · max 10 | Kontext | L | Zähler → Profil `accounting-case` | Staging |
| Bank-/Namens-Aliase (`client_business_partner_bank_aliases`) | Kind | **0 Zeilen im Bestand**; Wertebereich `alias_kind` = `iban` \| `name`, unique je Mandant | Kontext | L | Liste im Reiter „Technik" | Schema · GLOSSARY (Stufe 4 der Resolver-Kaskade) |
| Agenten-Notizen (`client_agent_notes.business_partner_id`) | Kind | **0 Zeilen im Bestand** | Erklärung | L | jüngstes → wartet auf L-27 (Notizstrang) | Schema |
| Grabstein (`merged_into_partner_id`) | Selbst-FK | 0 im Bestand | Zustand | L | Inline auf den Zielpartner; in jeder Auswahl weggefiltert | Spaltenkommentar |
| Mandant (`platform_clients`) | Eltern | 1:1, NOT NULL | Kontext | nur außerhalb des Mandanten-Kontexts | Inline | Schema |
| Historie (`platform_audit_events`) | ohne FK, **drei** `resource_kind`-Werte | `business_partner` 39 (`account_assigned` 16, `linked_to_clearing_account` 16, `created_by_agent` 7), `creditor` 33, `debtor` 2 | Verantwortung | L | Liste → Profil des Audit-Ereignisses; **erst nach L-226**, sonst zeigt sie die halbe Geschichte | Staging |

Die drei eingebetteten Listen (Konten, Belege, Sachverhalte) gehören **nicht**
dieser Familie: sie zeigen die Zeile ihrer eigenen Entität. Das Profil legt nur
fest, welche — und dass alle drei erst ab L erscheinen.

## Heutige Darstellung

Aus `ui-repraesentationen.md` §1 („Geschäftspartner", 7 Komponenten) und den je
Komponente gelesenen Feldern:

| Komponente | Ort | Form | zeigt | fehlt | zu viel |
|---|---|---|---|---|---|
| Partnerliste `[year]/partners/page.tsx` | `app/(app)/…` | Liste (rohe `<table className="tbl">`, kein `DataTable`) | Name (Link) + Kurzname als Subzeile · Kreditorkonto · Debitorkonto · Verrechnung · Stadt · Reifegrad (`StatusBadge`) · USt-Profil · Art · USt-IDs · Buchungen · Letzte Buchung · Aktion „Akzeptieren". Dazu Stat-Leiste, Status-Reiter, Freitext + Rollenfilter, `EmptyState`, `Pagination` | Sortierung (L-15) | USt-Profil und USt-IDs in derselben Zeile — beide unter 10 % gefüllt, beide vor der Buchungsspalte |
| Partnerkopf `[partnerId]/page.tsx` | `app/(app)/…` | Kopf | `legalName` (h2) · `shortName` · `StatusBadge axis="partner"` · `AccountChip` für Kreditor und Debitor (Rolle + Nummer + „intern") | Verrechnungskonten (der Abrechner hat im Kopf keine Nummer) | — |
| `MasterDataTab` | `modules/business-partners/ui/tabs` | Detail (5 Key-Value-Boxen) | 21 Felder: Identität · Adresse · USt-Profil · Typisches Verhalten · Aktivität | `contactEmail`, `contactPhone` (14 % / 39 % gefüllt, nirgends gezeigt) | 8 Felder mit 0 % Füllgrad (`typicalTaxKeys`, `vatNotes`, `typicalCurrency`, `typicalPaymentTermDays`, `websiteUrl`, `taxIds` …) |
| `TechnicalTab` | dito | Detail (Entwicklung) | Ids, `normalizedName`, `defaultDebitAccountNumber`, `profilingMetadata`, kompletter Rohsatz als JSON | — | — (das ist der Ort dafür; Präzedenz `RawRecord`) |
| `AccountsTab` · `InvoicesTab` · `CasesTab` | dito | Listen fremder Entitäten | Konten (`PartnerPersonalAccount`), Belege, Sachverhalte | — | — |
| `CreditorCombobox` | `modules/business-partners/ui` | Auswahl | `accountNumber` (mono) + `legalName`; gewählt: „70032 · Musterfirma GmbH". Server-Suche über `searchCreditors` (limit 8, nur Kreditoren mit Konto, ohne Grabsteine, ohne Diverse, sortiert nach Buchungszahl) | Reifegrad, Ort, USt-IdNr. — bei zwei gleichnamigen Partnern entscheidet nichts | — |
| `AcceptCreditorForm` | dito | Editor in der Zeile | **nur** `datevAccountNumber` (4–20 Ziffern, 89xxxx vorbelegt) | — | — |
| `CreditorProposalsReview` | dito | Liste | Vorschlags-**Kandidaten** (`vendor_name`, `vendor_ust_id`, `invoice_count`, Zeitraum, `match_signal`) — nicht Partner | — | — (andere Entität, siehe §Listen) |
| Karte „Gegenpartei" `Schritt3Einzel.tsx` | `modules/stapelabnahme/ui` | Karte | Name · Kontonummer · frühere Buchungen · USt-IdNr. · übliches Gegenkonto + Steuerschlüssel · letzte Buchungen · „Öffnen" | — | — die reichhaltigste Partner-Darstellung der App, und die einzige, die den Partner **im Kontext einer anderen Entität** zeigt |
| `GlanceCard` (Beleg) | `modules/invoices/ui` | Inline | Label wechselt „Kreditor" / „Kunde" je `docDirection`, Wert `partnerLegalName ?? vendorName` , Link nur bei `inbound` | — | — |
| Dashboard „Top Kreditoren" | `[year]/page.tsx` | Liste (Aggregat) | Name (Link) · Rechnungszahl · Summe | — | — |
| als Fremdfeld in **v3**: `case-columns` (Spalte `counterparty`), `CaseFacts` („Geschäftspartner"), `CaseCard`, `account-columns` (Spalte „Geschäftspartner"), `source-document-columns`, `BankTransactionCell` | `src/ui/v3/entities/**` | Cell / Spalte | den Namen, teils verlinkt über einen Callback des Aufrufers | eine gemeinsame Zelle — jede der sechs Stellen setzt Name, Link und Kürzung selbst | — |

**Der nachgewiesene Bedarf ist damit:** eine Zelle (sechsmal von Hand), eine
Zeile (die Liste), eine Auswahl (`CreditorCombobox`), ein Faktenblock
(`MasterDataTab`) und ein Kopf. Was **nicht** nachgewiesen ist: ein Editor —
kein einziges Stammfeld ist über die Oberfläche änderbar.

## Listen

| Liste | Job | Grundgesamtheit | Sortierung | Spalten (Ränge) | Filter | Massenaktion | Leerfall | Umfang p50 · p90 | Beleg |
|---|---|---|---|---|---|---|---|---|---|
| `BusinessPartnerList` „Stammsätze" | Wenn eine Sachbearbeiterin eine Kontonummer oder einen Namen vor sich hat und nicht weiß, wer dahintersteht, will sie **alle Geschäftspartner des Mandanten durchsuchen**, damit sie den vorhandenen Stammsatz findet, statt einen zweiten anzulegen. | alle Partner des Mandanten **ohne Grabsteine** | Name aufsteigend (`PARTNER_SORT_KEYS`; sortiert heute nicht, L-15) | 1–8 (Name + Kurzname, Kreditor, Debitor, Reifegrad, Buchungen, Letzte Buchung, Ort) + Verrechnung, wo gefüllt | Reifegrad (Reiter) · Rolle (`PARTNER_ROLE_LABEL`) · Freitext über Name, USt-IdNr. **und Kontonummer** | keine — „Alle bestätigen" gehört der Vorschlagsliste | **zwei**: „Für diesen Mandanten sind keine Geschäftspartner importiert" (Bestand, Verweis aufs Onboarding) ≠ „Keine Treffer" (Filter) | **553 · 6.335** je Mandant (544 / 552 / 555 / 572 / 6.331 / 6.336) | Staging · `partners/page.tsx` |
| Dashboard „Top Kreditoren" | Wenn die Kanzlei den Monat überblickt, will sie die Kreditoren mit dem größten Volumen sehen, damit sie weiß, wo eine Abweichung teuer wäre. | Kreditoren mit Rechnungen im Zeitraum | Summe absteigend | Name + Rechnungszahl + Summe | keiner | keine | „Im Zeitraum wurde nichts gebucht" | 5 | `[year]/page.tsx` |

**Eine Liste, nicht drei.** Die Reiter „Alle / Bestätigt / Vorgeschlagen /
Entwurf" unterscheiden sich nur in der Grundgesamtheit und in nichts sonst —
nach §8 also ein `filter`-Prop, keine zweite Komponente. Die
**Vorschlagsliste** (`CreditorProposalsReview`) ist keine Ausprägung dieser
Liste, sondern eine **andere Entität**: sie zeigt Kandidaten aus dem
Belegbestand (`vendor_name`, `invoice_count`, `match_signal`), die noch kein
Partner sind. Sie braucht ein eigenes Profil, wenn sie drankommt.

**„Top Kreditoren" ist keine zweite Ausprägung dieser Liste**, obwohl der Job
eigenständig ist: ihre drei Spalten sind Aggregate, die
`BusinessPartnerListItem` nicht führt, und sie ist eine Kachel des Dashboards.
Sie gehört ins Seitenprofil des Dashboards, wie die Sparkline-Kachel — und
steht deshalb auf dem Backlog.

**Mechanik nach §8:** p50 553, p90 6.335 Zeilen je Mandant, weit über 200 →
`Pagination`, **Serverfilter** und Serversuche (steht heute schon so), Lade- und
Fehlerfall in der Spec. Kein virtuelles Scrollen.

Die Liste hat eine eigene Route (`/clients/:slug/:year/partners`) und braucht
deshalb zusätzlich ein Seitenprofil unter `docs/seiten/`; hier stehen nur Job
und Tabellenschnitt.

## Formen

| Form | Größe | Empfehlung | Grund (§7 Nr.) | zeigt (Ränge) | Relationen | setzt auf | ersetzt |
|---|---|---|---|---|---|---|---|
| `BusinessPartnerCell` | XS | **ja** | 3 — FK-Ziel von Sachverhalt, Konto, Rechnung, Buchungssatz und Erwartung; **sechs** v3-Stellen nennen den Partner heute je für sich (`case-columns`, `CaseFacts`, `CaseCard`, `account-columns`, `source-document-columns`, `BankTransactionCell`), jede mit eigener Kürzung und eigenem Link-Callback | 1, dazu 2/3 als Nummer im `HoverCard` | — | `Link`, `TextButton`, `Icons.partner`, `clipEnd()` + `MAX_COUNTERPARTY` aus `SourceDocument.tsx` | die sechs handgeschriebenen Namensausgaben; `GlanceCard`-Partnerzeile |
| `businessPartnerColumns()` | S | **ja** | 1 — die Zeile existiert als rohe `<table>` in `partners/page.tsx` mit 11–12 Spalten. Wie bei Konto und Beleg wird daraus eine **Spaltendefinition**, keine Zeilen-Komponente: `DataTable` (0057) baut sie, und zwei Zeilenbauten für eine Entität verbietet R17 | 1–8 | Personenkonten als Nummern, Verrechnungskonten als Nummern | `ColumnDef[]` über `MonoCell`, `StatusBadge axis="partner"`, `Time`, `LongText`, `BusinessPartnerCell` | die Tabelle in `partners/page.tsx` samt lokalem `AccountCell` und `ClearingCell` |
| `BusinessPartnerPicker` | S | **ja** | 3 — der Nutzer wählt ihn aus: `CreditorCombobox` im Ask-Dialog „Lieferant des Einzelsachverhalts" (`OffenePostenWorklist`), und laut GLOSSARY löst der Picker für Ausgangsrechnungen den Empfänger gegen die Partner auf | 1–3, Ort als Unterscheider; „ohne konkreten Lieferanten" als gültige Wahl (Diverse-Pool) | — | `Combobox` (`@when` nennt „partner" wörtlich), `MonoCell`; Präzedenz `AccountField` (0013) und `CasePicker` | `CreditorCombobox` |
| `BusinessPartnerFacts` | M | **ja** | 1 — `MasterDataTab` existiert mit 21 Feldern in 5 Boxen; und es ist der Teil, den Drawer und View teilen (0052, Präzedenz `SourceDocumentFacts`, `AccountFacts`, `CaseFacts`) | 1–16 | Personenkonten als Zähler + Nummern | `FieldList bare`, `StatusBadge`, `Time`, `Amount`, `BusinessPartnerCell` (Grabstein-Ziel) | `MasterDataTab` und den Kopfblock der Partnerseite |
| `BusinessPartnerDrawer` | L | **ja** | 5 — **fünf** fremde Ansichten verweisen auf ihn, ohne ihn zeigen zu können: `CaseFacts` (`partnerHref`), `case-columns` (`counterpartyHref`), `account-columns` (`partnerHref`), `GlanceCard` am Beleg und die Dashboard-Kachel. Alle fünf verlassen heute die Seite. Er beantwortet die eine Frage, die dort aufkam („wer ist das, und wird da gebucht?"), und bietet den Weg in den View | wie `BusinessPartnerFacts` + Personenkonten | Personenkonten als Liste; Belege, Sachverhalte, Buchungssätze **nicht** (offene Frage 3) | `Drawer`, `BusinessPartnerFacts`, `accountColumns()` | den Sprung auf `/partners/[partnerId]` aus fünf Stellen |
| `BusinessPartnerView` | L | Backlog | 1 — die Seite mit fünf Reitern existiert. Eigene Route → nach `docs/backlog/README.md` Schritt 0b erst ein Seitenprofil; ob es bei fünf Reitern bleibt, entscheidet das Profil, nicht die Spec | | | | `partners/[partnerId]/page.tsx` |
| `BusinessPartnerList` | L | Backlog | 6 — ein Listen-Job, von einem Screen belegt. Eigene Route → Seitenprofil. Die Spalten entstehen vorher; die Seite baut sie mit `DataTable` zusammen | | | | die Tabelle samt Stat-Leiste, Reitern und Filterform |
| `BusinessPartnerCard` | M | Backlog | 1 + 2 — die Karte „Gegenpartei" in Schritt 3 der Stapelabnahme zeigt den Partner im Kontext eines Sachverhalts. Vertagt, weil ihre stärksten Felder (übliches Gegenkonto, üblicher Steuerschlüssel, letzte Buchungen, „erstmals gebucht") **Ableitungen sind, die es im Spiegel nicht gibt** — `default_debit_account_number` und `typical_tax_keys` sind zu 0 % gefüllt | | | | Karte „Gegenpartei" in `Schritt3Einzel.tsx` |
| `BusinessPartnerEditor` | XL | **verworfen** | kein Punkt mit änderbar = Nutzer. `updateBusinessPartner` ist der einzige Update-Pfad, kann **nur** `typical_nature` setzen und hat keine Oberfläche; `AcceptCreditorForm` ändert die DATEV-Kontonummer, und die gehört dem **Personenkonto**, nicht dem Partner. Der einzige Nutzer-Eingriff am Partner ist `proposed → confirmed` — eine Handlung, kein Feld, und sie trägt `ActionButton` mit `ask` (0121) | | | | |

Bau-Reihenfolge: `BusinessPartnerCell` → `businessPartnerColumns()` →
`BusinessPartnerPicker` → `BusinessPartnerFacts` → `BusinessPartnerDrawer`.
Die Zelle trägt die Spalten und die Fakten, die Fakten tragen den Drawer.

**Warum der Drawer vor dem View entsteht:** §7 sagt, der Drawer folgt dem View,
weil er dessen Kern-Fakten aus derselben Komponente zeigt. Diese Komponente ist
`BusinessPartnerFacts` — und die steht vorher (Präzedenz 0052 `SourceDocumentFacts`,
0066/0068 `AccountFacts`/`AccountDrawer`). Der View wartet auf sein Seitenprofil,
der Drawer nicht.

**Warum keine `BusinessPartnerRow`:** Es gibt genau eine Partnerliste, und sie
hat 6.335 Zeilen im p90 — also `DataTable` mit Serverfilter. Eine zweite,
kurze Liste von Partnern gibt es nirgends (die Reiter am Partner zeigen
*andere* Entitäten). Damit hat die Zeile nur einen Rahmen, und der ist eine
Spaltendefinition. Präzedenz: `accountColumns()` (0062),
`sourceDocumentColumns()`, `bankTransactionColumns()`.

## Zuschnitt

| Form / Liste | Marke | Grund | Backlog |
|---|---|---|---|
| `BusinessPartnerCell` | **jetzt** | trägt Spalten, Fakten und Drawer; sechs v3-Stellen bauen sie heute nach | — |
| `businessPartnerColumns()` | **jetzt** | die Liste existiert als rohe Tabelle und blockiert deren Ablösung | — |
| `BusinessPartnerPicker` | **jetzt** | existiert als `CreditorCombobox`; die Ausgangsrechnung braucht ihn laut GLOSSARY ebenfalls | — |
| `BusinessPartnerFacts` | **jetzt** | Zone 3 des Drawers und später des Views (0052); ersetzt `MasterDataTab` | — |
| `BusinessPartnerDrawer` | **jetzt** | fünf fremde Ansichten verweisen auf den Partner, ohne ihn zeigen zu können | — |
| `BusinessPartnerView` | Backlog | eigene Route mit fünf Reitern → erst Seitenprofil (`docs/backlog/README.md` Schritt 0b) | `docs/backlog/0127-business-partner-view.md` |
| `BusinessPartnerList` „Stammsätze" | Backlog | eigene Route → erst Seitenprofil; die Spalten entstehen vorher | `docs/backlog/0128-business-partner-list.md` |
| `BusinessPartnerCard` | Backlog | hängt an Ableitungen, die es nicht gibt (übliches Gegenkonto, üblicher Steuerschlüssel, letzte Buchungen) — und sie passt nicht mehr in die Fünf | `docs/backlog/0129-business-partner-card.md` |
| Dashboard „Top Kreditoren" | Backlog | Aggregat-Kachel des Dashboards, keine Ausprägung dieser Liste — gehört ins Seitenprofil des Dashboards | in `0128` als Abgrenzung vermerkt |
| `BusinessPartnerEditor` | **verworfen** | kein Punkt mit änderbar = Nutzer; die einzige Nutzer-Eingabe der Familie schreibt das Personenkonto | — |
| Vorschlagsliste (`CreditorProposalsReview`) | **verworfen** (für dieses Profil) | zeigt Kandidaten aus dem Belegbestand, nicht Partner — eigene Entität, eigenes Profil, wenn sie drankommt | — |

Fünf Formen „jetzt" — die Obergrenze aus §9.

## Befunde für `ludwig/app`

Alle sechs stehen zusätzlich als Zeile in `docs/befunde-app.md` (L-222 … L-227).

- **L-222 · `TYPICAL_NATURE` kennt vier von sechs Werten.**
  `business-partner.ts` führt `goods | expense | mixed | unknown`; der DB-CHECK
  erlaubt zusätzlich `service` und `investment`, und im Bestand tragen **924
  Partner** genau diese beiden (`service` 877, `investment` 47) — 47 % aller
  Partner mit einem Wert ungleich `unknown`. `PARTNER_NATURE_LABEL` hat für sie
  kein Wort; die Spalte „Art" der Partnerliste zeigt dort nichts. Fehler im
  laufenden UI, derselbe Fall wie L-203.
- **L-223 · `VAT_PROFILE_LABEL` lebt privat in `MasterDataTab.tsx`.** Neun
  Werte, deutsche Wörter nirgends zentral — die Partnerliste zeigt deshalb den
  rohen Enum (`domestic_reverse_charge` statt eines Wortes). Rang 10, unter den
  benutzten Partnern zu 73 % gefüllt.
- **L-224 · Keine Anzeigename-Ableitung.** `shortName` ist zu 98 % gefüllt und
  in **49 %** ein anderer Text als `legalName` (DATEV-Kurzbezeichnung,
  15 Zeichen); trotzdem rendert jede Stelle `legalName` roh und hängt
  `shortName` dekorativ an. Präzedenz: `documentCounterparty()` (L-36),
  `caseDisplayTitle()` (L-52).
- **L-225 · GLOSSARY-Eintrag „Creditor source" ist der Zusammenführung nicht
  gefolgt.** Er heißt nach der Rolle statt nach der Entität, zählt **sechs** von
  acht CHECK-Werten auf (`opos_import` und `recurring_import` fehlen) — und
  eine Label-Map gibt es nicht; `MasterDataTab` und `TechnicalTab` zeigen die
  Herkunft roh.
- **L-226 · Die Historie eines Partners liegt unter drei `resource_kind`-Werten**
  (`business_partner` 39, `creditor` 33, `debtor` 2). Seit F76 ist das eine
  Entität; eine Verlaufsliste am Partner zeigt heute je nach Filter ein Drittel
  bis die Hälfte.
- **L-227 · `BusinessPartnerListItem` trägt weder `mergedIntoPartnerId` noch
  `datevIsVariousAccount`.** `searchCreditors` filtert beide in SQL — ein Picker,
  der den gespiegelten Typ benutzt, kann Grabsteine und Diverse-Konten nicht
  ausschließen, obwohl der Spaltenkommentar es verlangt („Grabsteine erscheinen
  in keiner Auswahl-Liste mehr"). Dazu: `datev_is_various_account` ist im
  Bestand in **0 von 14.890** Zeilen gesetzt, obwohl es die einzige Wahrheit für
  Sammelkonten sein soll — entweder ist der Import unvollständig oder das
  Kennzeichen ist tot.

## Offene Fragen

1. **Führt `legalName` oder `shortName` den Namen?** `shortName` ist zu 98 %
   gefüllt, in der Hälfte der Fälle ein echter DATEV-Kurzname, auf 15 Zeichen
   begrenzt — und `configuration/stammdaten` beschreibt ihn als Bestandteil des
   Buchungstexts. — *ohne Antwort:* `legalName` führt, `shortName` steht als
   zweite Zeile in Zeile, Kopf und Fakten (so wie heute). Die Ableitung heißt
   trotzdem `partnerDisplayName()` und gehört in die App (L-224).
2. **Braucht die Zeile ein Wort für die Rolle** (Kreditor · Debitor · beides ·
   Abrechner · ohne Konto)? `PARTNER_ROLE_LABEL` gibt es nur als
   Filter-Wortlaut („Nur Kreditoren"). — *ohne Antwort:* keine eigene Spalte;
   die beiden Nummernspalten und die Verrechnungsspalte sagen es, und der
   Abrechner erkennt sich daran, dass nur die Verrechnungsspalte gefüllt ist.
3. **Welche Kind-Liste zeigt der Drawer?** Der View hat fünf Reiter; ein
   Drawer, der aus einer Sachverhaltszeile aufgeht, beantwortet eine Frage. —
   *ohne Antwort:* Zone 3 sind die Fakten plus die Personenkonten (p90 zwei
   Zeilen); Belege, Sachverhalte und Buchungssätze bleiben dem View, und der Fuß
   führt mit genau einem Knopf dorthin (A10).

## Prüfung

Gehört dem zweiten Agenten. Er prüft zuerst alle Zeilen mit Beleg `Annahme`,
dann die Ränge gegen „Heutige Darstellung", dann die Formen gegen §7.

| Zeile / Form | Einwand | Ergebnis | Geprüft von / am |
|---|---|---|---|
| | | | |

## Weiter

Prüfprompt (neue Sitzung, anderer Agent):

```
Prüfe das Entitätsprofil docs/entitaeten/business-partner.md nach Skill entitaet-analysieren
§5–§9. Zuerst jede Zeile mit Beleg „Annahme": belege oder widerlege sie mit Füllgrad,
heutiger Komponente oder GLOSSARY. Dann die Ränge: deck die Punkte ab Rang k ab — erkennt
eine Sachbearbeiterin den Partner zwischen 6.000 Geschwistern noch? Prüf besonders, ob die
beiden Kontonummern wirklich Rang 2 und 3 verdienen und ob Ort (7) und Kurzname (8) nicht
davor gehören. Dann die Formen: hat jede empfohlene einen Grund aus §7, fehlt eine, die die
App heute hat — und ist die Entscheidung gegen eine BusinessPartnerRow zugunsten von
businessPartnerColumns() richtig? Dann die Listen: ist „Top Kreditoren" wirklich keine
eigene Ausprägung? Zuletzt der Zuschnitt: sind höchstens fünf Formen „jetzt", und trägt
jede Backlog-Zeile ihren Grund? Die Zahlen stammen aus dem Staging-Bestand über
127.0.0.1:55452 (LUDWIG_DATABASE_URL in apps/web/.env.staging.local), 14.890 Partner —
rechne stichprobenartig nach. Trag jeden Einwand in „Prüfung" ein, ändere die Tabellen, wo
du sicher bist, und setze den Status auf „geprüft". Kundendaten bleiben in der Datenbank;
nur SELECT.
```

Startprompt (neue Sitzung, nach Status `geprüft`):

```
Für die Entität Geschäftspartner (`business partner`) liegt das geprüfte Profil unter
docs/entitaeten/business-partner.md. Schreibe mit Skill spec-schreiben je Form eine Spec, in
dieser Reihenfolge — nur die Formen mit Marke „jetzt" aus dem Abschnitt Zuschnitt:
BusinessPartnerCell, businessPartnerColumns(), BusinessPartnerPicker, BusinessPartnerFacts,
BusinessPartnerDrawer. Was dort „Backlog" trägt (0127 View, 0128 List, 0129 Card), bleibt
liegen. Jede Spec verlinkt das Profil als Quelle und nimmt Datenpunkte, Ränge, Relationen
und „ersetzt" von dort, nicht aus dem Chat; die Punkte einer Form sind die Ränge bis zu
ihrer Größe, in derselben Reihenfolge. Danach baut Skill v3-komponente jede Spec in
derselben Reihenfolge, die größere Form komponiert die kleinere. Abgenommen wird von einem
anderen Agenten gegen die Spec. Nur eigene Dateien stagen. Setze am Ende den Status des
Profils auf „in Specs" und trage die Backlog-Nummern ein.
```
