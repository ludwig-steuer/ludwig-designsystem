# 0024 · DateField / DateRangeField — Datum und Zeitraum

| | |
|---|---|
| Status | in Arbeit |
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

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Innen steckt `<input type="date">`, kein eigener Kalender | DOM aller Stories: ausschließlich `input[type=date]`, deutsche Anzeige „31.08.2026"; keine Kalender-Bibliothek im Import | ✓ |
| Keine neue Abhängigkeit | `package.json` seit der Erstbestückung unverändert (`git log -- package.json`) | ✓ |
| `onChange` gibt ISO, nie „26.08.2026" | `v3-primitives-formular-datefield--interaktiv` und `--rand`: Ausgabe „2026-08-01" | ✓ |
| `to` vor `from` wird getauscht, nicht abgewiesen | `--rand`: „bis" auf 2026-08-01 gesetzt — danach steht von = 2026-08-01, bis = 2026-08-31 | ✓ |
| Leeren gibt `null`, nicht `""` | `onChange(e.target.value \|\| null)` in `DateField`; `--leer` zeigt beide Felder leer | ✓ |
| Schnellwahl löst genau ein `onChange` mit beiden Werten aus | `--mit-schnellwahl`: ein Klick auf „Vormonat" setzt beide Felder auf 2026-07-01 und 2026-07-31 | ✓ |
| Kein Wirtschaftsjahr-Wissen in der Komponente | `grep`: der Begriff steht nur als Beispiel-Label im JSDoc, die Presets kommen als Prop herein | ✓ |
| Ersetzt die Zeitraum-Felder in `FilterBar` (0003) ohne Funktionsverlust | `FilterBar.stories.tsx:26` baut den Zeitraum weiter aus zwei rohen `<Input type="date">`; `CaseCrud.stories.tsx:312` trägt noch `Todo spec="0024"` | ✗ |

**Bleibt auf `in Arbeit` (nachgeprüft am 2026-09-05).** Anders als 0016 und
0017 hat diese Aufgabe zwei Mängel **in diesem Repo**, nicht in `ludwig/app`:
`FilterBar.stories.tsx` (Z. 25–29, `const Zeitraum`) baut den Zeitraum weiter
aus einem rohen `<Input type="date">` — weder `DateField` noch
`DateRangeField` wird dort importiert; und der Tausch `to` vor `from` greift
schon bei Zwischenwerten, während jemand die Jahreszahl tippt. Beides sind
Änderungen an Code, keine Papierarbeit, und beides gehört vor die nächste
Abnahme. Der zweite Punkt ist zusätzlich ein Wunsch an die Spec: die
Story-Exportnamen sind deutsch, was diese Spec vorgibt und die Hausregel
verbietet.

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte: FilterBar und Showcase sind nicht umgestellt. Zwei Beobachtungen zum Nacharbeiten: die Story-Exportnamen sind deutsch (`Gefuellt`, `Interaktiv` …) — so von dieser Spec vorgegeben, aber gegen die Hausregel „Story-Exportnamen englisch"; und beim Tippen der Jahreszahl im „bis"-Feld greift der Tausch schon bei Zwischenwerten, die Werte springen dabei unter den Fingern zwischen den Feldern.
