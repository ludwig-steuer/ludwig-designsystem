# 0063 · `AccountView` — die Vollansicht eines Kontos

| | |
|---|---|
| Status | offen |
| Stufe | `entities/account/` |
| Quelle | Entitätsprofil `docs/entitaeten/account.md`, Abschnitt „Formen" (Zeile `AccountView`) |
| Auftrag | Die Seite hinter dem Fuß-Knopf des `AccountDrawer` (A10): alles über ein Konto in einem Jahr. Heute vier Tabs in `app/(app)/clients/[clientSlug]/[year]/accounts/[accountNumber]/page.tsx` — Übersicht (6 Kennzahlen, 6-Monats-Verlauf, je fünf neueste Bewegungen beider Quellen, Stammdaten), Buchungen, Monatsübersicht, LLM-Profil. Zeigt alle Datenpunkte ab 20 % Füllgrad. |
| Vertagt, weil | Eigene Route mit vier Tabs → nach `docs/backlog/README.md` Schritt 0b erst ein Seitenprofil unter `docs/seiten/`; jedes Element muss dort einer Frage der Rolle dienen, und ob es bei vier Tabs bleibt, entscheidet das Profil, nicht die Spec. Der Teil, den View und Drawer teilen, wird als `AccountFacts` in der laufenden Welle gebaut — der Drawer wartet damit nicht auf den View (Präzedenz `SourceDocumentFacts`, 0052). |
| Setzt voraus | Seitenprofil `docs/seiten/konto-detail.md` · `AccountFacts` und `AccountEntryList` aus der Konto-Welle · 0057 `DataTable` für den Tab „Buchungen" · offene Frage 1 des Profils (Saldo je Quelle) |
| Angelegt von / am | Claude, 2026-09-04 (Skill `entitaet-analysieren`, §9) |
