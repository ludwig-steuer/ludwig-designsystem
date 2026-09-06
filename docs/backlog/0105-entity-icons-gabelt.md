# 0105 · `entity-icons.ts` ist die nächste Gabelung

| | |
|---|---|
| Status | Abnahme |
| Stufe | `patterns/entity-icons.ts` |
| Quelle | Abnahme 0080 (2026-09-05), Befund 1 — gefunden **in dem Commit, der die erste Gabelung beendet hat** |
| Auftrag | Die App führt dieselbe Datei mit denselben 62 Schlüsseln: `apps/web/src/ui/status/entity-icons.ts`. Für die 54 alten Achsen ist sie wortgleich; auseinander gingen zuletzt `beleg_erledigung` und die sieben neuen — vier Labels und acht Quelltexte. Beides ist am 2026-09-05 angeglichen worden, aber die Struktur bleibt: **zwei Dateien, ein Inhalt, keine Vorrangregel.** |
| Warum das jetzt zählt | 0080 hat die Status-Registry gespiegelt, weil zwei Kopien auseinanderlaufen. `entity-icons.ts` ist derselbe Fall, eine Ebene weiter — und die Abnahme von 0080 hat genau daran einen echten Fehler gefunden: sieben `AXIS_SOURCE`-Texte waren plausibel formuliert statt abgeschrieben, einer schickte den Leser an die falsche Stelle. Solange es zwei Dateien gibt, passiert das wieder. |
| Zu entscheiden | (a) `entity-icons.ts` mitspiegeln wie die Registry — dann muss sie drüben importfrei werden (heute importiert sie `lucide-react` für `ENTITY_ICON`, und seit 0087 kommt das Zeichen hier aus der Icon-Registry). (b) Nur `AXIS_LABEL` und `AXIS_SOURCE` spiegeln und die Icons hier lassen — dann teilt sich die Datei in zwei. (c) Es bei zwei Dateien belassen und einen Deckungsgleichheits-Test bauen, der beide vergleicht. |
| Sofort umsetzbar, unabhängig vom Entscheid | Ein Wächter wie `scripts/check-icons.mjs`: er liest beide Dateien und meldet jeden Schlüssel, dessen Label oder Quelle auseinandergeht. Dreißig Zeilen, und der Fehler aus der 0080-Abnahme wäre nicht durchgekommen. |
| Angelegt von / am | Claude, 2026-09-05 (aus der Abnahme von 0080) |

## Erledigt (2026-09-06) — nicht durch eine bessere Kopie, sondern durch keine

Der Anlass war Rolle A: `ludwig/app` 700dbcb8 brachte sechs Achsen
(`kontoauszug_erwartung`, `opos_ausgleich`, `opos_zeilenart`,
`datev_verknuepfung`, `plausibilitaet`, `belegnummer_quelle`), und der
Typecheck hier wurde rot — an genau der Stelle, die diese Aufgabe beschreibt.

Die App hat im selben Zug den sauberen Schnitt gemacht: `AXIS_LABEL` und
`AXIS_SOURCE` liegen jetzt in `status-registry.ts` (reine Daten), ihre eigene
`ui/status/entity-icons.ts` re-exportiert sie nur noch. Damit **spiegeln sie
sich mit** — und dieses Repo re-exportiert sie ebenso, statt sie zu führen.

Von 177 Zeilen bleiben 48. Was hier bleibt, ist das, was der App fehlt:
`AXIS_ENTITY` (welche Achse welche Entität meint) und `ENTITY_LABEL`.

Damit fällt auch der Grund weg, aus dem diese Aufgabe entstand: dass **jede
neue Achse der App das Set rot macht**. Sie tut es nicht mehr — eine Achse ist
ab jetzt eine Zeile in der App und ein `pnpm sync:ludwig` hier.

## Abnahmekriterien

- [ ] `entity-icons.ts` führt keine eigene `AXIS_LABEL`/`AXIS_SOURCE` mehr (`grep`)
- [ ] Beide kommen aus `@/ludwig/ui/status/status-registry`
- [ ] Die Achsen-Namen stehen unverändert im Tooltip (`StatusBadge --all-axes`, gemessen)
- [ ] `pnpm typecheck`, `pnpm build` und `pnpm check:icons` grün
- [ ] Eine neue Achse der App macht das Set nicht mehr rot — belegt an den sechs von 700dbcb8
