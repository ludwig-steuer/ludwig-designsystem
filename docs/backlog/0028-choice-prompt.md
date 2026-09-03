# 0028 · ChoicePrompt — die Frage mit Antwortoptionen

| | |
|---|---|
| Status | Abnahme |
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

- [ ] Gesperrter Knopf nennt den Grund im Text daneben (Story `Blocked`, Regel T6)
- [ ] Strg+Enter sendet, die Taste steht am Knopf (Story `Interactive`, Regel V14)
- [ ] Nach einem Fehler steht die Eingabe noch da (Story `Error`)
- [ ] Ohne `freeText`-Prop gibt es kein Textfeld (Story `Filled`, Blick ins DOM)
- [ ] Ersetzt `RaiseClarificationForm.tsx` ohne Funktionsverlust

## Offene Fragen

1. Darf man Option **und** Freitext gleichzeitig senden? *Ohne Antwort: ja —
   die Option ist die Antwort, der Text die Begründung.*
2. Kommen die Optionen vom Agenten? *Ohne Antwort: der Aufrufer bringt sie
   mit; das Pattern fragt nichts ab.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
