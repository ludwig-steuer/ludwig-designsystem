# 0113 · `JournalEntryGrid` — das Lese-Raster aus dem Editor lösen

| | |
|---|---|
| Status | offen |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | nein — Buchungssatz, BU, Belegfeld sind Fachbegriffe |
| Quelle | `docs/backlog/0015-journal-entry-editor-f109.md`, Abschnitt „Stories — 17, mit begründeter Ausnahme"; Abnahme 0015 vom 2026-09-07, Mangel M10 |
| Auftrag | `JournalEntryEditor` in zwei Bausteine schneiden: **`JournalEntryGrid`** (lesend) und `JournalEntryEditor` (bearbeitend). Damit endet die Story-Ausnahme von 0015 — heute 17 Stories, nach dem Schnitt 8 lesend und 9 bearbeitend, beide unter der Grenze von 10. |
| Vertagt, weil | 0015 hatte drei benannte Nachträge; ein Schnitt derselben Datei in derselben Runde hätte beides unprüfbar gemacht. |
| Angelegt von / am | Claude, 2026-09-07 (aus der Abnahme von 0015) |

## Warum

`spec-schreiben` §4 nennt den Grund wörtlich: **„ein Teil braucht `"use
client"`, der Rest nicht"**. Sieben der 14 alten Stories laufen mit
`editable={false}`; sie zeigen ein Raster, das nichts entgegennimmt. Der
Editor daneben ist eine Client-Insel mit Zustand für Zeilen, Modus, Journal,
Storno und Grund.

## Was der Schnitt lösen muss

Die Abnahme hat einen Einwand mitgegeben, der hier steht, damit ihn niemand
übersieht: **die Lese-Ansicht verliert ihren Client-Anteil nicht von selbst.**
Zwei Zustände leben auch dort:

- der **Modus-Umschalter** (`mode`, „Einfach ◂ / Voll ▸") — auflösbar als
  zwei Server-Varianten über die URL, oder als eigene kleine Client-Insel;
- die **Journal-Klappe** (`journalOffen`) — auflösbar als `<details>`, das
  keinen React-Zustand braucht.

Solange beides nicht entschieden ist, ist `JournalEntryGrid` keine
Server-Komponente, sondern nur eine kleinere Client-Komponente — und dann
trägt die Begründung des Schnitts nur zur Hälfte.

## Was aus der 0015-Abnahme mitkommt

Vier Punkte, die dort gemessen und bewusst hierher verwiesen wurden:

| Punkt | Was zu tun ist |
|---|---|
| M5 | `Alt+V` steht im Lese-Raster am Knopf und wirkt dort nicht (`if (!editable) return;`) — Taste binden oder nicht drucken (V14) |
| M6 | `STATUS_TEXT` ist eine lokale Label-Map (R1) und liefert in `S19` den **falschen** Tooltip: auf dem Sichtwechsel-Knopf steht „Vorschlag" |
| M12 | `▤` als Unicode-Icon im Lese-Raster, während das Bearbeiten-Raster `ActionIcon action="ledger"` nutzt (§9/A8) |
| M16 | die deutschen Bezeichner der Altteile (`gegenkonto`, `Kopf`, `Zeile`, `summeBelegseite`) — die Datei wird ohnehin angefasst, also nach CLAUDE.md fällig |

Dazu die Story-Deckung, die 0015 offenlässt: `onOpenTaxKey` und
`quickActions` haben heute keine Story, weil die Datei mit 17 Stories schon
über der Grenze liegt. Nach dem Schnitt passen beide ins Bearbeiten-Raster.

## Ausbau

| Was fehlt | Woran man merkt, dass es Zeit ist |
|---|---|
| Der Schnitt selbst | sobald 0015 abgenommen ist und die App das Lese-Raster an einer Stelle ohne Editor braucht (Sachverhaltsseite, Stapel-Prüfung) |
