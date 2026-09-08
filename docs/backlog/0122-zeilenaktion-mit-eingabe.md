# 0122 · Die Zeilenaktion darf auch fragen

| | |
|---|---|
| Status | spec |
| Stufe | `patterns/DataTable` — `RowAction`, Nachtrag zu **0121** |
| Klassen-Test | wie 0121: ja, unverändert — „vor dem Ausführen etwas erfragen" ist kein Ludwig-Begriff |
| Quelle | Rückmeldung `ludwig-manager` 2026-09-08 nach dem Bau von 0121 (Befund **L-219**): die Lieferantenwahl bei „Einzeln" musste als dritte **Sammel**aktion gebaut werden, weil die Zeilenaktion nicht fragen kann |
| Wartet darauf | **Zwei** Seiten, beide mit demselben Behelf: `banks/offen` (Lieferantenwahl) und Upload & Inbox (die Einordnungs-Korrektur, Rang 4 des Seitenprofils — eine Zeilenaktion, die vorerst Sammelaktion ist) |
| Setzt voraus | 0121 (gebaut) — `AskSpec` und die Dialog-Mechanik stehen |
| Spec von / am | Claude, 2026-09-08 |

## Warum das ein Nachtrag ist und keine neue Idee

0121 hat den Rückkanal an `ActionButton` gebaut und über `BulkAction`
durchgereicht. `RowAction` blieb dabei zurück — nicht aus einem Grund,
sondern weil der Blocker aus `banks/offen` eine Sammelaktion war. Die Folge
ist in der App schon sichtbar: die Lieferantenwahl ist dort eine
**Sammel**aktion („Einzeln, mit Lieferant"), obwohl sie eine Zeile betrifft.
Eine Handlung steht an der falschen Stelle, weil die Schnittstelle die
richtige nicht anbietet.

Das ist derselbe Fall wie `confirm`, das `RowAction` **schon** hat
(`DataTable.tsx:91`). `ask` fehlt dort einfach.

## Schnittstelle

`RowAction` wird generisch über den erfragten Wert, wie `BulkAction`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `ask` | `AskSpec<Input>` | nein | Was der Dialog erfragt, bevor die Handlung läuft. Kein Funktionstyp wie bei `BulkAction`: die Zeile ist schon bekannt, wenn die Aktion gebaut wird — der Aufrufer schließt sie ein | `RowAsk` |
| `action` | `(input: Input) => Promise<ActionResult>` | nein | Bekommt den erfragten Wert. Ohne `ask` bleibt sie `() => …` | `RowActions` |

Dazu, wie in 0121:

- **`ask` schließt `confirm` aus**, im Typ.
- **`ask` schließt `href` aus.** Ein Sprung fragt nichts — das steht heute
  schon so da (`href` **oder** `action`), `ask` gehört zur Handlung.
- **`AnyRowAction`** für die Listen-Position, und **`rowAction<Input>()`**
  für den einzelnen Eintrag. Beides aus demselben Grund wie in 0121:
  TypeScript hat keinen existenziellen Typ, und ohne den Helfer prüft nichts,
  dass `ask.initial` und der Parameter von `action` dasselbe sind.

**Kann bewusst nicht:** alles, was 0121 nicht kann — den Dialoginhalt kennen,
mehrstufig fragen, den Wert prüfen, den Stand über einen Abbruch retten.

## Stories

Abgeleitet nach §6: 0 neue Zustände + 0 Enums + 0 Layout + 1 Callback (der
Rundlauf) + 0 „im Einsatz" (die vorhandene `RowActions`-Story ist der Ort) =
**1**.

| Story | Beweist |
|---|---|
| `RowAsk` | Eine Zeilenaktion öffnet ihren Dialog, die Handlung bekommt den Wert, und daneben stehen eine mit `confirm` und ein `href` — drei Sorten in einer Leiste |

## Abnahmekriterien (variabler Block)

- Ohne `ask` ist die Signatur unverändert — keine bestehende Aufrufstelle
  ändert sich (Typcheck über das ganze Set)
- `ask` und `confirm` zusammen sind ein Typfehler; `ask` und `href` ebenso
- Die Handlung bekommt genau den Wert, den der Dialog zuletzt hielt (`RowAsk`)
- Die Zeilenaktion im Menü (`OverflowMenu`, E8) öffnet denselben Dialog wie
  die inline stehende
- Ersetzt in `banks/offen` die Sammelaktion „Einzeln, mit Lieferant" durch
  eine Zeilenaktion

## Offene Fragen

Keine. Der Schnitt folgt 0121, und der ist gebaut und in der App im Einsatz.
