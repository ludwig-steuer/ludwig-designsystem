---
name: v3-komponente
description: Eine Komponente im Ludwig Design System v3 bauen, ändern oder abnehmen. Use when adding or editing anything under src/ui/v3/, when asked "neue Komponente", "Baustein bauen", "Story ergänzen", "Komponente abnehmen/prüfen", or when a change touches primitives/patterns/entities. Trägt die Hausregeln zusammen, die sonst über vier Dokumente verstreut sind.
---

# v3-Komponente bauen, ändern, abnehmen

## Zuerst lesen

Nicht aus dem Gedächtnis arbeiten — die Wahrheit steht in vier Dateien:

| Frage | Datei |
|---|---|
| **Auftrag und Abnahmekriterien** | `docs/backlog/NNNN-<slug>.md` — fehlt die Spec, zuerst Skill `spec-schreiben` |
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
  MasterDetail, StepRail, TodoList.
- `src/ui/v3/entities/<entität>/` — Darstellungsfamilie **genau einer** Entität.

Primitives kennen keine Patterns, Patterns keine Entitäten. Fachliche
Zusammensetzungen wohnen im Modul der App, nicht hier.

**Eine Datei je Familie**, PascalCase, benannt wie die Familie: `Button.tsx`
(Button, KeyButton), `Table.tsx` (Card, Table, Row …). Kein Sammelbecken wie
ein `Surface.tsx` — wer die Komponente sucht, findet die Datei am Namen.

Export über `src/ui/v3/index.ts`. Die Komponente kennt **kein Fachmodul**:
Daten kommen als Props, Loader als Prop, keine Server Actions.

## Namen

**Code nur Englisch** (siehe `CLAUDE.md`): Bezeichner, Props, Typen,
Kommentare, JSDoc, Story-Exportnamen. Deutsch nur in Strings, die Nutzer
sehen. Fachbegriffe werden im `GLOSSARY.md` **nachgeschlagen, nicht
erfunden**: der englische Name in den Code, der deutsche ins UI — im Label
steht Kanzlei, Mandant, Kreditor, nicht Tenant, Client, Creditor. Fehlt ein
Begriff dort, ist das ein Befund — melden, nicht selbst einen erfinden.

Typen für Fachdaten kommen aus `src/ludwig/` (gespiegeltes Datenmodell),
nicht als lokale Neudefinition.

**Entitäten heißen Entität + Form**: `AccountField`, `KontoZeile`, `KontoKarte`,
`JournalEntryEditor`. Die Formen sind die aus `docs/ludwig/ui-repraesentationen.md`;
keine T-Shirt-Größe im Namen — die Größe folgt aus der Form:

| Größe | Formen |
|---|---|
| XS | Inline, Badge |
| S | Zeile, Auswahl, Kopf |
| M | Karte, Vorschau |
| L | Detail, Drawer, Liste |
| XL | Editor |

## Wann und nicht

Jeder Export trägt im JSDoc zwei Zeilen **auf Englisch** — der Fall, für den er
da ist, und der Nachbarfall mit Verweis. Das ist die Antwort auf „was nehme ich?", greppbar:

```ts
/**
 * Master-Detail: Liste links, Detail rechts.
 *
 * @when    Picking from a list, working on the selected item on the right.
 * @instead Single confirmation without a list → Dialog. Sequence of steps → StepRail.
 */
export function MasterDetail(…)
```

Vor dem Bauen: `grep -rn "@when" src/ui/v3` lesen. Steht der Fall schon da,
gibt es die Komponente schon.

## Werte

Kein Hex, kein Pixelmaß in der Komponente. Farben und Maße sind Tokens
(`var(--…)` aus `tokens.css`) oder Klassen aus `v3.css`. Braucht die
Komponente einen Wert, den es nicht gibt: Token ergänzen, nicht hart schreiben.

Status **nur** über die Registry (`src/ui/v3/patterns/status-registry.ts`) — keine
lokale Label-Map, kein eigener Status-Text.

## Story ist Pflicht

Jede Komponente bekommt `<Name>.stories.tsx` daneben, Titel
`v3/<Stufe>/<Gruppe>/<Name>`. Die Gruppe ist das Wort aus dem
Gruppen-Kommentar in `src/ui/v3/index.ts` — so zeigt der Storybook-Baum
dieselbe Ordnung wie der Barrel:

- Primitives: Aktion · Navigation · Formular · Dialog · Fläche · Tabelle
- Patterns: Arbeitsfläche · Rahmen · Prüfen · Prozess
- Entitäten: `v3/Entitäten/<Entität>/<Name>`

**Fünf Zustände** (V9, T6) — nicht nur der Happy Path:
gefüllt · leer · leer nach Filter · lädt · Fehler.

Storybook ist die Antwort auf „wovon gibt es v3?". Ein Pattern darf ohne
Story eingecheckt werden, gilt aber erst mit Story als abgenommen.

## Abnahme

Abgenommen wird **gegen die Spec** in `docs/backlog/`: jedes Kriterium
bekommt in der Tabelle „Abnahme" einen Nachweis — Story-ID, Befehl oder
Screenshot — und ein Ergebnis. Wer gebaut hat, nimmt nicht selbst ab; der
Abnehmende liest Spec und Code, nicht den Chat. Alles ✓ → Status `fertig`,
sonst zurück auf `in Arbeit` mit den offenen Punkten.

Der Abnehmende prüft zuerst die **Story-Deckung**: hat jede Prop der
Schnittstelle ihre Story, ist jeder ausgeschlossene Zustand begründet, stimmt
die Zahl mit der Ableitung (`spec-schreiben` §6) überein.

Die vollständige Gestaltungs-Prüfliste steht in `docs/design-guidelines.md`
§9 — dort durchgehen, nicht hier zusammenfassen.

Zwei ihrer Punkte gelten der App, nicht diesem Repo, und werden hier
übersprungen: „ersetzt ihr v1-Gegenstück (`@deprecated`)" und „in §11 auf v2
gesetzt". Beides wird fällig, wenn die App auf v3 migriert.

Die Punkte, die am häufigsten reißen:

- `@when`/`@instead` am Export, Datei nach der Familie benannt, Story im richtigen Ordner
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
