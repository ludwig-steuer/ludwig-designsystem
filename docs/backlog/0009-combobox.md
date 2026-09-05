# 0009 · Combobox

| | |
|---|---|
| Status | fertig |
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

> Wiederhergestellt am 2026-09-05. Commit `64fbe27` („Abnahme B und C") hatte
> diesen Abschnitt und die „Offenen Fragen" beim Eintragen der Abnahme-Tabelle
> mitgelöscht; ohne sie ist die Aufgabe nicht abnehmbar. Text unverändert aus
> `git show 703a0ab:docs/backlog/0009-combobox.md`.

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

Zweite Abnahme (fremder Prüfer, 2026-09-05), Tabelle neu geschrieben.
Storybook Port 6107, Chromium 1440×900; getippt und mit den Pfeiltasten
gewählt, nicht nur gelesen.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, Exit 0, zu Beginn und am Ende. `pnpm build` bewusst nicht gestartet (schreibt nach `storybook-static`, parallele Abnahmen); zitiert wird der grüne Lauf für diesen Stand: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/Combobox.tsx` neben `Combobox.stories.tsx`; `Combobox.stories.tsx:7` = `v3/Primitives/Formular/Combobox` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Exporte: `ComboboxOption` (Interface, jedes Feld mit englischem JSDoc) und `Combobox` (`Combobox.tsx:35`) mit `@when`/`@instead` in `:30–34`. Bezeichner, Kommentare und JSDoc durchgängig englisch; Deutsch nur in den Nutzer-Strings (`emptyText`, „Suche läuft …") | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\b\|[0-9]+px\|fontSize" src/ui/v3/primitives/Combobox.tsx` → keine Zeile. Die einzigen Zahlen sind die Rechenwerte von `useLayoutEffect` (`r.bottom + 4`, `r.left`, `r.width`), mit denen die Liste unter dem Feld fixiert wird — ohne sie schnitte das `overflow` der `Card` sie ab (`--in-use` belegt das). Kein Status im Baustein | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--grouped`, `--empty`, `--no-match`, `--server-search`, `--loading`, `--invalid`, `--interactive`, `--in-use` — die acht der Ableitung plus `ServerSearch`, das in der Schnittstellen-Tabelle als Nachweis für `onSearch` genannt ist. „Nicht anwendbar: keine" ist begründet, alle fünf Zustände sind da | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Hover auf jedem Treffer; der hervorgehobene ist zusätzlich fett gesetzt, nicht nur farbig (V7). Fehler als Text am Feld (V7/I8), Label sichtbar (I8), Feldrand `--color-border-control` über `.v2in`. Text links, nichts zentriert. Keine Transition in `.v2cmb*`. Icon: `svg.lucide-check`, `width 12`, `stroke-width 1.5`, `aria-hidden` über die Registry. Kein Emoji, kein Unicode-Zeichen. **Ein Befund, der nicht dieser Komponente gehört:** `.v2field__label` (`v3.css:856`) setzt `text-transform: uppercase`, das Label steht also als „GEGENKONTO" — A2 verlangt normale Schreibweise. Die Klasse gehört `Form.tsx`, nicht `Combobox`, und dieselbe Regel steht an 17 Stellen in `v3.css`; das ist eine eigene Aufgabe fürs Set | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle neun Stories geöffnet; in `--interactive` getippt, mit ↓/↑ gewandert, mit Enter gewählt, mit Escape geschlossen, mit der Rücktaste geleert | ✓ |

**Variabel**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Pfeiltasten, Enter, Escape und Rücktaste verhalten sich wie beschrieben | `--interactive`, echte Tastatur. Fokus öffnet die Liste (7 Optionen, 3 Gruppenköpfe). „tele" tippen → 1 Treffer. Escape → Liste zu, „Gewählt: nichts". ↓↓↓↓ wandert 6815 → 6805 → 6320 → 4980, ↑ geht zurück auf 6320; Enter wählt („Gewählt: 6320", Feld „6320 · Miete Geschäftsräume", Liste zu). Feld leer tippen und Rücktaste → „Gewählt: nichts". Der hervorgehobene Treffer bleibt beim Wandern im Sichtfeld (sieben ↓, `scrollTop` 0 → 25, jedes Mal vollständig innerhalb der Blende) — der 2026-09-03 offene Punkt (3) ist damit belegt (`Combobox.tsx:84–86`) | ✓ |
| Ohne `onSearch` wird lokal gefiltert, mit `onSearch` nicht | `--interactive` (ohne `onSearch`): „tele" filtert 7 → 1 Option im DOM. `Combobox.tsx:93` gibt bei gesetztem `onSearch` unverändert `options` zurück; `--server-search` zeigt während des Laufs „Suche läuft …" und danach genau den einen Treffer, den die Story von außen nachliefert | ✓ |
| „Kein Treffer" nennt einen Ausweg, ist nicht rot und kein Fehler | `--no-match`: `.v2cmb__empty` = „Kein Treffer — Suchbegriff kürzen.", Farbe `rgb(113,113,113)` = `--color-text-subtle` (`#717171`), nicht `--color-danger` (`#A8403C`); kein `.v2field__err` im DOM | ✓ |
| `error` erscheint als Text am Feld, nicht nur als Farbe (V7/I8) | `--invalid`: `.v2field__err` = „Ohne Gegenkonto lässt sich der Satz nicht buchen.", das Feld trägt zusätzlich `aria-invalid="true"` und `.v2in--invalid`; das zweite Feld daneben ist `disabled` | ✓ |
| Das Label steht sichtbar über dem Feld, auch wenn `placeholder` gesetzt ist (I8) | `--filled`: `.v2field__label` „Gegenkonto" liegt vollständig über dem Eingabefeld (`label.bottom ≤ input.top`), `for="konto"` ↔ `id="konto"`, daneben `placeholder="Nummer oder Name"` und der Hinweis „Rücktaste im leeren Feld leert die Auswahl." | ✓ |
| `group` erzeugt Überschriften, ohne sie flache Liste | `--grouped`, beide Felder nebeneinander geöffnet: links („Mit Gruppen") 7 Optionen unter 3 `.v2cmb__grp` — „Zuletzt gebucht", „Vorschlag des Agenten", „Alle Konten"; rechts („Flach, ohne group") dieselben 7 Optionen, 0 Gruppenköpfe, Liste 236 statt 280 px hoch. Der 2026-09-03 offene Punkt (1) ist damit belegt | ✓ |
| Ersetzt `CreditorCombobox` ohne Funktionsverlust | Der Umzug findet in `ludwig/app` statt und ist hier nicht ausführbar. Der Vergleich vom 2026-09-03 steht unverändert: Feld, Liste, Wechsel Suchtext↔Auswahl, Ladezustand und Leertext sind gedeckt, die Tastatursteuerung kommt hinzu; **es fehlen weiter Entprellung (180 ms) und Wettlauf-Schutz (`reqId`)** — `Combobox.tsx:175` ruft `onSearch` bei jedem Tastendruck, eine späte Antwort kann eine frühere überschreiben. Die Spec sagt dazu nichts, also ist es kein Kriteriumsverstoß, sondern eine offene Entscheidung (siehe unten) | offen (App) |
| `AccountField` bleibt unverändert und grün — sein Umbau ist eine eigene Aufgabe | `git log -- src/ui/v3/entities/account/AccountField.tsx`: seit dieser Runde nur `6fa8a53` (Aufgabe 0013, Anzeige und Kontenblatt-Icon) und `f58caa2` (0087, eine Import-Zeile) — kein Eingriff aus 0009. Die Datei trägt weiter ihre eigene Mechanik (`.v2kf`), setzt also nicht auf `Combobox` auf; der Umbau bleibt eine eigene Aufgabe. `pnpm typecheck` grün | ✓ |

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte:

1. Der Umzug von `KontoCombobox`, `CreditorCombobox` und `TaxKeySelect` in
   `ludwig/app` — hier nicht erfüllbar, hält die Aufgabe nicht auf.
2. **Entprellung und Wettlauf-Schutz für `onSearch` sind weiter unentschieden**
   (2026-09-03 offener Punkt 2). `AccountField` macht beides selbst
   (`AccountField.tsx:106–121`: 180 ms `setTimeout`, `abgebrochen`-Flag);
   `Combobox` macht keines von beidem und sagt in der Spec auch nicht, dass
   es Sache des Aufrufers ist. Entweder hereinholen oder in „Kann bewusst
   nicht" festschreiben.
3. **Offene Frage 2 ist nicht umgesetzt.** Die Spec entscheidet „höchstens 50
   Treffer, dazu eine Zeile ‚… und N weitere — Suchbegriff verfeinern.'";
   gebaut ist ungekürzt. Bei 800 Konten ist die Liste damit endlos. Nicht in
   den Abnahmekriterien, deshalb kein Mangel — aber Spec und Code sagen
   Verschiedenes.
4. `role="listbox"`/`role="option"` ohne `aria-activedescendant`: der
   hervorgehobene Treffer ist sichtbar, aber ein Screenreader erfährt ihn
   nicht (2026-09-03 offener Punkt 5, unverändert).
5. Die Prop `name` steht im Code (`Combobox.tsx:47`, trägt `id`/`for` und die
   `aria-controls`-Verbindung) und wird von jeder Story benutzt, fehlt aber in
   der Schnittstellen-Tabelle dieser Spec.

**Beiläufig geprüft (0087).** Das Häkchen am gewählten Treffer kommt jetzt
über `ActionIcon action="confirm"`; im DOM steht weiter `lucide-check`,
`width 12`, an derselben Stelle (`.v2cmb__mark`). Ein Unterschied: die
Strichstärke ist von `2` auf `1.5` gegangen, weil die Registry die Leiter aus
A8 durchsetzt („Icons Lucide 1.5 px", §2). Das Zeichen ist im Bild unverändert
gut zu sehen — kein Mangel, sondern die beabsichtigte Vereinheitlichung.
