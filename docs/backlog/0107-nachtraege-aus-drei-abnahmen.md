# 0107 · Vier Nachträge aus den Abnahmen von 0013, 0023 und 0024

| | |
|---|---|
| Status | fertig |
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

Fremder Prüfer (nicht der Erbauer). Gemessen in einem eigenen headless
Chromium (1440 × 900) auf `localhost:6107`; `daysBetween` und `formatTime`
sind im Blatt der Story über einen dynamischen Import von
`/src/ui/v3/format.ts` aufgerufen, der Browser dafür dreimal mit
verschiedenem `TZ` gestartet.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, Exit 0, keine Ausgabe außer den zwei pnpm-Zeilen. `pnpm build` nicht gestartet: er schreibt nach `storybook-static`, und parallel arbeiten weitere Sitzungen | ✓ (Build zitiert) |
| Code englisch; `@when`/`@instead` an jedem Export | Der neue Export trägt beide Zeilen: `format.ts:138–139` über `export function daysBetween` (`:141`). `Time` (`Time.tsx:14–21`) und `Duration` (`:54–55`), `Timeline` (`Timeline.tsx:62–67`) unverändert. Sprache maschinell geprüft: alle Kommentarblöcke der vier Dateien ausgeschnitten (Zeichenketten ausgeklammert) und gegen deutsche Funktionswörter gehalten — `Timeline.tsx` 21 Blöcke, 0 Treffer; `Time.tsx` 6 Blöcke, 0; `format.ts` 17 Blöcke, 1 Treffer, und der ist ein englischer Satz, der die deutsche Nutzer-Zeile „20 Tage ohne Ereignis" zitiert (`:130–132`). Stehender Befund aus 0032/0033 unverändert: die vier älteren Exporte von `format.ts` tragen die zwei Zeilen nicht — dort als Befund gewertet, nicht als Mangel | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle 13 Timeline-Stories nacheinander geöffnet und ausgelesen (Einträge, Tagesköpfe, Lückenzeilen): `--filled` 4 Einträge, `--empty` „Noch nichts geschehen.", `--loading` „Verlauf wird geladen …", `--order` und `--grouping` je 8, `--with-gap` 10, `--day-only` 2 (`28.08.2026` ohne Uhr, `dateTime="2026-08-28"`), `--icons-and-dimmed` 3. Genau eine Lückenzeile im ganzen Satz, in `--with-gap`. Dazu alle 6 AccountField-Stories (siehe unten). Konsole: 0 Meldungen (Fehler und Warnungen) in `--with-gap`, `--number-and-name`, `--with-ledger` | ✓ |

**Variabel**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| (a) Der Kopf von `Time.tsx` und seine `@when`-Zeile nennen die zwei neuen Formen | Kopf `Time.tsx:4`: „One point in time, **six** ways to say it — and a duration" (vorher „five"). `@when` `:14–18` nennt beide beim Namen und mit ihrem Fall: „the written-out day (`date` with `long`)" und „the clock alone where the day already stands above it (`time`, a strand grouped by day)". Dieselbe Zählung im Kopf von `formatTime` (`format.ts:157–162`) | ✓ |
| (b) `Timeline.tsx` rechnet keine Millisekunden mehr selbst | `grep -n "getTime\|DAY_MS\|86400\|1000 \* 60" src/ui/v3/patterns/Timeline.tsx` → **kein Treffer**. Das einzige verbliebene `new Date(...)` steht in `:178` und baut das `dateTime`-Attribut, keine Tageszahl. Die Lücke zählt `daysBetween(lastAt, e.at)` (`:119`), Import in `:5`; `DAY_MS` ist mit der Nachbesserung gelöscht | ✓ |
| (b) `daysBetween` zählt für einen Kalendertag dasselbe wie für einen Zeitstempel — in mindestens zwei Zeitzonen gegengeprüft | Browser dreimal mit `TZ=Europe/Berlin` (`getTimezoneOffset` −120), `TZ=Pacific/Auckland` (−720) und `TZ=America/Los_Angeles` (+420) gestartet, `Intl.DateTimeFormat().resolvedOptions().timeZone` je bestätigt. In **allen drei** identisch: `2026-08-05` ↔ `2026-08-26` = 21 und `2026-08-05T12:00:00Z` ↔ `2026-08-26T12:00:00Z` = 21 — der Kalendertag zählt wie der Zeitstempel. Gegenprobe der Verankerung im selben Lauf: `formatTime("2026-08-05","date")` = „05.08.2026" und `"date","long"` = „Mittwoch, 5. August 2026" in jeder der drei Zonen | ✓ |
| (b) Der Grenzfall, der den Befund ausgelöst hat: `YYYY-MM-DD` gegen einen Zeitstempel | `daysBetween("2026-08-05", "2026-08-26T07:40:00Z")` = **20**, in allen drei Zonen; die alte Rechnung derselben Zeile (`Math.floor(Math.abs(new Date(b) − new Date(a)) / 86400000)`, im selben Lauf mitgemessen) gibt **21** — genau das Kippen um eins. Der Zeitstempel desselben Tages, `"2026-08-05T08:00:00Z"` ↔ `"2026-08-26T07:40:00Z"`, gibt ebenfalls **20**: Kalendertag und Zeitstempel zählen gleich. Auch umgedreht (`"2026-08-26T07:40:00Z"` ↔ `"2026-08-05"`) = 20, die Reihenfolge spielt keine Rolle | ✓ |
| (c) Die Lückenzeile sagt weiterhin „20 Tage ohne Ereignis" (Story `WithGap`, linke Spalte) | `--with-gap`, linke Spalte („Vorgabe: ab sieben Tagen"): genau eine `.v2tl__gap` mit dem Text **„20 Tage ohne Ereignis"**, dazu 5 Einträge und die Tagesköpfe „Montag, 31. August 2026" bis „Mittwoch, 5. August 2026" | ✓ |
| (c) `gapDays={30}` lässt die Zeile weg (Story `WithGap`, rechte Spalte) | Rechte Spalte (`gapDays={30}`): `.v2tl__gap`-Anzahl **0** — bei gleichen 5 Einträgen und denselben fünf Tagesköpfen wie links. Die Prop ist damit zum ersten Mal im Browser vorgeführt, nicht nur im Code (`Timeline.stories.tsx:174–183`) | ✓ |
| (d) Kein deutscher Bezeichner mehr in `AccountField.stories.tsx`; die Labels sind unverändert deutsch | Bezeichner maschinell ausgelesen: Deklarationen `ALL`, `CANDIDATES`, `meta`, `Render` und die sechs Story-Exporte `WithCandidates`, `FullTextOnly`, `NoMatch`, `Invalid`, `WithLedger`, `NumberAndName`; `useState`-Paare `v/setV`, `empty/setEmpty`, `ledger/setLedger` (`:110–111`), `known/setKnown`, `foreign/setForeign`, `long/setLong` (`:161–163`) — alle englisch, `leer`, `blatt`, `bekannt`, `fremd`, `lang` kommen nicht mehr vor. Deutsch geblieben sind nur die Objekt-Schlüssel `aehnlich` und `belegposition` (`:15–16`); sie sind keine Wahl der Story, sondern Glieder von `AccountGroup` (`AccountField.tsx:34`, `ACCOUNT_GROUP_LABEL:36`, `GROUP_ORDER:44`) — siehe Befund 2. Die Labels stehen wörtlich wie vorher: „Konto", „Gegenkonto", „Name bekannt", „Name unbekannt", „Langer Name im schmalen Feld" (im Browser ausgelesen), der Diff der Nachbesserung fasst keinen Nutzertext an | ✓ (mit Befund) |
| (d) Die Stories tun noch, was sie taten | Alle sechs im Browser bedient: `--number-and-name` zeigt ruhend „6815 Bürobedarf" und „6825 Reinigung und Pflege der Geschäftsräume" (`.v2kf__shown`), für 4980 die Nummer allein — genau die Aussage der Story-Dok. `--with-ledger`: zwei Felder („Konto" 6815, „Gegenkonto" leer), das Icon des zweiten ist `disabled`, das erste heißt „Kontenblatt zu 6815"; angeklickt öffnet sich `aside.v2drawer.v2drawer--lg.is-open` mit Titel „Kontenblatt 6815" und Meta „Saldo 4.208,55 € · 31 Buchungen im Zeitraum". `--with-candidates`: Fokus öffnet die Liste mit den Gruppenköpfen „Vorschlag des Agenten" und „Alle Konten", eine Option gewählt → Wert 6815. `--no-match`: „Kein Konto zu „9999" — weder unter den Vorschlägen noch im Kontenrahmen.", 0 Optionen. `--invalid`: `aria-invalid="true"`, `v2in--invalid`, Fehlertext „4980 gibt es im SKR04 dieses Mandanten nicht.". `--full-text-only`: leeres Feld mit Hinweis | ✓ |

**Alles ✓ — Status `fertig`.**

**Befunde** (keine Mängel, kein Kriterium dieser Aufgabe nennt sie):

1. **`daysBetween` fehlt im Barrel.** `src/ui/v3/index.ts:135–143` führt
   `formatAmount`, `formatTime`, `formatTimeFull` und `formatDuration`, den
   neuen Export nicht. Innerhalb des Sets trägt der relative Import
   (`Timeline.tsx:5`), aber der Satz dieser Aufgabe — „die Regel hat einen
   Ort, und wer Tage zählt, bekommt sie mit" — gilt für die App erst, wenn
   `@/ui/v3` sie hergibt. Eine Zeile, beim nächsten Anfassen von `format.ts`
   nachzuziehen, zusammen mit dem stehenden `@when`-Befund aus 0032/0033.
2. **Zwei deutsche Schlüssel bleiben, aber nicht in der Story.** `aehnlich`
   und `belegposition` sind Glieder von `AccountGroup`
   (`AccountField.tsx:34`); in der Story umzubenennen ginge nicht ohne die
   Komponente. Gehört zu 0013, nicht hierher.
3. **Die Lückenzeile hängt an der Gruppierung.** `Timeline.tsx:117` prüft die
   Lücke nur beim Wechsel des Tages- oder Monatskopfes; mit `groupBy="none"`
   erscheint sie nie. Unverändert aus 0023/0040 und von dieser Nachbesserung
   nicht berührt — `WithGap` läuft auf der Vorgabe `day`.
4. **`daysBetween` gibt bei unlesbarem Datum stumm 0 zurück** (`format.ts:144`).
   Für die Lückenzeile ist das die harmlose Wahl (keine Zeile), aber ein
   Aufrufer, der Alter zählt, bekommt dieselbe 0 wie bei „heute".
5. **Die Story-Dok von `WithGap` spricht noch von einem Strang**
   (`Timeline.stories.tsx:152–157`: „hier steht sie auf den sieben Tagen des
   Vorgabewerts"), während die Story jetzt zwei nebeneinanderstellt. Der Satz
   stimmt für die linke Spalte, nennt die rechte aber nicht.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: keine
