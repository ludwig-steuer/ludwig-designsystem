# 0020 · InlineEdit — Klick, Feld, Speichern

| | |
|---|---|
| Status | fertig |
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

- [x] `pnpm typecheck` und `pnpm build` grün
- [x] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [x] Code englisch; `@when`/`@instead` an jedem Export
- [x] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [x] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [x] Prüfliste `design-guidelines.md` §9 durchgegangen
- [x] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [x] Enter speichert, Escape bricht ab, beide Tasten stehen sichtbar am Feld (Story `Interactive`, Regel V14)
- [x] Nach einem Fehler steht der getippte Text noch da (Story `Error`)
- [x] Der Wechsel Anzeige → Feld verschiebt die Zeile nicht (Story `Filled`, Regel V1)
- [x] Nichts wird ohne Klick oder Enter gespeichert (Story `Interactive`, Regel I2)
- [ ] Ersetzt `CaseSummaryEditor.tsx` ohne Funktionsverlust — **offen (App)**

## Offene Fragen

1. Soll Escape bei geändertem Text nachfragen? *Ohne Antwort: nein — Escape
   verwirft, das ist die erwartete Bedeutung; Wichtiges speichert man mit Enter.*
2. Trägt die Komponente den Speicher-Aufruf selbst oder nur den Zustand?
   *Ohne Antwort: sie ruft `onSave` und zeigt dessen Fehler — der Aufrufer
   bringt die Server Action mit.*

## Abnahme

**Zweite Abnahme, 2026-09-05** (fremder Prüfer, nicht der Erbauer). Der ✗ der
ersten Runde — `pending` und `error` ohne eigene Story — ist behoben: beide
Stories zeigen jetzt je zwei Blöcke, links die Prop von außen, rechts den Weg
über `onSave`. Jedes Kriterium einzeln, fest und variabel:

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0; zweimal gelaufen (Beginn und Ende der Abnahme, 2026-09-05) | ✓ |
| **Fest** — `pnpm build` grün | Nicht erneut gelaufen (schreibt nach `storybook-static`, parallele Abnahmen). Der Lauf für diesen Stand war grün („Storybook build completed successfully") | ✓ (zitiert) |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/InlineEdit.tsx` mit `InlineEdit.stories.tsx` daneben; Titel `v3/Primitives/Formular/InlineEdit` (`InlineEdit.stories.tsx:8`); Export `src/ui/v3/index.ts:106` | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | Zwei Exporte: `InlineEditInputProps` (`:17`) und `InlineEdit` (`:30`) mit `@when`/`@instead` in `:25–28`. Props, Typen und alle Kommentare englisch; deutsch nur in „Bearbeiten", „Speichern", „Abbrechen", „Enter speichert · Esc bricht ab" | ✓ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\|[0-9]+px\|fontSize:" InlineEdit.tsx` → keine Treffer; Maße in `v3.css:1826–1831` (`.v2iedit*`). Kein Status im Spiel | ✓ |
| **Fest** — alle Stories der Spec vorhanden, ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--empty`, `--pending`, `--error`, `--interactive`, `--with-textarea` — sechs, wie in der Ableitung (4 Zustände + 1 Callback + 1 „im Einsatz"). `LeerNachFilter` ist mit Grund ausgeschlossen | ✓ |
| **Fest** — Story-Deckung der Schnittstelle | Alle acht Props der Spec sind belegt: `label`/`value` → `--filled`, `disabled` → `--filled` (zweiter Block: Wert steht, „Bearbeiten" fehlt — `getByRole('button')` findet genau einen Knopf auf der Seite), `onSave` → `--interactive`, `renderInput` → `--with-textarea`, `renderValue` → `--with-textarea` (`whiteSpace: pre-line`), `pending` → `--pending` links (Feld `disabled`, Knopf „Speichere …"), `error` → `--error` links (Text steht im Anzeigezustand unter dem Wert). Zusätzlich zeigt jede der beiden Stories den inneren Weg daneben | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 | Punkt für Punkt: Stufe `primitives/`, Importe nur abwärts (`Button`, `Form`, `TextButton`), kein Fachmodul ✓ · kein Hex/px/Label-Map ✓ · Text links, nichts zentriert ✓ · Zeilenhöhe: der Anzeigezustand ist 41 px hoch, unter `.v2tbl__row` ✓ · keine Farbe außer der Fehlerfarbe; der Fehler steht als Satz, nicht nur rot (V7) ✓ · fünf Zustände: vier gebaut, `LeerNachFilter` begründet ausgeschlossen ✓ · Kontrast gemessen: Wert 12,71:1, Label 6,17:1, Tastenzeile `.v2iedit__keys` 4,51:1 ✓ · keine Bewegung, also `prefers-reduced-motion` gegenstandslos ✓ · Hauptweg per Tastatur mit sichtbarer Taste (eigene Zeile unten) ✓ · kein Icon ohne Wort — „Bearbeiten" steht als Wort da, kein Bleistift ✓ · Hover: `TextButton` unterstreicht (`none` → `underline`, gemessen) ✓ · Karte in `--with-textarea` mit Rand, ohne Schatten ✓ · Texte Sie/Imperativ („Beleg prüfen"-Muster: „Speichern", „Abbrechen") ✓. Die zwei App-Punkte sind laut Skill übersprungen. **Set-weiter Befund:** `.v2field__label` (`v3.css:842–845`) setzt `text-transform: uppercase`, die Beschriftung erscheint als „BELEGART" — A2/T3, betrifft jedes Feld des Sets (wie in 0017 als Befund, nicht als Mangel gewertet) | ✓ (mit Befund) |
| **Fest** — im Browser angesehen | Alle sechs Stories in Chromium auf `localhost:6107` geöffnet, geklickt und getippt; Bild von `--with-textarea` geprüft (Karte, mehrzeiliger Wert, Anzeige → Feld) | ✓ |
| **Variabel** — Enter speichert, Escape bricht ab, beide Tasten stehen sichtbar am Feld (V14) | `--interactive`: „Bearbeiten" geklickt, Wert auf „Gutschrift" geändert, Enter → Anzeige „Gutschrift", Zähler „1× gespeichert". Danach erneut geöffnet, „Verworfener Text" getippt, Escape → Anzeige steht wieder auf „Gutschrift", Zähler unverändert bei „1× gespeichert", nichts wurde gefragt. Unter dem Feld steht „Enter speichert · Esc bricht ab" (`.v2iedit__keys`); in `--with-textarea` steht dort „Strg+Enter speichert · Esc bricht ab" — und dort macht Enter wirklich eine Zeile (nach Enter ist das Feld noch offen, Wert „Zeile A\nZeile B"), Strg+Enter speichert | ✓ |
| **Variabel** — nach einem Fehler steht der getippte Text noch da | `--error`, rechter Block: „Neuer, sorgfältig getippter Text" eingegeben, Enter → nach 500 ms bleibt das Feld offen, `input.value` unverändert, `aria-invalid="true"`, darunter „Speichern abgelehnt: der Stapel läuft." als Text | ✓ |
| **Variabel** — der Wechsel Anzeige → Feld verschiebt die Zeile nicht (V1) | `--interactive`, gemessen: die Beschriftung bleibt bei `top` 16 px, der Block wächst von 41 auf 88 px — ausschließlich nach unten. Nichts über dem Feld springt | ✓ |
| **Variabel** — nichts wird ohne Klick oder Enter gespeichert (I2) | `--interactive`: Feld auf „Nur getippt, nicht gespeichert" geändert, dann daneben geklickt (Blur) → das Feld bleibt offen, der Zähler steht weiter auf „noch nicht gespeichert". Es gibt keinen `onBlur`-Pfad in `InlineEdit.tsx` | ✓ |
| **Variabel** — ersetzt `CaseSummaryEditor.tsx` ohne Funktionsverlust | Betrifft das Repo `ludwig/app` und ist hier nicht erfüllbar | offen (App) |

**Befunde** (keine Mängel dieser Aufgabe):

1. **Versalien am Feldlabel, set-weit** — `.v2field__label`, `v3.css:842–845`.
   Eigene Aufgabe, dieselbe Feststellung wie in 0017 und 0019.
2. **Neunte Prop `multiline` fehlt in der Schnittstelle der Spec.** Sie ist
   gebaut (`InlineEdit.tsx:39,55`), im JSDoc erklärt und in `--with-textarea`
   vorgeführt — die Tabelle oben führt sie nicht. Beim nächsten Anfassen
   nachtragen; der Punkt aus der ersten Runde ist damit fachlich entschieden
   (die Taste hängt an der Prop, nicht am `renderInput`), nur nicht dokumentiert.
3. **`renderValue` steht in der Spec als Nachweis an `Filled`,** vorgeführt wird
   es aber in `WithTextarea`. Die Prop ist gedeckt, die Spalte zeigt auf die
   falsche Story.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05

Erste Runde (2026-09-03, Historie): ✗ an der Story-Deckung — `pending` und
`error` waren unbelegt. Behoben.
