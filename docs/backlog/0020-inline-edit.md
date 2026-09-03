# 0020 · InlineEdit — Klick, Feld, Speichern

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, „einen Wert an Ort und Stelle ändern" ist fachfrei |
| Quelle | Soll-Katalog §11.7 Stufe 1 „Inline-Bearbeitung (Klick → Feld → Speichern/Abbrechen)" |
| Ersetzt | die Eigenbauten in `CaseSummaryEditor`, `CaseKindEditor`, `CaseDocumentNumberModeEditor`, `SourceDocActions`, `ContractDetail`, `DocumentInbox` (6 Dateien) |
| Blockiert | die Detail- und Drawer-Umzüge von Sachverhalt, Beleg und Vertrag |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Eine Zusammenfassung, eine Belegart, ein Vertragsname: die Sachbearbeiterin
sieht den Wert, klickt ihn an, ändert ihn, speichert. Sechs Module bauen
diesen Dreisatz heute je einzeln nach — mit eigenem `isEditing`, eigenem
Pending, eigener Fehlerbehandlung und jedes Mal einer anderen Antwort auf die
Frage, was Escape tut.

## Einordnung

- **Wiederverwenden:** `Field`/`Input` sind der Bearbeitungsteil, mehr nicht.
  `Dialog` reißt für die Änderung eines Satzes den Kontext ab (L4: kein Modal,
  wo es ohne geht). `ActionButton` (0004) trägt Pending und Fehler einer
  Handlung — hier ist die Handlung nur die halbe Miete, die andere ist der
  Wechsel zwischen Anzeige und Feld.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort, sechs belegte
  Verwendungen, und der Zustandswechsel samt Tastaturweg ist an der
  Aufrufstelle nicht in 15 Zeilen richtig zu bekommen.
- **Zuschnitt:** eine Datei, ein Export. Das Feld selbst kommt als
  Render-Prop, damit `Input`, `Textarea`, `Select` und später `Combobox`
  (0009) dieselbe Hülle benutzen, statt vier Varianten zu erzeugen.
- **Setzt auf:** `TextButton` (0011) für „Bearbeiten", `Button` mit `loading`
  (0010) für „Speichern", `Callout` für den Fehler.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `label` | `string` | ja | Was bearbeitet wird — sichtbar, auch im Anzeigezustand | `Filled` |
| `value` | `string` | ja | Der gespeicherte Wert | `Filled` |
| `onSave` | `(next: string) => Promise<void> \| void` | ja | Speichern; wirft der Aufruf, bleibt das Feld offen und zeigt den Fehler | `Interactive` |
| `renderInput` | `(props: { value, onChange, autoFocus }) => ReactNode` | nein | Das Eingabeelement; Default ist `Input` | `WithTextarea` |
| `renderValue` | `(value: string) => ReactNode` | nein | Die Anzeige; Default ist der Text, „—" wenn leer | `Filled` |
| `pending` | `boolean` | nein | Von außen gesteuertes Speichern (Server Action des Aufrufers) | `Pending` |
| `error` | `string` | nein | Fehler von außen; sonst kommt er aus `onSave` | `Error` |
| `disabled` | `boolean` | nein | Nicht bearbeitbar — die Anzeige bleibt, der Knopf verschwindet | `Filled` |

Was die Komponente **nicht** kann: mehrere Felder gleichzeitig (das ist ein
Formular), automatisch speichern beim Verlassen (I2: nichts passiert ohne
Klick), und sie lädt nichts nach.

## Verhalten

Client-Component. Anzeigezustand: Wert plus `TextButton` „Bearbeiten".
Bearbeitungszustand: Feld mit Autofokus, darunter „Speichern" und
„Abbrechen". **Tastatur ist der Hauptweg:** Enter speichert (bei `Textarea`
Strg+Enter), Escape bricht ab und stellt den alten Wert wieder her; beide
Tasten stehen als Hinweis unter dem Feld (V14). Während `pending` ist das Feld
gesperrt und der Knopf zeigt `loading`. Schlägt `onSave` fehl, bleibt der
eingegebene Text stehen — er wird nie verworfen.

## Stories

Titel `v3/Primitives/Formular/InlineEdit`. Abgeleitet nach §6: 4 Zustände
(gefüllt, leer, lädt, Fehler) + 1 Callback + 1 „im Einsatz" = 6.

| Story | Beweist |
|---|---|
| `Filled` | Anzeige mit Wert, Bearbeiten-Knopf, dazu `disabled` |
| `Empty` | ohne Wert steht „—", der Knopf heißt trotzdem „Bearbeiten" |
| `Pending` | Feld gesperrt, Knopf lädt |
| `Error` | Speichern schlug fehl, der getippte Text steht noch da |
| `Interactive` | Rundlauf: klicken, ändern, Enter, neuer Wert steht |
| `WithTextarea` | mehrzeilig in einer `Card` — Strg+Enter speichert |

Nicht anwendbar: `LeerNachFilter` — es gibt keinen Filter.

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

- [ ] Enter speichert, Escape bricht ab, beide Tasten stehen sichtbar am Feld (Story `Interactive`, Regel V14)
- [ ] Nach einem Fehler steht der getippte Text noch da (Story `Error`)
- [ ] Der Wechsel Anzeige → Feld verschiebt die Zeile nicht (Story `Filled`, Regel V1)
- [ ] Nichts wird ohne Klick oder Enter gespeichert (Story `Interactive`, Regel I2)
- [ ] Ersetzt `CaseSummaryEditor.tsx` ohne Funktionsverlust

## Offene Fragen

1. Soll Escape bei geändertem Text nachfragen? *Ohne Antwort: nein — Escape
   verwirft, das ist die erwartete Bedeutung; Wichtiges speichert man mit Enter.*
2. Trägt die Komponente den Speicher-Aufruf selbst oder nur den Zustand?
   *Ohne Antwort: sie ruft `onSave` und zeigt dessen Fehler — der Aufrufer
   bringt die Server Action mit.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
