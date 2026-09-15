# 0188 · BalanceCheck — geht es auf?

| | |
|---|---|
| Status | Abnahme |
| Stufe | `patterns/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: Anfang plus Bewegungen gegen ein Ziel, die Differenz mit Vorzeichen — kein Fachwort |
| Quelle | App-Roadmap `uikit-entity-roadmap-2026-09.md` Abschnitt B, **B6**; `docs/detailseiten-pattern.md` Spec **S6** |
| Ersetzt | die drei Formen, in denen das Set und die App heute dieselbe Frage beantworten: `Messages` im `JournalEntryEditor`, die Rest-Zeile im `JournalEntryGrid`, die Saldo-Sätze im Sachverhalt |
| Blockiert | den Fuß der Kontoauszugsseite (`kontoauszug.md` Rang 6, L-58), Schritt 6 der Stapelabnahme (Verrechnungskonto auf null), die Verprobung (F201) |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Fünf Stellen stellen dieselbe Frage — **geht es auf?** — und jede antwortet
anders: „Rest 12,40 €" im Raster, „Der Saldo ist nicht ausgeglichen: Rest
12,40 €." im Sachverhalt, eine Meldung im Editor, ein Zielsaldo null am
Verrechnungskonto, Anfang und Ende am Kontoauszug. Die Zahl ist überall
dieselbe Rechnung; verschieden ist nur der Satz drumherum.

## Einordnung

- **Wiederverwenden:** keiner der vorhandenen Bausteine rechnet und sagt es in
  einem: `Messages` trägt Meldungen, `ReconciliationTable` (0161) stellt zwei
  Mengen gegenüber, `DiffView` (0179) zwei Stände eines Satzes.
- **Neu, weil:** Regel 4 aus `spec-schreiben` §3 — eine Komposition aus
  Primitives mit **einer** Rechnung, auf mindestens zwei Screens.
- **Zuschnitt:** eine Datei `BalanceCheck.tsx`.
- **Setzt auf:** `AmountCell`, Tokens aus `v3.css`; kein Zustand, kein Client.

## Schnittstelle

```ts
export interface BalanceLine {
  key: string;
  label: ReactNode;
  value: number;
  /** Ein Halbsatz unter der Zeile — woher die Zahl kommt. */
  hint?: ReactNode;
}
```

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `lines` | `readonly BalanceLine[]` | ja | die Summanden: Anfangssaldo, Eingänge, Ausgänge — oder Soll und Haben | `Statement` |
| `target` | `{ label: ReactNode; value: number }` | ja | worauf es hinauslaufen soll: der Endsaldo des Auszugs, die Null des Verrechnungskontos, die Soll-Summe | `Clearing` |
| `currency` | `Currency` | ja | ein Betrag ohne Währung ist eine Vermutung (Hausregel) |  |
| `tolerance` | `number` | nein | ab wann es **nicht** mehr aufgeht; Vorgabe `0.005` — ein halber Cent ist Rundung (dieselbe Grenze wie im Raster, 0113) | `Edges` |
| `balanced` | `string` | nein | der Satz, wenn es aufgeht; Vorgabe „Geht auf." | `Statement` |
| `off` | `(difference: number) => ReactNode` | nein | der Satz, wenn nicht; Vorgabe „Es fehlen X" bzw. „X zu viel" | `Off` |
| `tone` | `"surface" \| "bare"` | nein | `bare` im Fuß einer Karte, die schon einen Rahmen hat | `InUse` |

**Die eine Rechnung macht das Pattern selbst**: es summiert `lines` und zieht
`target` ab. Das ist der Grund, warum es existiert — jede andere Ableitung
bleibt beim Aufrufer (E2 gilt für Fachlogik, nicht für die Addition, die hier
die Aussage **ist**).

**Kann bewusst nicht:** die Differenz verbuchen („Rest einsetzen" ist eine
Aktion des Editors), mehr als ein Ziel prüfen, Perioden vergleichen
(→ `PeriodGrid`, 0162), zwei Mengen abgleichen (→ `ReconciliationTable`).

## Verhalten

Server-Component. Die Summanden stehen untereinander, jeder mit seiner Zahl
rechts (V3, Tabellenziffern); darunter die Zielzeile, und darunter **eine**
Ergebniszeile: die Differenz mit Vorzeichen und der Satz dazu.

- Geht es auf, steht der Erfolgssatz mit Haken — ein Ergebnis, kein leeres Feld
  (L6). Die Differenz steht dann **nicht** noch einmal als „0,00 €".
- Geht es nicht auf, steht die Differenz vorzeichenrichtig und das Wort dazu:
  Farbe allein sagt nichts (V7).
- Negative Summanden behalten ihr Vorzeichen, ohne Farbe (V6).

## Stories

Titel `v3/Patterns/Prüfen/BalanceCheck`.

| Story | Beweist |
|---|---|
| `Statement` | Anfangssaldo + Eingänge − Ausgänge = Endsaldo, geht auf |
| `Clearing` | Verrechnungskonto mit Zielsaldo null |
| `Entry` | Soll gegen Haben eines Buchungssatzes |
| `Off` | eine Differenz von 12,40 € — mit Vorzeichen und Satz |
| `Edges` | siebenstellig, negativ, eine Toleranz von einem halben Cent, 360 px breit |
| `InUse` | `tone="bare"` im Fuß einer Karte, wie am Kontoauszug |

## Abnahmekriterien

Fest: wie in 0184.

Variabel (aus dieser Spec):

- [ ] Die Ergebniszeile steht **einmal**; bei Gleichstand ohne die Null (Story `Statement`, DOM)
- [ ] Die Differenz trägt Vorzeichen **und** Wort (Story `Off`)
- [ ] Toleranz: 0,004 € gilt als ausgeglichen, 0,006 € nicht (Story `Edges`)
- [ ] Zahlen rechtsbündig mit Tabellenziffern, Etiketten links (V3, gemessen)
- [ ] `tone="bare"` bringt keine zweite Fläche (Story `InUse`, gemessen)
- [ ] Kein Fachwort in Namen, Props und Vorgabetexten (`grep`)

## Offene Fragen

1. Soll das Pattern die Summe der Summanden **anzeigen** (eine Zwischenzeile
   „zusammen") oder nur die Differenz? — ohne Antwort: **nur die Differenz**;
   die Zwischensumme ist eine zweite Zahl für dieselbe Aussage.
2. Gehört „Rest einsetzen" als Weg dazu? — ohne Antwort: **nein**, das ist eine
   Aktion des Editors; das Pattern stellt fest, es bucht nicht.

## Gebaut (2026-09-15)

`src/ui/v3/patterns/BalanceCheck.tsx`, Server-Component, sechs Stories unter
`v3/Patterns/Prüfen/BalanceCheck`, CSS `.v3bal*` in `src/styles/v3.css`.

Eine Abweichung von der Spec: die Vorgabe für `off` lautete „Es fehlen X" —
gebaut ist stattdessen die vorzeichenrichtige Differenz plus **zu wenig.** bzw.
**zu viel.** Der Satz der Spec hätte die Zahl ein zweites Mal genannt, direkt
neben ihr. Wer einen eigenen Satz übergibt, ersetzt damit die Zahl: `off`
nennt sie meist selbst, und zweimal dieselbe Zahl in einer Zeile ist eine zu
viel. Frage 1 blieb bei der Vorgabe (keine Zwischensumme), Frage 2 ebenso
(keine Handlung).

Gemessen im Story-iframe (900 px, `Edges` bei 360 px): Zahlen aller Zeilen auf
derselben rechten Kante (475 px in `Statement`) mit
`lining-nums tabular-nums`, Etiketten links auf 37 px. `Statement` zeigt eine
Ergebniszeile „Geht auf." mit Haken und **ohne** „0,00 €"; `Off` zeigt
„−12,40 € zu wenig." mit Zeichen und Wort; `Edges` belegt die Toleranz —
0,004 € geht auf, 0,006 € nicht. `tone="bare"` in `InUse` misst
`background: rgba(0,0,0,0)`, `border-top: 0px`, `padding: 0px` — keine zweite
Fläche im Kartenfuß.

`pnpm typecheck`, `check:classes`, `check:language`, `check:when`,
`check:icons`, `check:jobs` und `pnpm build` grün. Abnahme durch einen anderen
Agenten steht aus.
