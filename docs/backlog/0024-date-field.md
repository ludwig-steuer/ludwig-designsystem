# 0024 · DateField / DateRangeField — Datum und Zeitraum

| | |
|---|---|
| Status | spec |
| Stufe | `primitives/` |
| Klassen-Test | ja, unverändert — ein Datum hat kein Fachwort |
| Quelle | `docs/v3-backlog.md` „Später": `Datumsfeld` / `Zeitraumfeld`, **14 Dateien** · Showcase `src/showcase/CaseCrud.stories.tsx` (Frist, Eröffnungsdatum) |
| Ersetzt | 14 lokale Datums-Eingaben, darunter die Zeitraum-Felder in `FilterBar` (0003) und im DATEV-Export-Assistenten |
| Blockiert | 0003 FilterBar (jede zweite Filterleiste hat einen Zeitraum), Erwartungen mit Frist, Wiedervorlage |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Fristen und Zeiträume stehen überall: die Erwartung mit Frist, die
Wiedervorlage, der Export-Zeitraum, jeder Filter über einen Monat. Vierzehn
Dateien lösen das heute selbst — mit eigenem Format, eigener Prüfung, eigener
Antwort auf „31.02.".

## Einordnung

- **Wiederverwenden:** `Input` (`Form.tsx`) nimmt `type` durch, formatiert und
  prüft aber nichts; die vierzehn Stellen setzen genau darauf auf und bauen
  den Rest jedes Mal neu.
- **Neu, weil:** §3.3 — kein `@when` passt · kein Fachwort · 14 Verwendungen
  gezählt.

**Aber zuerst die Ehrlichkeitsfrage: `<input type="date">` kann das meiste
schon.** Es bringt Kalender, Tastatureingabe, Lokalisierung und Validierung
vom Browser mit — kostenlos, barrierefrei, ohne Bibliothek. Was es **nicht**
kann und was diese Komponente rechtfertigt:

1. Es liefert `yyyy-mm-dd`, die Kanzlei liest `26.08.2026`. Die Umrechnung ist
   der Fehler, den 14 Dateien einzeln machen.
2. Es kennt keinen **Zeitraum** — zwei Felder ohne Zusammenhang, und die Regel
   „bis nicht vor von" steht 14-mal woanders.
3. Es kennt keine **Schnellwahl** („dieser Monat", „Vormonat", „laufendes
   Wirtschaftsjahr"), und genau die wird im Monatsprozess dauernd gebraucht.

Deshalb: **kein eigener Kalender.** Innen bleibt `<input type="date">`, außen
kommen Format, Zeitraumlogik und Schnellwahl dazu. Eine Datepicker-Bibliothek
wäre 40 KB für einen Kalender, den der Browser mitbringt.

- **Zuschnitt:** **getrennt**, zwei Exporte in einer Datei als Familie.
  `DateField` wird allein gebraucht (Frist), `DateRangeField` ist nicht nur
  zwei davon — es trägt die Regel zwischen beiden und die Schnellwahl (§4).
- **Setzt auf:** `Field`, `Input` aus `primitives/Form`, `date-fns` (steht
  bereits in `package.json`).

## Schnittstelle

### `DateField`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `value` | `string \| null` | ja | ISO `yyyy-mm-dd`, oder `null` für leer | `Gefuellt`, `Leer` |
| `onChange` | `(value: string \| null) => void` | ja | ISO heraus, nie das Anzeigeformat | `Interaktiv` |
| `min` / `max` | `string` | nein | ISO-Grenzen, an das `input` durchgereicht | `Grenzen` |
| `invalid` | `boolean` | nein | Rahmen rot, ohne eigenen Text | `Gefuellt` |
| `ariaLabel` | `string` | nein | — | — |

### `DateRangeField`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `from` / `to` | `string \| null` | ja | ISO, beide einzeln leer erlaubt | `Gefuellt` |
| `onChange` | `(from: string \| null, to: string \| null) => void` | ja | Immer beide — der Zeitraum ist ein Wert | `Interaktiv` |
| `presets` | `DatePreset[]` | nein | Schnellwahl. **Kommt als Prop**, nicht als lokale Liste: „laufendes Wirtschaftsjahr" kennt nur die App | `MitSchnellwahl` |
| `min` / `max` | `string` | nein | Grenzen für beide Felder | `Grenzen` |

```ts
interface DatePreset {
  key: string;
  /** „Vormonat", „Laufendes Wirtschaftsjahr" — deutsch, vom Aufrufer. */
  label: string;
  from: string;
  to: string;
}
```

Keine Ludwig-Typen. Ein Wirtschaftsjahr ist ein Fachbegriff — es kommt als
`DatePreset` herein, nicht als Wissen der Komponente.

**Was die Komponenten nicht können (bewusst):**

- **Einen eigenen Kalender zeichnen.** Der Browser bringt einen mit, und er ist
  barrierefreier als jeder Nachbau.
- **Uhrzeiten.** Fristen in der Buchhaltung sind Tage. Wer eine Zeit braucht,
  nimmt `<input type="datetime-local">` an der Aufrufstelle.
- **Zeitzonen umrechnen.** Ein Datum ist hier ein Kalendertag, kein Zeitpunkt —
  `2026-08-26` bleibt `2026-08-26`, egal wo jemand sitzt.

## Verhalten

- Angezeigt wird `26.08.2026`, herausgegeben `2026-08-26`. Die Umrechnung
  passiert genau hier, einmal.
- **`to` vor `from`** wird nicht abgewiesen, sondern **getauscht** — die
  Reihenfolge ist ein Vertipper, keine Aussage. Ein Fehlertext dafür wäre
  Bürokratie.
- Ein unmögliches Datum („31.02.") lehnt der Browser bereits ab; die Komponente
  fügt keine zweite Meldung hinzu.
- Leeren ist erlaubt und gibt `null` — „kein Datum" ist ein Wert (offene
  Frist).
- Die Schnellwahl setzt beide Werte in einem `onChange`, nicht in zweien.
- Tastatur: das native Feld, unverändert. Die Schnellwahl ist eine Reihe
  Knöpfe, per Tab erreichbar.
- Client-Components (Eingabe).

## Stories

Nach §6, gemeinsam für die Familie: 2 Zustände + 1 Callback je Export +
1 Schnellwahl + 1 Grenzen + 1 „im Einsatz" + 1 Rand = 7.

| Story | Beweist |
|---|---|
| `Gefuellt` | beide Felder mit Wert, dazu `invalid` |
| `Leer` | beide leer, `null` heraus |
| `Interaktiv` | Rundlauf über `onChange` mit `useState`, ISO im State sichtbar |
| `MitSchnellwahl` | drei Presets, ein Klick setzt beide Werte |
| `Grenzen` | `min`/`max` sperren, was außerhalb liegt |
| `Rand` | `to` vor `from` wird getauscht; Jahreswechsel; Schaltjahr |
| `ImEinsatz` | in einer `FilterBar`-Attrappe über einer `Table` |

Nicht anwendbar: `Laedt` (ein Datumsfeld lädt nicht) · `LeerNachFilter` ·
`Fehler` (die Prüfung macht der Browser, den Ton setzt `invalid`).

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

- [ ] Innen steckt `<input type="date">`, kein eigener Kalender (`grep`, DOM)
- [ ] Keine neue Abhängigkeit; `date-fns` reicht (`package.json` unverändert)
- [ ] `onChange` gibt ISO, nie `26.08.2026` (`Interaktiv`)
- [ ] `to` vor `from` wird getauscht, nicht abgewiesen (`Rand`)
- [ ] Leeren gibt `null`, nicht `""` (`Leer`)
- [ ] Schnellwahl löst genau ein `onChange` mit beiden Werten aus (`MitSchnellwahl`)
- [ ] Kein Wirtschaftsjahr-Wissen in der Komponente (`grep`)
- [ ] Ersetzt die Zeitraum-Felder in `FilterBar` (0003) ohne Funktionsverlust

## Offene Fragen

1. **Reicht `<input type="date">` in Safari?** *Ohne Antwort: ja. Der Kalender
   sieht dort anders aus, die Eingabe funktioniert. Ein Nachbau brächte
   einheitliche Optik und schlechtere Bedienbarkeit — der falsche Tausch.*
2. **Schnellwahl auch am `DateField`?** *Ohne Antwort: nein. „Heute" spart
   einen Klick und kostet eine Prop; wer es braucht, setzt den Wert selbst.*
3. **Zwei Monate nebeneinander im Kalender?** *Ohne Antwort: entfällt mit dem
   nativen Feld — und das ist der Preis, den diese Spec bewusst zahlt.*

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
