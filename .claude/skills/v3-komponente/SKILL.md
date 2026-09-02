---
name: v3-komponente
description: Eine Komponente im Ludwig Design System v3 bauen, ändern oder abnehmen. Use when adding or editing anything under src/ui/v3/, when asked "neue Komponente", "Baustein bauen", "Story ergänzen", "Komponente abnehmen/prüfen", or when a change touches primitives/patterns/entities. Trägt die Hausregeln zusammen, die sonst über vier Dokumente verstreut sind.
---

# v3-Komponente bauen, ändern, abnehmen

## Zuerst lesen

Nicht aus dem Gedächtnis arbeiten — die Wahrheit steht in vier Dateien:

| Frage | Datei |
|---|---|
| Gestaltungsregel (V/L/T/Z/I) | `docs/design-guidelines.md` |
| Ton, verbotene Wörter | `docs/ton-und-sprache.md` |
| **Wie heißt das Ding?** | `docs/ludwig/GLOSSARY.md` |
| Code-Regel der Web-App | `docs/ludwig/web-ui.md` (R21 = die Dreiteilung) |

Bei Widerspruch gilt: Code (`src/styles/tokens.css`, `v3.css`,
`status-registry.ts`) **vor** `design-guidelines.md` **vor** allem anderen.

## Wohin sie gehört

Drei Stufen, Importe **nur abwärts**:

- `src/ui/v3/primitives/` — kein Fachwort. Button, Table, Field, Dialog.
- `src/ui/v3/patterns/` — Arbeitsflächen-Muster, kennt Prozessbegriffe.
  MasterDetail, SchrittRail, TodoListe.
- `src/ui/v3/entities/<entität>/` — Darstellungsfamilie **genau einer** Entität.

Primitives kennen keine Patterns, Patterns keine Entitäten. Fachliche
Zusammensetzungen wohnen im Modul der App, nicht hier.

Export über `src/ui/v3/index.ts`. Die Komponente kennt **kein Fachmodul**:
Daten kommen als Props, Loader als Prop, keine Server Actions.

## Namen

Prop-, Typ- und Label-Namen werden im `GLOSSARY.md` **nachgeschlagen, nicht
erfunden**. Kanzlei statt Tenant, Mandant statt Client, Kreditor statt
Creditor. Fehlt ein Begriff dort, ist das ein Befund — melden, nicht selbst
einen erfinden.

Typen für Fachdaten kommen aus `src/ludwig/` (gespiegeltes Datenmodell),
nicht als lokale Neudefinition.

## Werte

Kein Hex, kein Pixelmaß in der Komponente. Farben und Maße sind Tokens
(`var(--…)` aus `tokens.css`) oder Klassen aus `v3.css`. Braucht die
Komponente einen Wert, den es nicht gibt: Token ergänzen, nicht hart schreiben.

Status **nur** über die Registry (`src/ui/status/status-registry.ts`) — keine
lokale Label-Map, kein eigener Status-Text.

## Story ist Pflicht

Jede Komponente bekommt `<Name>.stories.tsx` daneben, Titel
`v3/Primitives|Patterns|Entitäten/<Entität>/<Name>`.

**Fünf Zustände** (V9, T6) — nicht nur der Happy Path:
gefüllt · leer · leer nach Filter · lädt · Fehler.

Storybook ist die Antwort auf „wovon gibt es v3?". Was keine Story hat,
existiert für das Design-System nicht.

## Abnahme

Die vollständige Prüfliste steht in `docs/design-guidelines.md` §9 — beim
Abnehmen dort durchgehen, nicht hier zusammenfassen.

Zwei ihrer Punkte gelten der App, nicht diesem Repo, und werden hier
übersprungen: „ersetzt ihr v1-Gegenstück (`@deprecated`)" und „in §11 auf v2
gesetzt". Beides wird fällig, wenn die App auf v3 migriert.

Die Punkte, die am häufigsten reißen:

- Text links, Zahlen rechts mit `tnum`, nichts zentriert (V3)
- Farbe nur als Kritikalitätsstufe; Rot **nur** Fehler; Vorzeichen ohne Farbe
- Jeder farbige Zustand hat zusätzlich Wort oder Icon (V7)
- Kein Icon ohne Wort; Hauptweg per Tastatur, Taste sichtbar (V11, V14, T8)
- Icons Lucide 1.5 px; keine Emoji, keine Versalien
- Karte: Rand **oder** Schatten, nicht beides
- Texte: Sie, Imperativ auf Buttons, GLOSSARY-Begriffe (T1–T5)

## Fertig ist es, wenn

```bash
pnpm typecheck        # muss grün sein
pnpm storybook        # Port 6107
```

Und die Story im Browser **angesehen** wurde. Ein grüner Build sagt nichts
darüber, ob die Komponente gestylt rendert — genau dort fällt auf, wenn ein
Token fehlt oder eine Klasse nicht greift.
