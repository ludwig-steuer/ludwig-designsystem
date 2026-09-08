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
`JournalEntryEditor`. Die Formen sind die aus `docs/ui-repraesentationen.md`;
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

Eine Abnahme **trägt in die Tabelle ein und ändert nie die Abnahmekriterien**:
ein fehlendes oder unprüfbares Kriterium ist ein Mangel der Spec, der als
Zeile in der Tabelle steht, kein Grund, die Liste zu kürzen (Owner-Regel
2026-09-06, nach Commit `64fbe27`, der zwölf Specs ihre Kriterien nahm). Und
gemessen wird die **Wirkung, nicht die Behauptung**: `getBoundingClientRect`
statt `getComputedStyle` auf einem selbst gesetzten Stil, die Lage des
Textes in der Zelle statt nur der Spurkanten, bei vier Breiten (700, 1100,
1400, 1920 px). Ein Layout-Kriterium, das nur im Story-Rahmen gemessen wird,
misst die Fixture: gemessen wird in der Story „im Einsatz" bei der Breite,
die der Baustein auf der Seite hat (Karte, Drawer, Reiter), nicht bei der des
Story-Rahmens — deshalb ist „im Einsatz" ein fester Summand der
Story-Ableitung (`spec-schreiben` §6) und keine Kür (0071, 2026-09-07).

### Zwei Tiefen: schlank und gemessen

Seit dem 2026-09-08 gilt für die laufende Welle die **schlanke Abnahme**. Sie
prüft die **Schnittstelle**, nicht die Darstellung — Grund: die App zieht in
einem Zug nach, wenn das Set steht. Ändert sich später eine Farbe, kostet das
eine CSS-Zeile; ändert sich eine Prop, kostet es jede Aufrufstelle drüben.

**Die schlanke Abnahme prüft:**

- jede Prop gegen die Schnittstelle der Spec — Typ, Pflicht, Vorgabe
- Typen aus `src/ludwig/`, keine lokale Neudefinition, keine `as`-Zusicherung
- `@when`/`@instead` an jedem Export, Datei nach der Familie benannt
- Story-Deckung: jede Prop ihre Story, jeder ausgeschlossene Zustand begründet
- Status nur über die Registry, keine lokale Label-Map, kein Hex, kein px
- die sechs Wächter über den **Exit-Code**, dazu ihre Selbstprüfungen (`--test`)
- dass jede Story im Browser etwas zeigt und nichts in die Konsole schreibt

Dafür genügt Lesen plus **ein** Durchlauf über die Stories; CDP-Messungen
braucht sie nicht.

**Vertagt nach `docs/backlog/0119-visuelle-pruefung-nachholen.md`:** Maße,
Kontraste, Trefferflächen, Hover, Fokus, Tastaturwege — alles, was an vier
Breiten gemessen wird. Wer eine schlanke Abnahme schreibt, vermerkt sie als
**„schlanke Abnahme (Schnittstelle)"**, damit 0119 sie wiederfindet.

Das ist keine Absenkung des Anspruchs, sondern eine Reihenfolge: die gemessene
Prüfung hat in den ersten drei Wellen zwei Wurzelfehler gefunden, die das ganze
Set betrafen. Solche Funde kommen wieder — sie kommen nur später.

### Womit gemessen wird

`scripts/cdp.mjs` — **der Helfer aus dem Repo, keine eigene Kopie.** Er
startet einen Messbrowser gegen den laufenden Dev-Server (Port 6107), wählt
seinen Port selbst und räumt sich ab, auch wenn das Messskript mitten in der
Messung wirft:

```js
import { launch, Session, url } from "../../scripts/cdp.mjs";
await launch();
const s = await Session.open();
await s.goto(url("v3-primitives-fläche-markdown--filled"));
await s.resize(1400);
console.log(await s.eval(`return document.title`));
```

Warum das eine Regel ist und keine Bequemlichkeit: bis zum 2026-09-07 hatte
jeder Prüfer seine eigene Kopie, und jede ließ ihren Browser stehen, sobald
ein Skript vor dem Aufräumen abbrach. Gezählt wurden an einem Tag **388
Prozesse mit 38 GB** — die Maschine ging in die Knie und nahm die fünf Prüfer
einer ganzen Welle mitsamt ihrer Arbeit mit. Auf ein Hauptfenster kommen rund
zwei Dutzend Renderer, die ihren Vater überleben.

Dazu drei Gewohnheiten:

- **Ein Browser für alle Messungen** einer Abnahme, nicht einer je Skript:
  ein Messskript, das die Stories nacheinander abfährt, statt zehn kleiner.
- `pnpm cdp:clean`, wenn unklar ist, ob etwas hängen blieb.
- **Wer im Arbeitsbaum misst, baut nicht.** `pnpm build` leert
  `storybook-static/` unter allen anderen weg; er läuft **je Welle bei genau
  einem** Prüfer in einem eigenen `git worktree` (Owner-Entscheid 2026-09-07,
  Befund 0117).

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
