# 0009 · Combobox

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, aus vielen Werten einen suchen ist fachfrei |
| Quelle | `docs/v3-backlog.md` — „Danach" (3 Eigenbauten neben `AccountField`) |
| Ersetzt | `KontoCombobox`, `CreditorCombobox`, `TaxKeySelect`; wird die Basis unter `AccountField` |
| Blockiert | jede Auswahl aus mehr als ~20 Werten (Kreditor, Steuerschlüssel, Konto) |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Ein Konto, ein Kreditor, ein Steuerschlüssel — die Auswahl hat hunderte
Einträge, ein `Select` reicht nicht. Heute gibt es dafür drei Eigenbauten und
`AccountField`, jeder mit eigener Tastatursteuerung, eigenem Ladeverhalten
und eigenem Verhalten bei „nichts gefunden".

## Einordnung

- **Wiederverwenden:** `Select` („Choice from a few fixed values") deckt
  kleine feste Mengen. `AccountField` („Choosing an account, with candidates
  from agent, partner, similar and document line") ist die **Konto-Ausprägung**
  genau dieser Mechanik — mit Herkunftsgruppen, die nur für Konten gelten.
  `SearchInput` sucht in einer Karte, wählt aber nichts aus.
- **Neu, weil:** Regel 3 — kein `@when` deckt die fachfreie Auswahl mit Suche;
  drei belegte Eigenbauten plus `AccountField`, das darauf aufsetzen soll.
- **Zuschnitt:** eine Datei, ein Export.
- **Setzt auf:** `Field` (Label, Hinweis, Fehler aus `Form.tsx`).

**Verhältnis zu `AccountField`:** `AccountField` bleibt, wird aber zur
Ausprägung — es liefert `Combobox` seine Kandidaten samt Herkunftsgruppen und
behält seine `@when`-Zeile. Diese Aufgabe baut die Basis; der Umbau von
`AccountField` darauf ist eine eigene Aufgabe, damit sein Verhalten
unverändert nachweisbar bleibt.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `label` | `string` | ja | Sichtbar über dem Feld, nie nur Placeholder (I8) | `Filled` |
| `value` | `string \| null` | ja | Der gewählte Schlüssel | `Filled` |
| `onChange` | `(value: string \| null) => void` | ja | Auswahl oder Leeren | `Interactive` |
| `options` | `ComboboxOption[]` | ja | `{ value, label, hint?, group? }` | `Filled` |
| `onSearch` | `(query: string) => void` | nein | Für serverseitige Suche; ohne die Prop wird lokal gefiltert | `ServerSearch` |
| `loading` | `boolean` | nein | Während `onSearch` lädt | `Loading` |
| `placeholder` | `string` | nein | Hinweis im leeren Feld, ersetzt kein Label | `Filled` |
| `hint` | `ReactNode` | nein | Erklärung unter dem Feld | `Filled` |
| `error` | `string` | nein | Fehlertext am Feld, nicht nur Farbe (V7, I8) | `Invalid` |
| `emptyText` | `string` | nein | Wenn nichts passt; Standard „Kein Treffer." | `NoMatch` |
| `disabled` | `boolean` | nein | | `Invalid` |

Typen: `ComboboxOption` ist fachfrei und wird hier definiert. Fachliche
Kandidaten (z. B. `AccountCandidate` aus `AccountField`) werden vom Aufrufer
darauf abgebildet.

**Kann bewusst nicht:** Mehrfachauswahl, freie Eingabe außerhalb der Optionen,
neue Werte anlegen, sich merken was zuletzt gewählt war. Wer mehrere braucht,
hat einen Filter-Fall (`FilterChips`).

## Verhalten

`"use client"` — Suchtext, offene Liste und Tastaturnavigation sind Zustand.

- **Tastatur, der Hauptweg:** Tippen filtert; Pfeil runter/hoch wandert durch
  die Treffer; Enter wählt den hervorgehobenen; Escape schließt ohne Auswahl;
  Rücktaste im leeren Feld leert die Auswahl. Die Zielgruppe arbeitet mit der
  Tastatur (V11).
- **Gruppen:** `option.group` fasst Treffer unter einer Überschrift zusammen —
  so wie `AccountField` seine Herkünfte zeigt. Ohne `group` eine flache Liste.
- **Zustände:** gefüllt · leer (nichts getippt, alle Optionen) · kein Treffer
  (mit `emptyText`) · lädt (`loading`) · Fehler (`error` am Feld). Alle fünf
  sind hier anwendbar — das ist die vollständige Reihe aus V9/T6.
- **Hover** auf jedem Treffer (§2); der hervorgehobene ist zusätzlich am Wort
  erkennbar, nicht nur an der Fläche.
- **Kein Treffer** ist kein Fehler: der Text sagt, was hilft („Kein Treffer —
  Suchbegriff kürzen.").

## Stories

Titel `v3/Primitives/Formular/Combobox`. Abgeleitet nach §6: 5 Zustände
+ 0 Enums + 0 Layout-Booleans + 1 Callback (`onChange`) + 1 „im Einsatz"
+ 1 Rand (Gruppen, viele Optionen) = 8.

| Story | Beweist |
|---|---|
| `Filled` | Auswahl getroffen, Label und Hinweis sichtbar |
| `Empty` | nichts gewählt, alle Optionen offen |
| `NoMatch` | Suchbegriff ohne Treffer, mit Ausweg im Text |
| `Loading` | serverseitige Suche läuft |
| `Invalid` | Fehlertext am Feld |
| `Interactive` | Rundlauf über `onChange`, Tastaturweg vorgeführt |
| `Grouped` | Treffer unter Herkunfts-Überschriften, wie bei Konten |
| `InUse` | in einem Formular neben `Field` und `Select` |

Nicht anwendbar: keine — alle fünf Zustände treffen zu.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Pfeiltasten, Enter, Escape und Rücktaste verhalten sich wie beschrieben | `v3-primitives-formular-combobox--interactive`, mit echter Tastatur: „tele" tippen → ein Treffer; ↓ wandert (6× ↓ → „1600 · Verbindlichkeiten" hervorgehoben); Enter wählt („Gewählt: 6805", Liste zu); Escape schließt ohne Auswahl; Rücktaste im leeren Feld setzt auf „Gewählt: nichts" | ✓ |
| Ohne `onSearch` wird lokal gefiltert, mit `onSearch` nicht | `--interactive` (ohne `onSearch`): „tele" filtert 7 → 1 Option im DOM. `Combobox.tsx:87` gibt bei gesetztem `onSearch` unverändert `options` zurück; `--server-search` liefert die Treffer von außen nach | ✓ |
| „Kein Treffer" nennt einen Ausweg, ist nicht rot und kein Fehler | `--no-match`: `.v2cmb__empty` = „Kein Treffer — Suchbegriff kürzen.", Farbe `rgb(113,113,113)` (`--color-text-subtle`), nicht `--color-danger` (`#A8403C`) | ✓ |
| `error` erscheint als Text am Feld, nicht nur als Farbe (V7/I8) | `--invalid`: `.v2field__err` = „Ohne Gegenkonto lässt sich der Satz nicht buchen."; das zweite Feld ist `disabled` | ✓ |
| Label steht sichtbar über dem Feld, auch mit `placeholder` (I8) | `--filled`: `.v2field__label` „Gegenkonto" liegt über dem Feld (Rechteck-Vergleich), `for="konto"` ↔ `id="konto"`, `placeholder="Nummer oder Name"` daneben | ✓ |
| `group` erzeugt Überschriften, ohne sie flache Liste (Story `Grouped`) | Die Story `Grouped` **fehlt**; gebaut wurden acht Stories, aber `ServerSearch` (in der Spec nur in der Schnittstellen-Tabelle genannt) an ihrer Stelle. Überschriften sind belegt (`--interactive`: „Zuletzt gebucht", „Vorschlag des Agenten", „Alle Konten"), der flache Fall — Optionen **ohne** `group` — kommt in keiner Story vor | ✗ |
| Ersetzt `CreditorCombobox` ohne Funktionsverlust | Vergleich mit `app/apps/web/src/modules/business-partners/ui/CreditorCombobox.tsx`: Feld, Liste, Wechsel Suchtext↔Auswahl, Ladezustand und Leertext sind gedeckt, die Tastatursteuerung kommt neu hinzu. Es fehlen die **Entprellung** (180 ms) und der **Wettlauf-Schutz** (`reqId`) des Originals: `onSearch` feuert je Tastendruck, und eine späte Antwort kann eine frühere überschreiben | ✗ |
| `AccountField` bleibt unverändert und grün | `git log -- src/ui/v3/entities/account/AccountField.tsx` → letzter Commit `9bf1291` (Umbenennung 0001), kein Eingriff aus dieser Runde; `git status` zeigt nur `docs/backlog/*` | ✓ |
| `pnpm typecheck` / `pnpm build` | beide grün | ✓ |

**Nachprüfung der Behebung** (fremder Prüfer, 2026-09-03): Der hervorgehobene Treffer bleibt beim Wandern im Sichtfeld (acht ArrowDown-Schritte, `scrollTop` 0 bis 26, jedes Mal vollständig sichtbar); Story `Grouped` zeigt den flachen Fall ohne `group` (7 Optionen, 0 Gruppenköpfe).

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte:
(1) Story `Grouped` nachziehen — eine Liste **ohne** `group` neben einer mit,
sonst ist „ohne sie flache Liste" unbelegt. (2) Entprellung und Wettlauf-Schutz
für `onSearch` entscheiden: in die `Combobox` holen oder in der Spec als Sache
des Aufrufers festschreiben. (3) Der hervorgehobene Treffer wird nicht in Sicht
gescrollt: bei sieben Optionen steht Nummer 7 nach dem letzten ↓ unterhalb der
Blende (`scrollTop` bleibt 0) — bei den in Offene Frage 2 vorgesehenen 50
Treffern läuft die Tastaturführung damit blind. (4) Offene Frage 2 („höchstens
50, dazu eine Zeile ‚… und N weitere'") ist nicht umgesetzt: es wird ungekürzt
alles gezeigt. (5) `role="listbox"`/`role="option"` ohne `aria-activedescendant`
— Screenreader erfahren den hervorgehobenen Treffer nicht.
