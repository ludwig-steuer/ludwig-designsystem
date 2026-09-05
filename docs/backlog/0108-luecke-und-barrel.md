# 0108 · Die Lücke hing an der Gruppierung, und `daysBetween` fehlte im Barrel

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/Timeline.tsx` (+ Story) · `src/ui/v3/index.ts` |
| Quelle | Abnahme 0107 vom 2026-09-05 — beide Punkte dort als **Befund** notiert, nicht als Mangel |
| Auftrag | Zwei Folgen desselben Zuges: die neue Tagesrechnung kam nicht überall an. |
| Angelegt von / am | Claude, 2026-09-05 |

## (a) Die Lückenzeile erschien nur an einem Gruppenwechsel

Sie stand in `Timeline.tsx` **innerhalb** des Zweiges, der den Gruppenkopf
setzt. Mit `groupBy="none"` gibt es keinen Gruppenkopf — und damit nie eine
Lückenzeile. Ausgerechnet in der Fassung, in der der Strang am wenigsten
sonst zu sagen hat: keine Tagesüberschriften, nur Einträge untereinander.

Das widerspricht dem Kriterium aus 0023 („Lückenzeile ab sieben Tagen, mit
der Zahl der Tage") und dem Satz, der die ganze Komponente trägt: *eine
Lücke ist eine Aussage*. Sie hängt am Abstand zweier Ereignisse, nicht an
der Gruppierung.

Behoben: die Prüfung steht jetzt vor dem Gruppenkopf und läuft für jeden
Eintrag. Die Reihenfolge bleibt Lücke → Gruppenkopf → Eintrag.

Die Story `Grouping` zeigt es: dieselben Ereignisse mit `month` und mit
`none`, in beiden steht „20 Tage ohne Ereignis".

## (b) `daysBetween` fehlte im Barrel

`src/ui/v3/index.ts` exportiert `formatTime`, `formatTimeFull`,
`formatDuration` — aber nicht die neue Funktion. Innerhalb des Sets trägt der
relative Import; die App bekommt ihre Bausteine über `@/ui/v3`, und damit
hätte sie genau die Kalendertag-Regel nicht erreicht, für die 0107 (b)
angelegt wurde. Nachgetragen.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] Die Lückenzeile steht mit `groupBy="day"`, `"month"` **und** `"none"` (Story `Grouping`, beide Stränge gemessen)
- [ ] Die Reihenfolge bleibt Lücke → Gruppenkopf → Eintrag
- [ ] `gapDays` wirkt weiterhin (Story `WithGap`, rechte Spalte ohne Zeile)
- [ ] `daysBetween` ist über `@/ui/v3` erreichbar (`grep` im Barrel)

## Abnahme (2026-09-05)

Abgenommen gegen Spec und Code, nicht gegen den Chat. Alle zwölf
`Timeline`-Stories auf `localhost:6107` geöffnet und im Blatt gemessen
(`measure.mjs`, Ausdrücke über `#storybook-root`); gemessen wurde die
**DOM-Reihenfolge der Kinder** je `.v2tl`, nicht der Augenschein.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` **nicht** gelaufen (mehrere Sitzungen parallel, laut Auftrag untersagt); ersatzweise übersetzt und rendert der laufende Storybook alle Stories des Musters, `console-check.mjs` über `--grouping` und `--with-gap`: **0 Meldungen** | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | `--filled`, `--with-labels`, `--order`, `--grouping`, `--interactive`, `--with-gap`, `--in-use`, `--selected`, `--day-only`, `--without-kind`, `--icons-and-dimmed`, `--empty`, `--loading` geöffnet und gemessen; kein waagerechter Überlauf (`scrollWidth === clientWidth` in jeder), keine Konsolenmeldung | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Die Lückenzeile steht mit `groupBy="day"`, `"month"` **und** `"none"` | `--grouping`, Kinder je Strang in DOM-Reihenfolge: **`month`** → `day: August 2026` · vier `item` · **`gap: 20 Tage ohne Ereignis`** · `item`; **`none`** → vier `item` · **`gap: 20 Tage ohne Ereignis`** · `item`. Den dritten Fall trägt `--with-gap` (linker Strang, ohne `groupBy`, also der Vorgabewert `day`): fünf `day`-Köpfe und dazwischen **`gap: 20 Tage ohne Ereignis`**. In allen drei Fassungen steht dieselbe Zahl | ✓ |
| Die Reihenfolge bleibt Lücke → Gruppenkopf → Eintrag | `--with-gap`, linker Strang, die drei Kinder um die Lücke herum: `item: 09:40 RE-4471 im Posteingang …` → **`gap: 20 Tage ohne Ereignis`** → `day: Mittwoch, 5. August 2026` → `item: 10:00 Sachverhalt aus dem OPOS-Vortrag …`. Im Code steht die Prüfung vor dem Gruppenkopf (`Timeline.tsx:120–139`) | ✓ |
| `gapDays` wirkt weiterhin | `--with-gap`, rechter Strang (`gapDays={30}`): **0** `.v2tl__gap`, fünf `day`-Köpfe und fünf `item` — dieselben Ereignisse, keine Zeile. Links, mit dem Vorgabewert, steht sie | ✓ |
| `daysBetween` ist über `@/ui/v3` erreichbar | Im Barrel `src/ui/v3/index.ts:141` (`calendarDay` `:142`, beide aus `./format`). Zur Laufzeit gegengeprüft statt gegrept: `await import('/src/ui/v3/index.ts')` im Blatt gibt `typeof daysBetween === "function"` und `typeof calendarDay === "function"`; `daysBetween("2026-08-25","2026-08-26")` = 1, `daysBetween("2026-08-25T22:30:00Z","2026-09-05")` = 10 | ✓ |

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Die Story `Grouping` zeigt zwei der drei Fassungen.** Das Kriterium nennt
  `day`, `month` und `none` und als Nachweis „Story `Grouping`, beide Stränge";
  die Story rendert `month` und `none`. Der dritte Fall steht in `--with-gap`
  und `--filled` (Vorgabewert `day`) und ist damit belegt — nur nicht dort, wo
  das Kriterium ihn sucht. Eine dritte Zeile in `Grouping` kostet nichts.
- **`daysBetween` hat sein `@when`/`@instead` verloren.** Nicht durch diese
  Aufgabe: `calendarDay` ist mit dem Fix zu 0040 **zwischen** den Doc-Block von
  `daysBetween` und die Funktion gerutscht (`format.ts:137–147` gegen `:161`,
  `daysBetween` steht ohne eigenen Block bei `:170`). Der Befund gehört 0040
  (dort Mangel 2), betrifft aber die Funktion, um die es hier geht.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: keine.
