# 0017 · RadioGroup

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, „eine aus wenigen Möglichkeiten" ist fachfrei |
| Quelle | Soll-Katalog §11.7 Stufe 1 „Radio-Gruppe (Antwortoptionen I6)" |
| Ersetzt | 3 rohe `<input type="radio">` in `DatevExportWizard.tsx` und `BatchActions.tsx` |
| Blockiert | 0028 (Frage mit Antwortoptionen), jede Wizard-Migration |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Wo die Sachbearbeiterin zwischen drei benannten Wegen wählt — welcher
Stapel exportiert wird, wie eine Sammelaktion greift —, steht heute nacktes
`<input type="radio">` mit handgeschriebenem Label daneben. Kein sichtbarer
Fokus, keine Fehlerzeile, kein gemeinsamer Abstand. I6 verlangt für
Antwortoptionen genau diese Form; ohne sie bleibt jede Frage ein Formular-Unfall.

## Einordnung

- **Wiederverwenden:** `Segmented` ist Navigation — es wechselt die Sicht,
  nicht die Antwort, und trägt keine Fehlermeldung. `Checkbox` ist die
  Mehrfachauswahl. `Select` versteckt die Optionen hinter einem Klick; bei
  zwei bis fünf benannten Wegen ist das ein Rückschritt (V11).
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort, zwei belegte
  Verwendungen, und aus `Field` + `<input>` ist es nicht in 15 Zeilen zu
  bauen, sobald Fehler, Beschreibungstext und Tastatur dazukommen.
- **Zuschnitt:** eine Datei, ein Export. Die Optionen sind Daten, keine
  Kinder-Komponenten — sonst wandert die Beschriftung wieder in den Aufrufer.
- **Setzt auf:** `Field` (Label, Pflichtmarke, Fehlerzeile).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `name` | `string` | ja | Gruppenname des Feldes | `Filled` |
| `label` | `string` | ja | Die Frage, sichtbar (I8) | `Filled` |
| `options` | `RadioOption[]` | ja | `{ value, label, hint?, disabled? }` — `hint` ist der Satz unter der Option | `Filled` |
| `value` | `string \| null` | ja | Die gewählte Option; `null` = noch keine | `Interactive` |
| `onChange` | `(value: string) => void` | ja | Auswahl; braucht einen Client-Aufrufer | `Interactive` |
| `orientation` | `"vertical" \| "horizontal"` | nein | Untereinander (Default) oder in einer Zeile | `Orientations` |
| `error` | `string` | nein | Fehlertext unter der Gruppe, Feld bekommt `aria-invalid` | `Invalid` |
| `required` | `boolean` | nein | Pflichtmarke am Label | `Invalid` |
| `disabled` | `boolean` | nein | Ganze Gruppe gesperrt | `Orientations` |

Typen: rein technisch, nichts aus `src/ludwig/` nötig — die Optionen kommen
vom Aufrufer. Was sie **nicht** kann: mehrere Werte (das ist `Checkbox`),
mehr als sieben Optionen sinnvoll darstellen (dann `Select`), und sie hält
den Wert nicht selbst.

## Verhalten

Client-Component (`onChange`). Native `<input type="radio">` in einem
`<fieldset>` mit `<legend>` — die Tastatur kommt damit vom Browser: Pfeiltasten
wandern, Leertaste wählt, Tab springt in die und aus der Gruppe. Fokusring auf
dem Punkt, sichtbar (V10). Hover unterlegt die ganze Optionszeile eine Tonstufe,
damit die Klickfläche ehrlich ist (§2). Fehler steht als Text unter der Gruppe,
nie nur als rote Umrandung (V7).

## Stories

Titel `v3/Primitives/Formular/RadioGroup`. Abgeleitet nach §6: 2 Zustände
(gefüllt, Fehler) + 1 Enum (`orientation`) + 1 Callback + 1 „im Einsatz" = 5.

| Story | Beweist |
|---|---|
| `Filled` | drei Optionen mit `hint`, eine gewählt |
| `Orientations` | senkrecht und waagerecht, dazu `disabled` |
| `Invalid` | Pflichtfeld ohne Wahl, Fehlertext unter der Gruppe |
| `Interactive` | Rundlauf über `onChange` |
| `InForm` | in einem Formular zwischen `Input` und `Button` — gleicher Rhythmus |

Nicht anwendbar: `Leer` (eine Gruppe ohne Optionen ist ein Programmierfehler,
kein Zustand), `LeerNachFilter`, `Laedt` (der Aufrufer zeigt `Skeleton`, 0016).

## Abnahme

Zweite Abnahme am 2026-09-05 (fremder Agent, gegen Spec und Code). Fest gilt
immer, darunter die Kriterien dieser Spec.

**Story-Deckung.** Fünf Stories in der Spec, fünf Exporte in
`RadioGroup.stories.tsx` (`Filled`, `Orientations`, `Invalid`, `Interactive`,
`InForm`), fünf IDs in `index.json` — die Ableitung „2 Zustände + 1 Enum
+ 1 Callback + 1 im Einsatz = 5" geht auf. Jede Prop der Schnittstelle hat
ihre Story: `name`/`label`/`options` in `Filled`, `value`/`onChange` in
`Interactive`, `orientation` und `disabled` in `Orientations`, `error` und
`required` in `Invalid`. `Leer`, `LeerNachFilter`, `Laedt` sind begründet
ausgeschlossen.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `tsc --noEmit` ohne Ausgabe, Exit 0 (Anfang und Ende der Abnahme) | ✓ |
| `pnpm build` grün | nicht neu gelaufen — parallele Abnahmen schreiben nach `storybook-static`. Der Lauf für diesen Stand war grün: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/RadioGroup.tsx` mit einem Export, `RadioGroup.stories.tsx` daneben; Titel `v3/Primitives/Formular/RadioGroup`, deckt sich mit der Barrel-Gruppe „Formular" (`src/ui/v3/index.ts:101` … `:104`) | ✓ |
| Code englisch; `@when`/`@instead` am Export | `RadioGroup.tsx:24–28`; Bezeichner und JSDoc englisch, Deutsch nur in den sichtbaren Strings der Stories. `@instead` grenzt gegen `Segmented`, `Select`, `Checkbox`, `ChoicePrompt` ab | ✓ |
| Kein Hex, kein px in der Komponente, keine lokale Label-Map, kein eigener Status-Text | `grep -cE '#[0-9a-fA-F]{3,8}' RadioGroup.tsx` = 0; kein Zahlenmaß im `style`; keine Map, kein Status. Maße in `v3.css:1708–1727` | ✓ |
| Pfeiltasten wandern durch die Optionen, Tab springt aus der Gruppe | `--filled` im Browser: Fokus auf Option 3, **Pfeil-hoch** → `document.activeElement.value` „open", `checked` wandert von Index 2 auf 1 — Fokus **und** Auswahl. Nur ein Radio der Gruppe ist tabbierbar (`tabbableInGroup: 1`), Tab verlässt die Gruppe. `RadioGroup.tsx` enthält keinen eigenen `onKeyDown` — das ist der Browser | ✓ |
| `fieldset`/`legend` im DOM, `aria-invalid` bei `error` | `--invalid`, DOM-Probe: `FIELDSET.v2radiogrp` mit `aria-invalid="true"`, `<legend class="v2field__label">Umfang des Exports *</legend>` | ✓ |
| Die ganze Optionszeile ist klickbar und antwortet auf Hover | `--filled`: echter Klick auf den **Hinweistext** der dritten Option („3 Sätze, zwei über 1.000,00 €") wählt sie (`checked` Index 2, `activeElement.value` „flagged"); `label.v2radioline` misst 420 px, `cursor: pointer`, `.v2radioline:hover { background: var(--color-bg-soft) }` (`v3.css:1719`) | ✓ |
| Fehler steht als Text, nicht nur als Farbe (V7) | `--invalid`: `.v2field__err` „Bitte wählen Sie einen Umfang, bevor der Export startet." unter der Gruppe, `color rgb(168,64,60)`; der Rand der Optionszeilen bleibt unverändert `rgb(229,231,235)` — die Farbe ist nicht der einzige Träger | ✓ |
| Fokusring sichtbar (V10) | `--filled`: `outline: 2px solid rgb(59,143,196)` (= `--color-focus`), `outline-offset: 2px` am fokussierten Radio | ✓ |
| `orientation="horizontal"` und `disabled` sichtbar | `--orientations`: „Betragsbasis" mit Netto/Brutto in einer Zeile (`.v2radiogrp--horizontal`, `flex-direction: row`), darunter die gesperrte Gruppe mit `opacity 0.5` und `cursor: not-allowed` | ✓ |
| Rundlauf über `onChange` | `--interactive`: Klick auf die erste Option schreibt die Zeile darunter von „Gewählt: noch nichts" auf „Gewählt: all" | ✓ |
| Gleicher Rhythmus wie `Field`/`Input` im Formular | `--in-form`: `Field`+`Input`, Gruppe, `ActionBar`-artige Knopfzeile untereinander im Raster `var(--space-4)`; Label-Stufe und Abstand identisch zum `Field` darüber | ✓ |
| Text links, nichts zentriert (V3) | `grep "text-align: *center"` in `RadioGroup.tsx` und im Block `v3.css:1708–1727` = 0 | ✓ |
| Im Browser angesehen, nicht nur gebaut | Alle fünf IDs am 2026-09-05 auf `localhost:6107` geöffnet, bedient und gemessen | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | siehe die Zeilen dieser Tabelle; die zwei App-Punkte nach `backlog/README.md` übersprungen | ✓ |
| Ersetzt die drei `type="radio"` in `DatevExportWizard.tsx` und `BatchActions.tsx` | Beide Dateien liegen in `ludwig/app`; dort gibt es `src/ui/v3` nicht (`apps/web/src/ui/` führt `v2`), kein `RadioGroup`-Import. Nach `backlog/README.md` ein Kriterium der App | offen (App) |

**Zur Einordnung vom 2026-09-05: sie trägt, in beiden Punkten.**

1. Der einzige ✗ der ersten Abnahme war ein App-Kriterium und ist hier nicht
   erfüllbar; es steht jetzt als **offen (App)** und hält die Aufgabe nicht auf.
2. Der zweite offene Punkt gehört als **Befund** gewertet, nicht als Mangel
   dieser Aufgabe — nachgeprüft und bestätigt: `.v2field__label`
   (`src/styles/v3.css`, heute Z. 855–858) setzt `text-transform: uppercase`,
   und die `<legend>` erbt es. Im Browser steht in `--filled` „UMFANG DES
   EXPORTS", obwohl im DOM „Umfang des Exports" steht. Das ist ein Verstoß
   gegen T3/A2, aber er trifft **jede** Feldbeschriftung des Sets, nicht die
   Radiogruppe: sie schreibt die Klasse nur an, wie `Field` es auch tut. Seit
   heute hat er eine eigene Aufgabe,
   `docs/backlog/0089-feldbeschriftung-ohne-versalien.md` (Status `offen`),
   die auch die Frage mitnimmt, welche Schriftstufe ein Label ohne Versalien
   trägt. Hier: Befund, kein Mangel.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: nur „offen (App)" — die Umstellung der drei rohen Radios in `ludwig/app`. Die Versalien der Feldbeschriftung laufen als Befund unter 0089.
