# 0136 · `Tabs`: ein leiser Reiter für die Technik-Sicht

| | |
|---|---|
| Status | spec — geschrieben 2026-09-09 |
| Stufe | `primitives/` (`Nav.tsx`, `Tabs`/`TabItem`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: jede Anwendung mit einer Debug-Ansicht neben fachlichen Sichten |
| Quelle | `docs/detailseiten-standard.md` D12 (Owner-Entscheid 2026-09-08) |
| Ersetzt | nichts — fehlende Prop an einem gebauten Baustein |
| Blockiert | jede Detailseite: der Reiter „Rohdaten" steht heute optisch gleichrangig neben den fachlichen Reitern |
| Spec von / am | Claude, 2026-09-09 |

## Ziel

Der Detailseiten-Standard verlangt auf **jeder** Entitäts-Detailseite einen
letzten Reiter „Rohdaten" (D12): für alle sichtbar, ohne Zähler, ohne Alarm —
und **optisch zurückgenommen**, weil er auf der Debug-Stufe der
Kritikalitätsskala steht (A7 `neutral`) und nichts fordert. Sichtbarkeit ist
nicht Prominenz: ein Reiter, der aussieht wie „Positionen", behauptet, er sei
so wichtig wie „Positionen".

`TabItem` kann das heute nicht. Es kennt `key`, `label`, `count`, `dot`,
`alarm`, `href` — jede dieser Eigenschaften macht einen Reiter **lauter**,
keine leiser. Wer den Rohdaten-Reiter dämpfen will, hat heute nur den Weg über
eine eigene CSS-Klasse an der Aufrufstelle, und damit hätte jede Detailseite
ihre eigene Antwort auf dieselbe Frage.

## Einordnung

- **Wiederverwenden:** `Tabs` (`@when Views with their own content, one
  active; counter and alarm on the tab`) ist richtig — es fehlt eine
  Ausprägung, kein Baustein.
- **Erweitert, weil:** `spec-schreiben` §3.2 — eine Designentscheidung, die auf
  jeder Detailseite wiederkommt. Zwei Konsumenten gibt es sofort (Beleg- und
  Sachverhaltsseite haben den Reiter heute schon), ein dritter folgt mit L-258.
- **Setzt auf:** `Tabs`, `v3.css` (`.v2tab`).

## Der Fund, der die erste Antwort verwirft

Der Auftrag schlug vor, „leise" heiße `--color-text-muted`. **Das geht nicht:**
`.v2tab` steht in Ruhe **bereits** auf `--color-text-muted`
(`src/styles/v3.css:656`). Ein Reiter, der auf diesen Wert gesetzt wird, sieht
exakt aus wie jeder andere — die Prop wäre gebaut und wirkungslos, und das
fiele erst im Browser auf.

Die Leiter der Textfarben hat aber eine Stufe darunter:
`--color-text-subtle` (`#717171`, **4,88:1** auf Weiß, 4,51:1 auf
`bg-soft` — beides über der AA-Grenze von 4,5:1 für Fließtext, nachgerechnet
von `pnpm check:contrast`). Das ist die einzige Stufe, die dämpft, ohne unter
die Lesbarkeit zu fallen; eine weitere gibt es in `tokens.css` nicht, und eine
neue wäre hier falsch — ein Reiter, den alle sehen sollen, darf nicht am
Kontrastminimum entlangschrammen.

**Also: `--color-text-subtle` in der Ruhefarbe, sonst nichts.**

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `quiet` | `true` | nein | Der Reiter steht auf der Debug-Stufe: **Ruhefarbe** eine Stufe zurück. Nichts sonst — gleiche Höhe, gleiche Trefferfläche, gleicher Hover, gleicher Fokusring, gleicher aktiver Rand | `Quiet` |

**`quiet` schließt `count`, `dot` und `alarm` aus — und zwar im Typ:**

```ts
export type TabItem = TabItemBase &
  ( | { quiet: true; count?: never; dot?: never; alarm?: never }
    | { quiet?: never; count?: number; dot?: boolean; alarm?: boolean } );
```

Ein leiser Reiter mit einem roten Zähler ist ein Widerspruch: `alarm` sagt
„sieh her", `quiet` sagt „später". Dass D12 den Zähler an „Rohdaten" ohnehin
verbietet, ist das Argument **für** die Regel, nicht der Ersatz für sie.

Der Ausschluss steht bewusst nicht als Satz im JSDoc. Das ist die Lehre aus
0121/0122: ein Ausschluss, der nur im Kommentar steht, ist keiner — er wird
beim ersten Aufrufer verletzt, der den Kommentar nicht liest, und der
Typcheck schweigt. `RowAction` und `BulkAction` tragen ihre Ausschlüsse seit
dem 2026-09-08 als Union; hier gilt dasselbe.

**Kann bewusst nicht:**

- **Deaktivieren.** Ein leiser Reiter ist anklickbar wie jeder andere. Wer
  einen Reiter sperren will, zeigt ihn nicht.
- **Verkleinern.** Höhe und Trefferfläche bleiben (V1, §9: 24 × 24 px). Leise
  ist eine Frage der Farbe, nicht der Größe.
- **Eine zweite Dämpfstufe.** `tone?: "default" | "quiet"` wäre die
  allgemeinere Form, aber es gibt genau einen Fall. A12: keine Prop, die
  nichts tut. Kommt eine zweite Stufe, wird aus dem Boolean ein Enum — der
  Umbau kostet dann eine Zeile je Aufrufer.

## Verhalten

| Zustand | Normal | `quiet` |
|---|---|---|
| Ruhe | `--color-text-muted` | `--color-text-subtle` |
| Hover | `--color-text` | `--color-text` — **gleich** |
| Aktiv | `--color-primary`, 600, farbiger Unterstrich | **gleich** |
| Fokus | `2px --color-focus`, `outline-offset: -2px` | **gleich** |

Der aktive Zustand ist absichtlich nicht gedämpft: wer den Reiter geöffnet
hat, sieht dort hin, und ein leiser aktiver Reiter würde die Leiste
zweideutig machen — welcher ist offen?

Im CSS eine Zeile: `.v2tab.is-quiet { color: var(--color-text-subtle); }`,
gesetzt **vor** `:hover` und `.is-active`, damit beide sie schlagen.

## Stories

Nach §6: ein Layout-Boolean → eine Story. Die drei bestehenden
(`Tabs`-Stories in `Nav.stories.tsx`) decken die lauten Fälle.

| Story | Beweist |
|---|---|
| `Quiet` | Eine Leiste wie auf einer Detailseite: vier fachliche Reiter (einer mit Zähler, einer mit Alarm) und „Rohdaten" als letzter, leise. Dazu dieselbe Leiste mit „Rohdaten" **aktiv** — der aktive Zustand ist unverändert |

Ausgelassen mit Grund: **lädt** und **Fehler** — eine Reiterleiste hat keine
eigenen Datenzustände, sie ist Navigation (wie bei `Tabs` schon begründet).
**Leer** ebenso: eine Leiste ohne Reiter wird nicht gerendert.

## Ausbau

Eine zweite gedämpfte Stufe (etwa „veraltet, aber noch erreichbar") würde aus
`quiet: true` ein `tone`-Enum machen. Auslöser wäre ein zweiter Fall im
Standard — heute gibt es ihn nicht, und ein Enum mit einem Wert ist ein
Boolean mit mehr Schreibarbeit.

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

- [ ] `quiet` setzt **nur** die Ruhefarbe auf `--color-text-subtle`; Hover,
      aktiv und Fokus sind zeichengleich mit einem normalen Reiter (Story
      `Quiet`, im DOM verglichen)
- [ ] Die Ruhefarbe ist **nicht** `--color-text-muted` — sonst wäre die Prop
      wirkungslos, siehe „Der Fund" (`grep -n "is-quiet" src/styles/v3.css`)
- [ ] Trefferfläche und Zeilenhöhe messbar gleich wie beim normalen Reiter
      (`Quiet`, `getBoundingClientRect` über beide)
- [ ] `quiet` zusammen mit `count`, `dot` oder `alarm` ist ein **Typfehler**,
      kein dokumentierter Vorrang (Nachweis: eine auskommentierte Zeile in der
      Story, die den Fehler nennt)
- [ ] `pnpm check:contrast` bleibt grün und rechnet die neue Angabe nach

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |
