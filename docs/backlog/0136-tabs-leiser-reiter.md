# 0136 · `Tabs`: ein leiser Reiter für die Technik-Sicht

| | |
|---|---|
| Status | fertig — abgenommen 2026-09-09, am selben Tag nachgearbeitet |
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

Nach §6: ein Layout-Boolean → eine Story. Die **fünf** bestehenden in
`Tabs.stories.tsx` decken die lauten Fälle.

| Story | Beweist |
|---|---|
| `Quiet` | Eine Leiste wie auf einer Detailseite: **fünf** fachliche Reiter (einer mit Zähler, einer mit Alarm) und „Rohdaten" als sechster, leise. Dazu dieselbe Leiste mit „Rohdaten" **aktiv** — der aktive Zustand ist unverändert |

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

Fremde Abnahme am 2026-09-09 (zweiter Agent, hat nicht gebaut). Gemessen im
eigenen Lauf mit `scripts/cdp.mjs` gegen den Dev-Server auf 6107, 1100 px,
Story `Quiet` — die Zahlen unten stammen aus diesem Lauf, nicht aus dem des
Bauenden. **Kein Mangel im Verhalten**; die zwei ✗ stehen im Text der Spec.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| **Fest** | | |
| `pnpm typecheck` und `pnpm build` grün | beide am 2026-09-09 gelaufen, `exit 0` (`tsc --noEmit`; Storybook-Build nach `storybook-static`) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `Tabs`/`TabItem` in `primitives/Nav.tsx`, Story `primitives/Tabs.stories.tsx` daneben. `Nav.tsx` trägt vier Bausteine, und jeder hat seine eigene Story-Datei (`Tabs`, `Segmented`, `FilterChips`) — Hausordnung, keine Abweichung. Titel `v3/Primitives/Navigation/Tabs` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `@when`/`@instead` an `Tabs` (`Nav.tsx:63–66`); die neuen JSDoc der Union englisch (`:20–31`, `:35–43`). `pnpm check:when` und `pnpm check:language` grün | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `v3.css:666` `.v2tab.is-quiet { color: var(--color-text-subtle); }` — ein Token, kein Hex, kein px; `Nav.tsx` setzt nur die Klasse (`:81`) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `Quiet` (`Tabs.stories.tsx:111`); **lädt**, **Fehler** und **leer** mit Grund ausgeschlossen (Navigation hat keine eigenen Datenzustände) | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | durchgegangen; die zwei App-Punkte übersprungen (backlog/README). Trefferfläche 42,9 px hoch (≥ 24), Kontrast 4,88:1, Fokusring sichtbar, keine Versalien, kein Emoji | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | eigener `cdp.mjs`-Lauf des Abnehmenden, 1100 px, beide Leisten der Story | ✓ |
| **Schnittstelle Zeichen für Zeichen** | | |
| Eine Prop: `quiet`, Typ `true`, nicht Pflicht | `Nav.tsx:44` `quiet: true;` in der ersten Union-Hälfte, optional durch die zweite (`:50` `quiet?: never`) — genau die Tabelle | ✓ |
| Der Union-Codeblock der Spec gegen den Code | `Nav.tsx:32–61`: `TabItemBase & ({quiet: true; count?: never; dot?: never; alarm?: never} \| {quiet?: never; count?: number; dot?: boolean; alarm?: boolean})` — zeichengleich, nur die JSDoc stehen dazwischen | ✓ |
| „`TabItem` kennt `key`, `label`, `count`, `dot`, `alarm`, `href`" | `TabItemBase` (`:14–18`) trägt `key`, `label`, `href?`; die Union die drei anderen. Aufzählung stimmt | ✓ |
| **Variabel** | | |
| `quiet` setzt **nur** die Ruhefarbe; Hover, aktiv und Fokus zeichengleich | gemessen, Story `Quiet`: Hover leise `rgb(45,45,45)` = Hover normal `rgb(45,45,45)` (`--color-text`); aktiv leise `rgb(26,58,92)`, Gewicht 600, Unterstrich `rgb(26,58,92)` — Zeichen für Zeichen gleich dem aktiven normalen Reiter; Fokus beide `rgb(59,143,196) solid 2px`, `outline-offset: -2px`. Der Grund steht im CSS: `.v2tab.is-quiet` (0-2-0) steht **vor** `:hover` und `.is-active` (beide 0-2-0), die späteren schlagen sie | ✓ |
| Die Ruhefarbe ist **nicht** `--color-text-muted` | `grep -n "is-quiet" src/styles/v3.css` → `666: .v2tab.is-quiet { color: var(--color-text-subtle); }`. Gemessen: „Rohdaten" `rgb(113,113,113)` = `#717171`, die fünf Nachbarn `rgb(92,92,92)` = `#5C5C5C`. Der Unterschied ist da und genau eine Stufe | ✓ |
| Trefferfläche und Zeilenhöhe messbar gleich | alle sechs Reiter **42,9 px** hoch, `padding: 10px 16px`, `font-size: 13.5px`, `font-weight: 500` — der leise unterscheidet sich in nichts als der Farbe. Breite 93,4 px („Rohdaten") gegen 76,1–123,2 px der Nachbarn, das ist die Beschriftung | ✓ |
| `quiet` mit `count`/`dot`/`alarm` ist ein **Typfehler** | Typprobe des Abnehmenden (`tsc --noEmit` auf einer Datei außerhalb `src/`, danach gelöscht): `{quiet: true, count: 3}`, `{… dot: true}`, `{… alarm: true}` → je `TS2322`. **Der Ausschluss ist dicht**, auch ohne Objektliteral: über eine Zwischenvariable (kein Frische-Prüfung) fällt er ebenso (`TS2322`, beide Union-Hälften genannt). Abweichung zur Form: die Spec verlangt „eine auskommentierte Zeile in der Story", gebaut ist ein JSDoc-Satz (`Tabs.stories.tsx:107–109`) — mit Grund, ein auskommentierter Fehler wird nie wieder geprüft. Substanz erfüllt | ✓ |
| `pnpm check:contrast` bleibt grün und rechnet die neue Angabe nach | `pnpm check:contrast` grün, **33 Angaben** nachgerechnet, darunter `tokens.css:48` „4.88:1 auf Weiss, 4.51:1 auf bg-soft" für `--color-text-subtle`. Nachgerechnet auch von Hand: `#717171` gegen Weiß = **4,88:1**, über 4,5:1. Eine **neue** Angabe hat 0136 nicht geschrieben — die CSS-Zeile nennt keine Zahl, sie nennt das Token; das Kriterium meint die Angabe, die den Entscheid trägt, und die steht | ✓ |
| **Ränder der Tabelle** (Nachtrag 2026-09-08) | | |
| „vier fachliche Reiter (einer mit Zähler, einer mit Alarm)" | die gebaute Story hat **fünf** fachliche Reiter — Übersicht, Details, Positionen (14), Vorsteuer (2, Alarm), Verlauf — und „Rohdaten" als sechsten. Das Zahlwort ist eine Kopie, und Kopien altern | ✗ |
| „Die drei bestehenden (`Tabs`-Stories in `Nav.stories.tsx`) decken die lauten Fälle" | **zwei Fehler in einem Satz**: es sind **fünf** bestehende (`WithCounters`, `WithAlarm`, `WithoutCounters`, `AllEmpty`, `TabsWithDot`), und **`Nav.stories.tsx` gibt es nicht** — die Datei heißt `Tabs.stories.tsx` und hat immer so geheißen | ✗ |
| Randbeobachtung: `quiet={false}` ist ebenfalls ein Typfehler | Typprobe: `{key, label, quiet: false}` → `TS2322` („Type 'false' is not assignable to type 'true'"). Wer den Reiter bedingt dämpfen will, spreizt (`...(raw ? { quiet: true as const } : {})`) — dieselbe Ergonomie wie bei `RowAction`/`BulkAction`, kein Mangel, aber es steht nirgends | ✓ |

Abgenommen von / am: zweiter Agent (nicht der Bauende), 2026-09-09 · Offene
Punkte: **zwei**, beide im Text der Spec, keiner im Verhalten. Der Code ist
abnahmefertig; die Nacharbeit ist ein Zahlwort und ein Dateiname.

## Gebaut 2026-09-09

`TabItem` ist jetzt eine **Union** über zwei Formen — laut (Zähler, Punkt,
Alarm) oder leise (`quiet`), nie beides. Dazu eine CSS-Zeile und eine Story.

**Gemessen** (`scripts/cdp.mjs`, 1100 px, Story `Quiet`):

| Was | Gemessen |
|---|---|
| Ruhefarbe „Rohdaten" | `rgb(113, 113, 113)` = `#717171` = `--color-text-subtle` |
| Ruhefarbe der Nachbarn | `rgb(92, 92, 92)` = `#5C5C5C` = `--color-text-muted` |
| Höhe aller Reiter | **43 px**, auch des leisen — leise ist eine Frage der Farbe, nicht der Größe |
| „Rohdaten" **aktiv** | `rgb(26, 58, 92)`, die Primärfarbe — der aktive Zustand ist **nicht** gedämpft |

Der zweite und der vierte Punkt sind die eigentliche Prüfung: der Unterschied
ist da, und er ist genau **eine** Stufe — hätte die Spec bei
`--color-text-muted` bleiben dürfen, stünden in der ersten Spalte zweimal
dieselbe Zahl.

**Der Ausschluss steht im Typ.** `{ quiet: true, count: 3 }` ist ein
Typfehler, kein Kommentarverstoß. Die Story nennt die Zeile, die es beweist,
statt sie auskommentiert stehen zu lassen — ein auskommentierter Fehler wird
nie wieder geprüft.

**Der Sprachwächter hat mich dabei erwischt.** Die Union kam mit deutschen
Kommentaren in `Nav.tsx` — eine Code-Datei, in der nur Englisch steht
(CLAUDE.md). Die vorhandenen deutschen Zeilen daneben waren jahrelang
unbeanstandet, weil der Wächter nur **angefasste** Dateien prüft; wer eine
Datei anfasst, erbt sie. Übersetzt sind jetzt beide.

## Nacharbeit zur Abnahme, 2026-09-09

Zwei Mängel, beide an den Rändern der Story-Tabelle: „vier fachliche Reiter"
(es sind fünf) und „die **drei** bestehenden Stories in `Nav.stories.tsx`" —
zwei Fehler in einem Satz, denn es sind **fünf**, und eine Datei
`Nav.stories.tsx` hat es nie gegeben; sie heißt `Tabs.stories.tsx`.

Der zweite ist der lehrreichere: ich habe den Dateinamen aus dem Namen der
**Komponente** abgeleitet (`Tabs` liegt in `Nav.tsx`) statt nachzusehen. Ein
Ort, den man errät, ist derselbe Fehler wie eine Zahl, die man errät — nur
fällt er später auf.

Die Abnahme hat beide bewussten Entscheidungen bestätigt und dabei mehr
gemessen als verlangt: die Union ist auch **über eine Zwischenvariable** dicht,
nicht bloß gegen die Excess-Property-Prüfung. Nebenbefund von dort:
`quiet={false}` ist ebenfalls ein Typfehler — wer bedingt dämpfen will, muss
spreizen. Das ist der Preis der Union und er ist es wert.
