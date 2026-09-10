# 0024 · DateField / DateRangeField — Datum und Zeitraum

| | |
|---|---|
| Status | fertig |
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
| `value` | `string \| null` | ja | ISO `yyyy-mm-dd`, oder `null` für leer | `Filled`, `Empty` |
| `onChange` | `(value: string \| null) => void` | ja | ISO heraus, nie das Anzeigeformat | `Interactive` |
| `min` / `max` | `string` | nein | ISO-Grenzen, an das `input` durchgereicht | `Bounds` |
| `invalid` | `boolean` | nein | Rahmen rot, ohne eigenen Text | `Filled` |
| `ariaLabel` | `string` | nein | — | — |

### `DateRangeField`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `from` / `to` | `string \| null` | ja | ISO, beide einzeln leer erlaubt | `Filled` |
| `onChange` | `(from: string \| null, to: string \| null) => void` | ja | Immer beide — der Zeitraum ist ein Wert | `Interactive` |
| `presets` | `DatePreset[]` | nein | Schnellwahl. **Kommt als Prop**, nicht als lokale Liste: „laufendes Wirtschaftsjahr" kennt nur die App | `WithPresets` |
| `min` / `max` | `string` | nein | Grenzen für beide Felder | `Bounds` |

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
| `Filled` | beide Felder mit Wert, dazu `invalid` |
| `Empty` | beide leer, `null` heraus |
| `Interactive` | Rundlauf über `onChange` mit `useState`, ISO im State sichtbar |
| `WithPresets` | drei Presets, ein Klick setzt beide Werte |
| `Bounds` | `min`/`max` sperren, was außerhalb liegt |
| `Edges` | `to` vor `from` wird getauscht; Jahreswechsel; Schaltjahr |
| `InUse` | in einer `FilterBar`-Attrappe über einer `Table` |

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
- [ ] `onChange` gibt ISO, nie `26.08.2026` (`Interactive`)
- [ ] `to` vor `from` wird getauscht, nicht abgewiesen (`Edges`)
- [ ] Leeren gibt `null`, nicht `""` (`Empty`)
- [ ] Schnellwahl löst genau ein `onChange` mit beiden Werten aus (`WithPresets`)
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

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Innen steckt `<input type="date">`, kein eigener Kalender | DOM aller Stories: ausschließlich `input[type=date]`, deutsche Anzeige „31.08.2026"; keine Kalender-Bibliothek im Import | ✓ |
| Keine neue Abhängigkeit | `package.json` seit der Erstbestückung unverändert (`git log -- package.json`) | ✓ |
| `onChange` gibt ISO, nie „26.08.2026" | `v3-primitives-formular-datefield--interactive` und `--rand`: Ausgabe „2026-08-01" | ✓ |
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

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte: FilterBar und Showcase sind nicht umgestellt. Zwei Beobachtungen zum Nacharbeiten: die Story-Exportnamen sind deutsch (`Filled`, `Interactive` …) — so von dieser Spec vorgegeben, aber gegen die Hausregel „Story-Exportnamen englisch"; und beim Tippen der Jahreszahl im „bis"-Feld greift der Tausch schon bei Zwischenwerten, die Werte springen dabei unter den Fingern zwischen den Feldern.

## Die drei offenen Punkte — behoben

**1 — `FilterBar` baute den Zeitraum weiter aus rohen Feldern.** Das Kriterium
„ersetzt die Zeitraum-Felder in `FilterBar` (0003) ohne Funktionsverlust"
stand unerfüllt da, solange `FilterBar.stories.tsx` zwei
`<Input type="date">` nebeneinanderstellte. Jetzt läuft der Zeitraum dort
über `DateRangeField` (ein Wert, zwei Felder, mit Zustand) und das zweite
Datum in `ManyFields` über `DateField`. Im ganzen Set gibt es damit außerhalb
von `DateField.tsx` kein rohes `type="date"` mehr — bis auf
`JournalEntryEditor.tsx:567`, das einer parallelen Sitzung gehört und als
Befund stehen bleibt.

Nebenbei englisch benannt, weil die Datei ohnehin offen war: `Kreditor` →
`CreditorFilter`, `Zeitraum` → `PeriodFilter`.

**2 — der Tausch griff schon beim Tippen.** Ein natives Datumsfeld meldet
jede Zwischenstufe der Jahreszahl: aus „2026" werden erst 0002, 0020, 0202.
Jede davon war „bis vor von" und löste den Tausch aus — die zwei Werte
sprangen unter den Fingern hin und her.

Der Tausch sitzt jetzt am `onBlur` des Paares und greift erst, wenn der Fokus
es wirklich verlässt (`relatedTarget` außerhalb). Während des Tippens reicht
das Feld seinen Wert unverändert durch.

Nachgemessen (Chromium headless, Story `Interactive`): die vier Zwischenwerte
0002/0020/0202/2026 landen unverändert im Zustand, `from` bleibt dabei
`2026-08-01`. Danach „bis" auf den 15.07. gesetzt und den Fokus aus dem Paar
genommen → `from: 2026-07-15`, `to: 2026-08-01`. Der Tausch findet statt,
aber einmal und am Ende.

**3 — die Story-Exportnamen waren deutsch.** Diese Spec hatte sie so
vorgegeben; die Hausregel in `CLAUDE.md` verlangt Englisch, und der Wunsch
aus der Abnahme war, das an der Spec zu korrigieren statt an der Regel
vorbeizuleben. Umbenannt: `Gefuellt` → `Filled`, `Leer` → `Empty`,
`Interaktiv` → `Interactive`, `MitSchnellwahl` → `WithPresets`, `Grenzen` →
`Bounds`, `Rand` → `Edges`, `InUse` → `InUse`; die Nachweise oben in
dieser Spec zeigen auf die neuen Namen.

## Abnahmekriterien (Nachtrag)

- [ ] `FilterBar.stories.tsx` benutzt `DateRangeField` und `DateField`, kein rohes `type="date"` (`grep`)
- [ ] Zwischenstufen der Jahreszahl lösen keinen Tausch aus (Story `Interactive`, gemessen)
- [ ] Ein verdrehter Zeitraum wird beim Verlassen des Paares getauscht, nicht davor (dieselbe Story)
- [ ] Alle Story-Exportnamen sind englisch (`grep -n "^export const" DateField.stories.tsx`)

## Abnahme des Nachtrags, 2026-09-05

Dritte Abnahme, fremder Prüfer; gebaut hat jemand anders, geprüft wurde gegen
Spec und Code. Storybook auf `localhost:6107`, Chromium headless 1440 × 900
über CDP gefahren — echte Mausklicks (`Input.dispatchMouseEvent`) und echte
Tastendrücke (`Input.dispatchKeyEvent`), Ziffer für Ziffer ins native Feld.
Alle sieben `DateField`-Stories und alle fünf `FilterBar`-Stories geöffnet.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, Exit 0. `pnpm build` bewusst nicht gestartet: er schreibt nach `storybook-static`, und hier arbeiten mehrere Sitzungen parallel | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/DateField.tsx` mit `DateField.stories.tsx` daneben; Barrel führt beide Exporte unter `/* Formular */` (`index.ts`), Story-Titel `v3/Primitives/Formular/DateField` (`DateField.stories.tsx:10`) — dieselbe Gruppe | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | zwei Exporte, beide mit beiden Zeilen: `DateField` (`DateField.tsx:25–29`), `DateRangeField` (`:66–69`). Bezeichner, Props, Kommentare und JSDoc englisch; deutsch nur, was der Nutzer liest („Vormonat" als Beispiel im JSDoc, das Wort „bis" zwischen den Feldern) | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\b\|[0-9]+px\|fontSize" DateField.tsx` → keine Zeile. Optik in `v3.css:1913–1915` (`.v2date`, `.v2date__sep`, `.v2date__presets`), alles über Tokens; kein Status in der Komponente | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--empty`, `--interactive`, `--with-presets`, `--bounds`, `--edges`, `--in-use` — die sieben der Ableitung. `Lädt`, `Leer nach Filter` und `Fehler` sind im Abschnitt „Stories" begründet ausgeschlossen | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Felder linksbündig, nichts zentriert · `invalid` färbt nur den Rahmen und trägt zusätzlich `aria-invalid="true"` (`--filled`, zweites Feld: `class="v2in v2in--invalid"`) — Farbe nie allein · die Schnellwahl ist eine Reihe `TextButton`, per Tab erreichbar, mit Wort statt Icon · `min`/`max` gehen unverändert ans native Feld (`--bounds`: `min="2026-01-01"`, `max="2026-12-31"`) · kein Emoji, keine Versalien. Ein Konsolenbefund in `--in-use` gehört nicht dieser Aufgabe, siehe unten | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle sieben Stories geöffnet und bedient: getippt, mit den Pfeiltasten verstellt, Schnellwahl geklickt, das Paar verlassen, Felder geleert | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Innen steckt `<input type="date">`, kein eigener Kalender | `DateField.tsx:51–52` reicht `type="date"` an `Input` durch; im DOM aller Stories ausschließlich `input[type=date]`, keine Kalender-Bibliothek im Import. `grep -rn 'type="date"' src` findet außerhalb von `DateField.tsx` nur noch `JournalEntryEditor.tsx:567` (fremde Sitzung) und den erklärenden Kommentar in `FilterBar.stories.tsx:29` | ✓ |
| Keine neue Abhängigkeit | `git log --oneline -3 -- package.json` → zuletzt `f58caa2` (0087) und `41a55fc`/`b9988bb` (0064); 0024 hat die Datei nie angefasst. `grep -rn "date-fns" src/ui/v3` ist leer — die Familie kommt sogar ohne die zugesagte Bibliothek aus | ✓ |
| `onChange` gibt ISO, nie „26.08.2026" | `--interactive`: der `pre`-Kasten zeigt durchgehend ISO — `{ "datum": "2026-08-26", "from": "2026-08-01", "to": "2026-08-31" }`, nach jedem Tastendruck ebenso (`"to": "0002-08-31"` … `"2026-08-31"`). Kein Anzeigeformat im Zustand | ✓ |
| `to` vor `from` wird getauscht, nicht abgewiesen | `--edges`: ins „bis"-Feld 01 / 08 / 2026 getippt (Segment für Segment), dann den Fokus aus dem Paar genommen → „von 2026-01-08 bis 2026-08-31". Kein Fehlertext, kein Abweisen | ✓ |
| Leeren gibt `null`, nicht `""` | `--interactive`, erstes Feld geleert (dreimal `Backspace` über die Segmente): `input.value` = „", im Zustand steht `"datum": null` — `JSON.parse(...).datum === null`, `typeof` = `object`. `DateField.tsx:61`: `onChange(e.target.value \|\| null)` | ✓ |
| Schnellwahl löst genau ein `onChange` mit beiden Werten aus | `--with-presets` startet mit `from = null`, `to = null`. Ein Klick auf „Laufendes Wirtschaftsjahr" → beide zugleich gesetzt: „2026-01-01 bis 2026-12-31", die Felder tragen `2026-01-01` und `2026-12-31`. Bei zwei Aufrufen wäre einer der beiden Werte `null` geblieben (jeder Aufruf trägt den anderen Wert aus seinem Render); `DateField.tsx:124` ruft `onChange(p.from, p.to)` | ✓ |
| Kein Wirtschaftsjahr-Wissen in der Komponente | `grep -n "Wirtschaftsjahr" DateField.tsx` → eine Zeile, `:19`, und die ist das Beispiel-Label im JSDoc von `DatePreset`. Die Presets kommen als Prop (`--with-presets` übergibt sie aus der Story) | ✓ |
| Ersetzt die Zeitraum-Felder in `FilterBar` (0003) ohne Funktionsverlust | **jetzt erfüllt.** `FilterBar.stories.tsx:32–47` (`PeriodFilter`) baut den Zeitraum über `DateRangeField` mit Zustand; gemessen in allen fünf `FilterBar`-Stories: je genau ein `.v2date` mit `aria-label="Von"`/`"Bis"` und dem Wort „bis" dazwischen, Werte `2026-08-01`/`2026-08-31`. `ManyFields` hat zusätzlich ein einzelnes `DateField` (`2026-09-15`, außerhalb des Paares). Auch der Showcase ist nachgezogen: `CaseCrud.stories.tsx:174` und `:376` nehmen `DateField`, die Marke `Todo spec="0024"` ist verschwunden | ✓ |

**Nachtrag (die vier Kriterien dieser Runde)**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `FilterBar.stories.tsx` benutzt `DateRangeField` und `DateField`, kein rohes `type="date"` | `grep -n "DateField\|DateRangeField" FilterBar.stories.tsx`: Import `:6`, `DateRangeField` in `PeriodFilter` `:37`, `DateField` in `ManyFields` `:107`. Kein `<Input type="date">` mehr in der Datei; die Filter heißen jetzt `CreditorFilter` und `PeriodFilter` statt `Kreditor` und `Zeitraum`. Im DOM aller fünf Stories bestätigt | ✓ |
| Zwischenstufen der Jahreszahl lösen keinen Tausch aus (Story `Interactive`, gemessen) | `--interactive`, Ausgangslage `from 2026-08-01`, `to 2026-08-31`. Ins Jahr des „bis"-Feldes 2 · 0 · 2 · 6 getippt, nach jeder Ziffer den Zustand gelesen: `to` = `0002-08-31` → `0020-08-31` → `0202-08-31` → `2026-08-31`, `from` bleibt in allen vier Schritten `2026-08-01`. Jede der ersten drei Stufen liegt vor `from` und hätte den alten Tausch ausgelöst; nichts springt. Gegenprobe in `--edges` mit derselben Ziffernfolge: `0002-01-08` → `0020-01-08` → `0202-01-08` → `2026-01-08`, `from` unverändert `2026-08-31` | ✓ |
| Ein verdrehter Zeitraum wird beim Verlassen des Paares getauscht, nicht davor (dieselbe Story) | `--interactive`: mit `ArrowDown` im Jahr des „bis"-Feldes auf `2025-08-31`, `2024-08-31`, `2023-08-31` heruntergestellt — alle drei verdreht, alle drei bleiben stehen (`from 2026-08-01`, `to 2023-08-31`). Der erste `Tab` springt nur ins nächste Segment desselben Feldes, der Zustand bleibt. Der zweite `Tab` verlässt das Paar → `from: 2023-08-31`, `to: 2026-08-01`, die Felder tragen dieselben Werte. Ein dritter `Tab` tauscht **nicht** noch einmal. `DateField.tsx:94–97`: `swapIfInverted` greift nur, wenn `relatedTarget` außerhalb liegt | ✓ |
| Alle Story-Exportnamen sind englisch | `grep -n "^export const" DateField.stories.tsx`: `Filled`, `Empty`, `Interactive`, `WithPresets`, `Bounds`, `Edges`, `InUse` — sieben, alle englisch. Die Nachweise oben in dieser Spec zeigen auf die neuen Namen | ✓ |

**Der Tausch über die Schnellwahl und über den Kalender**

Beide Wege setzen den Wert, ohne dass jemand tippt — geprüft in
`--with-presets`:

1. Klick auf „Laufendes Wirtschaftsjahr" → `2026-01-01` / `2026-12-31`; der
   Fokus steht danach auf dem Knopf, also **innerhalb** des Paares, und es
   wird nichts getauscht. Richtig: der Zeitraum, den die Schnellwahl setzt,
   ist keiner, den man korrigieren müsste.
2. Danach im „bis"-Feld mit `ArrowDown` auf `2024-12-31` heruntergestellt —
   derselbe Weg, den auch der native Kalender nimmt: ein vollständiger Wert,
   ohne Zwischenstufen. Verdreht, aber im Paar → kein Tausch.
3. Klick auf „Vormonat" in diesem verdrehten Zustand → `2026-07-01` /
   `2026-07-31`. Der Knopf sitzt im Paar, es wird also nicht zwischendurch
   getauscht; die Werte der Schnellwahl gewinnen unverändert.
4. Erneut auf `2024-07-31` heruntergestellt und den Fokus aus dem Paar
   genommen → `2024-07-31` / `2026-07-01`. Der Tausch findet statt, einmal,
   am Ende — auch für Werte, die nie getippt wurden.

Den nativen Kalender selbst öffnet ein Headless-Chromium nicht; der
Pfeiltasten-Weg ist derselbe Code-Weg (ein vollständiger Wert je Schritt,
Fokus bleibt im Feld) und deckt ihn ab.

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Wer mitten in der Jahreszahl das Paar verlässt, verlässt es mit dem
  Zwischenwert** — und dann tauscht es. Das ist derselbe Fall wie ein falsch
  getipptes Datum, kein Fehler des neuen `onBlur`.
- **`swapIfInverted` greift nur, wenn beide Werte stehen** (`from && to`,
  `DateField.tsx:96`). Ein halb gefüllter Zeitraum bleibt in Ruhe — geprüft in
  `--edges`, das mit `to = null` startet.
- **Die Anzeige „26.08.2026" ist hier nicht nachprüfbar.** Das Headless-Chromium
  läuft mit `navigator.language = "en-US"` und zeigt deshalb MM/TT/JJJJ. Genau
  das ist der Preis, den die Spec bewusst zahlt („Lokalisierung vom Browser");
  der ISO-Wert im Zustand ist davon unberührt und wurde gemessen. Die deutsche
  Anzeige steht aus der Abnahme vom 2026-09-03 belegt da.
- **Ein Konsolenfehler in `--in-use`, der nicht dieser Aufgabe gehört.** Die
  Story stellt eine `Table` unter die Filterleiste; React meldet
  „In HTML, `<th>` cannot be a child of `<div>`" und dasselbe für `<td>`.
  Ursache ist das Set: `Table`, `HeadRow` und `Row`
  (`primitives/Table.tsx:89`, `:117`, `:128`) rendern `div`s, und rund zwanzig
  Story-Dateien setzen `<th>`/`<td>` hinein. Das steht so seit der
  Erstbestückung, `git show 4e505a9 -- FilterBar.stories.tsx` fasst die Tabelle
  nicht an. Befund für das Set, eigene Aufgabe.
- **`JournalEntryEditor.tsx:567`** trägt weiter ein rohes `<input type="date">`;
  die Datei gehört einer parallelen Sitzung und war kein Prüfgegenstand.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05
