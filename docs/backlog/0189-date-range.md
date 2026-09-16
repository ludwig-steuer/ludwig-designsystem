# 0189 · DateRange — ein Zeitraum zum Lesen, plus Story-Matrix für Time

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` (Familie `Time`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, „von–bis" ist fachfrei |
| Quelle | Owner 2026-09-16: „haben wir Module für Datum, Dauer, Timerange, Daterange? Sollten auch Stories haben in jeglicher Kombination, time ago auch" |
| Ersetzt | im Set `payment-account-columns.tsx:188` (zwei `Time` mit `–`); in `ludwig/app` sieben Handgriffe in vier Schreibweisen: `StapelTab.tsx:90` (zwei `Time` mit `–`), `banks/page.tsx:169` (`fmtDay – fmtDay`), `banks/[accountId]/page.tsx:45` (rohes ISO mit `–`), `ImportResultSummary.tsx:52` (rohes ISO mit „bis"), `Step9.tsx:120` (rohes ISO), `ExportBatchDetailSection.tsx:65` (`fmtDate – fmtDate`), `admin/…/clients/[clientId]/page.tsx:639` (Spalte) |
| Blockiert | nichts |
| Spec von / am | Claude (designsystem-worker), 2026-09-16 |

## Ziel

„Welchen Zeitraum deckt der Stapel, der Auszug, das Konto?" beantwortet
Ludwig heute an acht Stellen von Hand — mal `01.03.2026 – 31.03.2026`, mal
`2026-03-01 bis 2026-03-31`, mal roh aus der Datenbank. Kein Handgriff faltet
den gemeinsamen Teil (`01.–31.03.2026`), keiner zeigt zwei Uhrzeiten an einem
Tag als einen Tag (`26.08.2026, 09:12–17:30`). Die Sachbearbeiterin liest an
jeder Stelle eine andere Schreibweise desselben Dings.

Zweiter Teil des Auftrags: `Time` (0033) hat je Achse eine Story, aber keine
Übersicht aller Kombinationen, und `relative`/`age` sind nur mit **einem**
Abstand (drei Tage) belegt — genau dort, wo beide gleich aussehen (Anmerkung 3
der Abnahme 0033).

## Einordnung

- **Wiederverwenden:** `Time` (0033) sagt einen Zeitpunkt, `Duration` eine
  Spanne in Sekunden, `DateRangeField` (0024) lässt einen Zeitraum **wählen**.
  Kein `@when` deckt einen Zeitraum zum **Lesen**; `Time.tsx` verweist dafür
  ausdrücklich auf `DateRangeField`, was ein Eingabefeld ist.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort, acht
  Verwendungen heute, und die Faltung (`01.–31.03.2026`, gleicher Tag mit zwei
  Uhrzeiten) ist an der Aufrufstelle nicht in 15 Zeilen zu haben.
- **Zuschnitt:** Familie in `Time.tsx` — `Time` (Punkt), `Duration` (Sekunden),
  `DateRange` (von–bis). Gleiches Markup-Vokabular (`v2time`, `v2time--sm`),
  gleiche `Intl`-Instanzen in `format.ts`. Kein eigener Dateiname: ein Zeitraum
  ohne den Zeitpunkt ergibt keinen Sinn.
- **Setzt auf:** `Intl.DateTimeFormat.formatRange` — Stdlib faltet den
  gemeinsamen Teil nach Locale-Regeln, dieselben Instanzen wie `formatTime`.
  Kein eigenes Falten.

## Schnittstelle

`DateRange`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `from` | `IsoDate \| IsoDateTime \| Date \| null` | ja | Anfang | `Ranges` |
| `to` | `IsoDate \| IsoDateTime \| Date \| null` | ja | Ende, einschließlich | `Ranges` |
| `format` | `"date" \| "dateTime" \| "month"` | nein | Default `date`. Kein `time`, `relative`, `age`: eine Spanne ist nie „vor 3 Tagen" | `Ranges` |
| `length` | `"short" \| "medium" \| "long"` | nein | wie bei `Time` | `Ranges` |
| `size` | `"sm" \| "md"` | nein | wie bei `Time` | `Ranges`, `InUse` |

`format.ts` liefert `formatTimeRange(from, to, format, length)` — dieselben
Regeln ohne React.

Typen aus `src/ludwig/shared/dates.ts` (`IsoDate`, `IsoDateTime`). Keine
GLOSSARY-Begriffe — „Zeitraum" ist kein Fachwort.

**Kann bewusst nicht:** offene Enden beschriften („seit", „ab", „bis") — ein
Ende allein wird als `Time` gezeigt, das Wort setzt der Aufrufer mit `Time
prefix`; rechnen (Tage dazwischen → `daysBetween`); Zeitzonen wählen (R3);
zwei `<time>`-Elemente liefern (siehe Ausbau).

## Verhalten

- **Faltung durch die Locale**, nicht durch uns: `01.–31.03.2026` ·
  `28.12.2026 – 04.01.2027` · `März–Mai 2026` · `26.08.2026, 09:12–17:30` ·
  `Sonntag, 1. – Dienstag, 31. März 2026` (`date` + `long`).
- **Gleicher Tag** bei `date` → ein Datum, kein Strich (`01.03.2026`).
- **Ein Ende `null`** → das andere allein, wie `Time`. **Beide `null`** → der
  Gedankenstrich in `v2muted`.
- **Verkehrte Reihenfolge** (`from` nach `to`) wird getauscht, nicht
  gemeldet — ein Zeitraum hat keine Richtung.
- **Unlesbarer Wert** → Gedankenstrich, wie `Time`. (`formatRange` würde
  werfen.)
- **„Uhr"**: ICU hängt es an eine gefaltete Uhrzeit-Spanne (`09:12–17:30 Uhr`)
  und an nichts sonst; es wird gestrichen, damit die Spanne liest wie ihre
  Punkte (`Time` schreibt nie „Uhr").
- `title` trägt beide Enden in der vollen Form (`formatTimeFull`), wie bei
  `Time` — nur wenn beide da sind.
- Gerendert wird **ein** `<span class="v2time">`, wie `Duration`: eine
  gefaltete Spanne lässt sich nicht in zwei `<time>` schneiden, ohne
  `formatRangeToParts` — siehe Ausbau. Server-Component.

`Time` bekommt keine neue Prop. Sein `@instead` zeigt künftig auf `DateRange`.

## Stories

Alle in `Time.stories.tsx`, Titel `v3/Primitives/Werte/Time`. Bestand 0033:
sieben Stories. Neu nach §6: 1 Enum-Story für `DateRange.format` samt Rändern
(`Ranges`, 1 Zustand gefüllt + leer darin) + 2 auf Owner-Wunsch = **10** —
Obergrenze erreicht, nicht überschritten.

| Story | Beweist |
|---|---|
| `Ranges` | `DateRange` in allen drei Formaten mit den Faltungen von oben: Monat, Jahreswechsel, gleicher Tag (`date` und `dateTime`), `long`, Monatsspanne; dazu die Ränder: ein Ende `null`, beide `null`, verkehrte Reihenfolge, `sm` |
| `Relative` | `relative` und `age` nebeneinander an **sieben** Abständen: 5 Minuten, 3 Stunden, gestern, 3 Tage, 13 Tage (der Median offener Klärungen), 40 Tage, morgen — zeigt, wo `relative` aufs Datum kippt und `age` nicht |
| `Matrix` | jede Kombination `format` × `length` × `size` von `Time` in einer Tabelle (Owner 2026-09-16: „in jeglicher Kombination"). Ergänzt die Achsen-Stories aus 0033, ersetzt sie nicht; §6 „keine Kombinatorik" ist damit für diesen Baustein auf Owner-Wunsch ausgesetzt |

`InUse` (0033) bleibt; der Einsatz von `DateRange` steht in
`PaymentAccountList`/`PaymentAccountSettingsList` (Spalte „Zeitraum"), deren
Stories ihn zeigen.

Nicht anwendbar: `LeerNachFilter`, `Laedt`, `Fehler` — wie 0033.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Zwei `<time dateTime>` im Markup statt einem `<span>` | keine Prop — Umbau auf `formatRangeToParts` | ein Screenreader-Test oder ein Parser fragt nach maschinenlesbaren Enden |
| Offene Enden mit Wort („seit 01.03.2026") | `open?: "since" \| "until"` | ein zweiter Screen braucht es; heute reicht `Time prefix` |

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

- [ ] `01.03.2026`–`31.03.2026` rendert `01.–31.03.2026`; `28.12.2026`–`04.01.2027` rendert `28.12.2026 – 04.01.2027` (Story `Ranges`)
- [ ] gleicher Tag: `date` → ein Datum ohne Strich; `dateTime` → `26.08.2026, 09:12–17:30`, **ohne** „Uhr" (Story `Ranges`)
- [ ] `format="month"` → `März–Mai 2026`; `length="long"` → `Sonntag, 1. – Dienstag, 31. März 2026` (Story `Ranges`)
- [ ] ein Ende `null` → das andere allein; beide `null` → `—` in `v2muted`; verkehrte Reihenfolge → getauscht; unlesbar → `—`, kein Fehler in der Konsole (Story `Ranges`)
- [ ] `title` = beide Enden in `formatTimeFull` (DOM-Probe in `Ranges`)
- [ ] `formatTimeRange` ohne React aufrufbar (`npx tsx -e`)
- [ ] `Relative`: 13 Tage zeigt `relative` das Datum und `age` „vor 13 Tagen"; morgen zeigt beide „morgen"
- [ ] `Matrix`: 6 Formate × 3 Längen × 2 Größen, jede Zelle gefüllt; `length` wirkt nur bei `date` (`long`) und `dateTime`
- [ ] ersetzt die beiden `Time` in `payment-account-columns.tsx` ohne Funktionsverlust (Story `PaymentAccountList`)
- [ ] `Time.tsx` `@instead` nennt `DateRange` für die Spanne zum Lesen
- [ ] Befund für die App eingetragen: die sieben Handgriffe (Tabelle oben) → `DateRange`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
