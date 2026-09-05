# 0028 · ChoicePrompt — die Frage mit Antwortoptionen

| | |
|---|---|
| Status | in Arbeit |
| Stufe | `patterns/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, „Frage mit vorgeschlagenen Antworten" ist fachfrei |
| Quelle | Soll-Katalog §11.7 Stufe 2 „Frage mit Antwortoptionen (Handlungen + Freitext, I6, S13)" |
| Ersetzt | den Handbau in `RaiseClarificationForm` |
| Blockiert | Klärung im Sachverhalt, Rückfragen in der Stapelabnahme, die Portal-Antwort |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Ludwig fragt: „Ist das eine Bewirtung oder eine Reisekosten-Position?" Die
Sachbearbeiterin soll mit einem Klick antworten können — und nur dann tippen,
wenn keine der Antworten passt. Heute steht dort ein Formular mit Freitext,
in dem jede Antwort neu formuliert wird; die Vorschläge, die der Agent
mitliefert, landen im besten Fall als Satz im Fragetext.

## Einordnung

- **Wiederverwenden:** `ReasonDialog` fragt **nach einem Grund** zu einer
  bereits gewählten Handlung und blockiert dafür den Bildschirm — hier ist die
  Frage der Inhalt, nicht die Rückfrage. `RadioGroup` (0017) ist der
  Auswahlteil und wird benutzt, nicht ersetzt.
- **Neues Pattern, weil:** Regel 4 — eigener Zustand (Auswahl plus Freitext
  plus Absenden) und mindestens zwei Screens (Sachverhalt, Stapelabnahme,
  Portal).
- **Zuschnitt:** eine Datei, ein Export. Auswahl und Freitext trennen hieße,
  den halben Zustand durchzureichen.
- **Setzt auf:** `RadioGroup` (0017), `Textarea`, `ActionButton` (0004),
  `Callout` für den Fehler.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `question` | `string` | ja | Die Frage, ein Satz (T2) | `Filled` |
| `context` | `ReactNode` | nein | Worum es geht — Beleg, Betrag, Zeile | `InCase` |
| `options` | `ChoiceOption[]` | ja | `{ id, label, hint? }` — die vorgeschlagenen Antworten | `Filled` |
| `freeText` | `{ label: string; placeholder?: string; required?: boolean }` | nein | Zusatzfeld; ohne diese Prop gibt es keinen Freitext | `WithFreeText` |
| `submitLabel` | `string` | nein | Imperativ mit Objekt (T3), Default „Antwort senden" | `Filled` |
| `onSubmit` | `(answer: { optionId: string \| null; text?: string }) => Promise<void> \| void` | ja | Absenden | `Interactive` |
| `pending` | `boolean` | nein | Läuft gerade | `Pending` |
| `error` | `string` | nein | Absenden fehlgeschlagen | `Error` |

Was das Pattern **nicht** kann: die Frage stellen (es zeigt sie), mehrere
Fragen hintereinander (das ist ein Assistent), Dateien annehmen (das ist
`FileDrop`, 0021), und es kennt weder Sachverhalt noch Klärung — beide kommen
als Text und Callback vom Aufrufer.

## Verhalten

Client-Component. Ohne Auswahl und ohne Freitext ist der Absenden-Knopf
gesperrt, und **daneben steht warum** (V7/T6), nicht nur ausgegraut. Die
Auswahl einer Option mit `hint` zeigt den Hinweis unter der Option, nicht als
Tooltip. Tastatur: Pfeiltasten wählen (von `RadioGroup`), Strg+Enter sendet;
die Taste steht am Knopf (V14). Nach Fehler bleibt alles Eingegebene stehen.

## Stories

Titel `v3/Patterns/Prüfen/ChoicePrompt`. Abgeleitet nach §6: 4 Zustände
(gefüllt, gesperrt-ohne-Auswahl, lädt, Fehler) + 1 Callback + 1 „im Einsatz" = 6.

| Story | Beweist |
|---|---|
| `Filled` | Frage mit drei Antworten, eine gewählt |
| `Blocked` | nichts gewählt: Knopf gesperrt, Grund steht daneben |
| `WithFreeText` | Antwort „Etwas anderes" plus Freitextfeld |
| `Pending` | Absenden läuft, Formular gesperrt |
| `Error` | fehlgeschlagen, Eingaben stehen noch |
| `InCase` | in einer `Card` mit Kontext (Beleg, Betrag), wie im Sachverhalt |

Nicht anwendbar: `Leer` (eine Frage ohne Antwortoptionen ist ein Freitextfeld,
kein Fall für dieses Pattern), `LeerNachFilter`.

## Abnahme

**Zweite Abnahme, 2026-09-05** (fremder Prüfer, nicht der Erbauer). Die beiden
ersten Punkte sind behoben: Strg+Enter hängt jetzt am Pattern statt am
Freitextfeld, und `Filled` zeigt über `defaultOptionId` wirklich eine gewählte
Antwort. Die Punkte (3) und (4) der ersten Runde stehen unverändert. Jedes
Kriterium einzeln, fest und variabel:

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0; zweimal gelaufen (Beginn und Ende der Abnahme, 2026-09-05) | ✓ |
| **Fest** — `pnpm build` grün | Nicht erneut gelaufen (schreibt nach `storybook-static`, parallele Abnahmen). Der Lauf für diesen Stand war grün („Storybook build completed successfully") | ✓ (zitiert) |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/ChoicePrompt.tsx` mit `ChoicePrompt.stories.tsx` daneben; Titel `v3/Patterns/Prüfen/ChoicePrompt` (`ChoicePrompt.stories.tsx:9`) — „Prüfen" ist die Gruppe aus dem Barrel; Export `src/ui/v3/index.ts:256–259` | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | Drei Exporte: `ChoiceOption` (`:18`), `ChoiceAnswer` (`:25`) und `ChoicePrompt` (`:36`) mit `@when`/`@instead` in `:30–35`. Props, Typen, Kommentare englisch; deutsch nur in den sichtbaren Strings | ✓ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\|[0-9]+px\|fontSize:" ChoicePrompt.tsx` → keine Treffer; Maße in `v3.css:1929–1933` (`.v2ask*`). Kein Status im Spiel — die Antwortoptionen sind Daten des Aufrufers, keine Zustandsachse | ✓ |
| **Fest** — alle Stories der Spec vorhanden, ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--blocked`, `--with-free-text`, `--pending`, `--error`, `--in-case` — sechs, wie in der Ableitung (4 Zustände + 1 Callback + 1 „im Einsatz"). `Leer` und `LeerNachFilter` sind in der Spec mit Grund ausgeschlossen. Anmerkung: Die Abnahme der ersten Runde vermisste eine Story `Interactive`; die Spec führt sie nicht, und `--with-free-text` deckt den Rundlauf ab | ✓ |
| **Fest** — Story-Deckung der Schnittstelle | Alle acht Props der Spec sind belegt: `question` → `--filled`, `context` → `--filled` und `--in-case` („RE-4483 · 128,40 € · 26.08.2026"), `options` → alle, `freeText` → `--with-free-text` (genau ein `textarea`), `submitLabel` → `--in-case` („Antwort an Ludwig senden"), `onSubmit` → `--with-free-text` (Zeile „Gesendet: …"), `pending` → `--pending`, `error` → `--error`. Nicht belegt ist der Teilfall `freeText.required` — dafür gibt es einen zweiten Grundtext im Code (`:69` „Bitte ergänzen Sie den Text.") ohne Story. Die neunte, in der Spec nicht geführte Prop `defaultOptionId` ist in `--filled` vorgeführt | ✓ (mit Befund) |
| **Fest** — Prüfliste `design-guidelines.md` §9 (ohne die zwei App-Punkte) | Stufe `patterns/`, Importe nur abwärts (`ActionButton`, `Callout`, `Form`, `RadioGroup`), kein Fachmodul ✓ · kein Hex/px/Label-Map ✓ · Text links, nichts zentriert ✓ · Farbe: nur der `Callout` im Fehlerfall, sonst keine ✓ · jeder farbige Zustand mit Wort ✓ · fünf Zustände: vier gebaut, zwei begründet ausgeschlossen ✓ · Kontrast gemessen: Grundzeile `.v2ask__why` 6,17:1, Frage 12,71:1, Options-Hinweis 4,88:1 ✓ · keine Bewegung ✓ · Hover: `.v2radioline:hover` färbt eine Tonstufe (`v3.css:1706`) ✓ · Fokus/Pfeiltasten aus dem nativen `<fieldset>` — Pfeil-ab wechselt die Auswahl (in `--with-free-text` geprüft) ✓ · kein Icon, kein Emoji ✓ · Karte in `--in-case` mit Rand, ohne Schatten ✓ · Texte Sie, Imperativ mit Objekt („Antwort senden", „Antwort an Ludwig senden") ✓. **Zwei Punkte reißen:** siehe **M1** (der Ladezustand sagt nicht, dass er lädt) und **M2** (zwei Prompts teilen eine Radiogruppe). Set-weiter Befund: `.v2field__label` in Versalien (`v3.css:842–845`, A2/T3), betrifft `<legend>` und Freitext-Label — wie in 0017 als Befund gewertet | ✗ (wegen M1/M2) |
| **Fest** — im Browser angesehen | Alle sechs Stories in Chromium auf `localhost:6107` geöffnet, Antworten geklickt, Text getippt, Strg+Enter aus drei verschiedenen Fokuslagen gedrückt; Bilder von `--pending` und `--filled` geprüft | ✓ |
| **Variabel** — gesperrter Knopf nennt den Grund im Text daneben (T6) | `--blocked`: `<button disabled>` und daneben `.v2ask__why` „Wählen Sie eine Antwort oder schreiben Sie eine."; nach dem Wählen einer Antwort ist der Knopf frei und der Satz verschwunden (`.v2ask__why`-Anzahl 0). Im Bild von `--pending` gut zu sehen | ✓ |
| **Variabel** — Strg+Enter sendet, die Taste steht am Knopf (V14) | Behoben gegenüber der ersten Runde: `onKeyDown` sitzt jetzt am Block (`ChoicePrompt.tsx:82–87`), nicht mehr am `Textarea`. Nachgestellt in `--with-free-text`: (a) Fokus im `textarea` → „Gesendet: bewirtung · Kunde war dabei"; (b) Fokus auf einem Radio, ohne das Textfeld anzufassen → „Gesendet: reise · ohne Text". Die Taste steht als `<kbd class="v2kbd">Strg+Enter</kbd>` am Knopf. Anmerkung: liegt der Fokus außerhalb des Blocks (Seite frisch geladen, nichts angeklickt), greift sie nicht — das ist die richtige Abgrenzung, sonst würden zwei Prompts auf einer Seite beide senden | ✓ |
| **Variabel** — nach einem Fehler steht die Eingabe noch da | `--error`: Der `Callout` „Die Rückfrage konnte nicht gesendet werden — der Sachverhalt ist gesperrt." steht; danach „Das war eine Betriebsveranstaltung." ins Freitextfeld getippt und eine Antwort gewählt — beides bleibt stehen, der `Callout` ebenso. Im Code setzt nichts `text`/`choice` zurück | ✓ |
| **Variabel** — ohne `freeText`-Prop gibt es kein Textfeld | `--filled`: `textarea`-Anzahl im DOM 0; mit der Prop (`--with-free-text`) genau eins (`:101–111`) | ✓ |
| **Variabel** — `Filled` zeigt „eine gewählt" | Behoben: `--filled` startet mit `defaultOptionId="bewirtung"`, ausgelesen ist genau ein Radio gewählt (`value=bewirtung`), der Knopf ist frei und `.v2ask__why` fehlt. Damit unterscheidet sich `Filled` sichtbar von `Blocked` | ✓ |
| **M1 · Variabel** — im Zustand `pending` sagt der Knopf, dass er lädt | **Reißt (Punkt (3) der ersten Runde, unverändert).** `--pending`, Knopf ausgelesen: `<button type="button" disabled class="v2btn v2btn--primary v2btn--sm"><span>Antwort senden</span><kbd class="v2kbd">Strg+Enter</kbd></button>` — kein „Sende …", kein `aria-busy`. Grund: `pendingLabel` wird an `ActionButton` durchgereicht, das daraus `loadingLabel` macht, aber `loading` allein aus seinem **eigenen** Lauf zieht (`ActionButton.tsx:61,94–95`); ein `pending` von außen erreicht nur `disabled`. Die Story behauptet in ihrem Kommentar „der Knopf trägt ein Wort" — das stimmt nicht. Dazu steht unter dem gesperrten Knopf weiterhin „Wählen Sie eine Antwort oder schreiben Sie eine.", obwohl gerade gesendet wird: der Satz widerspricht dem Zustand. So hat der Zustand „lädt" (V9) weder Wort noch stimmigen Text | ✗ |
| **M2 · Fest** — zwei Prompts auf einer Seite stören sich nicht | **Reißt (Punkt (4) der ersten Runde, unverändert).** `RadioGroup name="choice"` ist ein festes Literal (`ChoicePrompt.tsx:94`); im DOM tragen alle Optionen `name="choice"`. Nachgestellt in `--filled`: Auswahl steht auf `bewirtung`; danach ein zweiter Radio mit `name="choice"` in dieselbe Seite gesetzt und gewählt → die erste Gruppe ist **abgewählt** (`.v2radiogrp input:checked` = 0). Zwei `ChoicePrompt` nebeneinander — Sachverhalt mit zwei Klärungen, Stapelabnahme mit zwei Rückfragen — löschen sich damit gegenseitig die Antwort | ✗ |
| **Variabel** — ersetzt `RaiseClarificationForm.tsx` ohne Funktionsverlust | Betrifft das Repo `ludwig/app` und ist hier nicht erfüllbar. Der fachliche Befund der ersten Runde bleibt: nicht gedeckt sind das eingeklappte Formular mit Auslöser-Knopf, der Empfänger-Select mit wechselnder Hinweiszeile, der Schalter „Blockiert die Buchung" und ein Abbrechen-Weg, der den Entwurf behält | offen (App) |

**Zurück auf `in Arbeit`.** Zu tun:

1. **M1 — der Ladezustand braucht ein Wort.** Entweder `ChoicePrompt` reicht
   `pending` so an den Knopf, dass dort `pendingLabel` erscheint (z. B. `Button`
   mit `loading` statt `ActionButton` mit `disabled`), oder `ActionButton`
   bekommt ein von außen gesetztes `loading`. Im selben Zug: die Grundzeile
   `.v2ask__why` verschwindet, solange `pending` läuft — sie widerspricht sonst
   dem Zustand. Danach stimmt auch der Kommentar der Story wieder.
2. **M2 — `name` der Radiogruppe eindeutig machen** (`useId()`, oder eine Prop
   `name`), damit zwei Prompts auf einer Seite nebeneinander stehen können.

**Befunde** (keine Mängel dieser Aufgabe):

3. **`defaultOptionId` fehlt in der Schnittstelle der Spec.** Die Prop ist
   gebaut (`ChoicePrompt.tsx:40,52`), im JSDoc erklärt und für `Filled` nötig —
   die Tabelle oben führt sie nicht. Beim nächsten Anfassen nachtragen.
4. **`freeText.required` hat keine Story.** Der zweite Grundtext „Bitte ergänzen
   Sie den Text." (`:69`) ist damit nirgends zu sehen.
5. **`--error` startet mit leerem Feld.** Die Aussage „nach einem Fehler steht
   die Eingabe noch da" führt die Story nicht von selbst vor; sie ist nur beim
   Mittippen zu sehen (so geprüft). Ein vorbelegter Text würde sie beweisen.
6. **Versalien am Feldlabel, set-weit** — `.v2field__label`, `v3.css:842–845`;
   trifft hier `<legend>ANTWORT</legend>` und „ANMERKUNG". Eigene Aufgabe,
   dieselbe Feststellung wie in 0017.

Erste Runde (2026-09-03, Historie): ✗ an Strg+Enter (behoben) und am
App-Kriterium; offene Punkte (1) und (2) behoben, (3) und (4) offen.
