# App-Doku (gespiegelt)

> **Diese Datei wird bei jedem Lauf neu geschrieben** (`sync-ludwig.sh` macht
> `rm -rf docs/ludwig`). Notizen gehören deshalb nicht hierher, sondern nach
> `docs/spiegel-vormerkungen.md` — dort steht, was beim nächsten Lauf fällig
> ist.

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
