# 0107 · Vier Nachträge aus den Abnahmen von 0013, 0023 und 0024

| | |
|---|---|
| Status | Abnahme |
| Stufe | `src/ui/v3/format.ts` · `primitives/Time.tsx` · `patterns/Timeline.tsx` (+ Story) · `entities/account/AccountField.stories.tsx` |
| Quelle | Abnahme 0013/0023/0024 vom 2026-09-05 — alle drei `fertig`, diese vier Punkte standen dort als **Befund**, nicht als Mangel |
| Auftrag | Was beim Erweitern des Hausformatierers liegen geblieben ist, plus zwei kleine Schulden aus derselben Runde. |
| Angelegt von / am | Claude, 2026-09-05 |

## Warum eine eigene Aufgabe

Die drei Specs sind abgenommen und `fertig`. Diese vier Punkte nachträglich in
sie hineinzuschreiben hieße, eine abgeschlossene Abnahme umzuschreiben; sie
gehören zusammen, weil drei von ihnen dieselbe Wurzel haben — die zwei neuen
Zeitformen aus 0023.

## (a) `Time` kannte seine eigene Erweiterung nicht

`format.ts` hat mit 0023 zwei Formen bekommen (`date` mit `long` schreibt den
Tag aus, `time` gibt die Uhr allein). `Time` reicht `TimeFormat` durch, sein
Kopf sagte aber weiter „five ways to say it" und die `@when`-Zeile nannte die
neue Form nicht. Ein Aufrufer, der `grep -rn "@when"` liest — der Weg, den der
Skill vorschreibt —, hätte sie nicht gefunden.

Behoben: sechs Wege, und die `@when`-Zeile nennt beide neuen mit dem Fall,
für den sie da sind.

## (b) Die Lückenrechnung erbte die Kalendertag-Regel nicht

`Timeline` rechnete die Tage zwischen zwei Ereignissen mit
`new Date(e.at).getTime()`. Für einen Kalendertag (`YYYY-MM-DD`) ist das
UTC-Mitternacht statt der 12:00 UTC, auf die `toDate` ihn verankert — genau
die Regel, die 0040 eingeführt hat. In den Stories unsichtbar; sobald ein
Kalendertag und ein Zeitstempel verglichen werden, kann die Zahl um eins
kippen.

Behoben mit einem neuen Export in `format.ts`:

```ts
export function daysBetween(a: string | Date, b: string | Date): number
```

Er liegt dort und nicht in der `Timeline`, weil `toDate` privat ist und
bleiben soll: die Regel „ein Kalendertag hängt auf 12:00 UTC" hat einen Ort,
und wer Tage zählt, bekommt sie mit.

## (c) `gapDays` hatte keine Vorführung

Die Prop war gebaut und dokumentiert, aber keine Story übergab je einen
anderen Wert — der einzige Nachweis der Abnahme, der aus dem Code statt aus
dem Browser kam. `WithGap` zeigt jetzt beide Stränge nebeneinander: dieselben
Ereignisse links mit der Vorgabe (Lückenzeile „20 Tage ohne Ereignis"), rechts
mit `gapDays={30}` (keine Zeile).

## (d) Deutsche Bezeichner in `AccountField.stories.tsx`

`leer`, `blatt`, `bekannt`, `fremd`, `lang` samt ihren Settern sind englisch.
Das Kriterium von 0013 nannte nur `AccountField.tsx`; die Hausregel gilt für
die Story daneben genauso. Nutzer-Text bleibt deutsch — auch das Feld-Label
„Name bekannt".

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] Der Kopf von `Time.tsx` und seine `@when`-Zeile nennen die zwei neuen Formen
- [ ] `Timeline.tsx` rechnet keine Millisekunden mehr selbst (`grep`: kein `DAY_MS`, kein `getTime()`)
- [ ] `daysBetween` zählt für einen Kalendertag dasselbe wie für einen Zeitstempel — in mindestens zwei Zeitzonen gegengeprüft
- [ ] Die Lückenzeile sagt weiterhin „20 Tage ohne Ereignis" (Story `WithGap`, linke Spalte)
- [ ] `gapDays={30}` lässt die Zeile weg (Story `WithGap`, rechte Spalte)
- [ ] Kein deutscher Bezeichner mehr in `AccountField.stories.tsx`; die Labels sind unverändert deutsch

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
