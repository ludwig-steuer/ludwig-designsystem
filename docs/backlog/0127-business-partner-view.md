# 0127 · `BusinessPartnerView` — die Vollansicht eines Geschäftspartners

| | |
|---|---|
| Status | offen |
| Stufe | `entities/business-partner/` |
| Quelle | Entitätsprofil `docs/entitaeten/business-partner.md`, Abschnitt „Formen" (Zeile `BusinessPartnerView`) |
| Auftrag | Die Seite hinter dem Fuß-Knopf des `BusinessPartnerDrawer` (A10): alles über einen Geschäftspartner. Heute fünf Reiter in `app/(app)/clients/[clientSlug]/[year]/partners/[partnerId]/page.tsx` — Stammdaten (`MasterDataTab`, 21 Felder in fünf Boxen), Konten (`AccountsTab`, `PartnerPersonalAccount[]` über alle Wirtschaftsjahre), Belege, Sachverhalte, Technik (`TechnicalTab` samt Rohsatz). Dazu der Kopf mit Name, Kurzname, `StatusBadge axis="partner"` und je einem `AccountChip` für Kreditor und Debitor. Zeigt alle Datenpunkte ab 20 % Füllgrad, also die Ränge 1–16 des Profils. |
| Vertagt, weil | Eigene Route mit fünf Reitern → nach `docs/backlog/README.md` Schritt 0b erst ein Seitenprofil unter `docs/seiten/`; jedes Element muss dort einer Frage der Rolle dienen, und ob es bei fünf Reitern bleibt, entscheidet das Profil, nicht die Spec. Offen ist dort insbesondere, ob „Technik" ein Reiter oder eine `Disclosure` ist (Präzedenz `RawRecord`) und ob „Belege" und „Sachverhalte" zwei Reiter oder einer sind — beide sind zu 99 % leer (57 bzw. 168 Partner im ganzen Bestand). Der Teil, den View und Drawer teilen, wird als `BusinessPartnerFacts` in der laufenden Welle gebaut; der Drawer wartet damit nicht auf den View (Präzedenz `SourceDocumentFacts` 0052, `AccountFacts` 0066). |
| Setzt voraus | Seitenprofil `docs/seiten/partner-detail.md` (fehlt) · `BusinessPartnerFacts` und `BusinessPartnerCell` aus der Partner-Welle · `accountColumns()` (0062) für den Reiter „Konten", `CaseRow` für „Sachverhalte", `SourceDocumentList` für „Belege" · Befund **L-226** (die Historie liegt unter drei `resource_kind`-Werten), falls der View einen Verlauf zeigen soll |
| Ersetzt | `apps/web/src/app/(app)/clients/[clientSlug]/[year]/partners/[partnerId]/page.tsx` samt `PartnerTabsBar`, `MasterDataTab`, `TechnicalTab` |
| Angelegt von / am | Claude, 2026-09-08 (Skill `entitaet-analysieren`, §9) |
