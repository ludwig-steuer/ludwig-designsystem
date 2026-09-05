# 0108 · Die Lücke hing an der Gruppierung, und `daysBetween` fehlte im Barrel

| | |
|---|---|
| Status | Abnahme |
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

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
