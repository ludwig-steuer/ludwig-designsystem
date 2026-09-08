# 0129 · `BusinessPartnerCard` — der Geschäftspartner im Kontext eines Vorgangs

| | |
|---|---|
| Status | offen |
| Stufe | `entities/business-partner/` |
| Quelle | Entitätsprofil `docs/entitaeten/business-partner.md`, Abschnitt „Formen" (Zeile `BusinessPartnerCard`) |
| Auftrag | Der Partner, gezeigt **neben** einer anderen Entität, damit die Sachbearbeiterin entscheiden kann, ohne die Seite zu wechseln. Vorbild ist die Karte „Gegenpartei" in Schritt 3 der Stapelabnahme (`modules/stapelabnahme/ui/Schritt3Einzel.tsx`, Z. 505–560) — die reichhaltigste Partner-Darstellung der App: Name · Kontonummer · „erstmals gebucht" bzw. „N frühere Buchungen" · USt-IdNr. · „bucht sonst auf 6815 Bürobedarf, BU 9" · die letzten Buchungen mit Datum, Konto und Betrag · ein Knopf „Öffnen". Zweite Fundstelle in kleinerer Form: die Partnerzeile der `GlanceCard` am Beleg. |
| Vertagt, weil | Zwei Gründe. **Erstens die Ableitungen:** die Felder, die diese Karte stark machen, gibt es im Spiegel nicht. „Bucht sonst auf …" wäre `default_debit_account_number` — **0 von 14.890 Zeilen gefüllt**; „BU 9" wäre `typical_tax_keys` — ebenfalls **0**. Die App rechnet beides heute im VM `ReviewCasePartner` (`modules/stapelabnahme/application/review-case.ts`) aus der Buchungshistorie zusammen, nicht aus dem Partner. Eine Spec müsste erfinden, woher die Karte diese Werte nimmt — genau das, was `spec-schreiben` §5 verbietet. **Zweitens der Schnitt:** mit ihr wären es sechs Formen „jetzt", eine mehr als §9 erlaubt; Zelle, Spalten, Auswahl, Fakten und Drawer tragen einander, die Karte trägt niemanden. |
| Setzt voraus | Entscheidung, ob die drei Ableitungen (übliches Gegenkonto, üblicher Steuerschlüssel, letzte Buchungen je Partner) an den Partner gehören oder ein eigenes Sichtmodell bleiben — Owner-Frage, dann ein Befund für `ludwig/app` · `BusinessPartnerFacts` und `BusinessPartnerCell` aus der Partner-Welle · `JournalEntryCompact` für die Buchungszeilen |
| Ersetzt | die Karte „Gegenpartei" in `Schritt3Einzel.tsx`; die Partnerzeile der `GlanceCard` in `modules/invoices/ui` |
| Angelegt von / am | Claude, 2026-09-08 (Skill `entitaet-analysieren`, §9) |
