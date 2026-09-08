# 0121 · Eine Aktion, die vorher etwas erfragt

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-08, fremde Abnahme steht aus |
| Stufe | `primitives/ActionButton` (0004) — durchgereicht von `Selection` (`BulkAction`) und `DataTable` (0057) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, unverändert: „mehrere Zeilen wählen, dann in einem Dialog sagen, wohin" ist kein Ludwig-Begriff |
| Quelle | Blocker aus `[year]/banks/offen`, gemeldet von `ludwig-manager` 2026-09-08: die zwei Sammelaktionen der Zuordnung („Neuen Sachverhalt anlegen", „Bestehendem zuordnen") öffnen erst einen Dialog und feuern dann; `BulkAction.action: (keys) => Promise<ActionResult>` kann das nicht abbilden |
| Setzt voraus | nichts. `Dialog` (0006) und `ConfirmSpec` stehen |
| Spec von / am | Claude, 2026-09-08 |

## Die Entscheidung: es ist kein neuer Mechanismus, sondern ein Rückkanal

Der Bestätigungsdialog **existiert schon** — in `ActionButton`, nicht in
`BulkAction`: `confirm?: ConfirmSpec` mit `title`, `body?: ReactNode`,
`confirmLabel`, und `ActionButton` rendert ihn mit `Dialog` und feuert die
Aktion erst nach dem Klick auf den Bestätigungsknopf. Der Ablauf „erst fragen,
dann tun" ist also gebaut. Was fehlt, ist **eine Richtung**: der Dialog kann
nichts an `action` zurückgeben.

Daraus folgen drei Festlegungen:

1. **Die Fähigkeit gehört `ActionButton`, nicht `BulkAction`.** Dieselbe Frage
   stellt eine Zeilenaktion („diesen Umsatz zuordnen") genauso wie eine
   Sammelaktion. Sie zweimal zu bauen wäre dieselbe Entscheidung an zwei
   Orten; `BulkAction` **reicht sie durch**, wie es `confirm` heute schon tut.
2. **Der Aufrufer rendert den Inhalt, das Set hält ihn.** Ein Pattern kennt
   keine Entität — `DataTable` darf den `CasePicker` nicht kennen. Der
   Aufrufer gibt den Dialoginhalt als Funktion, das Set hält den Stand,
   sperrt den Bestätigungsknopf, solange er ungültig ist, und reicht ihn an
   `action`.
3. **Kein Promise-Dialog.** Der zweite Vorschlag aus der Anfrage
   (`prompt?: (keys) => Promise<Input | null>`) wäre im Set eine Zeile — und
   zwingt jede Aufrufstelle, einen React-Dialog imperativ in ein Promise zu
   verpacken, das sie selbst auflösen muss. Das ist dieselbe Arbeit, nur n-mal
   und außerhalb des Sets. Der Vorschlag ist damit **abgelehnt**, mit Grund.

## Schnittstelle

`ActionButton` wird generisch über den erfragten Wert; ohne `ask` bleibt alles,
wie es ist (`Input = void`, `action()` ohne Parameter):

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `ask` | `AskSpec<Input>` | nein | Was der Dialog erfragt, bevor die Aktion läuft. Ohne `ask` verhält sich alles wie heute | `AskForTarget` |
| `action` | `(input: Input) => Promise<ActionResult>` | ja | Bekommt den erfragten Wert. Ohne `ask` ist `Input` `void`, die Signatur bleibt `() => …` | jede |

```ts
export interface AskSpec<Input> {
  /** Wie der Dialog heißt und wie sein Knopf beschriftet ist — `ConfirmSpec`
   *  ohne `body`, denn den füllt `render`. */
  title: string;
  confirmLabel: string;
  tone?: "danger";
  /** Der Stand, mit dem der Dialog aufgeht. */
  initial: Input;
  /** Der Inhalt. `set` meldet den neuen Stand zurück — kontrolliert, damit
   *  der Bestätigungsknopf mitbekommt, ob er darf. */
  render: (state: { value: Input; set: (next: Input) => void }) => ReactNode;
  /** Solange `false`, bleibt der Bestätigungsknopf aus. Ohne Angabe ist jeder
   *  Stand gültig — auch der leere. */
  valid?: (value: Input) => boolean;
}
```

`BulkAction` reicht durch und hängt die Keys an:

| Prop | Typ | Pflicht | Bedeutung |
|---|---|---|---|
| `ask` | `(keys: string[]) => AskSpec<Input>` | nein | Eine Funktion, weil der Dialogtext die Zahl nennen darf: „12 Umsätze einem Sachverhalt zuordnen" |
| `action` | `(keys: string[], input: Input) => Promise<ActionResult>` | ja | Wie heute, plus der erfragte Wert |

**`ask` und `confirm` schließen einander aus.** Zwei Dialoge nacheinander für
eine Handlung gibt es nicht; `ask` **ist** der Bestätigungsdialog und trägt
deshalb `title`, `confirmLabel` und `tone` selbst. Beides gesetzt ist ein
Typfehler, keine Laufzeitentscheidung.

**Kann bewusst nicht:**

- **Den Dialoginhalt kennen.** Kein Formular, kein Picker, keine Feldliste im
  Set — `render` ist die Grenze. Wer ein Formular braucht, komponiert es aus
  `Field`/`Input` an der Aufrufstelle.
- **Mehrstufig fragen.** Ein Dialog, ein Wert, eine Aktion. Ein Assistent mit
  Schritten ist `StepRail`.
- **Den Wert prüfen.** `valid` ist ein Prädikat des Aufrufers; das Set kennt
  keine Regel über fremde Werte.
- **Nach dem Fehlschlag den Stand behalten.** Schlägt `action` fehl, bleibt die
  Auswahl (wie heute), der Dialog ist zu und der Stand fällt auf `initial`
  zurück. Ein halb ausgefülltes Formular über einen Fehlversuch zu retten
  wäre ein zweiter Zustand — dafür gibt es keinen belegten Fall.

## Stories

Abgeleitet nach §6: 0 neue Zustände (`ActionButton` hat seine fünf) +
0 Enums + 1 Layout (`ask` gesetzt/nicht) + 1 Callback (der Rundlauf mit
`useState`) + 1 „im Einsatz" = **3**.

| Story | Beweist |
|---|---|
| `AskForTarget` | Der Dialog mit einem Eingabefeld; `action` bekommt den Wert, der Bestätigungsknopf ist aus, solange nichts gewählt ist |
| `AskInvalid` | `valid` sperrt: Dialog offen, Knopf aus, kein Weg zur Aktion |
| `BulkAsk` | Der echte Fall: Auswahl in `DataTable`, „12 Umsätze zuordnen", im Dialog der `CasePicker` (0084), danach ist die Auswahl leer *(Hieß in der Spec `BulkAskInUse`, gebaut ist `BulkAsk` — berichtigt 2026-09-08.)* |

## Abnahmekriterien (variabler Block)

- Ohne `ask` ist die Signatur unverändert `action: () => Promise<ActionResult>`
  — keine bestehende Aufrufstelle ändert sich (Typcheck über das ganze Set)
- `ask.render` bekommt `value` und `set`, und der Bestätigungsknopf spiegelt
  `valid` (`AskInvalid`)
- `action` bekommt genau den Wert, den der Dialog zuletzt hatte (`AskForTarget`)
- `ask` und `confirm` zusammen sind ein **Typfehler** (Abnahme prüft die
  Typdefinition, nicht das Verhalten)
- Über `BulkAction` kommen Keys **und** Wert an, und die Auswahl leert sich
  nach Erfolg wie bei jeder anderen Sammelaktion (`BulkAskInUse`)
- Ersetzt in `[year]/banks/offen` die alte Arbeitsliste ohne Funktionsverlust

## Offene Fragen

1. Trägt der Dialog die Zahl der gewählten Zeilen im Titel, oder gehört sie in
   den Inhalt? *Ohne Antwort: in den Titel — `ask` ist deshalb eine Funktion
   der Keys.*
2. Braucht `render` die Keys selbst (etwa um die Summe zu zeigen)? *Ohne
   Antwort: nein — die `BulkAction` schließt sie beim Bauen des `AskSpec` ein,
   wenn sie sie braucht.*

## Ausbau

Ein Dialog, der beim Öffnen **lädt** (Vorschläge holen, bevor gefragt wird),
wäre `ask.load?: (keys) => Promise<Input>` mit dem Ladezustand des Dialogs.
Kein Platzhalter im Code: kommt, wenn eine Aufrufstelle ihn braucht.

## Gebaut 2026-09-08

`ActionButton` ist generisch über den erfragten Wert (`ActionButton<Input>`),
`ask` und `confirm` schließen sich über zwei Prop-Formen aus, und `BulkAction`
reicht durch. Drei Stories, alle im Browser durchgespielt.

**Eine Sache, die die Spec nicht vorhergesehen hat: die Liste.**
`selection.actions` ist ein Array, und TypeScript hat keinen existenziellen
Typ — die Position kann nicht sagen „irgendein `Input`, je Eintrag ein
anderer". Zwei Dinge fangen das:

- **`AnyBulkAction`** (`BulkAction<any>`) ist diese Lücke, einmal benannt und
  an einer Stelle. Sie steht in der Listen-Position, nirgends sonst.
- **`bulkAction<Input>(…)`** typisiert den einzelnen Eintrag, damit die Prüfung
  dort bleibt, wo sie hingehört: `ask.initial` und der zweite Parameter von
  `action` sind nachweislich dasselbe. Ohne den Helfer müsste der Aufrufer
  `input` von Hand annotieren, und **nichts** prüfte die Kopplung — genau der
  Fehler, gegen den 0121 gebaut ist.
- **Der Typ wird genannt, nicht erraten:** `bulkAction<string>({…})`. Ein
  vollständiges `AskSpec` hat `render` und `valid`, deren Parameter `Input` in
  eine kontravariante Position bringen; die Inferenz landet dann auf
  `unknown`. Ein Wort an der Aufrufstelle sagt, wonach gefragt wird, und alles
  darin wird dagegen geprüft.

`BulkButton` ist als eigene kleine Komponente entstanden, weil ein Eintrag
seinen Typparameter nur dort halten kann.

**Im Browser gemessen** (`scripts/cdp.mjs`, drei Stories):

| Story | Gemessen |
|---|---|
| `AskInvalid` | Dialog offen, Bestätigungsknopf `disabled` — kein Weg zur Handlung, auch nicht über Enter (`onConfirm` prüft `allowed`) |
| `AskForTarget` | Nach der Auswahl ist der Knopf an; nach dem Bestätigen steht „Zugeordnet an 2026-0413" — die Handlung hat genau den Wert bekommen, den der Dialog hielt |
| `BulkAsk` | Titel „7 Sachverhalte zuordnen" — die Zahl kommt aus den Schlüsseln, deshalb ist `ask` eine Funktion. Daneben eine Aktion ohne `ask` in derselben Liste |

`pnpm typecheck` und die fünf Wächter auf Exit 0. Im Barrel: `bulkAction`,
`AnyBulkAction`, `AskSpec`.

**Zwei Zusicherungen**, beide kommentiert und beide an der Union-Grenze: der
Anfangswert ohne `ask` (`Input` ist dann `void`, was der Compiler über die
Union nicht sieht) und `undefined as Input` im Zweig ohne `ask` in
`BulkButton`.

### Nacharbeit 2026-09-08 (aus der Abnahme von 0122)

**Der zugesagte Typausschluss existierte nicht.** Diese Spec schreibt seit dem
ersten Entwurf, `ask` und `confirm` schlössen einander aus — als Typfehler,
nicht als Laufzeitentscheidung. Bei `ActionButton` stimmt das, dort steht eine
echte Union. `BulkAction` war dagegen ein Interface mit unabhängigen optionalen
Feldern, und daneben ein Kommentar, der den Ausschluss behauptete. Beides
zusammen übersetzte fehlerfrei, und zur Laufzeit fiel still eine Hälfte weg.
Die Abnahme von 0122 hat es mit einer Typprobe belegt.

`BulkAction` ist jetzt eine Union über zwei Formen: mit `ask` — dann bekommt
`action` die Schlüssel **und** den Wert — oder mit wahlfreiem `confirm`, dann
nur die Schlüssel. Die Probe scheitert seither wie vorgesehen.

**Eine der beiden Zusicherungen ist dabei weggefallen:** `undefined as Input`
in `BulkButton` gab es nur, weil der alte Typ nicht narrowte. Übrig bleibt die
in `ActionButton`, und die ist begründet.
