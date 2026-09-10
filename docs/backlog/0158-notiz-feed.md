# 0158 · NoteFeed — Notizen an einem Vorgang

| | |
|---|---|
| Status | **gebaut 2026-09-10** — Abnahme offen (nicht durch den Bauenden) |
| Stufe | `patterns/NoteFeed.tsx` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, sobald dort jemand etwas an einem Vorgang festhält; kein Fachwort in Props oder Texten |
| Quelle | **Owner-Feedback 2026-09-10** zur Sachverhaltsseite (0152 Welle 1): „die Notizen-Ansicht verschwendet Platz — `[vor wann] · [wer]`, darunter der Text in anderer Schrift, dazu „Notiz hinzufügen" mit ausklappendem Feld, als eigene Unterkomponente" |
| Ersetzt | die Notizen-Karte der Seiten-Stories von 0152 (vorher `Timeline` mit Datumsspalte) |
| Blockiert | 0152 Welle 2 (jede Ausprägung hat Spalte 3) · 0157 (die Kontoseite hat keine Notizen, aber denselben Randspalten-Schnitt) |
| Spec von / am | Claude, 2026-09-10 — **nachträglich**: gebaut wurde im Feedback-Durchgang, die Datei folgt, weil eine Nummer im Code ohne Datei ein toter Verweis ist (Lehre aus 0155) |

## Ziel

Die Sachbearbeiterin liest in der Randspalte, was zu einem Vorgang gesagt
wurde — vom Mandanten, von der Kanzlei, vom Agenten —, und schreibt selbst
etwas dazu, ohne die Seite zu verlassen. Heute stand dort eine Timeline mit
Datumsspalte: in 370 px nahm das Datum ein Drittel der Breite für sechs
Zeichen, und der Text brach nach vier Wörtern um.

## Einordnung

- **Wiederverwenden:** `Timeline` (@when: Fachverlauf mit Datum je Zeile) —
  zeigt Ereignisse, keine Äußerungen, und hat kein Eingabefeld. `LogList`
  (Prüfspur mit Akteur und Aktion) — ist die Frage „wer hat was geklickt",
  nicht „wer hat was gesagt". `ClarificationCard` — erwartet eine Antwort;
  eine Notiz erwartet keine.
- **Neu, weil:** `spec-schreiben` §3 Regel 4 — die Komposition trägt eigenen
  Zustand (Feld zu/auf, Entwurf, Speichern läuft, Fehler) und kommt auf zwei
  Screens vor (Sachverhalt, Beleg-Detail der App hat dieselbe Notizkarte).
- **Zuschnitt:** eine Datei, ein Export. `"use client"` wegen des Zustands.
- **Setzt auf:** `Button`, `TextButton`, `formatTime` (`relative`, `dateTime`).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `notes` | `readonly Note[]` | ja | neueste oben — die Reihenfolge gehört dem Aufrufer (E2) | `Filled` |
| `onAdd` | `(text) => void \| Promise<void>` | nein | ohne Callback **kein** Knopf (A12). Liefert er ein Promise, bleibt der Text im Feld, bis es erfüllt ist; bei Ablehnung bleibt er stehen und eine Meldung erscheint | `Interactive`, `SaveFails` |
| `addLabel` | `string` | nein | Wortlaut des Knopfs, Vorgabe „Notiz hinzufügen" | `InUse` |
| `placeholder` | `string` | nein | Platzhalter im Feld | `Interactive` |
| `empty` | `ReactNode` | nein | Leertext, Vorgabe „Noch keine Notiz." | `Empty` |

`Note`: `id`, `at` (ISO-Zeitstempel), `author?` („Mandant", „Kanzlei",
„Agent"), `text`. Kein Typ aus `src/ludwig/` — die App hat für Notizen heute
kein gemeinsames Modell (Sachverhalt: `note`-Klärungen, Beleg: eigene Spalte);
der Typ ist die kleinste gemeinsame Form und bewusst flach.

**Kann bewusst nicht:** bearbeiten und löschen (keine Anfrage, kein Screen),
Anhänge, Erwähnungen. Die Zeit ist relativ innerhalb einer Woche, danach
das Datum (die Regel von `formatTime`, nicht dieser Komponente); Datum und
Uhrzeit stehen immer im `title`.

## Verhalten

- Zwei Zeilen je Notiz: Beischrift `vor 3 Tagen · Mandant` (`--fs-ui-xs`),
  darunter der Text in der Standardstufe (`--fs-ui`) — der Größenunterschied
  **ist** die Trennung, eine Linie braucht es nicht.
- „Notiz hinzufügen" klappt das Feld auf und setzt den Fokus hinein;
  „Abbrechen" verwirft den Entwurf. „Speichern" ist gesperrt, solange nur
  Leerraum im Feld steht.
- **Kein Datenverlust beim Speichern:** Liefert `onAdd` ein Promise, zeigt
  der Knopf den Ladezustand, und Feld wie Text bleiben stehen, bis es
  erfüllt ist. Wird es abgelehnt, bleibt der Text im Feld und darunter steht
  „Die Notiz wurde nicht gespeichert. Ihr Text steht noch im Feld."
- Client-Component (Zustand).

## Stories

Titel `v3/Patterns/Arbeitsfläche/NoteFeed`. Ableitung: gefüllt + leer (2) +
1 Callback (`Interactive`) + Lade-/Fehlerfall des Callbacks (`SaveFails`) +
im Einsatz (`InUse`) + Rand (`Edge`: lange Texte, viele Notizen, alle
Zeitstufen) = **6**.

| Story | Beweist |
|---|---|
| `Filled` | drei Notizen, **ohne** `onAdd` — kein Knopf |
| `Empty` | Leertext mit Knopf |
| `Interactive` | Rundlauf: aufklappen, schreiben, speichern, oben erscheint die Notiz |
| `SaveFails` | Promise wird abgelehnt: Text bleibt, Meldung erscheint |
| `InUse` | in einer Karte, 370 px — so wie in Spalte 3 des Sachverhalts |
| `Edge` | ein 600-Zeichen-Text mit einer Referenz ohne Leerzeichen, zwölf Notizen, von „in dieser Minute" bis zu Daten zwei Jahre zurück |

Nicht anwendbar: **leer nach Filter** (die Komponente filtert nicht) · **lädt
als Ganzes** (die Notizen kommen als Prop; der Ladezustand der Liste gehört
dem Aufrufer, der die Karte zeichnet).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Notiz bearbeiten / löschen | `onEdit?`, `onDelete?` je Notiz | ein Screen fragt danach |
| Nur die letzten n, Rest hinter „alle" | `max?` + `moreHref?` | ein Vorgang mit mehr als ~10 Notizen in der Randspalte (0152 Welle 3, S-Szenarien) |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Ohne `onAdd` kein Knopf, kein Feld (`Filled`)
- [ ] Beischrift und Text in zwei Stufen des Arbeitsregisters, gemessen: `--fs-ui-xs` über `--fs-ui` (`InUse`)
- [ ] Die Zeit ist relativ innerhalb einer Woche, danach ein Datum; Datum und Uhrzeit stehen im `title` (`Filled`, `Edge`)
- [ ] Speichern mit nur Leerraum ist gesperrt (`Interactive`)
- [ ] Abgelehntes Speichern lässt den Text im Feld und zeigt die Meldung (`SaveFails`)
- [ ] In 370 px kein waagerechter Überlauf, auch bei 600 Zeichen (`InUse`, `Edge`)
- [ ] Ersetzt die Notizen-Karte in `src/showcase/sachverhalt/` ohne Funktionsverlust

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | |

Abgenommen von / am: … · Offene Punkte: …
