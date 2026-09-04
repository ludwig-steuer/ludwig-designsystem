# 0062 · `AccountRow` + `AccountList` — der Kontenplan als Liste

| | |
|---|---|
| Status | offen |
| Stufe | `entities/account/` (Zeile) + Spaltendefinition auf `DataTable` (Liste) |
| Quelle | Entitätsprofil `docs/entitaeten/account.md`, Abschnitte „Listen" (Zeile `AccountList` „Kontenplan") und „Formen" |
| Auftrag | Die Zeile eines Kontos im Kontenrahmen (Nummer, Name, Rolle, Buchungszahl, Kontostatus) und die Liste, die sie zeigt — nach Klasse gruppiert, 41.570 Zeilen je Mandant und Jahr. Ersetzt `AccountsTable`, `AccountsTableHeader`, `AccountsTableRow` und `AccountsGroupedTable` in `ludwig/app`. |
| Vertagt, weil | Die Liste hat eine **eigene Route** (`/clients/[slug]/[year]/accounts`) und braucht nach `docs/backlog/README.md` Schritt 0b erst ein Seitenprofil unter `docs/seiten/`. Sie wird außerdem eine **Spaltendefinition auf `DataTable`** (0057), nicht eine eigene Tabelle — 0057 steht auf `in Arbeit`. Kein Screen der laufenden Welle braucht sie: der Kontoauszug im Drawer ist eine andere Liste. |
| Setzt voraus | 0057 `DataTable` (Abnahme) · Seitenprofil `docs/seiten/kontenplan.md` · `AccountCell` aus der Konto-Welle |
| Angelegt von / am | Claude, 2026-09-04 (Skill `entitaet-analysieren`, §9) |
