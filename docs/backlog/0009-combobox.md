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

- [ ] Pfeiltasten, Enter, Escape und Rücktaste verhalten sich wie beschrieben (Story `Interactive`, mit Tastatur geprüft)
- [ ] Ohne `onSearch` wird lokal gefiltert, mit `onSearch` nicht (Stories `Filled` und `ServerSearch`)
- [ ] „Kein Treffer" nennt einen Ausweg, ist nicht rot und kein Fehler (Story `NoMatch`)
- [ ] `error` erscheint als Text am Feld, nicht nur als Farbe (Story `Invalid`, Regel V7/I8)
- [ ] Das Label steht sichtbar über dem Feld, auch wenn `placeholder` gesetzt ist (Regel I8)
- [ ] `group` erzeugt Überschriften, ohne sie flache Liste (Story `Grouped`)
- [ ] Ersetzt `CreditorCombobox` ohne Funktionsverlust
- [ ] `AccountField` bleibt unverändert und grün — sein Umbau ist eine eigene Aufgabe

## Offene Fragen

1. Soll die Liste beim Fokus sofort aufgehen oder erst beim Tippen? *Ohne
   Antwort: sofort — bei 20 Optionen will man sie sehen, bei 800 hilft das
   Tippen ohnehin.*
2. Wie viele Treffer werden höchstens gezeigt? *Ohne Antwort: 50, mit einer
   Zeile „… und 340 weitere — Suchbegriff verfeinern."*
3. Braucht es eine Variante ohne `Field`-Rahmen (für Tabellenzellen)? *Ohne
   Antwort: nein — `AccountField` löst das heute selbst; wenn es beim Umbau
   nötig wird, ist das eine Prop dort.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
