# App-Doku (gespiegelt)

Kopien aus `ludwig/app` — **nicht hier bearbeiten**, sondern drüben, dann
`pnpm sync:ludwig`. Welche Dateien gespiegelt werden, steht in
`scripts/sync-ludwig.sh` (`DOCS_TO_MIRROR`).

Hier liegt nur, was **drüben** maßgeblich ist. Die Designsprache gehört
diesem Repo und steht in `docs/design-guidelines.md`.

| Datei | Was drinsteht |
|---|---|
| `GLOSSARY.md` | Das Namens-SSOT: je Begriff englischer und deutscher Name, Definition, Datentyp. **Maßgeblich für Props, Typnamen und UI-Labels** — ein neuer Prop-Name wird hier nachgeschlagen, nicht erfunden. |
| `web-ui.md` | Was von den Code-Regeln der Web-App fachlich ist. Die Design-Anteile (R2, R3, R4, R7, R9, R15, R18, R21) sind am 2026-09-03 hierher gezogen und stehen in `docs/web-ui-regeln.md` — drüben sind die Nummern Lücken. |

## Auch gespiegelt: die Status-Registry (0080)

Seit 2026-09-05 liegt neben der Doku ein **Code**-Spiegel:
`src/ludwig/ui/status/status-registry.ts`. Er kommt aus
`apps/web/src/ui/status/status-registry.ts` und ist die **einzige** Quelle für
Achsen, Labels, Farben und Erklärtexte jedes Status — dieses Repo hatte bis
dahin eine eigene Kopie, die schon gegabelt war.

- **Nicht hier bearbeiten.** Eine neue Achse entsteht drüben und kommt mit
  `pnpm sync:ludwig` herüber. Was das Set zusätzlich braucht, ist ein Befund
  in `docs/befunde-app.md` — so ist `beleg_erledigung` entstanden (L-41), die
  den Umzug bis zum 2026-09-05 aufgehalten hat.
- **Der Ordner `ui/status/` macht die Spiegelbarkeit nicht** — die
  Import-Freiheit macht sie. Die Datei hat drüben keinen einzigen Import.
- **`AXIS_LABEL`, `AXIS_SOURCE` und die Icons bleiben hier**
  (`src/ui/v3/patterns/entity-icons.ts`): sie sind Darstellung, nicht
  Wertebereich. Kommt drüben eine Achse dazu, meldet der Typcheck die Lücke —
  und die Texte werden **abgeschrieben, nicht erfunden** (Abnahme 0080, M1).

**Pfade darin zeigen auf die App**, nicht auf dieses Repo. Übersetzung:
`apps/web/src/ui/v2` → `src/ui/v3` hier, `src/styles/v2.css` → `src/styles/v3.css`.

## Beim nächsten Spiegellauf fällig

Der Spiegel ist bis zur Migration **eingefroren** (Owner-Entscheid
2026-09-07); die Marke steht in `src/ludwig/GESPIEGELT_AUS.json`. Drüben ist
seither Folgendes entstanden, das hier noch fehlt — kein Eilfall, sondern die
Liste für den Tag, an dem `pnpm sync:ludwig` wieder läuft:

| Was | Warum es hier fehlt | Wer wartet darauf |
|---|---|---|
| `CaseFilter.disposition` als `CaseDisposition` | drüben mit `566693d5` erledigt (L-212), hier noch der alte Stand | 0083 kann seine Einengung fallen lassen |
| Die zwei Mapper in `source-docs/domain/source-document-vm.ts` | neu drüben; ohne sie baut die Belegliste ihre Zellen weiter aus Rohfeldern | Seitenprofil `docs/seiten/belegliste.md`, „Vorbedingungen" |
| `bank-transactions/domain/bank-transaction-vm.ts` samt `statementLineFromAssignmentRow` | neu drüben (`a38b986a`) — die zweite Hälfte von **L-56**; die Auszugs-Query liefert je Sachverhalt Titel, Jahr, Gegenpart und Zustand als Achsen-Typen | 0099–0103: der lokale `BankTransactionCellData` kann damit fallen |
| `classOverriddenAt` und die drei `datevRef*` in `source-document-vm.ts` | drüben gebaut (`ae0e1a63`, L-217); **0120 führt sie bis dahin lokal** in `SourceDocumentVM` | beim Spiegeln fallen sie dort weg |
| `statementLineFromOpenRow` in `bank-transaction-vm.ts` | neu drüben (`7ce2912e`) — die offene Zeile trägt keinen Sachverhalt, keinen DATEV-Zustand, keine SEPA-Tags | 0086, `banks/offen` |
| `CaseHeaderVM.disposition` | angekündigt 2026-09-08, Commit folgt | die Sachverhaltsansicht liest die Zuständigkeit dann ohne Zusicherung |
| `not_run` in der Achse `bank_match_stage` | angekündigt 2026-09-08 (**L-218**), Commit folgt | 0101 und 0102 schreiben das Wort bis dahin selbst — zwei Stellen, ein Text |
| `SourceDocumentDetail` als Union, `completedVia` als Achse | **drüben gebaut 2026-09-08 (`bf9d8cfc`)**, hier noch nicht angekommen | 0074, 0076 — das Set löscht seine Kopie `source-document-detail.ts` beim Spiegeln. Achtung: `ContractBookingFact` kommt drüben über den Modul-Barrel `@/modules/contracts`, nicht über einen Deep-Import |
