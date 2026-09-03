# F89 — Beleg-Galerie: Szenarien-Katalog + View-Plan-Seam (P13-Grundlage)

**Status:** geschnitten 2026-08-20 aus der UI-Bewertung nach F87 ·
**Priorität:** mittel · **Problem-Anker:** P14 in
`docs/topics/belege-offen.md` („UI-Neubewertung nach dem
Kategorienmodell", alt: problems.md P13)

**Owner-Entscheid (2026-08-20):** Galerie-Route in der App statt
Storybook-Toolchain. Begründung: die Debug-Tabs sind Server Components
(props-in, kein `"use client"`) — in Storybook die RSC-Grauzone, in einer
App-Route nativ renderbar; null neue Dependencies, echte Styles/Layout
geschenkt. P14 nennt die Galerie bereits als zulässige Variante.

**Nachtrag (Owner 2026-08-27, umgesetzt 2026-08-29 mit F111):** Storybook
**wird** eingeführt — für die _reinen_ Darstellungskomponenten (Props rein,
JSX raus), die client-renderbar sind. Der Entscheid oben bleibt für genau
das gültig, worum es hier ging: die RSC-verwobenen Debug-Tabs und Screens
kommen **nicht** in Storybook. `app/dev/gallery` bleibt bestehen und behält
die ladenden Hüllen (`ui/drawers`, Server-Roundtrip); kein Rückbau ohne
Owner-Entscheid. Arbeitsteilung und Inventar:
`docs/reference/datenmodell/ui-repraesentationen.md` §4.3 und §5. Ziel ist die **einmalige systematische Bewertung**
(Kategorie × Form × Zustand) vor jedem Screen-Umbau, kein dauerhaftes
Komponenten-Doku-Instrument.

## Kontext / Ist-Stand (verifiziert 2026-08-20)

- Die Beleg-Detailseite
  (`apps/web/src/app/(app)/clients/[clientSlug]/documents/[sourceDocId]/page.tsx`)
  ist seit 2026-07-20 **eine Shell für jede Belegart**: gleiche Kopfzeile,
  Tab-Leiste, Sidebar-Grid, Erledigt-Steuerung. Der Repräsentations-Dispatch
  hängt an der **Subtyp-Dimension** (Z. 165–174: `isInvoice` =
  Invoice-Subtyp-Zeile existiert, `isContract` =
  `source_doc_type === "contract"`), **nicht** an `doc_category`. Das ist
  fachlich richtig und bleibt so: die Kategorie sagt „was passiert als
  Nächstes", der Subtyp sagt „welche Daten existieren" — nur Letzteres kann
  bestimmen, welche Ansicht renderbar ist (Gegenbeispiel: `delivery_note`
  ist `performance`, hat aber keinen Invoice-Flow und keine
  Positionen-Daten).
- Seit F87 fallen `doc_category` und `source_doc_type` aus **derselben
  Zeile** von `DOCUMENT_FORM_ROUTING`
  (`apps/web/src/modules/source-docs/domain/document-form-mapping.ts:71`)
  — konsistent by construction, mit Python-Spiegel und
  Deckungsgleichheits-Test (`__tests__/document-form-mapping.test.ts`).
- Tab-Katalog: `apps/web/src/modules/source-docs/domain/tabs.ts`
  (`availableDocTabs`, `belegTabLabel`).
- Die Dispatch-/Sichtbarkeits-Logik ist heute in ~500 Zeilen Page-Code
  verwoben (Laden + Entscheiden + Layout in einem File) — deshalb weder
  unit-testbar noch in einer Galerie renderbar.

**Bekannte Befunde, die die Galerie sichtbar machen soll (vorab notiert,
hier NICHT fixen):**

1. **Debug-Tabs doppelt implementiert:** `VerlaufTab`/`PipelineTab`
   (`apps/web/src/modules/invoices/ui/tabs/`, Quelle
   `client_invoice_traces`) vs. `SourceDocVerlaufTab`/`SourceDocPipelineTab`
   (`apps/web/src/modules/source-docs/ui/`, Quelle LLM-Call-Logs +
   Extraction-Logs). Der Rechnungs-Zweig lädt `getSourceDocLlmCallLogs`
   gar nicht — bei einer Rechnung fehlen die Classifier-LLM-Calls im
   Verlauf. „Debug-Infos überall" stimmt nur strukturell, nicht inhaltlich.
2. `bank_statement_pdf`, `credit_card_statement`, `travel_expense_report`
   haben keine typspezifische Sidebar-Box — nur Rechnung
   (`InvoiceSidebar`) und Vertrag (`ContractDetail`) existieren.
3. `source-doc-type.ts` nennt sich „Keim einer Renderer-Registry" — bei
   2 echten Ausprägungen + Default bleibt die if/else-Kaskade richtig;
   die **dritte** typspezifische Ansicht ist der Registry-Zeitpunkt.

## AP1 — View-Plan als pure function (Seam)

Die Entscheidungslogik der Detailseite als pure function extrahieren,
z. B. `planBelegView()` in
`apps/web/src/modules/source-docs/domain/beleg-view-plan.ts`:

- Input: die bereits geladenen Zeilen (Rückgabe-Typen von
  `getSourceDocForDispatch` aus `@/modules/source-docs/server` und
  `getInvoiceBySourceDoc` aus `@/modules/invoices/server`), kein IO.
- Output: ein reiner Descriptor (Skizze — Agent darf den Schnitt
  anpassen):

  ```ts
  interface BelegViewPlan {
    docTypeLabel: string;
    tabs: DocTab[];
    belegTabLabel: string;
    title: string;
    typeBox: "invoice_sidebar" | "contract_detail" | null;
    banners: Array<"pending_classification" | "classification_failed">;
    showProcessingProgress: boolean;
    backTarget: "year_list" | "problematic_list";
  }
  ```

- Die Page konsumiert den Plan; **verhaltensneutraler Refactor** (kein
  Pixel ändert sich). Die bestehenden Helfer (`availableDocTabs`,
  `belegTabLabel`, `sourceDocTypeLabel`, `backLink`) wandern hinein oder
  werden von dort aufgerufen — keine zweite Wahrheit daneben.
- Tests: 1 happy (Rechnung extracted → Positionen/Vorsteuer sichtbar,
  typeBox `invoice_sidebar`) + 1 failure/Edge (unklassifiziert
  `pending_classification` → generische Tabs, Banner, kein typeBox) +
  der `delivery_note`-Fall (Kategorie `performance`, aber **keine**
  Rechnungs-Ansicht — dokumentiert, warum die Kategorie nicht dispatcht).

## AP2 — Szenarien-Fixtures + Galerie-Route

- Fixtures in
  `apps/web/src/modules/source-docs/__fixtures__/beleg-scenarios.ts`:
  je Szenario ein benannter Eintrag `{ slug, titel, baseDoc, invoice?,
  contract?, notiz }` mit den echten Zeilen-Typen (keine eigenen
  Parallel-Typen erfinden).
- **Kern-Szenarien** (Subtyp × Zustand + Sonderfälle, ~20):
  1. Rechnung extrahiert, mit Buchungsvorschlag (Normalfall)
  2. Rechnung in Verarbeitung (ProcessingProgress sichtbar)
  3. Rechnung Extraktion fehlgeschlagen
  4. Rechnung `review_disposition = accounting` (Korrektur-Card)
  5. Rechnung erledigt (`completed_at` + Grund)
  6. Verwaiste Rechnungs-Zeile ohne Base-Row (Orphan-Pfad der Route)
  7. Vertrag mit Extraktion (`ContractDetail`-Box)
  8. Kontoauszug (`bank_statement_pdf` — Befund 2: generisch)
  9. Kreditkartenabrechnung (generisch)
  10. Reisekostenabrechnung (`expense_report`)
  11. Lohnabrechnung (`payroll_slip` — Label-Fallback über die Form)
  12. Steuerbescheid (`tax_assessment`, foundation)
  13. Auswertung (`accounting_report`, report — auto-erledigt mit
      `REPORT_COMPLETED_REASON`)
  14. Lieferschein (`delivery_note` — performance ohne invoiceFlow)
  15. Unklassifiziert `pending_classification` (Banner + AutoRefresh)
  16. `classification_failed` (Banner mit Fehlertext)
  17. Sammel-PDF-Parent mit Kindern (`ChildDocsCard`)
  18. Split-Kind mit Parent (`ParentDocNotice`)
  19. Beleg ohne Belegdatum (Back-Link → „Problematische Belege")
  20. Altdaten: `doc_category = null` / Form `unknown`
  Restliche Formen (`fuel_receipt`, `hospitality_receipt`,
  `cash_receipt`, `payment_reminder`, `cash_register_closing`,
  `tax_filing_summary`, `document_collection`, `other`) je ein
  Kurz-Szenario — der Deckungstest (AP3) erzwingt sie.
- Route `apps/web/src/app/(app)/dev/beleg-galerie/page.tsx`, Gating
  `process.env.NODE_ENV === "production"` → `notFound()`. (Soll die
  Review auf Staging stattfinden, Freischaltung als bewusste
  Owner-Entscheidung nachziehen — nicht vorauseilend.)
- Zwei Ebenen pro Galerie:
  1. **Matrix-Übersicht:** eine Tabelle über alle Szenarien aus
     `planBelegView()` — Spalten: sichtbare Tabs, Erster-Tab-Label,
     typeBox, Banner, Badges. Prüft die **Logik** vollständig auf einen
     Blick.
  2. **Render-Karten** je Szenario: die props-basierten Bausteine mit
     Fixture-Daten — Kopfzeilen-Zone (Titel, Typ-Chip, Status-Badges,
     Kategorie-Badge), `SourceDocFactsCard`, typeBox
     (`InvoiceSidebar`/`ContractDetail`), je ein Debug-Tab-Beispiel
     (Verlauf mit Fixture-Traces bzw. -LLM-Logs). Prüft die
     **Darstellung**. Die Shell selbst wird NICHT extrahiert (siehe
     Nicht-Ziele) — die Karten rendern die Bausteine direkt.

## AP3 — Deckungsgleichheits-Test Formen ↔ Szenarien

Vitest nach dem Haus-Muster (`document-form-mapping.test.ts` /
status-registry): jede Form aus `DOCUMENT_FORM_ROUTING` braucht
mindestens ein Szenario in `beleg-scenarios.ts`, sonst rot. Damit kann
eine neue Belegform nie wieder ohne UI-Bewertung live gehen. Zweiter
Assert: jedes Szenario referenziert nur Formen, die es in der Tabelle
gibt (kein Fixture-Drift).

## AP4 — Review-Ergebnis festhalten (Abschluss)

Die Galerie ist Mittel, das Ergebnis ist die **Befundliste**: nach dem
Durchsehen (Owner) die Befunde als P-Einträge in
`docs/topics/belege-offen.md` bzw. `docs/topics/web-ui-offen.md`
(je nach Zuschnitt) am P14-Anker ergänzen — Startpunkte
sind die drei vorab notierten Befunde oben (Debug-Tab-Konvergenz,
fehlende typeBoxen, Registry-Zeitpunkt). Screen-Umbauten werden danach
als eigene Tickets geschnitten, nicht in diesem.

## Nicht-Ziele

- **Kein Storybook** (Owner-Entscheid oben; falls später visuelle
  Regression gewünscht ist, ist der Fixture-Satz die halbe Miete).
- **Keine Renderer-Registry** — erst bei der dritten typspezifischen
  Ansicht.
- **Keine Screen-Umbauten / keine Debug-Tab-Konvergenz** — die folgen
  aus der Review (AP4) als eigene Tickets.
- **Keine Shell-Extraktion** über den View-Plan-Seam hinaus (die Page
  behält Laden + Layout; nur das Entscheiden wird pure).
- Keine Migration, keine Schreibpfade, keine Dev-DB-Mutationen.

## Arbeitsregeln

Standard laut `CLAUDE.md` + `docs/doc-lifecycle.md`: direkt auf
`staging`, **Commits mit Pathspec scopen** (geteilter Working-Tree,
kein `git add -A`), Tests 1 happy + 1 failure je Logik-Branch.

## Verifikation (Pflicht)

- Web-Vitest gezielt: `beleg-view-plan.test.ts` (AP1),
  Deckungsgleichheits-Test (AP3), bestehende
  `document-form-mapping.test.ts` bleibt grün.
- Repräsentativer Pfad: `/dev/beleg-galerie` lokal im Browser öffnen —
  Matrix vollständig, Render-Karten für die Kern-Szenarien ohne
  Laufzeitfehler; Detailseite eines echten Seed-Belegs unverändert
  (Stichprobe Rechnung + unklassifiziert).
- Abschluss: dieses Dokument löschen + drei Zeilen decision-log
  (`docs/doc-lifecycle.md`).
