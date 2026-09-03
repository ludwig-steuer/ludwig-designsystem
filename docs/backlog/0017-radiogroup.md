# 0017 · RadioGroup

| | |
|---|---|
| Status | Abnahme |
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

- [ ] Pfeiltasten wandern durch die Optionen, Tab springt aus der Gruppe (Story `Filled`, Tastaturprobe)
- [ ] `fieldset`/`legend` im DOM, `aria-invalid` bei `error` (Story `Invalid`, Blick ins DOM)
- [ ] Die ganze Optionszeile ist klickbar und antwortet auf Hover (Story `Filled`, Regel §2)
- [ ] Fehler steht als Text, nicht nur als Farbe (Story `Invalid`, Regel V7)
- [ ] Ersetzt die drei `type="radio"` in `DatevExportWizard.tsx` und `BatchActions.tsx` ohne Funktionsverlust

## Offene Fragen

1. Soll `hint` unter der Option oder rechts stehen? *Ohne Antwort: darunter,
   in `--color-text-muted` — rechts bricht bei langen Sätzen.*
2. Braucht die Gruppe eine „keine Angabe"-Option? *Ohne Antwort: nein, der
   Aufrufer nimmt sie in `options` auf, wenn er sie braucht.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
